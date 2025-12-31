import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Dumbbell, BarChart3, CalendarDays, LogOut, Bot } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { signOut } = useAuth();

  const getPageTitle = () => {
    if (location.pathname === '/') return 'Meus Treinos';
    if (location.pathname === '/progress') return 'Evolução';
    if (location.pathname === '/coach') return 'IronCoach IA';
    if (location.pathname.startsWith('/workout/')) return 'Detalhes do Treino';
    return 'IronTrack';
  };

  return (
    <div className="min-h-screen bg-dark-900 text-slate-100 pb-20 md:pb-0 md:pl-20">
      {/* Mobile Sticky Header */}
      <header className="sticky top-0 z-50 bg-dark-900/95 backdrop-blur-md border-b border-white/10 px-4 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <Dumbbell className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-brand-500 to-indigo-500 bg-clip-text text-transparent">
            {getPageTitle()}
          </h1>
        </div>
        <button onClick={signOut} className="md:hidden p-2 text-slate-400 hover:text-white">
           <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-4 md:p-8 animate-fade-in">
        {children}
      </main>

      {/* Desktop Sidebar Navigation */}
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-20 flex-col items-center py-8 bg-dark-800 border-r border-white/10 z-40 justify-between">
        <div className="flex flex-col items-center gap-6 w-full">
            <div className="mb-2 w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-brand">
            <Dumbbell className="w-6 h-6 text-white" />
            </div>
            <DesktopNavItem to="/" icon={<CalendarDays />} label="Treinos" />
            <DesktopNavItem to="/progress" icon={<BarChart3 />} label="Progresso" />
            <DesktopNavItem to="/coach" icon={<Bot />} label="Coach IA" />
        </div>
        
        <button 
          onClick={signOut}
          className="mb-4 flex flex-col items-center gap-1 p-2 text-slate-500 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-6 h-6" />
          <span className="text-[10px] font-medium">Sair</span>
        </button>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-dark-800 border-t border-white/10 px-6 py-3 z-50 flex justify-around items-center safe-area-pb">
        <MobileNavItem to="/" icon={<CalendarDays />} label="Treinos" />
        <MobileNavItem to="/progress" icon={<BarChart3 />} label="Progresso" />
        <MobileNavItem to="/coach" icon={<Bot />} label="Coach" />
      </nav>
    </div>
  );
};

const DesktopNavItem = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex flex-col items-center gap-1 p-3 w-full transition-all duration-200 border-l-4 ${
        isActive
          ? 'border-brand-500 text-brand-500 bg-white/5'
          : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
      }`
    }
  >
    {React.cloneElement(icon as React.ReactElement, { className: 'w-6 h-6' })}
    <span className="text-[10px] font-medium">{label}</span>
  </NavLink>
);

const MobileNavItem = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex flex-col items-center gap-1 transition-colors duration-200 ${
        isActive ? 'text-brand-500' : 'text-slate-500'
      }`
    }
  >
    {React.cloneElement(icon as React.ReactElement, { className: 'w-6 h-6' })}
    <span className="text-xs font-medium">{label}</span>
  </NavLink>
);

export default Layout;