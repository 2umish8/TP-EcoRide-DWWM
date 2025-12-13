<#
Start backend in background, wait for it to be healthy, run Playwright E2E tests from Frontend, then stop backend
Usage: PowerShell -File .\scripts\run-e2e-with-backend.ps1 -TimeoutSeconds 180
#>
param(
  [int]$TimeoutSeconds = 180
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPidFile = Join-Path $scriptDir 'backend.pid'

Write-Output 'Starting backend in background...'
& (Join-Path $scriptDir 'start-backend-dev.ps1')

Write-Output 'Starting frontend in background (for Playwright webServer reuse)...'
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
$testProc = Start-Process -FilePath $npm -ArgumentList 'run','test:e2e','--','--workers=1' -NoNewWindow -Wait -PassThru
$exitCode = $testProc.ExitCode
Pop-Location

Write-Output ('E2E tests finished with exit code ' + $exitCode)

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
