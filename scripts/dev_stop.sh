#!/bin/bash
# ============================================================
# PAMP — Local Development Stop
#
# Stops all running PAMP containers.
# Database data is preserved in the Docker volume (pamp_pgdata).
#
# Usage: bash scripts/dev_stop.sh
#
# To also delete the database volume (full reset):
#   docker compose down -v
# ============================================================
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

echo "→ Stopping PAMP local development stack..."
docker compose down

echo ""
echo "→ All containers stopped. Database data is preserved."
echo "  To start again: bash scripts/dev_start.sh"
