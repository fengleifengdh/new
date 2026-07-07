#!/usr/bin/env sh
set -eu

APP_NAME="${APP_NAME:-bayer-wecom-mobile}"
IMAGE_NAME="${IMAGE_NAME:-bayer-wecom-mobile}"
IMAGE_TAG="${IMAGE_TAG:-static}"
APP_PORT="${APP_PORT:-8080}"
CONTAINER_PORT="${CONTAINER_PORT:-80}"
IMAGE_TAR="${IMAGE_TAR:-./bayer-wecom-mobile-docker.tar}"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is not installed or not in PATH."
  exit 1
fi

if [ ! -f "$IMAGE_TAR" ]; then
  echo "Image package not found: $IMAGE_TAR"
  exit 1
fi

echo "1/4 Load Docker image..."
docker load -i "$IMAGE_TAR"

echo "2/4 Stop old container if exists..."
if docker ps -a --format '{{.Names}}' | grep -Fx "$APP_NAME" >/dev/null 2>&1; then
  docker rm -f "$APP_NAME" >/dev/null
fi

echo "3/4 Start container..."
docker run -d \
  --name "$APP_NAME" \
  --restart unless-stopped \
  -p "${APP_PORT}:${CONTAINER_PORT}" \
  "${IMAGE_NAME}:${IMAGE_TAG}"

echo "4/4 Check status..."
docker ps --filter "name=$APP_NAME"

echo ""
echo "Done."
echo "Open: http://SERVER_IP:${APP_PORT}"
