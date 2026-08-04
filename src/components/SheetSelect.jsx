import React, { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SheetSelect({ label, value, options, onChange, placeholder = 'Select…' }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button
          type="button"
          className="w-full flex items-center justify-between px-4 py-3 rounded-2xl border border-black/5 dark:border-white/10 text-sm font-medium bg-white/50 dark:bg-white/5"
        >
          <span className="text-muted-foreground text-xs">{label}</span>
          <span className="flex items-center gap-1.5">
            {selected?.label || placeholder}
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </span>
        </button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-center">
          <DrawerTitle>{label}</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-8 space-y-1">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
              className={cn(
                'w-full text-left px-4 py-3 rounded-2xl text-sm font-medium transition-all',
                o.value === value ? 'bg-primary text-primary-foreground' : 'hover:bg-black/5 dark:hover:bg-white/5'
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
}