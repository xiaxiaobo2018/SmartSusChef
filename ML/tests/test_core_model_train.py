"""Unit tests for core.model_train -- PipelineConfig, Prophet wrappers, persistence, process_dish."""

import os
import sys
from types import SimpleNamespace

import numpy as np
import pandas as pd
import pytest

# Ensure ML root is on sys.path so `core.*` imports resolve.
ML_ROOT = os.path.dirname(os.path.dirname(__file__))
if ML_ROOT not in sys.path:
    sys.path.insert(0, ML_ROOT)

from core.model_train import (
    PipelineConfig,
    _fit_prophet,
    _load_hybrid_models,
    _prophet_predict,
    _save_hybrid_models,
    process_dish,
)


# ---------------------------------------------------------------------------
# Dummy Prophet
# ---------------------------------------------------------------------------
class DummyProphet:
    """Lightweight stand-in for the real Prophet class."""

    def __init__(self, **kwargs):
        self.kwargs = kwargs
        self.regressors: list[str] = []
        self.holidays_country: str | None = None

    def add_country_holidays(self, country_name: str):
        self.holidays_country = country_name

    def add_regressor(self, col: str):
        self.regressors.append(col)

    def fit(self, df: pd.DataFrame):
        self._fitted_len = len(df)

    def predict(self, df: pd.DataFrame) -> pd.DataFrame:
        return pd.DataFrame({"yhat": np.ones(len(df))})


class DummyTreeModel:
    """Generic dummy tree model."""

    def __init__(self, **kwargs):
        self.params = kwargs

    def fit(self, X, y, **kwargs):
        return self

    def predict(self, X):
        return np.zeros(len(X))


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _make_daily_df(n_days: int, dish: str = "TestDish", start: str = "2024-01-01") -> pd.DataFrame:
    dates = pd.date_range(start, periods=n_days, freq="D")
    rng = np.random.default_rng(42)
    return pd.DataFrame(
        {
            "date": dates,
            "sales": rng.uniform(1, 10, size=n_days),
            "dish": [dish] * n_days,
            "temperature_2m_max": rng.uniform(20, 35, size=n_days),
            "temperature_2m_min": rng.uniform(10, 20, size=n_days),
            "relative_humidity_2m_mean": rng.uniform(40, 80, size=n_days),
            "precipitation_sum": rng.uniform(0, 5, size=n_days),
        }
    )


# ===================================================================
# PipelineConfig
# ===================================================================
class TestPipelineConfig:
    """Verify dataclass defaults and custom overrides."""

    def test_default_values(self):
        cfg = PipelineConfig()
        assert cfg.n_cv_folds == 3
        assert cfg.test_window_days == 30
        assert cfg.min_train_days == 60
        assert cfg.min_ml_days == 90
        assert cfg.random_seed == 42
        assert cfg.forecast_horizon == 14
        assert cfg.n_optuna_trials == 30
        assert cfg.max_workers == 4
        assert cfg.model_dir == "models"
        assert cfg.use_gpu is True

    def test_default_fallback_location(self):
        cfg = PipelineConfig()
        assert cfg.default_fallback_country == "CN"
        assert cfg.default_fallback_lat == pytest.approx(31.23)
        assert cfg.default_fallback_lon == pytest.approx(121.47)

    def test_custom_values(self):
        cfg = PipelineConfig(
            n_cv_folds=5,
            test_window_days=14,
            random_seed=99,
            max_workers=1,
            use_gpu=False,
            model_dir="/tmp/my_models",
        )
        assert cfg.n_cv_folds == 5
        assert cfg.test_window_days == 14
        assert cfg.random_seed == 99
        assert cfg.max_workers == 1
        assert cfg.use_gpu is False
        assert cfg.model_dir == "/tmp/my_models"

    def test_prophet_params_defaults(self):
        cfg = PipelineConfig()
        pp = cfg.prophet_params
        assert pp["changepoint_prior_scale"] == 0.5
        assert pp["daily_seasonality"] is False
        assert pp["weekly_seasonality"] is True
        assert pp["yearly_seasonality"] is False

    def test_holiday_years_default(self):
        cfg = PipelineConfig()
        assert cfg.holiday_years == [2024, 2025, 2026]

    def test_hybrid_tree_features_contains_prophet_yhat(self):
        cfg = PipelineConfig()
        assert "prophet_yhat" in cfg.hybrid_tree_features

    def test_lags_and_rolls(self):
        cfg = PipelineConfig()
        assert cfg.lags == (1, 7, 14)
        assert cfg.roll_windows == (7, 14, 28)

    def test_feature_groups_cover_tree_features(self):
        """Every feature in hybrid_tree_features should appear in exactly one feature group."""
        cfg = PipelineConfig()
        grouped = set()
        for feats in cfg.feature_groups.values():
            grouped.update(feats)
        for feat in cfg.hybrid_tree_features:
            assert feat in grouped, f"{feat} missing from feature_groups"


# ===================================================================
# _fit_prophet
# ===================================================================
class TestFitProphet:
    """Tests for the Prophet fitting wrapper."""

    def test_basic_fit(self, monkeypatch):
        import core.model_train as mt

        monkeypatch.setattr(mt, "Prophet", DummyProphet)
        df = _make_daily_df(10)
        cfg = PipelineConfig()
        model = _fit_prophet(df, "US", cfg)
        assert isinstance(model, DummyProphet)
        assert model._fitted_len == 10

    def test_weather_regressors_added(self, monkeypatch):
        """Weather columns present in df should be registered as regressors."""
        import core.model_train as mt

        monkeypatch.setattr(mt, "Prophet", DummyProphet)
        df = _make_daily_df(10)
        model = _fit_prophet(df, "CN", PipelineConfig())
        assert "temperature_2m_max" in model.regressors
        assert "temperature_2m_min" in model.regressors
        assert "relative_humidity_2m_mean" in model.regressors
        assert "precipitation_sum" in model.regressors

    def test_missing_weather_cols_not_added(self, monkeypatch):
        """If a weather column is missing, it should not be added as a regressor."""
        import core.model_train as mt

        monkeypatch.setattr(mt, "Prophet", DummyProphet)
        df = pd.DataFrame(
            {
                "date": pd.date_range("2024-01-01", periods=5, freq="D"),
                "sales": [1.0, 2.0, 3.0, 4.0, 5.0],
            }
        )
        model = _fit_prophet(df, "US", PipelineConfig())
        assert model.regressors == []

    def test_country_holidays_called(self, monkeypatch):
        import core.model_train as mt

        monkeypatch.setattr(mt, "Prophet", DummyProphet)
        df = _make_daily_df(5)
        model = _fit_prophet(df, "GB", PipelineConfig())
        assert model.holidays_country == "GB"

    def test_country_holidays_failure_handled(self, monkeypatch):
        """If add_country_holidays raises, fit should still succeed."""
        import core.model_train as mt

        class FailHolidayProphet(DummyProphet):
            def add_country_holidays(self, country_name):
                raise ValueError("unsupported country")

        monkeypatch.setattr(mt, "Prophet", FailHolidayProphet)
        df = _make_daily_df(5)
        model = _fit_prophet(df, "XX", PipelineConfig())
        assert isinstance(model, FailHolidayProphet)

    def test_prophet_none_raises_import_error(self, monkeypatch):
        """If Prophet is None (not installed), ImportError should be raised."""
        import core.model_train as mt

        monkeypatch.setattr(mt, "Prophet", None)
        df = _make_daily_df(5)
        with pytest.raises(ImportError, match="Prophet is required"):
            _fit_prophet(df, "US", PipelineConfig())


# ===================================================================
# _prophet_predict
# ===================================================================
class TestProphetPredict:
    """Tests for Prophet prediction wrapper."""

    def test_basic_predict(self, monkeypatch):
        import core.model_train as mt

        monkeypatch.setattr(mt, "Prophet", DummyProphet)
        df = _make_daily_df(5)
        model = _fit_prophet(df, "US", PipelineConfig())
        yhat = _prophet_predict(model, df)
        assert isinstance(yhat, np.ndarray)
        assert len(yhat) == 5
        np.testing.assert_array_equal(yhat, np.ones(5))

    def test_predict_respects_dataframe_length(self, monkeypatch):
        import core.model_train as mt

        monkeypatch.setattr(mt, "Prophet", DummyProphet)
        df = _make_daily_df(20)
        model = _fit_prophet(df, "US", PipelineConfig())
        yhat = _prophet_predict(model, df)
        assert len(yhat) == 20

    def test_predict_returns_float_array(self, monkeypatch):
        import core.model_train as mt

        monkeypatch.setattr(mt, "Prophet", DummyProphet)
        df = _make_daily_df(3)
        model = _fit_prophet(df, "US", PipelineConfig())
        yhat = _prophet_predict(model, df)
        assert yhat.dtype == np.float64


# ===================================================================
# _save_hybrid_models / _load_hybrid_models  (round-trip)
# ===================================================================
class TestModelPersistence:
    """Save and load models using tmp_path to avoid side effects."""

    def test_round_trip(self, tmp_path):
        cfg = PipelineConfig(model_dir=str(tmp_path))
        prophet_obj = {"type": "prophet", "value": 42}
        tree_obj = {"type": "xgboost", "value": 99}

        _save_hybrid_models("TestDish", prophet_obj, tree_obj, "xgboost", cfg)
        loaded_p, loaded_t = _load_hybrid_models("TestDish", "xgboost", cfg)

        assert loaded_p == prophet_obj
        assert loaded_t == tree_obj

    def test_round_trip_different_champions(self, tmp_path):
        """Round-trip works for all champion name variants."""
        cfg = PipelineConfig(model_dir=str(tmp_path))
        for champ in ("xgboost", "catboost", "lightgbm"):
            p_obj = {"champion": champ, "p": True}
            t_obj = {"champion": champ, "t": True}
            _save_hybrid_models("Dish", p_obj, t_obj, champ, cfg)
            lp, lt = _load_hybrid_models("Dish", champ, cfg)
            assert lp == p_obj
            assert lt == t_obj

    def test_dish_name_with_spaces(self, tmp_path):
        """Dish names with spaces should be sanitised to underscores."""
        cfg = PipelineConfig(model_dir=str(tmp_path))
        _save_hybrid_models("Kung Pao Chicken", {"p": 1}, {"t": 2}, "xgb", cfg)
        lp, lt = _load_hybrid_models("Kung Pao Chicken", "xgb", cfg)
        assert lp == {"p": 1}
        assert lt == {"t": 2}

    def test_model_dir_created(self, tmp_path):
        """_save_hybrid_models should create the model directory if it does not exist."""
        nested = tmp_path / "sub" / "dir"
        cfg = PipelineConfig(model_dir=str(nested))
        _save_hybrid_models("D", {"p": 1}, {"t": 2}, "xgb", cfg)
        assert nested.exists()

    def test_load_nonexistent_raises(self, tmp_path):
        """Loading a model that was never saved should raise an error."""
        cfg = PipelineConfig(model_dir=str(tmp_path))
        with pytest.raises((FileNotFoundError, OSError)):
            _load_hybrid_models("NeverSaved", "xgb", cfg)

    def test_numpy_array_round_trip(self, tmp_path):
        """Numpy arrays should survive the save/load round-trip."""
        cfg = PipelineConfig(model_dir=str(tmp_path))
        arr = np.array([1.0, 2.0, 3.0])
        _save_hybrid_models("NpDish", arr, arr * 2, "xgb", cfg)
        lp, lt = _load_hybrid_models("NpDish", "xgb", cfg)
        np.testing.assert_array_equal(lp, arr)
        np.testing.assert_array_equal(lt, arr * 2)


# ===================================================================
# process_dish (fully mocked)
# ===================================================================
class TestProcessDish:
    """Integration-style tests with all external dependencies mocked."""

    @pytest.fixture()
    def mocked_env(self, monkeypatch, tmp_path):
        """Patch all heavy dependencies so process_dish runs in isolation."""
        import core.cv_eval as ce
        import core.data_prep as dp
        import core.feature_eng as fe
        import core.model_train as mt

        # Config
        cfg = PipelineConfig(
            min_train_days=1,
            min_ml_days=1,
            max_workers=1,
            use_gpu=False,
            n_optuna_trials=1,
            model_dir=str(tmp_path),
        )
        cfg.hybrid_tree_features = ["prophet_yhat"]

        # Build a small dataset
        df = _make_daily_df(10, dish="A")

        # Patch feature engineering to be a pass-through
        monkeypatch.setattr(fe, "add_hybrid_features", lambda d, c: d)
        monkeypatch.setattr(
            fe,
            "_build_residual_features",
            lambda d, yhat: d.assign(prophet_yhat=yhat, resid=d["sales"] - yhat),
        )

        # Patch data prep
        monkeypatch.setattr(dp, "sanitize_sparse_data", lambda d, cc, config=None: d)

        # Patch CV
        fold_cache = [
            {
                "X_train": pd.DataFrame({"prophet_yhat": [1.0, 2.0, 3.0]}),
                "y_train": pd.Series([0.0, 0.0, 0.0]),
                "X_test": pd.DataFrame({"prophet_yhat": [1.0]}),
                "y_test": pd.Series([0.0]),
                "prophet_test": np.zeros(1),
                "sales_test": np.zeros(1),
            }
        ]
        monkeypatch.setattr(ce, "_prepare_cv_fold_cache", lambda *a, **kw: fold_cache)
        monkeypatch.setattr(ce, "_optimize_hybrid", lambda *a, **kw: (1.0, {}))

        # Patch Prophet
        monkeypatch.setattr(mt, "Prophet", DummyProphet)
        monkeypatch.setattr(mt, "_fit_prophet", lambda train, cc, config: DummyProphet())
        monkeypatch.setattr(mt, "_prophet_predict", lambda model, d: np.zeros(len(d)))

        # Patch tree models
        monkeypatch.setattr(mt, "XGBRegressor", DummyTreeModel)
        monkeypatch.setattr(mt, "CatBoostRegressor", DummyTreeModel)
        monkeypatch.setattr(mt, "lgb", SimpleNamespace(LGBMRegressor=DummyTreeModel))

        return cfg, df

    def test_returns_expected_keys(self, mocked_env):
        cfg, df = mocked_env
        result = process_dish("A", df, "US", cfg)
        expected_keys = {"dish", "champion", "mae", "best_params", "champion_mae", "model_type"}
        assert set(result.keys()) == expected_keys

    def test_champion_is_valid_model_type(self, mocked_env):
        cfg, df = mocked_env
        result = process_dish("A", df, "US", cfg)
        assert result["champion"] in ("xgboost", "catboost", "lightgbm")

    def test_model_type_is_hybrid(self, mocked_env):
        cfg, df = mocked_env
        result = process_dish("A", df, "US", cfg)
        assert result["model_type"] == "hybrid"

    def test_dish_name_returned(self, mocked_env):
        cfg, df = mocked_env
        result = process_dish("A", df, "US", cfg)
        assert result["dish"] == "A"

    def test_mae_contains_all_three_models(self, mocked_env):
        cfg, df = mocked_env
        result = process_dish("A", df, "US", cfg)
        assert set(result["mae"].keys()) == {"xgboost", "catboost", "lightgbm"}

    def test_champion_mae_matches_mae_map(self, mocked_env):
        cfg, df = mocked_env
        result = process_dish("A", df, "US", cfg)
        champ = result["champion"]
        assert result["champion_mae"] == result["mae"][champ]

    def test_no_data_for_dish_raises(self, mocked_env):
        cfg, df = mocked_env
        with pytest.raises(RuntimeError, match="No data found"):
            process_dish("NonExistent", df, "US", cfg)

    def test_insufficient_data_raises(self, monkeypatch, tmp_path):
        """Data shorter than min_train_days should raise RuntimeError."""
        import core.feature_eng as fe

        monkeypatch.setattr(fe, "add_hybrid_features", lambda d, c: d)
        cfg = PipelineConfig(min_train_days=100, model_dir=str(tmp_path))
        df = _make_daily_df(3, dish="Short")
        with pytest.raises(RuntimeError, match="Insufficient raw data"):
            process_dish("Short", df, "US", cfg)

    def test_empty_fold_cache_raises(self, monkeypatch, tmp_path):
        """If _prepare_cv_fold_cache returns [], process_dish should raise."""
        import core.cv_eval as ce
        import core.data_prep as dp
        import core.feature_eng as fe

        monkeypatch.setattr(fe, "add_hybrid_features", lambda d, c: d)
        monkeypatch.setattr(dp, "sanitize_sparse_data", lambda d, cc, config=None: d)
        monkeypatch.setattr(ce, "_prepare_cv_fold_cache", lambda *a, **kw: [])

        cfg = PipelineConfig(min_train_days=1, model_dir=str(tmp_path))
        df = _make_daily_df(5, dish="X")
        with pytest.raises(RuntimeError, match="CV folds unavailable"):
            process_dish("X", df, "US", cfg)

    def test_models_saved_to_disk(self, mocked_env):
        """After a successful run, model files should exist on disk."""
        cfg, df = mocked_env
        result = process_dish("A", df, "US", cfg)
        champ = result["champion"]

        from pathlib import Path

        model_dir = Path(cfg.model_dir)
        prophet_files = list(model_dir.glob("prophet_*.pkl"))
        tree_files = list(model_dir.glob(f"{champ}_*.pkl"))
        recent_files = list(model_dir.glob("recent_sales_*.pkl"))

        assert len(prophet_files) >= 1
        assert len(tree_files) >= 1
        assert len(recent_files) >= 1
