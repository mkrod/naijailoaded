#!/bin/bash
set -x
export PATH=$PATH:/usr/local/bin:/usr/bin:/bin:/root/.nvm/versions/node/v22.16.0/bin
PNPM_PATH=$(which pnpm)

cd /var/www/nodejs/naijailoaded/server || exit 1
$PNPM_PATH install && $PNPM_PATH run build
# Restart instead of delete to prevent script termination
pm2 restart NL_SERVER --update-env || pm2 start $PNPM_PATH --name "NL_SERVER" -- start
sleep 5 # Wait for API to be ready for the client build