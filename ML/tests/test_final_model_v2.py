import os
import sys
import tempfile
import unittest
from unittest.mock import patch

import joblib
import numpy as np
import pandas as pd

# Add ML root to sys.path
ML_ROOT = os.path.dirname(os.path.dirname(__file__))
if ML_ROOT not in sys.path:
    sys.path.insert(0, ML_ROOT)

import Final_model_v2 as fm
from training_logic_v2 import WEATHER_COLS, PipelineConfig


class FinalModelV2Tests(unittest.TestCase):
    def setUp(self):
        fm.clear_model_cache()

    def test_load_cached_uses_cache(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = os.path.join(tmp, "obj.pkl")
            joblib.dump({"k": 1}, path)

            call_count = {"n": 0}
            real_load = fm.joblib.load

            def _counting_load(p):
                call_count["n"] += 1
                return real_load(p)

            with patch.object(fm.joblib, "load", side_effect=_counting_load):
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
        df = pd.DataFrame({
            "date": pd.to_datetime(["2024-01-01"]),
            WEATHER_COLS[0]: [1.0],
            WEATHER_COLS[1]: [2.0],
            WEATHER_COLS[2]: [3.0],
            WEATHER_COLS[3]: [4.0],
        })
        with patch.object(fm, "get_weather_forecast", return_value=df) as mock_weather:
            a = fm._get_forecast_cached(1.23456, 2.34567)
            b = fm._get_forecast_cached(1.23456, 2.34567)

        self.assertTrue(a is b)
        self.assertEqual(mock_weather.call_count, 1)

    def test_predict_hybrid_multiday_basic(self):
        # Minimal config to keep features small
        config = PipelineConfig(
            forecast_horizon=2,
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
            "date": pd.to_datetime(["2024-01-01", "2024-01-02"]),
            WEATHER_COLS[0]: [30.0, 31.0],
            WEATHER_COLS[1]: [20.0, 21.0],
            WEATHER_COLS[2]: [60.0, 61.0],
            WEATHER_COLS[3]: [0.0, 1.0],
        })

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


if __name__ == "__main__":
    unittest.main()
