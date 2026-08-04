import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Heart, BookOpen, Target, Activity, Sparkles, Calendar, MessageSquare, BarChart3, ChevronDown, Settings as SettingsIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const nurseNav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/check-in', label: 'Check-in', icon: Heart },
  { to: '/journal', label: 'Journal', icon: BookOpen },
  { to: '/coach', label: 'Coach', icon: Sparkles },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/my-schedule', label: 'My Schedule', icon: Calendar },
  { to: '/feedback', label: 'Feedback', icon: MessageSquare },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

const managerNav = [
  { to: '/manager', label: 'Manager Dashboard', icon: BarChart3 },
  { to: '/my-schedule', label: 'My Schedule', icon: Calendar },
  { to: '/feedback', label: 'Feedback', icon: MessageSquare },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const [role, setRole] = useState('Nurse');
  const [menuOpen, setMenuOpen] = useState(false);
  const items = role === 'Manager' ? managerNav : nurseNav;

  function switchRole(r) {
    setRole(r);
    setMenuOpen(false);
    navigate(r === 'Manager' ? '/manager' : '/');
  }

  return (
    <>
      <aside className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 pt-[env(safe-area-inset-top)] border-r border-black/5 dark:border-white/10 bg-white/60 dark:bg-black/20 backdrop-blur-xl z-30">
        <div className="flex items-center gap-2.5 px-6 h-16">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center shadow-sm">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold font-heading text-lg tracking-tight block leading-none">PulseRNAI</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Wellness</span>
          </div>
        </div>

        <div className="px-3 pt-2 relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-2xl border border-black/5 dark:border-white/10 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5"
          >
            <span className="flex items-center gap-2">
              <span className={cn('w-2 h-2 rounded-full', role === 'Manager' ? 'bg-purple-500' : 'bg-emerald-500')} />
              {role} view
            </span>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </button>
          {menuOpen && (
            <div className="absolute left-3 right-3 top-12 rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-card shadow-lg overflow-hidden z-10">
              {['Nurse', 'Manager'].map((r) => (
                <button
                  key={r}
                  onClick={() => switchRole(r)}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-black/5 dark:hover:bg-white/5',
                    role === r && 'font-semibold text-primary'
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>

        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all',
                  isActive ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5'
                )
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-black/5 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-400 to-orange-400 flex items-center justify-center text-white text-sm font-bold">
              A
            </div>
            <div className="text-xs">
              <p className="font-medium">Alex Chen, RN</p>
              <p className="text-muted-foreground">{role}</p>
            </div>
          </div>
        </div>
      </aside>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/80 dark:bg-black/40 backdrop-blur-xl border-t border-black/5 dark:border-white/10 flex justify-around pt-2 pb-[env(safe-area-inset-bottom)] px-1">
        {items.slice(0, 5).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl text-[10px] font-medium',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}