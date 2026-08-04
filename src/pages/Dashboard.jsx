const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from 'react';

import { Moon, Heart, Clock, Activity, TrendingUp } from 'lucide-react';
import FrostedCard from '@/components/FrostedCard';
import BurnoutCard from '@/components/BurnoutCard';
import WellnessTrendChart from '@/components/WellnessTrendChart';
import StatCard from '@/components/StatCard';
import { calculateBurnoutScore, calculateBurnoutTrend } from '@/lib/burnoutEngine';
import { cn } from '@/lib/utils';
import PullToRefresh from '@/components/PullToRefresh';

export default function Dashboard() {
  const [checkIns, setCheckIns] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const [ci, sh] = await Promise.all([
        db.entities.CheckIn.list('-created_date', 30),
        db.entities.Shift.list('-created_date', 30),
      ]);
      setCheckIns(ci || []);
      setShifts(sh || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return <div className="py-20 text-center text-muted-foreground">Loading your wellness data…</div>;
  }

  const latest = checkIns[0];
  const { score, tier, contributingFactors } = calculateBurnoutScore(latest, shifts);
  const trend = calculateBurnoutTrend(checkIns);
  const overtimeCount = shifts.filter((s) => s.is_overtime).length;

  return (
    <PullToRefresh onRefresh={load}>
    <div className="space-y-6">
      <header className="animate-fade-in">
        <p className="text-sm text-muted-foreground">Welcome back,</p>
        <h1 className="text-2xl md:text-3xl font-bold font-heading mt-1">Alex</h1>
      </header>

      <BurnoutCard score={score} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Moon} label="Sleep" value={latest ? `${latest.sleep_quality}/10` : '—'} accent="bg-indigo-100 text-indigo-600" />
        <StatCard icon={Heart} label="Stress" value={latest ? `${latest.stress_level}/10` : '—'} accent="bg-rose-100 text-rose-600" />
        <StatCard icon={Clock} label="Overtime" value={overtimeCount} accent="bg-amber-100 text-amber-600" />
        <StatCard icon={Activity} label="Check-ins" value={checkIns.length} accent="bg-emerald-100 text-emerald-600" />
      </div>

      <FrostedCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold font-heading">Wellness Trend</h3>
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
        </div>
        <WellnessTrendChart data={trend} />
      </FrostedCard>

      {contributingFactors.length > 0 && (
        <FrostedCard className="p-6">
          <h3 className="font-semibold font-heading mb-1">Why is this score {tier.level.toLowerCase()}?</h3>
          <p className="text-sm text-muted-foreground mb-4">Burnout indicator is influenced by:</p>
          <ul className="space-y-1">
            {contributingFactors.map((f) => (
              <li
                key={f.key}
                className="flex items-center justify-between py-2.5 border-b border-black/5 dark:border-white/5 last:border-0"
              >
                <span className="text-sm flex items-center gap-2.5">
                  <span className={cn('w-2 h-2 rounded-full', tier.bg)} />
                  {f.detail}
                </span>
                <span className="text-sm font-semibold font-mono">+{f.score}</span>
              </li>
            ))}
          </ul>
        </FrostedCard>
      )}

      {!latest && (
        <FrostedCard className="p-6 text-center">
          <p className="text-sm text-muted-foreground">
            No check-in data yet. Start with a quick wellness check-in to see your burnout score.
          </p>
        </FrostedCard>
      )}
    </div>
    </PullToRefresh>
  );
}