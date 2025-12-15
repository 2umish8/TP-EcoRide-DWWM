<#
Start backend in background, wait for it to be healthy, run Playwright E2E tests from Frontend, then stop backend
Usage: PowerShell -File .\scripts\run-e2e-with-backend.ps1 -TimeoutSeconds 180
#>
param(
  [int]$TimeoutSeconds = 180,
  [string]$TestFile = '',
  [string]$Project = 'chromium',
  [string]$Reporter = 'dot',
  [string]$Workers = ''
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPidFile = Join-Path $scriptDir 'backend.pid'

function Stop-ListeningProcessOnPort {
  param([int]$Port)
  try {
    $conn = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction Stop | Select-Object -First 1
    if ($null -ne $conn -and $conn.OwningProcess -and $conn.OwningProcess -ne 0) {
      Write-Output "Port $Port is in use by PID $($conn.OwningProcess). Stopping it..."
      Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
      Start-Sleep -Milliseconds 250
    }
  } catch {
    # Ignore if Get-NetTCPConnection is unavailable or no listener exists
  }
}

Write-Output 'Starting backend in background...'
& (Join-Path $scriptDir 'start-backend-e2e.ps1')

Write-Output 'Starting frontend in background (for Playwright webServer reuse)...'
Stop-ListeningProcessOnPort -Port 5173
& (Join-Path $scriptDir 'start-frontend-dev.ps1')

Write-Output 'Waiting for backend health endpoint to respond (timeout ' + $TimeoutSeconds + 's)'
$start = Get-Date
$healthy = $false
while (((Get-Date) - $start).TotalSeconds -lt $TimeoutSeconds) {
  try {
    $resp = Invoke-WebRequest -Uri 'http://localhost:3000/api/health' -TimeoutSec 5 -UseBasicParsing
    if ($resp.StatusCode -eq 200) { $healthy = $true; break }
  } catch { }
  Start-Sleep -Seconds 1
}

if (-not $healthy) {
  Write-Error "Backend did not become healthy within ${TimeoutSeconds}s"
  exit 1
}

Write-Output 'Backend healthy - running Playwright E2E tests from Frontend'
Push-Location (Join-Path $scriptDir '..\Frontend')
$npm = 'npm.cmd'
$args = @('run','test:e2e','--',"--project=$Project","--reporter=$Reporter")
if ($Workers -and $Workers.Trim().Length -gt 0) {
  $args += ("--workers=$($Workers.Trim())")
}
if ($TestFile -and $TestFile.Trim().Length -gt 0) {
  $normalizedTestFile = $TestFile.Trim()
  $normalizedTestFile = $normalizedTestFile -replace '^[.\\/]*Frontend[\\/]', ''
  $normalizedTestFile = $normalizedTestFile -replace '\\', '/'
  $args += $normalizedTestFile
}

$e2eLog = Join-Path $scriptDir 'e2e.last.log'
Remove-Item $e2eLog -ErrorAction SilentlyContinue
Write-Output ('Running Playwright: npm ' + ($args -join ' '))
& $npm @args 2>&1 | Tee-Object -FilePath $e2eLog
$exitCode = $LASTEXITCODE
Pop-Location

Write-Output ('E2E tests finished with exit code ' + $exitCode)
Write-Output ('E2E log: ' + $e2eLog)

if ($exitCode -ne 0 -and (Test-Path $e2eLog)) {
  Write-Output '--- Last 200 lines of Playwright output ---'
  Get-Content $e2eLog -Tail 200
  Write-Output '--- End ---'
}

if (Test-Path $backendPidFile) {
  Write-Output "Stopping backend..."
  & (Join-Path $scriptDir 'stop-dev-by-pid.ps1') -PidFile $backendPidFile
}

$frontendPidFile = Join-Path $scriptDir 'frontend.pid'
if (Test-Path $frontendPidFile) {
  Write-Output "Stopping frontend..."
  & (Join-Path $scriptDir 'stop-dev-by-pid.ps1') -PidFile $frontendPidFile
}

exit $exitCode
