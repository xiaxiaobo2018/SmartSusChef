"""
Comprehensive tests for the per-store (multi-tenant) ML pipeline.

Covers:
- fetch_training_data(store_id) filtering
- process_dish with store_id error prefix
- Model save/load per-store directory isolation
- Prediction endpoints with missing models / insufficient data
- /store/{store_id}/train endpoint
- Store isolation (different stores get separate models)
"""

import os
import sys
from pathlib import Path
from types import SimpleNamespace
from typing import Any

import numpy as np
import pandas as pd
import pytest

ML_ROOT = os.path.dirname(os.path.dirname(__file__))
if ML_ROOT not in sys.path:
    sys.path.insert(0, ML_ROOT)

from core.data_prep import fetch_training_data
from core.model_train import (
    PipelineConfig,
    _load_hybrid_models,
    _save_hybrid_models,
    process_dish,
)


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


class DummyProphet:
    def __init__(self, **kwargs):
        self.regressors: list[str] = []

    def add_country_holidays(self, country_name):
        pass

    def add_regressor(self, col):
        self.regressors.append(col)

    def fit(self, df):
        self._fitted_len = len(df)

    def predict(self, df):
        return pd.DataFrame({"yhat": np.ones(len(df))})


class DummyTreeModel:
    def __init__(self, **kwargs):
        pass

    def fit(self, X, y, **kwargs):
        return self

    def predict(self, X):
        return np.zeros(len(X))


# ===================================================================
# fetch_training_data(store_id) tests
# ===================================================================
class TestFetchTrainingDataStoreId:
    """Verify that fetch_training_data filters by store_id."""

    def test_no_store_id_returns_all_data(self, monkeypatch):
        """Without store_id, should fetch ALL rows (or CSV fallback)."""
        monkeypatch.delenv("DATABASE_URL", raising=False)
        csv_path = Path(ML_ROOT) / "food_sales_eng.csv"
        if not csv_path.exists():
            pytest.skip("No CSV fallback file available")

        df = fetch_training_data()
        assert len(df) > 0
        assert list(df.columns) == ["date", "dish", "sales"]

    def test_store_id_none_backward_compat(self, monkeypatch):
        """Passing store_id=None should behave identically to no argument."""
        monkeypatch.delenv("DATABASE_URL", raising=False)
        csv_path = Path(ML_ROOT) / "food_sales_eng.csv"
        if not csv_path.exists():
            pytest.skip("No CSV fallback file available")

        df1 = fetch_training_data()
        df2 = fetch_training_data(store_id=None)
        pd.testing.assert_frame_equal(df1.reset_index(drop=True), df2.reset_index(drop=True))

    def test_store_specific_csv_fallback(self, monkeypatch, tmp_path):
        """When DB unavailable, looks for store-specific CSV directory."""
        monkeypatch.delenv("DATABASE_URL", raising=False)

        # Create store-specific CSV
        store_dir = tmp_path / "ml_data_uploads" / "42"
        store_dir.mkdir(parents=True)
        csv_data = pd.DataFrame(
            {
                "Date": ["01/01/2024", "01/02/2024"],
                "Dish_Name": ["DishA", "DishA"],
                "Quantity_Sold": [10, 20],
            }
        )
        csv_data.to_csv(store_dir / "food_sales_eng.csv", index=False)

        # Change working directory so relative path resolves
        monkeypatch.chdir(tmp_path)

        df = fetch_training_data(store_id=42)
        assert len(df) == 2
        assert df["dish"].unique().tolist() == ["DishA"]

    def test_store_id_with_db_query(self, monkeypatch):
        """When DB is available, the SQL should include WHERE StoreId clause."""
        queries_captured: list[str] = []

        def mock_read_sql(query, engine, params=None):
            queries_captured.append(str(query))
            return pd.DataFrame(
                {
                    "date": pd.to_datetime(["2024-01-01"]),
                    "dish": ["TestDish"],
                    "sales": [5.0],
                }
            )

        monkeypatch.setenv("DATABASE_URL", "mysql://fake:fake@localhost/fakedb")
        monkeypatch.setattr(pd, "read_sql", mock_read_sql)

        # Mock create_engine
        import core.data_prep as dp

        monkeypatch.setattr(dp, "create_engine", lambda url: "fake_engine")

        df = fetch_training_data(store_id=7)
        assert len(queries_captured) == 1
        assert "StoreId" in queries_captured[0]
        assert len(df) == 1

    def test_no_store_id_db_query_has_no_where(self, monkeypatch):
        """Without store_id, SQL should NOT filter by StoreId."""
        queries_captured: list[str] = []

        def mock_read_sql(query, engine, params=None):
            queries_captured.append(str(query))
            return pd.DataFrame(
                {
                    "date": pd.to_datetime(["2024-01-01"]),
                    "dish": ["TestDish"],
                    "sales": [5.0],
                }
            )

        monkeypatch.setenv("DATABASE_URL", "mysql://fake:fake@localhost/fakedb")

        import core.data_prep as dp

        monkeypatch.setattr(dp, "create_engine", lambda url: "fake_engine")
        monkeypatch.setattr(pd, "read_sql", mock_read_sql)

        fetch_training_data(store_id=None)
        assert "StoreId" not in queries_captured[0]


# ===================================================================
# process_dish with store_id (error messages)
# ===================================================================
class TestProcessDishStoreId:
    """Verify that store_id is included in error messages."""

    def test_no_data_error_includes_store_id(self, tmp_path):
        cfg = PipelineConfig(model_dir=str(tmp_path))
        df = _make_daily_df(5, dish="Existing")
        with pytest.raises(RuntimeError, match="Store 42.*No data found"):
            process_dish("Missing", df, "US", cfg, store_id=42)

    def test_insufficient_data_error_includes_store_id(self, monkeypatch, tmp_path):
        import core.feature_eng as fe

        monkeypatch.setattr(fe, "add_hybrid_features", lambda d, c: d)
        cfg = PipelineConfig(min_train_days=100, model_dir=str(tmp_path))
        df = _make_daily_df(3, dish="Short")
        with pytest.raises(RuntimeError, match="Store 5.*Insufficient data for training"):
            process_dish("Short", df, "US", cfg, store_id=5)

    def test_no_store_id_error_has_no_prefix(self, tmp_path):
        """Without store_id, error messages should NOT have Store prefix."""
        cfg = PipelineConfig(model_dir=str(tmp_path))
        df = _make_daily_df(5, dish="Existing")
        with pytest.raises(RuntimeError, match="^Missing: No data found"):
            process_dish("Missing", df, "US", cfg)

    def test_store_id_none_backward_compat(self, tmp_path):
        """store_id=None should behave the same as not passing it."""
        cfg = PipelineConfig(model_dir=str(tmp_path))
        df = _make_daily_df(5, dish="Existing")
        with pytest.raises(RuntimeError, match="^Missing: No data found"):
            process_dish("Missing", df, "US", cfg, store_id=None)


# ===================================================================
# Model persistence: per-store directory isolation
# ===================================================================
class TestPerStoreModelIsolation:
    """Verify that models for different stores are isolated in separate directories."""

    def test_save_load_different_stores(self, tmp_path):
        """Models saved under store_1/ and store_2/ should be independent."""
        cfg = PipelineConfig(model_dir=str(tmp_path))

        for sid in [1, 2]:
            prophet_obj = {"store": sid, "type": "prophet"}
            tree_obj = {"store": sid, "type": "tree"}
            _save_hybrid_models(sid, "DishA", prophet_obj, tree_obj, "xgboost", cfg)

        # Load from store_1 — functions construct store_1/ internally
        p1, t1 = _load_hybrid_models(1, "DishA", "xgboost", cfg)
        assert p1["store"] == 1

        # Load from store_2
        p2, t2 = _load_hybrid_models(2, "DishA", "xgboost", cfg)
        assert p2["store"] == 2

    def test_store_1_models_dont_exist_in_store_2(self, tmp_path):
        """A dish model saved for store_1 should NOT be loadable from store_2."""
        cfg = PipelineConfig(model_dir=str(tmp_path))
        _save_hybrid_models(1, "DishA", {"p": 1}, {"t": 1}, "xgb", cfg)

        with pytest.raises((FileNotFoundError, OSError)):
            _load_hybrid_models(2, "DishA", "xgb", cfg)


# ===================================================================
# StoreModelManager training with enhanced feedback
# ===================================================================
class TestStoreManagerTraining:
    """Test StoreModelManager.train_store_models with per-dish feedback."""

    def test_insufficient_data_message(self, monkeypatch, tmp_path):
        from app.store_manager import StoreModelManager

        mgr = StoreModelManager(base_model_dir=str(tmp_path))
        df = pd.DataFrame(
            {"date": pd.to_datetime(["2024-01-01"]), "dish": ["A"], "sales": [1.0]}
        )
        monkeypatch.setattr(mgr, "fetch_store_sales", lambda sid: (df, 5))
        result = mgr.train_store_models(1)
        assert result["status"] == "insufficient_data"
        assert "100" in result["message"]  # MIN_TRAINING_DAYS
        assert "5 days" in result["message"]
        assert result["store_id"] == 1

    def test_no_data_message(self, monkeypatch, tmp_path):
        from app.store_manager import StoreModelManager

        mgr = StoreModelManager(base_model_dir=str(tmp_path))
        monkeypatch.setattr(mgr, "fetch_store_sales", lambda sid: (None, 0))
        result = mgr.train_store_models(99)
        assert result["status"] == "error"
        assert result["store_id"] == 99
        assert "No sales data" in result["message"]

    def test_failed_dishes_reported(self, monkeypatch, tmp_path):
        """Per-dish failures should be reported in failed_details."""
        from app.store_manager import StoreModelManager

        mgr = StoreModelManager(base_model_dir=str(tmp_path))
        df = pd.DataFrame(
            {
                "date": pd.to_datetime(["2024-01-01", "2024-01-01"]),
                "dish": ["Good", "Bad"],
                "sales": [1.0, 2.0],
            }
        )
        monkeypatch.setattr(mgr, "fetch_store_sales", lambda sid: (df, 200))
        monkeypatch.setattr(mgr, "fetch_store_location", lambda sid: (1.0, 2.0, "US"))

        call_count = {"n": 0}

        def _process_dish(dish, frame, cc, config, store_id=None):
            call_count["n"] += 1
            if dish == "Bad":
                raise RuntimeError("Insufficient data for training")
            return {"champion": "xgb", "mae": {}, "champion_mae": 1.0}

        def _add_local_context(data, **kwargs):
            return data, "US", 1.0, 2.0

        fake_module = SimpleNamespace(
            PipelineConfig=lambda: SimpleNamespace(model_dir=""),
            add_local_context=_add_local_context,
            process_dish=_process_dish,
        )
        monkeypatch.setitem(sys.modules, "training_logic_v2", fake_module)

        result = mgr.train_store_models(1)
        assert result["status"] == "completed"
        assert result["dishes_trained"] == 1
        assert result["dishes_failed"] == 1
        assert "Bad" in result["failed_details"]
        assert "Insufficient" in result["failed_details"]["Bad"]


# ===================================================================
# /store/{store_id}/train endpoint
# ===================================================================
class TestStoreTrainEndpoint:
    """Test the training trigger endpoint."""

    @pytest.fixture(autouse=True)
    def _cleanup(self):
        import app.main as main_mod

        yield
        main_mod.app.dependency_overrides.clear()
        main_mod.get_model_store.cache_clear()
        main_mod.get_model_manager.cache_clear()

    def _make_client(self, monkeypatch, manager):
        import app.main as main_mod
        from fastapi.testclient import TestClient

        main_mod.get_model_store.cache_clear()
        main_mod.get_model_manager.cache_clear()
        main_mod.app.dependency_overrides[main_mod.get_model_store] = lambda: None
        main_mod.app.dependency_overrides[main_mod.get_model_manager] = lambda: manager
        return TestClient(main_mod.app)

    def test_train_already_training(self, monkeypatch):
        class Mgr:
            MIN_TRAINING_DAYS = 100

            def is_training(self, sid):
                return True

        client = self._make_client(monkeypatch, Mgr())
        resp = client.post("/store/1/train")
        assert resp.status_code == 200
        assert resp.json()["status"] == "already_training"

    def test_train_insufficient_data(self, monkeypatch):
        class Mgr:
            MIN_TRAINING_DAYS = 100

            def is_training(self, sid):
                return False

            def fetch_store_sales(self, sid):
                return None, 30

        client = self._make_client(monkeypatch, Mgr())
        resp = client.post("/store/1/train")
        assert resp.status_code == 200
        body = resp.json()
        assert body["status"] == "insufficient_data"
        assert body["days_available"] == 30

    def test_train_db_error(self, monkeypatch):
        class Mgr:
            MIN_TRAINING_DAYS = 100

            def is_training(self, sid):
                return False

            def fetch_store_sales(self, sid):
                raise RuntimeError("DB unreachable")

        client = self._make_client(monkeypatch, Mgr())
        resp = client.post("/store/1/train")
        assert resp.status_code == 200
        body = resp.json()
        assert body["status"] == "error"
        assert "DB unreachable" in body["message"]

    def test_train_started_successfully(self, monkeypatch):
        class Mgr:
            MIN_TRAINING_DAYS = 100

            def is_training(self, sid):
                return False

            def fetch_store_sales(self, sid):
                return None, 150

            def train_store_models(self, sid):
                return {"status": "completed"}

        client = self._make_client(monkeypatch, Mgr())
        resp = client.post("/store/1/train")
        assert resp.status_code == 200
        body = resp.json()
        assert body["status"] == "started"
        assert body["days_available"] == 150


# ===================================================================
# Enhanced prediction error messages
# ===================================================================
class TestPredictionErrors:
    """Test informative error responses for missing/insufficient models."""

    @pytest.fixture(autouse=True)
    def _cleanup(self):
        import app.main as main_mod

        yield
        main_mod.app.dependency_overrides.clear()
        main_mod.get_model_store.cache_clear()
        main_mod.get_model_manager.cache_clear()

    def _make_client(self, monkeypatch, manager):
        import app.main as main_mod
        from fastapi.testclient import TestClient

        main_mod.get_model_store.cache_clear()
        main_mod.get_model_manager.cache_clear()
        main_mod.app.dependency_overrides[main_mod.get_model_store] = lambda: None
        main_mod.app.dependency_overrides[main_mod.get_model_manager] = lambda: manager
        return TestClient(main_mod.app)

    def test_missing_models_insufficient_data_message(self, monkeypatch):
        """When store has < MIN_TRAINING_DAYS, message should explain data shortage."""

        class Mgr:
            MIN_TRAINING_DAYS = 100

            def is_training(self, sid):
                return False

            def get_store(self, sid):
                return None

            def fetch_store_sales(self, sid):
                return None, 30

        client = self._make_client(monkeypatch, Mgr())
        resp = client.post("/store/1/predict", json={"store_id": 1, "horizon_days": 7})
        body = resp.json()
        assert body["status"] == "missing_models"
        assert "Insufficient historical data" in body["message"]
        assert "30 days" in body["message"]

    def test_missing_models_enough_data_suggests_training(self, monkeypatch):
        """When store has enough data but no models, suggest training."""

        class Mgr:
            MIN_TRAINING_DAYS = 100

            def is_training(self, sid):
                return False

            def get_store(self, sid):
                return None

            def fetch_store_sales(self, sid):
                return None, 200

        client = self._make_client(monkeypatch, Mgr())
        resp = client.post("/store/1/predict", json={"store_id": 1, "horizon_days": 7})
        body = resp.json()
        assert body["status"] == "missing_models"
        assert "train" in body["message"].lower()
