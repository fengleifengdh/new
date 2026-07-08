#!/bin/ash
# Simple HTTP static file server with SPA fallback
# Base path: /bayer-mobile/

BASE_PATH="/bayer-mobile"
WWW_ROOT="/www"

read -r request
path="${request#GET }"
path="${path%% HTTP/*}"
path="${path%%\?*}"

# Security: block path traversal
case "$path" in
  *".."*)
    printf "HTTP/1.1 403 Forbidden\r\nContent-Type: text/plain\r\nConnection: close\r\n\r\nForbidden\n"
    exit 0
    ;;
esac

# Map path to filesystem
case "$path" in
  "/bayer-mobile"|"/bayer-mobile/")
    file="${WWW_ROOT}${BASE_PATH}/index.html"
    ;;
  "${BASE_PATH}"/*)
    rel="${path#${BASE_PATH}}"
    file="${WWW_ROOT}${BASE_PATH}${rel}"
    ;;
  *)
    # Redirect root to app
    printf "HTTP/1.1 302 Found\r\nLocation: %s/\r\nConnection: close\r\n\r\n" "$BASE_PATH"
    exit 0
    ;;
esac

# SPA fallback: if file doesn't exist, serve index.html
if [ ! -f "$file" ]; then
  file="${WWW_ROOT}${BASE_PATH}/index.html"
fi

# MIME type
case "$file" in
  *.html) type="text/html; charset=utf-8" ;;
  *.css) type="text/css; charset=utf-8" ;;
  *.js) type="application/javascript; charset=utf-8" ;;
  *.json) type="application/json; charset=utf-8" ;;
  *.svg) type="image/svg+xml" ;;
  *.png) type="image/png" ;;
  *.jpg|*.jpeg) type="image/jpeg" ;;
  *.webp) type="image/webp" ;;
  *.ico) type="image/x-icon" ;;
  *) type="application/octet-stream" ;;
esac

printf "HTTP/1.1 200 OK\r\n"
printf "Content-Type: %s\r\n" "$type"
printf "Connection: close\r\n"
printf "\r\n"
cat "$file"
