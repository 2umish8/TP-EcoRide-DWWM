<#
Start backend server for E2E runs in background and record PID to scripts/backend.pid.
This uses `npm run start` (no nodemon, no prisma generate hook) to avoid Windows file-lock issues.
Usage: PowerShell -File .\scripts\start-backend-e2e.ps1
#>
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$cwd = Join-Path $scriptDir '..\Backend'

$npm = 'npm.cmd'
Write-Output "Starting Backend server for E2E in background (working dir: $cwd)"
$outLog = Join-Path $scriptDir 'backend.e2e.log'
$errLog = Join-Path $scriptDir 'backend.e2e.err.log'
$proc = Start-Process -FilePath $npm -ArgumentList 'run','start' -WorkingDirectory $cwd -WindowStyle Hidden -RedirectStandardOutput $outLog -RedirectStandardError $errLog -PassThru
$pidFile = Join-Path $scriptDir 'backend.pid'
$proc.Id | Out-File -FilePath $pidFile -Encoding ascii
Write-Output "Backend started with PID $($proc.Id). PID written to $pidFile"
Write-Output "Logs: $outLog / $errLog"
