const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from 'react';

import FrostedCard from '@/components/FrostedCard';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Plus, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import PullToRefresh from '@/components/PullToRefresh';

const moodEmoji = { positive: '😊', neutral: '😐', negative: '😔', very_negative: '😢' };

export default function Journal() {
  const { toast } = useToast();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('neutral');
  const [saving, setSaving] = useState(false);

  async function load(showLoading = true) {
    if (showLoading) setLoading(true);
    try {
      const data = await db.entities.JournalEntry.list('-created_date', 50);
      setEntries(data || []);
    } finally {
      if (showLoading) setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSave() {
    if (!content.trim()) return;
    setSaving(true);
    try {
      await db.entities.JournalEntry.create({ content, mood });
      setContent('');
      setMood('neutral');
      setAdding(false);
      toast({ title: 'Entry saved' });
      load();
    } catch {
      toast({ title: 'Could not save entry', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <PullToRefresh onRefresh={() => load(false)}>
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-heading">Journal</h1>
          <p className="text-sm text-muted-foreground mt-1">Reflect on your day.</p>
        </div>
        <Button onClick={() => setAdding((a) => !a)} variant={adding ? 'outline' : 'default'} className="rounded-2xl">
          <Plus className="w-4 h-4 mr-1" /> {adding ? 'Cancel' : 'New Entry'}
        </Button>
      </div>

      {adding && (
        <FrostedCard className="p-5 space-y-3 animate-slide-up">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            rows={4}
            autoFocus
          />
          <div className="flex gap-2">
            {Object.entries(moodEmoji).map(([k, v]) => (
              <button
                key={k}
                type="button"
                onClick={() => setMood(k)}
                className={cn(
                  'flex-1 py-2 rounded-xl text-xl border transition-all',
                  mood === k ? 'bg-primary/10 border-primary' : 'border-black/5 dark:border-white/10'
                )}
              >
                {v}
              </button>
            ))}
          </div>
          <Button onClick={handleSave} disabled={saving || !content.trim()} className="w-full rounded-2xl">
            {saving ? 'Saving…' : 'Save Entry'}
          </Button>
        </FrostedCard>
      )}

      {loading ? (
        <div className="py-12 text-center text-muted-foreground text-sm">Loading entries…</div>
      ) : entries.length === 0 ? (
        <FrostedCard className="p-10 text-center">
          <BookOpen className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">No journal entries yet. Start writing to reflect on your experiences.</p>
        </FrostedCard>
      ) : (
        <div className="space-y-3">
          {entries.map((e) => (
            <FrostedCard key={e.id} className="p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <span className="text-2xl">{moodEmoji[e.mood] || '📝'}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(e.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{e.content}</p>
            </FrostedCard>
          ))}
        </div>
      )}
    </div>
    </PullToRefresh>
  );
}