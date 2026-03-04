# PAMP — Deployment Guide

Step-by-step instructions for deploying PAMP on an Ubuntu VM using Docker Compose.

---

## Prerequisites

| Requirement | Version | Install |
|-------------|---------|---------|
| Ubuntu | 22.04 LTS or later | — |
| Docker Engine | 24+ (apt, not snap) | See below |
| Docker Compose | v2 (included with Docker) | See below |
| Git | Any recent | `apt install git` |
| Open port | 80 (HTTP) | Via cloud firewall / NSG |

> **Important**: Install Docker via `apt` (official Docker repository), **not** via `snap`.
> The snap version runs a separate daemon and causes conflict issues.

### Install Docker (apt method)

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
newgrp docker        # apply group without logout
docker version       # verify
```

---

## First-Time Deployment

### 1. Configure SSH access to GitHub (recommended)

```bash
# Generate a deploy key (no passphrase for unattended pulls)
ssh-keygen -t ed25519 -C "pamp-vm-deploy" -f ~/.ssh/id_ed25519 -N ""

# Display the public key — add this to GitHub repo Settings → Deploy Keys
cat ~/.ssh/id_ed25519.pub

# Test the connection
ssh -T git@github.com
```

### 2. Clone the repository

```bash
git clone git@github.com:pramodbade/PAMP.git /opt/pamp/PAMP
cd /opt/pamp/PAMP
```

### 3. Configure environment

```bash
cp .env.example .env
nano .env          # or: vim .env
```

Fill in every value:

```bash
POSTGRES_DB=pamp_db
POSTGRES_USER=pamp_user
POSTGRES_PASSWORD=<strong-random-password>   # avoid @ character

# Generate: openssl rand -hex 32
SECRET_KEY=<64-char-hex-string>

ACCESS_TOKEN_EXPIRE_MINUTES=480

# Your VM's public IP or domain
NEXT_PUBLIC_API_URL=http://<VM_IP_OR_DOMAIN>/api
```

### 4. Run the deployment script

```bash
bash deploy.sh
```

This will:
- Validate that `.env` has been configured
- Build the backend and frontend Docker images
- Start all 4 containers (db → backend → frontend → nginx)
- Wait for health checks to pass
- Print the access URL and status

### 5. Verify

```bash
docker compose ps          # all 4 containers should be Up
curl http://localhost/api/health   # should return {"status":"ok"}
```

Open `http://<VM_IP>` in a browser and log in with `admin / Change1234!`.

**Change the admin password immediately.**

---

## Updating After a Code Change

```bash
cd /opt/pamp/PAMP
git pull

# Rebuild and redeploy all services (preserves DB data)
bash update.sh

# Or target a single service
bash update.sh backend
bash update.sh frontend
```

The update script performs a zero-downtime restart: it replaces backend and
frontend containers one at a time without touching the database or nginx.

---

## Firewall / Network Security Group

Only port 80 needs to be open inbound from the internet.

| Port | Protocol | Direction | Purpose |
|------|----------|-----------|---------|
| 22 | TCP | Inbound | SSH admin access |
| 80 | TCP | Inbound | PAMP web application |
| All | Any | Outbound | Docker pull, git, updates |

All other inter-service communication (8000, 5432, 3000) stays inside the
Docker `pamp_net` bridge network and is never exposed publicly.

---

## Adding HTTPS (Let's Encrypt)

For internet-facing deployments, add TLS:

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate (replace with your domain)
sudo certbot --nginx -d pamp.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

Then update `NEXT_PUBLIC_API_URL` in `.env` to `https://...` and rebuild the frontend:

```bash
bash update.sh frontend
```

---

## Database Backup and Restore

### Backup

```bash
docker exec pamp_db pg_dump -U pamp_user pamp_db > backup_$(date +%Y%m%d).sql
```

### Restore (new VM)

```bash
# After deploy.sh has run (db container is up)
cat backup_YYYYMMDD.sql | docker exec -i pamp_db psql -U pamp_user -d pamp_db
```

---

## Useful Operations

### View logs

```bash
docker compose logs -f               # all services
docker compose logs -f backend       # backend only
docker compose logs -f nginx         # nginx access log
```

### Restart a container

```bash
docker compose restart backend
docker compose restart nginx
```

### Connect to the database

```bash
docker exec -it pamp_db psql -U pamp_user -d pamp_db
```

### List users

```sql
SELECT username, email, role, is_active FROM users;
```

### Reset a user password

```bash
# Generate hash inside the backend container
docker exec pamp_backend python3 -c "
from passlib.context import CryptContext
ctx = CryptContext(schemes=['bcrypt'], deprecated='auto')
print(ctx.hash('NewPassword123'))
"

# Apply in DB
docker exec pamp_db psql -U pamp_user -d pamp_db \
  -c "UPDATE users SET password_hash = '<hash>' WHERE username = 'admin';"
```

---

## Troubleshooting

### Backend cannot connect to DB

Symptom: `could not translate host name` or `password authentication failed`

Check:
1. `POSTGRES_PASSWORD` in `.env` must not contain `@` (it breaks the connection URL)
2. The backend's `DATABASE_URL` env var: `docker exec pamp_backend env | grep DATABASE`
3. DB container is healthy: `docker compose ps`

### Login fails with "Invalid credentials"

The password hash in the database must match the password being used.
See "Reset a user password" above.

### Frontend shows wrong API URL (login sends requests to old IP)

`NEXT_PUBLIC_API_URL` is baked into the Next.js bundle at **build time**.
If the VM IP changes, you must update `.env` and rebuild the frontend:

```bash
docker compose build frontend
docker compose up -d frontend
```

### Container won't start

```bash
docker compose logs <service>    # read the error
docker compose down              # stop everything
docker compose up -d             # restart clean
```

---

## Environment File Reference

| Variable | Example | Notes |
|----------|---------|-------|
| `POSTGRES_DB` | `pamp_db` | Database name |
| `POSTGRES_USER` | `pamp_user` | DB role name |
| `POSTGRES_PASSWORD` | `Str0ngPass99` | No `@` character |
| `SECRET_KEY` | *(64 hex chars)* | `openssl rand -hex 32` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `480` | 8 hours |
| `NEXT_PUBLIC_API_URL` | `http://1.2.3.4/api` | Browser-visible API URL |
