"""
Batch Food Sales Forecasting (Prophet + LightGBM Residual Stacking).

Overview:
1. Uses Prophet to model the linear trend and seasonality.
2. Uses LightGBM to model the residuals (errors) from Prophet.
3. Performs recursive forecasting for future days.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error

try:
    from lightgbm import LGBMRegressor
except ImportError:
    raise ImportError("Missing dependency: lightgbm. Please run: pip install lightgbm")

try:
    from prophet import Prophet  # type: ignore
except Exception:
    Prophet = None  # type: ignore

try:
    import seaborn as sns  # type: ignore

    sns.set_theme()
except Exception:
    sns = None

import matplotlib.pyplot as plt

plt.rcParams["font.sans-serif"] = ["SimHei", "Microsoft YaHei"]
plt.rcParams["axes.unicode_minus"] = False

HORIZON_DAYS = 14
MAX_DISHES: int | None = None  # None = process all dishes
TOP_N_PLOT = 12  # Top N dishes to plot
HISTORY_PLOT_DAYS = 90

REG_COLS = ["rain_mm", "avg_temp_c", "avg_humidity_pct"]
LAGS = (1, 7, 14)
ROLL_WINDOWS = (7, 14, 28)

# Prophet Parameters
PROPHET_PARAMS = {
    "changepoint_prior_scale": 0.5,
    "daily_seasonality": False,
    "holidays_prior_scale": 10.0,
    "seasonality_mode": "additive",
    "seasonality_prior_scale": 10.0,
    "weekly_seasonality": True,
    "yearly_seasonality": False,
}

# LightGBM Parameters (Leaf-wise growth)
LGBM_PARAMS = {
    "n_estimators": 600,
    "learning_rate": 0.05,
    "num_leaves": 31,  # Controls complexity (approx max_depth 5-6)
    "max_depth": -1,  # -1 means no limit, rely on num_leaves
    "subsample": 0.8,  # Row subsampling
    "colsample_bytree": 0.8,  # Feature subsampling
    "reg_alpha": 0.1,  # L1 Regularization
    "reg_lambda": 1.0,  # L2 Regularization
    "random_state": 42,
    "n_jobs": -1,  # Use all cores
    "verbose": -1,  # Suppress warnings
}

# File Paths
DATA_FOOD = Path("3food_sales_kaggle.csv")
DATA_WEATHER = Path("df_weather.csv")
DATA_HOLIDAY = Path("df_holiday.csv")
DATA_WEATHER_FUTURE = Path("df_weather_future.csv")
OUT_DIR = Path("outputs_lgbm_kaggle")
OUT_FORECASTS_DIR = OUT_DIR / "forecasts"


@dataclass(frozen=True)
class DishForecast:
    dish: str
    val_mae: float | None
    pred_future: pd.DataFrame
    history_tail: pd.DataFrame


def _sanitize_filename(name: str, max_len: int = 120) -> str:
    """Clean string for filename usage."""
    s = re.sub(r"[\\\\/:*?\"<>|]+", "_", name.strip())
    s = re.sub(r"\\s+", " ", s).strip()
    if not s:
        s = "unnamed"
    return s[:max_len]


def _ensure_dirs() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    OUT_FORECASTS_DIR.mkdir(parents=True, exist_ok=True)


def _load_inputs() -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    if not DATA_FOOD.exists():
        raise FileNotFoundError(f"Data file not found: {DATA_FOOD}")
    if not DATA_WEATHER.exists():
        raise FileNotFoundError(f"Data file not found: {DATA_WEATHER}")
    if not DATA_HOLIDAY.exists():
        raise FileNotFoundError(f"Data file not found: {DATA_HOLIDAY}")

    df = pd.read_csv(DATA_FOOD, encoding="utf-8-sig")
    weather = pd.read_csv(DATA_WEATHER, encoding="utf-8-sig")
    hol = pd.read_csv(DATA_HOLIDAY, encoding="utf-8-sig")

    # Assuming source columns are in Chinese/Specific format as per dataset
    # "日期" -> Date, "销量" -> Sales, "菜品" -> Dish Name
    df["日期"] = pd.to_datetime(df["日期"])
    weather["ds"] = pd.to_datetime(weather["ds"])
    hol.columns = hol.columns.str.replace("\ufeff", "", regex=False)
    hol["date"] = pd.to_datetime(hol["date"])

    for c in REG_COLS:
        if c not in weather.columns:
            weather[c] = np.nan

    weather = weather[["ds"] + REG_COLS].copy().sort_values("ds")
    return df, weather, hol


def _build_holidays(hol: pd.DataFrame) -> pd.DataFrame:
    name_col = "holiday_name" if "holiday_name" in hol.columns else "holiday"
    holidays = hol.rename(columns={"date": "ds", name_col: "holiday"})[
        ["ds", "holiday", "lower_window", "upper_window"]
    ].copy()
    holidays["holiday"] = holidays["holiday"].fillna("").astype(str)
    return holidays[holidays["holiday"].ne("")]


def _add_holiday_flag(ds: pd.Series, holidays: pd.DataFrame) -> pd.Series:
    if holidays.empty:
        return pd.Series(np.zeros(len(ds), dtype=int), index=ds.index)
    ds_vals = pd.to_datetime(ds).to_numpy(dtype="datetime64[D]")
    flag = np.zeros(len(ds_vals), dtype=bool)
    for row in holidays.itertuples(index=False):
        start = np.datetime64(row.ds, "D") + np.timedelta64(row.lower_window, "D")
        end = np.datetime64(row.ds, "D") + np.timedelta64(row.upper_window, "D")
        flag |= (ds_vals >= start) & (ds_vals <= end)
    return pd.Series(flag.astype(int), index=ds.index)


def _prepare_dish_daily_series(df: pd.DataFrame, dish: str) -> pd.DataFrame:
    # Filter by dish name ("菜品") and sum sales ("销量")
    one = df.loc[df["菜品"] == dish, ["日期", "销量"]].copy()
    daily = (
        one.groupby("日期", as_index=False)["销量"]
        .sum()
        .rename(columns={"日期": "ds", "销量": "y"})
        .sort_values("ds")
    )
    full_ds = pd.date_range(daily["ds"].min(), daily["ds"].max(), freq="D")
    daily = daily.set_index("ds").reindex(full_ds).rename_axis("ds").reset_index()
    daily["y"] = daily["y"].fillna(0.0)
    return daily


def _merge_exog(
    dish_daily: pd.DataFrame, weather: pd.DataFrame, holidays: pd.DataFrame
) -> pd.DataFrame:
    df_all = dish_daily.merge(weather, on="ds", how="left").sort_values("ds")
    for c in REG_COLS:
        df_all[c] = df_all[c].ffill().fillna(0.0)
    df_all["is_holiday"] = _add_holiday_flag(df_all["ds"], holidays)
    return df_all


def _add_date_features(df_all: pd.DataFrame) -> pd.DataFrame:
    ds = pd.to_datetime(df_all["ds"])
    out = df_all.copy()
    out["dow"] = ds.dt.dayofweek
    out["month"] = ds.dt.month
    out["day"] = ds.dt.day
    out["dayofyear"] = ds.dt.dayofyear
    out["is_weekend"] = (out["dow"] >= 5).astype(int)
    return out


def _add_lag_roll_features(df_all: pd.DataFrame) -> pd.DataFrame:
    out = df_all.copy()
    for lag in LAGS:
        out[f"y_lag_{lag}"] = out["y"].shift(lag)
    for w in ROLL_WINDOWS:
        s = out["y"].shift(1)
        out[f"y_roll_mean_{w}"] = s.rolling(w).mean()
        out[f"y_roll_std_{w}"] = s.rolling(w).std()
    return out


def _fit_prophet_and_predict(train_df, val_df, holidays):
    if Prophet is None:
        raise ImportError("Missing dependency: prophet")
    model = Prophet(holidays=holidays, **PROPHET_PARAMS)
    for c in REG_COLS:
        model.add_regressor(c)
    model.fit(train_df[["ds", "y"] + REG_COLS])
    pred_train = model.predict(train_df[["ds"] + REG_COLS])
    pred_val = model.predict(val_df[["ds"] + REG_COLS])
    return pred_train["yhat"].values, pred_val["yhat"].values


def _train_lgbm_on_residuals(
    train_feat: pd.DataFrame, prophet_yhat_train: np.ndarray
) -> tuple[LGBMRegressor, list[str]]:
    """Train LightGBM to learn the residuals (y - prophet_trend)."""
    df = train_feat.copy()
    df["prophet_yhat"] = prophet_yhat_train
    df["resid"] = df["y"] - df["prophet_yhat"]

    feature_cols = [c for c in df.columns if c not in {"ds", "y", "resid", "prophet_yhat"}]
    df = df.dropna(subset=feature_cols + ["resid"]).copy()

    # Initialize and train LGBM
    model = LGBMRegressor(**LGBM_PARAMS)
    model.fit(df[feature_cols], df["resid"])

    return model, feature_cols


def _recursive_hybrid_forecast(
    hist_df, future_exog, prophet_yhat_future, model, feature_cols
) -> pd.DataFrame:
    """Recursive forecasting loop. Uses predicted values for Lag features."""
    hist_df = hist_df.sort_values("ds").copy()
    y_hist = hist_df["y"].tolist()

    rows = []
    # Iterate through future days one by one
    for i, row in future_exog.sort_values("ds").reset_index(drop=True).iterrows():
        ds = pd.to_datetime(row["ds"])

        # Build feature dictionary
        feat = {
            "is_holiday": int(row.get("is_holiday", 0)),
            "dow": int(ds.dayofweek),
            "month": int(ds.month),
            "day": int(ds.day),
            "dayofyear": int(ds.dayofyear),
            "is_weekend": int(ds.dayofweek >= 5),
            "prophet_yhat": float(prophet_yhat_future[i]),
        }
        for c in REG_COLS:
            feat[c] = float(row.get(c, 0.0))

        # Dynamic Lag and Rolling calculation
        for lag in LAGS:
            feat[f"y_lag_{lag}"] = y_hist[-lag] if len(y_hist) >= lag else 0.0
        for w in ROLL_WINDOWS:
            window = y_hist[-w:] if len(y_hist) >= w else y_hist[:]
            if window:
                feat[f"y_roll_mean_{w}"] = np.mean(window)
                feat[f"y_roll_std_{w}"] = np.std(window, ddof=1) if len(window) >= 2 else 0.0
            else:
                feat[f"y_roll_mean_{w}"] = 0.0
                feat[f"y_roll_std_{w}"] = 0.0

        # Predict residual
        X_one = pd.DataFrame([{k: feat.get(k, 0.0) for k in feature_cols}])
        resid_hat = float(model.predict(X_one)[0])

        # Hybrid: Final = Prophet Trend + LGBM Residual
        yhat = float(feat["prophet_yhat"]) + resid_hat
        yhat = max(0.0, yhat)  # Sales cannot be negative

        rows.append({"ds": ds, "yhat": yhat})
        y_hist.append(yhat)  # Append prediction to history for next iteration

    return pd.DataFrame(rows)


def _train_hybrid(df_feat: pd.DataFrame, holidays: pd.DataFrame):
    df_feat = df_feat.dropna().copy()

    # Use full dataset if data is scarce
    if len(df_feat) < max(120, HORIZON_DAYS * 3):
        p_train, _ = _fit_prophet_and_predict(
            df_feat[["ds", "y"] + REG_COLS], df_feat[["ds", "y"] + REG_COLS], holidays
        )
        model, cols = _train_lgbm_on_residuals(df_feat, p_train)
        return model, cols, None

    # Train/Val Split
    split = len(df_feat) - HORIZON_DAYS
    train_df = df_feat.iloc[:split].copy()
    val_df = df_feat.iloc[split:].copy()

    p_train, p_val = _fit_prophet_and_predict(
        train_df[["ds", "y"] + REG_COLS], val_df[["ds", "y"] + REG_COLS], holidays
    )

    # Train LGBM on residuals
    model, cols = _train_lgbm_on_residuals(train_df, p_train)

    # Validate using recursive forecast
    future_exog = val_df[["ds", "is_holiday"] + REG_COLS].copy()
    pred_val = _recursive_hybrid_forecast(
        hist_df=train_df[["ds", "y"]],
        future_exog=future_exog,
        prophet_yhat_future=p_val,
        model=model,
        feature_cols=cols,
    )
    val_mae = mean_absolute_error(val_df["y"], pred_val["yhat"])
    return model, cols, val_mae


def forecast_one_dish(df, weather, holidays, dish) -> DishForecast:
    dish_daily = _prepare_dish_daily_series(df, dish)
    df_all = _merge_exog(dish_daily, weather, holidays)
    df_all = _add_date_features(df_all)
    df_feat = _add_lag_roll_features(df_all)

    # Step 1: Train and Evaluate
    model, cols, val_mae = _train_hybrid(df_feat, holidays)

    # Step 2: Future Forecast Prep
    future_ds = pd.date_range(
        df_all["ds"].max() + pd.Timedelta(days=1), periods=HORIZON_DAYS, freq="D"
    )

    # Prepare future weather
    if DATA_WEATHER_FUTURE.exists():
        wf = pd.read_csv(DATA_WEATHER_FUTURE, encoding="utf-8-sig")
        wf["ds"] = pd.to_datetime(wf["ds"])
        future_weather = wf[wf["ds"].isin(future_ds)][["ds"] + REG_COLS].copy()
        # Fallback if future weather data is missing rows
        if len(future_weather) < len(future_ds):
            pass
    else:
        last = weather.iloc[-1]
        future_weather = pd.DataFrame({"ds": future_ds})
        for c in REG_COLS:
            future_weather[c] = float(last.get(c, 0.0))

    future_exog = future_weather.copy()
    future_exog["is_holiday"] = _add_holiday_flag(future_exog["ds"], holidays)

    # Step 3: Retrain Prophet on FULL data
    p_full, p_future = _fit_prophet_and_predict(
        df_feat[["ds", "y"] + REG_COLS], future_exog[["ds"] + REG_COLS], holidays
    )
    # Step 4: Retrain LGBM on FULL data residuals
    model_full, cols = _train_lgbm_on_residuals(df_feat, p_full)

    # Step 5: Generate Final Forecasts
    pred_future = _recursive_hybrid_forecast(
        hist_df=df_all[["ds", "y"]],
        future_exog=future_exog,
        prophet_yhat_future=p_future,
        model=model_full,
        feature_cols=cols,
    )

    history_tail = df_all[["ds", "y"]].tail(HISTORY_PLOT_DAYS).copy()
    return DishForecast(dish, val_mae, pred_future, history_tail)


def plot_results(results, summary, top_n=TOP_N_PLOT):
    if not results:
        return
    top = summary.sort_values("forecast_sum", ascending=False).head(top_n)
    top_dishes = top["dish"].tolist()

    # Bar Plot
    plt.figure(figsize=(12, max(4, 0.4 * len(top))))
    plt.barh(top["dish"], top["forecast_sum"], color="skyblue")
    plt.gca().invert_yaxis()
    plt.title(f"Prophet + LightGBM: Top {len(top)} Sales Forecast ({HORIZON_DAYS} Days)")
    plt.xlabel("Total Forecasted Sales")
    plt.tight_layout()
    plt.savefig(OUT_DIR / f"forecast_top{len(top)}_bar.png", dpi=200)
    plt.close()

    # Line Plot
    n = len(top_dishes)
    cols = 3
    rows = int(np.ceil(n / cols))
    fig, axes = plt.subplots(rows, cols, figsize=(15, 4 * rows))
    axes = np.array(axes).reshape(-1)

    by_dish = {r.dish: r for r in results}
    for i, dish in enumerate(top_dishes):
        ax = axes[i]
        r = by_dish[dish]
        ax.plot(r.history_tail["ds"], r.history_tail["y"], "k.-", alpha=0.3, label="History")
        ax.plot(r.pred_future["ds"], r.pred_future["yhat"], "r.-", label="Forecast(LGBM)")
        ax.set_title(dish)
        if i == 0:
            ax.legend()

    plt.tight_layout()
    plt.savefig(OUT_DIR / f"forecast_top{len(top_dishes)}_lines.png", dpi=200)
    plt.close()


def main():
    _ensure_dirs()
    df, weather, hol = _load_inputs()
    holidays = _build_holidays(hol)

    # Use "菜品" as per original dataset column name
    dishes = df["菜品"].dropna().unique().tolist()
    if MAX_DISHES:
        dishes = dishes[:MAX_DISHES]

    results = []
    print(f"Starting Prophet + LightGBM training for {len(dishes)} dishes...")

    for i, dish in enumerate(dishes, 1):
        try:
            r = forecast_one_dish(df, weather, holidays, dish)
            results.append(r)
            r.pred_future.to_csv(OUT_FORECASTS_DIR / f"{_sanitize_filename(dish)}.csv", index=False)
            print(f"[{i}/{len(dishes)}] {dish}: OK")
        except Exception as e:
            print(f"[{i}/{len(dishes)}] {dish}: FAILED {e}")

    if results:
        summary_rows = []
        for r in results:
            preds = r.pred_future["yhat"]
            dates = pd.to_datetime(r.pred_future["ds"])
            summary_rows.append(
                {
                    "dish": r.dish,
                    "val_mae": r.val_mae,
                    "forecast_sum": preds.sum(),
                    "forecast_mean": preds.mean(),
                    "forecast_start": dates.min().strftime("%Y-%m-%d"),
                    "forecast_end": dates.max().strftime("%Y-%m-%d"),
                }
            )

        summary = pd.DataFrame(summary_rows)

        summary = summary.sort_values("forecast_sum", ascending=False)

        summary.to_csv(OUT_DIR / "summary.csv", index=False, encoding="utf-8-sig")
        plot_results(results, summary)
        print("All forecasts completed. Results saved to 'outputs_lgbm' directory.")


if __name__ == "__main__":
    main()
