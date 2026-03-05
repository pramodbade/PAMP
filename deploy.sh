#!/bin/bash
# ============================================================
# PAMP — Initial Deployment Script
# Run once on the VM after cloning the repository.
# Usage: bash deploy.sh
# ============================================================
set -e

echo "======================================================"
echo " PAMP — Initial Deployment"
echo "======================================================"

# 1. Check .env exists
if [ ! -f ".env" ]; then
  echo "ERROR: .env file not found."
  echo "  Copy .env.example → .env and fill in your values first."
  exit 1
fi

# 2. Source env to validate required variables
source .env

if [ -z "$POSTGRES_PASSWORD" ] || [ "$POSTGRES_PASSWORD" = "CHANGE_THIS_STRONG_PASSWORD" ]; then
  echo "ERROR: POSTGRES_PASSWORD is not set in .env"
  exit 1
fi

if [ -z "$SECRET_KEY" ] || [ "$SECRET_KEY" = "CHANGE_THIS_TO_A_LONG_RANDOM_SECRET_KEY" ]; then
  echo "ERROR: SECRET_KEY is not set in .env"
  exit 1
fi

if [ -z "$NEXT_PUBLIC_API_URL" ] || [ "$NEXT_PUBLIC_API_URL" = "http://YOUR_VM_IP/api" ]; then
  echo "ERROR: NEXT_PUBLIC_API_URL is not set in .env (set your VM's IP)"
  exit 1
fi

echo ""
echo "→ Building and starting all services..."
docker compose build --no-cache
docker compose up -d

echo ""
echo "→ Waiting for services to become healthy..."
sleep 15

echo ""
echo "→ Container status:"
docker compose ps

echo ""
echo "======================================================"
echo " Deployment complete!"
echo " Access PAMP at: http://$(hostname -I | awk '{print $1}')"
echo " Default login:  admin / Change1234!"
echo " IMPORTANT: Change all passwords immediately."
echo "======================================================"
