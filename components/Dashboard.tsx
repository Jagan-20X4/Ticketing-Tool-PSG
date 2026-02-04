
import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { Ticket, TicketStatus, Priority, Application, User, Department, UserRole } from '../types';
import * as LucideIcons from 'lucide-react';
import { 
  AlertCircle, 
  CheckCircle, 
  Activity, 
  Calendar,
  ArrowLeft,
  Timer,
  Filter,
  Users,
  Briefcase
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AITriageChat } from './AITriageChat';

interface DashboardProps {
  tickets: Ticket[];
  applications: Application[];
  currentUser: User;
  users: User[];
  departments: Department[];
  issues: any[];
  onCreateTicket: (data: any) => Promise<void>;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const Dashboard: React.FC<DashboardProps> = ({ tickets, applications, currentUser, users, departments, issues, onCreateTicket }) => {
  const navigate = useNavigate();

  // --- 1. SCOPE DEFINITION ---
  const scopedTickets = useMemo(() => {
    switch (currentUser.role) {
      case UserRole.ADMIN:
        return tickets;
      case UserRole.MANAGER:
        return tickets.filter(t => {
          if (t.assigneeId === currentUser.id) return true;
          if (t.assigneeId) {
            const assignee = users.find(u => u.id === t.assigneeId);
            return assignee?.managerId === currentUser.id;
          }
          return false;
        });
      case UserRole.ASSIGNEE:
        return tickets.filter(t => t.assigneeId === currentUser.id);
      case UserRole.REQUESTER:
        return tickets.filter(t => t.requesterId === currentUser.id);
      default:
        return [];
    }
  }, [tickets, currentUser, users]);

  // --- 2. STATS CALCULATION ---
  const stats = useMemo(() => {
    return {
      total: scopedTickets.length,
      open: scopedTickets.filter(t => t.status !== TicketStatus.CLOSED && t.status !== TicketStatus.RESOLVED).length,
      inProgress: scopedTickets.filter(t => t.status === TicketStatus.IN_PROGRESS).length,
      resolved: scopedTickets.filter(t => t.status === TicketStatus.RESOLVED || t.status === TicketStatus.CLOSED).length,
      slaBreached: scopedTickets.filter(t => (t.slaBreachDurationHours || 0) > 0).length,
    };
  }, [scopedTickets]);

  const ticketsByApp = applications.map(app => ({
    name: app.id,
    count: scopedTickets.filter(t => t.app === app.id).length
  }));

  const ticketsByStatus = [
    { name: 'New', value: scopedTickets.filter(t => t.status === TicketStatus.NEW).length },
    { name: 'Working', value: scopedTickets.filter(t => t.status === TicketStatus.IN_PROGRESS).length },
    { name: 'Pending', value: scopedTickets.filter(t => t.status === TicketStatus.PENDING_USER).length },
    { name: 'Done', value: scopedTickets.filter(t => t.status === TicketStatus.RESOLVED || t.status === TicketStatus.CLOSED).length },
  ];

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString(undefined, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-800">
             {currentUser.role === UserRole.ADMIN && "System Overview"}
             {currentUser.role === UserRole.MANAGER && "Team Dashboard"}
             {currentUser.role === UserRole.ASSIGNEE && "My Workspace"}
             {currentUser.role === UserRole.REQUESTER && "My Tickets"}
           </h1>
           <p className="text-slate-500">
             Welcome back, {currentUser.name}. 
           </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Open</p>
                <p className="text-2xl font-bold text-slate-800">{stats.open}</p>
              </div>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Activity size={20}/></div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">In Progress</p>
                <p className="text-2xl font-bold text-slate-800">{stats.inProgress}</p>
              </div>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Timer size={20}/></div>
            </div>
            
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Resolved</p>
                <p className="text-2xl font-bold text-slate-800">{stats.resolved}</p>
              </div>
              <div className="p-2 bg-green-50 text-green-600 rounded-lg"><CheckCircle size={20}/></div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Breaches</p>
                <p className={`text-2xl font-bold ${stats.slaBreached > 0 ? 'text-red-600' : 'text-slate-800'}`}>{stats.slaBreached}</p>
              </div>
              <div className={`p-2 rounded-lg ${stats.slaBreached > 0 ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'}`}><AlertCircle size={20}/></div>
            </div>
          </div>

          {/* Ticket Feed */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden min-h-[400px]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-700 flex items-center">
                <Calendar size={18} className="mr-2 text-slate-400"/> Recent Tickets
              </h3>
              <button onClick={() => navigate('/my-tickets')} className="text-xs font-bold text-blue-600 hover:underline">View All</button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-6 py-3 font-semibold">ID</th>
                    <th className="px-6 py-3 font-semibold">Summary</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                    <th className="px-6 py-3 font-semibold">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {scopedTickets.slice(0, 10).map(t => (
                    <tr key={t.id} onClick={() => navigate(`/ticket/${t.id}`)} className="hover:bg-slate-50 cursor-pointer group transition-colors">
                      <td className="px-6 py-4 font-mono text-slate-600 font-medium">{t.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-800 truncate max-w-[200px]">{t.summary}</span>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider">{t.app}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase
                          ${t.status === TicketStatus.RESOLVED ? 'bg-green-100 text-green-700' : ''}
                          ${t.status === TicketStatus.IN_PROGRESS ? 'bg-amber-100 text-amber-700' : ''}
                          ${t.status === TicketStatus.NEW ? 'bg-blue-100 text-blue-700' : ''}
                          ${t.status === TicketStatus.CLOSED ? 'bg-slate-100 text-slate-700' : ''}
                        `}>
                          {t.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">{formatDate(t.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar: AI Triage & Charts */}
        <div className="space-y-6">
          {currentUser.role === UserRole.REQUESTER && (
             <AITriageChat 
               currentUser={currentUser} 
               issues={issues} 
               applications={applications} 
               tickets={tickets}
               users={users}
               onCreateTicket={onCreateTicket} 
             />
          )}

          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-sm font-bold text-slate-700 mb-4">Volume by App</h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ticketsByApp}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" hide />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-sm font-bold text-slate-700 mb-4">Ticket Status</h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={ticketsByStatus} cx="50%" cy="50%" innerRadius={40} outerRadius={60} fill="#8884d8" paddingAngle={5} dataKey="value">
                    {ticketsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
