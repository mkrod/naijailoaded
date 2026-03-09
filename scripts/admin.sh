#!/bin/bash
set -x
export PATH=$PATH:/usr/local/bin:/usr/bin:/bin:/root/.nvm/versions/node/v22.16.0/bin
PNPM_BIN="/root/.nvm/versions/node/v22.16.0/bin/pnpm"
ADMIN_DEST="/var/www/clients/client0/web18/web"

cd /var/www/nodejs/naijailoaded/admin || exit 1
$PNPM_BIN install && rm -rf dist/ && $PNPM_BIN run build

if [ -d "dist" ]; then
    rm -rf "${ADMIN_DEST:?}"/*
    cp -RT dist/ "$ADMIN_DEST"
    echo "Admin Deployed."
else
    echo "Admin Build Failed"; exit 1
fi