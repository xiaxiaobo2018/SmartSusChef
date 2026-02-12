"""
Core ML pipeline logic for the SmartSus Chef project.

This module is a re-export layer.  The actual implementations now live
under ``core/`` (data_prep, feature_eng, model_train, cv_eval) and
``app/utils``.
"""

import os
import warnings

# Must be set before cmdstanpy/prophet import
os.environ.setdefault("CMDSTANPY_LOG_LEVEL", "WARNING")

# Load environment variables from .env file
try:
    from dotenv import load_dotenv

    load_dotenv()
except ImportError:
    pass

try:
    import optuna

    optuna.logging.set_verbosity(optuna.logging.WARNING)
except ImportError:
    optuna = None  # Not needed for inference

warnings.filterwarnings("ignore")

# ---------------------------------------------------------------------------
# Re-exports from core modules
# ---------------------------------------------------------------------------
from app.utils import (  # noqa: E402, F401
    WEATHER_COLS,
    compute_lag_features_from_history,
    safe_filename,
)
from app.utils.logging_config import silence_noisy_loggers  # noqa: E402
from core.cv_eval import (  # noqa: E402, F401
    _eval_hybrid_mae,
    _generate_cv_folds,
    _prepare_cv_fold_cache,
)
from core.data_prep import (  # noqa: E402, F401
    add_local_context,
    fetch_training_data,
    fetch_weather_from_db,
    get_historical_weather,
    get_location_details,
    openmeteo_requests,
    retry,
    sanitize_sparse_data,
)
from core.feature_eng import (  # noqa: E402, F401
    _add_date_features,
    _add_lag_roll_features,
    _build_residual_features,
)
from core.model_train import (  # noqa: E402, F401
    CFG,
    PipelineConfig,
    _detect_gpu,
    _fit_prophet,
    _load_hybrid_models,
    _prophet_predict,
    _save_hybrid_models,
    get_gpu_flags,
    process_dish,
)

silence_noisy_loggers()
