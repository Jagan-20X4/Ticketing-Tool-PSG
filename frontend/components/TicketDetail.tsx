
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Ticket, TicketStatus, User, UserRole, Attachment } from '../types';
import { 
  Send, 
  CheckCircle, 
  User as UserIcon, 
  Paperclip, 
  AlertTriangle, 
  ShieldAlert, 
  Play, 
  Timer,
  ArrowRightLeft,
  X,
  RotateCcw,
  CheckSquare,
  MessageSquareWarning,
  Download,
  FileText,
  Image as ImageIcon,
  ExternalLink
} from 'lucide-react';

/** Sanitize description HTML for safe display (allow only safe tags and data: images) */
function sanitizeDescriptionHtml(html: string): string {
  if (!html || !html.trim()) return '';
  const div = document.createElement('div');
  div.innerHTML = html;
  const allowedTags = new Set(['P', 'BR', 'IMG', 'DIV', 'SPAN', 'B', 'I', 'U', 'STRONG', 'EM']);
  const walk = (node: Node): void => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      const tag = el.tagName;
      if (!allowedTags.has(tag)) {
        const children = Array.from(el.childNodes);
        el.replaceWith(...children);
        children.forEach(walk);
        return;
      }
      if (tag === 'IMG') {
        const src = (el as HTMLImageElement).getAttribute('src') || '';
        if (!src.startsWith('data:')) (el as HTMLImageElement).removeAttribute('src');
      }
      Array.from(el.attributes).forEach(attr => {
        if (attr.name !== 'src' && attr.name !== 'style' && !attr.name.startsWith('data-')) {
          el.removeAttribute(attr.name);
        }
      });
    }
    node.childNodes.forEach(walk);
  };
  walk(div);
  return div.innerHTML;
}

interface TicketDetailProps {
  tickets: Ticket[];
  users?: User[];
  currentUser: User;
  onUpdateTicket: (id: string, updates: Partial<Ticket>) => void;
  onAddComment: (ticketId: string, text: string) => void;
}

export const TicketDetail: React.FC<TicketDetailProps> = ({ tickets, users = [], currentUser, onUpdateTicket, onAddComment }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const ticket = tickets.find(t => t.id === id);
  const [commentText, setCommentText] = useState('');
  const [elapsedTime, setElapsedTime] = useState<string>('');
  
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferTargetId, setTransferTargetId] = useState('');
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolutionNote, setResolutionNote] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const assignee = users.find(u => u.id === ticket?.assigneeId);
  const isAssignee = currentUser.id === ticket?.assigneeId;
  const isRequester = currentUser.id === ticket?.requesterId;
  const isAdmin = currentUser.role === UserRole.ADMIN;
  const isManager = assignee?.managerId === currentUser.id || currentUser.role === UserRole.MANAGER;

  const canEdit = isAssignee || isManager || isAdmin;
  const canResolve = canEdit;
  const canClose = isRequester || isManager || isAdmin;
  const canStartWork = canEdit && (ticket?.status === TicketStatus.ASSIGNED || ticket?.status === TicketStatus.NEW) && !ticket?.workStartedAt;
  const canTransfer = canEdit;

  useEffect(() => {
    if (!ticket) return;
    const updateTimer = () => {
      if (ticket.workStartedAt) {
        const start = new Date(ticket.workStartedAt).getTime();
        let end = new Date().getTime();
        if (ticket.status === TicketStatus.RESOLVED || ticket.status === TicketStatus.CLOSED) {
           if (ticket.resolvedAt) end = new Date(ticket.resolvedAt).getTime();
           else if (ticket.closedAt) end = new Date(ticket.closedAt).getTime();
        }
        const diffMs = end - start;
        if (diffMs >= 0) {
          const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
          const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
          const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);
          setElapsedTime(`${diffHrs}h ${diffMins}m ${diffSecs}s`);
        } else setElapsedTime('0h 0m 0s');
      } else setElapsedTime('');
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [ticket]);

  if (!ticket) return <div className="p-8 text-center text-slate-500">Ticket not found</div>;

  const handleStartWorking = () => {
    onUpdateTicket(ticket.id, { status: TicketStatus.IN_PROGRESS, workStartedAt: new Date().toISOString() });
    onAddComment(ticket.id, `${currentUser.name} started working on this ticket.`);
  };

  const confirmResolution = () => {
    const note = resolutionNote.trim() ? resolutionNote : "No detailed remarks provided.";
    onAddComment(ticket.id, `MARKED AS RESOLVED by ${currentUser.name}: ${note}`);
    onAddComment(ticket.id, `SYSTEM NOTIFICATION: Email sent to user ${ticket.requesterName} regarding resolution.`);
    onUpdateTicket(ticket.id, { status: TicketStatus.RESOLVED, resolvedAt: new Date().toISOString() });
    setShowResolveModal(false);
  };

  const handleReopen = () => {
      onAddComment(ticket.id, `Ticket Reopened by ${currentUser.name}.`);
      onUpdateTicket(ticket.id, { status: TicketStatus.IN_PROGRESS });
  };

  const handleTransfer = () => {
    if (!transferTargetId) return;
    const newAssignee = users.find(u => u.id === transferTargetId);
    if (newAssignee) {
        onUpdateTicket(ticket.id, { assigneeId: transferTargetId, assignedAt: new Date().toISOString() });
        onAddComment(ticket.id, `Ticket transferred from ${currentUser.name} to ${newAssignee.name}.`);
        setShowTransferModal(false);
        setTransferTargetId('');
    }
  };

  const handleUserConfirmationAction = (confirmed: boolean) => {
    if (confirmed) {
      onUpdateTicket(ticket.id, { status: TicketStatus.CLOSED, closedAt: new Date().toISOString() });
      onAddComment(ticket.id, `Ticket closed by ${currentUser.name} (Confirmation).`);
    } else {
      setRejectionReason('');
      setShowRejectModal(true);
    }
  };

  const submitRejection = () => {
    if (!rejectionReason.trim()) return;
    onAddComment(ticket.id, `RESOLUTION REJECTED / REOPENED by ${currentUser.name}.\nRemarks: ${rejectionReason}`);
    onAddComment(ticket.id, `SYSTEM NOTIFICATION: Reopen notification sent to assignee: ${assignee?.name || 'Unassigned'}.`);
    onUpdateTicket(ticket.id, { status: TicketStatus.IN_PROGRESS });
    setShowRejectModal(false);
  };

  const submitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(ticket.id, commentText);
    setCommentText('');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const transferCandidates = users.filter(u => (u.role === UserRole.ASSIGNEE || u.role === UserRole.MANAGER) && u.id !== ticket.assigneeId);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
             <span className="text-xl font-mono text-slate-400">#{ticket.id}</span>
             <h1 className="text-2xl font-bold text-slate-800">{ticket.summary}</h1>
          </div>
          <div className="flex items-center space-x-4 text-sm text-slate-500">
             <span>Via {ticket.app}</span>
             <span>&bull;</span>
             <span>Created {new Date(ticket.createdAt).toLocaleString()}</span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
           <span className={`px-4 py-1.5 rounded-full text-sm font-semibold border
              ${ticket.status === TicketStatus.RESOLVED ? 'bg-green-50 text-green-700 border-green-200' : ''}
              ${ticket.status === TicketStatus.IN_PROGRESS ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
              ${ticket.status === TicketStatus.NEW ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
              ${ticket.status === TicketStatus.ASSIGNED ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : ''}
              ${ticket.status === TicketStatus.CLOSED ? 'bg-slate-50 text-slate-700 border-slate-200' : ''}
              ${ticket.status === TicketStatus.PENDING_USER ? 'bg-purple-50 text-purple-700 border-purple-200' : ''}
           `}>
             {ticket.status}
           </span>
           {ticket.workStartedAt && (
              <div className={`flex items-center px-3 py-1.5 rounded-lg border font-mono text-sm transition-colors
                 ${ticket.status === TicketStatus.IN_PROGRESS ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-slate-100 border-slate-200 text-slate-500'}
              `}>
                <Timer size={16} className={`mr-2 ${ticket.status === TicketStatus.IN_PROGRESS ? 'animate-pulse' : ''}`} />
                {elapsedTime || '0h 0m 0s'}
              </div>
           )}
           <div className="flex items-center space-x-2">
               {canStartWork && (
                 <button onClick={handleStartWorking} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors shadow-sm">
                   <Play size={16} className="mr-2" /> Start Working
                 </button>
               )}
               {canResolve && ticket.status === TicketStatus.IN_PROGRESS && (
                 <button onClick={() => setShowResolveModal(true)} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors shadow-sm">
                   <CheckCircle size={16} className="mr-2" /> Mark as Resolved
                 </button>
               )}
               {canEdit && ticket.status === TicketStatus.RESOLVED && (
                   <button onClick={handleReopen} className="flex items-center px-4 py-2 bg-amber-100 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-200 text-sm font-medium transition-colors">
                     <RotateCcw size={16} className="mr-2"/> Reopen
                   </button>
               )}
               {canTransfer && ticket.status !== TicketStatus.CLOSED && ticket.status !== TicketStatus.RESOLVED && (
                   <button onClick={() => setShowTransferModal(true)} className="flex items-center px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium transition-colors shadow-sm">
                      <ArrowRightLeft size={16} className="mr-2"/> Transfer
                   </button>
               )}
           </div>
        </div>
      </div>

      <div className="space-y-3">
        {ticket.isEscalated && (
           <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3 animate-pulse">
            <ShieldAlert className="text-red-600" size={24} />
            <div>
              <p className="font-bold text-red-800">MANAGER ESCALATION ACTIVE</p>
              <p className="text-sm text-red-700">This ticket was automatically reassigned to the manager due to SLA breach.</p>
            </div>
          </div>
        )}
      </div>

      {ticket.status === TicketStatus.RESOLVED && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-start md:items-center justify-between flex-col md:flex-row gap-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="text-green-600 mt-1" size={24} />
              <div>
                <h3 className="text-lg font-bold text-green-900">Pending Confirmation</h3>
                <p className="text-green-700">
                   The assignee has marked this ticket as resolved. 
                   {isRequester ? " Please confirm if your issue is fixed to close the ticket." : " Waiting for requester confirmation."}
                </p>
              </div>
            </div>
            {canClose && (
              <div className="flex space-x-3 w-full md:w-auto">
                <button onClick={() => handleUserConfirmationAction(true)} className="flex-1 md:flex-none px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 shadow-sm">Confirm & Close</button>
                <button onClick={() => handleUserConfirmationAction(false)} className="flex-1 md:flex-none px-6 py-2 bg-white text-red-600 font-medium rounded-lg border border-red-200 hover:bg-red-50">Reject & Reopen</button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Description</h3>
            <div className="prose prose-slate max-w-none text-slate-600">
              {ticket.description && ticket.description.trim().includes('<') ? (
                <div
                  className="whitespace-pre-wrap break-words [&_img]:max-w-full [&_img]:h-auto [&_img]:block [&_img]:my-2 [&_img]:rounded"
                  dangerouslySetInnerHTML={{ __html: sanitizeDescriptionHtml(ticket.description) }}
                />
              ) : (
                <p className="whitespace-pre-wrap">{ticket.description}</p>
              )}
            </div>
          </div>

          {/* FILES & ATTACHMENTS SECTION */}
          {ticket.attachments && ticket.attachments.length > 0 && (
             <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                   <Paperclip size={18} className="mr-2 text-slate-400" /> Files & Attachments ({ticket.attachments.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   {ticket.attachments.map((file: Attachment) => {
                      const isImage = file.type.startsWith('image/');
                      return (
                        <div key={file.id} className="group relative border border-slate-100 rounded-xl p-4 hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                           <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-500 transition-colors">
                                 {isImage ? <ImageIcon size={20} /> : <FileText size={20} />}
                              </div>
                              <div className="flex-1 min-w-0">
                                 <p className="text-sm font-medium text-slate-800 truncate" title={file.name}>{file.name}</p>
                                 <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                              </div>
                              <div className="flex space-x-1">
                                 <a 
                                   href={file.url} 
                                   target="_blank" 
                                   rel="noopener noreferrer"
                                   className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                                   title="View / Download"
                                 >
                                    <Download size={18} />
                                 </a>
                              </div>
                           </div>
                           {isImage && (
                              <div className="mt-3 overflow-hidden rounded-lg border border-slate-100">
                                 <img src={file.url} alt={file.name} className="w-full h-32 object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                              </div>
                           )}
                        </div>
                      );
                   })}
                </div>
             </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">Activity Log</h3>
            <div className="space-y-6">
              {ticket.comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs">{comment.userName.charAt(0)}</div>
                  </div>
                  <div className="flex-1">
                    <div className={`rounded-lg p-4 ${comment.isInternal ? 'bg-red-50 border border-red-100' : 'bg-slate-50'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm font-medium ${comment.isInternal ? 'text-red-700' : 'text-slate-900'}`}>{comment.userName}</span>
                        <span className="text-xs text-slate-500">{new Date(comment.createdAt).toLocaleString()}</span>
                      </div>
                      <p className={`text-sm whitespace-pre-wrap ${comment.isInternal ? 'text-red-600 font-medium' : 'text-slate-700'}`}>{comment.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {ticket.status !== TicketStatus.CLOSED && (
              <form onSubmit={submitComment} className="mt-6 flex gap-4">
                <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Add a comment or update..." className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-h-[80px]" />
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 h-fit self-end flex items-center"><Send size={16} className="mr-2" /> Send</button>
              </form>
            )}
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
             <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Details</h3>
             <div className="space-y-4">
               <div>
                 <label className="text-xs text-slate-500 block mb-1">Priority</label>
                 <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${ticket.priority === 'Critical' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>{ticket.priority}</span>
               </div>
                <div>
                 <label className="text-xs text-slate-500 block mb-1">Requester</label>
                 <div className="flex items-center"><UserIcon size={14} className="mr-2 text-slate-400"/><span className="text-sm text-slate-700">{ticket.requesterName}</span></div>
               </div>
               <div>
                 <label className="text-xs text-slate-500 block mb-1">Assignee</label>
                 <span className="text-sm text-slate-700">{assignee ? assignee.name : 'Unassigned'}</span>
               </div>
                <div>
                 <label className="text-xs text-slate-500 block mb-1">SLA Level</label>
                 <div className="w-full bg-slate-100 rounded-full h-2 mt-1"><div className={`h-2 rounded-full ${ticket.isEscalated ? 'bg-red-600' : ticket.slaLevel > 3 ? 'bg-orange-500' : 'bg-blue-500'}`} style={{ width: `${(ticket.slaLevel / 5) * 100}%` }} /></div>
               </div>
             </div>
           </div>
        </div>
      </div>

       {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Transfer Ticket</h3>
            <select value={transferTargetId} onChange={(e) => setTransferTargetId(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none mb-4">
              <option value="">-- Select New Assignee --</option>
              {transferCandidates.map(u => <option key={u.id} value={u.id}>{u.name} ({u.department})</option>)}
            </select>
            <div className="flex justify-end space-x-2"><button onClick={() => setShowTransferModal(false)} className="px-4 py-2 text-slate-600">Cancel</button><button onClick={handleTransfer} disabled={!transferTargetId} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">Confirm</button></div>
          </div>
        </div>
      )}

      {showResolveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Resolution Details</h3>
            <textarea value={resolutionNote} onChange={(e) => setResolutionNote(e.target.value)} placeholder="Explain the fix..." className="w-full px-4 py-3 border border-slate-300 rounded-lg h-32 resize-none mb-4" />
            <div className="flex justify-end space-x-3"><button onClick={() => setShowResolveModal(false)} className="px-4 py-2 text-slate-600">Cancel</button><button onClick={confirmResolution} disabled={!resolutionNote.trim()} className="px-4 py-2 bg-green-600 text-white rounded-lg">Confirm</button></div>
          </div>
        </div>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Reject & Reopen</h3>
            <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="Why is this not fixed?" className="w-full px-4 py-3 border border-slate-300 rounded-lg h-32 resize-none mb-4" />
            <div className="flex justify-end space-x-3"><button onClick={() => setShowRejectModal(false)} className="px-4 py-2 text-slate-600">Cancel</button><button onClick={submitRejection} disabled={!rejectionReason.trim()} className="px-4 py-2 bg-red-600 text-white rounded-lg">Submit Rejection</button></div>
          </div>
        </div>
      )}
    </div>
  );
};
