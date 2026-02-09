import pandas as pd
from pathlib import Path
import warnings

warnings.simplefilter(action='ignore', category=FutureWarning)

DATA_DIR = Path("data_USA")
OUTPUT_FILE = "final.csv"

def clean_headers(df):
    df.columns = df.columns.str.strip().str.replace('"', '')
    return df

def main():
    try:
        if not DATA_DIR.exists():
            print(f"Error: Directory '{DATA_DIR}' not found.")
            return

        print(f"Loading files from {DATA_DIR}...")
        
        df_sales = pd.read_csv(DATA_DIR / 'menuitem.csv')
        df_menu = pd.read_csv(DATA_DIR / 'menu_items.csv')
        df_rec_ingr = pd.read_csv(DATA_DIR / 'recipe_ingredient_assignments.csv')
        df_rec_sub = pd.read_csv(DATA_DIR / 'recipe_sub_recipe_assignments.csv')
        df_sub_ingr = pd.read_csv(DATA_DIR / 'sub_recipe_ingr_assignments.csv')
        df_ingr_names = pd.read_csv(DATA_DIR / 'ingredients.csv')

        datasets = [df_sales, df_menu, df_rec_ingr, df_rec_sub, df_sub_ingr, df_ingr_names]
        for df in datasets:
            clean_headers(df)

        print("Processing data...")

        df_sales['date'] = pd.to_datetime(df_sales['date'], format='%y-%m-%d')
        df_sales['date'] = df_sales['date'] + pd.DateOffset(years=10)

        daily_sales = df_sales.groupby(['date', 'PLU'])['Quantity'].sum().reset_index()
        daily_sales.rename(columns={'Quantity': 'SalesQty'}, inplace=True)

        sales_with_recipe = pd.merge(daily_sales, df_menu[['PLU', 'RecipeId']], on='PLU', how='inner')

        direct_usage = pd.merge(sales_with_recipe, df_rec_ingr, on='RecipeId', how='inner')
        direct_usage['total_usage'] = direct_usage['SalesQty'] * direct_usage['Quantity']
        branch_a = direct_usage[['date', 'IngredientId', 'total_usage']]

        sub_usage_step1 = pd.merge(sales_with_recipe, df_rec_sub, on='RecipeId', how='inner')
        sub_usage_step2 = pd.merge(sub_usage_step1, df_sub_ingr, on='SubRecipeId', how='inner')
        
        sub_usage_step2['total_usage'] = (
            sub_usage_step2['SalesQty'] * sub_usage_step2['Factor'] * sub_usage_step2['Quantity']
        )
        branch_b = sub_usage_step2[['date', 'IngredientId', 'total_usage']]

        all_usage = pd.concat([branch_a, branch_b], ignore_index=True)
        final_daily = all_usage.groupby(['date', 'IngredientId'])['total_usage'].sum().reset_index()

        final_df = pd.merge(final_daily, df_ingr_names[['IngredientId', 'IngredientName']], on='IngredientId', how='inner')

        final_df = final_df.rename(columns={
            'date': 'date',
            'IngredientName': 'dish_name',
            'total_usage': 'quantity'
        })

        final_df['dish_name'] = final_df['dish_name'].str.strip()
        final_df = final_df[['date', 'dish_name', 'quantity']].sort_values('date')

        final_df.to_csv(OUTPUT_FILE, index=False, encoding='utf-8-sig')
        
        print(f"Success! Data saved to: {OUTPUT_FILE}")
        print(final_df.head())

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()