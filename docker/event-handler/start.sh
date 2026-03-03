#!/bin/sh
# Run server directly (no PM2) - if crash, wait 30s so Coolify can capture logs
echo "==> Pope Bot starting... (AUTH_SECRET=${AUTH_SECRET:+set} APP_URL=$APP_URL)"
node server.js || {
  EXIT=$?
  echo "==> CRASH exit=$EXIT"
  sleep 30
  exit $EXIT
}
