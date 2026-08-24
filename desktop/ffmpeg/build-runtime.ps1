param(
  [switch]$Force
)

$ErrorActionPreference = "Stop"

$AssetName = "ffmpeg-n9.0.1-6-g9d4ca21220-win64-lgpl-9.0.zip"
$AssetUrl = "https://github.com/BtbN/FFmpeg-Builds/releases/download/autobuild-2026-08-23-13-03/$AssetName"
$ExpectedArchiveSha256 = "96ee3965c8f8ba3210e59374c8b1c58f7c9552ea877d930f3fb63fac94fefcec"
$RuntimeDirectory = Join-Path $PSScriptRoot "runtime"
$CacheDirectory = Join-Path $PSScriptRoot ".cache"
$ArchivePath = Join-Path $CacheDirectory $AssetName
$FfmpegPath = Join-Path $RuntimeDirectory "ffmpeg.exe"
$FfprobePath = Join-Path $RuntimeDirectory "ffprobe.exe"
$ManifestPath = Join-Path $RuntimeDirectory "manifest.json"

function Get-Sha256([string]$Path) {
  return (Get-FileHash -Algorithm SHA256 -LiteralPath $Path).Hash.ToLowerInvariant()
}

function Test-Runtime {
  if (!(Test-Path -LiteralPath $FfmpegPath -PathType Leaf) -or !(Test-Path -LiteralPath $FfprobePath -PathType Leaf) -or !(Test-Path -LiteralPath $ManifestPath -PathType Leaf)) {
    return $false
  }
  try {
    & $FfmpegPath "-hide_banner" "-version" | Out-Null
    return $LASTEXITCODE -eq 0
  } catch {
    return $false
  }
}

New-Item -ItemType Directory -Force -Path $RuntimeDirectory, $CacheDirectory | Out-Null
if (!$Force -and (Test-Runtime)) {
  Write-Host "Verified FFmpeg runtime already exists at $RuntimeDirectory"
  exit 0
}

if (!(Test-Path -LiteralPath $ArchivePath -PathType Leaf) -or (Get-Sha256 $ArchivePath) -ne $ExpectedArchiveSha256) {
  if (Test-Path -LiteralPath $ArchivePath -PathType Leaf) { Remove-Item -Force -LiteralPath $ArchivePath }
  Write-Host "Downloading $AssetName"
  Invoke-WebRequest -Uri $AssetUrl -OutFile $ArchivePath
}

$actualArchiveSha256 = Get-Sha256 $ArchivePath
if ($actualArchiveSha256 -ne $ExpectedArchiveSha256) {
  throw "FFmpeg archive SHA-256 mismatch. Expected $ExpectedArchiveSha256 but received $actualArchiveSha256."
}

$temporaryDirectory = Join-Path ([System.IO.Path]::GetTempPath()) ("knoux-rec-ffmpeg-" + [guid]::NewGuid().ToString("N"))
try {
  Expand-Archive -LiteralPath $ArchivePath -DestinationPath $temporaryDirectory -Force
  $sourceFfmpeg = Get-ChildItem -LiteralPath $temporaryDirectory -Filter "ffmpeg.exe" -File -Recurse | Select-Object -First 1
  $sourceFfprobe = Get-ChildItem -LiteralPath $temporaryDirectory -Filter "ffprobe.exe" -File -Recurse | Select-Object -First 1
  if ($null -eq $sourceFfmpeg -or $null -eq $sourceFfprobe) {
    throw "The verified FFmpeg archive did not contain ffmpeg.exe and ffprobe.exe."
  }

  Remove-Item -Force -ErrorAction SilentlyContinue -LiteralPath $FfmpegPath, $FfprobePath, $ManifestPath
  Copy-Item -LiteralPath $sourceFfmpeg.FullName -Destination $FfmpegPath -Force
  Copy-Item -LiteralPath $sourceFfprobe.FullName -Destination $FfprobePath -Force

  $licenseCandidate = Get-ChildItem -LiteralPath $temporaryDirectory -File -Recurse | Where-Object { $_.Name -match "^(LICENSE|COPYING)(\..*)?$" } | Select-Object -First 1
  if ($null -ne $licenseCandidate) {
    Copy-Item -LiteralPath $licenseCandidate.FullName -Destination (Join-Path $RuntimeDirectory "FFMPEG-LICENSE.txt") -Force
  }

  $versionOutput = (& $FfmpegPath "-hide_banner" "-version" 2>&1 | Select-Object -First 1) -join ""
  if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($versionOutput)) {
    throw "The extracted ffmpeg.exe did not execute successfully."
  }

  $manifest = [ordered]@{
    assetName = $AssetName
    sourceUrl = $AssetUrl
    archiveSha256 = $actualArchiveSha256
    ffmpegSha256 = Get-Sha256 $FfmpegPath
    ffprobeSha256 = Get-Sha256 $FfprobePath
    version = $versionOutput.Trim()
    license = "LGPL-2.1-or-later (FFmpeg build variant: lgpl)"
    builtAt = (Get-Date).ToUniversalTime().ToString("o")
  }
  $manifest | ConvertTo-Json | Set-Content -LiteralPath $ManifestPath -Encoding utf8
  Write-Host "Verified FFmpeg runtime prepared at $RuntimeDirectory"
} finally {
  if (Test-Path -LiteralPath $temporaryDirectory) { Remove-Item -LiteralPath $temporaryDirectory -Recurse -Force }
}
