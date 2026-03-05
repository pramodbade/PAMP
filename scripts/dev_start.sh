#!/bin/bash
# ============================================================
# PAMP — Local Development Start
#
# Starts the full stack locally using Docker Compose.
# Run this from the project root or the scripts/ directory.
#
# Usage: bash scripts/dev_start.sh
#
# Prerequisites:
#   - Docker Desktop is running
#   - .env file exists (copy from .env.example and fill in values)
# ============================================================
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

# Verify .env exists before trying to start
if [ ! -f ".env" ]; then
  echo "ERROR: .env file not found."
  echo ""
  echo "  Run:  cp .env.example .env"
  echo "  Then edit .env and set:"
  echo "    POSTGRES_PASSWORD=<any local password>"
  echo "    SECRET_KEY=<any long random string>"
  echo "    NEXT_PUBLIC_API_URL=http://localhost/api"
  exit 1
fi

echo "→ Starting PAMP local development stack..."
docker compose up -d

echo ""
echo "→ Container status:"
docker compose ps

echo ""
echo "======================================================"
echo " PAMP is running at: http://localhost"
echo " API health:         http://localhost/api/health"
echo " API docs:           http://localhost/docs"
echo " Default login:      admin / Change1234!"
echo "======================================================"
