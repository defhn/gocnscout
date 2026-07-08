$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$scriptPath = Join-Path $projectRoot "scripts\clean-canton-fair-deepseek.js"

if (-not (Test-Path $scriptPath)) {
  throw "Clean script not found: $scriptPath"
}

$command = @"
Set-Location -LiteralPath '$projectRoot'
`$Host.UI.RawUI.WindowTitle = 'gocnscout Canton Fair DeepSeek Local Cleaning'
node '$scriptPath'
Write-Host ''
Write-Host 'Local cleaning window finished. Press Enter to close.'
Read-Host
"@

Start-Process -FilePath "powershell.exe" -ArgumentList @(
  "-NoExit",
  "-ExecutionPolicy", "Bypass",
  "-Command", $command
) -WorkingDirectory $projectRoot -WindowStyle Normal
