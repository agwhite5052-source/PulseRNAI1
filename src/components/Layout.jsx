import React from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './Sidebar';
import MobileHeader from './MobileHeader';

export default function Layout() {
  const location = useLocation();
  const outlet = useOutlet();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="md:pl-60 pb-24 md:pb-0">
        <MobileHeader />
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-10 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              {outlet}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}