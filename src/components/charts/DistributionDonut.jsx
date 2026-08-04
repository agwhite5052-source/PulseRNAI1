import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function DistributionDonut({ data }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  if (!total) return <div className="py-10 text-center text-muted-foreground text-sm">No data yet.</div>;
  return (
    <div className="flex items-center gap-4">
      <div className="relative w-36 h-36 flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="count" innerRadius={45} outerRadius={65} paddingAngle={2}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: 12, border: 'none', fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold font-heading">{total}</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wide">nurses</span>
        </div>
      </div>
      <div className="space-y-2 flex-1">
        {data.map((d) => (
          <div key={d.level} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
              {d.level}
            </span>
            <span className="font-medium">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}