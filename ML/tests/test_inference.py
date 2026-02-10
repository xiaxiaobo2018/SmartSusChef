"""Tests for app.inference module: ModelStore, weather fallback, prediction pipeline."""

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


# ===================================================================
# ModelStore
# ===================================================================
class TestModelStore:
    def test_missing_registry_raises(self, tmp_path):
        store = inf.ModelStore(model_dir=str(tmp_path))
        with pytest.raises(FileNotFoundError):
            store.load_registry()

    def test_missing_model_files_raises(self, tmp_path):
        registry = {"DishA": {"model": "xgb"}}
        reg_path = tmp_path / "champion_registry.pkl"
        from app.utils.secure_io import secure_dump

        secure_dump(registry, reg_path)
        store = inf.ModelStore(model_dir=str(tmp_path))
        store.load_registry()
        with pytest.raises(FileNotFoundError):
            store.get_dish_model("DishA")

    def test_list_dishes_from_registry(self, tmp_path):
        from app.utils.secure_io import secure_dump

        registry = {"Banana": {"model": "xgb"}, "Apple": {"model": "lgb"}}
        secure_dump(registry, tmp_path / "champion_registry.pkl")
        store = inf.ModelStore(model_dir=str(tmp_path))
        store.load_registry()
        assert store.list_dishes() == ["Apple", "Banana"]  # sorted

    def test_get_dish_model_unknown_dish(self, tmp_path):
        from app.utils.secure_io import secure_dump

        registry = {"DishA": {"model": "xgb"}}
        secure_dump(registry, tmp_path / "champion_registry.pkl")
        store = inf.ModelStore(model_dir=str(tmp_path))
        store.load_registry()
        with pytest.raises(KeyError, match="Dish not found"):
            store.get_dish_model("UnknownDish")


# ===================================================================
# _weather_fallback_df
# ===================================================================
class TestWeatherFallbackDf:
    def test_returns_correct_columns(self):
        dates = pd.date_range("2024-01-01", periods=3, freq="D")
        df = inf._weather_fallback_df(dates)
        assert len(df) == 3
        assert "date" in df.columns
        for col in inf.WEATHER_COLS:
            assert col in df.columns

    def test_uses_configured_defaults(self):
        dates = pd.date_range("2024-06-01", periods=2, freq="D")
        df = inf._weather_fallback_df(dates)
        assert df["temperature_2m_max"].iloc[0] == inf.WEATHER_FALLBACK["temperature_2m_max"]
        assert df["temperature_2m_min"].iloc[0] == inf.WEATHER_FALLBACK["temperature_2m_min"]
        assert df["relative_humidity_2m_mean"].iloc[0] == inf.WEATHER_FALLBACK["relative_humidity_2m_mean"]
        assert df["precipitation_sum"].iloc[0] == inf.WEATHER_FALLBACK["precipitation_sum"]

    def test_fallback_values_match_weather_fallback_dict(self):
        """Ensure all WEATHER_COLS have an entry in WEATHER_FALLBACK."""
        for col in inf.WEATHER_COLS:
            assert col in inf.WEATHER_FALLBACK

    def test_single_date(self):
        dates = pd.DatetimeIndex([pd.Timestamp("2024-01-01")])
        df = inf._weather_fallback_df(dates)
        assert len(df) == 1


# ===================================================================
# _prepare_future_weather
# ===================================================================
class TestPrepareFutureWeather:
    def test_with_explicit_weather_rows(self):
        start = pd.Timestamp("2024-01-01")
        rows = [
            {"date": "2024-01-01", "temperature_2m_max": 10.0, "precipitation_sum": 0.0},
            {"date": "2024-01-02", "temperature_2m_max": 11.0, "precipitation_sum": 1.0},
        ]
        df = inf._prepare_future_weather(start, 2, 1.0, 2.0, weather_rows=rows)
        assert len(df) == 2
        for col in inf.WEATHER_COLS:
            assert col in df.columns

    def test_api_exception_falls_back(self, monkeypatch):
        """When fetch_weather_forecast raises, fallback values are used."""

        def _boom(latitude, longitude, forecast_days=16):
            raise RuntimeError("no api")

        monkeypatch.setattr(inf, "fetch_weather_forecast", _boom)
        start = pd.Timestamp("2024-01-01")
        df = inf._prepare_future_weather(start, 3, 1.0, 2.0, weather_rows=None)
        assert len(df) == 3
        assert all(col in df.columns for col in inf.WEATHER_COLS)
        # Verify fallback values are used
        assert df["temperature_2m_max"].iloc[0] == inf.WEATHER_FALLBACK["temperature_2m_max"]

    def test_api_returns_none_falls_back(self, monkeypatch):
        """When fetch_weather_forecast returns None, fallback values are used."""
        monkeypatch.setattr(inf, "fetch_weather_forecast", lambda *a, **kw: None)
        start = pd.Timestamp("2024-01-01")
        df = inf._prepare_future_weather(start, 2, 1.0, 2.0, weather_rows=None)
        assert len(df) == 2
        assert df["precipitation_sum"].iloc[0] == inf.WEATHER_FALLBACK["precipitation_sum"]

    def test_missing_columns_filled(self):
        """If weather_rows lack some WEATHER_COLS, they are filled from WEATHER_FALLBACK."""
        start = pd.Timestamp("2024-01-01")
        rows = [
            {"date": "2024-01-01", "temperature_2m_max": 30.0},
        ]
        df = inf._prepare_future_weather(start, 1, 1.0, 2.0, weather_rows=rows)
        # Missing columns should be filled
        for col in inf.WEATHER_COLS:
            assert col in df.columns

    def test_insufficient_dates_filled(self, monkeypatch):
        """If forecast has fewer dates than horizon, missing dates are filled."""
        # Return forecast for only 1 day when we need 3
        forecast_df = pd.DataFrame({
            "date": pd.to_datetime(["2024-01-01"]),
            "temperature_2m_max": [25.0],
            "temperature_2m_min": [15.0],
            "relative_humidity_2m_mean": [60.0],
            "precipitation_sum": [0.0],
        })
        monkeypatch.setattr(
            inf, "fetch_weather_forecast",
            lambda latitude, longitude, forecast_days=16: forecast_df,
        )
        start = pd.Timestamp("2024-01-01")
        df = inf._prepare_future_weather(start, 3, 1.0, 2.0, weather_rows=None)
        assert len(df) == 3

    def test_empty_forecast_falls_back(self, monkeypatch):
        """If forecast returns empty DataFrame, fallback values are used."""
        monkeypatch.setattr(
            inf, "fetch_weather_forecast",
            lambda latitude, longitude, forecast_days=16: pd.DataFrame(),
        )
        start = pd.Timestamp("2024-01-01")
        df = inf._prepare_future_weather(start, 2, 1.0, 2.0, weather_rows=None)
        assert len(df) == 2


# ===================================================================
# predict_dish input validation
# ===================================================================
class TestPredictDishValidation:
    def test_empty_sales_raises(self):
        store = inf.ModelStore(model_dir="models")
        with pytest.raises(ValueError, match="recent_sales cannot be empty"):
            inf.predict_dish(store, "DishA", [], 2)

    def test_zero_horizon_raises(self):
        store = inf.ModelStore(model_dir="models")
        with pytest.raises(ValueError, match="horizon_days must be in"):
            inf.predict_dish(store, "DishA", [1.0], 0)

    def test_negative_horizon_raises(self):
        store = inf.ModelStore(model_dir="models")
        with pytest.raises(ValueError):
            inf.predict_dish(store, "DishA", [1.0], -1)

    def test_over_30_horizon_raises(self):
        store = inf.ModelStore(model_dir="models")
        with pytest.raises(ValueError):
            inf.predict_dish(store, "DishA", [1.0], 31)


# ===================================================================
# predict_dish end-to-end with mocked models
# ===================================================================
class TestPredictDishMinimal:
    def test_predict_dish_minimal_path(self, monkeypatch, tmp_path):
        """Full predict_dish pipeline with minimal mocked models."""
        registry = {"DishA": {"model": "xgb"}}
        from app.utils.secure_io import secure_dump

        secure_dump(registry, tmp_path / "champion_registry.pkl")
        secure_dump(DummyProphet(), tmp_path / "prophet_DishA.pkl")
        secure_dump(DummyTree(), tmp_path / "xgb_DishA.pkl")

        store = inf.ModelStore(model_dir=str(tmp_path))
        store.load_registry()

        monkeypatch.setattr(inf, "get_location_details", lambda addr: (1.0, 2.0, "US"))
        weather = pd.DataFrame(
            {
                "date": pd.to_datetime(["2024-01-01", "2024-01-02"]),
                "temperature_2m_max": [20.0, 21.0],
                "temperature_2m_min": [10.0, 11.0],
                "precipitation_sum": [0.0, 0.1],
                "wind_speed_10m_max": [10.0, 11.0],
                "relative_humidity_2m_mean": [60.0, 61.0],
            }
        )
        monkeypatch.setattr(
            inf, "fetch_weather_forecast",
            lambda latitude, longitude, forecast_days=16: weather,
        )

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
        assert out["model_combo"] == "Prophet+xgb"

    def test_predict_dish_with_lat_lon_country(self, monkeypatch, tmp_path):
        """When lat/lon/country_code are provided, geocoding is skipped."""
        registry = {"DishB": {"model": "xgb"}}
        from app.utils.secure_io import secure_dump

        secure_dump(registry, tmp_path / "champion_registry.pkl")
        secure_dump(DummyProphet(), tmp_path / "prophet_DishB.pkl")
        secure_dump(DummyTree(), tmp_path / "xgb_DishB.pkl")

        store = inf.ModelStore(model_dir=str(tmp_path))
        store.load_registry()

        weather = pd.DataFrame(
            {
                "date": pd.to_datetime(["2024-03-01"]),
                "temperature_2m_max": [25.0],
                "temperature_2m_min": [15.0],
                "precipitation_sum": [0.0],
                "relative_humidity_2m_mean": [55.0],
            }
        )
        monkeypatch.setattr(
            inf, "fetch_weather_forecast",
            lambda latitude, longitude, forecast_days=16: weather,
        )

        out = inf.predict_dish(
            store=store,
            dish="DishB",
            recent_sales=[5.0, 6.0],
            horizon_days=1,
            start_date="2024-03-01",
            latitude=31.0,
            longitude=121.0,
            country_code="CN",
        )
        assert out["dish"] == "DishB"
        assert len(out["predictions"]) == 1
