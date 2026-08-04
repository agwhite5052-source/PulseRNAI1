const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from 'react';

import FrostedCard from '@/components/FrostedCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Target, Check, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import PullToRefresh from '@/components/PullToRefresh';
import SheetSelect from '@/components/SheetSelect';

const categories = { wellness: 'Wellness', sleep: 'Sleep', work_life: 'Work-Life', stress: 'Stress', growth: 'Growth' };
const catColors = {
  wellness: 'bg-emerald-100 text-emerald-700',
  sleep: 'bg-indigo-100 text-indigo-700',
  work_life: 'bg-purple-100 text-purple-700',
  stress: 'bg-rose-100 text-rose-700',
  growth: 'bg-amber-100 text-amber-700',
};

export default function Goals() {
  const { toast } = useToast();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'wellness', description: '' });
  const [saving, setSaving] = useState(false);

  async function load(showLoading = true) {
    if (showLoading) setLoading(true);
    try {
      setGoals((await db.entities.Goal.list('-created_date', 50)) || []);
    } finally {
      if (showLoading) setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    const tempId = 'temp-' + Date.now();
    const newGoal = { ...form, id: tempId, progress: 0, status: 'active', created_date: new Date().toISOString() };
    setGoals((prev) => [newGoal, ...prev]);
    setForm({ title: '', category: 'wellness', description: '' });
    setAdding(false);
    toast({ title: 'Goal created' });
    try {
      const created = await db.entities.Goal.create({ ...form, progress: 0, status: 'active' });
      setGoals((prev) => prev.map((g) => (g.id === tempId ? created : g)));
    } catch {
      setGoals((prev) => prev.filter((g) => g.id !== tempId));
      toast({ title: 'Could not create goal', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  }

  async function updateProgress(goal, delta) {
    const progress = Math.min(Math.max(goal.progress + delta, 0), 100);
    const status = progress >= 100 ? 'completed' : 'active';
    setGoals((prev) => prev.map((g) => (g.id === goal.id ? { ...g, progress, status } : g)));
    try {
      await db.entities.Goal.update(goal.id, { progress, status });
    } catch {
      setGoals((prev) =>
        prev.map((g) => (g.id === goal.id ? { ...g, progress: goal.progress, status: goal.status } : g))
      );
      toast({ title: 'Could not update progress', variant: 'destructive' });
    }
  }

  async function remove(id) {
    await db.entities.Goal.delete(id);
    load();
  }

  return (
    <PullToRefresh onRefresh={() => load(false)}>
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-heading">Goals</h1>
          <p className="text-sm text-muted-foreground mt-1">Small steps toward wellness.</p>
        </div>
        <Button onClick={() => setAdding((a) => !a)} variant={adding ? 'outline' : 'default'} className="rounded-2xl">
          <Plus className="w-4 h-4 mr-1" /> {adding ? 'Cancel' : 'New Goal'}
        </Button>
      </div>

      {adding && (
        <FrostedCard className="p-5 animate-slide-up">
          <form onSubmit={handleCreate} className="space-y-3">
            <Input
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="Goal title"
            />
            <Input
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Description (optional)"
            />
            <SheetSelect
              label="Category"
              value={form.category}
              onChange={(v) => setForm((p) => ({ ...p, category: v }))}
              options={Object.entries(categories).map(([k, v]) => ({ value: k, label: v }))}
            />
            <Button type="submit" disabled={saving} className="w-full rounded-2xl">
              {saving ? 'Saving…' : 'Create Goal'}
            </Button>
          </form>
        </FrostedCard>
      )}

      {loading ? (
        <div className="py-12 text-center text-muted-foreground text-sm">Loading goals…</div>
      ) : goals.length === 0 ? (
        <FrostedCard className="p-10 text-center">
          <Target className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">No goals yet. Set one to start your wellness journey.</p>
        </FrostedCard>
      ) : (
        <div className="space-y-3">
          {goals.map((g) => (
            <FrostedCard key={g.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold">{g.title}</h3>
                    <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium', catColors[g.category] || '')}>
                      {categories[g.category]}
                    </span>
                    {g.status === 'completed' && <Check className="w-4 h-4 text-emerald-500" />}
                  </div>
                  {g.description && <p className="text-sm text-muted-foreground mb-3">{g.description}</p>}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${g.progress}%` }} />
                    </div>
                    <span className="text-xs font-medium w-9 text-right">{g.progress}%</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" className="rounded-xl text-xs h-8" onClick={() => updateProgress(g, -10)}>
                  -10%
                </Button>
                <Button size="sm" variant="outline" className="rounded-xl text-xs h-8" onClick={() => updateProgress(g, 10)}>
                  +10%
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-xl text-xs h-8 ml-auto text-destructive"
                  onClick={() => remove(g.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </FrostedCard>
          ))}
        </div>
      )}
    </div>
    </PullToRefresh>
  );
}