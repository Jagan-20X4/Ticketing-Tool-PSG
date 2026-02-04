const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const { pool } = require('./db');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: true }));
app.use(express.json());

// ---------- Helpers ----------
const toUser = (row) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  phone: row.phone || '',
  role: row.role,
  department: row.department || '',
  location: row.location,
  password: row.password_hash,
  managerId: row.manager_id,
  avatarUrl: row.avatar_url,
});

const toDepartment = (row) => ({
  code: row.code,
  name: row.name,
  status: row.status,
});

const toApplication = (row) => ({
  id: row.id,
  name: row.name,
  icon: row.icon,
  color: row.color,
  status: row.status,
});

const toIssue = (row, assigneeIds = []) => ({
  code: row.code,
  name: row.name,
  app: row.app,
  category: row.category,
  priority: row.priority,
  assigneeIds,
  slaHours: row.sla_hours,
  status: row.status,
});

const toSLA = (row) => ({
  id: row.id,
  priority: row.priority,
  ticketType: row.ticket_type,
  resolutionTimeHours: row.resolution_time_hours,
  autoEscalate: row.auto_escalate,
});

const toWorkflow = (row) => ({
  app: row.app,
  issueType: row.issue_type,
  defaultAssigneeId: row.default_assignee_id,
});

const toPatient = (row) => ({
  id: row.id,
  name: row.name,
  dob: row.dob,
  gender: row.gender,
  phone: row.phone || '',
  email: row.email,
  roomNumber: row.room_number,
  createdAt: row.created_at,
});

const toComment = (row) => ({
  id: row.id,
  userId: row.user_id,
  userName: row.user_name,
  text: row.text,
  createdAt: row.created_at,
  isInternal: row.is_internal,
});

const toAttachment = (row) => ({
  id: row.id,
  name: row.name,
  size: row.size,
  type: row.type,
  url: row.url,
});

const toTicket = (row, comments = [], attachments = []) => ({
  id: row.id,
  requesterId: row.requester_id,
  requesterName: row.requester_name,
  requesterPhone: row.requester_phone || '',
  app: row.app,
  type: row.type,
  issueCode: row.issue_code,
  issueName: row.issue_name,
  summary: row.summary,
  description: row.description || '',
  status: row.status,
  priority: row.priority,
  assigneeId: row.assignee_id,
  createdAt: row.created_at,
  assignedAt: row.assigned_at,
  updatedAt: row.updated_at,
  resolvedAt: row.resolved_at,
  closedAt: row.closed_at,
  slaLevel: row.sla_level ?? 1,
  isEscalated: row.is_escalated,
  workStartedAt: row.work_started_at,
  actualResolutionHours: row.actual_resolution_hours != null ? Number(row.actual_resolution_hours) : undefined,
  slaBreachDurationHours: row.sla_breach_duration_hours != null ? Number(row.sla_breach_duration_hours) : undefined,
  comments,
  attachments,
});

// ---------- Auth ----------
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const r = await pool.query(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1) AND password_hash = $2',
      [email, password]
    );
    if (r.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    res.json(toUser(r.rows[0]));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---------- Users ----------
app.get('/api/users', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM users ORDER BY name');
    res.json(r.rows.map(toUser));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const u = req.body;
    await pool.query(
      `INSERT INTO users (id, name, email, phone, role, department, location, password_hash, manager_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [u.id, u.name, u.email, u.phone || '', u.role, u.department || '', u.location || null, u.password || '', u.managerId || null]
    );
    const r = await pool.query('SELECT * FROM users WHERE id = $1', [u.id]);
    res.status(201).json(toUser(r.rows[0]));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const u = req.body;
    await pool.query(
      `UPDATE users SET name=$2, email=$3, phone=$4, role=$5, department=$6, location=$7, manager_id=$8, updated_at=NOW()
       WHERE id=$1`,
      [req.params.id, u.name, u.email, u.phone, u.role, u.department, u.location || null, u.managerId || null]
    );
    const r = await pool.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
    if (r.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(toUser(r.rows[0]));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.status(204).end();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---------- Departments ----------
app.get('/api/departments', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM departments ORDER BY code');
    res.json(r.rows.map(toDepartment));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/departments', async (req, res) => {
  try {
    const d = req.body;
    await pool.query('INSERT INTO departments (code, name, status) VALUES ($1, $2, $3)', [d.code, d.name, d.status || 'Active']);
    const r = await pool.query('SELECT * FROM departments WHERE code = $1', [d.code]);
    res.status(201).json(toDepartment(r.rows[0]));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/departments/:code', async (req, res) => {
  try {
    const d = req.body;
    await pool.query('UPDATE departments SET name=$2, status=$3 WHERE code=$1', [req.params.code, d.name, d.status]);
    const r = await pool.query('SELECT * FROM departments WHERE code = $1', [req.params.code]);
    if (r.rows.length === 0) return res.status(404).json({ error: 'Department not found' });
    res.json(toDepartment(r.rows[0]));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/departments/:code', async (req, res) => {
  try {
    await pool.query('DELETE FROM departments WHERE code = $1', [req.params.code]);
    res.status(204).end();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---------- Applications ----------
app.get('/api/applications', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM applications ORDER BY id');
    res.json(r.rows.map(toApplication));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/applications', async (req, res) => {
  try {
    const a = req.body;
    await pool.query(
      'INSERT INTO applications (id, name, icon, color, status) VALUES ($1, $2, $3, $4, $5)',
      [a.id, a.name, a.icon || '', a.color || '', a.status || 'Active']
    );
    const r = await pool.query('SELECT * FROM applications WHERE id = $1', [a.id]);
    res.status(201).json(toApplication(r.rows[0]));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/applications/:id', async (req, res) => {
  try {
    const a = req.body;
    await pool.query(
      'UPDATE applications SET name=$2, icon=$3, color=$4, status=$5 WHERE id=$1',
      [req.params.id, a.name, a.icon, a.color, a.status]
    );
    const r = await pool.query('SELECT * FROM applications WHERE id = $1', [req.params.id]);
    if (r.rows.length === 0) return res.status(404).json({ error: 'Application not found' });
    res.json(toApplication(r.rows[0]));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/applications/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM applications WHERE id = $1', [req.params.id]);
    res.status(204).end();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---------- Issues (with assigneeIds) ----------
app.get('/api/issues', async (req, res) => {
  try {
    const issues = await pool.query('SELECT * FROM issue_master ORDER BY code');
    const assignees = await pool.query('SELECT issue_code, user_id FROM issue_assignees');
    const map = {};
    assignees.rows.forEach((a) => {
      if (!map[a.issue_code]) map[a.issue_code] = [];
      map[a.issue_code].push(a.user_id);
    });
    res.json(issues.rows.map((row) => toIssue(row, map[row.code] || [])));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/issues', async (req, res) => {
  try {
    const i = req.body;
    await pool.query(
      `INSERT INTO issue_master (code, name, app, category, priority, sla_hours, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [i.code, i.name, i.app, i.category, i.priority, i.slaHours, i.status || 'Active']
    );
    const assigneeIds = i.assigneeIds || [];
    for (const uid of assigneeIds) {
      await pool.query('INSERT INTO issue_assignees (issue_code, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [i.code, uid]);
    }
    const r = await pool.query('SELECT * FROM issue_master WHERE code = $1', [i.code]);
    const a = await pool.query('SELECT user_id FROM issue_assignees WHERE issue_code = $1', [i.code]);
    res.status(201).json(toIssue(r.rows[0], a.rows.map((x) => x.user_id)));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/issues/:code', async (req, res) => {
  try {
    const i = req.body;
    await pool.query(
      'UPDATE issue_master SET name=$2, app=$3, category=$4, priority=$5, sla_hours=$6, status=$7 WHERE code=$1',
      [req.params.code, i.name, i.app, i.category, i.priority, i.slaHours, i.status]
    );
    if (Array.isArray(i.assigneeIds)) {
      await pool.query('DELETE FROM issue_assignees WHERE issue_code = $1', [req.params.code]);
      for (const uid of i.assigneeIds) {
        await pool.query('INSERT INTO issue_assignees (issue_code, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [req.params.code, uid]);
      }
    }
    const r = await pool.query('SELECT * FROM issue_master WHERE code = $1', [req.params.code]);
    if (r.rows.length === 0) return res.status(404).json({ error: 'Issue not found' });
    const a = await pool.query('SELECT user_id FROM issue_assignees WHERE issue_code = $1', [req.params.code]);
    res.json(toIssue(r.rows[0], a.rows.map((x) => x.user_id)));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/issues/:code', async (req, res) => {
  try {
    await pool.query('DELETE FROM issue_master WHERE code = $1', [req.params.code]);
    res.status(204).end();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---------- SLA ----------
app.get('/api/sla', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM sla_master ORDER BY id');
    res.json(r.rows.map(toSLA));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/sla', async (req, res) => {
  try {
    const s = req.body;
    await pool.query(
      `INSERT INTO sla_master (id, priority, ticket_type, resolution_time_hours, auto_escalate)
       VALUES ($1, $2, $3, $4, $5)`,
      [s.id, s.priority, s.ticketType, s.resolutionTimeHours, s.autoEscalate ?? false]
    );
    const r = await pool.query('SELECT * FROM sla_master WHERE id = $1', [s.id]);
    res.status(201).json(toSLA(r.rows[0]));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/sla/:id', async (req, res) => {
  try {
    const s = req.body;
    await pool.query(
      'UPDATE sla_master SET priority=$2, ticket_type=$3, resolution_time_hours=$4, auto_escalate=$5 WHERE id=$1',
      [req.params.id, s.priority, s.ticketType, s.resolutionTimeHours, s.autoEscalate]
    );
    const r = await pool.query('SELECT * FROM sla_master WHERE id = $1', [req.params.id]);
    if (r.rows.length === 0) return res.status(404).json({ error: 'SLA not found' });
    res.json(toSLA(r.rows[0]));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/sla/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM sla_master WHERE id = $1', [req.params.id]);
    res.status(204).end();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---------- Workflow ----------
app.get('/api/workflow', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM workflow_rules ORDER BY id');
    res.json(r.rows.map(toWorkflow));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/workflow', async (req, res) => {
  try {
    const w = req.body;
    const r = await pool.query(
      `INSERT INTO workflow_rules (app, issue_type, default_assignee_id) VALUES ($1, $2, $3)
       ON CONFLICT (app, issue_type) DO UPDATE SET default_assignee_id = $3 RETURNING *`,
      [w.app, w.issueType, w.defaultAssigneeId]
    );
    res.status(201).json(toWorkflow(r.rows[0]));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/workflow', async (req, res) => {
  try {
    const w = req.body;
    await pool.query(
      'UPDATE workflow_rules SET default_assignee_id = $3 WHERE app = $1 AND issue_type = $2',
      [w.app, w.issueType, w.defaultAssigneeId]
    );
    const r = await pool.query('SELECT * FROM workflow_rules WHERE app = $1 AND issue_type = $2', [w.app, w.issueType]);
    if (r.rows.length === 0) return res.status(404).json({ error: 'Workflow not found' });
    res.json(toWorkflow(r.rows[0]));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/workflow', async (req, res) => {
  try {
    const { app, issueType } = req.query;
    await pool.query('DELETE FROM workflow_rules WHERE app = $1 AND issue_type = $2', [app, issueType]);
    res.status(204).end();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---------- Patients ----------
app.get('/api/patients', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM patients ORDER BY created_at DESC');
    res.json(r.rows.map(toPatient));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/patients', async (req, res) => {
  try {
    const p = req.body;
    await pool.query(
      `INSERT INTO patients (id, name, dob, gender, phone, email, room_number)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [p.id, p.name, p.dob, p.gender, p.phone || '', p.email || null, p.roomNumber || null]
    );
    const r = await pool.query('SELECT * FROM patients WHERE id = $1', [p.id]);
    res.status(201).json(toPatient(r.rows[0]));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---------- Tickets ----------
async function getTicketsWithDetails(whereClause = '', params = []) {
  const q = `SELECT * FROM tickets ${whereClause} ORDER BY tickets.created_at DESC`;
  const tickets = await pool.query(q, params);
  const result = [];
  for (const row of tickets.rows) {
    const [comments, attachments] = await Promise.all([
      pool.query('SELECT * FROM ticket_comments WHERE ticket_id = $1 ORDER BY created_at', [row.id]),
      pool.query('SELECT * FROM ticket_attachments WHERE ticket_id = $1', [row.id]),
    ]);
    result.push(toTicket(row, comments.rows.map(toComment), attachments.rows.map(toAttachment)));
  }
  return result;
}

app.get('/api/tickets', async (req, res) => {
  try {
    const list = await getTicketsWithDetails();
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/tickets/:id', async (req, res) => {
  try {
    const list = await getTicketsWithDetails('WHERE tickets.id = $1', [req.params.id]);
    if (list.length === 0) return res.status(404).json({ error: 'Ticket not found' });
    res.json(list[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/tickets', async (req, res) => {
  try {
    const t = req.body;
    await pool.query(
      `INSERT INTO tickets (id, requester_id, requester_name, requester_phone, app, type, issue_code, issue_name, summary, description, status, priority, assignee_id, sla_level, is_escalated)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      [
        t.id, t.requesterId, t.requesterName, t.requesterPhone || '', t.app, t.type, t.issueCode, t.issueName,
        t.summary, t.description || '', t.status || 'Yet to Start', t.priority, t.assigneeId || null,
        t.slaLevel ?? 1, t.isEscalated ?? false
      ]
    );
    if (t.comments && t.comments.length > 0) {
      for (const c of t.comments) {
        await pool.query(
          `INSERT INTO ticket_comments (id, ticket_id, user_id, user_name, text, is_internal) VALUES ($1, $2, $3, $4, $5, $6)`,
          [c.id, t.id, c.userId, c.userName, c.text, c.isInternal ?? false]
        );
      }
    }
    if (t.attachments && t.attachments.length > 0) {
      for (const a of t.attachments) {
        await pool.query(
          `INSERT INTO ticket_attachments (id, ticket_id, name, size, type, url) VALUES ($1, $2, $3, $4, $5, $6)`,
          [a.id, t.id, a.name, a.size, a.type, a.url]
        );
      }
    }
    const list = await getTicketsWithDetails('WHERE tickets.id = $1', [t.id]);
    res.status(201).json(list[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/tickets/:id', async (req, res) => {
  try {
    const t = req.body;
    const id = req.params.id;
    await pool.query(
      `UPDATE tickets SET requester_id=$2, requester_name=$3, requester_phone=$4, app=$5, type=$6, issue_code=$7, issue_name=$8,
       summary=$9, description=$10, status=$11, priority=$12, assignee_id=$13, assigned_at=$14, resolved_at=$15, closed_at=$16,
       sla_level=$17, is_escalated=$18, work_started_at=$19, actual_resolution_hours=$20, sla_breach_duration_hours=$21, updated_at=NOW()
       WHERE id=$1`,
      [
        id, t.requesterId, t.requesterName, t.requesterPhone, t.app, t.type, t.issueCode, t.issueName,
        t.summary, t.description, t.status, t.priority, t.assigneeId || null, t.assignedAt || null, t.resolvedAt || null, t.closedAt || null,
        t.slaLevel ?? 1, t.isEscalated ?? false, t.workStartedAt || null, t.actualResolutionHours ?? null, t.slaBreachDurationHours ?? null
      ]
    );
    const list = await getTicketsWithDetails('WHERE tickets.id = $1', [id]);
    if (list.length === 0) return res.status(404).json({ error: 'Ticket not found' });
    res.json(list[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/tickets/:id/comments', async (req, res) => {
  try {
    const c = req.body;
    const ticketId = req.params.id;
    await pool.query(
      `INSERT INTO ticket_comments (id, ticket_id, user_id, user_name, text, is_internal) VALUES ($1, $2, $3, $4, $5, $6)`,
      [c.id, ticketId, c.userId, c.userName, c.text, c.isInternal ?? false]
    );
    await pool.query('UPDATE tickets SET updated_at = NOW() WHERE id = $1', [ticketId]);
    const r = await pool.query('SELECT * FROM ticket_comments WHERE id = $1', [c.id]);
    res.status(201).json(toComment(r.rows[0]));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, database: 'connected' });
  } catch (e) {
    res.status(503).json({ ok: false, error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`Ticketing API running at http://localhost:${PORT}`);
});
