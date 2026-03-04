-- PAMP — Seed Data
-- Run after schema.sql

-- ============================================================
-- DEFAULT ADMIN USER
-- Password: Change1234! (bcrypt hash — change immediately in production)
-- ============================================================
INSERT INTO users (username, email, password_hash, role) VALUES
('admin', 'admin@pamp.internal', '$2b$12$FPoEwEojiVNItRUO5c5m/eVcedvRGQ3FNjeARH4DVClRZmQCv/hou', 'lead_pentester'),
('pentester1', 'pentester1@pamp.internal', '$2b$12$FPoEwEojiVNItRUO5c5m/eVcedvRGQ3FNjeARH4DVClRZmQCv/hou', 'pentester');

-- ============================================================
-- CHECKLIST TEMPLATE — Standard Security Checks
-- ============================================================

-- Authentication
INSERT INTO checklist_template (category, test_name, description, mandatory, sort_order) VALUES
('Authentication', 'Brute Force Protection', 'Verify account lockout or rate limiting after multiple failed login attempts', TRUE, 1),
('Authentication', 'Password Policy', 'Check minimum password length, complexity requirements', TRUE, 2),
('Authentication', 'Default Credentials', 'Test for default or weak credentials on admin interfaces', TRUE, 3),
('Authentication', 'Multi-Factor Authentication', 'Verify MFA is available and enforced for privileged accounts', FALSE, 4),
('Authentication', 'Password Reset Flow', 'Test password reset token validity, expiry, and reuse', TRUE, 5);

-- Session Management
INSERT INTO checklist_template (category, test_name, description, mandatory, sort_order) VALUES
('Session Management', 'Session Token Entropy', 'Verify session tokens have sufficient randomness', TRUE, 10),
('Session Management', 'Session Fixation', 'Test for session fixation vulnerabilities on login', TRUE, 11),
('Session Management', 'Session Timeout', 'Verify idle and absolute session timeout is enforced', TRUE, 12),
('Session Management', 'Secure Cookie Flags', 'Check Secure, HttpOnly, and SameSite flags on session cookies', TRUE, 13),
('Session Management', 'Logout Invalidation', 'Verify session is invalidated server-side on logout', TRUE, 14);

-- Access Control
INSERT INTO checklist_template (category, test_name, description, mandatory, sort_order) VALUES
('Access Control', 'Horizontal IDOR', 'Test for insecure direct object references between users at same privilege level', TRUE, 20),
('Access Control', 'Vertical Privilege Escalation', 'Test for privilege escalation to higher roles', TRUE, 21),
('Access Control', 'Forced Browsing', 'Test access to restricted endpoints without authentication', TRUE, 22),
('Access Control', 'Function-Level Access Control', 'Verify role-based access enforced at every function', TRUE, 23);

-- Input Validation
INSERT INTO checklist_template (category, test_name, description, mandatory, sort_order) VALUES
('Input Validation', 'SQL Injection', 'Test all user inputs for SQL injection vulnerabilities', TRUE, 30),
('Input Validation', 'Cross-Site Scripting (XSS)', 'Test for reflected, stored, and DOM-based XSS', TRUE, 31),
('Input Validation', 'XXE Injection', 'Test XML parsers for external entity injection', FALSE, 32),
('Input Validation', 'Command Injection', 'Test for OS command injection via user inputs', TRUE, 33),
('Input Validation', 'Path Traversal', 'Test for directory traversal in file operations', TRUE, 34);

-- File Upload Security
INSERT INTO checklist_template (category, test_name, description, mandatory, sort_order) VALUES
('File Upload Security', 'File Type Validation', 'Verify only allowed file types can be uploaded', TRUE, 40),
('File Upload Security', 'Malicious File Upload', 'Test uploading web shells, scripts, malicious content', TRUE, 41),
('File Upload Security', 'File Size Limits', 'Verify upload size limits are enforced', FALSE, 42);

-- Business Logic Testing
INSERT INTO checklist_template (category, test_name, description, mandatory, sort_order) VALUES
('Business Logic Testing', 'Price/Amount Manipulation', 'Test for manipulation of prices, quantities, or financial values', TRUE, 50),
('Business Logic Testing', 'Workflow Bypass', 'Test for skipping required workflow steps', TRUE, 51),
('Business Logic Testing', 'Mass Assignment', 'Test for mass assignment of protected fields', TRUE, 52);

-- API Security
INSERT INTO checklist_template (category, test_name, description, mandatory, sort_order) VALUES
('API Security', 'Authentication on All Endpoints', 'Verify all API endpoints require proper authentication', TRUE, 60),
('API Security', 'HTTP Methods', 'Test for excessive HTTP methods on endpoints', FALSE, 61),
('API Security', 'API Rate Limiting', 'Verify rate limiting on API endpoints', TRUE, 62),
('API Security', 'GraphQL Introspection', 'Test if GraphQL introspection is disabled in production', FALSE, 63);

-- Cryptography
INSERT INTO checklist_template (category, test_name, description, mandatory, sort_order) VALUES
('Cryptography', 'TLS Configuration', 'Verify strong TLS version (1.2+) and cipher suites', TRUE, 70),
('Cryptography', 'Certificate Validity', 'Check SSL certificate validity, expiry, and chain', TRUE, 71),
('Cryptography', 'Sensitive Data in Transit', 'Verify all sensitive data is encrypted in transit', TRUE, 72),
('Cryptography', 'Sensitive Data at Rest', 'Verify passwords and sensitive data are hashed/encrypted at rest', TRUE, 73);

-- Security Headers
INSERT INTO checklist_template (category, test_name, description, mandatory, sort_order) VALUES
('Security Headers', 'Content-Security-Policy', 'Verify CSP header is present and properly configured', TRUE, 80),
('Security Headers', 'X-Frame-Options / CSP frame-ancestors', 'Verify clickjacking protection is in place', TRUE, 81),
('Security Headers', 'HSTS', 'Verify HTTP Strict Transport Security header', TRUE, 82),
('Security Headers', 'X-Content-Type-Options', 'Verify nosniff header is present', FALSE, 83);

-- Rate Limiting
INSERT INTO checklist_template (category, test_name, description, mandatory, sort_order) VALUES
('Rate Limiting', 'Login Rate Limiting', 'Verify rate limiting on login and authentication endpoints', TRUE, 90),
('Rate Limiting', 'API Request Throttling', 'Verify general API throttling is in place', TRUE, 91),
('Rate Limiting', 'OTP/Token Enumeration', 'Verify rate limiting on OTP or token validation endpoints', TRUE, 92);

-- ============================================================
-- SAMPLE PRODUCT (for development/testing)
-- ============================================================
INSERT INTO products (product_name, owner_team, business_unit, risk_level, tech_stack, description) VALUES
('Internal Portal', 'Platform Team', 'Engineering', 'High', 'React, Node.js, PostgreSQL', 'Internal employee portal with HR, finance, and project management features');
