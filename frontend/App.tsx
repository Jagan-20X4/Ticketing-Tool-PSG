import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { TicketForm } from './components/TicketForm';
import { TicketList } from './components/TicketList';
import { TicketDetail } from './components/TicketDetail';
import { AdminPanel } from './components/AdminPanel';
import { PatientManager } from './components/PatientManager';
import { AITriageChat } from './components/AITriageChat';
import {
  User, Ticket, TicketStatus, UserRole, WorkflowRule,
  Department, IssueMaster, SLAMaster, Application, Patient,
  Comment, TicketType
} from './types';
import {
  MOCK_WORKFLOW, MOCK_USERS, MOCK_APPLICATIONS,
  MOCK_DEPARTMENTS, MOCK_ISSUES, MOCK_SLA
} from './services/mockData';
import { api } from './services/api';

const useApi = api.isConfigured();

const load = <T,>(key: string, defaultValue: T): T => {
  const saved = localStorage.getItem(key);
  if (!saved) return defaultValue;
  try { return JSON.parse(saved); } catch { return defaultValue; }
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => (useApi ? null : load('helix_user', null)));
  const [users, setUsers] = useState<User[]>(() => (useApi ? [] : load('helix_users', MOCK_USERS)));
  const [tickets, setTickets] = useState<Ticket[]>(() => (useApi ? [] : load('helix_tickets', [])));
  const [departments, setDepartments] = useState<Department[]>(() => (useApi ? [] : load('helix_depts', MOCK_DEPARTMENTS)));
  const [issues, setIssues] = useState<IssueMaster[]>(() => (useApi ? [] : load('helix_issues', MOCK_ISSUES)));
  const [slaRules, setSlaRules] = useState<SLAMaster[]>(() => (useApi ? [] : load('helix_sla', MOCK_SLA)));
  const [applications, setApplications] = useState<Application[]>(() => (useApi ? [] : load('helix_apps', MOCK_APPLICATIONS)));
  const [patients, setPatients] = useState<Patient[]>(() => (useApi ? [] : load('helix_patients', [])));
  const [workflow, setWorkflow] = useState<WorkflowRule[]>(() => (useApi ? [] : load('helix_workflow', MOCK_WORKFLOW)));
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const fetchAllFromApi = useCallback(async () => {
    if (!useApi) return;
    setApiError(null);
    try {
      const [u, d, a, i, s, w, p, t] = await Promise.all([
        api.getUsers(), api.getDepartments(), api.getApplications(), api.getIssues(),
        api.getSla(), api.getWorkflow(), api.getPatients(), api.getTickets()
      ]);
      setUsers(u as User[]);
      setDepartments(d as Department[]);
      setApplications(a as Application[]);
      setIssues(i as IssueMaster[]);
      setSlaRules(s as SLAMaster[]);
      setWorkflow(w as WorkflowRule[]);
      setPatients(p as Patient[]);
      setTickets(t as Ticket[]);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Failed to load data from server');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (useApi) {
      api.health().then(() => fetchAllFromApi()).catch(() => fetchAllFromApi());
    } else {
      const timer = setTimeout(() => setIsLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [useApi, fetchAllFromApi]);

  useEffect(() => {
    if (useApi) return;
    localStorage.setItem('helix_users', JSON.stringify(users));
    localStorage.setItem('helix_tickets', JSON.stringify(tickets));
    localStorage.setItem('helix_depts', JSON.stringify(departments));
    localStorage.setItem('helix_issues', JSON.stringify(issues));
    localStorage.setItem('helix_sla', JSON.stringify(slaRules));
    localStorage.setItem('helix_apps', JSON.stringify(applications));
    localStorage.setItem('helix_patients', JSON.stringify(patients));
    localStorage.setItem('helix_workflow', JSON.stringify(workflow));
    if (currentUser) localStorage.setItem('helix_user', JSON.stringify(currentUser));
    else localStorage.removeItem('helix_user');
  }, [useApi, users, tickets, departments, issues, slaRules, applications, patients, workflow, currentUser]);

  const handleCreateTicket = async (data: any): Promise<Ticket> => {
    const newId = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
    const initialLog: Comment = {
      id: `log-${Date.now()}`,
      userId: currentUser?.id || 'system',
      userName: currentUser?.name || 'System',
      text: `Ticket created and initialized. Status set to Yet to Start.`,
      createdAt: new Date().toISOString(),
      isInternal: false
    };
    const newTicket: Ticket = {
      id: newId,
      requesterId: currentUser?.id || 'unknown',
      requesterName: currentUser?.name || 'Unknown',
      requesterPhone: data.phone,
      app: data.app,
      type: data.type || TicketType.INCIDENT,
      issueCode: data.issue.code,
      issueName: data.issue.name,
      summary: data.summary,
      description: data.description,
      status: TicketStatus.NEW,
      priority: data.priority || data.issue.priority,
      assigneeId: data.assigneeId || data.issue.assigneeIds?.[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      slaLevel: 1,
      isEscalated: false,
      comments: [initialLog],
      attachments: data.attachments || []
    };
    if (useApi) {
      try {
        const created = await api.postTicket(newTicket) as Ticket;
        setTickets(prev => [created, ...prev]);
        window.location.hash = '#/my-tickets';
        return created;
      } catch (err) {
        console.warn('Ticket API failed, saving locally:', err);
        setTickets(prev => [newTicket, ...prev]);
        window.location.hash = '#/my-tickets';
        return newTicket;
      }
    }
    setTickets(prev => [newTicket, ...prev]);
    window.location.hash = '#/my-tickets';
    return newTicket;
  };

  const handleUpdateTicket = async (id: string, updates: Partial<Ticket>) => {
    if (useApi) {
      const t = tickets.find(x => x.id === id);
      if (!t) return;
      const merged = { ...t, ...updates, updatedAt: new Date().toISOString() };
      const updated = await api.putTicket(id, merged) as Ticket;
      setTickets(prev => prev.map(x => x.id === id ? updated : x));
      return;
    }
    setTickets(prev => prev.map(t => t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t));
  };

  const handleAddComment = async (ticketId: string, text: string) => {
    const newComment: Comment = {
      id: `cmt-${Date.now()}`,
      userId: currentUser?.id || 'unknown',
      userName: currentUser?.name || 'Unknown',
      text,
      createdAt: new Date().toISOString(),
      isInternal: text.includes('INTERNAL') || text.includes('SYSTEM')
    };
    if (useApi) {
      const saved = await api.postTicketComment(ticketId, newComment) as Comment;
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, comments: [...t.comments, saved], updatedAt: new Date().toISOString() } : t));
      return;
    }
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, comments: [...t.comments, newComment], updatedAt: new Date().toISOString() } : t));
  };

  const handleAddUser = (user: User) => {
    if (useApi) api.postUser(user).then((u: User) => setUsers(prev => [u, ...prev]));
    else setUsers(prev => [user, ...prev]);
  };
  const handleUpdateUser = (id: string, updates: Partial<User>) => {
    if (useApi) {
      const u = users.find(x => x.id === id);
      if (u) api.putUser(id, { ...u, ...updates }).then((updated: User) => setUsers(prev => prev.map(x => x.id === id ? updated : x)));
    } else setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
  };
  const handleDeleteUser = (id: string) => {
    if (useApi) {
      api.deleteUser(id)
        .then(() => setUsers(prev => prev.filter(u => u.id !== id)))
        .catch((err) => window.alert(err instanceof Error ? err.message : 'Failed to delete user. They may be assigned to tickets or issues.'));
    } else {
      setUsers(prev => prev.filter(u => u.id !== id));
    }
  };

  const handleAddDepartment = (dept: Department) => {
    if (useApi) api.postDepartment(dept).then((d: Department) => setDepartments(prev => [d, ...prev]));
    else setDepartments(prev => [dept, ...prev]);
  };
  const handleUpdateDepartment = (code: string, updates: Partial<Department>) => {
    if (useApi) {
      const d = departments.find(x => x.code === code);
      if (d) api.putDepartment(code, { ...d, ...updates }).then((updated: Department) => setDepartments(prev => prev.map(x => x.code === code ? updated : x)));
    } else setDepartments(prev => prev.map(d => d.code === code ? { ...d, ...updates } : d));
  };
  const handleDeleteDepartment = (code: string) => {
    if (useApi) api.deleteDepartment(code).then(() => setDepartments(prev => prev.filter(d => d.code !== code)));
    else setDepartments(prev => prev.filter(d => d.code !== code));
  };

  const handleAddIssue = (issue: IssueMaster) => {
    if (useApi) api.postIssue(issue).then((i: IssueMaster) => setIssues(prev => [i, ...prev]));
    else setIssues(prev => [issue, ...prev]);
  };
  const handleUpdateIssue = (code: string, updates: Partial<IssueMaster>) => {
    if (useApi) {
      const i = issues.find(x => x.code === code);
      if (i) api.putIssue(code, { ...i, ...updates }).then((updated: IssueMaster) => setIssues(prev => prev.map(x => x.code === code ? updated : x)));
    } else setIssues(prev => prev.map(i => i.code === code ? { ...i, ...updates } : i));
  };
  const handleDeleteIssue = (code: string) => {
    if (useApi) {
      api.deleteIssue(code)
        .then(() => setIssues(prev => prev.filter(i => i.code !== code)))
        .catch((err) => window.alert(err instanceof Error ? err.message : 'Failed to delete issue.'));
    } else {
      setIssues(prev => prev.filter(i => i.code !== code));
    }
  };

  const handleAddSLA = (rule: SLAMaster) => {
    if (useApi) api.postSla(rule).then((s: SLAMaster) => setSlaRules(prev => [s, ...prev]));
    else setSlaRules(prev => [rule, ...prev]);
  };
  const handleUpdateSLA = (id: string, updates: Partial<SLAMaster>) => {
    if (useApi) {
      const s = slaRules.find(x => x.id === id);
      if (s) api.putSla(id, { ...s, ...updates }).then((updated: SLAMaster) => setSlaRules(prev => prev.map(x => x.id === id ? updated : x)));
    } else setSlaRules(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };
  const handleDeleteSLA = (id: string) => {
    if (useApi) api.deleteSla(id).then(() => setSlaRules(prev => prev.filter(s => s.id !== id)));
    else setSlaRules(prev => prev.filter(s => s.id !== id));
  };

  const handleAddApp = (app: Application) => {
    if (useApi) api.postApplication(app).then((a: Application) => setApplications(prev => [a, ...prev]));
    else setApplications(prev => [app, ...prev]);
  };
  const handleUpdateApp = (id: string, updates: Partial<Application>) => {
    if (useApi) {
      const a = applications.find(x => x.id === id);
      if (a) api.putApplication(id, { ...a, ...updates }).then((updated: Application) => setApplications(prev => prev.map(x => x.id === id ? updated : x)));
    } else setApplications(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };
  const handleDeleteApp = (id: string) => {
    if (useApi) api.deleteApplication(id).then(() => setApplications(prev => prev.filter(a => a.id !== id)));
    else setApplications(prev => prev.filter(a => a.id !== id));
  };

  const handleAddPatient = async (patient: Patient) => {
    if (useApi) api.postPatient(patient).then((p: Patient) => setPatients(prev => [p, ...prev]));
    else setPatients(prev => [patient, ...prev]);
  };

  const handleLogin = async (email: string, pass: string): Promise<boolean> => {
    if (useApi) {
      try {
        const user = await api.login(email, pass) as User;
        setCurrentUser(user);
        return true;
      } catch {
        return false;
      }
    }
    const userMatch = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (userMatch && userMatch.password === pass) {
      setCurrentUser(userMatch);
      return true;
    }
    return false;
  };

  const handleLogout = async () => {
    setCurrentUser(null);
  };

  if (isLoading && !apiError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-medium text-slate-500">
        {useApi ? 'Connecting to database...' : 'Initializing Local Workspace...'}
      </div>
    );
  }
  if (useApi && apiError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
        <p className="text-red-600 font-medium mb-2">Cannot connect to server</p>
        <p className="text-slate-600 text-sm mb-4">{apiError}</p>
        <button
          type="button"
          onClick={() => { setIsLoading(true); fetchAllFromApi(); }}
          className="px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-800"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <HashRouter>
      {!currentUser ? (
        <Routes><Route path="*" element={<Login onLogin={handleLogin} />} /></Routes>
      ) : (
        <Layout 
          currentUser={currentUser} 
          onLogout={handleLogout}
          tickets={tickets}
          users={users}
          issues={issues}
          applications={applications}
          onCreateTicket={handleCreateTicket}
        >
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard tickets={tickets} applications={applications} currentUser={currentUser!} users={users} departments={departments} issues={issues} onCreateTicket={handleCreateTicket} />} />
            <Route path="/chat" element={
              <div className="max-w-4xl mx-auto py-8">
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-slate-800">AI Support Desk</h1>
                  <p className="text-slate-500">Describe your issue and let our AI handle the rest.</p>
                </div>
                <AITriageChat 
                  currentUser={currentUser!} 
                  issues={issues} 
                  applications={applications} 
                  tickets={tickets}
                  users={users}
                  onCreateTicket={handleCreateTicket} 
                />
              </div>
            } />
            <Route path="/create" element={<TicketForm currentUser={currentUser!} issues={issues} users={users} applications={applications} tickets={tickets} onSubmit={handleCreateTicket} />} />
            <Route path="/my-tickets" element={<TicketList tickets={tickets} currentUser={currentUser!} users={users} />} />
            <Route path="/ticket/:id" element={<TicketDetail tickets={tickets} users={users} currentUser={currentUser!} onUpdateTicket={handleUpdateTicket} onAddComment={handleAddComment} />} />
            <Route path="/patients" element={<PatientManager patients={patients} currentUser={currentUser} onAddPatient={handleAddPatient} />} />
            <Route path="/admin" element={
              currentUser?.role === UserRole.ADMIN 
                ? <AdminPanel 
                    currentUser={currentUser} workflow={workflow} users={users} tickets={tickets} departments={departments} issues={issues} slaRules={slaRules} applications={applications}
                    onAddUser={handleAddUser} onUpdateUser={handleUpdateUser} onDeleteUser={handleDeleteUser}
                    onAddDepartment={handleAddDepartment} onUpdateDepartment={handleUpdateDepartment} onDeleteDepartment={handleDeleteDepartment}
                    onAddIssue={handleAddIssue} onUpdateIssue={handleUpdateIssue} onDeleteIssue={handleDeleteIssue}
                    onAddSLA={handleAddSLA} onUpdateSLA={handleUpdateSLA} onDeleteSLA={handleDeleteSLA}
                    onAddApp={handleAddApp} onUpdateApp={handleUpdateApp} onDeleteApp={handleDeleteApp}
                  /> 
                : <Navigate to="/" />
            } />
          </Routes>
        </Layout>
      )}
    </HashRouter>
  );
};

export default App;
