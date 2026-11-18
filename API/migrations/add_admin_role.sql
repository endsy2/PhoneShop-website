-- RBAC: give each staff account a role (see Utils/rbac.js for what each role may do).
-- Existing accounts become 'admin' so nobody loses access. New accounts default to 'support'.
ALTER TABLE admin
  ADD COLUMN role ENUM('support', 'manager', 'admin') NOT NULL DEFAULT 'support';

UPDATE admin SET role = 'admin';

-- Verify
SELECT adminname, email, role FROM admin;
