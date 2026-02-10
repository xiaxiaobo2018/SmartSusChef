"""Tests for app.main FastAPI endpoints, including dependency injection."""

from typing import Any

import pandas as pd
import pytest
from fastapi.testclient import TestClient

import app.main as main


# ===================================================================
# Dummy/Stub helpers
# ===================================================================
class DummyStore:
    def __init__(self, dishes: list[str], model_dir: str = "models") -> None:
        self._dishes = dishes
        from pathlib import Path

        self.model_dir = Path(model_dir)

    def list_dishes(self) -> list[str]:
        return self._dishes


class DummyManager:
    MIN_TRAINING_DAYS = 100

    def __init__(self) -> None:
        self._has_models = False
        self._is_training = False
        self._store = None
        self._progress = None
        self._days_available = 0
        self._location = (None, None, None)

    def has_models(self, store_id: int) -> bool:
        return self._has_models

    def is_training(self, store_id: int) -> bool:
        return self._is_training

    def get_store(self, store_id: int):
        return self._store

    def fetch_store_sales(self, store_id: int):
        return None, self._days_available

    def fetch_store_location(self, store_id: int):
        return self._location

    def get_training_progress(self, store_id: int):
        return self._progress


_SENTINEL = object()


def _make_client(monkeypatch, store=_SENTINEL, manager=_SENTINEL):
    """Create a TestClient with overridden dependency injection."""
    # Clear any LRU cache from the dependency providers
    main.get_model_store.cache_clear()
    main.get_model_manager.cache_clear()

    if store is not _SENTINEL:
        main.app.dependency_overrides[main.get_model_store] = lambda: store
    else:
        main.app.dependency_overrides.pop(main.get_model_store, None)

    if manager is not _SENTINEL:
        main.app.dependency_overrides[main.get_model_manager] = lambda: manager
    else:
        main.app.dependency_overrides.pop(main.get_model_manager, None)

    client = TestClient(main.app)
    return client


@pytest.fixture(autouse=True)
def _cleanup_overrides():
    """Clean up dependency overrides after every test."""
    yield
    main.app.dependency_overrides.clear()
    main.get_model_store.cache_clear()
    main.get_model_manager.cache_clear()


# ===================================================================
# Dependency Injection Tests
# ===================================================================
class TestDependencyInjection:
    def test_get_model_store_returns_none_on_file_not_found(self, monkeypatch):
        """get_model_store returns None when create_store_from_env raises FileNotFoundError."""
        main.get_model_store.cache_clear()

        def _raise():
            raise FileNotFoundError("no registry")

        monkeypatch.setattr(main, "create_store_from_env", _raise)
        result = main.get_model_store()
        assert result is None

    def test_get_model_store_is_cached(self, monkeypatch):
        """get_model_store uses lru_cache, returns same instance on repeated calls."""
        main.get_model_store.cache_clear()
        store = DummyStore(["A"])
        monkeypatch.setattr(main, "create_store_from_env", lambda: store)
        result1 = main.get_model_store()
        result2 = main.get_model_store()
        assert result1 is result2
        assert result1 is store

    def test_get_model_manager_returns_instance(self, monkeypatch):
        """get_model_manager returns a StoreModelManager."""
        main.get_model_manager.cache_clear()
        mgr = main.get_model_manager()
        assert mgr is not None


# ===================================================================
# Health endpoint
# ===================================================================
class TestHealthEndpoint:
    def test_health_with_store(self, monkeypatch):
        store = DummyStore(["A", "B"])
        manager = DummyManager()
        client = _make_client(monkeypatch, store=store, manager=manager)
        resp = client.get("/health")
        assert resp.status_code == 200
        body = resp.json()
        assert body["status"] == "ok"
        assert body["dishes"] == 2
        assert body["manager_ready"] is True

    def test_health_store_is_none(self, monkeypatch):
        """When store is None, dishes count should be 0."""
        manager = DummyManager()
        client = _make_client(monkeypatch, store=None, manager=manager)
        resp = client.get("/health")
        assert resp.status_code == 200
        body = resp.json()
        assert body["status"] == "ok"
        assert body["dishes"] == 0
        assert body["manager_ready"] is True


# ===================================================================
# /dishes endpoint
# ===================================================================
class TestDishesEndpoint:
    def test_dishes_success(self, monkeypatch):
        store = DummyStore(["X", "Y"])
        client = _make_client(monkeypatch, store=store, manager=DummyManager())
        resp = client.get("/dishes")
        assert resp.status_code == 200
        assert resp.json()["dishes"] == ["X", "Y"]

    def test_dishes_no_store_returns_503(self, monkeypatch):
        client = _make_client(monkeypatch, store=None, manager=DummyManager())
        resp = client.get("/dishes")
        assert resp.status_code == 503


# ===================================================================
# /predict endpoint
# ===================================================================
class TestPredictEndpoint:
    def test_predict_success(self, monkeypatch):
        store = DummyStore(["A"])
        manager = DummyManager()
        expected = {
            "dish": "A",
            "model": "xgboost",
            "model_combo": "Prophet+xgboost",
            "horizon_days": 2,
            "start_date": "2024-01-01",
            "predictions": [
                {"date": "2024-01-01", "yhat": 1.0, "prophet_yhat": 1.0, "residual_hat": 0.0}
            ],
        }
        monkeypatch.setattr(main, "predict_dish", lambda **kwargs: expected)
        client = _make_client(monkeypatch, store=store, manager=manager)
        resp = client.post(
            "/predict", json={"dish": "A", "recent_sales": [1, 2], "horizon_days": 2}
        )
        assert resp.status_code == 200
        assert resp.json() == expected

    def test_predict_keyerror_returns_404(self, monkeypatch):
        store = DummyStore(["A"])
        manager = DummyManager()

        def _raise(**kwargs):
            raise KeyError("missing")

        monkeypatch.setattr(main, "predict_dish", _raise)
        client = _make_client(monkeypatch, store=store, manager=manager)
        resp = client.post("/predict", json={"dish": "X", "recent_sales": [1], "horizon_days": 1})
        assert resp.status_code == 404

    def test_predict_valueerror_returns_400(self, monkeypatch):
        store = DummyStore(["A"])

        def _raise(**kwargs):
            raise ValueError("bad input")

        monkeypatch.setattr(main, "predict_dish", _raise)
        client = _make_client(monkeypatch, store=store, manager=DummyManager())
        resp = client.post("/predict", json={"dish": "A", "recent_sales": [1], "horizon_days": 1})
        assert resp.status_code == 400

    def test_predict_generic_error_returns_500(self, monkeypatch):
        store = DummyStore(["A"])

        def _raise(**kwargs):
            raise RuntimeError("boom")

        monkeypatch.setattr(main, "predict_dish", _raise)
        client = _make_client(monkeypatch, store=store, manager=DummyManager())
        resp = client.post("/predict", json={"dish": "A", "recent_sales": [1], "horizon_days": 1})
        assert resp.status_code == 500

    def test_predict_no_store_returns_503(self, monkeypatch):
        client = _make_client(monkeypatch, store=None, manager=DummyManager())
        resp = client.post("/predict", json={"dish": "A", "recent_sales": [1], "horizon_days": 1})
        assert resp.status_code == 503


# ===================================================================
# /store/{store_id}/status endpoint
# ===================================================================
class TestStoreStatusEndpoint:
    def test_store_status_with_models(self, monkeypatch):
        manager = DummyManager()
        manager._has_models = True
        manager._store = DummyStore(["A", "B"])
        manager._days_available = 12
        manager._progress = {"trained": 1, "failed": 0, "total": 2, "current_dish": "A"}

        client = _make_client(monkeypatch, store=None, manager=manager)
        resp = client.get("/store/1/status")
        assert resp.status_code == 200
        body = resp.json()
        assert body["has_models"] is True
        assert body["is_training"] is False
        assert body["dishes"] == ["A", "B"]
        assert body["days_available"] == 12
        # Not training, so training_progress should be None
        assert body["training_progress"] is None

    def test_store_status_no_models(self, monkeypatch):
        manager = DummyManager()
        manager._has_models = False
        manager._days_available = 5

        client = _make_client(monkeypatch, store=None, manager=manager)
        resp = client.get("/store/1/status")
        assert resp.status_code == 200
        body = resp.json()
        assert body["has_models"] is False
        assert body["dishes"] is None

    def test_store_status_while_training(self, monkeypatch):
        manager = DummyManager()
        manager._has_models = False
        manager._is_training = True
        manager._progress = {"trained": 2, "failed": 1, "total": 5, "current_dish": "C"}

        client = _make_client(monkeypatch, store=None, manager=manager)
        resp = client.get("/store/1/status")
        assert resp.status_code == 200
        body = resp.json()
        assert body["is_training"] is True
        assert body["training_progress"] is not None
        assert body["training_progress"]["trained"] == 2
        assert body["training_progress"]["current_dish"] == "C"

    def test_store_status_fetch_sales_exception(self, monkeypatch):
        """When fetch_store_sales raises, days_available defaults gracefully."""
        manager = DummyManager()

        def _boom(store_id):
            raise RuntimeError("db error")

        manager.fetch_store_sales = _boom

        client = _make_client(monkeypatch, store=None, manager=manager)
        resp = client.get("/store/99/status")
        assert resp.status_code == 200
        body = resp.json()
        assert body["days_available"] is None


# ===================================================================
# /store/{store_id}/predict endpoint
# ===================================================================
class TestStorePredictEndpoint:
    def test_store_predict_training(self, monkeypatch):
        manager = DummyManager()
        manager._is_training = True
        client = _make_client(monkeypatch, store=None, manager=manager)
        resp = client.post("/store/1/predict", json={"store_id": 1, "horizon_days": 2})
        assert resp.status_code == 200
        assert resp.json()["status"] == "training"

    def test_store_predict_missing_models(self, monkeypatch):
        manager = DummyManager()
        manager._days_available = 7
        client = _make_client(monkeypatch, store=None, manager=manager)
        resp = client.post("/store/2/predict", json={"store_id": 2, "horizon_days": 2})
        assert resp.status_code == 200
        body = resp.json()
        assert body["status"] == "missing_models"
        assert body["days_available"] == 7

    def test_store_predict_ok(self, monkeypatch, tmp_path):
        manager = DummyManager()
        store_dir = tmp_path / "store_1"
        store_dir.mkdir(parents=True, exist_ok=True)
        store = DummyStore(["DishA"], model_dir=str(store_dir))
        manager._store = store
        manager._location = (1.0, 2.0, "US")

        recent_df = pd.DataFrame({"sales": [1.0, 2.0, 3.0]})
        recent_path = store_dir / "recent_sales_DishA.pkl"
        from app.utils.secure_io import secure_dump

        secure_dump(recent_df, recent_path)

        def _predict(**kwargs) -> dict[str, Any]:
            return {
                "dish": kwargs["dish"],
                "model": "xgboost",
                "model_combo": "Prophet+xgboost",
                "horizon_days": kwargs["horizon_days"],
                "start_date": "2024-01-01",
                "predictions": [],
            }

        monkeypatch.setattr(main, "predict_dish", _predict)

        weather_df = pd.DataFrame(
            {
                "date": pd.to_datetime(["2024-01-01", "2024-01-02"]),
                "temperature_2m_max": [20.0, 21.0],
                "temperature_2m_min": [10.0, 11.0],
                "precipitation_sum": [0.0, 0.1],
                "wind_speed_10m_max": [10.0, 10.0],
                "relative_humidity_2m_mean": [60.0, 60.0],
            }
        )
        monkeypatch.setattr(main, "fetch_weather_forecast", lambda **kwargs: weather_df)

        client = _make_client(monkeypatch, store=None, manager=manager)
        resp = client.post("/store/1/predict", json={"store_id": 1, "horizon_days": 2})
        assert resp.status_code == 200
        body = resp.json()
        assert body["status"] == "ok"
        assert "DishA" in body["predictions"]

    def test_store_predict_db_error(self, monkeypatch):
        """When fetch_store_sales raises, returns error status."""
        manager = DummyManager()

        def _boom(store_id):
            raise RuntimeError("db unreachable")

        manager.fetch_store_sales = _boom

        client = _make_client(monkeypatch, store=None, manager=manager)
        resp = client.post("/store/3/predict", json={"store_id": 3, "horizon_days": 2})
        assert resp.status_code == 200
        body = resp.json()
        assert body["status"] == "error"
