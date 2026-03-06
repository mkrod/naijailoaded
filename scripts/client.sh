#!/bin/bash
export PATH=$PATH:/usr/local/bin:/usr/bin:/bin
cd /var/www/nodejs/naijailoaded/client || exit 1
pnpm install && pnpm run build
pm2 delete NL_CLIENT 2>/dev/null
pm2 start pnpm --name "NL_CLIENT" -- start