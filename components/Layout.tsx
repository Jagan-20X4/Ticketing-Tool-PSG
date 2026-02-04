
import React, { ReactNode, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Ticket, 
  PlusCircle, 
  Settings, 
  Menu, 
  X, 
  User as UserIcon,
  LogOut,
  Bot,
  MessageSquare,
  Sparkles,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { User, UserRole } from '../types';
import { AITriageChat } from './AITriageChat';

interface LayoutProps {
  children: ReactNode;
  currentUser: User | null;
  onLogout: () => void;
  // Passing these down for the floating chatbot
  tickets: any[];
  users: any[];
  issues: any[];
  applications: any[];
  onCreateTicket: (data: any) => Promise<any>;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentUser, 
  onLogout,
  tickets,
  users,
  issues,
  applications,
  onCreateTicket
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [floatingChatOpen, setFloatingChatOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  // AI Assistant Auto-Open Logic: Open the floating chat bubble by default on login
  useEffect(() => {
    if (currentUser) {
      const hasShown = sessionStorage.getItem(`assistant_auto_opened_${currentUser.id}`);
      if (!hasShown) {
        // Delay slightly to let the initial page transition finish
        const timer = setTimeout(() => {
          setFloatingChatOpen(true);
          sessionStorage.setItem(`assistant_auto_opened_${currentUser.id}`, 'true');
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [currentUser]);

  const NavItem = ({ path, icon: Icon, label }: { path: string; icon: any; label: string }) => (
    <button
      onClick={() => {
        navigate(path);
        setSidebarOpen(false);
      }}
      className={`flex items-center w-full px-4 py-3 text-sm font-medium transition-colors duration-200 rounded-lg mb-1
        ${isActive(path) 
          ? 'bg-blue-600 text-white shadow-md' 
          : 'text-slate-600 hover:bg-slate-100 hover:text-blue-600'
        }`}
    >
      <Icon size={20} className="mr-3" />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex relative">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto flex flex-col
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">I</span>
            </div>
            <span className="text-xl font-bold text-slate-800">Indira IT</span>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-500 hover:text-slate-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 px-4 py-6 overflow-y-auto">
          <div className="space-y-1">
            <div className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Workspace</div>
            <NavItem path="/dashboard" icon={LayoutDashboard} label="Dashboard" />
            <NavItem path="/chat" icon={Bot} label="AI Assistant" />
            <NavItem path="/my-tickets" icon={Ticket} label="My Tickets" />
            <NavItem path="/create" icon={PlusCircle} label="Manual Create" />
            
            {currentUser?.role === UserRole.ADMIN && (
              <>
                <div className="mt-8 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Admin</div>
                <NavItem path="/admin" icon={Settings} label="System Config" />
              </>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center p-2 space-x-3 rounded-lg bg-slate-50">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
              <UserIcon size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {currentUser?.name || 'Guest'}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {currentUser?.role}
              </p>
            </div>
            <button 
              onClick={onLogout}
              className="text-slate-400 hover:text-red-500 transition-colors"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-white border-b border-slate-200 flex items-center px-4 justify-between">
          <div className="flex items-center space-x-2">
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">I</span>
            </div>
            <span className="font-bold text-slate-800">Indira IT</span>
          </div>
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <Menu size={24} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>

      {/* Global Floating Chat Window - Labels as "AI Assistant" */}
      {currentUser && (
        <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end">
          {floatingChatOpen && (
            <div className="mb-4 w-[380px] sm:w-[420px] max-w-[90vw] animate-in slide-in-from-bottom-5 fade-in duration-300">
              <div className="relative">
                <button 
                  onClick={() => setFloatingChatOpen(false)}
                  className="absolute top-4 right-4 z-[70] text-white/70 hover:text-white transition-colors"
                >
                  <Minimize2 size={20} />
                </button>
                <AITriageChat 
                  currentUser={currentUser}
                  issues={issues}
                  applications={applications}
                  tickets={tickets}
                  users={users}
                  onCreateTicket={onCreateTicket}
                  isFloating={true}
                />
              </div>
            </div>
          )}
          <button
            onClick={() => setFloatingChatOpen(!floatingChatOpen)}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-90 hover:scale-110 
              ${floatingChatOpen ? 'bg-slate-800 text-white' : 'bg-blue-600 text-white ring-4 ring-blue-600/20'}
            `}
          >
            {floatingChatOpen ? <X size={28} /> : <Bot size={28} />}
            {!floatingChatOpen && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
