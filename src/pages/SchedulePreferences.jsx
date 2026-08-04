const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from 'react';

import FrostedCard from '@/components/FrostedCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Calendar, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import SheetSelect from '@/components/SheetSelect';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const shifts = [
  { value: 'day', label: 'Day' },
  { value: 'evening', label: 'Evening' },
  { value: 'night', label: 'Night' },
  { value: 'rotating', label: 'Rotating' },
];

export default function SchedulePreferences() {
  const { toast } = useToast();
  const [prefs, setPrefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nurse_name: 'Alex Chen',
    week_starting: '',
    preferred_shift: 'day',
    preferred_days_off: [],
    max_consecutive: 4,
    avoid_overtime: true,
    notes: '',
  });

  async function load() {
    try {
      setPrefs((await db.entities.ShiftPreference.list('-created_date', 50)) || []);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  function toggleDay(d) {
    setForm((p) => {
      const has = p.preferred_days_off.includes(d);
      return {
        ...p,
        preferred_days_off: has ? p.preferred_days_off.filter((x) => x !== d) : [...p.preferred_days_off, d],
      };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.week_starting) {
      toast({ title: 'Select a week starting date', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      await db.entities.ShiftPreference.create({
        ...form,
        preferred_days_off: form.preferred_days_off.join(', '),
      });
      setForm({ ...form, week_starting: '', preferred_days_off: [], notes: '' });
      toast({ title: 'Schedule request submitted', description: 'Your manager can now see it.' });
      load();
    } catch {
      toast({ title: 'Could not submit', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    await db.entities.ShiftPreference.delete(id);
    load();
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold font-heading">My Schedule</h1>
        <p className="text-sm text-muted-foreground mt-1">Tell your manager the schedule that works for you.</p>
      </header>

      <FrostedCard className="p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Your name</label>
              <Input
                value={form.nurse_name}
                onChange={(e) => setForm((p) => ({ ...p, nurse_name: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Week starting</label>
              <Input
                type="date"
                value={form.week_starting}
                onChange={(e) => setForm((p) => ({ ...p, week_starting: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Preferred shift</label>
            <div className="mt-1">
              <SheetSelect
                label="Shift"
                value={form.preferred_shift}
                onChange={(v) => setForm((p) => ({ ...p, preferred_shift: v }))}
                options={shifts.map((s) => ({ value: s.value, label: s.label }))}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Preferred days off</label>
            <div className="grid grid-cols-7 gap-1.5 mt-1">
              {days.map((d) => (
                <button
                  type="button"
                  key={d}
                  onClick={() => toggleDay(d)}
                  className={cn(
                    'py-2 rounded-xl text-xs font-medium border transition-all',
                    form.preferred_days_off.includes(d)
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'border-black/5 dark:border-white/10 text-muted-foreground'
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Max consecutive days</label>
              <Input
                type="number"
                min={1}
                max={7}
                value={form.max_consecutive}
                onChange={(e) => setForm((p) => ({ ...p, max_consecutive: +e.target.value }))}
                className="mt-1"
              />
            </div>
            <div className="flex items-end">
              <label
                className={cn(
                  'flex items-center justify-between w-full py-2.5 px-3 rounded-xl border cursor-pointer',
                  form.avoid_overtime ? 'border-primary bg-primary/5' : 'border-black/5 dark:border-white/10'
                )}
              >
                <span className="text-sm font-medium">Avoid overtime</span>
                <input
                  type="checkbox"
                  checked={form.avoid_overtime}
                  onChange={(e) => setForm((p) => ({ ...p, avoid_overtime: e.target.checked }))}
                  className="accent-primary w-4 h-4"
                />
              </label>
            </div>
          </div>

          <Textarea
            value={form.notes}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
            placeholder="Any scheduling notes for your manager…"
            rows={2}
          />

          <Button type="submit" disabled={saving} className="w-full rounded-2xl">
            {saving ? 'Submitting…' : 'Submit Schedule Request'}
          </Button>
        </form>
      </FrostedCard>

      {!loading && prefs.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Your requests</h3>
          {prefs.map((p) => (
            <FrostedCard key={p.id} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary" /> Week of {p.week_starting}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {p.preferred_shift} shift • Max {p.max_consecutive} consecutive
                    {p.preferred_days_off ? ` • Off: ${p.preferred_days_off}` : ''}
                    {p.avoid_overtime ? ' • No OT' : ''}
                  </p>
                  {p.notes && <p className="text-xs text-muted-foreground mt-1 italic">"{p.notes}"</p>}
                </div>
                <button onClick={() => remove(p.id)} className="text-destructive/60 hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </FrostedCard>
          ))}
        </div>
      )}
    </div>
  );
}