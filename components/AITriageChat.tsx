
import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Loader2, 
  Sparkles, 
  User as UserIcon, 
  Bot, 
  CheckCircle, 
  Image as ImageIcon, 
  X,
  Ticket as TicketIcon,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { User, IssueMaster, Application, TicketType, Priority, Ticket, Attachment } from '../types';
import { triageIssue, getInitialSolution } from '../services/geminiService';
import { getBestMatchingIssue } from '../services/ticketService';

interface AITriageChatProps {
  currentUser: User;
  issues: IssueMaster[];
  applications: Application[];
  tickets: Ticket[];
  users: User[];
  onCreateTicket: (data: any) => Promise<Ticket>;
  isFloating?: boolean;
}

export const AITriageChat: React.FC<AITriageChatProps> = ({ 
  currentUser, 
  issues, 
  applications, 
  tickets, 
  users, 
  onCreateTicket,
  isFloating = false
}) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'bot' | 'system', text: string, image?: string, ticketId?: string }[]>([
    { 
      role: 'bot', 
      text: `Hi there 👋 Please describe the issue you’re facing. You can also upload a screenshot to help us understand better. Once you submit, I’ll automatically create a support ticket for you and share the ticket ID. Meanwhile, I’ll use AI to suggest possible solutions and guide you step by step until the support team responds.` 
    }
  ]);
  const [input, setInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastCreatedTicket, setLastCreatedTicket] = useState<Ticket | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isProcessing]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedFile) || isProcessing) return;

    const userText = input;
    const currentPreview = previewUrl;
    setInput('');
    
    // Add User Message
    setMessages(prev => [...prev, { 
      role: 'user', 
      text: userText || (selectedFile ? "Uploaded a screenshot." : ""), 
      image: currentPreview || undefined 
    }]);
    
    setIsProcessing(true);

    try {
      let base64Image: string | undefined;
      let attachment: Attachment | undefined;
      
      if (selectedFile) {
        base64Image = await fileToBase64(selectedFile);
        attachment = {
          id: `att-${Date.now()}`,
          name: selectedFile.name,
          size: selectedFile.size,
          type: selectedFile.type,
          url: currentPreview || ''
        };
      }

      // Clear the local state for the file
      setSelectedFile(null);
      setPreviewUrl(null);

      const appIds = applications.map(a => a.id);
      const triageResult = await triageIssue(userText, appIds, base64Image);

      if (triageResult) {
        // Resolve AI app (may return id or name) to application id for consistent matching
        const resolvedAppId = applications.find(
          a => a.id === triageResult.app || (a.name && a.name.toLowerCase() === (triageResult.app || '').toLowerCase())
        )?.id ?? triageResult.app;

        // Find issues for this app (from PostgreSQL seed / API: first assignee = default for that issue)
        const appIssues = issues.filter(i => i.app === resolvedAppId && i.assigneeIds && i.assigneeIds.length > 0);
        const bestIssue = getBestMatchingIssue(appIssues, userText, triageResult.summary)
          || appIssues[0]
          || issues.find(i => i.assigneeIds && i.assigneeIds.length > 0)
          || issues[0];

        if (!bestIssue) {
          setMessages(prev => [...prev, {
            role: 'bot',
            text: "No issue type is configured for this application yet. Please create a ticket manually from the 'Create Ticket' page or ask your admin to add issues for this app."
          }]);
          return;
        }

        // Use the default assignee for this issue (first in list from PostgreSQL seed)
        const assigneeId = bestIssue.assigneeIds?.[0] ?? null;

        // Use the user's exact message as ticket summary; only use AI summary when they didn't type (e.g. image only)
        const ticketSummary = (userText && userText.trim()) ? userText.trim() : triageResult.summary;
        const ticketData = {
          summary: ticketSummary,
          description: userText || "Issue described in screenshot.",
          app: resolvedAppId,
          issue: bestIssue,
          priority: triageResult.priority as Priority,
          type: bestIssue.category || TicketType.INCIDENT,
          phone: currentUser.phone || 'N/A',
          assigneeId,
          attachments: attachment ? [attachment] : []
        };

        const newTicket = await onCreateTicket(ticketData);
        setLastCreatedTicket(newTicket);

        // Notify Ticket Creation
        setMessages(prev => [...prev, { 
          role: 'system', 
          text: `Ticket successfully created: **${newTicket.id}**`,
          ticketId: newTicket.id
        }]);

        // Generate AI Solution
        const initialSolution = await getInitialSolution(userText, resolvedAppId, triageResult.summary);
        const assigneeName = assigneeId ? users.find(u => u.id === assigneeId)?.name : null;
        setMessages(prev => [...prev, {
          role: 'bot',
          text: `I've assigned your ticket to **${assigneeName || 'an engineer'}**. \n\n**While you wait, here's what you can try:**\n\n${initialSolution}`
        }]);
      } else {
        setMessages(prev => [...prev, { 
          role: 'bot', 
          text: "I couldn't identify the application. Please let me know if it's related to Oracle, P2P, Eshopaid, HIS, or IT Infrastructure." 
        }]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'bot', text: "Something went wrong. Please try creating a ticket manually using the 'Create Ticket' sidebar option." }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const containerClasses = isFloating 
    ? "bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[500px] transition-all duration-300 ring-1 ring-black/10"
    : "bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col h-[550px] transition-all duration-300 ring-1 ring-black/5";

  return (
    <div className={containerClasses}>
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-900 px-6 py-4 flex items-center justify-between shadow-md relative z-10">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
            <Sparkles className="text-blue-400" size={20} />
          </div>
          <div>
            <h3 className="text-white font-bold tracking-tight text-sm uppercase tracking-widest">AI Assistant</h3>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_5px_rgba(16,185,129,0.8)]"></div>
              <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">Online & Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-50/80 custom-scrollbar">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
            <div className={`flex items-start space-x-2.5 max-w-[90%] ${m.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm border transition-transform hover:scale-105 ${
                m.role === 'user' 
                  ? 'bg-blue-600 text-white border-blue-500' 
                  : m.role === 'system' 
                    ? 'bg-emerald-100 text-emerald-600 border-emerald-200' 
                    : 'bg-white text-slate-700 border-slate-200'
              }`}>
                {m.role === 'user' ? <UserIcon size={16} /> : m.role === 'system' ? <CheckCircle size={18} /> : <Bot size={18} />}
              </div>
              <div className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`p-4 rounded-2xl text-[13px] leading-relaxed shadow-sm whitespace-pre-wrap ${
                  m.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : m.role === 'system'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-100 font-bold'
                      : 'bg-white text-slate-700 border border-slate-200/60 rounded-tl-none'
                }`}>
                  {m.text}
                  {m.image && (
                    <div className="mt-3 rounded-lg overflow-hidden border border-white/20">
                      <img src={m.image} alt="User upload" className="max-w-full h-auto max-h-48 object-cover" />
                    </div>
                  )}
                  {m.ticketId && (
                    <button 
                      onClick={() => window.location.hash = `#/ticket/${m.ticketId}`}
                      className="mt-3 flex items-center space-x-2 px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-xs font-bold"
                    >
                      <TicketIcon size={14} />
                      <span>View Ticket Details</span>
                      <ArrowRight size={14} />
                    </button>
                  )}
                </div>
                <span className="text-[9px] text-slate-400 mt-1 uppercase tracking-tighter">
                  {m.role === 'user' ? 'You' : m.role === 'system' ? 'System' : 'Assistant'} &bull; {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="flex justify-start animate-pulse">
            <div className="flex items-center space-x-3 bg-white border border-slate-200/60 p-4 rounded-2xl shadow-sm rounded-tl-none">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-75"></div>
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-150"></div>
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-300"></div>
              </div>
              <span className="text-xs text-slate-500 font-medium italic">Analyzing and triaging...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-100 bg-white relative">
        {previewUrl && (
          <div className="absolute bottom-full left-4 mb-2 bg-white border border-slate-200 rounded-xl p-2 shadow-lg flex items-center space-x-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-100">
              <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
            </div>
            <div className="flex-1 min-w-0 pr-2">
              <p className="text-[10px] font-bold text-slate-700 truncate">{selectedFile?.name}</p>
              <p className="text-[9px] text-slate-400">Ready to upload</p>
            </div>
            <button onClick={removeFile} className="p-1.5 bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-500 rounded-full transition-colors">
              <X size={14} />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-center space-x-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all active:scale-90"
            title="Attach screenshot"
          >
            <ImageIcon size={22} />
          </button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isProcessing}
              placeholder="Describe your problem..."
              className="w-full pl-4 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-[13px] disabled:opacity-50 transition-all shadow-inner"
            />
            <button
              type="submit"
              disabled={(!input.trim() && !selectedFile) || isProcessing}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-30 disabled:grayscale transition-all shadow-md shadow-blue-500/20 active:scale-95"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
