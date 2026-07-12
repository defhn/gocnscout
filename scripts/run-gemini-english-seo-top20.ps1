$ErrorActionPreference = "Stop"

$ProjectRoot = "C:\Users\Administrator\Documents\GitHub\cnscout"
$OutputDir = "D:\gocnscout博客文章\Gemini英文SEO博客页面"
$SourceDir = "D:\gocnscout博客文章\DeepSeek完整文章生成批次\supplier-field-articles-20260712-190257\docs"
$Stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$LogPath = Join-Path $OutputDir "gemini-top20-$Stamp.log"

Set-Location $ProjectRoot

if (-not (Test-Path -LiteralPath $OutputDir)) {
  New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

Start-Transcript -LiteralPath $LogPath -Append

try {
  Write-Host "Gemini English SEO batch started"
  Write-Host "Project    : $ProjectRoot"
  Write-Host "Source dir : $SourceDir"
  Write-Host "Output dir : $OutputDir"
  Write-Host "Log        : $LogPath"
  Write-Host "Limit      : 20"
  Write-Host "Concurrency: 2"

  node scripts/generate-english-seo-blog-gemini.cjs `
    --sourceDir "$SourceDir" `
    --outputDir "$OutputDir" `
    --limit 20 `
    --concurrency 2 `
    --rerunFailures

  Write-Host "Gemini English SEO batch finished"
} finally {
  Stop-Transcript
}
