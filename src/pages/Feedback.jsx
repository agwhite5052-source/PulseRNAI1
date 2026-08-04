const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';

import FrostedCard from '@/components/FrostedCard';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

const themes = [
  { value: 'workload', label: 'Workload' },
  { value: 'breaks', label: 'Breaks' },
  { value: 'staffing', label: 'Staffing' },
  { value: 'leadership', label: 'Leadership' },
  { value: 'scheduling', label: 'Scheduling' },
  { value: 'culture', label: 'Culture' },
  { value: 'other', label: 'Other' },
];
const sentiments = [
  { value: 'positive', label: 'Positive', emoji: '👍' },
  { value: 'neutral', label: 'Neutral', emoji: '🟰' },
  { value: 'negative', label: 'Concern', emoji: '⚠️' },
];

export default function Feedback() {
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [theme, setTheme] = useState('workload');
  const [sentiment, setSentiment] = useState('neutral');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!content.trim()) return;
    setSaving(true);
    try {
      await db.entities.Feedback.create({ content, theme, sentiment });
      setContent('');
      setTheme('workload');
      setSentiment('neutral');
      toast({ title: 'Feedback submitted anonymously' });
    } catch {
      toast({ title: 'Could not submit', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold font-heading">Anonymous Feedback</h1>
        <p className="text-sm text-muted-foreground mt-1">Share concerns — your manager sees themes, not your identity.</p>
      </header>

      <FrostedCard className="p-4 flex items-center gap-3 bg-primary/5 border-primary/20">
        <Shield className="w-5 h-5 text-primary flex-shrink-0" />
        <p className="text-sm text-muted-foreground">
          Your feedback is anonymous. Managers only see aggregated themes and sentiment.
        </p>
      </FrostedCard>

      <form onSubmit={handleSubmit}>
        <FrostedCard className="p-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Topic</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {themes.map((t) => (
                <button
                  type="button"
                  key={t.value}
                  onClick={() => setTheme(t.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-xl text-xs font-medium border transition-all',
                    theme === t.value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-black/5 dark:border-white/10'
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Sentiment</label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {sentiments.map((s) => (
                <button
                  type="button"
                  key={s.value}
                  onClick={() => setSentiment(s.value)}
                  className={cn(
                    'flex items-center justify-center gap-2 py-2 rounded-xl text-sm border transition-all',
                    sentiment === s.value ? 'bg-primary/10 border-primary' : 'border-black/5 dark:border-white/10'
                  )}
                >
                  {s.emoji} {s.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Your feedback</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              rows={4}
              className="mt-1"
            />
          </div>
          <Button type="submit" disabled={saving || !content.trim()} className="w-full rounded-2xl">
            {saving ? 'Submitting…' : 'Submit Anonymously'}
          </Button>
        </FrostedCard>
      </form>
    </div>
  );
}