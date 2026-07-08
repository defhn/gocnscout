$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$validatePath = Join-Path $projectRoot "scripts\validate-canton-fair-cleaned.js"
$syncPath = Join-Path $projectRoot "scripts\sync-canton-fair-cleaned-to-db.js"

if (-not (Test-Path $validatePath)) {
  throw "Validate script not found: $validatePath"
}
if (-not (Test-Path $syncPath)) {
  throw "Sync script not found: $syncPath"
}

$command = @"
Set-Location -LiteralPath '$projectRoot'
`$Host.UI.RawUI.WindowTitle = 'gocnscout Canton Fair Database Sync'
node '$validatePath'
if (`$LASTEXITCODE -ne 0) { throw 'Validation failed. Database sync stopped.' }
node '$syncPath'
Write-Host ''
Write-Host 'Database sync window finished. Press Enter to close.'
Read-Host
"@

Start-Process -FilePath "powershell.exe" -ArgumentList @(
  "-NoExit",
  "-ExecutionPolicy", "Bypass",
  "-Command", $command
) -WorkingDirectory $projectRoot -WindowStyle Normal
