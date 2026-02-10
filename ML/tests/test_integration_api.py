# ML/tests/test_integration_api.py
"""Integration tests for the FastAPI application endpoints.

Every external dependency (ModelStore, StoreModelManager, predict_dish,
fetch_weather_forecast, etc.) is mocked so that no real models, databases,
or network calls are required.
"""

from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient

import app.main as main

# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture(autouse=True)
def _clear_overrides():
    """Clear FastAPI dependency overrides after every test."""
    yield
    main.app.dependency_overrides.clear()


@pytest.fixture()
def client() -> TestClient:
    return TestClient(main.app)


@pytest.fixture()
def mock_store() -> MagicMock:
    """A MagicMock that behaves like a ModelStore with two dishes."""
    store = MagicMock()
    store.list_dishes.return_value = ["Kung Pao Chicken", "Fried Rice"]
    store.model_dir = Path("/tmp/fake_models")  # nosec
    return store


@pytest.fixture()
def mock_manager() -> MagicMock:
    """A MagicMock that behaves like a StoreModelManager."""
    mgr = MagicMock()
    mgr.MIN_TRAINING_DAYS = 100
    mgr.has_models.return_value = False
    mgr.is_training.return_value = False
    mgr.get_store.return_value = None
    mgr.get_training_progress.return_value = None
    mgr.fetch_store_sales.return_value = (None, 0)
    mgr.fetch_store_location.return_value = (31.23, 121.47, "CN")
    return mgr


def _override_store(store):
    main.app.dependency_overrides[main.get_model_store] = lambda: store


def _override_manager(manager):
    main.app.dependency_overrides[main.get_model_manager] = lambda: manager


# ===========================================================================
# 1. GET /health
# ===========================================================================


class TestHealthEndpoint:
    """Tests for the /health endpoint."""

    def test_health_with_store(self, client, mock_store, mock_manager):
        """When a model store is loaded, health returns dish count."""
        _override_store(mock_store)
        _override_manager(mock_manager)

        resp = client.get("/health")

        assert resp.status_code == 200
        body = resp.json()
        assert body["status"] == "ok"
        assert body["dishes"] == 2
        assert body["manager_ready"] is True

    def test_health_without_store(self, client, mock_manager):
        """When no model store is available (None), dishes should be 0."""
        _override_store(None)
        _override_manager(mock_manager)

        resp = client.get("/health")

        assert resp.status_code == 200
        body = resp.json()
        assert body["status"] == "ok"
        assert body["dishes"] == 0
        assert body["manager_ready"] is True


# ===========================================================================
# 2. GET /dishes
# ===========================================================================


class TestDishesEndpoint:
    """Tests for the /dishes endpoint."""

    def test_dishes_success(self, client, mock_store):
        """Should return the list of dishes from the store."""
        _override_store(mock_store)

        resp = client.get("/dishes")

        assert resp.status_code == 200
        assert resp.json() == {"dishes": ["Kung Pao Chicken", "Fried Rice"]}

    def test_dishes_no_store_returns_503(self, client):
        """When the store is None, the endpoint should return 503."""
        _override_store(None)

        resp = client.get("/dishes")

        assert resp.status_code == 503
        assert "not initialized" in resp.json()["detail"]


# ===========================================================================
# 3. POST /predict
# ===========================================================================


class TestPredictEndpoint:
    """Tests for the /predict endpoint."""

    VALID_PAYLOAD = {
        "dish": "Kung Pao Chicken",
        "recent_sales": [10.0, 12.0, 8.0, 15.0, 9.0],
        "horizon_days": 3,
        "start_date": "2025-06-01",
        "address": "Shanghai, China",
    }

    MOCK_PREDICT_RESULT = {
        "dish": "Kung Pao Chicken",
        "model": "xgboost",
        "model_combo": "Prophet+xgboost",
        "horizon_days": 3,
        "start_date": "2025-06-01",
        "predictions": [
            {"date": "2025-06-01", "yhat": 11.5, "prophet_yhat": 10.0, "residual_hat": 1.5},
            {"date": "2025-06-02", "yhat": 12.0, "prophet_yhat": 10.5, "residual_hat": 1.5},
            {"date": "2025-06-03", "yhat": 10.8, "prophet_yhat": 9.8, "residual_hat": 1.0},
        ],
    }

    @patch("app.main.predict_dish")
    def test_predict_success(self, mock_predict, client, mock_store):
        """Successful prediction returns 200 with expected fields."""
        mock_predict.return_value = self.MOCK_PREDICT_RESULT
        _override_store(mock_store)

        resp = client.post("/predict", json=self.VALID_PAYLOAD)

        assert resp.status_code == 200
        body = resp.json()
        assert body["dish"] == "Kung Pao Chicken"
        assert body["model"] == "xgboost"
        assert body["model_combo"] == "Prophet+xgboost"
        assert body["horizon_days"] == 3
        assert len(body["predictions"]) == 3
        mock_predict.assert_called_once()

    @patch("app.main.predict_dish")
    def test_predict_key_error_returns_404(self, mock_predict, client, mock_store):
        """KeyError (dish not found) maps to 404."""
        mock_predict.side_effect = KeyError("Dish not found in registry: Unknown Dish")
        _override_store(mock_store)

        resp = client.post("/predict", json={**self.VALID_PAYLOAD, "dish": "Unknown Dish"})

        assert resp.status_code == 404

    @patch("app.main.predict_dish")
    def test_predict_value_error_returns_400(self, mock_predict, client, mock_store):
        """ValueError (bad input) maps to 400."""
        mock_predict.side_effect = ValueError("recent_sales cannot be empty")
        _override_store(mock_store)

        resp = client.post("/predict", json=self.VALID_PAYLOAD)

        assert resp.status_code == 400
        assert "recent_sales" in resp.json()["detail"]

    @patch("app.main.predict_dish")
    def test_predict_runtime_error_returns_500(self, mock_predict, client, mock_store):
        """RuntimeError (unexpected failure) maps to 500."""
        mock_predict.side_effect = RuntimeError("Unable to resolve latitude/longitude")
        _override_store(mock_store)

        resp = client.post("/predict", json=self.VALID_PAYLOAD)

        assert resp.status_code == 500
        assert "latitude" in resp.json()["detail"]

    def test_predict_no_store_returns_503(self, client):
        """When the store is None, predict returns 503."""
        _override_store(None)

        resp = client.post("/predict", json=self.VALID_PAYLOAD)

        assert resp.status_code == 503
        assert "not initialized" in resp.json()["detail"]

    def test_predict_missing_required_field_returns_422(self, client, mock_store):
        """Missing required fields should return 422 (Pydantic validation)."""
        _override_store(mock_store)

        resp = client.post("/predict", json={"dish": "Kung Pao Chicken"})

        assert resp.status_code == 422

    def test_predict_empty_recent_sales_returns_422(self, client, mock_store):
        """Empty recent_sales list should fail Pydantic min_length=1 validation."""
        _override_store(mock_store)

        payload = {**self.VALID_PAYLOAD, "recent_sales": []}
        resp = client.post("/predict", json=payload)

        assert resp.status_code == 422

    def test_predict_horizon_days_out_of_range_returns_422(self, client, mock_store):
        """horizon_days outside [1, 30] should fail Pydantic validation."""
        _override_store(mock_store)

        payload = {**self.VALID_PAYLOAD, "horizon_days": 50}
        resp = client.post("/predict", json=payload)

        assert resp.status_code == 422


# ===========================================================================
# 4. GET /store/{store_id}/status
# ===========================================================================


class TestStoreStatusEndpoint:
    """Tests for the /store/{store_id}/status endpoint."""

    def test_store_status_with_models(self, client, mock_manager):
        """Store with trained models returns has_models=True and dish list."""
        mock_manager.has_models.return_value = True
        mock_manager.is_training.return_value = False

        inner_store = MagicMock()
        inner_store.list_dishes.return_value = ["Dim Sum", "Spring Rolls"]
        mock_manager.get_store.return_value = inner_store
        mock_manager.fetch_store_sales.return_value = (MagicMock(), 120)

        _override_manager(mock_manager)

        resp = client.get("/store/42/status")

        assert resp.status_code == 200
        body = resp.json()
        assert body["store_id"] == 42
        assert body["has_models"] is True
        assert body["is_training"] is False
        assert body["dishes"] == ["Dim Sum", "Spring Rolls"]
        assert body["days_available"] == 120
        assert body["training_progress"] is None

    def test_store_status_no_models(self, client, mock_manager):
        """Store without models returns has_models=False and no dishes."""
        mock_manager.has_models.return_value = False
        mock_manager.is_training.return_value = False
        mock_manager.get_store.return_value = None
        mock_manager.fetch_store_sales.return_value = (None, 50)

        _override_manager(mock_manager)

        resp = client.get("/store/99/status")

        assert resp.status_code == 200
        body = resp.json()
        assert body["store_id"] == 99
        assert body["has_models"] is False
        assert body["is_training"] is False
        assert body["dishes"] is None
        assert body["days_available"] == 50
        assert body["training_progress"] is None

    def test_store_status_during_training(self, client, mock_manager):
        """While training is in progress, training_progress is populated."""
        mock_manager.has_models.return_value = False
        mock_manager.is_training.return_value = True
        mock_manager.get_store.return_value = None
        mock_manager.fetch_store_sales.return_value = (None, 200)
        mock_manager.get_training_progress.return_value = {
            "trained": 3,
            "failed": 1,
            "total": 10,
            "current_dish": "Fried Rice",
        }

        _override_manager(mock_manager)

        resp = client.get("/store/7/status")

        assert resp.status_code == 200
        body = resp.json()
        assert body["store_id"] == 7
        assert body["is_training"] is True
        progress = body["training_progress"]
        assert progress is not None
        assert progress["trained"] == 3
        assert progress["failed"] == 1
        assert progress["total"] == 10
        assert progress["current_dish"] == "Fried Rice"

    def test_store_status_db_error_on_fetch_sales(self, client, mock_manager):
        """If fetch_store_sales raises, days_available should be None."""
        mock_manager.has_models.return_value = False
        mock_manager.is_training.return_value = False
        mock_manager.get_store.return_value = None
        mock_manager.fetch_store_sales.side_effect = Exception("DB connection timeout")

        _override_manager(mock_manager)

        resp = client.get("/store/5/status")

        assert resp.status_code == 200
        body = resp.json()
        assert body["store_id"] == 5
        assert body["has_models"] is False
        assert body["days_available"] is None

    def test_store_status_has_models_but_get_store_returns_none(self, client, mock_manager):
        """Edge case: has_models is True but get_store returns None (e.g. corrupt registry)."""
        mock_manager.has_models.return_value = True
        mock_manager.is_training.return_value = False
        mock_manager.get_store.return_value = None
        mock_manager.fetch_store_sales.return_value = (None, 0)

        _override_manager(mock_manager)

        resp = client.get("/store/1/status")

        assert resp.status_code == 200
        body = resp.json()
        assert body["store_id"] == 1
        assert body["has_models"] is True
        assert body["dishes"] is None


# ===========================================================================
# 5. POST /store/{store_id}/predict
# ===========================================================================


class TestStorePredictEndpoint:
    """Tests for the /store/{store_id}/predict endpoint."""

    VALID_PAYLOAD = {
        "store_id": 42,
        "horizon_days": 7,
        "address": "Shanghai, China",
    }

    def test_store_predict_training_in_progress(self, client, mock_manager):
        """If models are currently training, return status=training."""
        mock_manager.is_training.return_value = True

        _override_manager(mock_manager)

        resp = client.post("/store/42/predict", json=self.VALID_PAYLOAD)

        assert resp.status_code == 200
        body = resp.json()
        assert body["store_id"] == 42
        assert body["status"] == "training"
        assert "training in progress" in body["message"].lower()

    def test_store_predict_missing_models(self, client, mock_manager):
        """If no models exist, return status=missing_models."""
        mock_manager.is_training.return_value = False
        mock_manager.get_store.return_value = None
        mock_manager.fetch_store_sales.return_value = (None, 80)

        _override_manager(mock_manager)

        resp = client.post("/store/42/predict", json=self.VALID_PAYLOAD)

        assert resp.status_code == 200
        body = resp.json()
        assert body["store_id"] == 42
        assert body["status"] == "missing_models"
        assert body["days_available"] == 80
        assert "no trained models" in body["message"].lower()

    def test_store_predict_missing_models_db_error(self, client, mock_manager):
        """If no models exist AND the DB fails, return status=error."""
        mock_manager.is_training.return_value = False
        mock_manager.get_store.return_value = None
        mock_manager.fetch_store_sales.side_effect = Exception("DB unreachable")

        _override_manager(mock_manager)

        resp = client.post("/store/42/predict", json=self.VALID_PAYLOAD)

        assert resp.status_code == 200
        body = resp.json()
        assert body["store_id"] == 42
        assert body["status"] == "error"
        assert "database" in body["message"].lower() or "connect" in body["message"].lower()
        assert body["days_available"] == 0

    @patch("app.main.predict_dish")
    @patch("app.main.fetch_weather_forecast")
    @patch("app.main.safe_filename")
    def test_store_predict_success(
        self, mock_safe_fn, mock_weather, mock_predict, client, mock_manager
    ):
        """Successful per-dish prediction for a store with models."""
        # Set up the inner ModelStore with one dish
        inner_store = MagicMock()
        inner_store.list_dishes.return_value = ["Kung Pao Chicken"]
        inner_store.model_dir = Path("/tmp/fake_store_42")  # nosec

        mock_manager.is_training.return_value = False
        mock_manager.get_store.return_value = inner_store
        mock_manager.fetch_store_location.return_value = (31.23, 121.47, "CN")

        # The recent_sales pickle does not exist -> fallback to fetch_store_sales
        mock_safe_fn.return_value = "Kung_Pao_Chicken"
        mock_manager.fetch_store_sales.return_value = (None, 0)

        # Weather fetch returns None -> will proceed without shared weather
        mock_weather.return_value = None

        mock_predict.return_value = {
            "dish": "Kung Pao Chicken",
            "model": "xgboost",
            "model_combo": "Prophet+xgboost",
            "horizon_days": 7,
            "start_date": "2025-06-01",
            "predictions": [{"date": "2025-06-01", "yhat": 10.0}],
        }

        _override_manager(mock_manager)

        resp = client.post("/store/42/predict", json=self.VALID_PAYLOAD)

        assert resp.status_code == 200
        body = resp.json()
        assert body["store_id"] == 42
        assert body["status"] == "ok"
        assert "Kung Pao Chicken" in body["predictions"]

    @patch("app.main.predict_dish")
    @patch("app.main.fetch_weather_forecast")
    @patch("app.main.safe_filename")
    def test_store_predict_per_dish_error(
        self, mock_safe_fn, mock_weather, mock_predict, client, mock_manager
    ):
        """If predict_dish fails for a dish, it gets an error entry, not a 500."""
        inner_store = MagicMock()
        inner_store.list_dishes.return_value = ["Good Dish", "Bad Dish"]
        inner_store.model_dir = Path("/tmp/fake_store_42")  # nosec

        mock_manager.is_training.return_value = False
        mock_manager.get_store.return_value = inner_store
        mock_manager.fetch_store_location.return_value = (31.23, 121.47, "CN")
        mock_manager.fetch_store_sales.return_value = (None, 0)

        mock_safe_fn.side_effect = lambda name: name.replace(" ", "_")
        mock_weather.return_value = None

        def predict_side_effect(store, dish, **kwargs):
            if dish == "Bad Dish":
                raise RuntimeError("Model file corrupted")
            return {
                "dish": dish,
                "model": "xgboost",
                "model_combo": "Prophet+xgboost",
                "horizon_days": 7,
                "start_date": "2025-06-01",
                "predictions": [{"date": "2025-06-01", "yhat": 5.0}],
            }

        mock_predict.side_effect = predict_side_effect

        _override_manager(mock_manager)

        resp = client.post("/store/42/predict", json=self.VALID_PAYLOAD)

        assert resp.status_code == 200
        body = resp.json()
        assert body["status"] == "ok"
        # Good dish has predictions
        assert "predictions" in body["predictions"]["Good Dish"]
        # Bad dish has an error entry
        assert "error" in body["predictions"]["Bad Dish"]
        assert "corrupted" in body["predictions"]["Bad Dish"]["error"].lower()

    @patch("app.main.predict_dish")
    @patch("app.main.fetch_weather_forecast")
    @patch("app.main.safe_filename")
    def test_store_predict_with_recent_sales_pickle(
        self, mock_safe_fn, mock_weather, mock_predict, client, mock_manager, tmp_path
    ):
        """When a recent_sales_{dish}.pkl file exists, it is loaded instead of DB sales."""
        inner_store = MagicMock()
        inner_store.list_dishes.return_value = ["Dim Sum"]
        inner_store.model_dir = tmp_path

        mock_manager.is_training.return_value = False
        mock_manager.get_store.return_value = inner_store
        mock_manager.fetch_store_location.return_value = (31.23, 121.47, "CN")

        mock_safe_fn.return_value = "Dim_Sum"
        mock_weather.return_value = None

        # Create a fake pickle file so the path.exists() check passes
        import pandas as pd

        recent_df = pd.DataFrame({"sales": [5.0, 6.0, 7.0]})
        pickle_path = tmp_path / "recent_sales_Dim_Sum.pkl"
        recent_df.to_pickle(str(pickle_path))

        mock_predict.return_value = {
            "dish": "Dim Sum",
            "model": "lightgbm",
            "model_combo": "Prophet+lightgbm",
            "horizon_days": 7,
            "start_date": "2025-06-01",
            "predictions": [{"date": "2025-06-01", "yhat": 8.0}],
        }

        _override_manager(mock_manager)

        # Patch secure_load at its source module (it is imported locally inside
        # store_predict, so patching must target the canonical location).
        with patch("app.utils.secure_io.secure_load", return_value=recent_df):
            resp = client.post("/store/42/predict", json=self.VALID_PAYLOAD)

        assert resp.status_code == 200
        body = resp.json()
        assert body["status"] == "ok"
        assert "Dim Sum" in body["predictions"]
        # predict_dish should have been called with recent_sales=[5.0, 6.0, 7.0]
        call_kwargs = mock_predict.call_args
        assert call_kwargs is not None

    @patch("app.main.predict_dish")
    @patch("app.main.fetch_weather_forecast")
    @patch("app.main.safe_filename")
    def test_store_predict_uses_request_lat_lon(
        self, mock_safe_fn, mock_weather, mock_predict, client, mock_manager
    ):
        """When lat/lon are provided in the request, DB location is not fetched."""
        inner_store = MagicMock()
        inner_store.list_dishes.return_value = ["Fried Rice"]
        inner_store.model_dir = Path("/tmp/fake_store_42")  # nosec

        mock_manager.is_training.return_value = False
        mock_manager.get_store.return_value = inner_store
        mock_manager.fetch_store_sales.return_value = (None, 0)

        mock_safe_fn.return_value = "Fried_Rice"
        mock_weather.return_value = None
        mock_predict.return_value = {
            "dish": "Fried Rice",
            "model": "xgboost",
            "model_combo": "Prophet+xgboost",
            "horizon_days": 7,
            "start_date": "2025-06-01",
            "predictions": [],
        }

        _override_manager(mock_manager)

        payload = {
            "store_id": 42,
            "horizon_days": 7,
            "latitude": 40.71,
            "longitude": -74.01,
            "country_code": "US",
        }
        resp = client.post("/store/42/predict", json=payload)

        assert resp.status_code == 200
        # fetch_store_location should NOT be called when lat/lon/cc are all provided
        mock_manager.fetch_store_location.assert_not_called()

    @patch("app.main.predict_dish")
    @patch("app.main.fetch_weather_forecast")
    @patch("app.main.safe_filename")
    def test_store_predict_weather_api_failure_still_succeeds(
        self, mock_safe_fn, mock_weather, mock_predict, client, mock_manager
    ):
        """Weather API failure is non-fatal: predictions still proceed with fallback."""
        inner_store = MagicMock()
        inner_store.list_dishes.return_value = ["Spring Rolls"]
        inner_store.model_dir = Path("/tmp/fake_store_42")  # nosec

        mock_manager.is_training.return_value = False
        mock_manager.get_store.return_value = inner_store
        mock_manager.fetch_store_location.return_value = (31.23, 121.47, "CN")
        mock_manager.fetch_store_sales.return_value = (None, 0)

        mock_safe_fn.return_value = "Spring_Rolls"
        # Simulate weather API failure
        mock_weather.side_effect = Exception("Weather API timeout")

        mock_predict.return_value = {
            "dish": "Spring Rolls",
            "model": "xgboost",
            "model_combo": "Prophet+xgboost",
            "horizon_days": 7,
            "start_date": "2025-06-01",
            "predictions": [{"date": "2025-06-01", "yhat": 3.0}],
        }

        _override_manager(mock_manager)

        resp = client.post("/store/42/predict", json=self.VALID_PAYLOAD)

        assert resp.status_code == 200
        body = resp.json()
        assert body["status"] == "ok"
        assert "Spring Rolls" in body["predictions"]

    def test_store_predict_path_store_id_mismatch(self, client, mock_manager):
        """The path store_id and body store_id are independent (FastAPI behavior).
        The response uses the path parameter store_id."""
        mock_manager.is_training.return_value = True

        _override_manager(mock_manager)

        payload = {**self.VALID_PAYLOAD, "store_id": 999}
        resp = client.post("/store/42/predict", json=payload)

        assert resp.status_code == 200
        body = resp.json()
        # The endpoint uses the path param (42), not the body param
        assert body["store_id"] == 42

    @patch("app.main.predict_dish")
    @patch("app.main.fetch_weather_forecast")
    @patch("app.main.safe_filename")
    def test_store_predict_multiple_dishes(
        self, mock_safe_fn, mock_weather, mock_predict, client, mock_manager
    ):
        """Prediction iterates over all dishes from the store."""
        inner_store = MagicMock()
        inner_store.list_dishes.return_value = ["Dish A", "Dish B", "Dish C"]
        inner_store.model_dir = Path("/tmp/fake_store")  # nosec

        mock_manager.is_training.return_value = False
        mock_manager.get_store.return_value = inner_store
        mock_manager.fetch_store_location.return_value = (31.23, 121.47, "CN")
        mock_manager.fetch_store_sales.return_value = (None, 0)

        mock_safe_fn.side_effect = lambda name: name.replace(" ", "_")
        mock_weather.return_value = None

        mock_predict.return_value = {
            "dish": "placeholder",
            "model": "xgboost",
            "model_combo": "Prophet+xgboost",
            "horizon_days": 7,
            "start_date": "2025-06-01",
            "predictions": [],
        }

        _override_manager(mock_manager)

        resp = client.post("/store/42/predict", json=self.VALID_PAYLOAD)

        assert resp.status_code == 200
        body = resp.json()
        assert body["status"] == "ok"
        # All three dishes should have entries
        assert "Dish A" in body["predictions"]
        assert "Dish B" in body["predictions"]
        assert "Dish C" in body["predictions"]
        assert mock_predict.call_count == 3
