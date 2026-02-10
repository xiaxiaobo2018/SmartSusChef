"""Unit tests for core.cv_eval -- CV fold generation, fold cache, evaluation, and Optuna."""

import os
import sys
from types import SimpleNamespace
from typing import Any

import numpy as np
import pandas as pd
import pytest

# Ensure ML root is on sys.path so `core.*` imports resolve.
ML_ROOT = os.path.dirname(os.path.dirname(__file__))
if ML_ROOT not in sys.path:
    sys.path.insert(0, ML_ROOT)

from core.cv_eval import (
    _eval_hybrid_mae,
    _generate_cv_folds,
    _optimize_hybrid,
    _prepare_cv_fold_cache,
)
from core.model_train import PipelineConfig


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _make_daily_df(n_days: int, start: str = "2024-01-01") -> pd.DataFrame:
    """Return a simple daily DataFrame with date, sales, and weather columns."""
    dates = pd.date_range(start, periods=n_days, freq="D")
    rng = np.random.default_rng(42)
    return pd.DataFrame(
        {
            "date": dates,
            "sales": rng.uniform(1, 10, size=n_days),
            "dish": ["TestDish"] * n_days,
            "temperature_2m_max": rng.uniform(20, 35, size=n_days),
            "temperature_2m_min": rng.uniform(10, 20, size=n_days),
            "relative_humidity_2m_mean": rng.uniform(40, 80, size=n_days),
            "precipitation_sum": rng.uniform(0, 5, size=n_days),
        }
    )


def _dummy_model_class():
    """Return a dummy model class whose predict returns zeros."""

    class _Dummy:
        def __init__(self, **kwargs):
            pass

        def fit(self, X, y, **kwargs):
            return self

        def predict(self, X):
            return np.zeros(len(X))

    return _Dummy


def _make_fold_cache(n_folds: int = 1, n_train: int = 5, n_test: int = 3):
    """Build a minimal fold_cache list for testing _eval_hybrid_mae."""
    cache = []
    for _ in range(n_folds):
        cache.append(
            {
                "X_train": pd.DataFrame({"a": np.arange(n_train, dtype=float)}),
                "y_train": pd.Series(np.zeros(n_train)),
                "X_test": pd.DataFrame({"a": np.arange(n_test, dtype=float)}),
                "y_test": pd.Series(np.zeros(n_test)),
                "prophet_test": np.ones(n_test),
                "sales_test": np.ones(n_test),
            }
        )
    return cache


# ===================================================================
# _generate_cv_folds
# ===================================================================
class TestGenerateCvFolds:
    """Tests for the expanding-window CV fold generator."""

    def test_single_fold(self):
        """One fold with enough data should yield exactly one (train, test) pair."""
        cfg = PipelineConfig(n_cv_folds=1, test_window_days=2, min_train_days=1)
        df = _make_daily_df(10)
        folds = list(_generate_cv_folds(df, cfg))
        assert len(folds) == 1
        train, test = folds[0]
        assert len(train) > 0
        assert len(test) > 0

    def test_multiple_folds(self):
        """Requesting 3 folds with sufficient data yields 3 pairs."""
        cfg = PipelineConfig(n_cv_folds=3, test_window_days=5, min_train_days=5)
        df = _make_daily_df(60)
        folds = list(_generate_cv_folds(df, cfg))
        assert len(folds) == 3

    def test_folds_do_not_overlap(self):
        """Train end date < test start date for each fold; test windows don't overlap."""
        cfg = PipelineConfig(n_cv_folds=3, test_window_days=7, min_train_days=7)
        df = _make_daily_df(90)
        folds = list(_generate_cv_folds(df, cfg))

        for train, test in folds:
            assert train["date"].max() < test["date"].min()

    def test_expanding_window_train_grows(self):
        """Earlier folds should have smaller training sets (expanding window)."""
        cfg = PipelineConfig(n_cv_folds=3, test_window_days=7, min_train_days=7)
        df = _make_daily_df(90)
        folds = list(_generate_cv_folds(df, cfg))
        train_sizes = [len(train) for train, _ in folds]
        assert train_sizes == sorted(train_sizes), "Training set should grow across folds"

    def test_insufficient_data_skips_fold(self):
        """If data is too short for the required min_train_days, folds are skipped."""
        cfg = PipelineConfig(n_cv_folds=3, test_window_days=30, min_train_days=60)
        df = _make_daily_df(10)  # far too little data
        folds = list(_generate_cv_folds(df, cfg))
        assert len(folds) == 0

    def test_empty_dataframe(self):
        """Empty DataFrame should produce zero folds without error."""
        cfg = PipelineConfig(n_cv_folds=2, test_window_days=7, min_train_days=1)
        df = pd.DataFrame({"date": pd.Series(dtype="datetime64[ns]"), "sales": pd.Series(dtype=float)})
        folds = list(_generate_cv_folds(df, cfg))
        assert len(folds) == 0

    def test_exact_boundary(self):
        """Data just long enough for one fold should yield exactly one fold."""
        # train_span = (max_train - min_train).days must >= min_train_days
        # With 7 days, test_start=day4, train=[day0..day3], span=3 >= 3
        cfg = PipelineConfig(n_cv_folds=1, test_window_days=2, min_train_days=3)
        df = _make_daily_df(7)
        folds = list(_generate_cv_folds(df, cfg))
        assert len(folds) == 1

    def test_zero_folds_requested(self):
        """n_cv_folds=0 should yield nothing (range(0,0,-1) is empty)."""
        cfg = PipelineConfig(n_cv_folds=0, test_window_days=7, min_train_days=1)
        df = _make_daily_df(30)
        folds = list(_generate_cv_folds(df, cfg))
        assert len(folds) == 0


# ===================================================================
# _prepare_cv_fold_cache
# ===================================================================
class TestPrepareCvFoldCache:
    """Tests for fold-cache preparation (Prophet + residual pre-computation)."""

    def test_returns_correct_cache_structure(self, monkeypatch):
        """Cache should contain the expected keys per fold."""
        cfg = PipelineConfig(
            n_cv_folds=1, test_window_days=2, min_train_days=1, min_ml_days=1,
        )
        cfg.hybrid_tree_features = ["prophet_yhat"]

        df = _make_daily_df(10)

        import core.cv_eval as ce
        import core.model_train as mt

        monkeypatch.setattr(ce, "sanitize_sparse_data", lambda d, cc, config=None: d)
        monkeypatch.setattr(mt, "_fit_prophet", lambda train, cc, config: object())
        monkeypatch.setattr(mt, "_prophet_predict", lambda m, d: np.ones(len(d)))

        cache = _prepare_cv_fold_cache(df, "US", cfg)
        assert len(cache) >= 1

        expected_keys = {"X_train", "y_train", "X_test", "y_test", "prophet_test", "sales_test"}
        for fold in cache:
            assert set(fold.keys()) == expected_keys

    def test_prophet_called_per_fold(self, monkeypatch):
        """_fit_prophet should be called once for each usable CV fold."""
        cfg = PipelineConfig(
            n_cv_folds=2, test_window_days=5, min_train_days=5, min_ml_days=5,
        )
        cfg.hybrid_tree_features = ["prophet_yhat"]
        df = _make_daily_df(40)

        fit_count = {"n": 0}

        def counting_fit(train, cc, config):
            fit_count["n"] += 1
            return object()

        import core.cv_eval as ce
        import core.model_train as mt

        monkeypatch.setattr(ce, "sanitize_sparse_data", lambda d, cc, config=None: d)
        monkeypatch.setattr(mt, "_fit_prophet", counting_fit)
        monkeypatch.setattr(mt, "_prophet_predict", lambda m, d: np.ones(len(d)))

        cache = _prepare_cv_fold_cache(df, "US", cfg)
        assert fit_count["n"] == len(cache)
        assert fit_count["n"] >= 1

    def test_empty_folds_produce_empty_cache(self, monkeypatch):
        """When data is insufficient to produce folds, the cache should be empty."""
        cfg = PipelineConfig(
            n_cv_folds=2, test_window_days=30, min_train_days=60,
        )
        cfg.hybrid_tree_features = ["prophet_yhat"]
        df = _make_daily_df(5)  # too short

        import core.cv_eval as ce
        import core.model_train as mt

        monkeypatch.setattr(ce, "sanitize_sparse_data", lambda d, cc, config=None: d)
        monkeypatch.setattr(mt, "_fit_prophet", lambda train, cc, config: object())
        monkeypatch.setattr(mt, "_prophet_predict", lambda m, d: np.ones(len(d)))

        cache = _prepare_cv_fold_cache(df, "US", cfg)
        assert cache == []

    def test_sanitize_applied_per_fold(self, monkeypatch):
        """sanitize_sparse_data is called for both train and test in each fold."""
        cfg = PipelineConfig(
            n_cv_folds=1, test_window_days=2, min_train_days=1,
        )
        cfg.hybrid_tree_features = ["prophet_yhat"]
        df = _make_daily_df(10)

        sanitize_calls = {"n": 0}

        def counting_sanitize(d, cc, config=None):
            sanitize_calls["n"] += 1
            return d

        import core.cv_eval as ce
        import core.model_train as mt

        monkeypatch.setattr(ce, "sanitize_sparse_data", counting_sanitize)
        monkeypatch.setattr(mt, "_fit_prophet", lambda train, cc, config: object())
        monkeypatch.setattr(mt, "_prophet_predict", lambda m, d: np.ones(len(d)))

        cache = _prepare_cv_fold_cache(df, "US", cfg)
        # Two sanitize calls per fold (train + test)
        assert sanitize_calls["n"] == 2 * len(cache)


# ===================================================================
# _eval_hybrid_mae
# ===================================================================
class TestEvalHybridMae:
    """Tests for per-fold model evaluation."""

    def test_xgboost_returns_zero_mae(self, monkeypatch):
        """Dummy XGBRegressor predicting 0 residual with prophet=1 and sales=1 => MAE 0."""
        import core.cv_eval as ce

        monkeypatch.setattr(ce, "XGBRegressor", _dummy_model_class())
        cache = _make_fold_cache()
        cfg = PipelineConfig(use_gpu=False)
        mae = _eval_hybrid_mae("xgboost", cache, {}, cfg)
        assert mae == pytest.approx(0.0)

    def test_catboost_returns_zero_mae(self, monkeypatch):
        """Same test for CatBoost path."""
        import core.cv_eval as ce

        monkeypatch.setattr(ce, "CatBoostRegressor", _dummy_model_class())
        cache = _make_fold_cache()
        cfg = PipelineConfig(use_gpu=False)
        mae = _eval_hybrid_mae("catboost", cache, {}, cfg)
        assert mae == pytest.approx(0.0)

    def test_lightgbm_returns_zero_mae(self, monkeypatch):
        """Same test for LightGBM path."""
        import core.cv_eval as ce

        DummyLGBM = _dummy_model_class()
        monkeypatch.setattr(ce, "lgb", SimpleNamespace(LGBMRegressor=DummyLGBM))
        cache = _make_fold_cache()
        cfg = PipelineConfig(use_gpu=False)
        mae = _eval_hybrid_mae("lightgbm", cache, {}, cfg)
        assert mae == pytest.approx(0.0)

    def test_unknown_model_type_raises(self):
        """An unrecognised model type should raise ValueError."""
        cache = _make_fold_cache()
        cfg = PipelineConfig(use_gpu=False)
        with pytest.raises(ValueError, match="Unknown model type"):
            _eval_hybrid_mae("random_forest", cache, {}, cfg)

    def test_empty_fold_cache_returns_inf(self):
        """If fold_cache is empty, MAE should be +inf."""
        cfg = PipelineConfig(use_gpu=False)
        mae = _eval_hybrid_mae("xgboost", [], {}, cfg)
        assert mae == float("inf")

    def test_multiple_folds_averaged(self, monkeypatch):
        """MAE should be the mean across all folds."""
        import core.cv_eval as ce

        monkeypatch.setattr(ce, "XGBRegressor", _dummy_model_class())
        cache = _make_fold_cache(n_folds=3)
        cfg = PipelineConfig(use_gpu=False)
        mae = _eval_hybrid_mae("xgboost", cache, {}, cfg)
        # All folds have identical dummy data so mean is the same as one fold
        assert mae == pytest.approx(0.0)

    def test_nonzero_residual_gives_nonzero_mae(self, monkeypatch):
        """When the model predicts a non-zero residual the MAE should be nonzero."""
        import core.cv_eval as ce

        class ShiftModel:
            def __init__(self, **kwargs):
                pass

            def fit(self, X, y, **kwargs):
                return self

            def predict(self, X):
                return np.full(len(X), 5.0)  # residual of 5

        monkeypatch.setattr(ce, "XGBRegressor", ShiftModel)
        # prophet=1, sales=1 => yhat = max(1+5, 0) = 6 => MAE = |1 - 6| = 5
        cache = _make_fold_cache()
        cfg = PipelineConfig(use_gpu=False)
        mae = _eval_hybrid_mae("xgboost", cache, {}, cfg)
        assert mae == pytest.approx(5.0)

    def test_negative_yhat_clipped_to_zero(self, monkeypatch):
        """Predicted values are clipped to zero (np.maximum(..., 0))."""
        import core.cv_eval as ce

        class NegModel:
            def __init__(self, **kwargs):
                pass

            def fit(self, X, y, **kwargs):
                return self

            def predict(self, X):
                return np.full(len(X), -100.0)

        monkeypatch.setattr(ce, "XGBRegressor", NegModel)
        # prophet=1, residual=-100 => yhat = max(1-100, 0) = 0 => MAE = |1-0| = 1
        cache = _make_fold_cache()
        cfg = PipelineConfig(use_gpu=False)
        mae = _eval_hybrid_mae("xgboost", cache, {}, cfg)
        assert mae == pytest.approx(1.0)

    def test_gpu_flags_not_used_when_disabled(self, monkeypatch):
        """When use_gpu=False, get_gpu_flags should NOT be called."""
        import core.cv_eval as ce
        import core.model_train as mt

        monkeypatch.setattr(ce, "XGBRegressor", _dummy_model_class())
        called = {"gpu": False}

        def spy_gpu():
            called["gpu"] = True
            return {}

        # _eval_hybrid_mae does `from core.model_train import get_gpu_flags`
        # so patching at the source module is sufficient.
        monkeypatch.setattr(mt, "get_gpu_flags", spy_gpu)

        cache = _make_fold_cache()
        cfg = PipelineConfig(use_gpu=False)
        _eval_hybrid_mae("xgboost", cache, {}, cfg)
        assert not called["gpu"]


# ===================================================================
# _optimize_hybrid
# ===================================================================
class TestOptimizeHybrid:
    """Tests for the Optuna-based optimisation wrapper."""

    def test_returns_best_mae_and_params_xgboost(self, monkeypatch):
        """_optimize_hybrid should return (float, dict) with valid xgboost keys."""
        import core.cv_eval as ce

        monkeypatch.setattr(ce, "XGBRegressor", _dummy_model_class())

        cache = _make_fold_cache()
        cfg = PipelineConfig(use_gpu=False, n_optuna_trials=3, random_seed=0)

        best_mae, best_params = _optimize_hybrid("xgboost", cache, cfg)
        assert isinstance(best_mae, float)
        assert best_mae >= 0.0
        assert isinstance(best_params, dict)
        # xgboost objective suggests these keys
        expected_keys = {"max_depth", "learning_rate", "subsample", "reg_alpha", "reg_lambda"}
        assert set(best_params.keys()) == expected_keys

    def test_returns_best_mae_and_params_catboost(self, monkeypatch):
        """Same for catboost."""
        import core.cv_eval as ce

        monkeypatch.setattr(ce, "CatBoostRegressor", _dummy_model_class())

        cache = _make_fold_cache()
        cfg = PipelineConfig(use_gpu=False, n_optuna_trials=3, random_seed=0)

        best_mae, best_params = _optimize_hybrid("catboost", cache, cfg)
        assert isinstance(best_mae, float)
        expected_keys = {"depth", "learning_rate", "l2_leaf_reg", "subsample"}
        assert set(best_params.keys()) == expected_keys

    def test_returns_best_mae_and_params_lightgbm(self, monkeypatch):
        """Same for lightgbm."""
        import core.cv_eval as ce

        DummyLGBM = _dummy_model_class()
        monkeypatch.setattr(ce, "lgb", SimpleNamespace(LGBMRegressor=DummyLGBM))

        cache = _make_fold_cache()
        cfg = PipelineConfig(use_gpu=False, n_optuna_trials=3, random_seed=0)

        best_mae, best_params = _optimize_hybrid("lightgbm", cache, cfg)
        assert isinstance(best_mae, float)
        expected_keys = {"num_leaves", "learning_rate", "reg_alpha", "reg_lambda"}
        assert set(best_params.keys()) == expected_keys

    def test_unknown_model_type_raises(self):
        """Unknown model type should raise ValueError in the objective."""
        cache = _make_fold_cache()
        cfg = PipelineConfig(use_gpu=False, n_optuna_trials=1, random_seed=0)
        with pytest.raises(ValueError, match="Unknown model type"):
            _optimize_hybrid("unknown_model", cache, cfg)

    def test_optuna_study_called_with_correct_trials(self, monkeypatch):
        """Verify that Optuna runs exactly n_optuna_trials trials."""
        import optuna

        import core.cv_eval as ce

        monkeypatch.setattr(ce, "XGBRegressor", _dummy_model_class())

        cache = _make_fold_cache()
        n_trials = 5
        cfg = PipelineConfig(use_gpu=False, n_optuna_trials=n_trials, random_seed=0)

        # Wrap create_study to capture the study object
        original_create_study = optuna.create_study
        captured_studies: list[Any] = []

        def spy_create_study(**kwargs):
            study = original_create_study(**kwargs)
            captured_studies.append(study)
            return study

        monkeypatch.setattr(ce.optuna, "create_study", spy_create_study)

        _optimize_hybrid("xgboost", cache, cfg)

        assert len(captured_studies) == 1
        assert len(captured_studies[0].trials) == n_trials

    def test_empty_cache_returns_inf(self, monkeypatch):
        """With an empty fold_cache every trial scores inf; best_value should be inf."""
        import core.cv_eval as ce

        monkeypatch.setattr(ce, "XGBRegressor", _dummy_model_class())
        cfg = PipelineConfig(use_gpu=False, n_optuna_trials=2, random_seed=0)

        best_mae, best_params = _optimize_hybrid("xgboost", [], cfg)
        assert best_mae == float("inf")
