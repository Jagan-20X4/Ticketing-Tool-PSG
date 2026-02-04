
import React, { useState, useMemo } from 'react';
import { TicketType, Priority, User, IssueMaster, Application, Ticket, TicketStatus } from '../types';
import { suggestTicketMetadata } from '../services/geminiService';
import { getSmartAssignee } from '../services/ticketService';
import * as LucideIcons from 'lucide-react';
import { 
  Upload, 
  Wand2, 
  Loader2, 
  FileText, 
  X, 
  ArrowLeft,
  Info,
  Image as ImageIcon,
  UserCheck
} from 'lucide-react';

interface TicketFormProps {
  currentUser: User;
  issues: IssueMaster[];
  users: User[];
  applications: Application[];
  tickets: Ticket[];
  onSubmit: (data: any) => void;
}

export const TicketForm: React.FC<TicketFormProps> = ({ currentUser, issues, users, applications, tickets, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [selectedIssueCode, setSelectedIssueCode] = useState<string>('');
  const [formData, setFormData] = useState({
    phone: currentUser.phone || '', 
    summary: '',
    description: '',
    files: [] as File[]
  });

  const selectedApp = applications.find(a => a.id === selectedAppId);
  const filteredIssues = issues.filter(issue => issue.app === selectedAppId && issue.status === 'Active');

  const { bestAssignee, workloadReason } = useMemo(() => {
    const issue = issues.find(i => i.code === selectedIssueCode);
    if (!issue) return { bestAssignee: null, workloadReason: '' };
    const result = getSmartAssignee(issue, tickets, users);
    return { bestAssignee: result.user, workloadReason: result.reason };
  }, [selectedIssueCode, issues, tickets, users]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({
        ...prev,
        files: [...prev.files, ...Array.from(e.target.files || [])]
      }));
    }
  };

  const handleAiAssist = async () => {
    if (!formData.description || formData.description.length < 10) {
      alert("Please enter a longer description first.");
      return;
    }
    setAiLoading(true);
    const suggestion = await suggestTicketMetadata(formData.description, selectedApp?.name || 'General');
    setAiLoading(false);
    
    if (suggestion) {
      setFormData(prev => ({ ...prev, summary: suggestion.summary }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppId || !selectedIssueCode) return;

    setLoading(true);
    const issue = issues.find(i => i.code === selectedIssueCode);

    setTimeout(() => {
      onSubmit({
        ...formData,
        app: selectedAppId,
        issue: issue,
        assigneeId: bestAssignee?.id,
        type: issue?.category || TicketType.INCIDENT
      });
      setLoading(false);
    }, 800);
  };

  if (!selectedAppId) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-800">What do you need help with?</h1>
          <p className="text-slate-500 mt-2">Select the application or system to create a support ticket.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {applications.filter(a => a.status === 'Active').map((app) => {
            const IconComponent = (LucideIcons as any)[app.icon] || LucideIcons.HelpCircle;
            return (
              <button
                key={app.id}
                onClick={() => setSelectedAppId(app.id)}
                className={`flex flex-col items-center justify-center p-8 rounded-2xl border-2 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 bg-white
                  ${app.color} border-transparent hover:border-current group relative overflow-hidden
                `}
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-white bg-opacity-60 shadow-sm`}>
                  <IconComponent size={32} />
                </div>
                <h3 className="text-lg font-bold text-center">{app.name}</h3>
                <span className="text-xs font-medium opacity-70 mt-1">Create Ticket</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const AppIcon = selectedApp ? ((LucideIcons as any)[selectedApp.icon] || LucideIcons.HelpCircle) : LucideIcons.HelpCircle;

  return (
    <div className="max-w-3xl mx-auto">
       <div className="mb-6 flex items-center justify-between">
         <div>
            <h1 className="text-2xl font-bold text-slate-800">New {selectedApp?.name} Ticket</h1>
            <p className="text-slate-500">Please provide the details of your request.</p>
         </div>
         <button 
           onClick={() => { setSelectedAppId(null); setSelectedIssueCode(''); }}
           className="flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
         >
           <ArrowLeft size={16} className="mr-1" /> Change App
         </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Employee ID</label>
            <input type="text" value={currentUser.id} disabled className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input type="text" value={currentUser.name} disabled className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Contact Phone *</label>
            <input 
              type="tel" required
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg outline-none transition-all focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Application</label>
            <div className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center border ${selectedApp?.color}`}>
               <AppIcon size={18} className="mr-2" />
               {selectedApp?.name}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Issue Type *</label>
          <select
             required
             value={selectedIssueCode}
             onChange={(e) => setSelectedIssueCode(e.target.value)}
             className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">-- Select specific issue --</option>
            {filteredIssues.map(issue => (
              <option key={issue.code} value={issue.code}>{issue.name}</option>
            ))}
          </select>

          {bestAssignee && (
            <div className="mt-3 flex items-start p-3 bg-blue-50 border border-blue-100 rounded-lg animate-fade-in">
              <UserCheck size={18} className="text-blue-500 mt-0.5 mr-2 shrink-0" />
              <div className="text-sm">
                <p className="text-blue-900 font-bold">Automatic Load Balancing</p>
                <p className="text-blue-700">{workloadReason}</p>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Summary *</label>
          <input 
            type="text" required maxLength={150}
            value={formData.summary}
            onChange={(e) => handleChange('summary', e.target.value)}
            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Subject"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
          <div className="relative">
             <textarea 
              required minLength={20} rows={5}
              placeholder="Describe the issue in detail..."
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            />
            <button
              type="button"
              onClick={handleAiAssist}
              disabled={aiLoading}
              className="absolute bottom-3 right-3 flex items-center px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-full hover:bg-slate-800 disabled:opacity-50"
            >
              {aiLoading ? <Loader2 size={12} className="animate-spin mr-1"/> : <Wand2 size={12} className="mr-1"/>}
              AI Fill
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button 
            type="submit" 
            disabled={loading}
            className="flex items-center px-8 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all disabled:opacity-70"
          >
            {loading ? <Loader2 size={20} className="animate-spin mr-2" /> : null}
            Submit Ticket
          </button>
        </div>
      </form>
    </div>
  );
};
