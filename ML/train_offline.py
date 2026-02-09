from __future__ import annotations

import argparse
import logging
import os
from collections.abc import Iterable

import pandas as pd

from app.store_manager import StoreModelManager

logger = logging.getLogger("train_offline")


def _configure_logging() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    )


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


def _train_store_ids(manager: StoreModelManager, store_ids: Iterable[int]) -> None:
    for store_id in store_ids:
        logger.info("Training store %s ...", store_id)
        result = manager.train_store_models(int(store_id))
        logger.info("Store %s result: %s", store_id, result)


def main() -> None:
    _configure_logging()

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
    args = parser.parse_args()

    if not args.store_id and not args.all:
        raise SystemExit("Please provide --store-id or --all.")

    model_dir = os.getenv("MODEL_DIR", "models")
    manager = StoreModelManager(base_model_dir=model_dir)

    if args.all:
        store_ids = _fetch_store_ids(manager)
        if args.limit is not None:
            store_ids = store_ids[: args.limit]
        _train_store_ids(manager, store_ids)
        return

    _train_store_ids(manager, args.store_id or [])


if __name__ == "__main__":
    main()
