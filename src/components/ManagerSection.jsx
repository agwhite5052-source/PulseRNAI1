import React from 'react';
import FrostedCard from './FrostedCard';

export default function ManagerSection({ title, subtitle, icon: Icon, children }) {
  return (
    <FrostedCard className="p-5">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-primary" />}
        <h3 className="font-semibold font-heading">{title}</h3>
      </div>
      {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </FrostedCard>
  );
}