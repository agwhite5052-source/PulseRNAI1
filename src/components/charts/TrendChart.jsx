import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function TrendChart({ data, dataKey, color, label, domain }) {
  if (!data || data.length === 0) {
    return <div className="py-10 text-center text-muted-foreground text-sm">No data yet.</div>;
  }
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
        <YAxis domain={domain || [0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', fontSize: 12 }} />
        <Line type="monotone" dataKey={dataKey} stroke={color || 'hsl(var(--primary))'} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} name={label} />
      </LineChart>
    </ResponsiveContainer>
  );
}