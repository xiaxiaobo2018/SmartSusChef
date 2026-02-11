"""Data ingestion, geocoding, weather fetching, and context enrichment."""

import os
from types import ModuleType
from typing import Any

import holidays
import pandas as pd
from geopy.geocoders import Nominatim
from sqlalchemy import create_engine

from app.utils.logging_config import setup_logger

openmeteo_requests: ModuleType | None = None
retry: Any = None
try:
    import openmeteo_requests as _openmeteo_requests
    from retry_requests import retry as _retry

    openmeteo_requests = _openmeteo_requests
    retry = _retry
except Exception:
    pass

logger = setup_logger(__name__)


WEATHER_COLS = [
    "temperature_2m_max",
    "temperature_2m_min",
    "relative_humidity_2m_mean",
    "precipitation_sum",
]


# ---------------------------------------------------------------------------
# Seasonal Weather Fallback
# ---------------------------------------------------------------------------
def _get_seasonal_historical_averages(month: int) -> dict[str, float]:
    """Return typical weather averages for a given month (Northern Hemisphere)."""
    if month in [12, 1, 2]:  # Winter
        return {
            "temperature_2m_max": 5.0,
            "temperature_2m_min": -5.0,
            "relative_humidity_2m_mean": 80.0,
            "precipitation_sum": 5.0,
        }
    elif month in [3, 4, 5]:  # Spring
        return {
            "temperature_2m_max": 15.0,
            "temperature_2m_min": 5.0,
            "relative_humidity_2m_mean": 70.0,
            "precipitation_sum": 2.0,
        }
    elif month in [6, 7, 8]:  # Summer
        return {
            "temperature_2m_max": 28.0,
            "temperature_2m_min": 18.0,
            "relative_humidity_2m_mean": 60.0,
            "precipitation_sum": 1.0,
        }
    elif month in [9, 10, 11]:  # Autumn
        return {
            "temperature_2m_max": 18.0,
            "temperature_2m_min": 8.0,
            "relative_humidity_2m_mean": 75.0,
            "precipitation_sum": 3.0,
        }
    else:
        return {
            "temperature_2m_max": 20.0,
            "temperature_2m_min": 10.0,
            "relative_humidity_2m_mean": 65.0,
            "precipitation_sum": 0.5,
        }


# ---------------------------------------------------------------------------
# Geocoding
# ---------------------------------------------------------------------------
def get_location_details(address):
    """
    Convert an address or postal code to (latitude, longitude, country_code)
    using the Nominatim geocoding service (OpenStreetMap).
    """
    try:
        geolocator = Nominatim(user_agent="smartsus_chef_v3")
        location = geolocator.geocode(address, addressdetails=True)
        if location is None:
            logger.warning("Could not geocode address.")
            return None, None, None
        lat = location.latitude
        lon = location.longitude
        country_code = location.raw.get("address", {}).get("country_code", "").upper()
        logger.info("Address geocoded successfully.")
        return lat, lon, country_code
    except Exception as e:
        logger.warning("Geocoding failed. Error: %s", e)
        return None, None, None


# ---------------------------------------------------------------------------
# Historical Weather
# ---------------------------------------------------------------------------
def get_historical_weather(latitude, longitude, start_date, end_date):
    """
    Fetch historical daily weather data from the Open-Meteo Archive API.
    Returns a DataFrame with columns: date, temperature_2m_max, temperature_2m_min,
    relative_humidity_2m_mean, precipitation_sum.
    """
    if openmeteo_requests is None or retry is None:
        logger.warning("openmeteo_requests or retry_requests not available.")
        return None

    try:
        session = retry(retries=3, backoff_factor=0.5)
        om = openmeteo_requests.Client(session=session)

        url = "https://archive-api.open-meteo.com/v1/archive"
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "start_date": start_date.strftime("%Y-%m-%d"),
            "end_date": end_date.strftime("%Y-%m-%d"),
            "daily": [
                "temperature_2m_max",
                "temperature_2m_min",
                "relative_humidity_2m_mean",
                "precipitation_sum",
            ],
            "timezone": "auto",
        }

        responses = om.weather_api(url, params=params)
        response = responses[0]
        daily = response.Daily()

        dates = pd.date_range(
            start=pd.to_datetime(daily.Time(), unit="s", utc=True),
            end=pd.to_datetime(daily.TimeEnd(), unit="s", utc=True),
            freq=pd.Timedelta(seconds=daily.Interval()),
            inclusive="left",
        )

        weather_df = pd.DataFrame(
            {
                "date": dates,
                "temperature_2m_max": daily.Variables(0).ValuesAsNumpy(),
                "temperature_2m_min": daily.Variables(1).ValuesAsNumpy(),
                "relative_humidity_2m_mean": daily.Variables(2).ValuesAsNumpy(),
                "precipitation_sum": daily.Variables(3).ValuesAsNumpy(),
            }
        )
        weather_df["date"] = weather_df["date"].dt.tz_localize(None).dt.normalize()

        logger.info("Fetched %d days of historical weather data.", len(weather_df))
        return weather_df
    except Exception as e:
        logger.warning("Failed to fetch historical weather: %s", e)
        return None


def fetch_weather_from_db(start_date, end_date):
    """
    Attempt to fetch historical weather data from the local MySQL Weather table.
    Returns a DataFrame with columns: date + WEATHER_COLS, or None if unavailable.
    """
    DB_URL = os.getenv("DATABASE_URL")
    if not DB_URL:
        logger.debug("DATABASE_URL not set; skipping weather DB lookup.")
        return None
    try:
        engine = create_engine(DB_URL)
        query = """
        SELECT Date as date, TemperatureMax as temperature_2m_max,
               TemperatureMin as temperature_2m_min,
               HumidityMean as relative_humidity_2m_mean,
               PrecipitationSum as precipitation_sum
        FROM Weather
        WHERE Date BETWEEN %s AND %s
        ORDER BY Date ASC
        """
        df = pd.read_sql(
            query, engine, params=[start_date.strftime("%Y-%m-%d"), end_date.strftime("%Y-%m-%d")]
        )
        if len(df) == 0:
            return None
        df["date"] = pd.to_datetime(df["date"]).dt.normalize()
        logger.info("Fetched %d days of weather data from database.", len(df))
        return df
    except Exception as e:
        logger.warning("Weather DB lookup failed: %s", e)
        return None


# ---------------------------------------------------------------------------
# Context Enrichment (Holidays + Weather)
# ---------------------------------------------------------------------------
def add_local_context(df, address, config, latitude=None, longitude=None, country_code=None):
    """
    Enriches the sales data with local context features (Holidays + Weather).
    Uses geocoding to detect location and Open-Meteo for real weather data.
    Falls back to config.default_fallback_* if geocoding or weather fails.
    """
    if latitude is not None and longitude is not None and country_code:
        lat, lon = latitude, longitude
    else:
        lat, lon, country_code = get_location_details(address)

    if lat is None:
        logger.warning(
            "Geocoding failed. Falling back to default location (%s).",
            config.default_fallback_address,
        )
        country_code = config.default_fallback_country
        lat, lon = config.default_fallback_lat, config.default_fallback_lon

    if not country_code or country_code not in holidays.list_supported_countries():
        logger.warning(
            "Unsupported country for holidays. Defaulting to '%s'.",
            config.default_fallback_country,
        )
        country_code = config.default_fallback_country

    logger.info("Location context processed.")

    df["day_of_week"] = df["date"].dt.dayofweek
    df["month"] = df["date"].dt.month

    local_holidays = holidays.country_holidays(country_code, years=config.holiday_years)
    df["is_public_holiday"] = df["date"].apply(lambda x: 1 if x in local_holidays else 0)

    weather_df = fetch_weather_from_db(df["date"].min(), df["date"].max())
    if weather_df is None:
        weather_df = get_historical_weather(lat, lon, df["date"].min(), df["date"].max())

    if weather_df is not None and len(weather_df) > 0:
        df = df.merge(weather_df, on="date", how="left")
        df = df.set_index("date")
        for col in WEATHER_COLS:
            df[col] = df[col].interpolate(method="time").bfill().ffill().fillna(0)
        df = df.reset_index()
    else:
        logger.warning(
            "Failed to fetch historical weather data from both the database "
            "and Open-Meteo API. Using seasonal historical averages."
        )
        for col in WEATHER_COLS:
            df[col] = df["date"].dt.month.map(
                lambda m, c=col: _get_seasonal_historical_averages(m)[c]
            )

    return df, country_code, lat, lon


# ---------------------------------------------------------------------------
# Data Ingestion
# ---------------------------------------------------------------------------
def fetch_training_data(store_id: int | None = None):
    """
    Fetch training data, optionally filtered by store.

    Parameters
    ----------
    store_id : int | None
        When provided, only data belonging to this store is returned.
        The SQL query filters ``SalesData`` by ``StoreId``.
        The CSV fallback looks for a store-specific directory first
        (``ml_data_uploads/<store_id>/food_sales_eng.csv``).

    Returns
    -------
    pd.DataFrame
        Columns: date, dish, sales — sorted by date.
    """
    DB_URL = os.getenv("DATABASE_URL")

    df = None
    if DB_URL:
        try:
            engine = create_engine(DB_URL)
            if store_id is not None:
                query = """
                SELECT s.Date as date, r.Name as dish, s.Quantity as sales
                FROM SalesData s JOIN Recipes r ON s.RecipeId = r.Id
                WHERE s.StoreId = %s
                ORDER BY s.Date ASC
                """
                df = pd.read_sql(query, engine, params=[store_id])
            else:
                query = """
                SELECT s.Date as date, r.Name as dish, s.Quantity as sales
                FROM SalesData s JOIN Recipes r ON s.RecipeId = r.Id
                ORDER BY s.Date ASC
                """
                df = pd.read_sql(query, engine)
            if df.empty:
                logger.warning("MySQL returned 0 rows. Falling back to CSV.")
                df = None
            else:
                df["date"] = pd.to_datetime(df["date"])
                logger.info(
                    "Loaded %d rows from MySQL%s.",
                    len(df),
                    f" for store {store_id}" if store_id is not None else "",
                )
        except Exception as e:
            logger.warning("MySQL connection failed: %s. Falling back to CSV.", e)
            df = None
    else:
        logger.info("DATABASE_URL not set. Using CSV fallback.")

    if df is None:
        csv_path = "food_sales_eng.csv"
        if store_id is not None:
            store_csv = f"ml_data_uploads/{store_id}/food_sales_eng.csv"
            if os.path.exists(store_csv):
                csv_path = store_csv
                logger.info("Using store-specific CSV: %s", store_csv)

        df = pd.read_csv(csv_path, encoding="utf-8-sig")
        # Normalise column names: the CSV may use Date/Dish_Name/Quantity_Sold
        rename_map = {
            "Date": "date",
            "Dish_Name": "dish",
            "Quantity_Sold": "sales",
        }
        df = df.rename(columns=rename_map)
        df["date"] = pd.to_datetime(df["date"], format="%m/%d/%Y")
        logger.info("Loaded %d rows from CSV.", len(df))

    df["date"] = df["date"].dt.normalize()
    df = df.groupby(["date", "dish"]).agg(sales=("sales", "sum")).reset_index()

    return df.sort_values("date")


def sanitize_sparse_data(df, country_code, config=None):
    """Fill missing days with time-based interpolation.

    Parameters
    ----------
    config : PipelineConfig | None
        If *None*, falls back to the global ``CFG`` from ``core.model_train``
        (lazy import to break circular dependency).  Callers should pass
        ``config`` explicitly whenever possible.
    """
    if config is None:
        from core.model_train import CFG

        config = CFG

    all_dates = pd.date_range(start=df["date"].min(), end=df["date"].max(), freq="D")
    df = df.set_index("date").reindex(all_dates)

    df["sales"] = df["sales"].interpolate(method="time").fillna(0)

    if "dish" in df.columns:
        df["dish"] = df["dish"].dropna().iloc[0] if not df["dish"].dropna().empty else "Unknown"

    for col in WEATHER_COLS:
        if col in df.columns:
            df[col] = df[col].interpolate(method="time").bfill().ffill()
        else:
            df[col] = 0.0

    if country_code and country_code in holidays.list_supported_countries():
        local_holidays = holidays.country_holidays(country_code, years=config.holiday_years)
    else:
        local_holidays = holidays.country_holidays("CN", years=config.holiday_years)

    df["is_public_holiday"] = df.index.to_series().apply(lambda x: 1 if x in local_holidays else 0)
    df["day_of_week"] = df.index.dayofweek
    df["month"] = df.index.month
    df = df.reset_index().rename(columns={"index": "date"})

    return df
