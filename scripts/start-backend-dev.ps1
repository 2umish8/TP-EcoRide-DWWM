<#
Start backend dev server in background and record PID to scripts/backend.pid
Usage: PowerShell -File .\scripts\start-backend-dev.ps1
#>
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$cwd = Join-Path $scriptDir '..\Backend'

$npm = 'npm.cmd'
Write-Output "Starting Backend dev server in background (working dir: $cwd)"
$proc = Start-Process -FilePath $npm -ArgumentList 'run','dev' -WorkingDirectory $cwd -NoNewWindow -PassThru
$pidFile = Join-Path $scriptDir 'backend.pid'
$proc.Id | Out-File -FilePath $pidFile -Encoding ascii
Write-Output "Backend started with PID $($proc.Id). PID written to $pidFile"
Write-Output "To stop: Stop-Process -Id $($proc.Id) -Force or .\scripts\stop-dev-by-pid.ps1 -PidFile $pidFile"
