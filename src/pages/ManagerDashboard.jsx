const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from 'react';

import { Activity, AlertTriangle, TrendingDown, Clock, Users, Sparkles, Calendar, Loader2 } from 'lucide-react';
import ManagerSection from '@/components/ManagerSection';
import TrendChart from '@/components/charts/TrendChart';
import DistributionDonut from '@/components/charts/DistributionDonut';
import ThemeBars from '@/components/charts/ThemeBars';
import StatCard from '@/components/StatCard';

const tierColors = {
  Low: '#10b981',
  Moderate: '#f59e0b',
  Elevated: '#f97316',
  High: '#f43f5e',
};

export default function ManagerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
  const mockData = {
    nurseCount: 42,
    burnoutDistribution: [
      { level: "Low", value: 18 },
      { level: "Moderate", value: 14 },
      { level: "Elevated", value: 7 },
      { level: "High", value: 3 },
    ],
    wellnessTrend: [
      { month: "Jan", avgScore: 4.2 },
      { month: "Feb", avgScore: 4.5 },
      { month: "Mar", avgScore: 4.8 },
      { month: "Apr", avgScore: 5.1 },
    ],
    fatigueTrend: [
      { month: "Jan", fatigue: 4.1 },
      { month: "Feb", fatigue: 4.6 },
      { month: "Mar", fatigue: 5.2 },
      { month: "Apr", fatigue: 5.0 },
    ],
    overtimeTrend: [
      { month: "Jan", overtimeHours: 22, overtimeShifts: 8 },
      { month: "Feb", overtimeHours: 31, overtimeShifts: 12 },
      { month: "Mar", overtimeHours: 28, overtimeShifts: 10 },
      { month: "Apr", overtimeHours: 36, overtimeShifts: 14 },
    ],
    staffingPressure: [
      { month: "Jan", avgPatientLoad: 5.4 },
      { month: "Feb", avgPatientLoad: 5.8 },
      { month: "Mar", avgPatientLoad: 6.2 },
      { month: "Apr", avgPatientLoad: 5.9 },
    ],
    feedbackThemes: [
      { name: "Staffing", value: 12 },
      { name: "Scheduling", value: 9 },
      { name: "Burnout", value: 7 },
      { name: "Communication", value: 5 },
    ],
    retentionRisk: {
      atRisk: 8,
      total: 42,
      rate: 19,
    },
    schedulePreferences: [],
    interventions: [
      "Review weekend staffing levels.",
      "Encourage wellness check-ins for high-risk staff.",
      "Reduce overtime assignments where possible.",
    ],
  };

  setData(mockData);
  setLoading(false);
}, []);

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading department insights…
      </div>
    );
  }
  if (error) return <div className="py-20 text-center text-destructive">{error}</div>;

  const distribution = (data.burnoutDistribution || []).map((d) => ({ ...d, color: tierColors[d.level] }));
  const totalOvertime = (data.overtimeTrend || []).reduce((a, o) => a + o.overtimeShifts, 0);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm text-muted-foreground">Department Overview</p>
        <h1 className="text-2xl md:text-3xl font-bold font-heading mt-1">Manager Dashboard</h1>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Nurses Tracked" value={data.nurseCount || 0} accent="bg-blue-100 text-blue-600" />
        <StatCard icon={AlertTriangle} label="At-Risk" value={`${data.retentionRisk?.atRisk || 0}/${data.retentionRisk?.total || 0}`} accent="bg-rose-100 text-rose-600" />
        <StatCard icon={Clock} label="Overtime Shifts" value={totalOvertime} accent="bg-amber-100 text-amber-600" />
        <StatCard icon={TrendingDown} label="Retention Risk" value={`${data.retentionRisk?.rate || 0}%`} accent="bg-orange-100 text-orange-600" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <ManagerSection title="Department Wellness Trend" subtitle="Average burnout score over time" icon={Activity}>
          <TrendChart data={data.wellnessTrend} dataKey="avgScore" label="Avg Burnout" />
        </ManagerSection>
        <ManagerSection title="Burnout Risk Distribution" subtitle="Current risk across nurses" icon={AlertTriangle}>
          <DistributionDonut data={distribution} />
        </ManagerSection>
        <ManagerSection title="Fatigue Trends" subtitle="Average fatigue over time" icon={Activity}>
          <TrendChart data={data.fatigueTrend} dataKey="fatigue" label="Avg Fatigue" color="#6366f1" domain={[0, 10]} />
        </ManagerSection>
        <ManagerSection title="Anonymous Feedback Themes" subtitle="Recurring topics from staff" icon={Users}>
          <ThemeBars data={data.feedbackThemes} />
        </ManagerSection>
        <ManagerSection title="Staffing Pressure" subtitle="Average patient load per shift" icon={Activity}>
          <TrendChart data={data.staffingPressure} dataKey="avgPatientLoad" label="Patient Load" color="#8b5cf6" domain={[0, 10]} />
        </ManagerSection>
        <ManagerSection title="Overtime Trends" subtitle="Overtime hours over time" icon={Clock}>
          <TrendChart data={data.overtimeTrend} dataKey="overtimeHours" label="Overtime Hours" color="#f59e0b" domain={[0, 'auto']} />
        </ManagerSection>
      </div>

      <ManagerSection title="Retention Risk" subtitle="Nurses trending toward elevated/high burnout" icon={TrendingDown}>
        <div className="flex items-center gap-4">
          <div className="flex-1 h-3 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full transition-all"
              style={{ width: `${data.retentionRisk?.rate || 0}%` }}
            />
          </div>
          <span className="text-sm font-semibold">
            {data.retentionRisk?.atRisk || 0} of {data.retentionRisk?.total || 0} at risk ({data.retentionRisk?.rate || 0}%)
          </span>
        </div>
      </ManagerSection>

      <ManagerSection title="Schedule Requests" subtitle="Desired schedules submitted by nurses" icon={Calendar}>
        {(data.schedulePreferences || []).length === 0 ? (
          <p className="text-sm text-muted-foreground">No schedule requests submitted yet.</p>
        ) : (
          <div className="space-y-1">
            {data.schedulePreferences.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between py-3 border-b border-black/5 dark:border-white/5 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium">{p.nurse_name}</p>
                  <p className="text-xs text-muted-foreground">
                    Week of {p.week_starting} • {p.preferred_shift} shift • Max {p.max_consecutive} consecutive
                    {p.preferred_days_off ? ` • Off: ${p.preferred_days_off}` : ''}
                  </p>
                  {p.notes && <p className="text-xs text-muted-foreground mt-0.5 italic">"{p.notes}"</p>}
                </div>
                {p.avoid_overtime && (
                  <span className="text-[10px] px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-medium whitespace-nowrap">
                    No OT
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </ManagerSection>

      <ManagerSection title="Suggested Interventions" subtitle="AI-generated based on current department data" icon={Sparkles}>
        {(data.interventions || []).length === 0 ? (
          <p className="text-sm text-muted-foreground">No suggestions available right now.</p>
        ) : (
          <ul className="space-y-3">
            {data.interventions.map((int, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="leading-relaxed pt-0.5">{int}</span>
              </li>
            ))}
          </ul>
        )}
      </ManagerSection>
    </div>
  );
}
