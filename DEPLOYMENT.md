# Docker 部署说明

本项目通过路径代理 (`/bayer-mobile/`) 挂接到已有 Nginx 反代下，与 `cn-ph-bidding-process` 等其他前端项目共用一个入口。

## 架构概览

```
用户请求 → 服务器 Nginx (80)
              ├─ /bayer/         → bidding-frontend-dev
              ├─ /bidding/       → bidding-backend-dev
              └─ /bayer-mobile/  → bayer-wecom-mobile  (本项目)
```

## 前置条件

服务器上已有共享 Docker 网络。如果还没有：

```bash
docker network create shared-proxy
```

## 部署步骤

### 方案 A: 上传源码到服务器构建（推荐）

```bash
# 在服务器上
git clone https://github.com/fengleifengdh/new.git
cd new
docker compose up -d --build
```

### 方案 B: 本地打包上传

在本地（Windows PowerShell）：

```powershell
# 先构建
npm run build

# 打包源码 + dist
powershell -ExecutionPolicy Bypass -File scripts/package-docker.ps1
```

然后把 `release/` 文件夹上传到服务器，执行：

```bash
cd release
chmod +x deploy-docker.sh
./deploy-docker.sh
```

## 配置 Nginx 反向代理

容器启动后，在服务器已有 Nginx 中加入以下 location 块。

已有 Nginx 配置通常在 `/etc/nginx/nginx.conf` 或 `cn-ph-bidding-process` 项目的 `.deploy/cn-ph-bidding-process/deploy/nginx/default.conf` 中。

```nginx
location /bayer-mobile/ {
    proxy_pass http://bayer-wecom-mobile/bayer-mobile/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

添加后重载 Nginx：

```bash
docker exec bidding-nginx-dev nginx -s reload
# 或者如果 Nginx 是宿主机直接安装的:
# nginx -s reload
```

## 访问

```text
http://服务器IP/bayer-mobile/
```

## 路径说明

| 配置项 | 值 | 说明 |
|--------|-----|------|
| Vite `base` | `/bayer-mobile/` | 前端构建时注入，所有资源引用带此前缀 |
| 容器内 Nginx | `/bayer-mobile/` SPA 路由 | 处理路径前缀，转发到 index.html |
| 容器内路径 | `/usr/share/nginx/html/bayer-mobile/` | dist 文件实际位置 |
| 外部 Nginx | `proxy_pass` 到容器名 | 依赖共享 Docker 网络 |

## 修改访问路径

如果要换一个路径前缀（比如 `/app/`），需要改三个地方：

1. `.env` 和 `.env.production`: `VITE_APP_BASE=/app/`
2. `Dockerfile`: `COPY --from=build /app/dist /usr/share/nginx/html/app`
3. `nginx.conf`: 把 `/bayer-mobile/` 换成 `/app/`
4. 服务器 Nginx location: 同样换前缀

## 常用命令

```bash
# 查看容器
docker ps | grep bayer

# 查看日志
docker logs -f bayer-wecom-mobile

# 重启
docker compose restart

# 重新构建并启动
docker compose up -d --build

# 停止并删除
docker compose down
```

## 本地独立验证（不走 Nginx）

如果只想本地验证不接 Nginx，改 `docker-compose.yml`：

```yaml
# 注释掉 expose 和 networks
# 取消注释 ports
ports:
  - "8080:80"
networks: []  # 独立运行
```

然后：

```bash
docker compose up -d --build
# 访问 http://localhost:8080/bayer-mobile/
```
