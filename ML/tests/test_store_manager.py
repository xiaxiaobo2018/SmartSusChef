import sys
from types import SimpleNamespace

import pandas as pd

from app.store_manager import StoreModelManager


def test_has_models(tmp_path):
    mgr = StoreModelManager(base_model_dir=str(tmp_path))
    store_dir = mgr.store_model_dir(1)
    store_dir.mkdir(parents=True, exist_ok=True)
    assert mgr.has_models(1) is False
    (store_dir / "champion_registry.pkl").write_bytes(b"fake")
    assert mgr.has_models(1) is True


def test_get_store_when_missing(tmp_path):
    mgr = StoreModelManager(base_model_dir=str(tmp_path))
    assert mgr.get_store(1) is None


def test_get_store_when_present(tmp_path):
    mgr = StoreModelManager(base_model_dir=str(tmp_path))
    store_dir = mgr.store_model_dir(1)
    store_dir.mkdir(parents=True, exist_ok=True)
    import joblib

    joblib.dump({"DishA": {"model": "xgb"}}, store_dir / "champion_registry.pkl")
    store = mgr.get_store(1)
    assert store is not None
    assert store.list_dishes() == ["DishA"]


def test_reload_store(tmp_path):
    mgr = StoreModelManager(base_model_dir=str(tmp_path))
    store_dir = mgr.store_model_dir(1)
    store_dir.mkdir(parents=True, exist_ok=True)
    import joblib

    joblib.dump({"DishA": {"model": "xgb"}}, store_dir / "champion_registry.pkl")
    store1 = mgr.get_store(1)
    store2 = mgr.reload_store(1)
    assert store1 is not None
    assert store2 is not None
    assert store1 is not store2


def test_fetch_store_sales_no_db(monkeypatch, tmp_path):
    mgr = StoreModelManager(base_model_dir=str(tmp_path))
    monkeypatch.setenv("DATABASE_URL", "")
    df, days = mgr.fetch_store_sales(1)
    assert df is None
    assert days == 0


def test_fetch_store_sales_error(monkeypatch, tmp_path):
    mgr = StoreModelManager(base_model_dir=str(tmp_path))

    class DummyEngine:
        pass

    monkeypatch.setattr(mgr, "_get_engine", lambda: DummyEngine())

    def _boom(*args, **kwargs):
        raise RuntimeError("db fail")

    monkeypatch.setattr(pd, "read_sql", _boom)
    df, days = mgr.fetch_store_sales(1)
    assert df is None
    assert days == 0


def test_fetch_store_location_no_db(monkeypatch, tmp_path):
    mgr = StoreModelManager(base_model_dir=str(tmp_path))
    monkeypatch.setenv("DATABASE_URL", "")
    lat, lon, cc = mgr.fetch_store_location(1)
    assert lat is None and lon is None and cc is None


def test_fetch_store_location_empty(monkeypatch, tmp_path):
    mgr = StoreModelManager(base_model_dir=str(tmp_path))

    class DummyEngine:
        pass

    monkeypatch.setattr(mgr, "_get_engine", lambda: DummyEngine())

    def _empty(*args, **kwargs):
        return pd.DataFrame()

    monkeypatch.setattr(pd, "read_sql", _empty)
    lat, lon, cc = mgr.fetch_store_location(1)
    assert lat is None and lon is None and cc is None


def test_fetch_store_location_error(monkeypatch, tmp_path):
    mgr = StoreModelManager(base_model_dir=str(tmp_path))

    class DummyEngine:
        pass

    monkeypatch.setattr(mgr, "_get_engine", lambda: DummyEngine())

    def _boom(*args, **kwargs):
        raise RuntimeError("db fail")

    monkeypatch.setattr(pd, "read_sql", _boom)
    lat, lon, cc = mgr.fetch_store_location(1)
    assert lat is None and lon is None and cc is None


def test_train_store_models_no_data(monkeypatch, tmp_path):
    mgr = StoreModelManager(base_model_dir=str(tmp_path))
    monkeypatch.setattr(mgr, "fetch_store_sales", lambda store_id: (None, 0))
    out = mgr.train_store_models(1)
    assert out["status"] == "error"


def test_train_store_models_insufficient(monkeypatch, tmp_path):
    mgr = StoreModelManager(base_model_dir=str(tmp_path))
    df = pd.DataFrame({"date": pd.to_datetime(["2024-01-01"]), "dish": ["A"], "sales": [1.0]})
    monkeypatch.setattr(mgr, "fetch_store_sales", lambda store_id: (df, 5))
    out = mgr.train_store_models(1)
    assert out["status"] == "insufficient_data"


def test_train_store_models_already_training(tmp_path):
    mgr = StoreModelManager(base_model_dir=str(tmp_path))
    mgr._training_in_progress[1] = True
    out = mgr.train_store_models(1)
    assert out["status"] == "already_training"


def test_train_store_models_success(monkeypatch, tmp_path):
    mgr = StoreModelManager(base_model_dir=str(tmp_path))
    df = pd.DataFrame(
        {
            "date": pd.to_datetime(["2024-01-01", "2024-01-02"]),
            "dish": ["A", "A"],
            "sales": [1.0, 2.0],
        }
    )
    monkeypatch.setattr(mgr, "fetch_store_sales", lambda store_id: (df, 120))
    monkeypatch.setattr(mgr, "fetch_store_location", lambda store_id: (1.0, 2.0, "US"))

    class DummyConfig:
        def __init__(self):
            self.model_dir = ""

    def _add_local_context(data, **kwargs):
        return data, "US", 1.0, 2.0

    def _process_dish(dish, frame, cc, config):
        return {"champion": "xgb", "mae": {}, "champion_mae": 1.0}

    fake_module = SimpleNamespace(
        PipelineConfig=DummyConfig,
        add_local_context=_add_local_context,
        process_dish=_process_dish,
    )
    monkeypatch.setitem(sys.modules, "training_logic_v2", fake_module)

    out = mgr.train_store_models(1)
    assert out["status"] == "completed"
    assert out["dishes_trained"] == 1
