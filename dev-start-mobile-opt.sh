#!/usr/bin/env bash
# SmartSusChef - Mac Optimized Mobile Dev Quick Start
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="$ROOT/.env"

echo "=========================================="
echo "  SmartSusChef - Mac Dev Quick Start"
echo "=========================================="

# -- 1) Robust .env Loading (Strips Windows \r characters) --
if [ -f "$ENV_FILE" ]; then
    echo "[OK] Loading and cleaning .env..."
    # Read file line by line to handle potential malformed endings
    while IFS='=' read -r key value || [ -n "$key" ]; do
        # Remove comments and whitespace
        [[ $key =~ ^#.* ]] || [ -z "$key" ] && continue
        
        # Strip \r (Windows) and leading/trailing whitespace
        clean_key=$(echo "$key" | tr -d '\r' | xargs)
        clean_value=$(echo "$value" | tr -d '\r' | xargs)
        
        export "$clean_key"="$clean_value"
    done < "$ENV_FILE"
else
    echo "[ERROR] .env file not found at $ENV_FILE"
    exit 1
fi

# -- 2) Validate Required Variables --
: "${DB_SERVER:?DB_SERVER missing}"
: "${DB_PORT:?DB_PORT missing}"
: "${DB_USER:?DB_USER missing}"
: "${DB_PASSWORD:?DB_PASSWORD missing}"
: "${DB_NAME:?DB_NAME missing}"

BACKEND_PORT=5001
WIFI_IP=$(ipconfig getifaddr en0 || true)

# -- 3) Build Connection String --
CONN_STR="Server=$DB_SERVER;Port=$DB_PORT;Database=$DB_NAME;User Id=$DB_USER;Password=$DB_PASSWORD;SslMode=None;AllowPublicKeyRetrieval=true;ConnectionTimeout=30"

# -- 4) Cleanup Function --
cleanup() {
    echo -e "\nStopping services..."
    [ -n "$ML_PID" ]       && kill "$ML_PID"       2>/dev/null
    [ -n "$BACKEND_PID" ]  && kill "$BACKEND_PID"  2>/dev/null
    [ -n "$FRONTEND_PID" ] && kill "$FRONTEND_PID" 2>/dev/null
    exit
}
trap cleanup EXIT INT TERM

# -- 5) Start Services --
echo "[1/3] Starting ML Service (8000)..."
( cd "$ROOT/ML" && python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 ) &
ML_PID=$!
sleep 2

echo "[2/3] Starting Backend (Port $BACKEND_PORT)..."
(
    cd "$ROOT/backend/SmartSusChef.Api"
    export ASPNETCORE_ENVIRONMENT=Development
    export ConnectionStrings__DefaultConnection="$CONN_STR"
    export ASPNETCORE_URLS="http://0.0.0.0:$BACKEND_PORT"
    dotnet run
) &
BACKEND_PID=$!
sleep 3

echo "[3/3] Starting Frontend (5173)..."
( cd "$ROOT/frontend" && npm run dev ) &
FRONTEND_PID=$!

echo ""
echo "READY: Use http://127.0.0.1:5173 for Mac browser if http://localhost:5173 does not work"
[ -n "$WIFI_IP" ] && echo "MOBILE: Use http://$WIFI_IP:$BACKEND_PORT/api/ for Android"
echo "=========================================="

wait