# PAMP — Engineering Decisions Log

**Purpose:** Record architecture decisions, technology choices, design changes, and schema updates to prevent repeated reasoning in future sessions.

---

## Decision Log

### DEC-001 — Backend Framework: FastAPI

**Date:** 2026-03-04
**Status:** Accepted
**Context:** Design document lists FastAPI as primary choice.
**Decision:** Use Python FastAPI with SQLAlchemy ORM and Alembic for migrations.
**Rationale:**
- Async-first, high performance
- Auto-generated OpenAPI/Swagger docs
- Pydantic models for request/response validation
- Strong typing throughout
**Consequences:** Requires Python 3.10+ runtime.

---

### DEC-002 — Frontend Framework: Next.js

**Date:** 2026-03-04
**Status:** Accepted
**Context:** Design document lists React/Next.js.
**Decision:** Use Next.js (React) with Tailwind CSS.
**Rationale:**
- File-based routing
- SSR/SSG capabilities for future
- Large ecosystem
- Tailwind for rapid styling without CSS bloat
**Consequences:** Node.js required for frontend build.

---

### DEC-003 — Authentication: JWT (MVP) → Azure AD SSO (Future)

**Date:** 2026-03-04
**Status:** Accepted
**Context:** Design requires internal login for MVP with SSO as future goal.
**Decision:** Implement JWT (HS256) authentication for MVP using python-jose. Design auth layer to be swappable for Azure AD OAuth2 in Phase 3.
**Rationale:** Simple, stateless, no external dependencies for MVP.
**Consequences:** Secret key must be stored securely in environment variables.

---

### DEC-004 — Database: PostgreSQL

**Date:** 2026-03-04
**Status:** Accepted
**Context:** Specified in design document.
**Decision:** PostgreSQL 15+ as primary database.
**Rationale:** Robust relational model, JSONB support, strong indexing, widely hosted on Azure.
**Consequences:** Requires PostgreSQL service in deployment environment.

---

### DEC-005 — Schema: assessment_summary as separate table

**Date:** 2026-03-04
**Status:** Accepted
**Context:** Assessment Summary is the final step in the lifecycle.
**Decision:** Store summary in a separate `assessment_summary` table (1:1 with assessments) rather than as columns on the assessments table.
**Rationale:** Keeps assessments table clean; summary is only created at end of lifecycle.

---

### DEC-006 — Checklist auto-load on assessment creation

**Date:** 2026-03-04
**Status:** Accepted
**Context:** Each assessment needs all mandatory checklist items pre-loaded.
**Decision:** When a new assessment is created, automatically insert rows into `checklist_execution` for all items in `checklist_template` with status = 'Pending'.
**Rationale:** Ensures no mandatory check is missed; reduces manual setup per assessment.

---

### DEC-007 — Validation enforcement server-side only

**Date:** 2026-03-04
**Status:** Accepted
**Context:** Assessment cannot be completed unless all mandatory checks done, findings verified, blockers documented.
**Decision:** Enforce completion rules in backend validation service. Frontend shows warnings but does not block as primary control.
**Rationale:** Security controls must be server-side to prevent bypass.

---

### DEC-008 — RBAC model: three roles for MVP

**Date:** 2026-03-04
**Status:** Accepted
**Roles defined:**
- `viewer`: read-only access to all data
- `pentester`: create/update own assessments and all sub-entities
- `lead_pentester`: all pentester permissions + read all assessments + can change assessment status

---

### DEC-009 — Project root structure

**Date:** 2026-03-04
**Status:** Accepted
**Structure:**
```
pamp-platform/
├── docs/         — Engineering documentation
├── backend/      — FastAPI application
├── frontend/     — Next.js application
├── database/     — SQL schema + seed data
└── README.md
```

---

### DEC-010 — Dashboard API: single router for all metrics

**Date:** 2026-03-04
**Status:** Accepted
**Decision:** All Phase 2 analytics endpoints live in `api/dashboard.py` under `/dashboard` prefix.
**Routes:** `/dashboard/metrics`, `/coverage`, `/heatmap`, `/search`, `/products/{id}/timeline`
**Rationale:** Keeps analytics separate from CRUD modules; no new DB tables needed (computes from existing data).

---

### DEC-011 — Heatmap color coding by endpoint coverage %

**Date:** 2026-03-04
**Status:** Accepted
**Decision:** Heatmap cells colored: Active=brand-blue, Completed ≥80%=green, 50–79%=blue, <50%=amber, On Hold=orange.
**Rationale:** Provides immediate visual signal of coverage quality per product.

---

### DEC-012 — Global search: products and findings only (Phase 2)

**Date:** 2026-03-04
**Status:** Accepted
**Decision:** Search covers products (name, team, description) and findings (title, description). Assessments excluded since they have no free-text searchable fields beyond environment.
**Rationale:** Reduces noise; assessments discoverable via product timeline.

---

## Schema Change Log

| Date | Table | Change | Reason |
|------|-------|--------|--------|
| 2026-03-04 | assessment_summary | New table created (1:1 with assessments) | DEC-005 |
| 2026-03-04 | users | Added for authentication | Required for auth module |
