import pandas as pd
import numpy as np
from pathlib import Path
from neuralprophet import NeuralProphet, set_random_seed
import matplotlib.pyplot as plt
import os
import sys
import warnings

warnings.simplefilter(action='ignore', category=pd.errors.PerformanceWarning)
set_random_seed(42)

DATA_FOOD = Path("food_sales_eng.csv")
DATA_WEATHER = Path("df_weather.csv")
DATA_HOLIDAY = Path("df_holiday.csv")
DATA_WEATHER_FUTURE = Path("df_weather_future.csv")

OUT_DIR = Path("outputs_neural")
OUT_FORECASTS_DIR = OUT_DIR / "forecasts"
OUT_PLOTS_DIR = OUT_DIR / "plots"

FORECAST_HORIZON = 14

def create_directories():
    if not OUT_DIR.exists():
        OUT_DIR.mkdir()
    if not OUT_FORECASTS_DIR.exists():
        OUT_FORECASTS_DIR.mkdir()
    if not OUT_PLOTS_DIR.exists():
        OUT_PLOTS_DIR.mkdir()

def clean_and_load(path, desc="file"):
    if not path.exists():
        if desc == "food":
            print(f"ERROR: File {path} not found.")
            sys.exit(1)
        return None
    
    try:
        df = pd.read_csv(path)
        df.columns = df.columns.str.strip().str.lower()
        print(f"[{desc}] Loaded. Columns: {list(df.columns)}")
        
        # Auto-detect date column
        if 'date' not in df.columns:
            possible_dates = [c for c in df.columns if 'date' in c or 'time' in c or 'ds' in c]
            if possible_dates:
                df = df.rename(columns={possible_dates[0]: 'date'})
            else:
                if desc == "food":
                    raise ValueError(f"CRITICAL: No date column in {desc} file.")
                return None

        df['date'] = pd.to_datetime(df['date'])
        return df
    except Exception as e:
        print(f"Error reading {path}: {e}")
        return None

def align_dates(df_target, df_ref, desc="data"):
    """
    Auto-shift df_target dates to match df_ref year range.
    """
    if df_target is None or df_ref is None:
        return df_target

    ref_year = df_ref['date'].mean().year
    target_year = df_target['date'].mean().year
    diff = int(ref_year - target_year)

    if abs(diff) > 1:
        print(f"[{desc}] Detected year mismatch (Ref: {ref_year}, Target: {target_year}). Shifting target by {diff} years.")
        df_target['date'] = df_target['date'] + pd.DateOffset(years=diff)
    
    return df_target

def load_data():
    # 1. Load Food Data
    df_food = clean_and_load(DATA_FOOD, "food")

    # Rename columns for NeuralProphet standard
    rename_map = {
        'quantity_sold': 'quantity',
        'salesqty': 'quantity',
        'daily_usage': 'quantity',
        'item_name': 'dish_name',
        'menu_item_name': 'dish_name'
    }
    col_map = {k:v for k,v in rename_map.items() if k in df_food.columns}
    df_food = df_food.rename(columns=col_map)
    
    if 'quantity' not in df_food.columns or 'dish_name' not in df_food.columns:
        raise ValueError(f"Missing required columns (quantity, dish_name). Found: {list(df_food.columns)}")

    # 2. Load Weather & Holidays
    df_weather = clean_and_load(DATA_WEATHER, "weather")
    df_holidays = clean_and_load(DATA_HOLIDAY, "holiday")

    # 3. TIME TRAVEL FIX: Align Weather/Holidays to Food Data Years
    if df_weather is not None:
        df_weather = align_dates(df_weather, df_food, "weather")
    else:
        # Create dummy weather matching food dates
        dates = pd.date_range(df_food['date'].min(), df_food['date'].max())
        df_weather = pd.DataFrame({'date': dates, 'temp': 25.0, 'rain': 0.0})

    if df_holidays is not None:
        df_holidays = align_dates(df_holidays, df_food, "holiday")
    else:
        df_holidays = pd.DataFrame(columns=['date', 'event_name'])

    # 4. Generate Future Weather (Extending from Food Data END)
    # Critical: Must start AFTER the food data ends
    last_food_date = df_food['date'].max()
    future_dates = pd.date_range(start=last_food_date + pd.Timedelta(days=1), periods=FORECAST_HORIZON)
    
    df_weather_future = pd.DataFrame({'date': future_dates})
    
    # Fill future weather with historical averages
    weather_cols = [c for c in df_weather.columns if c != 'date']
    for col in weather_cols:
        if pd.api.types.is_numeric_dtype(df_weather[col]):
            df_weather_future[col] = df_weather[col].mean()
        else:
            df_weather_future[col] = df_weather[col].mode()[0] if not df_weather[col].mode().empty else 0

    return df_food, df_weather, df_holidays, df_weather_future

def prepare_weather_data(df_hist, df_fut):
    # Ensure columns match
    common_cols = list(set(df_hist.columns) & set(df_fut.columns))
    df_hist = df_hist[common_cols].copy()
    df_fut = df_fut[common_cols].copy()

    # Combine
    df_weather_all = pd.concat([df_hist, df_fut], ignore_index=True)
    
    # Remove duplicates and sort
    df_weather_all = df_weather_all.drop_duplicates(subset=['date']).sort_values('date')
    
    # NeuralProphet needs 'ds'
    df_weather_all = df_weather_all.rename(columns={'date': 'ds'})
    
    weather_cols = [c for c in df_weather_all.columns if c != 'ds']
    return df_weather_all, weather_cols

def prepare_holiday_data(df_holidays):
    if df_holidays.empty:
        return pd.DataFrame(columns=['ds', 'event'])

    col_map = {'date': 'ds'}
    # Find event column
    possible_events = [c for c in df_holidays.columns if 'event' in c or 'holiday' in c or 'name' in c]
    if possible_events:
        col_map[possible_events[0]] = 'event'
    
    df_events = df_holidays.rename(columns=col_map)
    if 'event' not in df_events.columns:
        df_events['event'] = 'holiday'
        
    df_events = df_events[['ds', 'event']]
    return df_events

def train_and_predict(dish_name, df_dish, df_weather_all, weather_cols, df_events):
    print(f"Processing: {dish_name}")
    
    # Prepare training data
    df_train = df_dish[['date', 'quantity']].rename(columns={'date': 'ds', 'quantity': 'y'})
    
    # Merge weather for training period
    # Important: Use LEFT merge to keep all food dates, fill missing weather if any
    df_train = pd.merge(df_train, df_weather_all, on='ds', how='left')
    df_train = df_train.fillna(method='ffill').fillna(method='bfill') # Fill gaps

    m = NeuralProphet(
        growth="linear",
        yearly_seasonality=True,
        weekly_seasonality=True,
        daily_seasonality=False,
        batch_size=32,
        epochs=40,  # Adjusted for speed
        learning_rate=0.01,
        n_forecasts=FORECAST_HORIZON,
        quantiles=[0.1, 0.9]
    )

    # Add Holidays
    if not df_events.empty:
        m = m.add_events(["holiday_event"])
        events_df = pd.DataFrame({
            "event": "holiday_event",
            "ds": df_events['ds']
        })
        history_df = m.create_df_with_events(df_train, events_df)
    else:
        history_df = df_train

    # Add Regressors
    for col in weather_cols:
        m.add_future_regressor(name=col)

    # Fit
    m.fit(history_df, freq="D")

    # Predict
    # Create future dataframe (only 'ds')
    future = m.make_future_dataframe(history_df, periods=FORECAST_HORIZON, n_historic_predictions=True)
    
    # Merge weather for future period (CRITICAL STEP)
    future = pd.merge(future, df_weather_all[['ds'] + weather_cols], on='ds', how='left')
    
    # Fill any remaining NaNs (in case weather data is slightly short)
    future = future.fillna(method='ffill').fillna(method='bfill')

    forecast = m.predict(future)
    return forecast, m

def save_results(dish_name, forecast, model):
    clean_name = str(dish_name).replace("/", "_").replace(" ", "_").replace(":", "")
    
    cols_to_keep = ['ds', 'y', 'yhat1', 'yhat1 10.0%', 'yhat1 90.0%']
    available_cols = [c for c in cols_to_keep if c in forecast.columns]
    
    final_df = forecast[available_cols].copy()
    final_df = final_df.rename(columns={
        'yhat1': 'yhat',
        'yhat1 10.0%': 'yhat_lower',
        'yhat1 90.0%': 'yhat_upper'
    })
    
    file_path = OUT_FORECASTS_DIR / f"{clean_name}.csv"
    final_df.to_csv(file_path, index=False)
    
    try:
        fig = model.plot(forecast)
        plot_path = OUT_PLOTS_DIR / f"{clean_name}.png"
        plt.savefig(plot_path)
        plt.close(fig)
    except Exception:
        pass

def main():
    create_directories()
    
    try:
        df_food, df_weather, df_holidays, df_weather_future = load_data()
        
        df_weather_all, weather_cols = prepare_weather_data(df_weather, df_weather_future)
        df_events = prepare_holiday_data(df_holidays)
        
        unique_dishes = df_food['dish_name'].unique()
        
        summary_data = []

        for dish in unique_dishes:
            try:
                df_dish = df_food[df_food['dish_name'] == dish].copy()
                
                # Minimum data check
                if len(df_dish) < 15:
                    continue

                forecast, model = train_and_predict(dish, df_dish, df_weather_all, weather_cols, df_events)
                save_results(dish, forecast, model)
                
                last_forecast = forecast.iloc[-FORECAST_HORIZON:]['yhat1'].sum()
                summary_data.append({'dish': dish, 'forecast_sum_14days': last_forecast})
                
            except Exception as e:
                print(f"Error processing {dish}: {e}")

        summary_df = pd.DataFrame(summary_data)
        summary_df.to_csv(OUT_DIR / "summary_neural.csv", index=False)
        print("Completed Successfully.")
        
    except Exception as e:
        print(f"Critical Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()