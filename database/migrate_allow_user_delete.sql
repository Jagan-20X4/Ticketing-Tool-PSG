-- Allow deleting users even when they are requester or assignee on tickets.
-- When a user is deleted, their tickets will have requester_id/assignee_id set to NULL.
-- Run this once: psql -U postgres -d ticketing_tool -f database/migrate_allow_user_delete.sql

-- 1. Tickets: requester_id - drop FK, allow NULL, re-add with ON DELETE SET NULL
ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_requester_id_fkey;
ALTER TABLE tickets ALTER COLUMN requester_id DROP NOT NULL;
ALTER TABLE tickets ADD CONSTRAINT tickets_requester_id_fkey
  FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE SET NULL;

-- 2. Tickets: assignee_id - drop FK, re-add with ON DELETE SET NULL (already nullable)
ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_assignee_id_fkey;
ALTER TABLE tickets ADD CONSTRAINT tickets_assignee_id_fkey
  FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL;
