"""
Parallel Prophet + LightGBM (V6.0 Optuna + Advanced Features)

Major Upgrades:
1. Feature Engineering: Added EWMA (Exponential Weighted Moving Average) for better trend sensitivity.
2. Bayesian Optimization (Optuna): Automatically finds the best hyperparameters (learning_rate, num_leaves, etc.) for EACH dish.
3. Stacking Architecture: Retained V5's robust Prophet-as-feature structure.

Note: This will take longer to run because it trains multiple times per dish to find the best settings.
"""

from __future__ import annotations

import re
import warnings
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
    from prophet import Prophet
except Exception:
    Prophet = None

try:
    import optuna
    optuna.logging.set_verbosity(optuna.logging.WARNING) # Suppress spammy logs
except ImportError:
    raise ImportError("Missing dependency: optuna. Please run: pip install optuna")

try:
    import seaborn as sns
    sns.set_theme()
except Exception:
    sns = None

import matplotlib.pyplot as plt

plt.rcParams['font.sans-serif'] = ['SimHei', 'Microsoft YaHei']
plt.rcParams['axes.unicode_minus'] = False
warnings.filterwarnings("ignore")


DATA_FOOD = Path("1food_sales_ingredients.csv")
DATA_WEATHER = Path("df_weather.csv")
DATA_HOLIDAY = Path("df_holiday.csv")
DATA_WEATHER_FUTURE = Path("df_weather_future.csv")

OUT_DIR = Path("outputs_lgbm_optimized")
OUT_FORECASTS_DIR = OUT_DIR / "forecasts"


HORIZON_DAYS = 14
MAX_DISHES = None
TOP_N_PLOT = 12
HISTORY_PLOT_DAYS = 90
OPTUNA_TRIALS = 15

REG_COLS = ["rain_mm", "avg_temp_c", "avg_humidity_pct"]
LAGS = (1, 7, 14)
ROLL_WINDOWS = (7, 14, 28)

PROPHET_PARAMS = {
    "changepoint_prior_scale": 0.5,
    "daily_seasonality": False,
    "holidays_prior_scale": 10.0,
    "seasonality_mode": "additive",
    "seasonality_prior_scale": 10.0,
    "weekly_seasonality": True,
    "yearly_seasonality": False,
}

@dataclass(frozen=True)
class DishForecast:
    dish: str
    val_mae: float | None
    pred_future: pd.DataFrame
    history_tail: pd.DataFrame
    best_params: dict  # To store Optuna results

def _sanitize_filename(name: str, max_len: int = 120) -> str:
    s = re.sub(r"[\\\\/:*?\"<>|]+", "_", name.strip())
    s = re.sub(r"\\s+", " ", s).strip()
    if not s: s = "unnamed"
    return s[:max_len]

def _ensure_dirs() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    OUT_FORECASTS_DIR.mkdir(parents=True, exist_ok=True)

def _load_inputs() -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    if not DATA_FOOD.exists(): raise FileNotFoundError(f"Missing: {DATA_FOOD}")
    if not DATA_WEATHER.exists(): raise FileNotFoundError(f"Missing: {DATA_WEATHER}")
    if not DATA_HOLIDAY.exists(): raise FileNotFoundError(f"Missing: {DATA_HOLIDAY}")

    df = pd.read_csv(DATA_FOOD, encoding="utf-8-sig")
    weather = pd.read_csv(DATA_WEATHER, encoding="utf-8-sig")
    hol = pd.read_csv(DATA_HOLIDAY, encoding="utf-8-sig")

    df["日期"] = pd.to_datetime(df["日期"])
    weather["ds"] = pd.to_datetime(weather["ds"])
    hol.columns = hol.columns.str.replace("\ufeff", "", regex=False)
    hol["date"] = pd.to_datetime(hol["date"])

    for c in REG_COLS:
        if c not in weather.columns: weather[c] = np.nan
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
    if holidays.empty: return pd.Series(np.zeros(len(ds), dtype=int), index=ds.index)
    ds_vals = pd.to_datetime(ds).to_numpy(dtype="datetime64[D]")
    flag = np.zeros(len(ds_vals), dtype=bool)
    for row in holidays.itertuples(index=False):
        start = (np.datetime64(row.ds, "D") + np.timedelta64(row.lower_window, "D"))
        end = (np.datetime64(row.ds, "D") + np.timedelta64(row.upper_window, "D"))
        flag |= (ds_vals >= start) & (ds_vals <= end)
    return pd.Series(flag.astype(int), index=ds.index)

def _prepare_dish_daily_series(df: pd.DataFrame, dish: str) -> pd.DataFrame:
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

def _merge_exog(dish_daily: pd.DataFrame, weather: pd.DataFrame, holidays: pd.DataFrame) -> pd.DataFrame:
    df_all = dish_daily.merge(weather, on="ds", how="left").sort_values("ds")
    for c in REG_COLS: df_all[c] = df_all[c].ffill().fillna(0.0)
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
        # Standard Rolling
        out[f"y_roll_mean_{w}"] = s.rolling(w).mean()
        out[f"y_roll_std_{w}"] = s.rolling(w).std()
        out[f"y_roll_max_{w}"] = s.rolling(w).max()
        out[f"y_roll_min_{w}"] = s.rolling(w).min()

        # NEW FEATURE: Exponential Weighted Moving Average (EWMA)
        # Gives more weight to recent data
        out[f"y_ewma_{w}"] = s.ewm(span=w).mean()

    return out

def _fit_prophet_and_predict(train_df, val_df, holidays):
    model = Prophet(holidays=holidays, **PROPHET_PARAMS)
    for c in REG_COLS: model.add_regressor(c)
    model.fit(train_df[["ds", "y"] + REG_COLS])
    pred_train = model.predict(train_df[["ds"] + REG_COLS])
    pred_val = model.predict(val_df[["ds"] + REG_COLS])
    return pred_train["yhat"].values, pred_val["yhat"].values


def _optimize_lgbm_params(df_train, feature_cols, target_col="y"):
    """
    Uses Bayesian Optimization to find the best LightGBM parameters for this specific dish.
    """
    def objective(trial):
        # Hyperparameter search space
        param = {
            "objective": "tweedie",
            "metric": "mae",
            "verbosity": -1,
            "boosting_type": "gbdt",
            "n_jobs": -1,
            "tweedie_variance_power": trial.suggest_float("tweedie_variance_power", 1.05, 1.9),
            "n_estimators": trial.suggest_int("n_estimators", 300, 1000),
            "learning_rate": trial.suggest_float("learning_rate", 0.01, 0.1, log=True),
            "num_leaves": trial.suggest_int("num_leaves", 15, 63),
            "max_depth": trial.suggest_int("max_depth", 3, 10),
            "subsample": trial.suggest_float("subsample", 0.5, 0.9),
            "colsample_bytree": trial.suggest_float("colsample_bytree", 0.5, 0.9),
            "reg_alpha": trial.suggest_float("reg_alpha", 1e-8, 10.0, log=True),
            "reg_lambda": trial.suggest_float("reg_lambda", 1e-8, 10.0, log=True),
        }

        # Simple time-based validation split for optimization
        valid_size = max(7, int(len(df_train) * 0.2))
        train_sub = df_train.iloc[:-valid_size]
        valid_sub = df_train.iloc[-valid_size:]

        model = LGBMRegressor(**param)
        model.fit(train_sub[feature_cols], train_sub[target_col])
        preds = model.predict(valid_sub[feature_cols])
        mae = mean_absolute_error(valid_sub[target_col], preds)
        return mae

    study = optuna.create_study(direction="minimize")
    study.optimize(objective, n_trials=OPTUNA_TRIALS)
    return study.best_params

def _train_lgbm_stacking_optuna(train_feat, prophet_yhat_train):
    df = train_feat.copy()
    df["prophet_yhat"] = prophet_yhat_train

    feature_cols = [c for c in df.columns if c not in {"ds", "y", "prophet_yhat"}]
    feature_cols.append("prophet_yhat")

    df = df.dropna(subset=feature_cols + ["y"]).copy()

    # Run Optuna to find best params
    best_params = _optimize_lgbm_params(df, feature_cols, target_col="y")

    # Train final model with best params
    model = LGBMRegressor(**best_params)
    model.fit(df[feature_cols], df["y"])

    return model, feature_cols, best_params

def _recursive_hybrid_forecast(hist_df, future_exog, prophet_yhat_future, model, feature_cols):
    hist_df = hist_df.sort_values("ds").copy()
    y_hist = hist_df["y"].tolist()
    rows = []

    for i, row in future_exog.sort_values("ds").reset_index(drop=True).iterrows():
        ds = pd.to_datetime(row["ds"])
        feat = {
            "is_holiday": int(row.get("is_holiday", 0)),
            "dow": int(ds.dayofweek),
            "month": int(ds.month),
            "day": int(ds.day),
            "dayofyear": int(ds.dayofyear),
            "is_weekend": int(ds.dayofweek >= 5),
            "prophet_yhat": float(prophet_yhat_future[i]),
        }
        for c in REG_COLS: feat[c] = float(row.get(c, 0.0))

        # Dynamic Lags & Rolling
        for lag in LAGS:
            feat[f"y_lag_{lag}"] = y_hist[-lag] if len(y_hist) >= lag else 0.0
        for w in ROLL_WINDOWS:
            window = y_hist[-w:] if len(y_hist) >= w else y_hist[:]
            if window:
                feat[f"y_roll_mean_{w}"] = np.mean(window)
                feat[f"y_roll_std_{w}"] = np.std(window, ddof=1) if len(window) >= 2 else 0.0
                feat[f"y_roll_max_{w}"] = np.max(window)
                feat[f"y_roll_min_{w}"] = np.min(window)
                # Calculate EWMA manually for recursion approximation
                # (Simplified EWMA for single step recursion)
                feat[f"y_ewma_{w}"] = pd.Series(window).ewm(span=w).mean().iloc[-1]
            else:
                feat[f"y_roll_mean_{w}"] = 0.0
                feat[f"y_roll_std_{w}"] = 0.0
                feat[f"y_roll_max_{w}"] = 0.0
                feat[f"y_roll_min_{w}"] = 0.0
                feat[f"y_ewma_{w}"] = 0.0

        X_one = pd.DataFrame([{k: feat.get(k, 0.0) for k in feature_cols}])
        yhat = float(model.predict(X_one)[0])
        yhat = max(0.0, yhat)

        rows.append({"ds": ds, "yhat": yhat})
        y_hist.append(yhat)

    return pd.DataFrame(rows)

def _train_hybrid(df_feat: pd.DataFrame, holidays: pd.DataFrame):
    df_feat = df_feat.dropna().copy()
    if len(df_feat) < max(120, HORIZON_DAYS * 3):
        # Fallback for short data: Use defaults (no optuna to save time)
        p_train, _ = _fit_prophet_and_predict(
            df_feat[["ds", "y"] + REG_COLS], df_feat[["ds", "y"] + REG_COLS], holidays
        )
        # Basic Params fallback
        default_params = {"objective": "tweedie", "n_estimators": 500}
        model = LGBMRegressor(**default_params)
        cols = [c for c in df_feat.columns if c not in {"ds", "y"}] + ["prophet_yhat"]
        df_temp = df_feat.copy()
        df_temp["prophet_yhat"] = p_train
        df_temp = df_temp.dropna()
        model.fit(df_temp[cols], df_temp["y"])
        return model, cols, None, default_params

    split = len(df_feat) - HORIZON_DAYS
    train_df = df_feat.iloc[:split].copy()
    val_df = df_feat.iloc[split:].copy()

    p_train, p_val = _fit_prophet_and_predict(
        train_df[["ds", "y"] + REG_COLS], val_df[["ds", "y"] + REG_COLS], holidays
    )

    # Train stacking model WITH OPTUNA
    model, cols, best_params = _train_lgbm_stacking_optuna(train_df, p_train)

    future_exog = val_df[["ds", "is_holiday"] + REG_COLS].copy()
    pred_val_df = _recursive_hybrid_forecast(
        hist_df=train_df[["ds", "y"]],
        future_exog=future_exog,
        prophet_yhat_future=p_val,
        model=model,
        feature_cols=cols,
    )

    val_mae = mean_absolute_error(val_df["y"], pred_val_df["yhat"])
    return model, cols, val_mae, best_params

def forecast_one_dish(df, weather, holidays, dish) -> DishForecast:
    dish_daily = _prepare_dish_daily_series(df, dish)
    df_all = _merge_exog(dish_daily, weather, holidays)
    df_all = _add_date_features(df_all)
    df_feat = _add_lag_roll_features(df_all)

    # Optuna happens inside here
    model, cols, val_mae, best_params = _train_hybrid(df_feat, holidays)

    future_ds = pd.date_range(df_all["ds"].max() + pd.Timedelta(days=1), periods=HORIZON_DAYS, freq="D")

    if DATA_WEATHER_FUTURE.exists():
        wf = pd.read_csv(DATA_WEATHER_FUTURE, encoding="utf-8-sig")
        wf["ds"] = pd.to_datetime(wf["ds"])
        future_weather = wf[wf["ds"].isin(future_ds)][["ds"] + REG_COLS].copy()
        if len(future_weather) < len(future_ds): pass
    else:
        last = weather.iloc[-1]
        future_weather = pd.DataFrame({"ds": future_ds})
        for c in REG_COLS: future_weather[c] = float(last.get(c, 0.0))

    future_exog = future_weather.copy()
    future_exog["is_holiday"] = _add_holiday_flag(future_exog["ds"], holidays)

    p_full, p_future = _fit_prophet_and_predict(
        df_feat[["ds", "y"] + REG_COLS],
        future_exog[["ds"] + REG_COLS],
        holidays
    )

    # Retrain final model with BEST PARAMS on FULL DATA
    df_full = df_feat.copy()
    df_full["prophet_yhat"] = p_full
    df_full = df_full.dropna(subset=cols + ["y"])
    model_full = LGBMRegressor(**best_params)
    model_full.fit(df_full[cols], df_full["y"])

    pred_future = _recursive_hybrid_forecast(
        hist_df=df_all[["ds", "y"]],
        future_exog=future_exog,
        prophet_yhat_future=p_future,
        model=model_full,
        feature_cols=cols,
    )

    history_tail = df_all[["ds", "y"]].tail(HISTORY_PLOT_DAYS).copy()
    return DishForecast(dish, val_mae, pred_future, history_tail, best_params)

def plot_results(results, summary, top_n=TOP_N_PLOT):
    if not results: return
    top = summary.sort_values("forecast_sum", ascending=False).head(top_n)
    top_dishes = top["dish"].tolist()

    plt.figure(figsize=(12, max(4, 0.4 * len(top))))
    plt.barh(top["dish"], top["forecast_sum"], color='skyblue')
    plt.gca().invert_yaxis()
    plt.title(f"V6 Optuna Optimized: Top {len(top)} Sales ({HORIZON_DAYS} Days)")
    plt.xlabel("Total Forecasted Sales")
    plt.tight_layout()
    plt.savefig(OUT_DIR / f"forecast_top{len(top)}_bar.png", dpi=200)
    plt.close()

    n = len(top_dishes)
    cols = 3
    rows = int(np.ceil(n / cols))
    fig, axes = plt.subplots(rows, cols, figsize=(15, 4 * rows))
    axes = np.array(axes).reshape(-1)

    by_dish = {r.dish: r for r in results}
    for i, dish in enumerate(top_dishes):
        ax = axes[i]
        r = by_dish[dish]
        ax.plot(r.history_tail["ds"], r.history_tail["y"], 'k.-', alpha=0.3, label="History")
        ax.plot(r.pred_future["ds"], r.pred_future["yhat"], 'r.-', label="Forecast V6")
        ax.set_title(dish)
        if i == 0: ax.legend()

    plt.tight_layout()
    plt.savefig(OUT_DIR / f"forecast_top{len(top_dishes)}_lines.png", dpi=200)
    plt.close()

def main():
    _ensure_dirs()
    df, weather, hol = _load_inputs()
    holidays = _build_holidays(hol)

    dishes = df["菜品"].dropna().unique().tolist()
    if MAX_DISHES: dishes = dishes[:MAX_DISHES]

    results = []
    print(f"Starting V6 (Optuna Auto-Tuning) for {len(dishes)} dishes...")
    print(f"Trials per dish: {OPTUNA_TRIALS} (This may take a while...)")

    for i, dish in enumerate(dishes, 1):
        try:
            r = forecast_one_dish(df, weather, holidays, dish)
            results.append(r)
            r.pred_future.to_csv(OUT_FORECASTS_DIR / f"{_sanitize_filename(dish)}.csv", index=False)
            print(f"[{i}/{len(dishes)}] {dish}: OK | Best LR: {r.best_params.get('learning_rate', 'N/A'):.4f}")
        except Exception as e:
            print(f"[{i}/{len(dishes)}] {dish}: FAILED {e}")

    if results:
        summary_rows = []
        for r in results:
            preds = r.pred_future["yhat"]
            dates = pd.to_datetime(r.pred_future["ds"])
            summary_rows.append({
                "dish": r.dish,
                "val_mae": r.val_mae,
                "forecast_sum": preds.sum(),
                "forecast_mean": preds.mean(),
                "forecast_start": dates.min().strftime("%Y-%m-%d"),
                "forecast_end": dates.max().strftime("%Y-%m-%d")
            })

        summary = pd.DataFrame(summary_rows)
        summary = summary.sort_values("forecast_sum", ascending=False)
        summary.to_csv(OUT_DIR / "summary.csv", index=False, encoding="utf-8-sig")

        plot_results(results, summary)
        print("Optimization Complete. Results saved to 'outputs_lgbm_v6_optuna'.")

if __name__ == "__main__":
    main()
