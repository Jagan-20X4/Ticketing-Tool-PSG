-- ============================================================
-- Ticketing Tool (Indira IT Help Desk) - PostgreSQL Schema
-- Run this as a superuser or DB owner after creating the database.
-- ============================================================

-- Extensions (optional, for UUID if you want to use gen_random_uuid())
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------
-- 1. DEPARTMENTS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS departments (
  code VARCHAR(20) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive'))
);

-- ------------------------------------------------------------
-- 2. APPLICATIONS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS applications (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(100),
  color VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive'))
);

-- ------------------------------------------------------------
-- 3. USERS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50),
  role VARCHAR(30) NOT NULL CHECK (role IN ('Requester', 'Assignee', 'Manager', 'Admin')),
  department VARCHAR(255),
  location VARCHAR(255),
  password_hash VARCHAR(255),
  manager_id VARCHAR(50) REFERENCES users(id),
  avatar_url VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 4. ISSUE MASTER (assigneeIds stored in issue_assignees)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS issue_master (
  code VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  app VARCHAR(50) NOT NULL REFERENCES applications(id),
  category VARCHAR(50) NOT NULL,
  priority VARCHAR(20) NOT NULL CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
  sla_hours INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive'))
);

CREATE TABLE IF NOT EXISTS issue_assignees (
  issue_code VARCHAR(50) NOT NULL REFERENCES issue_master(code) ON DELETE CASCADE,
  user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (issue_code, user_id)
);

-- ------------------------------------------------------------
-- 5. SLA MASTER
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sla_master (
  id VARCHAR(50) PRIMARY KEY,
  priority VARCHAR(20) NOT NULL CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
  ticket_type VARCHAR(50) NOT NULL,
  resolution_time_hours INTEGER NOT NULL,
  auto_escalate BOOLEAN NOT NULL DEFAULT false
);

-- ------------------------------------------------------------
-- 6. WORKFLOW RULES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS workflow_rules (
  id SERIAL PRIMARY KEY,
  app VARCHAR(50) NOT NULL REFERENCES applications(id),
  issue_type VARCHAR(50) NOT NULL,
  default_assignee_id VARCHAR(50) REFERENCES users(id),
  UNIQUE (app, issue_type)
);

-- ------------------------------------------------------------
-- 7. PATIENTS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS patients (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  dob DATE NOT NULL,
  gender VARCHAR(20) NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
  phone VARCHAR(50),
  email VARCHAR(255),
  room_number VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 8. TICKETS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tickets (
  id VARCHAR(50) PRIMARY KEY,
  requester_id VARCHAR(50) NOT NULL REFERENCES users(id),
  requester_name VARCHAR(255) NOT NULL,
  requester_phone VARCHAR(50),
  app VARCHAR(50) NOT NULL REFERENCES applications(id),
  type VARCHAR(50) NOT NULL,
  issue_code VARCHAR(50) NOT NULL REFERENCES issue_master(code),
  issue_name VARCHAR(255) NOT NULL,
  summary VARCHAR(500) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'Yet to Start',
  priority VARCHAR(20) NOT NULL CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
  assignee_id VARCHAR(50) REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  assigned_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  sla_level INTEGER DEFAULT 1,
  is_escalated BOOLEAN DEFAULT false,
  work_started_at TIMESTAMPTZ,
  actual_resolution_hours NUMERIC(10,2),
  sla_breach_duration_hours NUMERIC(10,2)
);

-- ------------------------------------------------------------
-- 9. TICKET COMMENTS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ticket_comments (
  id VARCHAR(80) PRIMARY KEY,
  ticket_id VARCHAR(50) NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  user_id VARCHAR(50) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_internal BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_ticket_comments_ticket_id ON ticket_comments(ticket_id);

-- ------------------------------------------------------------
-- 10. TICKET ATTACHMENTS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ticket_attachments (
  id VARCHAR(80) PRIMARY KEY,
  ticket_id VARCHAR(50) NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  size INTEGER NOT NULL,
  type VARCHAR(100) NOT NULL,
  url VARCHAR(500) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ticket_attachments_ticket_id ON ticket_attachments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_tickets_requester ON tickets(requester_id);
CREATE INDEX IF NOT EXISTS idx_tickets_assignee ON tickets(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at DESC);
