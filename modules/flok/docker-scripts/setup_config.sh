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

if [[ -z "$MIXPANEL_TOKEN" ]]; then
    echo "MIXPANEL_TOKEN environment variable not set. Analytics not recording."
else
    echo "window.appConfig.mixpanel_token=\"$MIXPANEL_TOKEN\"" >> /usr/share/nginx/html/config.js
fi

if [[ -z "$GOOGLE_TAG_MANAGER_ID" ]]; then
    echo "GOOGLE_TAG_MANAGER_ID environment variable not set. Google Analytics not recording."
else
    echo "window.appConfig.google_tag_manager_id=\"$GOOGLE_TAG_MANAGER_ID\"" >> /usr/share/nginx/html/config.js
fi

if [[ -z "$IMAGE_SERVER_BASE_URL" ]]; then
    echo "IMAGE_SERVER_BASE_URL environment variable not set, upload image calls won't work."
else
    echo "window.appConfig.image_server_base_url=\"$IMAGE_SERVER_BASE_URL\"" >> /usr/share/nginx/html/config.js
fi

####### Google & google maps config #######
[[ ! -z "$GOOGLE_MAPS_ID_HOTEL_PAGE" ]] && echo "window.appConfig.google_maps_id_hotel_page=\"$GOOGLE_MAPS_ID_HOTEL_PAGE\"" >> /usr/share/nginx/html/config.js
[[ ! -z "$GOOGLE_API_KEY" ]] && echo "window.appConfig.google_api_key=\"$GOOGLE_API_KEY\"" >> /usr/share/nginx/html/config.js

[[ ! -z "$MAX_TASKS" ]] && echo "window.appConfig.max_tasks=\"$MAX_TASKS\"" >> /usr/share/nginx/html/config.js

# Sample Data
[[ ! -z "$DEMO_TRIP_ARRIVAL" ]] && echo "window.appConfig.demo_trip_arrival=\"$DEMO_TRIP_ARRIVAL\"" >> /usr/share/nginx/html/config.js
[[ ! -z "$DEMO_TRIP_DEPARTURE" ]] && echo "window.appConfig.demo_trip_departure=\"$DEMO_TRIP_DEPARTURE\"" >> /usr/share/nginx/html/config.js

# Email Templates
[[ ! -z "$DEFAULT_FLIGHTS_EMAIL_TEMPLATE" ]] && echo "window.appConfig.default_flights_email_template=\"$DEFAULT_FLIGHTS_EMAIL_TEMPLATE\"" >> /usr/share/nginx/html/config.js
[[ ! -z "$DEFAULT_REGISTRATION_EMAIL_TEMPLATE" ]] && echo "window.appConfig.default_registration_email_template=\"$DEFAULT_REGISTRATION_EMAIL_TEMPLATE\"" >> /usr/share/nginx/html/config.js

echo "Final config.js file"
cat /usr/share/nginx/html/config.js