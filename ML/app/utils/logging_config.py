"""Centralized logging configuration for the ML pipeline."""

import logging
import os

LOG_FORMAT = "%(asctime)s [%(levelname)s] %(name)s: %(message)s"
LOG_DATEFMT = "%Y-%m-%d %H:%M:%S"


def setup_logger(name: str, level: int = logging.INFO) -> logging.Logger:
    """Return a configured logger, adding a StreamHandler only once."""
    lgr = logging.getLogger(name)
    lgr.setLevel(level)
    if not lgr.handlers:
        handler = logging.StreamHandler()
        handler.setFormatter(logging.Formatter(LOG_FORMAT, datefmt=LOG_DATEFMT))
        lgr.addHandler(handler)
    return lgr


def silence_noisy_loggers() -> None:
    """Silence verbose logging from Prophet / CmdStan."""
    os.environ["CMDSTANPY_LOG_LEVEL"] = "ERROR"
    for name in ("cmdstanpy", "prophet", "stan", "pystan"):
        lgr = logging.getLogger(name)
        lgr.setLevel(logging.ERROR)
        lgr.propagate = False
        lgr.disabled = True


def configure_basic_logging(level: int = logging.INFO) -> None:
    """Configure root-level logging (e.g. for CLI entry points)."""
    logging.basicConfig(
        level=level,
        format=LOG_FORMAT,
        datefmt=LOG_DATEFMT,
    )
