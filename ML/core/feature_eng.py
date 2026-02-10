"""Feature engineering functions for the hybrid Prophet + Tree pipeline."""

import numpy as np
import pandas as pd


def _add_date_features(df: pd.DataFrame, config) -> pd.DataFrame:
    """Add date-based features for the hybrid model based on config.time_features."""
    ds = pd.to_datetime(df["date"])
    out = df.copy()

    feature_map = {
        "day_of_week": lambda: ds.dt.dayofweek,
        "month": lambda: ds.dt.month,
        "day": lambda: ds.dt.day,
        "dayofyear": lambda: ds.dt.dayofyear,
        "is_weekend": lambda: (ds.dt.dayofweek >= 5).astype(int),
    }

    for feat_name in config.time_features:
        if feat_name in feature_map:
            out[feat_name] = feature_map[feat_name]()

    return out


def _add_lag_roll_features(df: pd.DataFrame, config) -> pd.DataFrame:
    """Add lag and rolling window features for the hybrid model."""
    out = df.copy()
    for lag in config.lags:
        out[f"y_lag_{lag}"] = out["sales"].shift(lag)
    for w in config.roll_windows:
        s = out["sales"].shift(1)
        out[f"y_roll_mean_{w}"] = s.rolling(w).mean()
        out[f"y_roll_std_{w}"] = s.rolling(w).std()
    return out


def add_hybrid_features(df: pd.DataFrame, config) -> pd.DataFrame:
    """Add all features needed for hybrid Prophet + Tree model."""
    df = _add_date_features(df.copy(), config)
    df = _add_lag_roll_features(df, config)
    return df


def _build_residual_features(df: pd.DataFrame, prophet_yhat: np.ndarray) -> pd.DataFrame:
    """Add Prophet predictions and residuals to the dataframe."""
    out = df.copy()
    out["prophet_yhat"] = prophet_yhat
    out["resid"] = out["sales"].astype(float) - out["prophet_yhat"].astype(float)
    return out
