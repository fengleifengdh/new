param(
  [string]$ImageName = "bayer-wecom-mobile",
  [string]$ImageTag = "static",
  [string]$ReleaseDir = "release"
)

$ErrorActionPreference = "Stop"

$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
$ReleasePath = Join-Path $Root $ReleaseDir
$Image = "${ImageName}:${ImageTag}"
$ImageTar = Join-Path $ReleasePath "${ImageName}-docker.tar"

Set-Location $Root

Write-Host "1/5 Build frontend..."
npm run build

Write-Host "2/5 Build Docker image: $Image"
docker build -f Dockerfile.static -t $Image .

Write-Host "3/5 Prepare release folder..."
if (Test-Path $ReleasePath) {
  Remove-Item -Recurse -Force $ReleasePath
}
New-Item -ItemType Directory -Path $ReleasePath | Out-Null

Write-Host "4/5 Save Docker image..."
docker save -o $ImageTar $Image

Write-Host "5/5 Copy deploy files..."
Copy-Item (Join-Path $Root "scripts/deploy-docker.sh") (Join-Path $ReleasePath "deploy-docker.sh")

$Readme = @"
# Bayer WeCom Mobile Docker Package

Files:
- ${ImageName}-docker.tar: Docker image package
- deploy-docker.sh: server deployment script

Upload this whole folder to the server, then run:

chmod +x deploy-docker.sh
./deploy-docker.sh

Default access:

http://SERVER_IP:8080

Change port:

APP_PORT=8090 ./deploy-docker.sh
"@

Set-Content -Path (Join-Path $ReleasePath "README.md") -Value $Readme -Encoding UTF8

Write-Host ""
Write-Host "Package ready:"
Write-Host "  $ImageTar"
Write-Host ""
Write-Host "Upload the release folder to your server and run:"
Write-Host "  chmod +x deploy-docker.sh"
Write-Host "  ./deploy-docker.sh"
