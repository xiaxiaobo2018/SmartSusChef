import argparse
import os
from collections.abc import Iterable
from concurrent.futures import ProcessPoolExecutor, as_completed

import pandas as pd

from app.store_manager import StoreModelManager
from app.utils.logging_config import configure_basic_logging, setup_logger

logger = setup_logger("train_offline")

DEFAULT_MAX_WORKERS = 4


def _fetch_store_ids(manager: StoreModelManager) -> list[int]:
    engine = manager._get_engine()  # Reuse existing DB config/connection
    if engine is None:
        raise RuntimeError("DATABASE_URL not set or database unavailable.")

    queries = [
        "SELECT Id FROM Store",
        "SELECT id FROM Store",
    ]

    last_err: Exception | None = None
    for q in queries:
        try:
            df = pd.read_sql(q, engine)
            if "Id" in df.columns:
                return [int(x) for x in df["Id"].tolist()]
            if "id" in df.columns:
                return [int(x) for x in df["id"].tolist()]
        except Exception as e:
            last_err = e
            continue

    raise RuntimeError(f"Failed to fetch store list. Last error: {last_err}")


def _train_single_store(base_model_dir: str, store_id: int) -> dict:
    """Train models for a single store (top-level function for pickling)."""
    mgr = StoreModelManager(base_model_dir=base_model_dir)
    result = mgr.train_store_models(store_id)
    return {"store_id": store_id, **result}


def _train_store_ids(
    manager: StoreModelManager,
    store_ids: Iterable[int],
    max_workers: int = 1,
) -> None:
    ids = list(store_ids)
    if not ids:
        logger.info("No stores to train.")
        return

    if max_workers <= 1 or len(ids) == 1:
        for store_id in ids:
            logger.info("Initiating training for a store (ID masked).")
            result = manager.train_store_models(int(store_id))
            logger.info("Training result for store (ID masked): %s", result["status"])
        return

    logger.info("Training %d stores with %d parallel workers.", len(ids), max_workers)
    with ProcessPoolExecutor(max_workers=max_workers) as pool:
        futures = {
            pool.submit(_train_single_store, manager.base_model_dir, sid): sid for sid in ids
        }
        for future in as_completed(futures):
            try:
                result = future.result()
                logger.info("Training result for store (ID masked): %s", result.get("status"))
            except Exception as exc:
                logger.error("Training failed for a store (ID masked): %s", exc)


def main() -> None:
    configure_basic_logging()

    parser = argparse.ArgumentParser(
        description="Offline training entrypoint for SmartSusChef ML models."
    )
    parser.add_argument(
        "--store-id",
        action="append",
        type=int,
        help="Train a specific store id. Can be repeated.",
    )
    parser.add_argument(
        "--all",
        action="store_true",
        help="Train all stores found in DB.",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Limit number of stores when using --all.",
    )
    parser.add_argument(
        "--workers",
        type=int,
        default=DEFAULT_MAX_WORKERS,
        help=f"Number of parallel workers (default: {DEFAULT_MAX_WORKERS}).",
    )
    args = parser.parse_args()

    if not args.store_id and not args.all:
        raise SystemExit("Please provide --store-id or --all.")

    model_dir = os.getenv("MODEL_DIR", "models")
    manager = StoreModelManager(base_model_dir=model_dir)

    if args.all:
        store_ids = _fetch_store_ids(manager)
        if args.limit is not None:
            store_ids = store_ids[: args.limit]
        _train_store_ids(manager, store_ids, max_workers=args.workers)
        return

    _train_store_ids(manager, args.store_id or [], max_workers=args.workers)


if __name__ == "__main__":
    main()
