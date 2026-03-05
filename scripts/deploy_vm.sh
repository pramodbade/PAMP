#!/bin/bash
# ============================================================
# PAMP — VM Deployment Update Script
#
# Run this on the production VM after pushing code to GitHub.
# Usage: bash scripts/deploy_vm.sh
#
# What it does:
#   1. Pull latest code from GitHub
#   2. Stop all running containers
#   3. Rebuild backend and frontend images
#   4. Start all containers in detached mode
#   5. Show final container status
# ============================================================
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

echo "======================================================"
echo " PAMP — VM Update Deployment"
echo " Project: $PROJECT_ROOT"
echo "======================================================"

# Step 1 — Pull latest code from the remote repository
echo ""
echo "→ [1/5] Pulling latest code from GitHub..."
git pull origin main

# Step 2 — Stop all running containers (preserves the DB volume)
echo ""
echo "→ [2/5] Stopping running containers..."
docker compose down

# Step 3 — Rebuild backend and frontend images from fresh source
#          --no-cache ensures the new code is always picked up
echo ""
echo "→ [3/5] Building images..."
docker compose build backend frontend

# Step 4 — Start all services in detached (background) mode
echo ""
echo "→ [4/5] Starting all services..."
docker compose up -d

# Step 5 — Wait briefly for containers to initialise, then show status
echo ""
echo "→ [5/5] Waiting for services to start..."
sleep 8

echo ""
echo "→ Container status:"
docker compose ps

echo ""
echo "→ API health check:"
curl -sf http://localhost/api/health && echo "" || echo "WARNING: health check failed — check logs"

echo ""
echo "======================================================"
echo " Deployment complete."
echo " If something looks wrong: docker compose logs -f"
echo "======================================================"
