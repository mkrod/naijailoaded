#!/bin/bash

LOCK_FILE="/tmp/naijailoaded_deploy.lock"

if [ -e "$LOCK_FILE" ]; then
  echo "⚠️ Deployment already in progress."
  exit 1
fi

trap "rm -f $LOCK_FILE" EXIT
touch $LOCK_FILE

echo "🚀 Deploying Naijailoaded..."

PROJECT_ROOT="/var/www/nodejs/naijailoaded"
cd "$PROJECT_ROOT" || exit 1

# 1. Sync Code
echo "📦 Pulling latest code..."
git pull origin main || exit 1

# 2. Build Client (Next.js)
if [ -d "client" ]; then
  echo "🧱 Building Frontend..."
  cd client && pnpm install && pnpm run build
  
  # Target for Static Files (Adjust this path if your web root changed)
  TARGET_DIR="/var/www/clients/client0/web14/web"
  
  if [ -d "out" ]; then
    echo "🚚 Syncing static files..."
    rsync -aq --delete out/ "$TARGET_DIR"/
  fi
  cd "$PROJECT_ROOT"
fi

# 3. Update & Restart Server
if [ -d "server" ]; then
  echo "🔧 Updating Server..."
  cd server && pnpm install
  
  echo "♻️ Restarting Naijailoaded Server..."
  
  # The FIX: Use exponential backoff so PM2 doesn't give up on crash
  pm2 start pnpm --name "naija-server" -- \
    start --exp-backoff-restart-delay 100 || pm2 restart "naija-server"
    
  pm2 save
fi

echo "✅ Naijailoaded is live!"