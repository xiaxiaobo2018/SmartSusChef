"""Tests for Final_model_v2.py: caching, hybrid prediction, get_prediction."""

import os
import sys
import tempfile
import unittest
from unittest.mock import patch

import numpy as np
import pandas as pd

from app.utils.secure_io import secure_dump

# Add ML root to sys.path
ML_ROOT = os.path.dirname(os.path.dirname(__file__))
if ML_ROOT not in sys.path:
    sys.path.insert(0, ML_ROOT)

import Final_model_v2 as fm
from training_logic_v2 import WEATHER_COLS, PipelineConfig


class FinalModelV2CacheTests(unittest.TestCase):
    """Tests for _load_cached, _get_location_cached, _get_forecast_cached."""

    def setUp(self):
        fm.clear_model_cache()

    def test_load_cached_uses_cache(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = os.path.join(tmp, "obj.pkl")
            secure_dump({"k": 1}, path)

            call_count = {"n": 0}
            orig_secure_load = fm.secure_load

            def _counting_load(p):
                call_count["n"] += 1
                return orig_secure_load(p)

            with patch.object(fm, "secure_load", side_effect=_counting_load):
                a = fm._load_cached(path)
                b = fm._load_cached(path)

            self.assertEqual(a, {"k": 1})
            self.assertEqual(b, {"k": 1})
            self.assertEqual(call_count["n"], 1)

    def test_get_location_cached_calls_once(self):
        with patch.object(fm, "get_location_details", return_value=(1.0, 2.0, "US")) as mock_geo:
            a = fm._get_location_cached("addr")
            b = fm._get_location_cached("addr")

        self.assertEqual(a, (1.0, 2.0, "US"))
        self.assertEqual(b, (1.0, 2.0, "US"))
        self.assertEqual(mock_geo.call_count, 1)

    def test_get_forecast_cached_calls_once(self):
        df = pd.DataFrame(
            {
                "date": pd.to_datetime(["2024-01-01"]),
                WEATHER_COLS[0]: [1.0],
                WEATHER_COLS[1]: [2.0],
                WEATHER_COLS[2]: [3.0],
                WEATHER_COLS[3]: [4.0],
            }
        )
        with patch.object(fm, "get_weather_forecast", return_value=df) as mock_weather:
            a = fm._get_forecast_cached(1.23456, 2.34567)
            b = fm._get_forecast_cached(1.23456, 2.34567)

        self.assertTrue(a is b)
        self.assertEqual(mock_weather.call_count, 1)

    def test_clear_model_cache(self):
        """clear_model_cache empties all three caches."""
        fm._model_cache["test"] = "val"
        fm._geocode_cache["test"] = "val"
        fm._forecast_cache[(1, 2)] = "val"
        fm.clear_model_cache()
        self.assertEqual(len(fm._model_cache), 0)
        self.assertEqual(len(fm._geocode_cache), 0)
        self.assertEqual(len(fm._forecast_cache), 0)


class FinalModelV2HybridPredictionTests(unittest.TestCase):
    """Tests for _predict_hybrid_multiday."""

    def setUp(self):
        fm.clear_model_cache()

    def test_predict_hybrid_multiday_basic(self):
        # Minimal config to keep features small
        config = PipelineConfig(
            forecast_horizon=2,
            lags=(1,),
            roll_windows=(2,),
            hybrid_tree_features=[
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
                "y_roll_mean_2",
                "y_roll_std_2",
                "prophet_yhat",
            ],
        )

        forecast_weather_df = pd.DataFrame(
            {
                "date": pd.to_datetime(["2024-01-01", "2024-01-02"]),
                WEATHER_COLS[0]: [30.0, 31.0],
                WEATHER_COLS[1]: [20.0, 21.0],
                WEATHER_COLS[2]: [60.0, 61.0],
                WEATHER_COLS[3]: [0.0, 1.0],
            }
        )

        recent_sales_df = pd.DataFrame({"date": pd.to_datetime(["2023-12-31"]), "sales": [10.0]})

        class DummyTree:
            def predict(self, X):
                return np.array([5.0])

        with patch.object(fm, "_prophet_predict", return_value=np.array([10.0])):
            results = fm._predict_hybrid_multiday(
                prophet_model=object(),
                tree_model=DummyTree(),
                forecast_weather_df=forecast_weather_df,
                start_date=pd.Timestamp("2024-01-01"),
                recent_sales_df=recent_sales_df,
                config=config,
                country_code="US",
                dish_mae=2.0,
            )

        self.assertEqual(len(results), 2)
        first = results[0]
        self.assertEqual(first["qty"], 15)
        self.assertEqual(first["lower"], 13)
        self.assertEqual(first["upper"], 17)
        self.assertIn("explanation", first)
        self.assertIn("ProphetTrend", first["explanation"])

    def test_predict_hybrid_multiday_zero_mae(self):
        """When dish_mae is 0, lower == upper == qty."""
        config = PipelineConfig(
            forecast_horizon=1,
            lags=(1,),
            roll_windows=(2,),
            hybrid_tree_features=[
                "day_of_week", "month", "day", "dayofyear", "is_weekend",
                "is_public_holiday",
                "temperature_2m_max", "temperature_2m_min",
                "relative_humidity_2m_mean", "precipitation_sum",
                "y_lag_1", "y_roll_mean_2", "y_roll_std_2",
                "prophet_yhat",
            ],
        )

        forecast_weather_df = pd.DataFrame({
            "date": pd.to_datetime(["2024-01-01"]),
            WEATHER_COLS[0]: [25.0],
            WEATHER_COLS[1]: [15.0],
            WEATHER_COLS[2]: [50.0],
            WEATHER_COLS[3]: [0.0],
        })

        recent_sales_df = pd.DataFrame({"date": pd.to_datetime(["2023-12-31"]), "sales": [8.0]})

        class DummyTree:
            def predict(self, X):
                return np.array([2.0])

        with patch.object(fm, "_prophet_predict", return_value=np.array([5.0])):
            results = fm._predict_hybrid_multiday(
                prophet_model=object(),
                tree_model=DummyTree(),
                forecast_weather_df=forecast_weather_df,
                start_date=pd.Timestamp("2024-01-01"),
                recent_sales_df=recent_sales_df,
                config=config,
                country_code="US",
                dish_mae=0.0,
            )

        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["lower"], results[0]["qty"])
        self.assertEqual(results[0]["upper"], results[0]["qty"])


class FinalModelV2GetPredictionTests(unittest.TestCase):
    """Tests for get_prediction function."""

    def setUp(self):
        fm.clear_model_cache()

    def test_get_prediction_average(self):
        cfg = PipelineConfig()

        def _load(path):
            if "average_" in path:
                return 5
            return {"DishA": {"model": "average"}}

        with (
            patch.object(fm, "_load_cached", _load),
            patch.object(fm, "_get_forecast_cached", lambda lat, lon: pd.DataFrame()),
        ):
            out = fm.get_prediction("DishA", "2024-01-01", "Addr", model="average", config=cfg)

        self.assertEqual(len(out), cfg.forecast_horizon)
        self.assertEqual(out[0]["Model Used"], "AVERAGE")

    def test_get_prediction_missing_forecast(self):
        with patch.object(fm, "_get_forecast_cached", lambda lat, lon: None):
            out = fm.get_prediction("DishA", "2024-01-01", "Addr", model="lightgbm", config=PipelineConfig())
        self.assertIn("Error", out[0])

    def test_get_prediction_hybrid_path(self):
        cfg = PipelineConfig()

        def _load(path):
            if "champion_registry" in path:
                return {"DishA": {"model": "xgboost", "all_mae": {"xgboost": 1.0}}}
            if "recent_sales" in path:
                return pd.DataFrame({"sales": [1.0, 2.0]})
            return None

        weather_df = pd.DataFrame({
            "date": pd.to_datetime(["2024-01-01"]),
            WEATHER_COLS[0]: [1.0],
            WEATHER_COLS[1]: [1.0],
            WEATHER_COLS[2]: [1.0],
            WEATHER_COLS[3]: [1.0],
        })

        with (
            patch.object(fm, "_load_cached", _load),
            patch.object(fm, "_get_forecast_cached", lambda lat, lon: weather_df),
            patch.object(fm, "_load_hybrid_models", lambda dish, model, config: (object(), object())),
            patch.object(
                fm, "_predict_hybrid_multiday",
                lambda **kwargs: [
                    {"date": "2024-01-01", "qty": 1, "lower": 1, "upper": 2, "explanation": {}}
                ],
            ),
        ):
            out = fm.get_prediction("DishA", "2024-01-01", "Addr", model="xgboost", config=cfg)

        self.assertEqual(out[0]["Model Used"], "Prophet+XGBOOST")


if __name__ == "__main__":
    unittest.main()
