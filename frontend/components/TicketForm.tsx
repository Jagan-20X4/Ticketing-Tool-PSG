import React, { useState, useMemo, useRef, useEffect } from 'react';
import { TicketType, Priority, User, IssueMaster, Application, Ticket, TicketStatus } from '../types';
import { suggestTicketMetadata } from '../services/geminiService';
import { getSmartAssignee } from '../services/ticketService';
import * as LucideIcons from 'lucide-react';
import { 
  Wand2, 
  Loader2, 
  ArrowLeft,
  UserCheck
} from 'lucide-react';

/** Strip HTML tags for plain-text length and AI */
function stripHtml(html: string): string {
  if (!html) return '';
  const div = document.createElement('div');
  div.innerHTML = html;
  return (div.textContent || div.innerText || '').trim();
}

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
  const descriptionRef = useRef<HTMLDivElement>(null);
  
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [selectedIssueCode, setSelectedIssueCode] = useState<string>('');
  const [formData, setFormData] = useState({
    phone: currentUser.phone || '', 
    summary: '',
    description: ''
  });

  // Keep contentEditable in sync with formData.description when it's set externally (e.g. reset)
  useEffect(() => {
    const el = descriptionRef.current;
    if (!el || formData.description === undefined) return;
    if (el.innerHTML !== formData.description) el.innerHTML = formData.description;
  }, [formData.description]);

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

  const handleAiAssist = async () => {
    const plainText = stripHtml(formData.description);
    if (!plainText || plainText.length < 10) {
      alert("Please enter a longer description first.");
      return;
    }
    setAiLoading(true);
    const suggestion = await suggestTicketMetadata(plainText, selectedApp?.name || 'General');
    setAiLoading(false);
    
    if (suggestion) {
      setFormData(prev => ({ ...prev, summary: suggestion.summary }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppId || !selectedIssueCode) return;
    const plainDesc = stripHtml(formData.description);
    if (!plainDesc || plainDesc.length < 20) {
      alert("Please provide a description of at least 20 characters.");
      return;
    }

    setLoading(true);
    const issue = issues.find(i => i.code === selectedIssueCode);

    try {
      await onSubmit({
        ...formData,
        app: selectedAppId,
        issue: issue,
        assigneeId: bestAssignee?.id,
        type: issue?.category || TicketType.INCIDENT
      });
    } catch (err) {
      console.error('Failed to create ticket:', err);
      alert('Failed to create ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const syncDescriptionFromEl = () => {
    const el = descriptionRef.current;
    if (el) handleChange('description', el.innerHTML);
  };

  const handleDescriptionPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    const file = Array.from(items).find(item => item.kind === 'file' && item.type.startsWith('image/'));
    if (!file) return; // let default paste handle text
    e.preventDefault();
    const blob = file.getAsFile();
    if (!blob) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const selection = window.getSelection();
      const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
      const el = descriptionRef.current;
      if (!el) return;
      const img = document.createElement('img');
      img.src = dataUrl;
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
      img.style.display = 'block';
      img.style.marginTop = '8px';
      img.style.marginBottom = '8px';
      img.setAttribute('data-pasted-image', '1');
      if (range) {
        range.deleteContents();
        range.insertNode(img);
        range.setStartAfter(img);
        range.setEndAfter(img);
        selection?.removeAllRanges();
        selection?.addRange(range);
      } else {
        el.appendChild(document.createElement('br'));
        el.appendChild(img);
      }
      syncDescriptionFromEl();
    };
    reader.readAsDataURL(blob);
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
            <div
              ref={descriptionRef}
              contentEditable
              data-placeholder="Describe the issue in detail... (You can paste screenshots with Ctrl+V)"
              onInput={syncDescriptionFromEl}
              onPaste={handleDescriptionPaste}
              className="w-full min-h-[140px] px-4 py-3 pb-10 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none [&:empty::before]:content-[attr(data-placeholder)] [&:empty::before]:text-slate-400"
              style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
              suppressContentEditableWarning
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
