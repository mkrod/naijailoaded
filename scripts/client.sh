#!/bin/bash
set -x
export PATH=$PATH:/usr/local/bin:/usr/bin:/bin:/root/.nvm/versions/node/v22.16.0/bin
PNPM_BIN="/root/.nvm/versions/node/v22.16.0/bin/pnpm"

cd /var/www/nodejs/naijailoaded/client || exit 1
$PNPM_BIN install && $PNPM_BIN run build
# Restart ensures the new build is picked up without losing the PM2 process link
pm2 restart NL_CLIENT || pm2 start $PNPM_BIN --name "NL_CLIENT" -- start