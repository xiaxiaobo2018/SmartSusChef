# ML/tests/test_unit.py
"""Unit tests for shared utilities: safe_filename, compute_lag_features_from_history,
fetch_weather_forecast, logging_config, and secure_io."""

import hashlib
import logging
from pathlib import Path
from unittest.mock import MagicMock

import numpy as np
import pytest

from app.utils import (
    WEATHER_COLS,
    compute_lag_features_from_history,
    fetch_weather_forecast,
    safe_filename,
)
from app.utils.logging_config import (
    configure_basic_logging,
    setup_logger,
    silence_noisy_loggers,
)
from app.utils.secure_io import _hash_file, _hash_path, secure_dump, secure_load


# ===================================================================
# safe_filename
# ===================================================================
class TestSafeFilename:
    def test_replaces_spaces(self):
        assert safe_filename("Chicken Rice") == "Chicken_Rice"

    def test_replaces_hyphens(self):
        assert safe_filename("Set-A") == "Set_A"

    def test_replaces_slashes(self):
        assert safe_filename("A/B") == "A_B"

    def test_combined_special_chars(self):
        assert safe_filename("Chicken Rice/Set-1") == "Chicken_Rice_Set_1"

    def test_no_special_chars(self):
        assert safe_filename("DishA") == "DishA"

    def test_empty_string(self):
        assert safe_filename("") == ""

    def test_multiple_consecutive_specials(self):
        assert safe_filename("A--B//C  D") == "A__B__C__D"


# ===================================================================
# compute_lag_features_from_history
# ===================================================================
class TestComputeLagFeaturesFromHistory:
    def test_basic_lag_features(self):
        history = list(range(1, 30))  # [1, 2, ..., 29]
        features = compute_lag_features_from_history(history)
        assert features["y_lag_1"] == 29.0
        assert features["y_lag_7"] == 23.0
        assert features["y_lag_14"] == 16.0

    def test_rolling_mean_and_std(self):
        history = [10.0, 20.0, 30.0, 40.0, 50.0, 60.0, 70.0]
        features = compute_lag_features_from_history(history, lags=(1,), roll_windows=(7,))
        assert features["y_lag_1"] == 70.0
        assert features["y_roll_mean_7"] == pytest.approx(40.0)
        # std(ddof=1) of [10, 20, 30, 40, 50, 60, 70]
        assert features["y_roll_std_7"] == pytest.approx(
            np.std([10, 20, 30, 40, 50, 60, 70], ddof=1)
        )

    def test_short_history_uses_fallback(self):
        """When history is shorter than lag, the fallback (last value) is used."""
        history = [5.0, 10.0]
        features = compute_lag_features_from_history(history, lags=(1, 7), roll_windows=(7,))
        assert features["y_lag_1"] == 10.0
        # lag 7 > len(history), so fallback to last value
        assert features["y_lag_7"] == 10.0
        # rolling window 7 > len(history), so uses full history
        assert features["y_roll_mean_7"] == pytest.approx(7.5)

    def test_single_element_history(self):
        features = compute_lag_features_from_history([42.0], lags=(1,), roll_windows=(3,))
        assert features["y_lag_1"] == 42.0
        assert features["y_roll_mean_3"] == 42.0
        # Only 1 element, std should be 0.0
        assert features["y_roll_std_3"] == 0.0

    def test_custom_lags_and_windows(self):
        history = [1.0, 2.0, 3.0, 4.0, 5.0]
        features = compute_lag_features_from_history(history, lags=(2, 4), roll_windows=(3,))
        assert features["y_lag_2"] == 4.0
        assert features["y_lag_4"] == 2.0
        assert features["y_roll_mean_3"] == pytest.approx(4.0)

    def test_default_lags_and_windows(self):
        history = list(range(1, 30))
        features = compute_lag_features_from_history(history)
        # Verify default keys exist
        for lag in (1, 7, 14):
            assert f"y_lag_{lag}" in features
        for w in (7, 14, 28):
            assert f"y_roll_mean_{w}" in features
            assert f"y_roll_std_{w}" in features

    def test_empty_history_edge_case(self):
        """Empty history returns fallback of 0.0 for lags and rolling stats."""
        features = compute_lag_features_from_history([], lags=(1,), roll_windows=(2,))
        assert features["y_lag_1"] == 0.0
        assert features["y_roll_mean_2"] == 0.0
        assert features["y_roll_std_2"] == 0.0


# ===================================================================
# fetch_weather_forecast (mocked API)
# ===================================================================
class TestFetchWeatherForecast:
    def test_returns_none_when_libs_unavailable(self, monkeypatch):
        """When openmeteo_requests or retry is None, return None."""
        import app.utils as utils_mod

        monkeypatch.setattr(utils_mod, "openmeteo_requests", None)
        monkeypatch.setattr(utils_mod, "retry", None)
        result = fetch_weather_forecast(1.0, 2.0)
        assert result is None

    def test_successful_api_call(self, monkeypatch):
        """Verify DataFrame structure from a mocked API response."""
        import app.utils as utils_mod

        mock_values = np.array([20.0, 21.0])

        class MockVariable:
            def ValuesAsNumpy(self):
                return mock_values

        class MockDaily:
            def Time(self):
                return 1704067200  # 2024-01-01 UTC

            def TimeEnd(self):
                return 1704240000  # 2024-01-03 UTC

            def Interval(self):
                return 86400

            def Variables(self, i):
                return MockVariable()

        class MockResponse:
            def Daily(self):
                return MockDaily()

        class MockClient:
            def __init__(self, session=None):
                pass

            def weather_api(self, url, params=None):
                return [MockResponse()]

        mock_retry = MagicMock(return_value=MagicMock())
        mock_openmeteo = MagicMock()
        mock_openmeteo.Client = MockClient

        monkeypatch.setattr(utils_mod, "openmeteo_requests", mock_openmeteo)
        monkeypatch.setattr(utils_mod, "retry", mock_retry)

        result = fetch_weather_forecast(1.0, 2.0, forecast_days=2)
        assert result is not None
        assert "date" in result.columns
        for col in WEATHER_COLS:
            assert col in result.columns

    def test_api_exception_returns_none(self, monkeypatch):
        """When the API raises, return None."""
        import app.utils as utils_mod

        class MockClient:
            def __init__(self, session=None):
                pass

            def weather_api(self, url, params=None):
                raise ConnectionError("API unreachable")

        mock_retry = MagicMock(return_value=MagicMock())
        mock_openmeteo = MagicMock()
        mock_openmeteo.Client = MockClient

        monkeypatch.setattr(utils_mod, "openmeteo_requests", mock_openmeteo)
        monkeypatch.setattr(utils_mod, "retry", mock_retry)

        result = fetch_weather_forecast(1.0, 2.0)
        assert result is None

    def test_forecast_days_clamped(self, monkeypatch):
        """forecast_days is clamped to [1, 16]."""
        import app.utils as utils_mod

        captured_params = {}

        class MockClient:
            def __init__(self, session=None):
                pass

            def weather_api(self, url, params=None):
                captured_params.update(params)
                raise RuntimeError("stop here")

        mock_retry = MagicMock(return_value=MagicMock())
        mock_openmeteo = MagicMock()
        mock_openmeteo.Client = MockClient

        monkeypatch.setattr(utils_mod, "openmeteo_requests", mock_openmeteo)
        monkeypatch.setattr(utils_mod, "retry", mock_retry)

        # Request 100 days -> clamped to 16
        fetch_weather_forecast(1.0, 2.0, forecast_days=100)
        assert captured_params["forecast_days"] == 16

        captured_params.clear()
        fetch_weather_forecast(1.0, 2.0, forecast_days=-5)
        assert captured_params["forecast_days"] == 1


# ===================================================================
# setup_logger (logging_config)
# ===================================================================
class TestSetupLogger:
    def test_returns_logger_with_correct_name(self):
        lgr = setup_logger("test_unit_logger_name")
        assert lgr.name == "test_unit_logger_name"
        assert lgr.level == logging.INFO

    def test_sets_custom_level(self):
        lgr = setup_logger("test_debug_logger", level=logging.DEBUG)
        assert lgr.level == logging.DEBUG

    def test_adds_handler_only_once(self):
        name = "test_handler_once"
        # Clear any prior handlers
        existing = logging.getLogger(name)
        existing.handlers.clear()

        lgr1 = setup_logger(name)
        n_handlers = len(lgr1.handlers)
        lgr2 = setup_logger(name)
        assert len(lgr2.handlers) == n_handlers  # Should not add another

    def test_handler_is_stream_handler(self):
        name = "test_stream_handler"
        existing = logging.getLogger(name)
        existing.handlers.clear()

        lgr = setup_logger(name)
        assert len(lgr.handlers) >= 1
        assert isinstance(lgr.handlers[0], logging.StreamHandler)


class TestSilenceNoisyLoggers:
    def test_silences_prophet_loggers(self):
        silence_noisy_loggers()
        for name in ("cmdstanpy", "prophet", "stan", "pystan"):
            lgr = logging.getLogger(name)
            assert lgr.level == logging.ERROR
            assert lgr.propagate is False
            assert lgr.disabled is True


class TestConfigureBasicLogging:
    def test_does_not_raise(self):
        """Smoke test -- should not raise."""
        configure_basic_logging(level=logging.WARNING)


# ===================================================================
# secure_io: secure_dump and secure_load
# ===================================================================
class TestSecureIO:
    def test_secure_dump_creates_pkl_and_hash(self, tmp_path):
        obj = {"key": "value", "nums": [1, 2, 3]}
        pkl_path = tmp_path / "test_obj.pkl"
        secure_dump(obj, pkl_path)

        assert pkl_path.exists()
        hash_path = pkl_path.with_suffix(".pkl.sha256")
        assert hash_path.exists()

        # Verify the hash file content matches actual file hash
        actual_hash = _hash_file(pkl_path)
        stored_hash = hash_path.read_text(encoding="utf-8").strip()
        assert actual_hash == stored_hash

    def test_secure_load_integrity_passes(self, tmp_path):
        obj = {"data": [1, 2, 3]}
        pkl_path = tmp_path / "good.pkl"
        secure_dump(obj, pkl_path)

        loaded = secure_load(pkl_path)
        assert loaded == obj

    def test_secure_load_integrity_fails_on_tampered_file(self, tmp_path):
        obj = {"secret": "safe"}
        pkl_path = tmp_path / "tampered.pkl"
        secure_dump(obj, pkl_path)

        # Tamper with the pkl file by appending garbage
        with open(pkl_path, "ab") as f:
            f.write(b"TAMPERED")

        with pytest.raises(RuntimeError, match="Integrity check failed"):
            secure_load(pkl_path)

    def test_secure_load_integrity_fails_on_tampered_hash(self, tmp_path):
        obj = {"key": 42}
        pkl_path = tmp_path / "bad_hash.pkl"
        secure_dump(obj, pkl_path)

        # Overwrite hash with wrong value
        hash_path = _hash_path(pkl_path)
        hash_path.write_text(
            "0000000000000000000000000000000000000000000000000000000000000000", encoding="utf-8"
        )

        with pytest.raises(RuntimeError, match="Integrity check failed"):
            secure_load(pkl_path)

    def test_secure_load_no_hash_file_warns(self, tmp_path, caplog):
        """When no companion hash file exists, load proceeds with a warning."""
        import joblib

        pkl_path = tmp_path / "no_hash.pkl"
        joblib.dump({"x": 1}, str(pkl_path))

        # Hash file should not exist
        assert not _hash_path(pkl_path).exists()

        with caplog.at_level(logging.WARNING):
            loaded = secure_load(pkl_path)

        assert loaded == {"x": 1}
        assert any("No SHA-256 hash file" in msg for msg in caplog.messages)

    def test_hash_path_suffix(self):
        p = Path("/some/dir/model.pkl")
        assert _hash_path(p) == Path("/some/dir/model.pkl.sha256")

    def test_hash_file_deterministic(self, tmp_path):
        """Same content produces same hash."""
        path = tmp_path / "det.bin"
        path.write_bytes(b"hello world")
        h1 = _hash_file(path)
        h2 = _hash_file(path)
        assert h1 == h2
        assert h1 == hashlib.sha256(b"hello world").hexdigest()

    def test_round_trip_complex_object(self, tmp_path):
        """Test secure_dump/secure_load with numpy arrays."""
        import numpy as np

        obj = {"arr": np.array([1.0, 2.0, 3.0]), "label": "test"}
        pkl_path = tmp_path / "complex.pkl"
        secure_dump(obj, pkl_path)
        loaded = secure_load(pkl_path)
        np.testing.assert_array_equal(loaded["arr"], obj["arr"])
        assert loaded["label"] == "test"
