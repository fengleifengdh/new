#!/usr/bin/env sh
set -eu

APP_NAME="${APP_NAME:-bayer-wecom-mobile}"
IMAGE_NAME="${IMAGE_NAME:-bayer-wecom-mobile}"
IMAGE_TAG="${IMAGE_TAG:-static}"
IMAGE_TAR="${IMAGE_TAR:-./bayer-wecom-mobile-docker.tar}"
NETWORK="${NETWORK:-shared-proxy}"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is not installed or not in PATH."
  exit 1
fi

if [ ! -f "$IMAGE_TAR" ]; then
  echo "Image package not found: $IMAGE_TAR"
  exit 1
fi

echo "1/5 Create shared network (if not exists)..."
docker network create "$NETWORK" 2>/dev/null || echo "  Network $NETWORK already exists"

echo "2/5 Load Docker image..."
docker load -i "$IMAGE_TAR"

echo "3/5 Stop old container if exists..."
if docker ps -a --format '{{.Names}}' | grep -Fx "$APP_NAME" >/dev/null 2>&1; then
  docker rm -f "$APP_NAME" >/dev/null
  echo "  Old container removed"
fi

echo "4/5 Start container..."
docker run -d \
  --name "$APP_NAME" \
  --restart unless-stopped \
  --network "$NETWORK" \
  "${IMAGE_NAME}:${IMAGE_TAG}"

echo "5/5 Check status..."
sleep 2
docker ps --filter "name=$APP_NAME"

echo ""
echo "===== 部署完成 ====="
echo ""

# Quick health check
if docker exec "$APP_NAME" wget -qO- http://127.0.0.1/bayer-mobile/ >/dev/null 2>&1; then
  echo "健康检查通过"
else
  echo "警告: 健康检查未通过，请检查容器日志: docker logs $APP_NAME"
fi

echo ""
echo "下一步: 在已有 Nginx 配置中加入以下 location 块（参考 reverse-proxy.conf）："
echo ""
echo "  location /bayer-mobile/ {"
echo "      proxy_pass http://bayer-wecom-mobile/bayer-mobile/;"
echo "      proxy_set_header Host \$host;"
echo "      proxy_set_header X-Real-IP \$remote_addr;"
echo "      proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;"
echo "      proxy_set_header X-Forwarded-Proto \$scheme;"
echo "  }"
echo ""
echo "然后重载 Nginx:"
echo "  docker exec bidding-nginx-dev nginx -s reload"
echo ""
echo "访问: http://服务器IP/bayer-mobile/"
