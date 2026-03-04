# PAMP — Development Plan

**Version:** 1.0
**Created:** 2026-03-04

---

## Phase 1 — MVP Foundation

**Goal:** Deliver a fully functional pentest management platform covering all core modules.

### 1.1 Project Setup

| Task | Description | Dependencies |
|------|-------------|--------------|
| P1-001 | Initialise backend (FastAPI + SQLAlchemy + Alembic) | None |
| P1-002 | Initialise frontend (Next.js + Tailwind CSS) | None |
| P1-003 | Set up PostgreSQL + create database | None |
| P1-004 | Create database schema (all tables) | P1-003 |
| P1-005 | Configure environment variables (.env) | P1-001, P1-002 |

### 1.2 Authentication Module

| Task | Description | Dependencies |
|------|-------------|--------------|
| P1-010 | Create users table + seed admin user | P1-004 |
| P1-011 | Implement login endpoint (POST /auth/login) → JWT | P1-010 |
| P1-012 | Implement JWT middleware / auth dependency | P1-011 |
| P1-013 | Implement RBAC (Pentester, Lead Pentester, Viewer) | P1-012 |
| P1-014 | Build login page (frontend) | P1-011 |
| P1-015 | Implement token storage + protected routes (frontend) | P1-014 |

**Deliverables:**
- Secure login with JWT
- Role-based route protection frontend + backend

### 1.3 Product Management Module

| Task | Description | Dependencies |
|------|-------------|--------------|
| P1-020 | Create products table migration | P1-004 |
| P1-021 | Implement CRUD endpoints (GET/POST/PUT/DELETE /products) | P1-012, P1-020 |
| P1-022 | Products list page (frontend) | P1-021 |
| P1-023 | Create/Edit product form (frontend) | P1-021 |
| P1-024 | Product detail view (frontend) | P1-021 |

**Deliverables:**
- Full product CRUD
- Risk level, tech stack, owner team fields

### 1.4 Assessment Management Module

| Task | Description | Dependencies |
|------|-------------|--------------|
| P1-030 | Create assessments table migration | P1-004 |
| P1-031 | Implement assessment CRUD endpoints | P1-012, P1-030 |
| P1-032 | Assessments list page (frontend) | P1-031 |
| P1-033 | Create assessment form (frontend) | P1-031 |
| P1-034 | Assessment detail/overview page (frontend) | P1-031 |

**Deliverables:**
- Assessment lifecycle: Active → On Hold → Completed
- Link assessments to products

### 1.5 Scope Management Module

| Task | Description | Dependencies |
|------|-------------|--------------|
| P1-040 | Create scope table migration | P1-004 |
| P1-041 | Scope CRUD endpoints (under assessment) | P1-031, P1-040 |
| P1-042 | Scope page (frontend) | P1-041 |

**Deliverables:**
- Add/remove in-scope assets per assessment

### 1.6 Endpoint Inventory Module

| Task | Description | Dependencies |
|------|-------------|--------------|
| P1-050 | Create endpoints table migration | P1-004 |
| P1-051 | Endpoint CRUD endpoints | P1-031, P1-050 |
| P1-052 | Endpoint inventory page with table (frontend) | P1-051 |
| P1-053 | Mark endpoint as tested (toggle) | P1-051 |

**Deliverables:**
- Track API endpoints with method, auth, role, tested status

### 1.7 Checklist Module

| Task | Description | Dependencies |
|------|-------------|--------------|
| P1-060 | Create checklist_template + checklist_execution migrations | P1-004 |
| P1-061 | Seed checklist template (10 categories, ~30+ items) | P1-060 |
| P1-062 | Auto-load checklist when assessment created | P1-031, P1-060 |
| P1-063 | Checklist execution CRUD endpoints | P1-062 |
| P1-064 | Checklist page (frontend) — grouped by category | P1-063 |
| P1-065 | Update checklist item status + notes | P1-063 |

**Deliverables:**
- Mandatory checklist auto-loaded per assessment
- Status: Pending / Completed / Not Applicable / Issue Found

### 1.8 Previous Findings Module

| Task | Description | Dependencies |
|------|-------------|--------------|
| P1-070 | Create previous_findings + finding_verification migrations | P1-004 |
| P1-071 | Previous findings CRUD endpoints | P1-012, P1-070 |
| P1-072 | Finding verification endpoints (per assessment) | P1-031, P1-070 |
| P1-073 | Previous findings page (frontend) | P1-071 |
| P1-074 | Verification form per finding (frontend) | P1-072 |

**Deliverables:**
- Store historical vulnerabilities per product
- Verify findings per assessment cycle

### 1.9 Blocker Management Module

| Task | Description | Dependencies |
|------|-------------|--------------|
| P1-080 | Create blockers table migration | P1-004 |
| P1-081 | Blocker CRUD endpoints | P1-031, P1-080 |
| P1-082 | Blockers page with timeline (frontend) | P1-081 |

**Deliverables:**
- Document assessment interruptions with start/end dates

### 1.10 Custom Test Scenarios Module

| Task | Description | Dependencies |
|------|-------------|--------------|
| P1-090 | Create custom_tests table migration | P1-004 |
| P1-091 | Custom tests CRUD endpoints | P1-031, P1-090 |
| P1-092 | Custom tests page (frontend) | P1-091 |

**Deliverables:**
- Add ad-hoc test scenarios per assessment

### 1.11 Assessment Summary Module

| Task | Description | Dependencies |
|------|-------------|--------------|
| P1-100 | Create assessment_summary table migration | P1-004 |
| P1-101 | Summary endpoints (create/update/get) | P1-031, P1-100 |
| P1-102 | Validation: block completion unless mandatory checks done | P1-063, P1-072 |
| P1-103 | Assessment summary page (frontend) | P1-101 |
| P1-104 | Submit assessment + set status=Completed | P1-102, P1-103 |

**Deliverables:**
- Final summary with findings count and report link
- Validation enforcement before completion

---

## Phase 2 — Coverage Intelligence

**Goal:** Add analytics, dashboards, and search capabilities.

| Task | Description | Dependencies |
|------|-------------|--------------|
| P2-001 | Endpoint coverage metrics API | Phase 1 complete |
| P2-002 | Coverage dashboard page | P2-001 |
| P2-003 | Pentest heatmap by product (color-coded) | P2-001 |
| P2-004 | Checklist completion % per assessment | Phase 1 |
| P2-005 | Global search (products, assessments, findings) | Phase 1 |
| P2-006 | Assessment history timeline per product | Phase 1 |

---

## Phase 3 — Advanced Security Intelligence

**Goal:** Integrate knowledge base, automated discovery, and incident response support.

| Task | Description | Dependencies |
|------|-------------|--------------|
| P3-001 | Security knowledge base module | Phase 2 |
| P3-002 | Automated API discovery integration | Phase 2 |
| P3-003 | Attack surface mapping | P3-002 |
| P3-004 | Incident response quick-access view | Phase 2 |
| P3-005 | Automated report generation | Phase 2 |
| P3-006 | Azure AD SSO integration | Phase 1 |
| P3-007 | Evidence/file uploads (OneDrive) | Phase 2 |

---

## Technology Decisions

| Concern | Choice | Rationale |
|---------|--------|-----------|
| Backend | Python FastAPI | Async, Pydantic validation, OpenAPI docs auto-generated |
| ORM | SQLAlchemy + Alembic | Industry standard, migration support |
| Frontend | Next.js (React) | SSR, routing, good DX |
| Styling | Tailwind CSS | Rapid UI development |
| Auth | JWT (HS256) | Simple, stateless for MVP |
| Database | PostgreSQL | Relational, robust, JSONB support for future |
| API Client | Axios | Interceptors for token injection |
