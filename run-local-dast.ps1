<#
.SYNOPSIS
    Run OWASP ZAP DAST scan with authentication against local backend API.
.DESCRIPTION
    1. Logs in to get JWT token
    2. Starts ZAP in daemon mode
    3. Configures auth header via Replacer, imports OpenAPI spec
    4. Runs active scan and generates reports
#>

param(
    [string]$ApiUrl = "http://localhost:5000",
    [string]$Username = "Simon",
    [string]$Password = "Leinuozhen2003.",
    [string]$ZapJar = "tools\zap\ZAP_2.17.0\zap-2.17.0.jar",
    [string]$ReportDir = "codequalityreports\dast",
    [int]$ZapPort = 8090
)

$ErrorActionPreference = "Continue"
$ProjectRoot = Get-Location

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  SmartSusChef DAST Scan (Authenticated)    " -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$zapFullPath = Join-Path $ProjectRoot $ZapJar
$absReportDir = Join-Path $ProjectRoot $ReportDir
$zapApiBase = "http://localhost:$ZapPort"

if (-not (Test-Path $zapFullPath)) {
    Write-Host "ERROR: ZAP jar not found at $zapFullPath" -ForegroundColor Red
    exit 1
}

# Ensure report dir exists
if (-not (Test-Path $absReportDir)) {
    New-Item -ItemType Directory -Path $absReportDir -Force | Out-Null
}

# --------------------------------------------------
# Step 1: Login to get JWT token
# --------------------------------------------------
Write-Host "[1/6] Logging in as '$Username'..." -ForegroundColor Yellow

$loginBody = @{
    username = $Username
    password = $Password
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$ApiUrl/api/Auth/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body $loginBody
    $token = $loginResponse.token
    if (-not $token) {
        Write-Host "ERROR: Login succeeded but no token in response." -ForegroundColor Red
        exit 1
    }
    Write-Host "  Login successful. Token acquired (length=$($token.Length))." -ForegroundColor Green
}
catch {
    Write-Host "ERROR: Login failed. Is the backend running at $ApiUrl ?" -ForegroundColor Red
    Write-Host "  $_" -ForegroundColor Red
    exit 1
}

# --------------------------------------------------
# Step 2: Start ZAP daemon
# --------------------------------------------------
Write-Host "[2/6] Starting ZAP daemon on port $ZapPort..." -ForegroundColor Yellow

# Kill any existing ZAP
Get-Process java -ErrorAction SilentlyContinue | Where-Object {
    try { $_.CommandLine -like "*zap*" } catch { $false }
} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Remove-Item "C:\Users\Pc\ZAP\.ZAP_JVM.lock" -Force -ErrorAction SilentlyContinue

$zapProcess = Start-Process -FilePath "java" -ArgumentList @(
    "-jar", $zapFullPath,
    "-daemon",
    "-port", $ZapPort,
    "-config", "api.disablekey=true",
    "-config", "api.addrs.addr.name=.*",
    "-config", "api.addrs.addr.regex=true",
    "-addoninstall", "openapi",
    "-addoninstall", "reports",
    "-addoninstall", "replacer"
) -PassThru -WindowStyle Hidden

# Wait for ZAP to be ready
$maxWait = 120
$waited = 0
while ($waited -lt $maxWait) {
    Start-Sleep -Seconds 3
    $waited += 3
    try {
        $ver = Invoke-RestMethod -Uri "$zapApiBase/JSON/core/view/version/" -TimeoutSec 5
        Write-Host "  ZAP started (version: $($ver.version)), waited ${waited}s." -ForegroundColor Green
        break
    }
    catch {
        if ($waited % 15 -eq 0) { Write-Host "  Waiting for ZAP... (${waited}s)" -ForegroundColor Gray }
    }
}

if ($waited -ge $maxWait) {
    Write-Host "ERROR: ZAP failed to start within ${maxWait}s." -ForegroundColor Red
    Stop-Process -Id $zapProcess.Id -Force -ErrorAction SilentlyContinue
    exit 1
}

# --------------------------------------------------
# Step 3: Configure Replacer rule for Auth header
# --------------------------------------------------
Write-Host "[3/6] Configuring Bearer token via Replacer..." -ForegroundColor Yellow

try {
    $replacerUrl = "$zapApiBase/JSON/replacer/action/addRule/" +
    "?description=AuthToken" +
    "&enabled=true" +
    "&matchType=REQ_HEADER" +
    "&matchRegex=false" +
    "&matchString=Authorization" +
    "&replacement=Bearer+$token" +
    "&initiators="
    Invoke-RestMethod -Uri $replacerUrl -TimeoutSec 10 | Out-Null
    Write-Host "  Replacer rule added." -ForegroundColor Green
}
catch {
    Write-Host "  WARNING: Failed to add replacer rule: $_" -ForegroundColor DarkYellow
    Write-Host "  Scan will proceed without authentication." -ForegroundColor DarkYellow
}

# --------------------------------------------------
# Step 4: Import OpenAPI spec
# --------------------------------------------------
Write-Host "[4/6] Importing OpenAPI spec from Swagger..." -ForegroundColor Yellow

try {
    $encodedUrl = [System.Uri]::EscapeDataString("$ApiUrl/swagger/v1/swagger.json")
    $encodedTarget = [System.Uri]::EscapeDataString($ApiUrl)
    $importUrl = "$zapApiBase/JSON/openapi/action/importUrl/?url=$encodedUrl&hostOverride=&contextId="
    $importResult = Invoke-RestMethod -Uri $importUrl -TimeoutSec 30
    Write-Host "  OpenAPI imported. URLs added." -ForegroundColor Green
}
catch {
    Write-Host "  WARNING: OpenAPI import failed: $_" -ForegroundColor DarkYellow
}

# Wait for passive scan to finish
Start-Sleep -Seconds 5
Write-Host "  Waiting for passive scan to complete..." -ForegroundColor Gray
$pscanWait = 0
while ($pscanWait -lt 120) {
    try {
        $recordsLeft = (Invoke-RestMethod -Uri "$zapApiBase/JSON/pscan/view/recordsToScan/" -TimeoutSec 5).recordsToScan
        if ([int]$recordsLeft -eq 0) { break }
        Start-Sleep -Seconds 3
        $pscanWait += 3
    }
    catch { break }
}
Write-Host "  Passive scan done." -ForegroundColor Green

# --------------------------------------------------
# Step 5: Active Scan
# --------------------------------------------------
Write-Host "[5/6] Running active scan..." -ForegroundColor Yellow

try {
    $encodedUrl2 = [System.Uri]::EscapeDataString($ApiUrl)
    $scanResult = Invoke-RestMethod -Uri "$zapApiBase/JSON/ascan/action/scan/?url=$encodedUrl2&recurse=true&inScopeOnly=false&scanPolicyName=&method=&postData=&contextId=" -TimeoutSec 30
    $scanId = $scanResult.scan
    Write-Host "  Active scan started (ID: $scanId)" -ForegroundColor Green

    # Wait for scan to finish
    $scanWait = 0
    $maxScanWait = 600  # 10 minutes max
    while ($scanWait -lt $maxScanWait) {
        Start-Sleep -Seconds 5
        $scanWait += 5
        try {
            $status = (Invoke-RestMethod -Uri "$zapApiBase/JSON/ascan/view/status/?scanId=$scanId" -TimeoutSec 10).status
            if ($scanWait % 30 -eq 0) {
                Write-Host "  Scan progress: $status%" -ForegroundColor Gray
            }
            if ([int]$status -ge 100) { break }
        }
        catch { break }
    }
    Write-Host "  Active scan complete." -ForegroundColor Green
}
catch {
    Write-Host "  WARNING: Active scan failed: $_" -ForegroundColor DarkYellow
}

# --------------------------------------------------
# Step 6: Generate Reports
# --------------------------------------------------
Write-Host "[6/6] Generating reports..." -ForegroundColor Yellow

# Get alerts summary
try {
    $alertsSummary = Invoke-RestMethod -Uri "$zapApiBase/JSON/alert/view/alertsSummary/?baseurl=$([System.Uri]::EscapeDataString($ApiUrl))" -TimeoutSec 10
    Write-Host "  Alerts summary: $($alertsSummary | ConvertTo-Json -Compress)" -ForegroundColor Gray
}
catch {}

# Generate JSON report via ZAP API
try {
    $jsonReport = Invoke-RestMethod -Uri "$zapApiBase/OTHER/core/other/jsonreport/" -TimeoutSec 30
    $jsonReportPath = Join-Path $absReportDir "local-api-report.json"
    $jsonReport | ConvertTo-Json -Depth 20 | Set-Content -Path $jsonReportPath -Encoding UTF8
    Write-Host "  JSON report: $jsonReportPath" -ForegroundColor Green
}
catch {
    Write-Host "  WARNING: JSON report generation failed: $_" -ForegroundColor DarkYellow
}

# Generate HTML report
try {
    $htmlContent = Invoke-WebRequest -Uri "$zapApiBase/OTHER/core/other/htmlreport/" -TimeoutSec 30 -UseBasicParsing
    $htmlReportPath = Join-Path $absReportDir "local-api-report.html"
    [System.IO.File]::WriteAllBytes($htmlReportPath, $htmlContent.Content)
    Write-Host "  HTML report: $htmlReportPath" -ForegroundColor Green
}
catch {
    Write-Host "  WARNING: HTML report generation failed: $_" -ForegroundColor DarkYellow
}

# List all scanned URLs
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Scan Summary" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

try {
    $urls = Invoke-RestMethod -Uri "$zapApiBase/JSON/core/view/urls/?baseurl=$([System.Uri]::EscapeDataString($ApiUrl))" -TimeoutSec 10
    $urlList = $urls.urls
    Write-Host "  Total URLs discovered: $($urlList.Count)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Scanned endpoints:" -ForegroundColor Gray
    foreach ($u in $urlList) {
        Write-Host "    - $u" -ForegroundColor Gray
    }
}
catch {
    Write-Host "  Could not retrieve URL list." -ForegroundColor DarkYellow
}

# Get alerts
try {
    $alerts = Invoke-RestMethod -Uri "$zapApiBase/JSON/alert/view/alerts/?baseurl=$([System.Uri]::EscapeDataString($ApiUrl))&start=0&count=100" -TimeoutSec 10
    $alertList = $alerts.alerts
    $riskCounts = @{ "High" = 0; "Medium" = 0; "Low" = 0; "Informational" = 0 }
    foreach ($a in $alertList) {
        $risk = $a.risk
        if ($riskCounts.ContainsKey($risk)) { $riskCounts[$risk]++ }
    }
    Write-Host ""
    Write-Host "  Alert breakdown:" -ForegroundColor Yellow
    Write-Host "    High:          $($riskCounts['High'])" -ForegroundColor $(if ($riskCounts['High'] -gt 0) { "Red" } else { "Green" })
    Write-Host "    Medium:        $($riskCounts['Medium'])" -ForegroundColor $(if ($riskCounts['Medium'] -gt 0) { "Yellow" } else { "Green" })
    Write-Host "    Low:           $($riskCounts['Low'])" -ForegroundColor $(if ($riskCounts['Low'] -gt 0) { "DarkYellow" } else { "Green" })
    Write-Host "    Informational: $($riskCounts['Informational'])" -ForegroundColor Cyan
}
catch {}

Write-Host ""
Write-Host "  Reports saved to: $absReportDir" -ForegroundColor Green
Write-Host ""

# Shutdown ZAP
Write-Host "Shutting down ZAP..." -ForegroundColor Gray
try { Invoke-RestMethod -Uri "$zapApiBase/JSON/core/action/shutdown/" -TimeoutSec 10 | Out-Null } catch {}
Start-Sleep -Seconds 3
Stop-Process -Id $zapProcess.Id -Force -ErrorAction SilentlyContinue

Write-Host "Done." -ForegroundColor Green
