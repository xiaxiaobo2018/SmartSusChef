import pandas as pd
from pathlib import Path

INPUT_FILE = "1kaggle_data.csv"
OUTPUT_FILE = "1final_ingredients.csv"

def process_ingredients_data():
    input_path = Path(INPUT_FILE)
    if not input_path.exists():
        print(f"Error: File {INPUT_FILE} not found. Check path.")
        return

    print(f"Reading data from {INPUT_FILE}...")
    df = pd.read_csv(input_path)

    required_cols = ['date', 'key_ingredients_tags', 'quantity_sold']
    missing_cols = [c for c in required_cols if c not in df.columns]
    if missing_cols:
        print(f"Error: Missing columns: {missing_cols}")
        return

    df = df[required_cols].dropna().copy()
    
    df['key_ingredients_tags'] = df['key_ingredients_tags'].astype(str).str.split(',')
    
    df_exploded = df.explode('key_ingredients_tags')
    
    df_exploded['key_ingredients_tags'] = df_exploded['key_ingredients_tags'].str.strip()
    df_exploded = df_exploded[df_exploded['key_ingredients_tags'] != ""]
    
    df_final = df_exploded.groupby(['date', 'key_ingredients_tags'])['quantity_sold'].sum().reset_index()
    
    df_final = df_final.rename(columns={
        'date': 'date',
        'key_ingredients_tags': 'dish_name', 
        'quantity_sold': 'quantity'
    })

    try:
        df_final['date'] = pd.to_datetime(df_final['date'])
        df_final = df_final.sort_values(by=['date', 'dish_name'])
    except Exception as e:
        print(f"Warning: Date formatting issue. {e}")

    df_final.to_csv(OUTPUT_FILE, index=False, encoding="utf-8-sig")
    
    print(f"Success! Exploded ingredient data saved to: {OUTPUT_FILE}")
    print(f"Total unique ingredients extracted: {df_final['dish_name'].nunique()}")
    
    top_ingredients = df_final.groupby('dish_name')['quantity'].sum().nlargest(5)
    print("\nTop 5 Ingredients by Volume:")
    print(top_ingredients.to_string())

if __name__ == "__main__":
    process_ingredients_data()