import os
import sys
import unittest
from unittest.mock import patch

import pandas as pd

# Add ML root to sys.path
ML_ROOT = os.path.dirname(os.path.dirname(__file__))
if ML_ROOT not in sys.path:
    sys.path.insert(0, ML_ROOT)

from training_logic_v2 import (
    WEATHER_COLS,
    PipelineConfig,
    _add_date_features,
    _add_lag_roll_features,
    add_local_context,
    compute_lag_features_from_history,
    safe_filename,
    sanitize_sparse_data,
)


class TrainingLogicV2Tests(unittest.TestCase):
    def test_safe_filename(self):
        self.assertEqual(safe_filename("Chicken Rice/Set-1"), "Chicken_Rice_Set_1")

    def test_add_date_features_respects_config(self):
        df = pd.DataFrame({"date": pd.to_datetime(["2024-01-01", "2024-01-06"])})
        config = PipelineConfig(time_features=["day_of_week", "is_weekend"])
        out = _add_date_features(df, config)

        self.assertIn("day_of_week", out.columns)
        self.assertIn("is_weekend", out.columns)
        self.assertNotIn("month", out.columns)

        # 2024-01-01 is Monday (0), 2024-01-06 is Saturday (5)
        self.assertEqual(out.loc[0, "day_of_week"], 0)
        self.assertEqual(out.loc[1, "is_weekend"], 1)

    def test_add_lag_roll_features(self):
        df = pd.DataFrame({"sales": [1, 2, 3, 4]})
        config = PipelineConfig(lags=(1, 2), roll_windows=(2,))
        out = _add_lag_roll_features(df, config)

        self.assertAlmostEqual(out.loc[3, "y_lag_1"], 3)
        self.assertAlmostEqual(out.loc[3, "y_lag_2"], 2)
        self.assertAlmostEqual(out.loc[3, "y_roll_mean_2"], 2.5)
        self.assertAlmostEqual(out.loc[3, "y_roll_std_2"], 0.707106, places=5)

    def test_compute_lag_features_from_history(self):
        config = PipelineConfig(lags=(1, 3), roll_windows=(2, 4))
        feats = compute_lag_features_from_history([5, 7], config)

        self.assertEqual(feats["y_lag_1"], 7.0)
        self.assertEqual(feats["y_lag_3"], 0.0)
        self.assertAlmostEqual(feats["y_roll_mean_2"], 6.0)
        self.assertAlmostEqual(feats["y_roll_std_2"], 1.414213, places=5)
        self.assertAlmostEqual(feats["y_roll_mean_4"], 6.0)
        self.assertAlmostEqual(feats["y_roll_std_4"], 1.414213, places=5)

    def test_sanitize_sparse_data_fills_dates(self):
        df = pd.DataFrame({
            "date": pd.to_datetime(["2024-01-01", "2024-01-03"]),
            "sales": [0.0, 2.0],
            "dish": ["A", "A"],
        })
        out = sanitize_sparse_data(df, "US")

        self.assertEqual(len(out), 3)
        # Middle day interpolated to 1.0
        mid = out.loc[out["date"] == pd.Timestamp("2024-01-02"), "sales"].iloc[0]
        self.assertAlmostEqual(mid, 1.0)

        for col in WEATHER_COLS:
            self.assertIn(col, out.columns)
            self.assertTrue((out[col] == 0.0).all())

        self.assertIn("is_public_holiday", out.columns)
        self.assertIn("day_of_week", out.columns)
        self.assertIn("month", out.columns)

    def test_add_local_context_fallbacks_when_weather_missing(self):
        df = pd.DataFrame({"date": pd.to_datetime(["2024-01-01", "2024-01-02"]), "sales": [1, 2]})
        config = PipelineConfig()

        with patch("training_logic_v2.get_location_details", return_value=(None, None, None)), \
             patch("training_logic_v2.fetch_weather_from_db", return_value=None), \
             patch("training_logic_v2.get_historical_weather", return_value=None):
            out, country, lat, lon = add_local_context(df, "BadAddress", config=config)

        self.assertEqual(country, config.default_fallback_country)
        self.assertEqual(lat, config.default_fallback_lat)
        self.assertEqual(lon, config.default_fallback_lon)

        for col in WEATHER_COLS:
            self.assertIn(col, out.columns)
            self.assertTrue((out[col] == 0.0).all())


if __name__ == "__main__":
    unittest.main()
