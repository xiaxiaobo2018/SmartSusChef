# SmartSusChef - Mobile Dev Quick Start (Windows PowerShell)
# Launches ML / Backend / (Optional) Frontend
# Backend bound to 0.0.0.0:5001 for Android emulator + physical devices
# Usage:
#   .\dev-start-mobile.ps1
#   START_FRONTEND=false .\dev-start-mobile.ps1   (PowerShell: $env:START_FRONTEND="false")

param(
    [string]$DbServer,
    [int]$DbPort,
    [string]$DbUser,
    [string]$DbPassword,
    [string]$DbName
)

$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot
$BackendPort = 5001
$MlPort = 8000

# Default: start frontend unless explicitly disabled
if (-not $env:START_FRONTEND) {
    $env:START_FRONTEND = "true"
}

# -- Load .env --------------------------------------------------------------
$envFile = Join-Path $Root ".env"
if (Test-Path $envFile) {
    Write-Host "[OK] Loading config from .env" -ForegroundColor Green
    Get-Content $envFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#")) {
            $parts = $line -split "=", 2
            if ($parts.Count -eq 2) {
                [System.Environment]::SetEnvironmentVariable(
                    $parts[0].Trim(),
                    $parts[1].Trim(),
                    "Process"
                )
            }
        }
    }
}
else {
    Write-Host "[ERROR] No .env file found. Copy .env.example to .env" -ForegroundColor Red
    exit 1
}

# CLI params override .env
if (-not $DbServer) { $DbServer = $env:DB_SERVER }
if (-not $DbPort) { $DbPort = [int]$env:DB_PORT }
if (-not $DbUser) { $DbUser = $env:DB_USER }
if (-not $DbPassword) { $DbPassword = $env:DB_PASSWORD }
if (-not $DbName) { $DbName = $env:DB_NAME }

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  SmartSusChef - Mobile Dev Quick Start" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

# -- Detect local Wi-Fi IPv4 ------------------------------------------------
$WifiIP = Get-NetIPAddress `
    -AddressFamily IPv4 `
    -InterfaceAlias "Wi-Fi*" `
    -ErrorAction SilentlyContinue |
Where-Object { $_.IPAddress -notlike "169.254*" } |
Select-Object -First 1 -ExpandProperty IPAddress

if ($WifiIP) {
    Write-Host "[OK] Wi-Fi IP detected: $WifiIP" -ForegroundColor Green
}
else {
    Write-Host "[WARN] Could not detect Wi-Fi IP (physical devices may not connect)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Mobile API base URLs:" -ForegroundColor Cyan
Write-Host "  Emulator       -> http://10.0.2.2:${BackendPort}/api/" -ForegroundColor White
if ($WifiIP) {
    Write-Host "  Physical phone -> http://${WifiIP}:${BackendPort}/api/" -ForegroundColor White
}
else {
    Write-Host "  Physical phone -> (Wi-Fi IP not detected)" -ForegroundColor Yellow
}
Write-Host ""

# -- Tool checks ------------------------------------------------------------
$missing = @()
if (-not (Get-Command python -ErrorAction SilentlyContinue)) { $missing += "Python" }
if (-not (Get-Command dotnet -ErrorAction SilentlyContinue)) { $missing += ".NET SDK" }
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { $missing += "Node.js" }

if ($missing.Count -gt 0) {
    Write-Host "[ERROR] Missing: $($missing -join ', ')" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Python / .NET / Node.js installed" -ForegroundColor Green

# -- DB connection string ---------------------------------------------------
$connStr = "Server=$DbServer;Port=$DbPort;Database=$DbName;User Id=$DbUser;Password=$DbPassword;SslMode=None;AllowPublicKeyRetrieval=true;ConnectionTimeout=30"
$sqlAlchemyUrl = "mysql+pymysql://${DbUser}:${DbPassword}@${DbServer}:${DbPort}/${DbName}?charset=utf8mb4"
Write-Host "[OK] DB: $DbServer`:$DbPort/$DbName (user: $DbUser)" -ForegroundColor Green
$env:DATABASE_URL = $sqlAlchemyUrl
Write-Host ""

# -- Kill existing processes on ML_PORT -------------------------------------
Write-Host "[INFO] Checking for processes on port ${MlPort}..." -ForegroundColor Cyan
$mlProcesses = Get-NetTCPConnection -LocalPort $MlPort -ErrorAction SilentlyContinue
if ($mlProcesses) {
    $mlProcesses | ForEach-Object {
        $procId = $_.OwningProcess
        Write-Host "[INFO] Killing process $procId on port $MlPort" -ForegroundColor Yellow
        Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 1
}
else {
    Write-Host "[INFO] No process found on port $MlPort" -ForegroundColor Gray
}

# -- Kill existing processes on BACKEND_PORT --------------------------------
Write-Host "[INFO] Checking for processes on port ${BackendPort}..." -ForegroundColor Cyan
$backendProcesses = Get-NetTCPConnection -LocalPort $BackendPort -ErrorAction SilentlyContinue
if ($backendProcesses) {
    $backendProcesses | ForEach-Object {
        $procId = $_.OwningProcess
        Write-Host "[INFO] Killing process $procId on port $BackendPort" -ForegroundColor Yellow
        Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 1
}
else {
    Write-Host "[INFO] No process found on port $BackendPort" -ForegroundColor Gray
}
Write-Host ""

# -- Android local.properties ----------------------------------------------
$AndroidDir = Join-Path $Root "mobile"
$LocalProps = Join-Path $AndroidDir "local.properties"

if (Test-Path $AndroidDir) {
    if (-not (Test-Path $LocalProps)) {
        Write-Host "[INFO] Creating mobile/local.properties" -ForegroundColor Cyan
        @"
## Auto-generated by dev-start-mobile.ps1
## Android Emulator default
local.base.url=http://10.0.2.2:$BackendPort/api/
"@ | Out-File -Encoding utf8 $LocalProps
    }
    elseif (-not (Select-String "^local.base.url=" $LocalProps)) {
        Write-Host "[INFO] Adding local.base.url to existing local.properties" -ForegroundColor Cyan
        "local.base.url=http://10.0.2.2:$BackendPort/api/" | Add-Content $LocalProps
    }
}
else {
    Write-Host "[WARN] mobile/ directory not found, skipping Android config" -ForegroundColor Yellow
}

# -- Start ML ---------------------------------------------------------------
Write-Host "[1/3] Starting ML Service (port $MlPort)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
    `$Host.UI.RawUI.WindowTitle = 'SmartSusChef - ML ($MlPort)'
    Set-Location '$Root\ML'
    python -m pip install -q -r requirements-prod.txt
    python -m uvicorn app.main:app --host 0.0.0.0 --port $MlPort --reload --log-level warning
"@

Start-Sleep 3

# -- Start Backend (MOBILE) -------------------------------------------------
Write-Host "[2/3] Starting Backend (port $BackendPort)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
    `$Host.UI.RawUI.WindowTitle = 'SmartSusChef - Backend (Mobile)'
    Set-Location '$Root\backend\SmartSusChef.Api'
    `$env:ASPNETCORE_ENVIRONMENT = 'Development'
    `$env:ConnectionStrings__DefaultConnection = '$connStr'
    `$env:ASPNETCORE_URLS = 'http://0.0.0.0:$BackendPort'
    dotnet run
"@

Start-Sleep 2

# -- Start Frontend (optional) ---------------------------------------------
if ($env:START_FRONTEND -eq "true") {
    Write-Host "[3/3] Starting Frontend (5173)..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
        `$Host.UI.RawUI.WindowTitle = 'SmartSusChef - Frontend (5173)'
        Set-Location '$Root\frontend'
        npm install --silent
        npm run dev
"@
}
else {
    Write-Host "[3/3] Frontend skipped (mobile-only mode)" -ForegroundColor Yellow
}

# -- Summary ---------------------------------------------------------------
Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  All Services Started (Mobile Mode)" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Frontend (Web)     -> http://localhost:5173" -ForegroundColor White
Write-Host "  Backend (Local)    -> http://localhost:$BackendPort" -ForegroundColor White
Write-Host "  Swagger            -> http://localhost:$BackendPort/swagger" -ForegroundColor White
Write-Host "  ML API             -> http://localhost:$MlPort" -ForegroundColor White
Write-Host ""
Write-Host "  Mobile access:" -ForegroundColor Cyan
Write-Host "    Android Emulator -> http://10.0.2.2:$BackendPort/api/" -ForegroundColor Cyan
if ($WifiIP) {
    Write-Host "    Physical Device  -> http://$WifiIP`:$BackendPort/api/" -ForegroundColor Cyan
}
else {
    Write-Host "    Physical Device  -> (Wi-Fi IP not detected)" -ForegroundColor Yellow
}
Write-Host ""
Write-Host "  Stop services: close each PowerShell window" -ForegroundColor Gray
Write-Host "  Press Ctrl+C to stop all services" -ForegroundColor Gray
Write-Host "==========================================" -ForegroundColor Green
