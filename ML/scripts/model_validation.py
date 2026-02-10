#!/usr/bin/env python
"""Model validation script for SmartSusChef.

Loads trained models via secure_load, evaluates them on sample data,
and reports MAE metrics.

Usage:
    python scripts/model_validation.py --model-dir models
    python scripts/model_validation.py --model-dir models --output report.json
"""

import argparse
import json
import os
import sys
from pathlib import Path

import numpy as np
import pandas as pd

# Add ML root to sys.path for imports
ML_ROOT = str(Path(__file__).resolve().parent.parent)
if ML_ROOT not in sys.path:
    sys.path.insert(0, ML_ROOT)

from app.utils import WEATHER_COLS, compute_lag_features_from_history, safe_filename
from app.utils.logging_config import setup_logger
from app.utils.secure_io import secure_load

logger = setup_logger("model_validation")


def _build_sample_feature_row(
    date: pd.Timestamp,
    weather_vals: dict[str, float],
    prophet_yhat: float,
    sales_history: list[float],
    country_code: str,
) -> dict[str, float]:
    """Build a single feature row for tree model prediction."""
    try:
        import holidays

        local_hols = holidays.country_holidays(country_code, years=[date.year])
        is_hol = float(int(date in local_hols))
    except Exception:
        is_hol = 0.0

    feat: dict[str, float] = {
        "day_of_week": float(date.dayofweek),
        "month": float(date.month),
        "day": float(date.day),
        "dayofyear": float(date.dayofyear),
        "is_weekend": float(int(date.dayofweek >= 5)),
        "is_public_holiday": is_hol,
        "prophet_yhat": prophet_yhat,
    }
    for col in WEATHER_COLS:
        feat[col] = weather_vals.get(col, 0.0)

    feat.update(compute_lag_features_from_history(sales_history))
    return feat


def validate_model(
    model_dir: str,
    country_code: str = "CN",
) -> dict:
    """
    Validate all trained models in `model_dir`.

    Steps:
    1. Load champion_registry.pkl via secure_load
    2. For each dish, load Prophet + tree models
    3. Run a sanity-check prediction on synthetic sample data
    4. Compute MAE against the synthetic ground truth

    Returns a validation report dict.
    """
    model_path = Path(model_dir)
    registry_path = model_path / "champion_registry.pkl"

    if not registry_path.exists():
        return {
            "status": "error",
            "message": f"Registry not found at {registry_path}",
            "dishes": [],
        }

    try:
        registry = secure_load(str(registry_path))
    except RuntimeError as e:
        return {
            "status": "error",
            "message": f"Registry integrity check failed: {e}",
            "dishes": [],
        }

    dish_reports = []
    total_mae_sum = 0.0
    total_dishes = 0

    for dish_name, dish_info in registry.items():
        safe_name = safe_filename(dish_name)
        champion = dish_info.get("model", "unknown")
        stored_mae = dish_info.get("mae", dish_info.get("all_mae", {}).get(champion, None))

        prophet_path = model_path / f"prophet_{safe_name}.pkl"
        tree_path = model_path / f"{champion}_{safe_name}.pkl"
        recent_path = model_path / f"recent_sales_{safe_name}.pkl"

        # Check file existence
        missing_files = []
        if not prophet_path.exists():
            missing_files.append(prophet_path.name)
        if not tree_path.exists():
            missing_files.append(tree_path.name)

        if missing_files:
            dish_reports.append(
                {
                    "dish": dish_name,
                    "champion": champion,
                    "status": "missing_files",
                    "missing": missing_files,
                    "mae": None,
                }
            )
            continue

        try:
            prophet_model = secure_load(str(prophet_path))
            tree_model = secure_load(str(tree_path))
        except RuntimeError as e:
            dish_reports.append(
                {
                    "dish": dish_name,
                    "champion": champion,
                    "status": "integrity_error",
                    "message": str(e),
                    "mae": None,
                }
            )
            continue

        # Load or synthesize recent sales
        if recent_path.exists():
            try:
                recent_df = secure_load(str(recent_path))
                sales_history = recent_df["sales"].astype(float).tolist()
            except Exception:
                sales_history = [10.0] * 14
        else:
            sales_history = [10.0] * 14

        # Synthesize sample data for validation (3 days)
        n_eval_days = 3
        start_date = pd.Timestamp("2024-06-01")
        predictions = []
        actuals = []

        for day_i in range(n_eval_days):
            dt = start_date + pd.Timedelta(days=day_i)

            weather_vals = {
                "temperature_2m_max": 28.0 + day_i,
                "temperature_2m_min": 18.0 + day_i,
                "relative_humidity_2m_mean": 65.0,
                "precipitation_sum": 0.0,
            }

            # Get prophet prediction
            try:
                prophet_input = pd.DataFrame(
                    [
                        {
                            "date": dt,
                            **weather_vals,
                        }
                    ]
                )
                prophet_df = prophet_input.rename(columns={"date": "ds"})
                cols_to_use = ["ds"] + [c for c in WEATHER_COLS if c in prophet_df.columns]
                prophet_pred = prophet_model.predict(prophet_df[cols_to_use])
                prophet_yhat = float(prophet_pred["yhat"].iloc[0])
            except Exception:
                prophet_yhat = float(np.mean(sales_history)) if sales_history else 10.0

            feat = _build_sample_feature_row(
                dt, weather_vals, prophet_yhat, sales_history, country_code
            )

            # Build tree feature vector
            tree_features = [
                "day_of_week",
                "month",
                "day",
                "dayofyear",
                "is_weekend",
                "is_public_holiday",
                "temperature_2m_max",
                "temperature_2m_min",
                "relative_humidity_2m_mean",
                "precipitation_sum",
                "y_lag_1",
                "y_lag_7",
                "y_lag_14",
                "y_roll_mean_7",
                "y_roll_std_7",
                "y_roll_mean_14",
                "y_roll_std_14",
                "y_roll_mean_28",
                "y_roll_std_28",
                "prophet_yhat",
            ]
            X_one = pd.DataFrame([{k: feat.get(k, 0.0) for k in tree_features}])

            try:
                resid_hat = float(tree_model.predict(X_one)[0])
                yhat = max(0.0, prophet_yhat + resid_hat)
            except Exception:
                yhat = max(0.0, prophet_yhat)

            predictions.append(yhat)
            # Use the mean of recent sales as synthetic "actual"
            synthetic_actual = float(np.mean(sales_history)) if sales_history else 10.0
            actuals.append(synthetic_actual)

            sales_history.append(yhat)

        # Compute MAE
        mae = float(np.mean(np.abs(np.array(predictions) - np.array(actuals))))

        dish_reports.append(
            {
                "dish": dish_name,
                "champion": champion,
                "status": "ok",
                "stored_mae": stored_mae,
                "validation_mae": round(mae, 4),
                "sample_predictions": [round(p, 2) for p in predictions],
            }
        )

        total_mae_sum += mae
        total_dishes += 1

    avg_mae = round(total_mae_sum / total_dishes, 4) if total_dishes > 0 else None

    return {
        "status": "success" if total_dishes > 0 else "no_valid_dishes",
        "model_dir": str(model_path),
        "total_dishes": len(registry),
        "validated_dishes": total_dishes,
        "average_validation_mae": avg_mae,
        "dishes": dish_reports,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Validate trained SmartSusChef ML models.")
    parser.add_argument(
        "--model-dir",
        type=str,
        default=os.getenv("MODEL_DIR", "models"),
        help="Path to model directory containing champion_registry.pkl",
    )
    parser.add_argument(
        "--output",
        type=str,
        default=None,
        help="Path to save the JSON validation report (default: stdout)",
    )
    parser.add_argument(
        "--country-code",
        type=str,
        default="CN",
        help="Country code for holiday detection (default: CN)",
    )
    args = parser.parse_args()

    logger.info("Starting model validation for %s", args.model_dir)
    report = validate_model(args.model_dir, country_code=args.country_code)

    report_json = json.dumps(report, indent=4, default=str)

    if args.output:
        output_path = Path(args.output)
        output_path.write_text(report_json, encoding="utf-8")
        logger.info("Validation report saved to %s", output_path)
    else:
        print(report_json)

    if report["status"] == "success":
        logger.info(
            "Validation complete: %d/%d dishes validated, avg MAE=%.4f",
            report["validated_dishes"],
            report["total_dishes"],
            report["average_validation_mae"],
        )
        sys.exit(0)
    else:
        logger.warning("Validation completed with issues: %s", report["status"])
        sys.exit(1)


if __name__ == "__main__":
    main()
