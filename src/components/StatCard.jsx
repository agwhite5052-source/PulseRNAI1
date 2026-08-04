import React from 'react';
import FrostedCard from './FrostedCard';
import { cn } from '@/lib/utils';

export default function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <FrostedCard className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold font-heading mt-1">{value}</p>
        </div>
        {Icon && (
          <div className={cn('w-10 h-10 rounded-2xl flex items-center justify-center', accent || 'bg-primary/10 text-primary')}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </FrostedCard>
  );
}