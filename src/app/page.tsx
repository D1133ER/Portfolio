'use client';

import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import BootScreen from '@/components/BootScreen';
import LoginScreen from '@/components/LoginScreen';
import Desktop from '@/components/Desktop';
import { WindowProvider } from '@/context/WindowContext';

type Phase = 'boot' | 'login' | 'desktop';

export default function Home() {
  const [phase, setPhase] = useState<Phase>('boot');

  const handleBootComplete = useCallback(() => setPhase('login'), []);
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
