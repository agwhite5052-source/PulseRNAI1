import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const titles = {
  '/': 'Dashboard',
  '/check-in': 'Check-in',
  '/journal': 'Journal',
  '/coach': 'Wellness Coach',
  '/goals': 'Goals',
  '/my-schedule': 'My Schedule',
  '/feedback': 'Feedback',
  '/manager': 'Manager Dashboard',
  '/settings': 'Settings',
};

export default function MobileHeader() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const title = titles[pathname] || 'PulseRNAI';
  const isHome = pathname === '/';

  return (
    <header className="md:hidden sticky top-0 z-20 pt-[env(safe-area-inset-top)] bg-white/80 dark:bg-black/40 backdrop-blur-xl border-b border-black/5 dark:border-white/10">
      <div className="flex items-center h-14 px-3">
        <button
          onClick={() => navigate(-1)}
          aria-label="Back"
          className={isHome ? 'invisible' : 'flex items-center justify-center h-9 w-9 rounded-full hover:bg-black/5 dark:hover:bg-white/5'}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="font-semibold font-heading text-base flex-1 text-center">{title}</h1>
        <span className="h-9 w-9" aria-hidden />
      </div>
    </header>
  );
}