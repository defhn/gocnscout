$ErrorActionPreference = "Stop"

$ProjectRoot = "C:\Users\Administrator\Documents\GitHub\cnscout"
$Runner = Join-Path $ProjectRoot "scripts\run-gemini-english-seo-top20.ps1"

if (-not (Test-Path -LiteralPath $Runner)) {
  throw "Runner not found: $Runner"
}

Start-Process powershell.exe -ArgumentList @(
  "-NoExit",
  "-ExecutionPolicy", "Bypass",
  "-File", "`"$Runner`""
) -WorkingDirectory $ProjectRoot

Write-Host "Started a separate PowerShell window for Gemini top-20 generation."
