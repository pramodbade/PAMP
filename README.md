# PAMP — Pentest Assessment Management Platform

Internal web application for managing and tracking penetration testing activities across company products.

## Architecture

```
Internet
    │
    ▼ :80
┌─────────┐
│  Nginx  │  ← Reverse proxy (nginx:1.27-alpine)
└────┬────┘
     │ /api/*          │ /*
     ▼                 ▼
┌──────────┐     ┌──────────┐
│ Backend  │     │ Frontend │
│ FastAPI  │     │ Next.js  │
│ :8000    │     │ :3000    │
└────┬─────┘     └──────────┘
     │
     ▼
┌──────────┐
│ Postgres │  ← postgres:16-alpine, persistent volume
│ :5432    │
└──────────┘
```

| Container | Image | Role |
|-----------|-------|------|
| `pamp_nginx` | nginx:1.27-alpine | Public reverse proxy on port 80 |
| `pamp_frontend` | pamp-frontend (Next.js 14) | React UI |
| `pamp_backend` | pamp-backend (FastAPI) | REST API |
| `pamp_db` | postgres:16-alpine | Persistent database |

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 + React 18 + Tailwind CSS |
| Backend | Python 3.12 + FastAPI |
| ORM | SQLAlchemy 2.0 |
| Database | PostgreSQL 16 |
| Auth | JWT (HS256) + RBAC |
| Proxy | Nginx 1.27 |
| Deployment | Docker Compose |

## Project Structure

```
PAMP/
├── .env.example           — Environment template (copy to .env before deploying)
├── docker-compose.yml     — Service definitions
├── deploy.sh              — First-time deployment script
├── update.sh              — Update/redeploy script
│
├── backend/               — Python FastAPI application
│   ├── api/               — Route handlers (auth, products, assessments, ...)
│   ├── models/            — SQLAlchemy ORM models
│   ├── schemas/           — Pydantic validation schemas
│   ├── services/          — Business logic (auth, validation)
│   ├── config.py          — Settings via pydantic-settings
│   ├── database.py        — DB engine and session factory
│   ├── main.py            — App entry point
│   ├── requirements.txt   — Python dependencies
│   └── Dockerfile
│
├── frontend/              — Next.js React application
│   ├── pages/             — Next.js routes
│   ├── components/        — Reusable React components
│   ├── services/          — Axios API client + auth helpers
│   ├── styles/            — Global CSS + Tailwind
│   ├── package.json
│   └── Dockerfile
│
├── database/
│   ├── schema.sql         — Full PostgreSQL schema (auto-applied on first start)
│   ├── seed_data.sql      — Default admin user + checklist template
│   └── add_users.sql      — Team user setup
│
├── nginx/
│   └── nginx.conf         — Reverse proxy + routing rules
│
└── docs/
    ├── architecture.md
    ├── development_plan.md
    ├── decisions_log.md
    ├── system_summary.md
    └── task_tracker.md
```

## Quick Start (Docker)

### Prerequisites
- Docker Engine 24+
- Docker Compose v2
- Git

### 1. Clone and configure

```bash
git clone git@github.com:pramodbade/PAMP.git
cd PAMP
cp .env.example .env
```

Edit `.env` with real values:
```
POSTGRES_DB=pamp_db
POSTGRES_USER=pamp_user
POSTGRES_PASSWORD=<strong-password>
SECRET_KEY=<output of: openssl rand -hex 32>
ACCESS_TOKEN_EXPIRE_MINUTES=480
NEXT_PUBLIC_API_URL=http://<YOUR_VM_IP>/api
```

### 2. Deploy

```bash
bash deploy.sh
```

### 3. Access

Open `http://<YOUR_VM_IP>` in a browser.

Default credentials: `admin / Change1234!`
**Change the admin password immediately after first login.**

## Updating After a Code Change

```bash
# Rebuild and redeploy all services (zero-downtime)
bash update.sh

# Or rebuild a single service only
bash update.sh backend
bash update.sh frontend
```

## Core Modules

| Module | Description |
|--------|-------------|
| Authentication | JWT login, RBAC (admin / lead_pentester / pentester) |
| Product Management | Products under assessment scope |
| Assessment Management | Assessment lifecycle (planning → complete) |
| Scope Management | Assets and targets in scope |
| Endpoint Inventory | API/URL endpoint tracking |
| Checklist Execution | Standard pentest checks with pass/fail/N-A |
| Findings | Vulnerability findings with severity and status |
| Blockers | Impediments preventing test progress |
| Custom Tests | Ad-hoc test scenarios |
| Summary | Assessment summary and reporting |
| Dashboard | Cross-assessment metrics and status overview |

## User Roles

| Role | Permissions |
|------|-------------|
| `admin` | Full access — manage users, all data |
| `lead_pentester` | Manage assessments, review findings |
| `pentester` | Execute assessments, log findings |

## Environment Variables

Copy `.env.example` to `.env` — never commit `.env`.

| Variable | Description |
|----------|-------------|
| `POSTGRES_DB` | Database name |
| `POSTGRES_USER` | Database user |
| `POSTGRES_PASSWORD` | Database password (no `@` character) |
| `SECRET_KEY` | JWT signing key — `openssl rand -hex 32` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Session lifetime (default: 480 = 8h) |
| `NEXT_PUBLIC_API_URL` | Full URL the browser uses to reach `/api` |

> **Note on POSTGRES_PASSWORD**: avoid the `@` character — it breaks the
> PostgreSQL connection URL constructed by Docker Compose.

## Documentation

- [Architecture](docs/architecture.md)
- [Development Plan](docs/development_plan.md)
- [Decisions Log](docs/decisions_log.md)
- [System Summary](docs/system_summary.md)
- [Deployment Guide](DEPLOYMENT.md)

## Security Notes

- `.env` is git-ignored — never commit it.
- The `SECRET_KEY` must be generated fresh per environment.
- All inter-service communication stays inside the `pamp_net` Docker network.
- Only port 80 is exposed publicly (nginx).
- HTTPS/TLS should be added via Let's Encrypt for production internet exposure.
