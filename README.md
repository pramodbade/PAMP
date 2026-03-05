# PAMP — Pentest Assessment Management Platform

Internal web application for managing and tracking penetration testing activities across all company products.

## Project Structure

```
pamp-platform/
├── docs/
│   ├── system_summary.md      — Full system overview extracted from design doc
│   ├── architecture.md        — Technical architecture and component layout
│   ├── development_plan.md    — Phased development plan with tasks and deliverables
│   ├── task_tracker.md        — Live task progress tracker
│   └── decisions_log.md       — Engineering decisions and rationale
│
├── backend/                   — Python FastAPI application
│   ├── api/                   — Route handlers per module
│   ├── models/                — SQLAlchemy ORM models
│   ├── services/              — Business logic layer
│   ├── migrations/            — Alembic migration files
│   └── main.py                — FastAPI app entry point
│
├── frontend/                  — Next.js application
│   ├── components/            — Reusable React components
│   ├── pages/                 — Next.js pages (routes)
│   ├── services/              — API client (Axios)
│   └── styles/                — Global CSS
│
├── database/
│   ├── schema.sql             — Full PostgreSQL schema
│   └── seed_data.sql          — Default users and checklist template
│
└── README.md
```

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js (React) + Tailwind CSS |
| Backend | Python FastAPI |
| ORM | SQLAlchemy + Alembic |
| Database | PostgreSQL |
| Auth (MVP) | JWT (HS256) |
| Auth (Future) | Azure AD SSO |
| Deployment | Azure / Internal cloud |

## Development Phases

| Phase | Status | Focus |
|-------|--------|-------|
| Phase 1 — MVP Foundation | IN PROGRESS | All core modules |
| Phase 2 — Coverage Intelligence | TODO | Dashboards, metrics, heatmap |
| Phase 3 — Advanced Security Intelligence | TODO | Knowledge base, automation, IR |

## Core Modules

1. Authentication (JWT + RBAC)
2. Product Management
3. Assessment Management
4. Scope Management
5. Endpoint Inventory
6. Checklist Execution
7. Previous Findings
8. Blocker Management
9. Custom Test Scenarios
10. Assessment Summary

## Quick Start

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install fastapi uvicorn sqlalchemy alembic psycopg2-binary python-jose[cryptography] passlib[bcrypt] python-dotenv
uvicorn main:app --reload
```

### Database

```bash
# Create database
createdb pamp_db

# Apply schema
psql pamp_db < database/schema.sql

# Load seed data
psql pamp_db < database/seed_data.sql
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Documentation

- [System Summary](docs/system_summary.md)
- [Architecture](docs/architecture.md)
- [Development Plan](docs/development_plan.md)
- [Task Tracker](docs/task_tracker.md)
- [Decisions Log](docs/decisions_log.md)
