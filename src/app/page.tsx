'use client';

import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import BootScreen from '@/components/BootScreen';
import LoginScreen from '@/components/LoginScreen';
import Desktop from '@/components/Desktop';
import { WindowProvider } from '@/context/WindowContext';
import { ThemeProvider } from '@/context/ThemeContext';

import { ss, STORAGE_KEYS } from '@/utils/storage';

type Phase = 'boot' | 'login' | 'desktop';

export default function Home() {
  const [phase, setPhase] = useState<Phase>('boot');

  useEffect(() => {
    try {
      if (ss.get<string>(STORAGE_KEYS.HAS_VISITED, '') === '1') {
        setPhase('login');
      }
      ss.set(STORAGE_KEYS.HAS_VISITED, '1');
    } catch { /* private browsing */ }
  }, []);

  const handleBootComplete = useCallback(() => {
    ss.set(STORAGE_KEYS.HAS_VISITED, '1');
    setPhase('login');
  }, []);
  const handleLogin   = useCallback(() => setPhase('desktop'), []);
  const handleLogOff  = useCallback(() => setPhase('login'), []);

  return (
    <ThemeProvider>
      <WindowProvider>
      <div className="w-full h-[100dvh] relative overflow-hidden bg-black font-[Tahoma,Arial,sans-serif] text-[11px]">
        <AnimatePresence mode="wait">
          {phase === 'boot' && <BootScreen key="boot" onComplete={handleBootComplete} />}
          {phase === 'login' && <LoginScreen key="login" onLogin={handleLogin} />}
          {phase === 'desktop' && <Desktop key="desktop" onLogOff={handleLogOff} />}
        </AnimatePresence>
      </div>
      </WindowProvider>
    </ThemeProvider>
  );
}
