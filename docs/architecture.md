# PAMP — Architecture Document

## Overview

PAMP follows a standard three-tier web application architecture.

```
┌─────────────────────────────────────────┐
│           Users (Browser)               │
│  Pentester / Lead Pentester / Viewer    │
└────────────────┬────────────────────────┘
                 │ HTTPS
┌────────────────▼────────────────────────┐
│         Frontend (Next.js)              │
│  - React components                     │
│  - Pages: Login, Products, Assessments  │
│    Scope, Endpoints, Checklist,         │
│    Findings, Blockers, Summary          │
│  - Axios/fetch for API calls            │
└────────────────┬────────────────────────┘
                 │ REST API (JSON)
┌────────────────▼────────────────────────┐
│         Backend (FastAPI)               │
│  - JWT authentication middleware        │
│  - RBAC enforcement                     │
│  - Route handlers per module            │
│  - Pydantic validation                  │
│  - SQLAlchemy ORM                       │
└────────────────┬────────────────────────┘
                 │ SQL
┌────────────────▼────────────────────────┐
│         PostgreSQL Database             │
│  - 10 core tables                       │
│  - Relational integrity                 │
│  - Audit timestamps                     │
└─────────────────────────────────────────┘
```

## Backend API Structure

```
backend/
├── main.py                  # FastAPI app entry point
├── api/
│   ├── auth.py              # Login, token endpoints
│   ├── products.py          # Product CRUD
│   ├── assessments.py       # Assessment CRUD
│   ├── scope.py             # Scope management
│   ├── endpoints.py         # Endpoint inventory
│   ├── checklist.py         # Checklist template + execution
│   ├── findings.py          # Previous findings + verification
│   ├── blockers.py          # Blocker management
│   ├── custom_tests.py      # Custom test scenarios
│   └── summary.py           # Assessment summary
├── models/
│   ├── user.py
│   ├── product.py
│   ├── assessment.py
│   ├── scope.py
│   ├── endpoint.py
│   ├── checklist.py
│   ├── finding.py
│   ├── blocker.py
│   ├── custom_test.py
│   └── summary.py
├── services/
│   ├── auth_service.py      # JWT generation/validation
│   ├── assessment_service.py # Business logic
│   └── validation_service.py # Completion rules
├── migrations/
│   └── (Alembic migration files)
└── database.py              # DB connection / session
```

## Frontend Structure

```
frontend/
├── pages/
│   ├── index.js             # Redirect to login or dashboard
│   ├── login.js
│   ├── products/
│   │   ├── index.js         # Product list
│   │   └── [id].js          # Product detail
│   ├── assessments/
│   │   ├── index.js         # Assessment list
│   │   ├── new.js           # Create assessment
│   │   └── [id]/
│   │       ├── index.js     # Assessment overview
│   │       ├── scope.js
│   │       ├── endpoints.js
│   │       ├── checklist.js
│   │       ├── findings.js
│   │       ├── blockers.js
│   │       ├── custom-tests.js
│   │       └── summary.js
├── components/
│   ├── Layout.js
│   ├── Navbar.js
│   ├── ChecklistTable.js
│   ├── EndpointTable.js
│   ├── FindingsTable.js
│   └── BlockerTimeline.js
├── services/
│   └── api.js               # Axios instance + API calls
└── styles/
    └── globals.css
```

## Security Design

- All API routes require JWT token (except `/auth/login`)
- RBAC: Viewer = read-only; Pentester = read/write own data; Lead Pentester = read all + manage
- Passwords hashed with bcrypt
- HTTPS enforced in production
- Input validated server-side with Pydantic

## Database Relationships

```
products (1) ──────────── (N) assessments
products (1) ──────────── (N) previous_findings
assessments (1) ────────── (N) scope
assessments (1) ────────── (N) endpoints
assessments (1) ────────── (N) checklist_execution ── (N:1) checklist_template
assessments (1) ────────── (N) finding_verification ── (N:1) previous_findings
assessments (1) ────────── (N) blockers
assessments (1) ────────── (N) custom_tests
assessments (1) ────────── (1) assessment_summary
```
