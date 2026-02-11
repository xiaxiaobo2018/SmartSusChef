"""Cross-validation fold generation and Optuna hyperparameter optimization."""

from __future__ import annotations

from types import ModuleType
from typing import TYPE_CHECKING, Any, Optional

if TYPE_CHECKING:
    import optuna as _optuna_type

import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error

from app.utils.logging_config import setup_logger
from core.data_prep import sanitize_sparse_data
from core.feature_eng import _build_residual_features

logger = setup_logger(__name__)

# Import optional dependencies
optuna: Optional[ModuleType] = None
try:
    import optuna as _optuna

    optuna = _optuna
except ImportError:
    pass
lgb: Optional[ModuleType] = None
try:
    import lightgbm as _lgb

    lgb = _lgb
except ImportError:
    pass

CatBoostRegressor: Optional[type[Any]] = None
try:
    from catboost import CatBoostRegressor as _CatBoostRegressor

    CatBoostRegressor = _CatBoostRegressor
except ImportError:
    pass

XGBRegressor: Optional[type[Any]] = None
try:
    from xgboost import XGBRegressor as _XGBRegressor

    XGBRegressor = _XGBRegressor
except ImportError:
    pass


# ---------------------------------------------------------------------------
# CV Fold Generation
# ---------------------------------------------------------------------------
def _generate_cv_folds(df: pd.DataFrame, config):
    """
    Expanding-window time-series CV fold generator.
    Yields (train_df, test_df) tuples.
    """
    dates = df["date"].sort_values()
    end_date = dates.max()

    for fold_i in range(config.n_cv_folds, 0, -1):
        test_end = end_date - pd.Timedelta(days=config.test_window_days * (fold_i - 1))
        test_start = test_end - pd.Timedelta(days=config.test_window_days)

        train = df[df["date"] < test_start].copy()
        test = df[(df["date"] >= test_start) & (df["date"] < test_end)].copy()

        train_span = (train["date"].max() - train["date"].min()).days if len(train) > 1 else 0
        if train_span < config.min_train_days or len(test) < 1:
            continue

        yield train, test


def _prepare_cv_fold_cache(
    df_feat: pd.DataFrame,
    country_code: str,
    config,
) -> list[dict[str, Any]]:
    """
    Pre-compute Prophet + residual training matrices once per fold.

    IMPORTANT: Sanitation (interpolation) is applied per-fold to prevent data leakage.
    """
    from app.utils.logging_config import silence_noisy_loggers
    from core.model_train import _fit_prophet, _prophet_predict

    silence_noisy_loggers()
    feature_cols = config.hybrid_tree_features
    fold_cache: list[dict[str, Any]] = []

    for raw_train, raw_test in _generate_cv_folds(df_feat, config):
        train = sanitize_sparse_data(raw_train.copy(), country_code, config)
        test = sanitize_sparse_data(raw_test.copy(), country_code, config)

        if len(train) < config.min_train_days or len(test) < 1:
            continue

        pm = _fit_prophet(train, country_code, config)
        p_train = _prophet_predict(pm, train)
        p_test = _prophet_predict(pm, test)

        train_r = _build_residual_features(train, p_train)
        test_r = _build_residual_features(test, p_test)

        X_train = train_r[feature_cols].dropna()
        X_test = test_r[feature_cols].dropna()
        if X_train.empty or X_test.empty:
            continue

        fold_cache.append(
            {
                "X_train": X_train,
                "y_train": train_r.loc[X_train.index, "resid"],
                "X_test": X_test,
                "y_test": test_r.loc[X_test.index, "resid"],
                "prophet_test": test_r.loc[X_test.index, "prophet_yhat"].to_numpy(),
                "sales_test": test_r.loc[X_test.index, "sales"].to_numpy(),
            }
        )

    return fold_cache


# ---------------------------------------------------------------------------
# Hybrid Model Evaluation
# ---------------------------------------------------------------------------
def _eval_hybrid_mae(
    model_type: str,
    fold_cache: list[dict[str, Any]],
    trial_params: dict[str, Any],
    config,
) -> float:
    """Given a model type and parameters, run CV and return average MAE."""
    from core.model_train import get_gpu_flags

    fold_maes = []
    tree_n_jobs = 1 if config.max_workers > 1 else -1
    gpu = get_gpu_flags() if config.use_gpu else {}

    for fold in fold_cache:
        X_train = fold["X_train"]
        y_train = fold["y_train"]
        X_test = fold["X_test"]
        prophet_test = fold["prophet_test"]
        sales_test = fold["sales_test"]

        if model_type == "xgboost":
            if XGBRegressor is None:
                raise ImportError("XGBoost is required but not installed.")
            xgb_extra = {"tree_method": "hist", "device": "cuda"} if gpu.get("xgboost") else {}
            model = XGBRegressor(
                n_estimators=100,
                random_state=config.random_seed,
                n_jobs=tree_n_jobs,
                **xgb_extra,
                **trial_params,
            )
            model.fit(X_train, y_train, verbose=False)
        elif model_type == "catboost":
            if CatBoostRegressor is None:
                raise ImportError("CatBoost is required but not installed.")
            cb_extra = {"task_type": "GPU"} if gpu.get("catboost") else {}
            model = CatBoostRegressor(
                iterations=100,
                random_seed=config.random_seed,
                verbose=False,
                **cb_extra,
                **trial_params,
            )
            model.fit(X_train, y_train, verbose=False)
        elif model_type == "lightgbm":
            if lgb is None:
                raise ImportError("LightGBM is required but not installed.")
            lgb_extra: dict[str, Any] = {"device": "gpu"} if gpu.get("lightgbm") else {}
            model = lgb.LGBMRegressor(
                n_estimators=100,
                random_state=config.random_seed,
                n_jobs=tree_n_jobs,
                verbose=-1,
                **lgb_extra,
                **trial_params,
            )
            model.fit(X_train, y_train)
        else:
            raise ValueError(f"Unknown model type: {model_type}")

        resid_pred = model.predict(X_test)
        yhat = np.maximum(prophet_test + resid_pred, 0.0)
        fold_maes.append(mean_absolute_error(sales_test, yhat))

    if not fold_maes:
        return float("inf")
    return float(np.mean(fold_maes))


# ---------------------------------------------------------------------------
# Optuna Optimization
# ---------------------------------------------------------------------------
def _optimize_hybrid(
    model_type: str, fold_cache: list[dict[str, Any]], config
) -> tuple[float, dict[str, Any]]:
    """Optuna optimization for hybrid residual stacking per model type."""

    def objective(trial: _optuna_type.Trial) -> float:
        if model_type == "xgboost":
            params = {
                "max_depth": trial.suggest_int("max_depth", 3, 10),
                "learning_rate": trial.suggest_float("learning_rate", 0.01, 0.3, log=True),
                "subsample": trial.suggest_float("subsample", 0.6, 1.0),
                "reg_alpha": trial.suggest_float("reg_alpha", 0.0, 10.0),
                "reg_lambda": trial.suggest_float("reg_lambda", 0.0, 10.0),
            }
        elif model_type == "catboost":
            params = {
                "depth": trial.suggest_int("depth", 3, 10),
                "learning_rate": trial.suggest_float("learning_rate", 0.01, 0.3, log=True),
                "l2_leaf_reg": trial.suggest_float("l2_leaf_reg", 1.0, 10.0),
                "subsample": trial.suggest_float("subsample", 0.6, 1.0),
            }
        elif model_type == "lightgbm":
            params = {
                "num_leaves": trial.suggest_int("num_leaves", 20, 150),
                "learning_rate": trial.suggest_float("learning_rate", 0.01, 0.3, log=True),
                "reg_alpha": trial.suggest_float("reg_alpha", 0.0, 10.0),
                "reg_lambda": trial.suggest_float("reg_lambda", 0.0, 10.0),
            }
        else:
            raise ValueError(f"Unknown model type: {model_type}")

        return _eval_hybrid_mae(model_type, fold_cache, params, config)

    if optuna is None:
        raise ImportError("Optuna is required but not installed.")
    study = optuna.create_study(
        direction="minimize",
        sampler=optuna.samplers.TPESampler(seed=config.random_seed),
    )
    study.optimize(objective, n_trials=config.n_optuna_trials)
    return float(study.best_value), study.best_params
