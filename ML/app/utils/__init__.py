"""Shared utility functions for the SmartSusChef ML pipeline."""

import logging
from collections.abc import Sequence
from typing import Optional

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)

try:
    import openmeteo_requests
    from retry_requests import retry
except ImportError:  # pragma: no cover
    openmeteo_requests = None  # type: ignore[assignment]
    retry = None

WEATHER_COLS = [
    "temperature_2m_max",
    "temperature_2m_min",
    "relative_humidity_2m_mean",
    "precipitation_sum",
]

DEFAULT_LAGS: tuple[int, ...] = (1, 7, 14)
DEFAULT_ROLL_WINDOWS: tuple[int, ...] = (7, 14, 28)


# ---------------------------------------------------------------------------
# Filename Helpers
# ---------------------------------------------------------------------------
def safe_filename(name: str) -> str:
    """Sanitize dish name for use as a filename."""
    return name.replace(" ", "_").replace("-", "_").replace("/", "_")


# ---------------------------------------------------------------------------
# Lag / Rolling Features
# ---------------------------------------------------------------------------
def compute_lag_features_from_history(
    sales_history: list[float],
    lags: Sequence[int] = DEFAULT_LAGS,
    roll_windows: Sequence[int] = DEFAULT_ROLL_WINDOWS,
) -> dict[str, float]:
    """Compute lag and rolling features from a sales history array.

    Parameters
    ----------
    sales_history : list[float]
        Recent sales values in chronological order.
    lags : Sequence[int]
        Lag offsets (default ``(1, 7, 14)``).
    roll_windows : Sequence[int]
        Rolling-window sizes (default ``(7, 14, 28)``).
    """
    features: dict[str, float] = {}
    fallback = float(sales_history[-1]) if sales_history else 0.0

    for lag in lags:
        features[f"y_lag_{lag}"] = (
            float(sales_history[-lag]) if len(sales_history) >= lag else fallback
        )

    for w in roll_windows:
        window = sales_history[-w:] if len(sales_history) >= w else sales_history
        if window:
            features[f"y_roll_mean_{w}"] = float(np.mean(window))
            features[f"y_roll_std_{w}"] = float(np.std(window, ddof=1)) if len(window) >= 2 else 0.0
        else:
            features[f"y_roll_mean_{w}"] = 0.0
            features[f"y_roll_std_{w}"] = 0.0

    return features


# ---------------------------------------------------------------------------
# Weather Forecast Fetching
# ---------------------------------------------------------------------------
def fetch_weather_forecast(
    latitude: float,
    longitude: float,
    forecast_days: int = 16,
    weather_cols: Optional[list[str]] = None,
) -> Optional[pd.DataFrame]:
    """Fetch a weather forecast from the Open-Meteo Forecast API.

    Parameters
    ----------
    latitude, longitude : float
        Geographic coordinates.
    forecast_days : int
        Number of days to request (clamped to 1-16).
    weather_cols : list[str] | None
        Column names expected from the API.  Defaults to ``WEATHER_COLS``.

    Returns
    -------
    pd.DataFrame | None
        A DataFrame with ``date`` plus weather columns, or *None* on failure.
    """
    if weather_cols is None:
        weather_cols = WEATHER_COLS

    if openmeteo_requests is None or retry is None:
        logger.warning("openmeteo-requests / retry-requests not available.")
        return None

    try:
        session = retry(retries=3, backoff_factor=0.5)
        om = openmeteo_requests.Client(session=session)

        url = "https://api.open-meteo.com/v1/forecast"
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "daily": weather_cols,
            "forecast_days": max(1, min(16, forecast_days)),
            "timezone": "auto",
        }

        responses = om.weather_api(url, params=params)
        daily = responses[0].Daily()

        dates = pd.date_range(
            start=pd.to_datetime(daily.Time(), unit="s", utc=True),
            end=pd.to_datetime(daily.TimeEnd(), unit="s", utc=True),
            freq=pd.Timedelta(seconds=daily.Interval()),
            inclusive="left",
        )

        df = pd.DataFrame(
            {
                "date": dates,
                weather_cols[0]: daily.Variables(0).ValuesAsNumpy(),
                weather_cols[1]: daily.Variables(1).ValuesAsNumpy(),
                weather_cols[2]: daily.Variables(2).ValuesAsNumpy(),
                weather_cols[3]: daily.Variables(3).ValuesAsNumpy(),
            }
        )
        df["date"] = pd.to_datetime(df["date"]).dt.tz_localize(None).dt.normalize()

        logger.info("Fetched %d-day weather forecast.", len(df))
        return df
    except Exception as e:
        logger.error("Failed to fetch weather forecast: %s", e)
        return None
