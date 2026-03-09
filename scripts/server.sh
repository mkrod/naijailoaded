#!/bin/bash
set -x
export PATH=$PATH:/usr/local/bin:/usr/bin:/bin:/root/.nvm/versions/node/v22.16.0/bin
PNPM_PATH=$(which pnpm)

cd /var/www/nodejs/naijailoaded/server || exit 1
$PNPM_PATH install && $PNPM_PATH run build
pm2 delete NL_SERVER 2>/dev/null || true
pm2 start $PNPM_PATH --name "NL_SERVER" -- start --update-env