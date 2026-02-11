"""Prophet + tree model training, persistence, and the main process_dish worker."""

import os
from dataclasses import dataclass, field
from types import ModuleType
from typing import Any

import numpy as np
import pandas as pd

from app.utils import safe_filename
from app.utils.logging_config import setup_logger, silence_noisy_loggers
from app.utils.secure_io import secure_dump, secure_load

logger = setup_logger(__name__)

# Import tree frameworks (optional dependencies)
lgb: ModuleType | None = None
try:
    import lightgbm as _lgb

    lgb = _lgb
except ImportError:
    pass

CatBoostRegressor: type[Any] | None = None
try:
    from catboost import CatBoostRegressor as _CatBoostRegressor

    CatBoostRegressor = _CatBoostRegressor
except ImportError:
    pass

XGBRegressor: type[Any] | None = None
try:
    from xgboost import XGBRegressor as _XGBRegressor

    XGBRegressor = _XGBRegressor
except ImportError:
    pass

Prophet: type[Any] | None = None
try:
    from prophet import Prophet as _Prophet

    Prophet = _Prophet
except ImportError:
    pass

WEATHER_COLS = [
    "temperature_2m_max",
    "temperature_2m_min",
    "relative_humidity_2m_mean",
    "precipitation_sum",
]


# ---------------------------------------------------------------------------
# GPU Detection
# ---------------------------------------------------------------------------
def _detect_gpu() -> dict[str, bool]:
    """Auto-detect available GPU support for each tree framework."""
    gpu = {"xgboost": False, "catboost": False, "lightgbm": False}

    try:
        import xgboost as _xgb

        _test = _xgb.XGBRegressor(tree_method="hist", device="cuda", n_estimators=1)
        _test.fit(np.array([[0]]), np.array([0]))
        gpu["xgboost"] = True
    except Exception:
        pass

    try:
        from catboost import CatBoostRegressor as _CB

        _test = _CB(iterations=1, task_type="GPU", verbose=False)
        _test.fit(np.array([[0]]), np.array([0]))
        gpu["catboost"] = True
    except Exception:
        pass

    try:
        import lightgbm as _lgb

        _test = _lgb.LGBMRegressor(n_estimators=1, device="gpu", verbose=-1)
        _test.fit(np.array([[0]]), np.array([0]))
        gpu["lightgbm"] = True
    except Exception:
        pass

    return gpu


_GPU_AVAILABLE: dict[str, bool] | None = None


def get_gpu_flags() -> dict[str, bool]:
    """Return cached GPU detection results (runs once per process)."""
    global _GPU_AVAILABLE
    if _GPU_AVAILABLE is None:
        _GPU_AVAILABLE = _detect_gpu()
        for fw, ok in _GPU_AVAILABLE.items():
            logger.info("GPU %s for %s", "enabled" if ok else "not available", fw)
    return _GPU_AVAILABLE


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
@dataclass
class PipelineConfig:
    n_cv_folds: int = 3
    test_window_days: int = 30
    min_train_days: int = 60
    min_ml_days: int = 90
    random_seed: int = 42
    holiday_years: list[int] = field(default_factory=lambda: [2024, 2025, 2026])
    forecast_horizon: int = 14
    n_optuna_trials: int = 30
    max_workers: int = 4
    model_dir: str = "models"
    use_gpu: bool = True

    default_fallback_address: str = "Shanghai, China"
    default_fallback_lat: float = 31.23
    default_fallback_lon: float = 121.47
    default_fallback_country: str = "CN"

    prophet_params: dict[str, Any] = field(
        default_factory=lambda: {
            "changepoint_prior_scale": 0.5,
            "daily_seasonality": False,
            "holidays_prior_scale": 10.0,
            "seasonality_mode": "additive",
            "seasonality_prior_scale": 10.0,
            "weekly_seasonality": True,
            "yearly_seasonality": False,
        }
    )

    time_features: list[str] = field(
        default_factory=lambda: ["day_of_week", "month", "day", "dayofyear", "is_weekend"]
    )

    lags: tuple[int, ...] = field(default_factory=lambda: (1, 7, 14))
    roll_windows: tuple[int, ...] = field(default_factory=lambda: (7, 14, 28))

    hybrid_tree_features: list[str] = field(
        default_factory=lambda: [
            "day_of_week",
            "month",
            "day",
            "dayofyear",
            "is_weekend",
            "is_public_holiday",
            "temperature_2m_max",
            "temperature_2m_min",
            "relative_humidity_2m_mean",
            "precipitation_sum",
            "y_lag_1",
            "y_lag_7",
            "y_lag_14",
            "y_roll_mean_7",
            "y_roll_std_7",
            "y_roll_mean_14",
            "y_roll_std_14",
            "y_roll_mean_28",
            "y_roll_std_28",
            "prophet_yhat",
        ]
    )

    feature_groups: dict[str, list[str]] = field(
        default_factory=lambda: {
            "Seasonality": ["day_of_week", "month", "day", "dayofyear", "is_weekend"],
            "Holiday": ["is_public_holiday"],
            "Weather": [
                "temperature_2m_max",
                "temperature_2m_min",
                "relative_humidity_2m_mean",
                "precipitation_sum",
            ],
            "Lags/Trend": [
                "y_lag_1",
                "y_lag_7",
                "y_lag_14",
                "y_roll_mean_7",
                "y_roll_std_7",
                "y_roll_mean_14",
                "y_roll_std_14",
                "y_roll_mean_28",
                "y_roll_std_28",
            ],
            "ProphetTrend": ["prophet_yhat"],
        }
    )


CFG = PipelineConfig()


# ---------------------------------------------------------------------------
# Prophet Model Functions
# ---------------------------------------------------------------------------
def _fit_prophet(train_df: pd.DataFrame, country_code: str, config: PipelineConfig) -> Any:
    """Fit a Prophet model on training data."""
    if Prophet is None:
        raise ImportError("Prophet is required but not installed. Please install prophet.")

    m = Prophet(**config.prophet_params)
    try:
        m.add_country_holidays(country_name=country_code)
    except Exception:
        pass

    for col in WEATHER_COLS:
        if col in train_df.columns:
            m.add_regressor(col)

    fit_df = train_df.rename(columns={"date": "ds", "sales": "y"})
    cols_to_use = ["ds", "y"] + [c for c in WEATHER_COLS if c in fit_df.columns]
    m.fit(fit_df[cols_to_use])
    return m


def _prophet_predict(model: Any, df: pd.DataFrame) -> np.ndarray:
    """Generate predictions from a fitted Prophet model."""
    pred_df = df.rename(columns={"date": "ds"})
    cols_to_use = ["ds"] + [c for c in WEATHER_COLS if c in pred_df.columns]
    yhat = model.predict(pred_df[cols_to_use])
    return yhat["yhat"].astype(float).to_numpy()


# ---------------------------------------------------------------------------
# Model Persistence
# ---------------------------------------------------------------------------
def _save_hybrid_models(
    store_id: int | None,
    dish: str,
    prophet_model: Any,
    tree_model: Any,
    champion: str,
    config: PipelineConfig,
) -> None:
    """Save both Prophet and tree models for a dish.

    Parameters
    ----------
    store_id : int | None
        When provided, models are saved under
        ``<config.model_dir>/store_<store_id>/``.
        When *None*, models are saved directly under ``config.model_dir``
        (backward-compatible behavior for non-store usage).
    """
    safe_name = safe_filename(dish)
    if store_id is not None:
        model_dir = os.path.join(config.model_dir, f"store_{store_id}")
    else:
        model_dir = config.model_dir
    os.makedirs(model_dir, exist_ok=True)

    secure_dump(prophet_model, f"{model_dir}/prophet_{safe_name}.pkl")
    secure_dump(tree_model, f"{model_dir}/{champion}_{safe_name}.pkl")


def _load_hybrid_models(
    store_id: int | None,
    dish: str,
    champion: str,
    config: PipelineConfig,
) -> tuple[Any, Any]:
    """Load both Prophet and tree models for a dish.

    Parameters
    ----------
    store_id : int | None
        When provided, models are loaded from
        ``<config.model_dir>/store_<store_id>/``.
        When *None*, loads from ``config.model_dir`` directly.
    """
    safe_name = safe_filename(dish)
    if store_id is not None:
        model_dir = os.path.join(config.model_dir, f"store_{store_id}")
    else:
        model_dir = config.model_dir

    prophet_model = secure_load(f"{model_dir}/prophet_{safe_name}.pkl")
    tree_model = secure_load(f"{model_dir}/{champion}_{safe_name}.pkl")
    return prophet_model, tree_model


# ---------------------------------------------------------------------------
# Per-Dish Processing (Hybrid Prophet + Tree)
# ---------------------------------------------------------------------------
def process_dish(
    dish_name: str,
    shared_df: pd.DataFrame,
    country_code: str,
    config: PipelineConfig,
    store_id: int | None = None,
) -> dict[str, Any]:
    """
    Process a single dish using Prophet + Tree Residual Stacking.

    This function is standalone (no closures) so it can be pickled by ProcessPoolExecutor.

    Parameters
    ----------
    store_id : int | None
        When provided, included in log/error messages for multi-tenant debugging.
    """
    from core.cv_eval import _optimize_hybrid, _prepare_cv_fold_cache
    from core.data_prep import sanitize_sparse_data
    from core.feature_eng import _build_residual_features, add_hybrid_features

    silence_noisy_loggers()
    safe_name = safe_filename(dish_name)
    if store_id is not None:
        _model_dir = os.path.join(config.model_dir, f"store_{store_id}")
    else:
        _model_dir = config.model_dir
    os.makedirs(_model_dir, exist_ok=True)

    prefix = f"Store {store_id}, " if store_id is not None else ""

    dish_data = shared_df[shared_df["dish"] == dish_name].copy()

    if len(dish_data) == 0:
        raise RuntimeError(f"{prefix}{dish_name}: No data found for this dish.")

    if len(dish_data) < config.min_train_days:
        raise RuntimeError(
            f"{prefix}{dish_name}: Insufficient data for training. "
            f"Only {len(dish_data)} days available, but at least "
            f"{config.min_train_days} days of sales history required."
        )

    dish_feat = add_hybrid_features(dish_data.copy(), config)

    if len(dish_feat) < config.min_train_days:
        raise RuntimeError(
            f"{prefix}{dish_name}: Insufficient data after feature engineering ({len(dish_feat)} rows)."
        )

    fold_cache = _prepare_cv_fold_cache(dish_feat, country_code, config)
    if not fold_cache:
        raise RuntimeError(f"{prefix}{dish_name}: CV folds unavailable after feature processing.")

    mae_map: dict[str, float] = {}
    params_map: dict[str, dict[str, Any]] = {}

    for model_type in ["xgboost", "catboost", "lightgbm"]:
        best_mae, best_params = _optimize_hybrid(model_type, fold_cache, config)
        mae_map[model_type] = round(best_mae, 4)
        params_map[model_type] = best_params

    champion = min(mae_map.items(), key=lambda item: item[1])[0]

    dish_feat_sanitized = sanitize_sparse_data(dish_feat.copy(), country_code, config)

    pm = _fit_prophet(dish_feat_sanitized, country_code, config)
    p_full = _prophet_predict(pm, dish_feat_sanitized)
    train_r = _build_residual_features(dish_feat_sanitized, p_full)

    X_full = train_r[config.hybrid_tree_features].dropna()
    y_full = train_r.loc[X_full.index, "resid"]

    if len(X_full) == 0:
        raise RuntimeError(
            f"{prefix}{dish_name}: No valid training data after feature/residual processing."
        )

    tree_n_jobs = 1 if config.max_workers > 1 else -1
    gpu = get_gpu_flags() if config.use_gpu else {}

    if champion == "xgboost":
        if XGBRegressor is None:
            raise ImportError("XGBoost is required but not installed.")
        xgb_extra = {"tree_method": "hist", "device": "cuda"} if gpu.get("xgboost") else {}
        model = XGBRegressor(
            n_estimators=100,
            random_state=config.random_seed,
            n_jobs=tree_n_jobs,
            **xgb_extra,
            **params_map[champion],
        )
        model.fit(X_full, y_full, verbose=False)
    elif champion == "catboost":
        if CatBoostRegressor is None:
            raise ImportError("CatBoost is required but not installed.")
        cb_extra = {"task_type": "GPU"} if gpu.get("catboost") else {}
        model = CatBoostRegressor(
            iterations=100,
            random_seed=config.random_seed,
            verbose=False,
            **cb_extra,
            **params_map[champion],
        )
        model.fit(X_full, y_full, verbose=False)
    else:  # lightgbm
        if lgb is None:
            raise ImportError("LightGBM is required but not installed.")
        lgb_extra: dict[str, Any] = {"device": "gpu"} if gpu.get("lightgbm") else {}
        model = lgb.LGBMRegressor(
            n_estimators=100,
            random_state=config.random_seed,
            n_jobs=tree_n_jobs,
            verbose=-1,
            **lgb_extra,
            **params_map[champion],
        )
        model.fit(X_full, y_full)

    _save_hybrid_models(store_id, dish_name, pm, model, champion, config)

    recent_sales = dish_feat_sanitized[["date", "sales"]].tail(28).copy()
    secure_dump(recent_sales, f"{_model_dir}/recent_sales_{safe_name}.pkl")

    return {
        "dish": dish_name,
        "champion": champion,
        "mae": mae_map,
        "best_params": params_map,
        "champion_mae": mae_map[champion],
        "model_type": "hybrid",
    }
