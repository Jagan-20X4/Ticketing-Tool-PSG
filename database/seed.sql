-- ============================================================
-- Seed data (run after schema.sql). Safe to run multiple times
-- using ON CONFLICT DO NOTHING / INSERT ... WHERE NOT EXISTS.
-- ============================================================

-- Departments
INSERT INTO departments (code, name, status) VALUES
  ('IT', 'IT Infrastructure', 'Active'),
  ('FIN', 'Finance', 'Active'),
  ('HR', 'Human Resources', 'Active'),
  ('OPS', 'Operations', 'Active'),
  ('HIS', 'Hospital Info Systems', 'Active')
ON CONFLICT (code) DO NOTHING;

-- Applications
INSERT INTO applications (id, name, icon, color, status) VALUES
  ('P2P', 'P2P System', 'DollarSign', 'bg-emerald-50 text-emerald-600 border-emerald-200', 'Active'),
  ('Eshopaid', 'Eshopaid', 'ShoppingCart', 'bg-orange-50 text-orange-600 border-orange-200', 'Active'),
  ('Oracle ERP', 'Oracle ERP', 'Database', 'bg-red-50 text-red-600 border-red-200', 'Active'),
  ('IT', 'IT Infrastructure', 'Monitor', 'bg-blue-50 text-blue-600 border-blue-200', 'Active'),
  ('Website', 'Website / CMS', 'Globe', 'bg-indigo-50 text-indigo-600 border-indigo-200', 'Active'),
  ('HIS', 'Hospital Info System', 'Activity', 'bg-teal-50 text-teal-600 border-teal-200', 'Active')
ON CONFLICT (id) DO NOTHING;

-- Users (password stored as plaintext for demo - use password_hash in production)
INSERT INTO users (id, name, email, phone, role, department, location, password_hash, manager_id) VALUES
  ('u1', 'Alice Admin', 'alice@helix.com', '555-0101', 'Admin', 'IT Infrastructure', 'HQ - Tower A', 'password123', NULL),
  ('u2', 'Bob Engineer', 'bob@helix.com', '555-0102', 'Assignee', 'IT Infrastructure', 'IT Lab 1', 'password123', 'u4'),
  ('u3', 'Charlie Requester', 'charlie@helix.com', '555-0103', 'Requester', 'Finance', 'Finance Floor 3', 'password123', NULL),
  ('u4', 'Dave Manager', 'dave@helix.com', '555-0104', 'Manager', 'IT Infrastructure', 'HQ - Executive Wing', 'password123', NULL),
  ('u6', 'Abhishek srivastava', 'abhishek.srivastava@indiraivf.in', '', 'Assignee', 'IT Infrastructure', 'Lucknow', 'password123', NULL),
  ('u7', 'Siddique Sheikh', 'siddique.sheikh@indiraivf.in', '', 'Assignee', 'IT Infrastructure', 'Udaipur', 'password123', NULL),
  ('u8', 'Sunil bahadur', 'sunil.bahadur@indiraivf.in', '', 'Assignee', 'IT Infrastructure', 'Delhi', 'password123', NULL),
  ('u11', 'Pradeep Mishra', 'itsupportmumbai@indiraivf.in', '', 'Assignee', 'IT Infrastructure', 'Mumbai', 'password123', NULL),
  ('u12', 'Nitin singh negi', 'nitin.singh@indiraivf.in', '', 'Assignee', 'IT Infrastructure', 'Udaipur', 'password123', NULL),
  ('u13', 'Pankaj Sharma', 'pankaj.sharma@indiraivf.in', '', 'Assignee', 'IT Infrastructure', 'Mumbai', 'password123', NULL),
  ('u14', 'Gourav Salvi', 'gourav.salvi@indiraivf.in', '', 'Assignee', 'IT Infrastructure', 'Udaipur', 'password123', NULL),
  ('u15', 'Abhishek Singh', 'adtest@indiraivf.in', '', 'Assignee', 'IT Infrastructure', 'Mumbai', 'password123', NULL),
  ('u16', 'Mukesh Audichya', 'mukesh.audichya@indiraivf.in', '', 'Assignee', 'IT Infrastructure', 'Udaipur', 'password123', NULL),
  ('u17', 'Sameer khan', 'sameer.khan1@indiraivf.in', '', 'Assignee', 'IT Infrastructure', 'Udaipur', 'password123', NULL),
  ('u18', 'Anirudh Palande', 'anirudh.palande@indiraivf.in', '', 'Assignee', 'IT Infrastructure', 'Mumbai', 'password123', NULL),
  ('u20', 'Rakesh Mehta', 'rakesh.mehta@indiraivf.in', '', 'Assignee', 'IT Infrastructure', 'Udaipur', 'password123', NULL),
  ('u23', 'Kavita Rao', 'kavita.rao@indiraivf.in', '', 'Assignee', 'IT Infrastructure', 'Udaipur', 'password123', NULL),
  ('u25', 'Ishita Sisodiya', 'ishita.sisodiya@indiraivf.in', '', 'Assignee', 'IT Infrastructure', 'Udaipur', 'password123', NULL),
  ('u28', 'Vivek Sharma', 'vivek.sharma@indiraivf.in', '', 'Assignee', 'IT Infrastructure', 'Udaipur', 'password123', NULL),
  ('u29', 'Shubham Tiwari', 'shubham.tiwari@indiraivf.in', '', 'Assignee', 'IT Infrastructure', 'Udaipur', 'password123', NULL)
ON CONFLICT (id) DO NOTHING;

-- Issue Master (application id must match - we use 'IT', 'P2P' etc from applications)
INSERT INTO issue_master (code, name, app, category, priority, sla_hours, status) VALUES
  ('IT-ACC-001', 'Access & Right', 'IT', 'Service Request', 'High', 24, 'Active'),
  ('IT-CTV-001', 'CCTV / Smart PSS issue', 'IT', 'Incident', 'High', 8, 'Active'),
  ('IT-NET-001', 'Network Issue', 'IT', 'Incident', 'High', 4, 'Active'),
  ('IT-MDM-001', 'Scalefusion MDM Issue', 'IT', 'Incident', 'Critical', 4, 'Active'),
  ('IT-PRN-001', 'Printer / Scanner Issue', 'IT', 'Incident', 'High', 8, 'Active'),
  ('IT-WEB-001', 'Web Application Issue', 'IT', 'Incident', 'High', 8, 'Active'),
  ('IT-HRD-002', 'New Hardware', 'IT', 'Service Request', 'High', 48, 'Active'),
  ('IT-SFT-002', 'Software Issue', 'IT', 'Incident', 'High', 8, 'Active'),
  ('IT-EML-001', 'Email', 'IT', 'Service Request', 'High', 24, 'Active'),
  ('P2P-APP-001', 'P2P Application Issues', 'P2P', 'Incident', 'High', 8, 'Active'),
  ('IT-FLU-001', 'Internet Fluctuation', 'IT', 'Incident', 'Critical', 4, 'Active'),
  ('IT-CYB-001', 'CyberARK (IDAM/PAM)', 'IT', 'Service Request', 'High', 12, 'Active'),
  ('IT-BOT-001', 'BOT Workflow mismatch', 'IT', 'Incident', 'High', 24, 'Active')
ON CONFLICT (code) DO NOTHING;

-- Issue Assignees (issue_code -> user_id)
INSERT INTO issue_assignees (issue_code, user_id) VALUES
  ('IT-ACC-001', 'u7'), ('IT-ACC-001', 'u6'), ('IT-ACC-001', 'u16'),
  ('IT-CTV-001', 'u14'), ('IT-CTV-001', 'u12'),
  ('IT-NET-001', 'u28'), ('IT-NET-001', 'u17'),
  ('IT-MDM-001', 'u18'), ('IT-MDM-001', 'u7'), ('IT-MDM-001', 'u17'),
  ('IT-PRN-001', 'u8'), ('IT-PRN-001', 'u6'),
  ('IT-WEB-001', 'u17'), ('IT-WEB-001', 'u18'),
  ('IT-HRD-002', 'u11'), ('IT-HRD-002', 'u25'),
  ('IT-SFT-002', 'u20'), ('IT-SFT-002', 'u23'),
  ('IT-EML-001', 'u7'), ('IT-EML-001', 'u18'),
  ('P2P-APP-001', 'u6'), ('P2P-APP-001', 'u20'),
  ('IT-FLU-001', 'u29'), ('IT-FLU-001', 'u28'),
  ('IT-CYB-001', 'u18'), ('IT-CYB-001', 'u15'),
  ('IT-BOT-001', 'u2'), ('IT-BOT-001', 'u20')
ON CONFLICT (issue_code, user_id) DO NOTHING;

-- SLA Master
INSERT INTO sla_master (id, priority, ticket_type, resolution_time_hours, auto_escalate) VALUES
  ('sla1', 'Critical', 'Incident', 4, true),
  ('sla2', 'High', 'Incident', 8, true),
  ('sla3', 'Medium', 'Incident', 24, false),
  ('sla4', 'Low', 'Service Request', 48, false)
ON CONFLICT (id) DO NOTHING;

-- Workflow Rules
INSERT INTO workflow_rules (app, issue_type, default_assignee_id) VALUES
  ('Oracle ERP', 'Incident', 'u2'),
  ('P2P', 'Service Request', 'u6'),
  ('IT', 'Other', 'u6')
ON CONFLICT (app, issue_type) DO NOTHING;
