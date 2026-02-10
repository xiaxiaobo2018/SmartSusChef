import functools
import os
from typing import Any

from fastapi import Depends, FastAPI, HTTPException
from pydantic import BaseModel, Field

from app.inference import ModelStore, create_store_from_env, predict_dish
from app.store_manager import StoreModelManager
from app.utils import fetch_weather_forecast, safe_filename
from app.utils.logging_config import setup_logger

logger = setup_logger(__name__)


# ---------------------------------------------------------------------------
# Dependency providers (singletons via lru_cache)
# ---------------------------------------------------------------------------
@functools.lru_cache(maxsize=1)
def get_model_store() -> ModelStore | None:
    try:
        return create_store_from_env()
    except FileNotFoundError:
        return None


@functools.lru_cache(maxsize=1)
def get_model_manager() -> StoreModelManager:
    return StoreModelManager(base_model_dir=os.getenv("MODEL_DIR", "models"))


app = FastAPI(
    title="SmartSusChef ML Inference API",
    version="2.0.0",
)


# ---------------------------------------------------------------------------
# Request / Response schemas
# ---------------------------------------------------------------------------
class PredictRequest(BaseModel):
    dish: str = Field(..., description="Dish name that exists in champion_registry.pkl")
    recent_sales: list[float] = Field(..., min_length=1, description="Recent daily sales history")
    horizon_days: int = Field(14, ge=1, le=30)
    start_date: str | None = Field(None, description="YYYY-MM-DD; default is tomorrow")
    address: str = Field("Shanghai, China", description="Used when lat/lon are not provided")
    latitude: float | None = None
    longitude: float | None = None
    country_code: str | None = None
    weather_rows: list[dict[str, Any]] | None = Field(
        None,
        description="Optional custom weather list for horizon dates",
    )


class PredictResponse(BaseModel):
    dish: str
    model: str
    model_combo: str
    horizon_days: int
    start_date: str
    predictions: list[dict[str, Any]]


class StorePredictRequest(BaseModel):
    store_id: int = Field(..., description="Store ID from the .NET database")
    horizon_days: int = Field(14, ge=1, le=30)
    address: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    country_code: str | None = None


class StorePredictResponse(BaseModel):
    store_id: int
    status: str  # "ok" | "missing_models" | "error"
    message: str | None = None
    days_available: int | None = None
    predictions: dict[str, Any] | None = None


class TrainingProgressResponse(BaseModel):
    trained: int
    failed: int
    total: int
    current_dish: str | None = None


class StoreStatusResponse(BaseModel):
    store_id: int
    has_models: bool
    is_training: bool
    dishes: list[str] | None = None
    days_available: int | None = None
    training_progress: TrainingProgressResponse | None = None


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------
@app.get("/health")
def health(
    store: ModelStore | None = Depends(get_model_store),
    manager: StoreModelManager = Depends(get_model_manager),
) -> dict[str, Any]:
    """Health check endpoint for ALB/ECS."""
    dishes_count = len(store.list_dishes()) if store is not None else 0
    return {
        "status": "ok",
        "dishes": dishes_count,
        "manager_ready": manager is not None,
    }


@app.get("/dishes")
def dishes(store: ModelStore | None = Depends(get_model_store)) -> dict[str, list[str]]:
    if store is None:
        raise HTTPException(status_code=503, detail="Model store not initialized")
    return {"dishes": store.list_dishes()}


@app.post("/predict", response_model=PredictResponse)
def predict(
    req: PredictRequest,
    store: ModelStore | None = Depends(get_model_store),
) -> dict[str, Any]:
    if store is None:
        raise HTTPException(status_code=503, detail="Model store not initialized")

    try:
        return predict_dish(
            store=store,
            dish=req.dish,
            recent_sales=req.recent_sales,
            horizon_days=req.horizon_days,
            start_date=req.start_date,
            address=req.address,
            latitude=req.latitude,
            longitude=req.longitude,
            country_code=req.country_code,
            weather_rows=req.weather_rows,
        )
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        logger.error("Prediction failed for dish '%s': %s", req.dish, e, exc_info=True)
        raise HTTPException(status_code=500, detail=str(e)) from e


# =====================================================================
# Store-aware endpoints (called by .NET backend)
# =====================================================================
@app.get("/store/{store_id}/status", response_model=StoreStatusResponse)
def store_status(
    store_id: int,
    manager: StoreModelManager = Depends(get_model_manager),
) -> dict[str, Any]:
    """Check if models exist for a store, and how much data is available."""
    has_models = manager.has_models(store_id)
    is_training = manager.is_training(store_id)

    store_dishes = None
    if has_models:
        ms = manager.get_store(store_id)
        if ms:
            store_dishes = ms.list_dishes()

    days_available = None
    try:
        _, days_available = manager.fetch_store_sales(store_id)
    except Exception as e:
        logger.warning("Could not fetch sales data for store %d: %s", store_id, e, exc_info=True)

    training_progress = None
    if is_training:
        progress = manager.get_training_progress(store_id)
        if progress:
            training_progress = progress

    return {
        "store_id": store_id,
        "has_models": has_models,
        "is_training": is_training,
        "dishes": store_dishes,
        "days_available": days_available,
        "training_progress": training_progress,
    }


@app.post("/store/{store_id}/predict", response_model=StorePredictResponse)
def store_predict(
    store_id: int,
    req: StorePredictRequest,
    manager: StoreModelManager = Depends(get_model_manager),
) -> dict[str, Any]:
    """
    Generate predictions for ALL dishes of a store.
    - If models exist -> predict immediately
    - If no models -> return missing_models (offline training required)
    """
    if manager.is_training(store_id):
        return {
            "store_id": store_id,
            "status": "training",
            "message": "Model training in progress. Please retry later.",
        }

    ms = manager.get_store(store_id)
    if ms is None:
        days_available = None
        try:
            _, days_available = manager.fetch_store_sales(store_id)
        except Exception as e:
            logger.error("DB error checking sales for store %d: %s", store_id, e, exc_info=True)
            return {
                "store_id": store_id,
                "status": "error",
                "message": f"Cannot connect to database to check sales data: {e}",
                "days_available": 0,
            }

        return {
            "store_id": store_id,
            "status": "missing_models",
            "message": "No trained models for this store. Please run offline training.",
            "days_available": days_available,
        }

    store_dishes = ms.list_dishes()
    lat = req.latitude
    lon = req.longitude
    cc = req.country_code

    if lat is None or lon is None or not cc:
        db_lat, db_lon, db_cc = manager.fetch_store_location(store_id)
        lat = lat or db_lat
        lon = lon or db_lon
        cc = cc or db_cc

    shared_weather_rows = None
    if lat is not None and lon is not None:
        try:
            weather_df = fetch_weather_forecast(
                latitude=float(lat),
                longitude=float(lon),
                forecast_days=min(16, req.horizon_days + 2),
            )
            if weather_df is not None:
                shared_weather_rows = weather_df.to_dict(orient="records")
                for row in shared_weather_rows:
                    if hasattr(row.get("date"), "strftime"):
                        row["date"] = row["date"].strftime("%Y-%m-%d")
                logger.info(
                    "Store %d: Fetched weather once for %d days, sharing across %d dishes",
                    store_id,
                    len(shared_weather_rows),
                    len(store_dishes),
                )
        except Exception as e:
            logger.warning(
                "Store %d: Weather API failed, predictions will use fallback: %s",
                store_id,
                e,
                exc_info=True,
            )

    all_predictions: dict[str, Any] = {}

    for dish in store_dishes:
        try:
            safe_dish = safe_filename(dish)
            recent_sales_path = ms.model_dir / f"recent_sales_{safe_dish}.pkl"
            if recent_sales_path.exists():
                from app.utils.secure_io import secure_load

                recent_df = secure_load(str(recent_sales_path))
                recent_sales = recent_df["sales"].astype(float).tolist()
            else:
                df, _ = manager.fetch_store_sales(store_id)
                if df is not None:
                    dish_sales = df[df["dish"] == dish].sort_values("date").tail(28)
                    recent_sales = dish_sales["sales"].astype(float).tolist()
                else:
                    recent_sales = [0.0] * 14

            if not recent_sales:
                recent_sales = [0.0] * 14

            result = predict_dish(
                store=ms,
                dish=dish,
                recent_sales=recent_sales,
                horizon_days=req.horizon_days,
                address=req.address or "Shanghai, China",
                latitude=lat,
                longitude=lon,
                country_code=cc,
                weather_rows=shared_weather_rows,
            )
            all_predictions[dish] = result
        except Exception as e:
            logger.error("Prediction failed for dish '%s': %s", dish, e, exc_info=True)
            all_predictions[dish] = {"error": str(e)}

    return {
        "store_id": store_id,
        "status": "ok",
        "predictions": all_predictions,
    }
