import os
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import holidays
import pandas as pd

from app.utils import (
    WEATHER_COLS,
    compute_lag_features_from_history,
    fetch_weather_forecast,
    safe_filename,
)
from app.utils.secure_io import secure_load
from training_logic_v2 import (
    PipelineConfig,
    get_location_details,
)

TIME_FEATURES = ["day_of_week", "month", "day", "dayofyear", "is_weekend"]
TREE_FEATURES = (
    TIME_FEATURES
    + ["is_public_holiday"]
    + WEATHER_COLS
    + [
        "y_lag_1",
        "y_lag_7",
        "y_lag_14",
        "y_roll_mean_7",
        "y_roll_std_7",
        "y_roll_mean_14",
        "y_roll_std_14",
        "y_roll_mean_28",
        "y_roll_std_28",
        "prophet_yhat",
    ]
)


@dataclass(frozen=True)
class LoadedDishModel:
    dish: str
    champion: str
    prophet_model: Any
    tree_model: Any


class ModelStore:
    def __init__(self, model_dir: str = "models") -> None:
        self.model_dir = Path(model_dir)
        self.registry: dict[str, dict[str, Any]] = {}
        self._cache: dict[str, LoadedDishModel] = {}

    def load_registry(self) -> None:
        registry_path = self.model_dir / "champion_registry.pkl"
        if not registry_path.exists():
            raise FileNotFoundError(f"Missing registry: {registry_path}")
        self.registry = secure_load(str(registry_path))

    def list_dishes(self) -> list[str]:
        return sorted(self.registry.keys())

    def get_dish_model(self, dish: str) -> LoadedDishModel:
        if dish in self._cache:
            return self._cache[dish]

        meta = self.registry.get(dish)
        if meta is None:
            raise KeyError(f"Dish not found in registry: {dish}")

        champion = meta.get("model")
        if not champion:
            raise ValueError(f"Champion model missing for dish: {dish}")

        safe = safe_filename(dish)
        prophet_path = self.model_dir / f"prophet_{safe}.pkl"
        tree_path = self.model_dir / f"{champion}_{safe}.pkl"

        if not prophet_path.exists() or not tree_path.exists():
            raise FileNotFoundError(
                f"Missing model files for '{dish}': {prophet_path.name}, {tree_path.name}"
            )

        prophet_model = secure_load(str(prophet_path))
        tree_model = secure_load(str(tree_path))

        loaded = LoadedDishModel(
            dish=dish,
            champion=champion,
            prophet_model=prophet_model,
            tree_model=tree_model,
        )
        self._cache[dish] = loaded
        return loaded


# _compute_lag_features_from_history → app.utils.compute_lag_features_from_history
# _fetch_weather_forecast → app.utils.fetch_weather_forecast


def _weather_fallback_df(dates: pd.DatetimeIndex) -> pd.DataFrame:
    """Build a fallback weather DataFrame using seasonal historical averages."""
    from core.data_prep import _get_seasonal_historical_averages

    rows = []
    for dt in dates:
        seasonal = _get_seasonal_historical_averages(dt.month)
        rows.append({"date": dt, **seasonal})
    return pd.DataFrame(rows)


def _prepare_future_weather(
    start_date: pd.Timestamp,
    horizon_days: int,
    latitude: float,
    longitude: float,
    weather_rows: list[dict[str, Any]] | None = None,
) -> pd.DataFrame:
    future_dates = pd.date_range(start=start_date, periods=horizon_days, freq="D")

    if weather_rows:
        forecast_weather = pd.DataFrame(weather_rows).copy()
        forecast_weather["date"] = pd.to_datetime(forecast_weather["date"]).dt.normalize()
    else:
        try:
            forecast_weather = fetch_weather_forecast(
                latitude, longitude, forecast_days=max(16, horizon_days)
            )
            if forecast_weather is None:
                forecast_weather = _weather_fallback_df(future_dates)
        except Exception:
            forecast_weather = _weather_fallback_df(future_dates)

    if forecast_weather.empty:
        forecast_weather = _weather_fallback_df(future_dates)

    from core.data_prep import _get_seasonal_historical_averages

    for col in WEATHER_COLS:
        if col not in forecast_weather.columns:
            forecast_weather[col] = forecast_weather["date"].dt.month.map(
                lambda m, c=col: _get_seasonal_historical_averages(m)[c]
            )

    future_weather = forecast_weather[forecast_weather["date"].isin(future_dates)].copy()
    if len(future_weather) < len(future_dates):
        mean_vals = {c: float(forecast_weather[c].mean()) for c in WEATHER_COLS}
        missing = [d for d in future_dates if d not in set(future_weather["date"])]
        fill = pd.DataFrame({"date": missing})
        for c in WEATHER_COLS:
            fill[c] = mean_vals[c]
        future_weather = pd.concat([future_weather, fill], ignore_index=True)

    return future_weather.sort_values("date").reset_index(drop=True)


def predict_dish(
    store: ModelStore,
    dish: str,
    recent_sales: list[float],
    horizon_days: int,
    start_date: str | None = None,
    address: str = "Shanghai, China",
    latitude: float | None = None,
    longitude: float | None = None,
    country_code: str | None = None,
    weather_rows: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    if not recent_sales:
        raise ValueError("recent_sales cannot be empty")

    if horizon_days < 1 or horizon_days > 30:
        raise ValueError("horizon_days must be in [1, 30]")

    loaded = store.get_dish_model(dish)
    cfg = PipelineConfig()

    lat = latitude
    lon = longitude
    cc = country_code
    if lat is None or lon is None or not cc:
        lat_geo, lon_geo, cc_geo = get_location_details(address)
        lat = lat if lat is not None else lat_geo
        lon = lon if lon is not None else lon_geo
        cc = cc or cc_geo

    if lat is None or lon is None:
        raise RuntimeError("Unable to resolve latitude/longitude")

    start = (
        pd.to_datetime(start_date).normalize()
        if start_date
        else pd.Timestamp.now().normalize() + pd.Timedelta(days=1)
    )
    future_weather = _prepare_future_weather(
        start_date=start,
        horizon_days=horizon_days,
        latitude=float(lat),
        longitude=float(lon),
        weather_rows=weather_rows,
    )

    prophet_input = future_weather.rename(columns={"date": "ds"})
    prophet_pred = loaded.prophet_model.predict(prophet_input[["ds"] + WEATHER_COLS])
    prophet_yhat = prophet_pred["yhat"].astype(float).to_numpy()

    local_hols = holidays.country_holidays(cc, years=cfg.holiday_years) if cc else None
    sales_history = [float(x) for x in recent_sales]

    rows: list[dict[str, Any]] = []
    for i, row in future_weather.iterrows():
        dt = pd.to_datetime(row["date"])
        feat: dict[str, float] = {
            "day_of_week": float(dt.dayofweek),
            "month": float(dt.month),
            "day": float(dt.day),
            "dayofyear": float(dt.dayofyear),
            "is_weekend": float(int(dt.dayofweek >= 5)),
            "is_public_holiday": float(int(dt in local_hols)) if local_hols is not None else 0.0,
            "prophet_yhat": float(prophet_yhat[i]),
        }

        for c in WEATHER_COLS:
            feat[c] = float(row.get(c, 0.0))

        feat.update(compute_lag_features_from_history(sales_history))

        X_one = pd.DataFrame([{k: feat.get(k, 0.0) for k in TREE_FEATURES}])
        resid_hat = float(loaded.tree_model.predict(X_one)[0])
        yhat = max(0.0, feat["prophet_yhat"] + resid_hat)

        rows.append(
            {
                "date": dt.strftime("%Y-%m-%d"),
                "yhat": yhat,
                "prophet_yhat": feat["prophet_yhat"],
                "residual_hat": resid_hat,
            }
        )
        sales_history.append(yhat)

    return {
        "dish": dish,
        "model": loaded.champion,
        "model_combo": f"Prophet+{loaded.champion}",
        "horizon_days": horizon_days,
        "start_date": start.strftime("%Y-%m-%d"),
        "predictions": rows,
    }


def create_store_from_env() -> ModelStore:
    model_dir = os.getenv("MODEL_DIR", "models")
    store = ModelStore(model_dir=model_dir)
    store.load_registry()
    return store
