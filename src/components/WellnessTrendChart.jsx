import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function WellnessTrendChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground text-sm">
        No trend data yet. Complete check-ins to see your wellness trend.
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{
            borderRadius: 16,
            border: 'none',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            fontSize: 12,
          }}
        />
        <Line
          type="monotone"
          dataKey="score"
          stroke="hsl(var(--primary))"
          strokeWidth={2.5}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
          name="Burnout Score"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}