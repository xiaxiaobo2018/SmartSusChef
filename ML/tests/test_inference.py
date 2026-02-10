import numpy as np
import pandas as pd
import pytest

import app.inference as inf


class DummyProphet:
    def predict(self, df):
        return pd.DataFrame({"yhat": np.zeros(len(df))})


class DummyTree:
    def predict(self, X):
        return np.zeros(len(X))


def test_model_store_get_dish_model_missing_registry(tmp_path):
    store = inf.ModelStore(model_dir=str(tmp_path))
    with pytest.raises(FileNotFoundError):
        store.load_registry()


def test_model_store_get_dish_model_missing_files(tmp_path, monkeypatch):
    registry = {"DishA": {"model": "xgb"}}
    reg_path = tmp_path / "champion_registry.pkl"
    import joblib

    joblib.dump(registry, reg_path)
    store = inf.ModelStore(model_dir=str(tmp_path))
    store.load_registry()
    with pytest.raises(FileNotFoundError):
        store.get_dish_model("DishA")


def test_prepare_future_weather_with_rows():
    start = pd.Timestamp("2024-01-01")
    rows = [
        {"date": "2024-01-01", "temperature_2m_mean": 10.0, "precipitation_sum": 0.0},
        {"date": "2024-01-02", "temperature_2m_mean": 11.0, "precipitation_sum": 1.0},
    ]
    df = inf._prepare_future_weather(start, 2, 1.0, 2.0, weather_rows=rows)
    assert len(df) == 2
    for col in inf.WEATHER_COLS:
        assert col in df.columns


def test_prepare_future_weather_fallback(monkeypatch):
    def _boom(*args, **kwargs):
        raise RuntimeError("no api")

    monkeypatch.setattr(inf, "_fetch_weather_forecast", _boom)
    start = pd.Timestamp("2024-01-01")
    df = inf._prepare_future_weather(start, 3, 1.0, 2.0, weather_rows=None)
    assert len(df) == 3
    assert all(col in df.columns for col in inf.WEATHER_COLS)


def test_predict_dish_validates_inputs(monkeypatch):
    store = inf.ModelStore(model_dir="models")
    with pytest.raises(ValueError):
        inf.predict_dish(store, "DishA", [], 2)
    with pytest.raises(ValueError):
        inf.predict_dish(store, "DishA", [1.0], 0)


def test_predict_dish_minimal_path(monkeypatch, tmp_path):
    # Prepare minimal models
    registry = {"DishA": {"model": "xgb"}}
    import joblib

    joblib.dump(registry, tmp_path / "champion_registry.pkl")
    joblib.dump(DummyProphet(), tmp_path / "prophet_DishA.pkl")
    joblib.dump(DummyTree(), tmp_path / "xgb_DishA.pkl")

    store = inf.ModelStore(model_dir=str(tmp_path))
    store.load_registry()

    monkeypatch.setattr(inf, "get_location_details", lambda addr: (1.0, 2.0, "US"))
    weather = pd.DataFrame(
        {
            "date": pd.to_datetime(["2024-01-01", "2024-01-02"]),
            "temperature_2m_mean": [20.0, 21.0],
            "precipitation_sum": [0.0, 0.1],
            "wind_speed_10m_max": [10.0, 11.0],
            "relative_humidity_2m_mean": [60.0, 61.0],
        }
    )
    monkeypatch.setattr(inf, "_fetch_weather_forecast", lambda **kwargs: weather)

    out = inf.predict_dish(
        store=store,
        dish="DishA",
        recent_sales=[1.0, 2.0, 3.0],
        horizon_days=2,
        start_date="2024-01-01",
        address="Any",
    )
    assert out["dish"] == "DishA"
    assert out["horizon_days"] == 2
    assert len(out["predictions"]) == 2
