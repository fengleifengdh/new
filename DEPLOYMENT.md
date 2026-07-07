# Docker 部署说明

## 本地构建镜像

```bash
docker build -t bayer-wecom-mobile:latest .
```

## 本地运行容器

```bash
docker run -d --name bayer-wecom-mobile --restart unless-stopped -p 8080:80 bayer-wecom-mobile:latest
```

访问：

```text
http://服务器IP:8080
```

## 使用 docker compose

```bash
docker compose up -d --build
```

默认端口映射是：

```text
服务器 8080 -> 容器 80
```

如果服务器已有 8080 端口占用，修改 `docker-compose.yml`：

```yaml
ports:
  - "你的端口:80"
```

## 从 GitHub 拉取部署

```bash
git clone git@github.com:fengleifengdh/new.git
cd new
docker compose up -d --build
```

如果服务器没有配置 GitHub SSH key，可以用 HTTPS：

```bash
git clone https://github.com/fengleifengdh/new.git
```

## 本地静态镜像验证

如果 Docker 无法拉取 `node` 或 `nginx` 基础镜像，可以先用本地静态验证版。

先构建前端产物：

```bash
npm install
npm run build
```

再启动静态容器：

```bash
docker compose -f docker-compose.static.yml up -d --build
```

访问：

```text
http://localhost:8080
```

注意：`Dockerfile.static` 依赖本地已经生成的 `dist` 目录，适合本地验证；服务器正式部署优先使用默认的 `Dockerfile` 和 `docker-compose.yml`。

## 打包成文件后上传服务器

如果你不想在服务器上拉 GitHub 或重新构建镜像，可以在本地打包：

```powershell
powershell -ExecutionPolicy Bypass -File scripts/package-docker.ps1
```

打包完成后会生成：

```text
release/
  bayer-wecom-mobile-docker.tar
  deploy-docker.sh
  README.md
```

把整个 `release` 文件夹上传到服务器，然后在服务器执行：

```bash
cd release
chmod +x deploy-docker.sh
./deploy-docker.sh
```

默认访问端口是 `8080`。如果要改端口：

```bash
APP_PORT=8090 ./deploy-docker.sh
```

## 常用命令

查看容器：

```bash
docker ps
```

查看日志：

```bash
docker logs -f bayer-wecom-mobile
```

重启：

```bash
docker restart bayer-wecom-mobile
```

停止并删除：

```bash
docker compose down
```

## 后端接口说明

当前项目的 mock 数据在：

```text
public/api/dashboard.json
```

构建后会变成容器里的：

```text
/usr/share/nginx/html/api/dashboard.json
```

后续如果要接真实后端，建议在后端或网关提供正式接口，然后修改前端的接口地址配置。
