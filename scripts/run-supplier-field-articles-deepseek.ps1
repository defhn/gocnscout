param(
  [int]$Limit = 1,
  [int]$Concurrency = 3,
  [switch]$NewBatch,
  [switch]$Force
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$script = Join-Path $PSScriptRoot "generate-supplier-field-articles-deepseek.cjs"

$argsList = @($script, "--limit", "$Limit", "--concurrency", "$Concurrency")
if ($NewBatch) { $argsList += "--newBatch" }
if ($Force) { $argsList += "--force" }

Write-Host "Running DeepSeek supplier field article generator..." -ForegroundColor Cyan
Write-Host "Limit: $Limit | Concurrency: $Concurrency" -ForegroundColor Gray
Write-Host ""

Set-Location $root
node @argsList

Write-Host ""
Write-Host "Done. Press Enter to close this window." -ForegroundColor Green
Read-Host | Out-Null
