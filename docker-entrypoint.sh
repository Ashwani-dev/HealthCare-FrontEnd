#!/bin/sh
set -e

# Set defaults if not provided
# Default to healthcare-app (backend service name) for Docker networking
export BACKEND_HOST=${BACKEND_HOST:-healthcare-app}
export BACKEND_PORT=${BACKEND_PORT:-8080}

# Substitute environment variables in nginx config template
envsubst '${BACKEND_HOST} ${BACKEND_PORT}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

# Start nginx
exec nginx -g "daemon off;"

