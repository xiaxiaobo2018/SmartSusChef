from types import SimpleNamespace

import numpy as np
import pandas as pd

import training_logic_v2 as tl


def test_get_gpu_flags_caches(monkeypatch):
    tl._GPU_AVAILABLE = None
    monkeypatch.setattr(
        tl, "_detect_gpu", lambda: {"xgboost": True, "catboost": False, "lightgbm": False}
    )
    first = tl.get_gpu_flags()
    second = tl.get_gpu_flags()
    assert first == second


def test_get_location_details_success(monkeypatch):
    class DummyLoc:
        latitude = 1.23
        longitude = 4.56
        raw = {"address": {"country_code": "us"}}

    class DummyGeo:
        def geocode(self, address, addressdetails=True):
            return DummyLoc()

    import core.data_prep as dp
    monkeypatch.setattr(dp, "Nominatim", lambda user_agent=None: DummyGeo())
    lat, lon, cc = tl.get_location_details("addr")
    assert lat == 1.23
    assert lon == 4.56
    assert cc == "US"


def test_get_location_details_failure(monkeypatch):
    class DummyGeo:
        def geocode(self, address, addressdetails=True):
            return None

    import core.data_prep as dp
    monkeypatch.setattr(dp, "Nominatim", lambda user_agent=None: DummyGeo())
    lat, lon, cc = tl.get_location_details("addr")
    assert lat is None and lon is None and cc is None


def test_get_historical_weather_no_libs(monkeypatch):
    import core.data_prep as dp
    monkeypatch.setattr(dp, "openmeteo_requests", None)
    monkeypatch.setattr(dp, "retry", None)
    out = tl.get_historical_weather(1.0, 2.0, pd.Timestamp("2024-01-01"), pd.Timestamp("2024-01-02"))
    monkeypatch.setattr(tl, "openmeteo_requests", None)
    monkeypatch.setattr(tl, "retry", None)
    out = tl.get_historical_weather(
        1.0, 2.0, pd.Timestamp("2024-01-01"), pd.Timestamp("2024-01-02")
    )
    assert out is None


def test_fetch_weather_from_db_no_url(monkeypatch):
    monkeypatch.setenv("DATABASE_URL", "")
    out = tl.fetch_weather_from_db(pd.Timestamp("2024-01-01"), pd.Timestamp("2024-01-02"))
    assert out is None


def test_fetch_weather_from_db_success(monkeypatch):
    monkeypatch.setenv("DATABASE_URL", "sqlite://")
    import core.data_prep as dp
    monkeypatch.setattr(dp, "create_engine", lambda url: object())

    def _read_sql(query, engine, params):
        return pd.DataFrame(
            {
                "date": pd.to_datetime(["2024-01-01"]),
                "temperature_2m_max": [30.0],
                "temperature_2m_min": [20.0],
                "relative_humidity_2m_mean": [50.0],
                "precipitation_sum": [0.0],
            }
        )

    monkeypatch.setattr(pd, "read_sql", _read_sql)
    out = tl.fetch_weather_from_db(pd.Timestamp("2024-01-01"), pd.Timestamp("2024-01-02"))
    assert out is not None
    assert "temperature_2m_max" in out.columns


def test_fit_prophet_and_predict(monkeypatch):
    class DummyProphet:
        def __init__(self, **kwargs):
            self.regressors = []

        def add_country_holidays(self, country_name):
            return None

        def add_regressor(self, col):
            self.regressors.append(col)

        def fit(self, df):
            self.fitted = True

        def predict(self, df):
            return pd.DataFrame({"yhat": np.ones(len(df))})

    import core.model_train as mt
    monkeypatch.setattr(mt, "Prophet", DummyProphet)
    df = pd.DataFrame(
        {
            "date": pd.to_datetime(["2024-01-01", "2024-01-02"]),
            "sales": [1.0, 2.0],
            "temperature_2m_max": [30.0, 31.0],
        }
    )
    model = tl._fit_prophet(df, "US", tl.PipelineConfig())
    yhat = tl._prophet_predict(model, df)
    assert len(yhat) == 2
    assert model.regressors == ["temperature_2m_max"]


def test_build_residual_features():
    df = pd.DataFrame({"sales": [1.0, 2.0]})
    out = tl._build_residual_features(df, np.array([0.5, 1.5]))
    assert "resid" in out.columns
    assert out["resid"].iloc[0] == 0.5


def test_generate_cv_folds():
    cfg = tl.PipelineConfig(n_cv_folds=1, test_window_days=2, min_train_days=1)
    df = pd.DataFrame(
        {
            "date": pd.date_range("2024-01-01", periods=5, freq="D"),
            "sales": [1, 2, 3, 4, 5],
        }
    )
    folds = list(tl._generate_cv_folds(df, cfg))
    assert len(folds) == 1


def test_prepare_cv_fold_cache(monkeypatch):
    cfg = tl.PipelineConfig(min_train_days=1, test_window_days=1, n_cv_folds=1)
    cfg.hybrid_tree_features = ["prophet_yhat"]
    df = pd.DataFrame(
        {
            "date": pd.date_range("2024-01-01", periods=4, freq="D"),
            "sales": [1, 2, 3, 4],
            "dish": ["A", "A", "A", "A"],
        }
    )

    import core.cv_eval as ce
    import core.model_train as mt
    monkeypatch.setattr(ce, "sanitize_sparse_data", lambda d, cc, config=None: d)
    monkeypatch.setattr(mt, "_fit_prophet", lambda train, cc, config: object())
    monkeypatch.setattr(mt, "_prophet_predict", lambda m, d: np.ones(len(d)))
    cache = tl._prepare_cv_fold_cache(df, "US", cfg)
    assert len(cache) == 1


def _dummy_model():
    class Dummy:
        def __init__(self, **kwargs):
            pass

        def fit(self, X, y, **kwargs):
            return self

        def predict(self, X):
            return np.zeros(len(X))

    return Dummy


def test_eval_hybrid_mae_xgb(monkeypatch):
    import core.cv_eval as ce
    monkeypatch.setattr(ce, "XGBRegressor", _dummy_model())
    cache = [
        {
            "X_train": pd.DataFrame({"a": [1, 2]}),
            "y_train": pd.Series([0.0, 0.0]),
            "X_test": pd.DataFrame({"a": [1]}),
            "prophet_test": np.array([1.0]),
            "sales_test": np.array([1.0]),
        }
    ]
    mae = tl._eval_hybrid_mae("xgboost", cache, {}, tl.PipelineConfig(use_gpu=False))
    assert mae == 0.0


def test_eval_hybrid_mae_catboost(monkeypatch):
    import core.cv_eval as ce
    monkeypatch.setattr(ce, "CatBoostRegressor", _dummy_model())
    cache = [
        {
            "X_train": pd.DataFrame({"a": [1, 2]}),
            "y_train": pd.Series([0.0, 0.0]),
            "X_test": pd.DataFrame({"a": [1]}),
            "prophet_test": np.array([1.0]),
            "sales_test": np.array([1.0]),
        }
    ]
    mae = tl._eval_hybrid_mae("catboost", cache, {}, tl.PipelineConfig(use_gpu=False))
    assert mae == 0.0


def test_eval_hybrid_mae_lightgbm(monkeypatch):
    class DummyLgb:
        def __init__(self, **kwargs):
            pass

        def fit(self, X, y):
            return self

        def predict(self, X):
            return np.zeros(len(X))

    import core.cv_eval as ce
    monkeypatch.setattr(ce, "lgb", SimpleNamespace(LGBMRegressor=DummyLgb))
    cache = [
        {
            "X_train": pd.DataFrame({"a": [1, 2]}),
            "y_train": pd.Series([0.0, 0.0]),
            "X_test": pd.DataFrame({"a": [1]}),
            "prophet_test": np.array([1.0]),
            "sales_test": np.array([1.0]),
        }
    ]
    mae = tl._eval_hybrid_mae("lightgbm", cache, {}, tl.PipelineConfig(use_gpu=False))
    assert mae == 0.0


def test_save_and_load_models(tmp_path):
    cfg = tl.PipelineConfig()
    cfg.model_dir = str(tmp_path)
    prophet_obj = {"p": 1}
    tree_obj = {"t": 2}
    tl._save_hybrid_models("DishA", prophet_obj, tree_obj, "xgb", cfg)
    pm, tm = tl._load_hybrid_models("DishA", "xgb", cfg)
    assert pm == prophet_obj
    assert tm == tree_obj


def test_process_dish_success(monkeypatch, tmp_path):
    import core.cv_eval as ce
    import core.data_prep as dp
    import core.feature_eng as fe
    import core.model_train as mt

    cfg = tl.PipelineConfig(min_train_days=1, max_workers=1, use_gpu=False)
    cfg.model_dir = str(tmp_path)
    cfg.hybrid_tree_features = ["prophet_yhat"]

    df = pd.DataFrame(
        {
            "date": pd.date_range("2024-01-01", periods=3, freq="D"),
            "dish": ["A", "A", "A"],
            "sales": [1.0, 2.0, 3.0],
        }
    )

    # Patch on actual modules where process_dish resolves names
    monkeypatch.setattr(fe, "add_hybrid_features", lambda d, c: d)
    monkeypatch.setattr(
        ce,
        "_prepare_cv_fold_cache",
        lambda *args, **kwargs: [
            {
                "X_train": df[["sales"]],
                "y_train": pd.Series([0.0, 0.0, 0.0]),
                "X_test": df[["sales"]],
                "prophet_test": np.zeros(3),
                "sales_test": np.zeros(3),
            }
        ],
    )
    monkeypatch.setattr(ce, "_optimize_hybrid", lambda *args, **kwargs: (1.0, {}))
    monkeypatch.setattr(dp, "sanitize_sparse_data", lambda d, cc, config=None: d)
    monkeypatch.setattr(mt, "_fit_prophet", lambda train, cc, config: object())
    monkeypatch.setattr(mt, "_prophet_predict", lambda model, df: np.zeros(len(df)))
    monkeypatch.setattr(mt, "_save_hybrid_models", lambda *args, **kwargs: None)
    monkeypatch.setattr(mt, "secure_dump", lambda obj, path: None)

    class DummyModel:
        def __init__(self, **kwargs):
            pass

        def fit(self, X, y, **kwargs):
            return self

        def predict(self, X):
            return np.zeros(len(X))

    monkeypatch.setattr(mt, "XGBRegressor", DummyModel)
    monkeypatch.setattr(mt, "CatBoostRegressor", DummyModel)
    monkeypatch.setattr(mt, "lgb", SimpleNamespace(LGBMRegressor=DummyModel))

    out = tl.process_dish("A", df, "US", cfg)
    assert out["champion"] in ["xgboost", "catboost", "lightgbm"]
