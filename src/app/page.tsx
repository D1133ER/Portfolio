'use client';

import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import BootScreen from '@/components/BootScreen';
import LoginScreen from '@/components/LoginScreen';
import Desktop from '@/components/Desktop';
import { WindowProvider } from '@/context/WindowContext';

type Phase = 'boot' | 'login' | 'desktop';

const HAS_VISITED_KEY = 'nischal-portfolio-visited';

export default function Home() {
  const [phase, setPhase] = useState<Phase>('boot');

  // Skip boot for returning visitors (deferred to avoid hydration mismatch)
  useEffect(() => {
    try {
      if (sessionStorage.getItem(HAS_VISITED_KEY)) {
        setPhase('login');
      }
      sessionStorage.setItem(HAS_VISITED_KEY, '1');
    } catch { /* private browsing */ }
  }, []);

  const handleBootComplete = useCallback(() => {
    try { sessionStorage.setItem(HAS_VISITED_KEY, '1'); } catch { /* ignore */ }
    setPhase('login');
  }, []);
  const handleLogin = useCallback(() => setPhase('desktop'), []);
  const handleLogOff = useCallback(() => setPhase('login'), []);

  return (
    <WindowProvider>
      <div className="w-full h-[100dvh] min-h-[500px] relative overflow-hidden bg-black font-[Tahoma,Arial,sans-serif] text-[11px]">
        <AnimatePresence mode="wait">
          {phase === 'boot' && <BootScreen key="boot" onComplete={handleBootComplete} />}
          {phase === 'login' && <LoginScreen key="login" onLogin={handleLogin} />}
          {phase === 'desktop' && <Desktop key="desktop" onLogOff={handleLogOff} />}
        </AnimatePresence>
      </div>
    </WindowProvider>
  );
}
