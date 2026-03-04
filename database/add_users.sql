-- PAMP — Add team users
-- Run: psql pamp_db < database/add_users.sql
-- Temp password for all accounts: Change1234!
-- Users must change password on first login (enforce via policy or manual reset).

-- Promote existing admin to 'admin' role
UPDATE users
SET role = 'admin'
WHERE username = 'admin';

-- Create myrah (pentester)
INSERT INTO users (username, email, password_hash, role)
VALUES (
  'myrah',
  'myrah@pamp.internal',
  '$2b$12$Vu97UkyGAv6By.InSTOqluj7SwHpN9ldXO9Ga4.dW1wTr/q.kq2vu',
  'pentester'
)
ON CONFLICT (username) DO NOTHING;

-- Create vidula (lead_pentester)
INSERT INTO users (username, email, password_hash, role)
VALUES (
  'vidula',
  'vidula@pamp.internal',
  '$2b$12$Vu97UkyGAv6By.InSTOqluj7SwHpN9ldXO9Ga4.dW1wTr/q.kq2vu',
  'lead_pentester'
)
ON CONFLICT (username) DO NOTHING;
