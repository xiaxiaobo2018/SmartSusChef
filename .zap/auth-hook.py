"""
ZAP Hook Script for Authenticated DAST Scanning.

This hook is used by zap-api-scan.py to inject a Bearer token
into all HTTP requests via the Replacer add-on, enabling
authenticated scanning of protected API endpoints.

Usage:
  ZAP_AUTH_TOKEN=<jwt> zap-api-scan.py --hook=.zap/auth-hook.py ...
"""

import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def zap_started(zap, target):
    """Called after ZAP has started. Configures Bearer token via Replacer."""
    token = os.environ.get("ZAP_AUTH_TOKEN", "")
    if token:
        logger.info("Configuring Bearer token via Replacer add-on...")
        try:
            zap.replacer.add_rule(
                description="BearerAuth",
                enabled=True,
                matchtype="REQ_HEADER",
                matchregex=False,
                matchstring="Authorization",
                replacement=f"Bearer {token}",
            )
            logger.info(
                "Bearer token configured — all requests will include Authorization header."
            )
        except Exception as e:
            logger.error(f"Failed to configure Replacer rule: {e}")
            logger.warning("Scan will proceed without authentication.")
    else:
        logger.warning(
            "ZAP_AUTH_TOKEN not set — scanning without authentication. "
            "Protected endpoints will not be covered."
        )
