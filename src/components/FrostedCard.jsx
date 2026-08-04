import React from 'react';
import { cn } from '@/lib/utils';

export default function FrostedCard({ children, className, onClick }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-3xl bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 shadow-sm',
        className
      )}
    >
      {children}
    </div>
  );
}