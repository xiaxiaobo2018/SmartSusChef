import sys

import pandas as pd
import pytest

import train_offline as toff


class DummyManager:
    def __init__(self):
        self._engine = object()
        self.trained = []

    def _get_engine(self):
        return self._engine

    def train_store_models(self, store_id: int):
        self.trained.append(store_id)
        return {"status": "ok", "store_id": store_id}


def test_fetch_store_ids_no_engine(monkeypatch):
    mgr = DummyManager()
    mgr._engine = None
    with pytest.raises(RuntimeError):
        toff._fetch_store_ids(mgr)


def test_fetch_store_ids_id_column(monkeypatch):
    mgr = DummyManager()

    def _read_sql(query, engine):
        return pd.DataFrame({"Id": [1, 2, 3]})

    monkeypatch.setattr(pd, "read_sql", _read_sql)
    assert toff._fetch_store_ids(mgr) == [1, 2, 3]


def test_fetch_store_ids_id_lower_with_retry(monkeypatch):
    mgr = DummyManager()
    calls = {"n": 0}

    def _read_sql(query, engine):
        calls["n"] += 1
        if calls["n"] == 1:
            raise RuntimeError("bad query")
        return pd.DataFrame({"id": [9]})

    monkeypatch.setattr(pd, "read_sql", _read_sql)
    assert toff._fetch_store_ids(mgr) == [9]


def test_train_store_ids_calls_manager():
    mgr = DummyManager()
    toff._train_store_ids(mgr, [1, 2])
    assert mgr.trained == [1, 2]


def test_main_requires_args(monkeypatch):
    monkeypatch.setattr(sys, "argv", ["train_offline.py"])
    with pytest.raises(SystemExit):
        toff.main()


def test_main_store_ids(monkeypatch):
    mgr = DummyManager()
    monkeypatch.setattr(toff, "StoreModelManager", lambda base_model_dir=None: mgr)
    called = {}

    def _train(manager, ids):
        called["ids"] = list(ids)

    monkeypatch.setattr(toff, "_train_store_ids", _train)
    monkeypatch.setattr(sys, "argv", ["train_offline.py", "--store-id", "1", "--store-id", "2"])
    toff.main()
    assert called["ids"] == [1, 2]


def test_main_all_with_limit(monkeypatch):
    mgr = DummyManager()
    monkeypatch.setattr(toff, "StoreModelManager", lambda base_model_dir=None: mgr)
    monkeypatch.setattr(toff, "_fetch_store_ids", lambda manager: [5, 6, 7])
    called = {}

    def _train(manager, ids):
        called["ids"] = list(ids)

    monkeypatch.setattr(toff, "_train_store_ids", _train)
    monkeypatch.setattr(sys, "argv", ["train_offline.py", "--all", "--limit", "1"])
    toff.main()
    assert called["ids"] == [5]
