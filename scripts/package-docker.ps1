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

# Step 1: Build dist locally (avoids pulling node image from broken mirror)
Write-Host "1/4 Build frontend dist locally..."
$npmCmd = & {
  if (Test-Path "C:\Users\Administrator\.workbuddy\binaries\node\versions\22.22.2\node.exe") {
    Write-Output "C:\Users\Administrator\.workbuddy\binaries\node\versions\22.22.2\node.exe"
  } else {
    Write-Output "node"
  }
}

# Use npx from node_modules or install deps if needed
if (-not (Test-Path "node_modules")) {
  Write-Host "  Installing dependencies..."
  & npm install
  if ($LASTEXITCODE -ne 0) { throw "npm install failed" }
}

Write-Host "  Running vite build..."
& npm run build
if ($LASTEXITCODE -ne 0) { throw "Build failed" }

if (-not (Test-Path "dist/index.html")) {
  throw "Build did not produce dist/index.html"
}
Write-Host "  Build complete. dist/ ready."

# Step 2: Build Docker image using Dockerfile.static (only needs alpine:3.20, already cached)
Write-Host "2/4 Build Docker image: $Image (uses cached alpine:3.20)"
docker build -f Dockerfile.static -t $Image .
if ($LASTEXITCODE -ne 0) { throw "Docker build failed" }

# Step 3: Prepare release folder
Write-Host "3/4 Prepare release folder..."
if (Test-Path $ReleasePath) {
  Remove-Item -Recurse -Force $ReleasePath
}
New-Item -ItemType Directory -Path $ReleasePath | Out-Null

# Step 4: Save image and copy deploy files
Write-Host "4/4 Save Docker image and copy deploy files..."
docker save -o $ImageTar $Image
Copy-Item (Join-Path $Root "scripts/deploy-docker.sh") (Join-Path $ReleasePath "deploy-docker.sh")
Copy-Item (Join-Path $Root "deploy/nginx/reverse-proxy.conf") (Join-Path $ReleasePath "reverse-proxy.conf")
Copy-Item (Join-Path $Root "docker-compose.static.yml") (Join-Path $ReleasePath "docker-compose.yml")

$Readme = @'
# Bayer WeCom Mobile - Docker Package (Static)

## 文件
- bayer-wecom-mobile-docker.tar  : Docker 镜像 (alpine 静态服务器)
- deploy-docker.sh               : 服务器部署脚本
- docker-compose.yml             : docker compose 配置
- reverse-proxy.conf             : Nginx 反代配置片段

## 部署

把整个 release 文件夹上传到服务器 /opt/bayer-mobile/，然后执行：

```bash
cd /opt/bayer-mobile/release
chmod +x deploy-docker.sh
./deploy-docker.sh
```

## 访问

部署后在已有 Nginx 配置中加入 reverse-proxy.conf 的内容，重载 Nginx：

```bash
docker exec bidding-nginx-dev nginx -s reload
```

然后访问：http://服务器IP/bayer-mobile/
'@

Set-Content -Path (Join-Path $ReleasePath "README.md") -Value $Readme -Encoding UTF8

Write-Host ""
Write-Host "===== 打包完成 ====="
Write-Host "镜像: $ImageTar"
Write-Host "大小: $('{0:N0} MB' -f ((Get-Item $ImageTar).Length / 1MB))"
Write-Host ""
Write-Host "把 release/ 整个文件夹上传到服务器 /opt/bayer-mobile/, 然后执行:"
Write-Host "  cd /opt/bayer-mobile/release"
Write-Host "  chmod +x deploy-docker.sh"
Write-Host "  ./deploy-docker.sh"
