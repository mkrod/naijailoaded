set -x
#!/bin/bash
export PATH=$PATH:/usr/local/bin:/usr/bin:/bin
cd /var/www/nodejs/naijailoaded/server || exit 1
pnpm install && pnpm run build
pm2 delete NL_SERVER 2>/dev/null
pm2 start pnpm --name "NL_SERVER" -- start --update-env