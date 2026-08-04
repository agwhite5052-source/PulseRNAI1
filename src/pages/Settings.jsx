const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';

import { useTheme } from 'next-themes';
import FrostedCard from '@/components/FrostedCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Sun, Moon, Monitor, LogOut, Trash2, User, Settings as SettingsIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [confirmText, setConfirmText] = useState('');
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (confirmText !== 'DELETE') return;
    setDeleting(true);
    try {
      const [entries, checkIns, goals, prefs] = await Promise.all([
        db.entities.JournalEntry.list('-created_date', 500),
        db.entities.CheckIn.list('-created_date', 500),
        db.entities.Goal.list('-created_date', 500),
        db.entities.ShiftPreference.list('-created_date', 500),
      ]);
      for (const e of entries || []) {
        await db.entities.JournalEntry.delete(e.id);
      }
      for (const c of checkIns || []) {
        await db.entities.CheckIn.delete(c.id);
      }
      for (const g of goals || []) {
        await db.entities.Goal.delete(g.id);
      }
      for (const p of prefs || []) {
        await db.entities.ShiftPreference.delete(p.id);
      }
      await db.auth.logout('/login');
      toast({ title: 'Account removal initiated', description: 'Your data was cleared and you have been signed out.' });
    } catch {
      toast({ title: 'Could not complete request', variant: 'destructive' });
    } finally {
      setDeleting(false);
      setOpen(false);
    }
  }

  async function handleSignOut() {
    await db.auth.logout('/login');
  }

  const themes = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold font-heading">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your preferences and account.</p>
      </header>

      <FrostedCard className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-4 h-4 text-primary" />
          <h3 className="font-semibold font-heading">Account</h3>
        </div>
        <div className="flex items-center gap-3 py-1">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-orange-400 flex items-center justify-center text-white font-bold">
            A
          </div>
          <div>
            <p className="font-medium">Alex Chen, RN</p>
            <p className="text-sm text-muted-foreground">alex.chen@hospital.org</p>
          </div>
        </div>
      </FrostedCard>

      <FrostedCard className="p-5">
        <div className="flex items-center gap-2">
          <SettingsIcon className="w-4 h-4 text-primary" />
          <h3 className="font-semibold font-heading">Appearance</h3>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 mb-4">Theme syncs with your system by default.</p>
        <div className="grid grid-cols-3 gap-2">
          {themes.map((t) => (
            <button
              key={t.value}
              onClick={() => setTheme(t.value)}
              className={cn(
                'flex flex-col items-center gap-2 py-4 rounded-2xl border transition-all',
                theme === t.value ? 'bg-primary/10 border-primary text-primary' : 'border-black/5 dark:border-white/10'
              )}
            >
              <t.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{t.label}</span>
            </button>
          ))}
        </div>
      </FrostedCard>

      <FrostedCard className="p-5">
        <h3 className="font-semibold font-heading mb-4">Account Actions</h3>
        <div className="space-y-3">
          <Button variant="outline" onClick={handleSignOut} className="w-full rounded-2xl justify-start">
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full rounded-2xl justify-start">
                <Trash2 className="w-4 h-4 mr-2" /> Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove your account and all associated data. This action cannot be undone. Type{' '}
                  <span className="font-bold text-foreground">DELETE</span> to confirm.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type DELETE"
                className="mt-2"
              />
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setConfirmText('')}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={confirmText !== 'DELETE' || deleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleting ? 'Deleting…' : 'Delete permanently'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </FrostedCard>
    </div>
  );
}