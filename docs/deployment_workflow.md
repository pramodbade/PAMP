# PAMP — Development and Deployment Workflow

This document describes the full lifecycle from local development to production deployment.

```
Developer Machine  →  GitHub Repository  →  Production VM (Docker Compose)
```

---

## Overview

| Environment | Location | How it runs |
|---|---|---|
| Local Development | Developer laptop | `docker compose up -d` |
| Git Remote | GitHub | Source of truth |
| Production | Ubuntu VM | `docker compose up -d` via SSH |

---

## Local Development

### Prerequisites

- Docker Desktop installed and running
- Git configured (`git config --global user.name` / `user.email`)

### First-time setup

```bash
# 1. Clone the repository
git clone git@github.com:<your-org>/PAMP.git
cd PAMP

# 2. Create your local environment file
cp .env.example .env

# 3. Edit .env — for local development, use these values:
#    POSTGRES_DB=pamp_db
#    POSTGRES_USER=pamp_user
#    POSTGRES_PASSWORD=LocalDevPass123
#    SECRET_KEY=$(openssl rand -hex 32)
#    NEXT_PUBLIC_API_URL=http://localhost/api
nano .env   # or code .env / vim .env

# 4. Start all services
docker compose up -d

# 5. Verify everything is running
docker compose ps
curl http://localhost/api/health
```

Open `http://localhost` in your browser and log in with `admin / Change1234!`.

### Daily workflow

```bash
# Start the stack
bash scripts/dev_start.sh
# or: docker compose up -d

# Stop the stack
bash scripts/dev_stop.sh
# or: docker compose down

# View logs for a specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f nginx

# Rebuild after a dependency change (requirements.txt or package.json)
docker compose build backend
docker compose build frontend
docker compose up -d
```

### Making code changes

The backend and frontend containers mount no live-reload volumes in production mode.
To test code changes locally, rebuild the relevant service:

```bash
# Backend code changed
docker compose build backend && docker compose up -d backend

# Frontend code changed
docker compose build frontend && docker compose up -d frontend
```

---

## Pushing to GitHub

```bash
# 1. Check status — never commit .env
git status

# 2. Stage changes (be specific — avoid git add -A)
git add backend/api/my_file.py
git add frontend/pages/my_page.js

# 3. Commit
git commit -m "feat: short description of what changed"

# 4. Push to main branch
git push origin main
```

### What must NEVER be committed

| File/Pattern | Why |
|---|---|
| `.env` | Contains real passwords and secret keys |
| `backend/venv/` | Python virtual environment |
| `frontend/node_modules/` | Node packages |
| `frontend/.next/` | Build output |
| `*.log` | Runtime logs |
| `.DS_Store` | macOS metadata |
| `*.pem`, `*.key` | SSH / TLS certificates |

All of the above are excluded by `.gitignore`.

---

## Production VM Deployment

### First-time deployment (run once)

```bash
# 1. SSH into the VM
ssh user@<VM_IP>

# 2. Install Docker (if not already installed)
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
newgrp docker

# 3. Configure GitHub SSH deploy key
ssh-keygen -t ed25519 -C "pamp-vm-deploy" -f ~/.ssh/id_ed25519 -N ""
cat ~/.ssh/id_ed25519.pub
# → Add this public key to GitHub: Repo Settings → Deploy Keys → Add Key (read-only)

# Test the connection
ssh -T git@github.com

# 4. Clone the repository
git clone git@github.com:<your-org>/PAMP.git /opt/pamp/PAMP
cd /opt/pamp/PAMP

# 5. Create the production .env
cp .env.example .env
nano .env
# Fill in:
#   POSTGRES_PASSWORD=<strong-random-password>       # no @ character
#   SECRET_KEY=$(openssl rand -hex 32)
#   NEXT_PUBLIC_API_URL=http://<YOUR_VM_PUBLIC_IP>/api

# 6. Run the initial deployment
bash deploy.sh
```

### Updating production after a code push

After pushing new code to GitHub, update the VM:

```bash
# SSH to VM
ssh user@<VM_IP>

# Navigate to project directory
cd /opt/pamp/PAMP

# Pull latest code and redeploy
bash update.sh
# or use the scripts/ version:
bash scripts/deploy_vm.sh
```

The update script:
1. Pulls latest code from GitHub
2. Rebuilds the backend and frontend images
3. Replaces containers one at a time (database is never touched)
4. Restarts nginx

### Verify services after deploy

```bash
# Check all containers are Up
docker compose ps

# Check API health
curl http://localhost/api/health

# Check recent logs
docker compose logs --tail=50 backend
docker compose logs --tail=50 nginx
```

---

## Service Architecture

```
Internet
   │
   ▼  port 80
┌─────────┐
│  nginx  │  reverse proxy, strips /api prefix
└────┬────┘
     │ /api/* → backend:8000
     │ /*     → frontend:3000
     │
┌────┴────┐       ┌──────────────┐
│ backend │──────►│  PostgreSQL  │
│ FastAPI │       │   pamp_db    │
└─────────┘       └──────────────┘
     │
┌────┴────┐
│frontend │
│ Next.js │
└─────────┘
```

All inter-service communication stays inside the `pamp_net` Docker bridge network.
Only port 80 is exposed to the host.

---

## Environment Variable Reference

| Variable | Local Dev Example | Production Example | Notes |
|---|---|---|---|
| `POSTGRES_DB` | `pamp_db` | `pamp_db` | Database name |
| `POSTGRES_USER` | `pamp_user` | `pamp_user` | DB role |
| `POSTGRES_PASSWORD` | `LocalDevPass123` | `<strong-random>` | No `@` character |
| `SECRET_KEY` | *(any 32+ char string)* | `openssl rand -hex 32` | JWT signing key |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `480` | `480` | 8 hours |
| `NEXT_PUBLIC_API_URL` | `http://localhost/api` | `http://<VM_IP>/api` | Browser-visible API URL |

> **Important**: `NEXT_PUBLIC_API_URL` is baked into the frontend bundle at build time.
> If your VM IP changes, update `.env` and rebuild the frontend: `bash update.sh frontend`

---

## Firewall Rules (VM)

| Port | Direction | Purpose |
|---|---|---|
| 22 | Inbound | SSH admin |
| 80 | Inbound | PAMP web application |
| All | Outbound | Docker pull, git, apt |

Ports 3000, 5432, and 8000 must remain closed — they are internal only.

---

## Database Operations

### Backup

```bash
docker exec pamp_db pg_dump -U pamp_user pamp_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore

```bash
cat backup_YYYYMMDD_HHMMSS.sql | docker exec -i pamp_db psql -U pamp_user -d pamp_db
```

### Connect interactively

```bash
docker exec -it pamp_db psql -U pamp_user -d pamp_db
```

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Backend `password authentication failed` | `@` in POSTGRES_PASSWORD | Remove `@` from password in `.env`, restart |
| Frontend shows old VM IP | `NEXT_PUBLIC_API_URL` baked in at build | Update `.env`, run `bash update.sh frontend` |
| Container exits immediately | Configuration error | `docker compose logs <service>` |
| Login fails | Wrong hash in DB | See password reset in `DEPLOYMENT.md` |
| Port 80 refused | nginx not running | `docker compose up -d nginx` |
