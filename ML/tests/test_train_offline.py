"""Tests for train_offline.py: store ID fetching, sequential/parallel training, CLI."""

import sys

import pandas as pd
import pytest

import train_offline as toff


class DummyManager:
    def __init__(self, base_model_dir="models"):
        self._engine = object()
        self.base_model_dir = base_model_dir
        self.trained = []

    def _get_engine(self):
        return self._engine

    def train_store_models(self, store_id: int):
        self.trained.append(store_id)
        return {"status": "ok", "store_id": store_id}


# ===================================================================
# _fetch_store_ids
# ===================================================================
class TestFetchStoreIds:
    def test_no_engine_raises(self, monkeypatch):
        mgr = DummyManager()
        mgr._engine = None
        with pytest.raises(RuntimeError, match="DATABASE_URL"):
            toff._fetch_store_ids(mgr)

    def test_id_column_uppercase(self, monkeypatch):
        mgr = DummyManager()

        def _read_sql(query, engine):
            return pd.DataFrame({"Id": [1, 2, 3]})

        monkeypatch.setattr(pd, "read_sql", _read_sql)
        assert toff._fetch_store_ids(mgr) == [1, 2, 3]

    def test_id_column_lowercase_with_retry(self, monkeypatch):
        mgr = DummyManager()
        calls = {"n": 0}

        def _read_sql(query, engine):
            calls["n"] += 1
            if calls["n"] == 1:
                raise RuntimeError("bad query")
            return pd.DataFrame({"id": [9]})

        monkeypatch.setattr(pd, "read_sql", _read_sql)
        assert toff._fetch_store_ids(mgr) == [9]

    def test_both_queries_fail_raises(self, monkeypatch):
        mgr = DummyManager()

        def _read_sql(query, engine):
            raise RuntimeError("all queries fail")

        monkeypatch.setattr(pd, "read_sql", _read_sql)
        with pytest.raises(RuntimeError, match="Failed to fetch store list"):
            toff._fetch_store_ids(mgr)


# ===================================================================
# _train_single_store
# ===================================================================
class TestTrainSingleStore:
    def test_creates_manager_and_trains(self, monkeypatch, tmp_path):
        """_train_single_store creates a new StoreModelManager and calls train_store_models."""
        mock_mgr = DummyManager(base_model_dir=str(tmp_path))

        monkeypatch.setattr(
            toff, "StoreModelManager",
            lambda base_model_dir=None: mock_mgr,
        )
        result = toff._train_single_store(str(tmp_path), 42)
        assert result["store_id"] == 42
        assert result["status"] == "ok"
        assert 42 in mock_mgr.trained

    def test_returns_error_on_failure(self, monkeypatch, tmp_path):
        """If train_store_models raises, _train_single_store propagates it."""

        class FailingManager:
            def train_store_models(self, store_id):
                raise RuntimeError("training exploded")

        monkeypatch.setattr(
            toff, "StoreModelManager",
            lambda base_model_dir=None: FailingManager(),
        )
        with pytest.raises(RuntimeError, match="training exploded"):
            toff._train_single_store(str(tmp_path), 1)


# ===================================================================
# _train_store_ids (sequential and parallel)
# ===================================================================
class TestTrainStoreIds:
    def test_sequential_calls_manager(self):
        mgr = DummyManager()
        toff._train_store_ids(mgr, [1, 2])
        assert mgr.trained == [1, 2]

    def test_empty_list_no_training(self):
        mgr = DummyManager()
        toff._train_store_ids(mgr, [])
        assert mgr.trained == []

    def test_single_store_always_sequential(self):
        """Even with max_workers>1, a single store runs sequentially."""
        mgr = DummyManager()
        toff._train_store_ids(mgr, [5], max_workers=4)
        assert mgr.trained == [5]

    def test_parallel_path_invoked(self, monkeypatch, tmp_path):
        """When max_workers>1 and multiple stores, ProcessPoolExecutor is used."""
        mgr = DummyManager(base_model_dir=str(tmp_path))
        submitted = []

        class MockFuture:
            def __init__(self, result_val):
                self._result = result_val

            def result(self):
                return self._result

        class MockPool:
            def __init__(self, max_workers=None):
                self.max_workers = max_workers

            def __enter__(self):
                return self

            def __exit__(self, *args):
                pass

            def submit(self, fn, *args, **kwargs):
                submitted.append(args)
                return MockFuture({"store_id": args[1], "status": "ok"})

        def mock_as_completed(futures):
            return futures.keys()

        monkeypatch.setattr(toff, "ProcessPoolExecutor", MockPool)
        monkeypatch.setattr(toff, "as_completed", mock_as_completed)

        toff._train_store_ids(mgr, [10, 20], max_workers=2)
        # Two submissions
        assert len(submitted) == 2
        store_ids_submitted = {s[1] for s in submitted}
        assert store_ids_submitted == {10, 20}

    def test_parallel_handles_exception(self, monkeypatch, tmp_path):
        """When a future raises, it is logged but does not crash."""
        mgr = DummyManager(base_model_dir=str(tmp_path))

        class MockFuture:
            def result(self):
                raise RuntimeError("worker crashed")

        class MockPool:
            def __init__(self, max_workers=None):
                pass

            def __enter__(self):
                return self

            def __exit__(self, *args):
                pass

            def submit(self, fn, *args, **kwargs):
                return MockFuture()

        def mock_as_completed(futures):
            return futures.keys()

        monkeypatch.setattr(toff, "ProcessPoolExecutor", MockPool)
        monkeypatch.setattr(toff, "as_completed", mock_as_completed)

        # Should not raise despite worker failure
        toff._train_store_ids(mgr, [10, 20], max_workers=2)


# ===================================================================
# main() CLI
# ===================================================================
class TestMainCLI:
    def test_main_requires_args(self, monkeypatch):
        monkeypatch.setattr(sys, "argv", ["train_offline.py"])
        with pytest.raises(SystemExit):
            toff.main()

    def test_main_store_ids(self, monkeypatch):
        mgr = DummyManager()
        monkeypatch.setattr(toff, "StoreModelManager", lambda base_model_dir=None: mgr)
        called = {}

        def _train(manager, ids, max_workers=1):
            called["ids"] = list(ids)

        monkeypatch.setattr(toff, "_train_store_ids", _train)
        monkeypatch.setattr(sys, "argv", ["train_offline.py", "--store-id", "1", "--store-id", "2"])
        toff.main()
        assert called["ids"] == [1, 2]

    def test_main_all_with_limit(self, monkeypatch):
        mgr = DummyManager()
        monkeypatch.setattr(toff, "StoreModelManager", lambda base_model_dir=None: mgr)
        monkeypatch.setattr(toff, "_fetch_store_ids", lambda manager: [5, 6, 7])
        called = {}

        def _train(manager, ids, max_workers=1):
            called["ids"] = list(ids)

        monkeypatch.setattr(toff, "_train_store_ids", _train)
        monkeypatch.setattr(sys, "argv", ["train_offline.py", "--all", "--limit", "1"])
        toff.main()
        assert called["ids"] == [5]

    def test_main_workers_flag(self, monkeypatch):
        """--workers flag is passed through to _train_store_ids."""
        mgr = DummyManager()
        monkeypatch.setattr(toff, "StoreModelManager", lambda base_model_dir=None: mgr)
        called = {}

        def _train(manager, ids, max_workers=1):
            called["max_workers"] = max_workers

        monkeypatch.setattr(toff, "_train_store_ids", _train)
        monkeypatch.setattr(
            sys, "argv",
            ["train_offline.py", "--store-id", "1", "--workers", "8"],
        )
        toff.main()
        assert called["max_workers"] == 8

    def test_main_all_no_limit(self, monkeypatch):
        mgr = DummyManager()
        monkeypatch.setattr(toff, "StoreModelManager", lambda base_model_dir=None: mgr)
        monkeypatch.setattr(toff, "_fetch_store_ids", lambda manager: [1, 2, 3, 4])
        called = {}

        def _train(manager, ids, max_workers=1):
            called["ids"] = list(ids)

        monkeypatch.setattr(toff, "_train_store_ids", _train)
        monkeypatch.setattr(sys, "argv", ["train_offline.py", "--all"])
        toff.main()
        assert called["ids"] == [1, 2, 3, 4]
