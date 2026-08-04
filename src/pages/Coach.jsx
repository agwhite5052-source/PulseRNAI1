const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from 'react';

import FrostedCard from '@/components/FrostedCard';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, BookOpen } from 'lucide-react';

export default function Coach() {
  const [entries, setEntries] = useState([]);
  const [reflection, setReflection] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        setEntries((await db.entities.JournalEntry.list('-created_date', 10)) || []);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function generate() {
    setGenerating(true);
    setError('');
    try {
      const response = await db.functions.invoke('GenerateReflection', {
        entries: entries.map((e) => ({ content: e.content })),
      });
      setReflection(response.data?.reflection || 'No reflection generated.');
    } catch (err) {
      setError('Could not generate a reflection right now. Please try again.');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <header>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-heading">Wellness Coach</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Supportive reflections from your journal.</p>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground text-sm">Loading…</div>
      ) : entries.length === 0 ? (
        <FrostedCard className="p-10 text-center">
          <BookOpen className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">
            Write a few journal entries first — your coach needs something to reflect on.
          </p>
        </FrostedCard>
      ) : (
        <>
          <FrostedCard className="p-6">
            <p className="text-sm text-muted-foreground mb-4">
              I'll review your {entries.length} most recent journal {entries.length === 1 ? 'entry' : 'entries'} and
              offer a supportive reflection.
            </p>
            <Button onClick={generate} disabled={generating} className="w-full rounded-2xl h-11">
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Reflecting…
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" /> Generate Reflection
                </>
              )}
            </Button>
          </FrostedCard>

          {error && (
            <FrostedCard className="p-5 border-destructive/20">
              <p className="text-sm text-destructive">{error}</p>
            </FrostedCard>
          )}

          {reflection && (
            <FrostedCard className="p-6 animate-slide-up">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-primary" />
                <h3 className="font-semibold font-heading">Your Reflection</h3>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{reflection}</p>
            </FrostedCard>
          )}
        </>
      )}
    </div>
  );
}