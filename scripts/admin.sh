#!/bin/bash
export PATH=$PATH:/usr/local/bin:/usr/bin:/bin
ADMIN_DEST="/var/www/clients/client0/web18/web"
cd /var/www/nodejs/naijailoaded/admin || exit 1

pnpm install
rm -rf dist/
rm -rf "${ADMIN_DEST:?}"/*
pnpm run build

if [ -d "dist" ]; then
    cp -RT dist/ "$ADMIN_DEST"
    echo "Admin Deployed."
else
    echo "Admin Build Failed"; exit 1
fi