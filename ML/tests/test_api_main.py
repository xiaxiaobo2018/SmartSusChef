from typing import Any, Dict, List

import pandas as pd
import pytest
from fastapi.testclient import TestClient

import app.main as main


class DummyStore:
    def __init__(self, dishes: List[str], model_dir: str = "models") -> None:
        self._dishes = dishes
        self.model_dir = model_dir

    def list_dishes(self) -> List[str]:
        return self._dishes


class DummyManager:
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
    main.store = None
    main.manager = None
    if store is not _SENTINEL:
        if store is None:
            def _raise():
                raise FileNotFoundError("no registry")
            monkeypatch.setattr(main, "create_store_from_env", _raise)
        else:
            monkeypatch.setattr(main, "create_store_from_env", lambda: store)
    if manager is not _SENTINEL:
        monkeypatch.setattr(main, "StoreModelManager", lambda *args, **kwargs: manager)
    return TestClient(main.app)


def test_health_with_store(monkeypatch):
    store = DummyStore(["A", "B"])
    manager = DummyManager()
    with _make_client(monkeypatch, store=store, manager=manager) as client:
        resp = client.get("/health")
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "ok"
    assert body["dishes"] == 2
    assert body["manager_ready"] is True


def test_predict_success(monkeypatch):
    store = DummyStore(["A"])
    manager = DummyManager()
    expected = {
        "dish": "A",
        "model": "xgboost",
        "model_combo": "Prophet+xgboost",
        "horizon_days": 2,
        "start_date": "2024-01-01",
        "predictions": [{"date": "2024-01-01", "yhat": 1.0, "prophet_yhat": 1.0, "residual_hat": 0.0}],
    }
    monkeypatch.setattr(main, "predict_dish", lambda **kwargs: expected)
    with _make_client(monkeypatch, store=store, manager=manager) as client:
        resp = client.post("/predict", json={"dish": "A", "recent_sales": [1, 2], "horizon_days": 2})
    assert resp.status_code == 200
    assert resp.json() == expected


def test_predict_keyerror(monkeypatch):
    store = DummyStore(["A"])
    manager = DummyManager()

    def _raise(**kwargs):
        raise KeyError("missing")

    monkeypatch.setattr(main, "predict_dish", _raise)
    with _make_client(monkeypatch, store=store, manager=manager) as client:
        resp = client.post("/predict", json={"dish": "X", "recent_sales": [1], "horizon_days": 1})
    assert resp.status_code == 404


def test_store_status_manager_missing(monkeypatch):
    with _make_client(monkeypatch, store=None, manager=None) as client:
        resp = client.get("/store/1/status")
    assert resp.status_code == 503


def test_store_status_with_models(monkeypatch):
    manager = DummyManager()
    manager._has_models = True
    manager._store = DummyStore(["A", "B"])
    manager._days_available = 12
    manager._progress = {"trained": 1, "failed": 0, "total": 2, "current_dish": "A"}

    with _make_client(monkeypatch, store=None, manager=manager) as client:
        resp = client.get("/store/1/status")
    assert resp.status_code == 200
    body = resp.json()
    assert body["has_models"] is True
    assert body["is_training"] is False
    assert body["dishes"] == ["A", "B"]
    assert body["days_available"] == 12
    assert body["training_progress"] is None


def test_store_predict_training(monkeypatch):
    manager = DummyManager()
    manager._is_training = True
    with _make_client(monkeypatch, store=None, manager=manager) as client:
        resp = client.post("/store/1/predict", json={"store_id": 1, "horizon_days": 2})
    assert resp.status_code == 200
    assert resp.json()["status"] == "training"


def test_store_predict_missing_models(monkeypatch):
    manager = DummyManager()
    manager._days_available = 7
    with _make_client(monkeypatch, store=None, manager=manager) as client:
        resp = client.post("/store/2/predict", json={"store_id": 2, "horizon_days": 2})
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "missing_models"
    assert body["days_available"] == 7


def test_store_predict_ok(monkeypatch, tmp_path):
    manager = DummyManager()
    store_dir = tmp_path / "store_1"
    store_dir.mkdir(parents=True, exist_ok=True)
    store = DummyStore(["DishA"], model_dir=str(store_dir))
    manager._store = store
    manager._location = (1.0, 2.0, "US")

    recent_df = pd.DataFrame({"sales": [1.0, 2.0, 3.0]})
    recent_path = store_dir / "recent_sales_DishA.pkl"
    import joblib
    joblib.dump(recent_df, recent_path)

    def _predict(**kwargs) -> Dict[str, Any]:
        return {
            "dish": kwargs["dish"],
            "model": "xgboost",
            "model_combo": "Prophet+xgboost",
            "horizon_days": kwargs["horizon_days"],
            "start_date": "2024-01-01",
            "predictions": [],
        }

    monkeypatch.setattr(main, "predict_dish", _predict)
    from app import inference as inference_mod

    weather_df = pd.DataFrame(
        {
            "date": pd.to_datetime(["2024-01-01", "2024-01-02"]),
            "temperature_2m_mean": [20.0, 21.0],
            "precipitation_sum": [0.0, 0.1],
            "wind_speed_10m_max": [10.0, 10.0],
            "relative_humidity_2m_mean": [60.0, 60.0],
        }
    )
    monkeypatch.setattr(inference_mod, "_fetch_weather_forecast", lambda **kwargs: weather_df)

    with _make_client(monkeypatch, store=None, manager=manager) as client:
        resp = client.post("/store/1/predict", json={"store_id": 1, "horizon_days": 2})
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "ok"
    assert "DishA" in body["predictions"]
