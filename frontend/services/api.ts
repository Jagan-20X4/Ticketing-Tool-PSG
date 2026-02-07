/**
 * API client for Ticketing Tool backend (PostgreSQL).
 * VITE_API_URL is loaded from backend/.env (e.g. http://localhost:4000) so the frontend connects to the API.
 */

const BASE = typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL
  ? (import.meta as any).env.VITE_API_URL
  : '';

function getHeaders(): HeadersInit {
  return { 'Content-Type': 'application/json' };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText || 'Request failed');
  return data as T;
}

export const api = {
  isConfigured: () => !!BASE,

  health: () =>
    fetch(`${BASE}/api/health`).then((r) => r.json()),

  login: (email: string, password: string) =>
    fetch(`${BASE}/api/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    }).then(handleResponse),

  getUsers: () =>
    fetch(`${BASE}/api/users`).then(handleResponse),

  postUser: (user: any) =>
    fetch(`${BASE}/api/users`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(user),
    }).then(handleResponse),

  putUser: (id: string, user: any) =>
    fetch(`${BASE}/api/users/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(user),
    }).then(handleResponse),

  deleteUser: (id: string) =>
    fetch(`${BASE}/api/users/${encodeURIComponent(id)}`, { method: 'DELETE' }).then(handleResponse),

  getDepartments: () =>
    fetch(`${BASE}/api/departments`).then(handleResponse),

  postDepartment: (dept: any) =>
    fetch(`${BASE}/api/departments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(dept),
    }).then(handleResponse),

  putDepartment: (code: string, dept: any) =>
    fetch(`${BASE}/api/departments/${encodeURIComponent(code)}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(dept),
    }).then(handleResponse),

  deleteDepartment: (code: string) =>
    fetch(`${BASE}/api/departments/${encodeURIComponent(code)}`, { method: 'DELETE' }).then(handleResponse),

  getApplications: () =>
    fetch(`${BASE}/api/applications`).then(handleResponse),

  postApplication: (app: any) =>
    fetch(`${BASE}/api/applications`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(app),
    }).then(handleResponse),

  putApplication: (id: string, app: any) =>
    fetch(`${BASE}/api/applications/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(app),
    }).then(handleResponse),

  deleteApplication: (id: string) =>
    fetch(`${BASE}/api/applications/${encodeURIComponent(id)}`, { method: 'DELETE' }).then(handleResponse),

  getIssues: () =>
    fetch(`${BASE}/api/issues`).then(handleResponse),

  postIssue: (issue: any) =>
    fetch(`${BASE}/api/issues`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(issue),
    }).then(handleResponse),

  putIssue: (code: string, issue: any) =>
    fetch(`${BASE}/api/issues/${encodeURIComponent(code)}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(issue),
    }).then(handleResponse),

  deleteIssue: (code: string) =>
    fetch(`${BASE}/api/issues/${encodeURIComponent(code)}`, { method: 'DELETE' }).then(handleResponse),

  getSla: () =>
    fetch(`${BASE}/api/sla`).then(handleResponse),

  postSla: (sla: any) =>
    fetch(`${BASE}/api/sla`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(sla),
    }).then(handleResponse),

  putSla: (id: string, sla: any) =>
    fetch(`${BASE}/api/sla/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(sla),
    }).then(handleResponse),

  deleteSla: (id: string) =>
    fetch(`${BASE}/api/sla/${encodeURIComponent(id)}`, { method: 'DELETE' }).then(handleResponse),

  getWorkflow: () =>
    fetch(`${BASE}/api/workflow`).then(handleResponse),

  postWorkflow: (w: any) =>
    fetch(`${BASE}/api/workflow`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(w),
    }).then(handleResponse),

  putWorkflow: (w: any) =>
    fetch(`${BASE}/api/workflow`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(w),
    }).then(handleResponse),

  deleteWorkflow: (app: string, issueType: string) =>
    fetch(`${BASE}/api/workflow?app=${encodeURIComponent(app)}&issueType=${encodeURIComponent(issueType)}`, {
      method: 'DELETE',
    }).then(handleResponse),

  getPatients: () =>
    fetch(`${BASE}/api/patients`).then(handleResponse),

  postPatient: (patient: any) =>
    fetch(`${BASE}/api/patients`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(patient),
    }).then(handleResponse),

  getTickets: () =>
    fetch(`${BASE}/api/tickets`).then(handleResponse),

  getTicket: (id: string) =>
    fetch(`${BASE}/api/tickets/${encodeURIComponent(id)}`).then(handleResponse),

  postTicket: (ticket: any) =>
    fetch(`${BASE}/api/tickets`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(ticket),
    }).then(handleResponse),

  putTicket: (id: string, ticket: any) =>
    fetch(`${BASE}/api/tickets/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(ticket),
    }).then(handleResponse),

  postTicketComment: (ticketId: string, comment: any) =>
    fetch(`${BASE}/api/tickets/${encodeURIComponent(ticketId)}/comments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(comment),
    }).then(handleResponse),
};
