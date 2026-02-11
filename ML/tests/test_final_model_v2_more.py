import pandas as pd

import Final_model_v2 as fm


def test_get_weather_forecast_no_libs(monkeypatch):
    import app.utils as utils

    monkeypatch.setattr(utils, "openmeteo_requests", None)
    monkeypatch.setattr(utils, "retry", None)
    out = fm.get_weather_forecast(1.0, 2.0)
    assert out is None


def test_get_forecast_cached(monkeypatch):
    calls = {"n": 0}

    def _fake(lat, lon):
        calls["n"] += 1
        return pd.DataFrame({"date": pd.to_datetime(["2024-01-01"]), fm.WEATHER_COLS[0]: [1.0]})

    monkeypatch.setattr(fm, "get_weather_forecast", _fake)
    a = fm._get_forecast_cached(1.0, 2.0)
    b = fm._get_forecast_cached(1.0, 2.0)
    assert a is b
    assert calls["n"] == 1


def test_get_prediction_average(monkeypatch):
    cfg = fm.PipelineConfig()

    def _load(path):
        if "average_" in path:
            return 5
        return {"DishA": {"model": "average"}}

    monkeypatch.setattr(fm, "_load_cached", _load)
    monkeypatch.setattr(fm, "_get_forecast_cached", lambda lat, lon: pd.DataFrame())
    out = fm.get_prediction("DishA", "2024-01-01", "Addr", model="average", config=cfg)
    assert len(out) == cfg.forecast_horizon
    assert out[0]["Model Used"] == "AVERAGE"


def test_get_prediction_missing_forecast(monkeypatch):
    monkeypatch.setattr(fm, "_get_forecast_cached", lambda lat, lon: None)
    out = fm.get_prediction(
        "DishA", "2024-01-01", "Addr", model="lightgbm", config=fm.PipelineConfig()
    )
    assert "Error" in out[0]


def test_get_prediction_hybrid_path(monkeypatch):
    cfg = fm.PipelineConfig()

    def _load(path):
        if "champion_registry" in path:
            return {"DishA": {"model": "xgboost", "all_mae": {"xgboost": 1.0}}}
        if "recent_sales" in path:
            return pd.DataFrame({"sales": [1.0, 2.0]})
        return None

    monkeypatch.setattr(fm, "_load_cached", _load)
    monkeypatch.setattr(
        fm,
        "_get_forecast_cached",
        lambda lat, lon: pd.DataFrame(
            {
                "date": pd.to_datetime(["2024-01-01"]),
                fm.WEATHER_COLS[0]: [1.0],
                fm.WEATHER_COLS[1]: [1.0],
                fm.WEATHER_COLS[2]: [1.0],
                fm.WEATHER_COLS[3]: [1.0],
            }
        ),
    )
    monkeypatch.setattr(fm, "_load_hybrid_models", lambda store_id, dish, model, config: (object(), object()))
    monkeypatch.setattr(
        fm,
        "_predict_hybrid_multiday",
        lambda **kwargs: [
            {"date": "2024-01-01", "qty": 1, "lower": 1, "upper": 2, "explanation": {}}
        ],
    )
    out = fm.get_prediction("DishA", "2024-01-01", "Addr", model="xgboost", config=cfg)
    assert out[0]["Model Used"] == "Prophet+XGBOOST"


def test_plot_functions(monkeypatch):
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    monkeypatch.setattr(plt, "show", lambda: None)
    df = pd.DataFrame(
        {
            "Dish": ["A"],
            "XGBoost MAE": [1.0],
            "CatBoost MAE": [2.0],
            "LightGBM MAE": [3.0],
            "Winner": ["Prophet+XGBOOST"],
        }
    )
    fm.plot_mae_comparison(df)

    preds = [
        {
            "Date": "2024-01-01",
            "Prediction": 1,
            "Prediction_Lower": 1,
            "Prediction_Upper": 2,
            "Model Used": "AVERAGE",
        }
    ]
    fm.plot_forecasts({"A": preds}, 1)
