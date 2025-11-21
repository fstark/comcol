#!/bin/bash
set -e

# Start Gunicorn in the background
exec gunicorn comcol_backend.wsgi:application \
    --bind 127.0.0.1:8000 \
    --workers 3 &

#    --env DJANGO_SETTINGS_MODULE=prod-settings \

# Wait for Gunicorn to start
sleep 3

# Start Nginx in the foreground
exec nginx -g 'daemon off;'
