-- PAMP — PostgreSQL Database Schema
-- Version: 1.0
-- Created: 2026-03-04

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username    VARCHAR(100) UNIQUE NOT NULL,
    email       VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role        VARCHAR(50) NOT NULL CHECK (role IN ('viewer', 'pentester', 'lead_pentester', 'admin')),
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE products (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_name  VARCHAR(255) NOT NULL,
    owner_team    VARCHAR(255),
    business_unit VARCHAR(255),
    risk_level    VARCHAR(50) CHECK (risk_level IN ('Low', 'Medium', 'High', 'Critical')),
    tech_stack    TEXT,
    description   TEXT,
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- ASSESSMENTS
-- ============================================================
CREATE TABLE assessments (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id            UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    environment           VARCHAR(100) NOT NULL CHECK (environment IN ('Production', 'Staging', 'Development', 'QA')),
    start_date            DATE NOT NULL,
    end_date              DATE,
    estimated_effort_days INTEGER,
    lead_pentester        UUID REFERENCES users(id),
    status                VARCHAR(50) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'On Hold', 'Completed')),
    created_by            UUID REFERENCES users(id),
    created_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assessment-to-pentester junction (assigned team)
CREATE TABLE assessment_pentesters (
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (assessment_id, user_id)
);

-- ============================================================
-- SCOPE
-- ============================================================
CREATE TABLE scope (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    asset_type    VARCHAR(100) NOT NULL CHECK (asset_type IN ('Web Application', 'API', 'Android Application', 'iOS Application', 'Network IP', 'Cloud Infrastructure', 'Other')),
    asset_name    VARCHAR(255) NOT NULL,
    url_or_ip     VARCHAR(500),
    notes         TEXT,
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- ENDPOINTS
-- ============================================================
CREATE TABLE endpoints (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id           UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    asset_id                UUID REFERENCES scope(id) ON DELETE SET NULL,
    path                    VARCHAR(500) NOT NULL,
    method                  VARCHAR(10) NOT NULL CHECK (method IN ('GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS')),
    authentication_required BOOLEAN NOT NULL DEFAULT FALSE,
    role_required           VARCHAR(255),
    tested_status           BOOLEAN NOT NULL DEFAULT FALSE,
    notes                   TEXT,
    created_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- CHECKLIST TEMPLATE (master list of security checks)
-- ============================================================
CREATE TABLE checklist_template (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category    VARCHAR(100) NOT NULL,
    test_name   VARCHAR(255) NOT NULL,
    description TEXT,
    mandatory   BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order  INTEGER DEFAULT 0,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- CHECKLIST EXECUTION (per-assessment check status)
-- ============================================================
CREATE TABLE checklist_execution (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    check_id      UUID NOT NULL REFERENCES checklist_template(id) ON DELETE CASCADE,
    status        VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Completed', 'Not Applicable', 'Issue Found')),
    tester        UUID REFERENCES users(id),
    notes         TEXT,
    updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (assessment_id, check_id)
);

-- ============================================================
-- PREVIOUS FINDINGS (historical vulnerabilities per product)
-- ============================================================
CREATE TABLE previous_findings (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id       UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    assessment_id    UUID REFERENCES assessments(id) ON DELETE SET NULL,  -- assessment where first found
    title            VARCHAR(255) NOT NULL,
    description      TEXT,
    severity         VARCHAR(50) NOT NULL CHECK (severity IN ('Informational', 'Low', 'Medium', 'High', 'Critical')),
    first_found_date DATE,
    status           VARCHAR(50) NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'Fixed', 'Accepted', 'Not Applicable')),
    created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- FINDING VERIFICATION (verify findings during new assessment)
-- ============================================================
CREATE TABLE finding_verification (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    finding_id    UUID NOT NULL REFERENCES previous_findings(id) ON DELETE CASCADE,
    status        VARCHAR(50) NOT NULL CHECK (status IN ('Reproduced', 'Fixed', 'Not Applicable')),
    reason        TEXT,
    verified_by   UUID REFERENCES users(id),
    verified_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (assessment_id, finding_id)
);

-- ============================================================
-- BLOCKERS
-- ============================================================
CREATE TABLE blockers (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id       UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    start_date          DATE NOT NULL,
    end_date            DATE,
    reason              TEXT NOT NULL,
    expected_resolution DATE,
    resolved            BOOLEAN NOT NULL DEFAULT FALSE,
    created_by          UUID REFERENCES users(id),
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- CUSTOM TEST SCENARIOS
-- ============================================================
CREATE TABLE custom_tests (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    test_name     VARCHAR(255) NOT NULL,
    area          VARCHAR(255),
    description   TEXT,
    status        VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Completed', 'Not Applicable', 'Issue Found')),
    notes         TEXT,
    created_by    UUID REFERENCES users(id),
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- ASSESSMENT SUMMARY (final step before submission)
-- ============================================================
CREATE TABLE assessment_summary (
    id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id        UUID NOT NULL UNIQUE REFERENCES assessments(id) ON DELETE CASCADE,
    end_date             DATE NOT NULL,
    total_findings       INTEGER NOT NULL DEFAULT 0,
    reproduced_findings  INTEGER NOT NULL DEFAULT 0,
    new_findings         INTEGER NOT NULL DEFAULT 0,
    summary_notes        TEXT,
    report_link          VARCHAR(1000),
    submitted_by         UUID REFERENCES users(id),
    submitted_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_assessments_product_id ON assessments(product_id);
CREATE INDEX idx_assessments_status ON assessments(status);
CREATE INDEX idx_scope_assessment_id ON scope(assessment_id);
CREATE INDEX idx_endpoints_assessment_id ON endpoints(assessment_id);
CREATE INDEX idx_checklist_execution_assessment_id ON checklist_execution(assessment_id);
CREATE INDEX idx_checklist_execution_status ON checklist_execution(status);
CREATE INDEX idx_previous_findings_product_id ON previous_findings(product_id);
CREATE INDEX idx_finding_verification_assessment_id ON finding_verification(assessment_id);
CREATE INDEX idx_blockers_assessment_id ON blockers(assessment_id);
CREATE INDEX idx_custom_tests_assessment_id ON custom_tests(assessment_id);
