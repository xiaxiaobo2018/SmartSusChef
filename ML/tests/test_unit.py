# ML/tests/test_unit.py
import pytest
from app.inference import _compute_lag_features_from_history


def test_compute_lag_features_from_history():
    # Example unit test placeholder
    sales_history = [10.0, 12.0, 15.0, 13.0, 11.0, 14.0, 16.0, 17.0, 18.0, 19.0, 20.0, 21.0, 22.0, 23.0]
    features = _compute_lag_features_from_history(sales_history)
    assert "y_lag_1" in features
    assert features["y_lag_1"] == 23.0  # Check the most recent lag
