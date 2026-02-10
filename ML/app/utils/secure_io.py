"""Secure serialization utilities with SHA-256 integrity verification."""

import hashlib
import logging
from pathlib import Path

import joblib

logger = logging.getLogger(__name__)


def _hash_file(path: Path) -> str:
    """Compute SHA-256 hex digest of a file."""
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 16), b""):
            h.update(chunk)
    return h.hexdigest()


def _hash_path(pkl_path: Path) -> Path:
    """Return the companion .sha256 path for a .pkl file."""
    return pkl_path.with_suffix(".pkl.sha256")


def secure_dump(obj, path: str | Path) -> None:
    """Dump *obj* via joblib and write a companion SHA-256 hash file."""
    path = Path(path)
    joblib.dump(obj, str(path))
    digest = _hash_file(path)
    _hash_path(path).write_text(digest, encoding="utf-8")
    logger.debug("Saved %s (sha256=%s)", path.name, digest[:12])


def secure_load(path: str | Path):
    """Load a .pkl file after verifying its SHA-256 hash.

    If no companion hash file exists the load proceeds with a warning
    (backward compatibility with models saved before hashing was added).

    Raises
    ------
    SecurityError (RuntimeError subclass)
        If the hash file exists but does not match the pkl contents.
    """
    path = Path(path)
    hash_file = _hash_path(path)

    if hash_file.exists():
        expected = hash_file.read_text(encoding="utf-8").strip()
        actual = _hash_file(path)
        if actual != expected:
            raise RuntimeError(
                f"Integrity check failed for {path.name}: "
                f"expected sha256={expected[:12]}…, got {actual[:12]}…. "
                "The file may have been tampered with."
            )
        logger.debug("Integrity OK for %s", path.name)
    else:
        logger.warning(
            "No SHA-256 hash file for %s — skipping integrity check. "
            "Re-save the model to generate a hash.",
            path.name,
        )

    return joblib.load(str(path))
