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
