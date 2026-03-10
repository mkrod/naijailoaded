#!/bin/bash
# Force the PATH so it finds pnpm/pm2 regardless of the user
export PATH=$PATH:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin

BASE_DIR="/var/www/nodejs/naijailoaded"
SCRIPTS_DIR="$BASE_DIR/scripts"

# Make sure directory exists
cd "$BASE_DIR" || { echo "Directory $BASE_DIR not found"; exit 1; }

echo ">>> SYNCING WITH GITHUB <<<"
git pull
git reset --hard origin/main

# Run segments
# Using 'source' or 'bash' keeps things isolated
bash "$SCRIPTS_DIR/admin.sh"
bash "$SCRIPTS_DIR/client.sh"
bash "$SCRIPTS_DIR/server.sh"


echo ">>> ALL SEGMENTS FINISHED <<<"
pm2 status