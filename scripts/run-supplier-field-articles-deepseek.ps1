param(
  [int]$Limit = 1,
  [int]$Concurrency = 3,
  [switch]$NewBatch,
  [switch]$Force,
  [bool]$RetryFailedOnce = $true
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

$batchRoot = "D:\gocnscout博客文章\DeepSeek完整文章生成批次"
$lastBatchFile = Join-Path $batchRoot ".last-batch.txt"
if ($RetryFailedOnce -and (Test-Path -LiteralPath $lastBatchFile)) {
  $batchDir = (Get-Content -LiteralPath $lastBatchFile -Raw -Encoding UTF8).Trim()
  $progressFile = Join-Path $batchDir "progress.json"
  if (Test-Path -LiteralPath $progressFile) {
    $progress = Get-Content -LiteralPath $progressFile -Raw -Encoding UTF8 | ConvertFrom-Json
    $failedCount = @($progress.failed.PSObject.Properties).Count

    if ($failedCount -gt 0) {
      Write-Host ""
      Write-Host "Detected $failedCount failed item(s). Retrying failed items once..." -ForegroundColor Yellow
      node @argsList
    } else {
      Write-Host ""
      Write-Host "No failed items detected. Retry is not needed." -ForegroundColor Green
    }
  }
}

Write-Host ""
Write-Host "Done. Press Enter to close this window." -ForegroundColor Green
Read-Host | Out-Null
