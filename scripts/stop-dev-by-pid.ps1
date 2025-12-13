param(
  [string]$PidFile = "$(Split-Path -Parent $MyInvocation.MyCommand.Path)\frontend.pid"
)

if (-Not (Test-Path $PidFile)) {
  Write-Error "PID file not found: $PidFile"
  exit 1
}

$pid = Get-Content $PidFile | Select-Object -First 1
try {
  Stop-Process -Id $pid -Force -ErrorAction Stop
  Remove-Item $PidFile -ErrorAction SilentlyContinue
  Write-Output "Stopped process $pid and removed PID file $PidFile"
} catch {
  Write-Error "Failed to stop process $pid: $_"
  exit 1
}
