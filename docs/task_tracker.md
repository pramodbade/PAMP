# PAMP — Task Tracker

**Last Updated:** 2026-03-04 (Phase 2 complete)

---

## Status Legend

| Status | Meaning |
|--------|---------|
| TODO | Not started |
| IN_PROGRESS | Currently being worked on |
| BLOCKED | Waiting on dependency or decision |
| DONE | Completed and verified |

---

## Phase 1 — MVP Foundation

### P1-000 — Project Scaffolding

| Task ID | Module | Description | Status | Dependencies | Notes |
|---------|--------|-------------|--------|--------------|-------|
| P1-001 | Setup | Initialise backend (FastAPI + SQLAlchemy + Alembic) | DONE | None | config.py, database.py, requirements.txt created |
| P1-002 | Setup | Initialise frontend (Next.js + Tailwind CSS) | DONE | None | package.json, tailwind, postcss, globals.css created |
| P1-003 | Setup | Set up PostgreSQL database | TODO | None | Run schema.sql manually |
| P1-004 | Setup | Create full database schema (schema.sql) | DONE | P1-003 | database/schema.sql created |
| P1-005 | Setup | Configure environment variables (.env.example) | DONE | P1-001 | backend/.env.example created |

### P1-010 — Authentication Module

| Task ID | Module | Description | Status | Dependencies | Notes |
|---------|--------|-------------|--------|--------------|-------|
| P1-010 | Auth | Create users table + seed admin user | DONE | P1-004 | seed_data.sql has default users |
| P1-011 | Auth | POST /auth/login endpoint → JWT token | DONE | P1-010 | api/auth.py |
| P1-012 | Auth | JWT middleware / auth dependency | DONE | P1-011 | services/auth_service.py |
| P1-013 | Auth | RBAC roles: Pentester, Lead Pentester, Viewer | DONE | P1-012 | require_role(), require_pentester, require_lead |
| P1-014 | Auth | Login page (frontend) | DONE | P1-011 | pages/login.js |
| P1-015 | Auth | Token storage + protected routes (frontend) | DONE | P1-014 | services/auth.js, Cookies |

### P1-020 — Product Management

| Task ID | Module | Description | Status | Dependencies | Notes |
|---------|--------|-------------|--------|--------------|-------|
| P1-020 | Products | Products table migration | DONE | P1-004 | models/product.py |
| P1-021 | Products | CRUD endpoints: GET/POST/PUT/DELETE /products | DONE | P1-012 | api/products.py |
| P1-022 | Products | Products list page (frontend) | DONE | P1-021 | pages/products/index.js |
| P1-023 | Products | Create/Edit product form (frontend) | DONE | P1-021 | modal in products/index.js |
| P1-024 | Products | Product detail view (frontend) | DONE | P1-021 | pages/products/[id].js |

### P1-030 — Assessment Management

| Task ID | Module | Description | Status | Dependencies | Notes |
|---------|--------|-------------|--------|--------------|-------|
| P1-030 | Assessments | Assessments table migration | DONE | P1-004 | models/assessment.py |
| P1-031 | Assessments | Assessment CRUD endpoints | DONE | P1-012, P1-030 | api/assessments.py |
| P1-032 | Assessments | Assessments list page (frontend) | DONE | P1-031 | pages/assessments/index.js |
| P1-033 | Assessments | Create assessment form (frontend) | DONE | P1-031 | modal in assessments/index.js |
| P1-034 | Assessments | Assessment detail/overview page (frontend) | DONE | P1-031 | pages/assessments/[id]/index.js |

### P1-040 — Scope Management

| Task ID | Module | Description | Status | Dependencies | Notes |
|---------|--------|-------------|--------|--------------|-------|
| P1-040 | Scope | Scope table migration | DONE | P1-004 | models/scope.py |
| P1-041 | Scope | Scope CRUD endpoints | DONE | P1-031, P1-040 | api/scope.py |
| P1-042 | Scope | Scope management page (frontend) | DONE | P1-041 | pages/assessments/[id]/scope.js |

### P1-050 — Endpoint Inventory

| Task ID | Module | Description | Status | Dependencies | Notes |
|---------|--------|-------------|--------|--------------|-------|
| P1-050 | Endpoints | Endpoints table migration | DONE | P1-004 | models/endpoint.py |
| P1-051 | Endpoints | Endpoint CRUD endpoints | DONE | P1-031, P1-050 | api/endpoints.py |
| P1-052 | Endpoints | Endpoint inventory page with table (frontend) | DONE | P1-051 | pages/assessments/[id]/endpoints.js |
| P1-053 | Endpoints | Toggle tested status | DONE | P1-051 | toggleTested() in endpoints.js |

### P1-060 — Checklist Execution

| Task ID | Module | Description | Status | Dependencies | Notes |
|---------|--------|-------------|--------|--------------|-------|
| P1-060 | Checklist | checklist_template + checklist_execution migrations | DONE | P1-004 | models/checklist.py |
| P1-061 | Checklist | Seed checklist template (~30+ items across 10 categories) | DONE | P1-060 | 37 items in seed_data.sql |
| P1-062 | Checklist | Auto-load checklist when assessment created | DONE | P1-031, P1-060 | _load_checklist() in api/assessments.py |
| P1-063 | Checklist | Checklist execution CRUD endpoints | DONE | P1-062 | api/checklist.py |
| P1-064 | Checklist | Checklist page grouped by category (frontend) | DONE | P1-063 | pages/assessments/[id]/checklist.js |
| P1-065 | Checklist | Update status + notes per item | DONE | P1-063 | inline edit in checklist.js |

### P1-070 — Previous Findings

| Task ID | Module | Description | Status | Dependencies | Notes |
|---------|--------|-------------|--------|--------------|-------|
| P1-070 | Findings | previous_findings + finding_verification migrations | DONE | P1-004 | models/finding.py |
| P1-071 | Findings | Previous findings CRUD endpoints | DONE | P1-012, P1-070 | api/findings.py |
| P1-072 | Findings | Finding verification endpoints per assessment | DONE | P1-031, P1-070 | api/findings.py verifications routes |
| P1-073 | Findings | Previous findings page (frontend) | DONE | P1-071 | pages/assessments/[id]/findings.js |
| P1-074 | Findings | Verification form per finding (frontend) | DONE | P1-072 | modal verify in findings.js |

### P1-080 — Blocker Management

| Task ID | Module | Description | Status | Dependencies | Notes |
|---------|--------|-------------|--------|--------------|-------|
| P1-080 | Blockers | Blockers table migration | DONE | P1-004 | models/blocker.py |
| P1-081 | Blockers | Blocker CRUD endpoints | DONE | P1-031, P1-080 | api/blockers.py |
| P1-082 | Blockers | Blockers timeline page (frontend) | DONE | P1-081 | pages/assessments/[id]/blockers.js |

### P1-090 — Custom Test Scenarios

| Task ID | Module | Description | Status | Dependencies | Notes |
|---------|--------|-------------|--------|--------------|-------|
| P1-090 | Custom Tests | custom_tests table migration | DONE | P1-004 | models/custom_test.py |
| P1-091 | Custom Tests | Custom tests CRUD endpoints | DONE | P1-031, P1-090 | api/custom_tests.py |
| P1-092 | Custom Tests | Custom tests page (frontend) | DONE | P1-091 | pages/assessments/[id]/custom-tests.js |

### P1-100 — Assessment Summary

| Task ID | Module | Description | Status | Dependencies | Notes |
|---------|--------|-------------|--------|--------------|-------|
| P1-100 | Summary | assessment_summary table migration | DONE | P1-004 | models/summary.py |
| P1-101 | Summary | Summary create/update/get endpoints | DONE | P1-031, P1-100 | api/summary.py |
| P1-102 | Summary | Validation: block completion if mandatory checks incomplete | DONE | P1-063, P1-072 | services/validation_service.py |
| P1-103 | Summary | Assessment summary page (frontend) | DONE | P1-101 | pages/assessments/[id]/summary.js |
| P1-104 | Summary | Submit assessment + set status=Completed | DONE | P1-102, P1-103 | POST /summary sets status=Completed |

---

## Phase 2 — Coverage Intelligence

| Task ID | Module | Description | Status | Dependencies | Notes |
|---------|--------|-------------|--------|--------------|-------|
| P2-001 | Dashboard | Endpoint coverage metrics API | DONE | Phase 1 complete | api/dashboard.py: /dashboard/metrics, /coverage, /heatmap, /search, /products/{id}/timeline |
| P2-002 | Dashboard | Coverage dashboard page | DONE | P2-001 | pages/dashboard.js — stats cards + coverage table |
| P2-003 | Heatmap | Pentest heatmap by product | DONE | P2-001 | Embedded in dashboard.js — color-coded cells by coverage % |
| P2-004 | Metrics | Checklist completion % per assessment | DONE | Phase 1 | Included in coverage table and timeline |
| P2-005 | Search | Global search across platform | DONE | Phase 1 | pages/search.js — debounced search, products + findings |
| P2-006 | Timeline | Assessment history timeline per product | DONE | Phase 1 | Added to products/[id].js — vertical timeline with coverage bars |

---

## Phase 3 — Advanced Security Intelligence

| Task ID | Module | Description | Status | Dependencies | Notes |
|---------|--------|-------------|--------|--------------|-------|
| P3-001 | Knowledge Base | Security knowledge base module | TODO | Phase 2 | |
| P3-002 | Discovery | Automated API discovery integration | TODO | Phase 2 | |
| P3-003 | Mapping | Attack surface mapping | TODO | P3-002 | |
| P3-004 | IR | Incident response quick-access view | TODO | Phase 2 | |
| P3-005 | Reporting | Automated report generation | TODO | Phase 2 | |
| P3-006 | Auth | Azure AD SSO integration | TODO | Phase 1 | |
| P3-007 | Storage | Evidence/file uploads (OneDrive) | TODO | Phase 2 | |

---

## Progress Summary

| Phase | Total Tasks | TODO | IN_PROGRESS | BLOCKED | DONE |
|-------|------------|------|-------------|---------|------|
| Phase 1 | 43 | 0 | 0 | 0 | 43 |
| Phase 2 | 6 | 0 | 0 | 0 | 6 |
| Phase 3 | 7 | 7 | 0 | 0 | 0 |
| **Total** | **56** | **7** | **0** | **0** | **49** |
