$ErrorActionPreference = 'Stop'
$helperRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$runtime = Join-Path $helperRoot 'runtime'
$packages = Join-Path $helperRoot 'packages'
$csc = Join-Path $env:WINDIR 'Microsoft.NET\Framework64\v4.0.30319\csc.exe'
$netstandard = Join-Path $env:WINDIR 'Microsoft.NET\Framework64\v4.0.30319\netstandard.dll'

function Ensure-Assembly {
  param([string]$PackageId, [string]$Version, [string]$AssemblyRelativePath)
  $packageRoot = Join-Path $packages $PackageId
  $assembly = Join-Path $packageRoot $AssemblyRelativePath
  if (Test-Path $assembly) { return $assembly }
  New-Item -ItemType Directory -Force -Path $packages, $packageRoot | Out-Null
  $archive = Join-Path $packages "$PackageId.$Version.nupkg"
  $url = "https://api.nuget.org/v3-flatcontainer/$($PackageId.ToLowerInvariant())/$Version/$($PackageId.ToLowerInvariant()).$Version.nupkg"
  & curl.exe --fail --location --output $archive $url
  if ($LASTEXITCODE -ne 0) { throw "Unable to download $PackageId $Version." }
  Expand-Archive -LiteralPath $archive -DestinationPath $packageRoot -Force
  if (-not (Test-Path $assembly)) { throw "Downloaded $PackageId but did not find $AssemblyRelativePath." }
  return $assembly
}

if (-not (Test-Path $csc)) { throw "Missing C# compiler: $csc" }
if (-not (Test-Path $netstandard)) { throw "Missing netstandard facade assembly: $netstandard" }
$core = Ensure-Assembly 'NAudio.Core' '2.2.1' 'lib\netstandard2.0\NAudio.Core.dll'
$wasapi = Ensure-Assembly 'NAudio.Wasapi' '2.2.1' 'lib\netstandard2.0\NAudio.Wasapi.dll'

New-Item -ItemType Directory -Force -Path $runtime | Out-Null
& $csc /nologo /target:exe /out:"$runtime\KnouxRecAudioHelper.exe" /reference:"$core" /reference:"$wasapi" /reference:"$netstandard" "$helperRoot\Program.cs"
if ($LASTEXITCODE -ne 0) { throw "C# compiler exited with $LASTEXITCODE" }
Copy-Item $core, $wasapi -Destination $runtime -Force
Write-Output "Built $runtime\KnouxRecAudioHelper.exe"
