#!/usr/bin/env bash
if [[ -z "$API_URL" ]]; then
    echo "API_URL environment variable needs to be present."
    exit 1
fi
if [[ -z "$IMAGES_URL" ]]; then
    echo "IMAGES_URL environment variable needs to be present."
    exit 1
fi

echo "window.appConfig={}" > /usr/share/nginx/html/config.js
echo "window.appConfig.server_base_url=\"$API_URL\"" >> /usr/share/nginx/html/config.js
echo "window.appConfig.images_base_url=\"$IMAGES_URL\"" >> /usr/share/nginx/html/config.js

if [[ -z "$IMAGE_SERVER_BASE_URL" ]]; then
    echo "IMAGE_SERVER_BASE_URL environment variable not set. Hotel image upload will not work."
else
    echo "window.appConfig.image_server_base_url=\"$IMAGE_SERVER_BASE_URL\"" >> /usr/share/nginx/html/config.js
fi

[[ ! -z "$FLOK_BASE_URL" ]] && echo "window.appConfig.flok_base_url=\"$FLOK_BASE_URL\"" >> /usr/share/nginx/html/config.js
[[ ! -z "$GOOGLE_API_KEY" ]] && echo "window.appConfig.google_api_key=\"$GOOGLE_API_KEY\"" >> /usr/share/nginx/html/config.js

echo "Final config.js file"
cat /usr/share/nginx/html/config.js