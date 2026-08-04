import React from 'react';
import FrostedCard from './FrostedCard';
import { getBurnoutTier } from '@/lib/burnoutEngine';
import { cn } from '@/lib/utils';

export default function BurnoutCard({ score }) {
  const tier = getBurnoutTier(score);
  const circumference = 2 * Math.PI * 52;
  const offset = circumference - (score / 100) * circumference;

  return (
    <FrostedCard className="p-6 animate-slide-up">
      <div className="flex items-center gap-6">
        <div className="relative w-32 h-32 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" strokeWidth="10" className="stroke-black/5 dark:stroke-white/10" />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              strokeWidth="10"
              stroke="currentColor"
              strokeLinecap="round"
              className={cn(tier.text)}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold font-heading">{score}</span>
            <span className="text-xs text-muted-foreground">/ 100</span>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Burnout Risk</p>
          <h2 className={cn('text-2xl font-bold font-heading mt-1', tier.text)}>{tier.level}</h2>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{tier.description}</p>
        </div>
      </div>
    </FrostedCard>
  );
}