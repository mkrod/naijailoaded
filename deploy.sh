#!/bin/bash

# Configuration
BASE_DIR="/var/www/nodejs/naijailoaded"
SERVER_DIR="$BASE_DIR/server"
CLIENT_DIR="$BASE_DIR/client"
ADMIN_DIR="$BASE_DIR/admin"
ADMIN_DEST="/var/www/clients/client0/web18/web/"

# Colors for feedback
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Forcing Sync with GitHub...${NC}"
cd $BASE_DIR || { echo -e "${RED}Base directory not found!${NC}"; exit 1; }

# Discard any local server changes and pull fresh
git fetch --all
git reset --hard origin/main

# --- 1. EXPRESS SERVER ---
echo -e "\n--- Processing EXPRESS SERVER ---"
cd $SERVER_DIR || { echo -e "${RED}Server directory not found!${NC}"; exit 1; }
pnpm install
echo "Building Server..."
pnpm run build
pm2 delete NL_SERVER 2>/dev/null 
pm2 start pnpm --name "NL_SERVER" -- start --update-env
echo -e "${GREEN}NL_SERVER is running.${NC}"

# --- 2. NEXTJS CLIENT ---
echo -e "\n--- Processing NEXTJS CLIENT ---"
cd $CLIENT_DIR || { echo -e "${RED}Client directory not found!${NC}"; exit 1; }
pnpm install
echo "Building Client..."
pnpm run build
pm2 delete NL_CLIENT 2>/dev/null
pm2 start pnpm --name "NL_CLIENT" -- start --update-env
echo -e "${GREEN}NL_CLIENT is running on port 5190.${NC}"


# --- 3. ADMIN REACT VITE ---
echo -e "\n--- Processing ADMIN PANEL ---"
cd $ADMIN_DIR || { echo -e "${RED}Admin directory not found!${NC}"; exit 1; }
pnpm install

echo "Cleaning local dist and remote destination..."
rm -rf dist/
# Clean destination content but keep the folder itself
rm -rf "${ADMIN_DEST:?}"/*
echo "Building Admin..."
pnpm run build

if [ -d "dist" ]; then
    echo "Deploying to web18..."
    mkdir -p $ADMIN_DEST
    cp -RT dist/ $ADMIN_DEST
    echo -e "${GREEN}Admin files deployed to $ADMIN_DEST${NC}"
else
    echo -e "${RED}Build failed: dist folder not found!${NC}"
    exit 1
fi

echo -e "\n${GREEN}TOTAL DEPLOYMENT SUCCESSFUL!${NC}"
pm2 status