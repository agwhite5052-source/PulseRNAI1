import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';

export default function ThemeBars({ data }) {
  if (!data || data.length === 0) {
    return <div className="py-10 text-center text-muted-foreground text-sm">No feedback yet.</div>;
  }
  return (
    <ResponsiveContainer width="100%" height={Math.max(160, data.length * 36)}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
        <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
        <YAxis type="category" dataKey="theme" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} width={90} />
        <Tooltip contentStyle={{ borderRadius: 12, border: 'none', fontSize: 12 }} cursor={{ fill: 'transparent' }} />
        <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={18}>
          {data.map((_, i) => (
            <Cell key={i} fill="hsl(var(--primary))" />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}