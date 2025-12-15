param(
  [string]$PidFile = "$(Split-Path -Parent $MyInvocation.MyCommand.Path)\frontend.pid"
)

if (-Not (Test-Path $PidFile)) {
  Write-Error "PID file not found: $PidFile"
  exit 1
}

$processId = Get-Content $PidFile | Select-Object -First 1
try {
  Stop-Process -Id $processId -Force -ErrorAction Stop
  Remove-Item $PidFile -ErrorAction SilentlyContinue
  Write-Output "Stopped process $processId and removed PID file $PidFile"
} catch {
  $message = $_.Exception.Message
  if ($message -match 'Impossible de trouver un processus' -or $message -match 'Cannot find a process') {
    Remove-Item $PidFile -ErrorAction SilentlyContinue
    Write-Warning ("Process {0} was already stopped. Removed PID file {1}" -f $processId, $PidFile)
    exit 0
  }

  Write-Error ("Failed to stop process {0}: {1}" -f $processId, $_)
  exit 1
}
