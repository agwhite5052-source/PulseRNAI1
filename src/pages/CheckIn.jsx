const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import FrostedCard from '@/components/FrostedCard';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Heart, Moon, Battery, Users, Coffee } from 'lucide-react';
import { cn } from '@/lib/utils';

const moodOptions = [
  { value: 'positive', label: 'Positive', emoji: '😊' },
  { value: 'neutral', label: 'Neutral', emoji: '😐' },
  { value: 'negative', label: 'Negative', emoji: '😔' },
  { value: 'very_negative', label: 'Very Low', emoji: '😢' },
];

export default function CheckIn() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState({
    stress_level: 5,
    sleep_quality: 7,
    fatigue_level: 4,
    patient_load: 5,
    missed_breaks: 0,
    mood: 'neutral',
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await db.entities.CheckIn.create(form);
      toast({ title: 'Check-in saved', description: 'Your wellness data has been recorded.' });
      navigate('/');
    } catch (err) {
      toast({ title: 'Could not save check-in', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  }

  const fields = [
    { key: 'stress_level', label: 'Stress Level', icon: Heart, hint: '1 = calm, 10 = overwhelmed' },
    { key: 'sleep_quality', label: 'Sleep Quality', icon: Moon, hint: '1 = poor, 10 = excellent' },
    { key: 'fatigue_level', label: 'Fatigue Level', icon: Battery, hint: '1 = energized, 10 = exhausted' },
    { key: 'patient_load', label: 'Patient Load', icon: Users, hint: '1 = light, 10 = heavy' },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold font-heading">Wellness Check-in</h1>
        <p className="text-sm text-muted-foreground mt-1">A quick pulse on how you're doing today.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map((f) => (
          <FrostedCard key={f.key} className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <f.icon className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">{f.label}</span>
              </div>
              <span className="text-lg font-bold font-heading">{form[f.key]}</span>
            </div>
            <Slider
              value={[form[f.key]]}
              min={1}
              max={10}
              step={1}
              onValueChange={(v) => setForm((p) => ({ ...p, [f.key]: v[0] }))}
            />
            <p className="text-xs text-muted-foreground mt-2">{f.hint}</p>
          </FrostedCard>
        ))}

        <FrostedCard className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Coffee className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Missed Breaks This Week</span>
          </div>
          <div className="flex gap-2">
            {[0, 1, 2, 3, 4].map((n) => (
              <button
                type="button"
                key={n}
                onClick={() => setForm((p) => ({ ...p, missed_breaks: n }))}
                className={cn(
                  'flex-1 py-2 rounded-xl text-sm font-medium border transition-all',
                  form.missed_breaks === n
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-black/5 dark:border-white/10 text-muted-foreground'
                )}
              >
                {n}
              </button>
            ))}
          </div>
        </FrostedCard>

        <FrostedCard className="p-5">
          <span className="text-sm font-medium block mb-3">How are you feeling?</span>
          <div className="grid grid-cols-4 gap-2">
            {moodOptions.map((m) => (
              <button
                type="button"
                key={m.value}
                onClick={() => setForm((p) => ({ ...p, mood: m.value }))}
                className={cn(
                  'flex flex-col items-center gap-1 py-3 rounded-2xl border transition-all',
                  form.mood === m.value ? 'bg-primary/10 border-primary' : 'border-black/5 dark:border-white/10'
                )}
              >
                <span className="text-2xl">{m.emoji}</span>
                <span className="text-xs">{m.label}</span>
              </button>
            ))}
          </div>
        </FrostedCard>

        <FrostedCard className="p-5">
          <span className="text-sm font-medium block mb-2">Notes (optional)</span>
          <Textarea
            value={form.notes}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
            placeholder="Anything you'd like to reflect on…"
            rows={3}
          />
        </FrostedCard>

        <Button type="submit" disabled={saving} className="w-full rounded-2xl h-12 text-base">
          {saving ? 'Saving…' : 'Complete Check-in'}
        </Button>
      </form>
    </div>
  );
}