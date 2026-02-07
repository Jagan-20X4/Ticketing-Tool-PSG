-- Allow deleting issues even when tickets reference them.
-- When an issue is deleted, tickets that used that issue will have issue_code set to NULL
-- (issue_name on the ticket is kept so the ticket still shows the original issue name).
-- Run once: psql -U postgres -d ticketing_tool -f database/migrate_allow_issue_delete.sql

ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_issue_code_fkey;
ALTER TABLE tickets ALTER COLUMN issue_code DROP NOT NULL;
ALTER TABLE tickets ADD CONSTRAINT tickets_issue_code_fkey
  FOREIGN KEY (issue_code) REFERENCES issue_master(code) ON DELETE SET NULL;
