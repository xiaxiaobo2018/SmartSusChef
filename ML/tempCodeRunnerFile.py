
    print(f"Found {len(all_files)} forecast files. Generating wastage data...")

    db_rows = []

    for f in all_files:
        try:
            df = pd.read_csv(f)
            # Restore dish name from filename (e.g., "Chicken_Rice.csv" -> "Chicken Rice")
            dish_name = f.stem.replace("_", " ") 
            cost_per_plate = get_mock_cost(dish_name)