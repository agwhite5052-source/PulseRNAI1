import React, { useState, useRef } from 'react';
import { Loader2 } from 'lucide-react';

const THRESHOLD = 45;

export default function PullToRefresh({ onRefresh, children }) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const active = useRef(false);

  function onTouchStart(e) {
    const tag = e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
      active.current = false;
      return;
    }
    if (window.scrollY <= 0) {
      startY.current = e.touches[0].clientY;
      active.current = true;
    } else {
      active.current = false;
    }
  }

  function onTouchMove(e) {
    if (!active.current || refreshing) return;
    const diff = e.touches[0].clientY - startY.current;
    if (diff > 0) setPull(Math.min(diff * 0.4, 70));
  }

  async function onTouchEnd() {
    if (!active.current) return;
    active.current = false;
    if (pull > THRESHOLD) {
      setRefreshing(true);
      setPull(0);
      try {
        await onRefresh?.();
      } finally {
        setRefreshing(false);
      }
    } else {
      setPull(0);
    }
  }

  return (
    <div onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      <div
        className="flex items-center justify-center overflow-hidden transition-all"
        style={{ height: refreshing ? 40 : pull }}
      >
        <Loader2 className={`w-5 h-5 text-primary ${refreshing ? 'animate-spin' : ''}`} />
      </div>
      {children}
    </div>
  );
}