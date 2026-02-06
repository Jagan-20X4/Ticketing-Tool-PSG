-- Run this only if you already have issue_assignees without a position column (existing DBs).
-- New installs: schema.sql already includes position.
ALTER TABLE issue_assignees ADD COLUMN IF NOT EXISTS position INT NOT NULL DEFAULT 0;

-- Then re-run seed.sql so default assignees get position 1 (first in list).
