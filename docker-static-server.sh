#!/bin/ash

read -r request
path="${request#GET }"
path="${path%% HTTP/*}"
path="${path%%\?*}"

while read -r header && [ "$header" != $'\r' ]; do
  :
done

case "$path" in
  ""|"/")
    file="/www/index.html"
    ;;
  *".."*)
    file=""
    ;;
  *)
    file="/www${path}"
    ;;
esac

if [ -z "$file" ] || [ ! -f "$file" ]; then
  file="/www/index.html"
fi

case "$file" in
  *.html) type="text/html; charset=utf-8" ;;
  *.css) type="text/css; charset=utf-8" ;;
  *.js) type="application/javascript; charset=utf-8" ;;
  *.json) type="application/json; charset=utf-8" ;;
  *.svg) type="image/svg+xml" ;;
  *.png) type="image/png" ;;
  *.jpg|*.jpeg) type="image/jpeg" ;;
  *.webp) type="image/webp" ;;
  *) type="application/octet-stream" ;;
esac

printf "HTTP/1.1 200 OK\r\n"
printf "Content-Type: %s\r\n" "$type"
printf "Connection: close\r\n"
printf "\r\n"
cat "$file"
