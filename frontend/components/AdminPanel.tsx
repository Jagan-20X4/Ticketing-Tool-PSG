
import React, { useState } from 'react';
import { User, WorkflowRule, TicketType, UserRole, Department, IssueMaster, SLAMaster, Priority, Application, Ticket } from '../types';
import * as LucideIcons from 'lucide-react';
import { 
  Users, 
  Building2, 
  Plus, 
  List,
  Edit2,
  Trash2,
  Clock,
  LayoutGrid,
  HelpCircle,
  X,
  CheckCircle2
} from 'lucide-react';

interface AdminPanelProps {
  currentUser: User;
  workflow: WorkflowRule[];
  users: User[];
  tickets: Ticket[];
  departments: Department[];
  issues: IssueMaster[];
  slaRules: SLAMaster[];
  applications: Application[];
  onAddUser: (user: User) => void;
  onUpdateUser: (id: string, user: Partial<User>) => void;
  onDeleteUser: (id: string) => void;
  onAddDepartment: (dept: Department) => void;
  onUpdateDepartment: (code: string, dept: Partial<Department>) => void;
  onDeleteDepartment: (code: string) => void;
  onAddIssue: (issue: IssueMaster) => void;
  onUpdateIssue: (code: string, issue: Partial<IssueMaster>) => void;
  onDeleteIssue: (code: string) => void;
  onAddSLA: (rule: SLAMaster) => void;
  onUpdateSLA: (id: string, rule: Partial<SLAMaster>) => void;
  onDeleteSLA: (id: string) => void;
  onAddApp: (app: Application) => void;
  onUpdateApp: (id: string, app: Partial<Application>) => void;
  onDeleteApp: (id: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  currentUser, users = [], tickets = [], departments = [], issues = [], slaRules = [], applications = [],
  onAddUser, onUpdateUser, onDeleteUser,
  onAddDepartment, onUpdateDepartment, onDeleteDepartment,
  onAddIssue, onUpdateIssue, onDeleteIssue,
  onAddSLA, onUpdateSLA, onDeleteSLA,
  onAddApp, onUpdateApp, onDeleteApp
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'departments' | 'apps' | 'issues' | 'sla'>('users');

  // Modal Control States
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showAppModal, setShowAppModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showSlaModal, setShowSlaModal] = useState(false);

  // Editing States
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Data States
  const [userFormData, setUserFormData] = useState<Partial<User>>({});
  const [deptFormData, setDeptFormData] = useState<Partial<Department>>({});
  const [appFormData, setAppFormData] = useState<Partial<Application>>({});
  const [issueFormData, setIssueFormData] = useState<Partial<IssueMaster>>({});
  const [slaFormData, setSlaFormData] = useState<Partial<SLAMaster>>({});

  // Icons Helper
  const getSafeIcon = (iconComponent: any, size = 18, className = "") => {
    const Icon = iconComponent || HelpCircle;
    return <Icon size={size} className={className} />;
  };

  const getUserName = (id: string) => users.find(u => u.id === id)?.name || 'N/A';

  const ICON_PRESETS = [
    'Box', 'Database', 'Monitor', 'Globe', 'ShoppingCart', 'DollarSign', 
    'Activity', 'Shield', 'Mail', 'Users', 'Settings', 'Key', 'Server', 
    'HardDrive', 'Cloud', 'Cpu', 'Zap', 'MessageSquare', 'Smartphone', 'Layers',
    'Package', 'FileText', 'Briefcase', 'CreditCard'
  ];

  const APP_COLOR_PRESETS = [
    { label: 'Blue', value: 'bg-blue-900/10 text-blue-400 border-blue-900/50' },
    { label: 'Emerald', value: 'bg-emerald-900/10 text-emerald-400 border-emerald-900/50' },
    { label: 'Orange', value: 'bg-orange-900/10 text-orange-400 border-orange-900/50' },
    { label: 'Red', value: 'bg-red-900/10 text-red-400 border-red-900/50' },
    { label: 'Purple', value: 'bg-purple-900/10 text-purple-400 border-purple-800/50' },
    { label: 'Indigo', value: 'bg-indigo-900/10 text-indigo-400 border-indigo-900/50' },
  ];

  // --- HANDLERS ---

  const handleOpenUserModal = (user?: User) => {
    setEditingId(user ? user.id : null);
    setUserFormData(user || { id: '', name: '', email: '', phone: '', role: UserRole.REQUESTER, department: '', location: '', password: 'password123' });
    setShowUserModal(true);
  };

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      onUpdateUser(editingId, userFormData);
    } else {
      onAddUser(userFormData as User);
    }
    setShowUserModal(false);
  };

  const handleOpenDeptModal = (dept?: Department) => {
    setEditingId(dept ? dept.code : null);
    setDeptFormData(dept || { code: '', name: '', status: 'Active' });
    setShowDeptModal(true);
  };

  const handleOpenAppModal = (app?: Application) => {
    setEditingId(app ? app.id : null);
    setAppFormData(app || { 
      id: '', 
      name: '', 
      icon: 'Box', 
      color: 'bg-blue-900/10 text-blue-400 border-blue-900/50', 
      status: 'Active' 
    });
    setShowAppModal(true);
  };

  const handleAppSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      onUpdateApp(editingId, appFormData);
    } else {
      onAddApp(appFormData as Application);
    }
    setShowAppModal(false);
  };

  const handleConfirmDeleteApp = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the application: "${name}"? This will affect all linked issues.`)) {
      onDeleteApp(id);
    }
  };

  const handleConfirmDeleteUser = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the user "${name}"?`)) {
      onDeleteUser(id);
    }
  };

  const handleConfirmDeleteIssue = (code: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the issue "${name}" (${code})?`)) {
      onDeleteIssue(code);
    }
  };

  const handleOpenIssueModal = (issue?: IssueMaster) => {
    setEditingId(issue ? issue.code : null);
    setIssueFormData(issue || { 
      code: '', 
      name: '', 
      app: '', 
      category: TicketType.INCIDENT, 
      priority: Priority.MEDIUM, 
      assigneeIds: [], 
      slaHours: 8, 
      status: 'Active' 
    });
    setShowIssueModal(true);
  };

  const updateSlaHoursByPriority = (priority: Priority) => {
    let hours = 8;
    switch (priority) {
      case Priority.CRITICAL: hours = 2; break;
      case Priority.HIGH: hours = 4; break;
      case Priority.MEDIUM: hours = 8; break;
      case Priority.LOW: hours = 24; break;
    }
    setIssueFormData(prev => ({ ...prev, priority, slaHours: hours }));
  };

  const handleIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      onUpdateIssue(editingId, issueFormData);
    } else {
      onAddIssue(issueFormData as IssueMaster);
    }
    setShowIssueModal(false);
  };

  const handleOpenSlaModal = (rule?: SLAMaster) => {
    setEditingId(rule ? rule.id : null);
    setSlaFormData(rule || { id: `sla-${Date.now()}`, priority: Priority.MEDIUM, ticketType: TicketType.INCIDENT, resolutionTimeHours: 24, autoEscalate: false });
    setShowSlaModal(true);
  };

  // Refined Assignee Filtering Logic to satisfy strict department matching across all app types
  const getFilteredAssignees = () => {
    if (!issueFormData.app) return [];
    
    const selectedApp = applications.find(a => a.id === issueFormData.app);
    if (!selectedApp) return [];

    const appId = selectedApp.id.toLowerCase();
    const appName = selectedApp.name.toLowerCase();

    return users.filter(u => {
      if (u.role !== UserRole.ASSIGNEE) return false;
      const dept = u.department.toLowerCase();

      // Check for direct department name matches with App ID or App Name
      const isDirectMatch = dept.includes(appId) || 
                            appId.includes(dept) || 
                            dept.includes(appName) || 
                            appName.includes(dept);

      // RPA matching - robust keyword handling for typos (e.g. 'Procees')
      const isRPAMatch = (appId.includes('rpa') || appName.includes('robotic') || appName.includes('automation') || appName.includes('rpa')) && 
                         (dept.includes('robotic') || dept.includes('automation') || dept.includes('rpa'));

      // Finance business logic mapping: P2P and Eshopaid
      const isFinanceMatch = (appId === 'p2p' || appId === 'eshopaid' || appName.includes('finance') || appName.includes('p2p') || appName.includes('eshopaid')) && 
                             (dept.includes('finance') || dept.includes('accounts'));
      
      // HIS maps strictly to HIS department keywords
      const isHISMatch = (appId === 'his' || appName.includes('his')) && (dept.includes('his') || dept.includes('hospital'));

      // Website maps strictly to Website keywords
      const isWebsiteMatch = (appId.includes('website') || appName.includes('website') || appName.includes('cms')) && 
                             (dept.includes('website') || dept.includes('marketing'));

      // IT infrastructure apps map to IT keywords
      const isITMatch = (appId === 'it' || appName.includes('infrastructure')) && (dept.includes('it') || dept.includes('infra'));

      return isDirectMatch || isRPAMatch || isFinanceMatch || isHISMatch || isWebsiteMatch || isITMatch;
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] text-slate-300 p-2 md:p-6 space-y-8 animate-in fade-in duration-500">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold text-white tracking-tight">System Administration</h1>
        <p className="text-slate-500 text-sm">Manage users, departments, applications, and configurations.</p>
      </div>

      <div className="border-b border-slate-800/60 overflow-x-auto">
        <nav className="flex space-x-12 pb-px px-1">
          {[
            { id: 'users', label: 'User Management', icon: Users },
            { id: 'departments', label: 'Departments', icon: Building2 },
            { id: 'apps', label: 'Applications', icon: LayoutGrid },
            { id: 'issues', label: 'Issues', icon: List },
            { id: 'sla', label: 'SLA Rules', icon: Clock }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-5 px-1 border-b-2 font-medium text-sm flex items-center whitespace-nowrap transition-all tracking-wide
                ${activeTab === tab.id 
                  ? 'border-blue-500 text-blue-500' 
                  : 'border-transparent text-slate-500 hover:text-slate-300'}
              `}
            >
              <span className="mr-3">{getSafeIcon(tab.icon, 20)}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex justify-between items-end px-1">
            <div className="text-sm font-medium text-slate-500">Total Users: {users.length}</div>
            <button onClick={() => handleOpenUserModal()} className="px-6 py-2.5 bg-[#2563eb] text-white rounded-lg flex items-center text-sm font-semibold shadow-lg hover:bg-blue-600 active:scale-95 transition-all">
              <Plus size={18} className="mr-2" /> Create User
            </button>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-800/40">
            <table className="w-full text-left border-collapse bg-[#0f1115]">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-widest bg-slate-800/10">
                  <th className="px-6 py-4">Employee ID</th>
                  <th className="px-6 py-4">Name & Contact</th>
                  <th className="px-6 py-4 text-center">Role</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {users.map(u => (
                  <tr key={u.id} className="group hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-6 text-sm font-medium text-white">{u.id}</td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white tracking-tight">{u.name}</span>
                        <span className="text-xs text-slate-500 mt-0.5">{u.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <span className={`inline-block px-3 py-1 rounded-md text-[11px] font-bold uppercase border tracking-tight 
                        ${u.role === UserRole.ADMIN ? 'bg-purple-900/30 text-purple-400 border-purple-800/50' : 
                          u.role === UserRole.ASSIGNEE ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50' : 'bg-blue-900/30 text-blue-400 border-blue-800/50'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-sm text-slate-300 font-medium">{u.department}</td>
                    <td className="px-6 py-6 text-right">
                      <div className="flex justify-end space-x-4 text-slate-500">
                        <button type="button" onClick={() => handleOpenUserModal(u)} className="hover:text-blue-400 transition-colors p-1" title="Edit"><Edit2 size={18} /></button>
                        <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleConfirmDeleteUser(u.id, u.name); }} className="hover:text-red-500 transition-colors p-1" title="Delete"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'departments' && (
        <div className="space-y-6">
          <div className="flex justify-between items-end px-1">
             <div className="text-sm font-medium text-slate-500">Departments Configured: {departments.length}</div>
             <button onClick={() => handleOpenDeptModal()} className="px-6 py-2.5 bg-[#2563eb] text-white rounded-lg flex items-center text-sm font-semibold shadow-lg hover:bg-blue-600 transition-all"><Plus size={18} className="mr-2" /> Create Department</button>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-800/40">
            <table className="w-full text-left border-collapse bg-[#0f1115]">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-widest bg-slate-800/10">
                  <th className="px-10 py-5">Code</th>
                  <th className="px-10 py-5">Department Name</th>
                  <th className="px-10 py-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {departments.map(d => (
                  <tr key={d.code} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-10 py-8 text-sm font-bold text-white tracking-tight font-mono">{d.code}</td>
                    <td className="px-10 py-8 text-sm text-slate-300">{d.name}</td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex justify-end space-x-6 text-slate-500">
                        <button onClick={() => handleOpenDeptModal(d)} className="hover:text-white transition-colors"><Edit2 size={20}/></button>
                        <button onClick={() => onDeleteDepartment(d.code)} className="hover:text-red-500 transition-colors"><Trash2 size={20}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'apps' && (
        <div className="space-y-6">
          <div className="flex justify-between items-end px-1">
             <div className="text-sm font-medium text-slate-500">Business Applications: {applications.length}</div>
             <button onClick={() => handleOpenAppModal()} className="px-6 py-2.5 bg-[#2563eb] text-white rounded-lg flex items-center text-sm font-semibold shadow-lg hover:bg-blue-600 transition-all"><Plus size={18} className="mr-2" /> Register App</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {applications.map(app => (
              <div key={app.id} className="bg-[#0f1115] border border-slate-800 rounded-2xl p-6 hover:border-blue-500/50 transition-all group relative overflow-hidden flex flex-col justify-between min-h-[160px]">
                <div className={`absolute top-0 right-0 p-4 opacity-10`}>{getSafeIcon((LucideIcons as any)[app.icon], 80)}</div>
                <div className="relative z-10 flex items-center space-x-4 mb-4">
                   <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${app.color} border shadow-sm`}>
                      {getSafeIcon((LucideIcons as any)[app.icon], 24)}
                   </div>
                   <div>
                      <h3 className="text-lg font-bold text-white leading-tight">{app.name}</h3>
                      <span className="text-xs font-mono text-slate-500 uppercase">{app.id}</span>
                   </div>
                </div>
                <div className="relative z-10 flex items-center justify-between mt-auto">
                   <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded border ${app.status === 'Active' ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/50' : 'bg-red-950/20 text-red-400 border-red-900/50'}`}>
                     {app.status}
                   </span>
                   <div className="flex space-x-1">
                      <button onClick={() => handleOpenAppModal(app)} className="p-2 text-slate-500 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors" title="Edit App"><Edit2 size={18}/></button>
                      <button onClick={() => handleConfirmDeleteApp(app.id, app.name)} className="p-2 text-slate-500 hover:text-red-500 hover:bg-slate-800 rounded-lg transition-colors" title="Delete App"><Trash2 size={18}/></button>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'issues' && (
        <div className="space-y-6">
          <div className="flex justify-between items-end px-1">
            <div className="text-sm font-medium text-slate-500">Issue Catalog: {issues.length}</div>
            <button onClick={() => handleOpenIssueModal()} className="px-6 py-2.5 bg-[#2563eb] text-white rounded-lg flex items-center text-sm font-semibold shadow-lg hover:bg-blue-600 transition-all"><Plus size={18} className="mr-2" /> New Issue</button>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-800/40">
             <table className="w-full text-left border-collapse bg-[#0f1115]">
                <thead>
                   <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-widest bg-slate-800/10">
                      <th className="px-6 py-4">App Context</th>
                      <th className="px-6 py-4">Issue Name</th>
                      <th className="px-6 py-4">Default Assignee</th>
                      <th className="px-6 py-4">SLA Hours</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                   {issues.map(i => (
                     <tr key={i.code} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-6 text-xs font-bold text-blue-400 uppercase tracking-wider">{i.app}</td>
                        <td className="px-6 py-6">
                           <div className="text-sm font-bold text-white">{i.name}</div>
                           <div className="text-[10px] text-slate-500 font-mono mt-0.5">{i.code}</div>
                        </td>
                        <td className="px-6 py-6 text-sm text-slate-300">
                           {i.assigneeIds && i.assigneeIds.length > 0 ? getUserName(i.assigneeIds[0]) : 'None'}
                        </td>
                        <td className="px-6 py-6 text-sm text-white font-mono font-bold">{i.slaHours}h</td>
                        <td className="px-6 py-6 text-right">
                           <div className="flex justify-end space-x-4 text-slate-500">
                             <button type="button" onClick={() => handleOpenIssueModal(i)} className="hover:text-blue-400 transition-colors p-1" title="Edit"><Edit2 size={18}/></button>
                             <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleConfirmDeleteIssue(i.code, i.name); }} className="hover:text-red-500 transition-colors p-1" title="Delete"><Trash2 size={18}/></button>
                           </div>
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
          </div>
        </div>
      )}

      {activeTab === 'sla' && (
        <div className="space-y-6">
          <div className="flex justify-between items-end px-1">
            <div className="text-sm font-medium text-slate-500 font-mono">Rules: {slaRules.length}</div>
            <button onClick={() => handleOpenSlaModal()} className="px-6 py-2.5 bg-[#2563eb] text-white rounded-lg flex items-center text-sm font-semibold shadow-lg hover:bg-blue-600 transition-all active:scale-95">
              <Plus size={18} className="mr-2" /> Add Rule
            </button>
          </div>
          <div className="overflow-x-auto rounded-lg border border-slate-800/40">
            <table className="w-full text-left border-collapse bg-[#0f1115]">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-widest bg-slate-800/10">
                  <th className="px-10 py-5">Priority</th>
                  <th className="px-10 py-5">Type</th>
                  <th className="px-10 py-5">Hours</th>
                  <th className="px-10 py-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {slaRules.map(rule => (
                  <tr key={rule.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-10 py-8 text-sm font-bold text-white tracking-tight">{rule.priority}</td>
                    <td className="px-10 py-8 text-sm text-slate-400">{rule.ticketType}</td>
                    <td className="px-10 py-8 text-sm font-bold text-white font-mono">{rule.resolutionTimeHours}</td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex justify-end space-x-6 text-slate-500">
                        <button onClick={() => handleOpenSlaModal(rule)} className="hover:text-white transition-colors" title="Edit"><Edit2 size={20} /></button>
                        <button onClick={() => onDeleteSLA(rule.id)} className="hover:text-red-500 transition-colors" title="Delete"><Trash2 size={20} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- MODALS --- */}

      {/* User Management Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121418] border border-slate-800 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800/60 bg-[#16191f]">
               <h3 className="text-lg font-semibold text-white tracking-wide">{editingId ? 'Edit User' : 'Create User'}</h3>
               <button onClick={() => setShowUserModal(false)} className="text-slate-400 hover:text-white transition-colors"><X size={22}/></button>
            </div>
            <form onSubmit={handleUserSubmit} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Employee ID <span className="text-red-500">*</span></label>
                <input type="text" required disabled={!!editingId} value={userFormData.id} onChange={e => setUserFormData({...userFormData, id: e.target.value})} className="w-full bg-[#2a2d34] border border-slate-700/50 rounded-lg px-4 py-2.5 text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all disabled:opacity-50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Name <span className="text-red-500">*</span></label>
                  <input type="text" required value={userFormData.name} onChange={e => setUserFormData({...userFormData, name: e.target.value})} className="w-full bg-[#2a2d34] border border-slate-700/50 rounded-lg px-4 py-2.5 text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Email <span className="text-red-500">*</span></label>
                  <input type="email" required value={userFormData.email} onChange={e => setUserFormData({...userFormData, email: e.target.value})} className="w-full bg-[#2a2d34] border border-slate-700/50 rounded-lg px-4 py-2.5 text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Phone</label>
                  <input type="tel" value={userFormData.phone} onChange={e => setUserFormData({...userFormData, phone: e.target.value})} className="w-full bg-[#2a2d34] border border-slate-700/50 rounded-lg px-4 py-2.5 text-white text-sm focus:border-blue-500 outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Password <span className="text-red-500">*</span></label>
                  <input type="password" required value={userFormData.password || ''} onChange={e => setUserFormData({...userFormData, password: e.target.value})} className="w-full bg-[#2a2d34] border border-slate-700/50 rounded-lg px-4 py-2.5 text-white text-sm focus:border-blue-500 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Role <span className="text-red-500">*</span></label>
                  <select required value={userFormData.role} onChange={e => setUserFormData({...userFormData, role: e.target.value as UserRole})} className="w-full bg-[#2a2d34] border border-slate-700/50 rounded-lg px-3 py-2.5 text-white text-sm focus:border-blue-500 outline-none appearance-none cursor-pointer">
                    {Object.values(UserRole).map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Department <span className="text-red-500">*</span></label>
                  <select required value={userFormData.department} onChange={e => setUserFormData({...userFormData, department: e.target.value})} className="w-full bg-[#2a2d34] border border-slate-700/50 rounded-lg px-3 py-2.5 text-white text-sm focus:border-blue-500 outline-none appearance-none cursor-pointer">
                    <option value="">-- Select --</option>
                    {departments.map(d => <option key={d.code} value={d.name}>{d.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-slate-800/60">
                <button type="button" onClick={() => setShowUserModal(false)} className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-300 bg-[#2a2d34] hover:bg-[#32363e] border border-slate-700">Cancel</button>
                <button type="submit" className="px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md">Save User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ISSUE TYPE MODAL - Precision Design Matching Screenshot & Request */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121418] border border-slate-800 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800/60 bg-[#16191f]">
              <h3 className="text-lg font-semibold text-white tracking-wide">{editingId ? 'Edit Issue Type' : 'Add Issue Type'}</h3>
              <button onClick={() => setShowIssueModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={22}/>
              </button>
            </div>
            
            <form onSubmit={handleIssueSubmit} className="p-6 space-y-4">
              {/* Row 1: Code and Application */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Code <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    required 
                    disabled={!!editingId} 
                    placeholder="Enter Code"
                    value={issueFormData.code} 
                    onChange={e => setIssueFormData({...issueFormData, code: e.target.value.toUpperCase()})} 
                    className="w-full bg-[#2a2d34] border border-slate-700/50 rounded-lg px-4 py-2.5 text-white text-sm focus:border-blue-500 outline-none transition-all disabled:opacity-50" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Application <span className="text-red-500">*</span>
                  </label>
                  <select 
                    required 
                    value={issueFormData.app} 
                    onChange={e => setIssueFormData({...issueFormData, app: e.target.value, assigneeIds: []})} 
                    className="w-full bg-[#2a2d34] border border-slate-700/50 rounded-lg px-3 py-2.5 text-white text-sm focus:border-blue-500 outline-none cursor-pointer appearance-none"
                  >
                    <option value="">-- Select App --</option>
                    {applications.map(app => (
                      <option key={app.id} value={app.id}>{app.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Issue Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Issue Name <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  required 
                  placeholder="Enter Issue Name"
                  value={issueFormData.name} 
                  onChange={e => setIssueFormData({...issueFormData, name: e.target.value})} 
                  className="w-full bg-[#2a2d34] border border-slate-700/50 rounded-lg px-4 py-2.5 text-white text-sm focus:border-blue-500 outline-none" 
                />
              </div>

              {/* Row 3: Incident (Category) */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Incident <span className="text-red-500">*</span>
                </label>
                <select 
                  required 
                  value={issueFormData.category} 
                  onChange={e => setIssueFormData({...issueFormData, category: e.target.value as TicketType})} 
                  className="w-full bg-[#2a2d34] border border-slate-700/50 rounded-lg px-3 py-2.5 text-white text-sm focus:border-blue-500 outline-none appearance-none cursor-pointer"
                >
                  {Object.values(TicketType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {/* Row 4: Priority */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Priority <span className="text-red-500">*</span>
                </label>
                <select 
                  required 
                  value={issueFormData.priority} 
                  onChange={e => updateSlaHoursByPriority(e.target.value as Priority)} 
                  className="w-full bg-[#2a2d34] border border-slate-700/50 rounded-lg px-3 py-2.5 text-white text-sm focus:border-blue-500 outline-none appearance-none cursor-pointer"
                >
                  {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              {/* Row 5: Default Assignee - Dynamic Filtering with Strict Department Logic (Fixed for RPA) */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Default Assignee
                </label>
                <select 
                  value={issueFormData.assigneeIds?.[0] || ''} 
                  onChange={e => setIssueFormData({...issueFormData, assigneeIds: [e.target.value]})} 
                  className="w-full bg-[#2a2d34] border border-slate-700/50 rounded-lg px-3 py-2.5 text-white text-sm focus:border-blue-500 outline-none appearance-none cursor-pointer"
                >
                  <option value="">-- Select Assignee --</option>
                  {getFilteredAssignees().length > 0 ? (
                    getFilteredAssignees().map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.department})</option>
                    ))
                  ) : (
                    issueFormData.app && <option disabled value="">No assignee assigned yet</option>
                  )}
                  {!issueFormData.app && <option disabled value="">Please select an application first</option>}
                </select>
              </div>

              {/* Row 6: SLA Hours - Automatic mapping from Priority */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  SLA Hours
                </label>
                <input 
                  type="number" 
                  required 
                  placeholder="e.g. 24"
                  value={issueFormData.slaHours} 
                  onChange={e => setIssueFormData({...issueFormData, slaHours: parseInt(e.target.value)})} 
                  className="w-full bg-[#2a2d34] border border-slate-700/50 rounded-lg px-4 py-2.5 text-white text-sm focus:border-blue-500 outline-none" 
                />
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-slate-800/60">
                <button 
                  type="button" 
                  onClick={() => setShowIssueModal(false)} 
                  className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-300 bg-[#2a2d34] hover:bg-[#32363e] border border-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-900/20 active:scale-95 transition-all"
                >
                  {editingId ? 'Update Issue Type' : 'Save Issue Type'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Application Modal */}
      {showAppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1a1d23] border border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-8 space-y-6 animate-in zoom-in duration-200">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">{editingId ? 'Modify Application' : 'Register Application'}</h3>
              <button onClick={() => setShowAppModal(false)} className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"><X size={20}/></button>
            </div>
            <form onSubmit={handleAppSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">ID Code</label>
                  <input type="text" placeholder="e.g. ERP" required disabled={!!editingId} value={appFormData.id} onChange={e => setAppFormData({...appFormData, id: e.target.value.toUpperCase()})} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-white text-sm focus:border-blue-500 disabled:opacity-50" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Icon Name</label>
                  <select value={appFormData.icon} onChange={e => setAppFormData({...appFormData, icon: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-white text-sm focus:border-blue-500">
                    {ICON_PRESETS.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Application Name</label>
                <input type="text" placeholder="e.g. Oracle Financials" required value={appFormData.name} onChange={e => setAppFormData({...appFormData, name: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-white text-sm focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</label>
                  <select value={appFormData.status} onChange={e => setAppFormData({...appFormData, status: e.target.value as 'Active' | 'Inactive'})} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-white text-sm focus:border-blue-500">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Color Preset</label>
                  <select value={appFormData.color} onChange={e => setAppFormData({...appFormData, color: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-white text-sm focus:border-blue-500">
                    {APP_COLOR_PRESETS.map(preset => <option key={preset.value} value={preset.value}>{preset.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-6 border-t border-slate-800">
                <button type="button" onClick={() => setShowAppModal(false)} className="px-6 py-2 text-slate-400 font-bold hover:text-white transition-colors">Cancel</button>
                <button type="submit" className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all flex items-center"><CheckCircle2 size={16} className="mr-2" /> {editingId ? 'Update App' : 'Commit App'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dept Modal */}
      {showDeptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1a1d23] border border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-8 space-y-6">
            <h3 className="text-xl font-bold text-white">{editingId ? 'Edit Dept' : 'New Dept'}</h3>
            <form onSubmit={(e) => { e.preventDefault(); editingId ? onUpdateDepartment(editingId, deptFormData) : onAddDepartment(deptFormData as Department); setShowDeptModal(false); }} className="space-y-4">
              <input type="text" placeholder="Code" required disabled={!!editingId} value={deptFormData.code} onChange={e => setDeptFormData({...deptFormData, code: e.target.value.toUpperCase()})} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-white text-sm focus:border-blue-500" />
              <input type="text" placeholder="Name" required value={deptFormData.name} onChange={e => setDeptFormData({...deptFormData, name: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-white text-sm focus:border-blue-500" />
              <div className="flex justify-end space-x-3 pt-6">
                <button type="button" onClick={() => setShowDeptModal(false)} className="px-6 py-2 text-slate-400">Cancel</button>
                <button type="submit" className="px-8 py-2.5 bg-blue-600 text-white rounded-xl">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SLA Modal */}
      {showSlaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1a1d23] border border-slate-800 rounded-2xl shadow-2xl max-w-sm w-full p-8 space-y-6">
            <h3 className="text-xl font-bold text-white">{editingId ? 'Edit SLA' : 'New SLA'}</h3>
            <form onSubmit={(e) => { e.preventDefault(); editingId ? onUpdateSLA(editingId, slaFormData) : onAddSLA(slaFormData as SLAMaster); setShowSlaModal(false); }} className="space-y-4">
              <select value={slaFormData.priority} onChange={e => setSlaFormData({...slaFormData, priority: e.target.value as Priority})} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-white text-sm focus:border-blue-500">
                {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <input type="number" placeholder="Hours" required value={slaFormData.resolutionTimeHours} onChange={e => setSlaFormData({...slaFormData, resolutionTimeHours: parseInt(e.target.value)})} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-white text-sm focus:border-blue-500" />
              <div className="flex justify-end space-x-3 pt-6">
                <button type="button" onClick={() => setShowSlaModal(false)} className="px-6 py-2 text-slate-400 font-bold hover:text-white">Cancel</button>
                <button type="submit" className="px-8 py-2.5 bg-blue-600 text-white rounded-xl">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
