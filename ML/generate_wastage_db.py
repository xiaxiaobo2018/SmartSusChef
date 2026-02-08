import pandas as pd
import numpy as np
from pathlib import Path

FORECAST_DIR = Path("outputs_lgbm/forecasts")
OUTPUT_DB_FILE = "wastage_data_for_db.csv"
RANDOM_SEED = 42  # Ensures reproducible results for demo

np.random.seed(RANDOM_SEED)

def get_mock_cost(dish_name):
    """
    Generates a consistent mock cost price for a dish based on its name hash.
    Replace this logic if you have a real cost database.
    """
    return 15 + (hash(dish_name) % 40) 

def generate_wastage_report():
    if not FORECAST_DIR.exists():
        print(f"Error: Directory {FORECAST_DIR} not found. Please run the training script first.")
        return

    all_files = list(FORECAST_DIR.glob("*.csv"))
    if not all_files:
        print("Error: No forecast files found.")
        return

    print(f"Found {len(all_files)} forecast files. Generating wastage data...")

    db_rows = []

    for f in all_files:
        try:
            df = pd.read_csv(f)
            # Restore dish name from filename (e.g., "Chicken_Rice.csv" -> "Chicken Rice")
            dish_name = f.stem.replace("_", " ") 
            cost_per_plate = get_mock_cost(dish_name)
            
            for _, row in df.iterrows():
                forecast = row['yhat']
                
                # Logic 1: Prepare based on AI Forecast + Safety Buffer
                # We assume the kitchen prepares 10% more than predicted to avoid stockouts
                prepared_qty = int(np.ceil(forecast * 1.1))
                
                # Logic 2: Simulate Actual Sales
                # Actual sales fluctuate around the forecast (85% to 105%)
                actual_sold = int(forecast * np.random.uniform(0.85, 1.05))
                
                # Constraint: Cannot sell more than prepared
                actual_sold = min(actual_sold, prepared_qty)
                
                # Logic 3: Calculate Wastage
                wastage_qty = prepared_qty - actual_sold
                wastage_cost = wastage_qty * cost_per_plate
                
                # Append to list
                db_rows.append({
                    "date": row['ds'],
                    "dish_name": dish_name,
                    "predicted_demand": round(forecast, 2),
                    "actual_prepared": prepared_qty,
                    "actual_sold": actual_sold,
                    "wastage_qty": wastage_qty,
                    "unit_cost": cost_per_plate,
                    "total_loss_money": round(wastage_cost, 2),
                    "status": "AI Optimized"
                })
        except Exception as e:
            print(f"Skipping file {f.name} due to error: {e}")

    # Save final dataset
    if db_rows:
        df_db = pd.DataFrame(db_rows)
        df_db.to_csv(OUTPUT_DB_FILE, index=False, encoding="utf-8-sig")
        
        total_loss = df_db['total_loss_money'].sum()
        print(f"\nSuccessfully generated: {OUTPUT_DB_FILE}")
        print(f"Total Records: {len(df_db)}")
        print(f"Total Simulated Loss (AI Optimized): ${total_loss:,.2f}")
    else:
        print("No data generated.")

if __name__ == "__main__":
    generate_wastage_report()