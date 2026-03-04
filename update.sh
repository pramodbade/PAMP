#!/bin/bash
# ============================================================
# PAMP — Update Script
# Run after pulling new code to redeploy updated services.
# Usage: bash update.sh [service]
#   bash update.sh           → rebuild and restart all services
#   bash update.sh backend   → rebuild only the backend
#   bash update.sh frontend  → rebuild only the frontend
# ============================================================
set -e

SERVICE=${1:-""}

echo "======================================================"
echo " PAMP — Update Deployment"
echo "======================================================"

echo "→ Pulling latest code..."
git pull

if [ -z "$SERVICE" ]; then
  echo "→ Rebuilding all services..."
  docker compose build backend frontend
  echo "→ Restarting services with zero-downtime rolling restart..."
  docker compose up -d --no-deps backend
  docker compose up -d --no-deps frontend
  docker compose restart nginx
else
  echo "→ Rebuilding service: $SERVICE"
  docker compose build "$SERVICE"
  echo "→ Restarting $SERVICE..."
  docker compose up -d --no-deps "$SERVICE"
fi

echo ""
echo "→ Container status:"
docker compose ps

echo ""
echo "======================================================"
echo " Update complete!"
echo "======================================================"
