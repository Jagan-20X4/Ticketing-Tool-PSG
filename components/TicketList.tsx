
import React, { useState, useMemo } from 'react';
import { Ticket, TicketStatus, Priority, User, UserRole } from '../types';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, Clock, FileText, ArrowRight } from 'lucide-react';

interface TicketListProps {
  tickets: Ticket[];
  currentUser?: User; 
  users?: User[]; 
}

export const TicketList: React.FC<TicketListProps> = ({ tickets, currentUser, users = [] }) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'created' | 'assigned' | 'team'>('all');

  const getStatusColor = (status: TicketStatus) => {
    switch(status) {
      case TicketStatus.NEW: return 'bg-blue-100 text-blue-700';
      case TicketStatus.IN_PROGRESS: return 'bg-amber-100 text-amber-700';
      case TicketStatus.RESOLVED: return 'bg-green-100 text-green-700';
      case TicketStatus.CLOSED: return 'bg-slate-100 text-slate-700';
      case TicketStatus.PENDING_USER: return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityIcon = (priority: Priority) => {
    switch(priority) {
      case Priority.CRITICAL: return <AlertCircle size={16} className="text-red-500" />;
      case Priority.HIGH: return <AlertCircle size={16} className="text-orange-500" />;
      default: return <div className="w-4 h-4 rounded-full bg-blue-500 opacity-20" />;
    }
  };

  // Filter & Sort Logic
  const filteredTickets = useMemo(() => {
    if (!currentUser) return [];

    let result = tickets.filter(t => {
      // Admin sees all by default (or can filter)
      if (currentUser.role === UserRole.ADMIN && filter === 'all') return true;

      // Filter modes
      if (filter === 'created') return t.requesterId === currentUser.id;
      if (filter === 'assigned') return t.assigneeId === currentUser.id;
      if (filter === 'team') {
         const assignee = users.find(u => u.id === t.assigneeId);
         return assignee?.managerId === currentUser.id;
      }

      // Default 'Smart' view if 'all' selected
      if (filter === 'all') {
        const isRequester = t.requesterId === currentUser.id;
        const isAssignee = t.assigneeId === currentUser.id;
        const assignee = users.find(u => u.id === t.assigneeId);
        const isManager = assignee?.managerId === currentUser.id;
        return isRequester || isAssignee || isManager || currentUser.role === UserRole.ADMIN;
      }
      
      return false;
    });

    // Sort by Latest First (Newest at Top)
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [tickets, currentUser, filter, users]);

  const showTeamFilter = currentUser?.role === UserRole.MANAGER || currentUser?.role === UserRole.ADMIN;
  const showAssignedFilter = currentUser?.role === UserRole.ASSIGNEE || currentUser?.role === UserRole.ADMIN;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Ticket Queue</h1>
          <p className="text-slate-500">Track and manage your requests.</p>
        </div>
        
        <div className="flex space-x-2 bg-slate-100 p-1 rounded-lg self-start">
           <button 
             onClick={() => setFilter('all')}
             className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
           >
             All Relevant
           </button>
           <button 
             onClick={() => setFilter('created')}
             className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === 'created' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
           >
             Created by Me
           </button>
           {showAssignedFilter && (
             <button 
               onClick={() => setFilter('assigned')}
               className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === 'assigned' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
               Assigned to Me
             </button>
           )}
           {showTeamFilter && (
             <button 
               onClick={() => setFilter('team')}
               className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === 'team' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
               My Team
             </button>
           )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {filteredTickets.length === 0 ? (
           <div className="p-12 text-center">
             <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
               <FileText size={32} className="text-slate-400" />
             </div>
             <h3 className="text-lg font-medium text-slate-800">No tickets found</h3>
             <p className="text-slate-500 mt-1">There are no tickets matching your current filter.</p>
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">ID & App</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Summary</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Requester</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTickets.map((ticket) => (
                  <tr 
                    key={ticket.id} 
                    className="hover:bg-slate-50 transition-colors group cursor-pointer"
                    onClick={() => navigate(`/ticket/${ticket.id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-mono text-sm font-medium text-slate-900">{ticket.id}</span>
                        <span className="text-xs text-slate-500">{ticket.app}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 max-w-md">
                        {getPriorityIcon(ticket.priority)}
                        <span className="text-sm text-slate-700 truncate font-medium">{ticket.summary}</span>
                      </div>
                    </td>
                     <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-700">{ticket.requesterName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(ticket.createdAt).toLocaleDateString()} {new Date(ticket.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-slate-400 hover:text-blue-600">
                        <ArrowRight size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
