# PAMP — System Summary

**Source:** PAMP_System_Design_and_Development_Guide_v1.md
**Extracted:** 2026-03-04

---

## 1. Purpose

The Pentest Assessment Management Platform (PAMP) is an internal web application to manage and track penetration testing activities across multiple products and environments.

Core goals:
- Ensure mandatory pentest checks are not missed
- Track pentest scope and endpoints
- Preserve historical pentest knowledge
- Document blockers and vulnerabilities
- Support incident response teams with past security context

---

## 2. System Architecture

```
Users (Pentesters)
       |
       v
Frontend Application (React / Next.js)
       |
       v
Backend API (Python FastAPI)
       |
       v
PostgreSQL Database
```

Optional integrations:
- Authentication: Azure AD / SSO (future)
- File Storage: OneDrive / SharePoint (future)

---

## 3. User Roles

| Role | Responsibilities |
|------|-----------------|
| Pentester | Create assessments, define scope, execute checklist, verify findings, document blockers, submit summaries |
| Lead Pentester | Monitor progress, ensure checklist completion, review blockers and summaries |
| Viewer | Read-only access (future) |
| Security Manager | Security posture monitoring, coverage metrics, risk trends (future) |

---

## 4. Core Modules

### 4.1 Authentication Module
- Internal login (MVP)
- Azure AD SSO (future)
- Role-based access control (Pentester, Lead Pentester, Viewer)

### 4.2 Product Management
Fields: `product_name`, `owner_team`, `risk_level`, `tech_stack`, `description`
Each product can have multiple pentest assessments over time.

### 4.3 Assessment Management
Fields: `product_id`, `environment`, `start_date`, `end_date`, `estimated_effort_days`, `lead_pentester`, `status`
Status values: Active, On Hold, Completed

### 4.4 Scope Management
Asset types: Web Applications, APIs, Android Apps, iOS Apps, Network IPs, Cloud Infrastructure
Fields: `asset_type`, `asset_name`, `url_or_ip`, `notes`

### 4.5 Endpoint Inventory
Fields: `path`, `method`, `authentication_required`, `role_required`, `tested_status`, `notes`
Purpose: Prevent API coverage gaps, track tested endpoints, assist incident investigation.

### 4.6 Checklist Execution
Categories: Authentication, Session Management, Access Control, Input Validation, File Upload Security, Business Logic Testing, API Security, Cryptography, Security Headers, Rate Limiting
Each item: `test_name`, `category`, `description`, `mandatory`
Execution fields: `status` (Pending / Completed / Not Applicable / Issue Found), `tester`, `notes`

### 4.7 Previous Findings
Fields: `title`, `description`, `severity`, `first_found_date`, `status`
Verification statuses: Reproduced, Fixed, Not Applicable
Reasons: Patched, Endpoint removed, Feature deprecated

### 4.8 Blocker Management
Fields: `start_date`, `end_date`, `reason`, `expected_resolution`
Creates a timeline of assessment interruptions.

### 4.9 Custom Test Scenarios
Fields: `test_name`, `area`, `description`, `status`, `notes`
Custom tests may later become part of the standard checklist.

### 4.10 Assessment Summary
Fields: `end_date`, `total_findings`, `reproduced_findings`, `summary_notes`, `report_link`
Final step before assessment submission.

---

## 5. Database Schema

| Table | Key Fields |
|-------|-----------|
| products | id, product_name, owner_team, risk_level, tech_stack, description, created_at |
| assessments | id, product_id, environment, start_date, end_date, estimated_effort_days, lead_pentester, status, created_at |
| scope | id, assessment_id, asset_type, asset_name, url_or_ip, notes |
| endpoints | id, assessment_id, asset_id, path, method, authentication_required, role_required, tested_status, notes |
| checklist_template | id, category, test_name, description, mandatory |
| checklist_execution | id, assessment_id, check_id, status, tester, notes, updated_at |
| previous_findings | id, product_id, title, description, severity, first_found_date, status |
| finding_verification | id, assessment_id, finding_id, status, reason |
| blockers | id, assessment_id, start_date, end_date, reason, expected_resolution |
| custom_tests | id, assessment_id, test_name, description, status, notes |

---

## 6. System Workflow (Pentest Lifecycle)

```
Pentester Login
       ↓
Create Assessment
       ↓
Define Scope
       ↓
Add Endpoint Inventory
       ↓
Load Mandatory Checklist
       ↓
Execute Tests
       ↓
Review Previous Findings
       ↓
Add Custom Tests
       ↓
Record Blockers (if any)
       ↓
Complete Checklist
       ↓
Enter Assessment Summary
       ↓
Submit Assessment
       ↓
Store Historical Record
```

---

## 7. Validation Rules

Assessment cannot be completed unless:
1. All mandatory checklist items are marked
2. Previous findings are verified
3. Blocker reasons are documented

---

## 8. UI Pages

| Page | Purpose |
|------|---------|
| Login | User authentication |
| Products | CRUD for company products |
| Assessments | List/create pentest cycles |
| Scope | Add/manage in-scope assets |
| Endpoints | Track API endpoints |
| Checklist | Main testing interface |
| Previous Findings | Review past vulnerabilities |
| Blockers | Record interruptions |
| Assessment Summary | Final submission step |

---

## 9. Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React / Next.js |
| Backend | Python FastAPI |
| Database | PostgreSQL |
| Auth (MVP) | Internal JWT |
| Auth (Future) | Azure AD SSO |
| Deployment | Azure / Internal cloud |
| File Storage | OneDrive / SharePoint (future) |

---

## 10. Development Stages

| Stage | Name | Focus |
|-------|------|-------|
| 1 | Foundation (MVP) | All core modules |
| 2 | Coverage Intelligence | Dashboards, metrics, heatmap, search |
| 3 | Advanced Security Intelligence | Knowledge base, auto-discovery, incident response integration |
