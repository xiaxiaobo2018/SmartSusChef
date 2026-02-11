#!/usr/bin/env bash
# SmartSusChef - Local Dev Quick Start (macOS / Linux)
# Launches ML / Backend / Frontend in 3 separate terminals
# Usage: ./dev-start.sh [--db-server HOST] [--db-port PORT] [--db-user USER] [--db-password PASS] [--db-name NAME]
# Config: Create a .env file in the project root (see .env.example)

set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"

# -- Parse CLI args ---------------------------------------------------------
DB_SERVER_ARG=""
DB_PORT_ARG=""
DB_USER_ARG=""
DB_PASSWORD_ARG=""
DB_NAME_ARG=""

while [ "$#" -gt 0 ]; do
    case "$1" in
        --db-server) DB_SERVER_ARG="$2"; shift 2 ;;
        --db-port) DB_PORT_ARG="$2"; shift 2 ;;
        --db-user) DB_USER_ARG="$2"; shift 2 ;;
        --db-password) DB_PASSWORD_ARG="$2"; shift 2 ;;
        --db-name) DB_NAME_ARG="$2"; shift 2 ;;
        -h|--help)
            echo "Usage: ./dev-start.sh [--db-server HOST] [--db-port PORT] [--db-user USER] [--db-password PASS] [--db-name NAME]"
            exit 0
            ;;
        *)
            echo "[ERROR] Unknown argument: $1"
            exit 1
            ;;
    esac
done

# -- Load .env file ---------------------------------------------------------
ENV_FILE="$ROOT/.env"
if [ -f "$ENV_FILE" ]; then
    echo "[OK] Loading config from .env"
    set -a
    # shellcheck disable=SC1090
    . "$ENV_FILE"
    set +a
else
    echo "[WARN] No .env file found. Copy .env.example to .env and fill in your values."
    echo "       Run: cp .env.example .env"
    exit 1
fi

# Apply: CLI args override .env
[ -n "$DB_SERVER_ARG" ] && DB_SERVER="$DB_SERVER_ARG"
[ -n "$DB_PORT_ARG" ] && DB_PORT="$DB_PORT_ARG"
[ -n "$DB_USER_ARG" ] && DB_USER="$DB_USER_ARG"
[ -n "$DB_PASSWORD_ARG" ] && DB_PASSWORD="$DB_PASSWORD_ARG"
[ -n "$DB_NAME_ARG" ] && DB_NAME="$DB_NAME_ARG"

# -- Check prerequisites ----------------------------------------------------
MISSING=""
PYTHON_BIN=""
if command -v python3.11 >/dev/null 2>&1; then
    PYTHON_BIN="python3.11"
elif command -v python3.10 >/dev/null 2>&1; then
    PYTHON_BIN="python3.10"
elif command -v python3 >/dev/null 2>&1; then
    PYTHON_BIN="python3"
elif command -v python >/dev/null 2>&1; then
    PYTHON_BIN="python"
else
    MISSING="$MISSING Python(>=3.10)"
fi

command -v dotnet >/dev/null 2>&1 || MISSING="$MISSING .NET-SDK"
command -v node   >/dev/null 2>&1 || MISSING="$MISSING Node.js"

if [ -n "$MISSING" ]; then
    echo "[ERROR] Missing:$MISSING"
    exit 1
fi

if [ -n "$PYTHON_BIN" ]; then
    PY_VERSION="$($PYTHON_BIN -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')"
    if [ "$PY_VERSION" = "3.9" ] || [ "$PY_VERSION" = "3.8" ] || [ "$PY_VERSION" = "3.7" ]; then
        echo "[ERROR] Python $PY_VERSION detected. ML service requires Python >= 3.10."
        echo "        Install python@3.11 and re-run. Example: brew install python@3.11"
        exit 1
    fi
fi

echo ""
echo "=========================================="
echo "  SmartSusChef - Dev Quick Start"
echo "=========================================="
echo ""
echo "[OK] Python / .NET / Node.js installed"

# -- Build connection string ------------------------------------------------
strip_crlf() {
    printf '%s' "$1" | tr -d '\r\n'
}

DB_SERVER="${DB_SERVER:?DB_SERVER not set}"
DB_PORT="${DB_PORT:?DB_PORT not set}"
DB_USER="${DB_USER:?DB_USER not set}"
DB_PASSWORD="${DB_PASSWORD:?DB_PASSWORD not set}"
DB_NAME="${DB_NAME:?DB_NAME not set}"

DB_SERVER="$(strip_crlf "$DB_SERVER")"
DB_PORT="$(strip_crlf "$DB_PORT")"
DB_USER="$(strip_crlf "$DB_USER")"
DB_PASSWORD="$(strip_crlf "$DB_PASSWORD")"
DB_NAME="$(strip_crlf "$DB_NAME")"

CONN_STR="Server=$DB_SERVER;Port=$DB_PORT;Database=$DB_NAME;User Id=$DB_USER;Password=$DB_PASSWORD;SslMode=None;AllowPublicKeyRetrieval=true;ConnectionTimeout=30"
SQLALCHEMY_DB_URL="mysql+pymysql://${DB_USER}:${DB_PASSWORD}@${DB_SERVER}:${DB_PORT}/${DB_NAME}?charset=utf8mb4"
echo "[OK] DB: $DB_SERVER:$DB_PORT/$DB_NAME (user: $DB_USER)"
echo ""

# -- Terminal helpers -------------------------------------------------------
OS_NAME="$(uname -s)"

escape_for_osascript() {
    printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

run_in_new_terminal() {
    local cmd="$1"

    if [ "$OS_NAME" = "Darwin" ] && command -v osascript >/dev/null 2>&1; then
        local esc
        esc="$(escape_for_osascript "$cmd")"
        osascript <<EOS
 tell application "Terminal"
   activate
   do script "$esc"
 end tell
EOS
        return 0
    fi

    if command -v gnome-terminal >/dev/null 2>&1; then
        gnome-terminal -- bash -lc "$(printf '%q' "$cmd")"
        return 0
    fi

    if command -v xterm >/dev/null 2>&1; then
        xterm -e bash -lc "$cmd" &
        return 0
    fi

    return 1
}

# -- Commands ---------------------------------------------------------------
TITLE_ML="echo -ne '\\033]0;SmartSusChef - ML (8000)\\007'"
TITLE_BACKEND="echo -ne '\\033]0;SmartSusChef - Backend (5000)\\007'"
TITLE_FRONTEND="echo -ne '\\033]0;SmartSusChef - Frontend (5173)\\007'"

ML_CMD="$TITLE_ML; cd \"$ROOT/ML\"; export DATABASE_URL=\"$SQLALCHEMY_DB_URL\"; echo 'Installing Python dependencies...'; \"$PYTHON_BIN\" -m pip install -q -r requirements-prod.txt; echo 'ML service starting...'; \"$PYTHON_BIN\" -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
BACKEND_CMD="$TITLE_BACKEND; cd \"$ROOT/backend/SmartSusChef.Api\"; export ASPNETCORE_ENVIRONMENT=Development; export ConnectionStrings__DefaultConnection=\"$CONN_STR\"; echo 'Backend starting (Development)...'; dotnet run"
FRONTEND_CMD="$TITLE_FRONTEND; cd \"$ROOT/frontend\"; echo 'Installing npm dependencies...'; npm install --silent; echo 'Frontend starting...'; npm run dev"

echo "[1/3] Starting ML Service (port 8000)..."
run_in_new_terminal "$ML_CMD" || {
    echo "[WARN] Could not open a new terminal. Falling back to current terminal."
    ( cd "$ROOT/ML" && export DATABASE_URL="$SQLALCHEMY_DB_URL" && "$PYTHON_BIN" -m pip install -q -r requirements-prod.txt && "$PYTHON_BIN" -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload ) &
}

sleep 3

echo "[2/3] Starting Backend (port 5000)..."
run_in_new_terminal "$BACKEND_CMD" || {
    echo "[WARN] Could not open a new terminal. Falling back to current terminal."
    ( cd "$ROOT/backend/SmartSusChef.Api" && export ASPNETCORE_ENVIRONMENT=Development && export ConnectionStrings__DefaultConnection="$CONN_STR" && dotnet run ) &
}

sleep 2

echo "[3/3] Starting Frontend (port 5173)..."
run_in_new_terminal "$FRONTEND_CMD" || {
    echo "[WARN] Could not open a new terminal. Falling back to current terminal."
    ( cd "$ROOT/frontend" && npm install --silent && npm run dev ) &
}

# -- Summary ----------------------------------------------------------------
echo ""
echo "=========================================="
echo "  All 3 service terminals launched"
echo "=========================================="
echo ""
echo "  Frontend   ->  http://localhost:5173"
echo "  Backend    ->  http://localhost:5000"
echo "  Swagger    ->  http://localhost:5000/swagger"
echo "  ML API     ->  http://localhost:8000"
echo "  ML Docs    ->  http://localhost:8000/docs"
echo ""
echo "  To stop: close each terminal window"
echo "=========================================="
