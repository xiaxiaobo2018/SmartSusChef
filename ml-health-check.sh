#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"

ML_URL="${ML_URL:-http://127.0.0.1:8000}"
HEALTH_URL="${ML_URL%/}/health"

echo "=========================================="
echo "SmartSusChef - Backend -> ML Health Check"
echo "=========================================="
echo "ML_URL      : ${ML_URL}"
echo "Health URL  : ${HEALTH_URL}"
echo ""

echo "[1/4] Checking ML health endpoint..."
if command -v curl >/dev/null 2>&1; then
  STATUS_CODE="$(curl -sS -o /tmp/ml_health.json -w "%{http_code}" "$HEALTH_URL" || true)"
  if [[ "$STATUS_CODE" == "200" ]]; then
    echo "[OK] ML health reachable (200)."
    echo "[OK] Body: $(cat /tmp/ml_health.json)"
  else
    echo "[ERROR] ML health not reachable. HTTP $STATUS_CODE"
    if [[ -s /tmp/ml_health.json ]]; then
      echo "[ERROR] Body: $(cat /tmp/ml_health.json)"
    fi
  fi
else
  echo "[WARN] curl not found. Skipping HTTP check."
fi
echo ""

echo "[2/4] Checking port 8000 listener..."
if command -v lsof >/dev/null 2>&1; then
  if lsof -nP -iTCP:8000 -sTCP:LISTEN >/dev/null 2>&1; then
    echo "[OK] Port 8000 is listening."
    lsof -nP -iTCP:8000 -sTCP:LISTEN
  else
    echo "[ERROR] Nothing listening on port 8000."
  fi
else
  echo "[WARN] lsof not found. Skipping listener check."
fi
echo ""

echo "[3/4] Backend config hint..."
if [[ -f "$ROOT/backend/SmartSusChef.Api/appsettings.json" ]]; then
  echo "[OK] appsettings.json found."
  echo "     ExternalApis:MlApiUrl currently set to:"
  python3 - <<'PY' 2>/dev/null || true
import json, pathlib
p = pathlib.Path("backend/SmartSusChef.Api/appsettings.json")
data = json.loads(p.read_text())
print(data.get("ExternalApis", {}).get("MlApiUrl"))
PY
else
  echo "[WARN] appsettings.json not found."
fi
echo ""

echo "[4/4] Suggested next steps:"
echo " - If ML health failed: start ML service on port 8000."
echo " - If ML is in Docker: set ExternalApis:MlApiUrl to the container-accessible address."
echo " - Re-run this script after fixes."
echo "=========================================="
