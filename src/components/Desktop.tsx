'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback, useEffect } from 'react';
import { useWindows } from '@/context/WindowContext';
import { playStartupChime } from '@/utils/sounds';
import { devQuotes } from '@/data/portfolio';

import DesktopIcons from './DesktopIcons';
import Taskbar from './Taskbar';
import BalloonNotification from './BalloonNotification';
import Screensaver from './Screensaver';
import AboutWindow from './windows/AboutWindow';
import ExperienceWindow from './windows/ExperienceWindow';
import SkillsWindow from './windows/SkillsWindow';
import EducationWindow from './windows/EducationWindow';
import ContactWindow from './windows/ContactWindow';
import ProjectsWindow from './windows/ProjectsWindow';
import CmdWindow from './windows/CmdWindow';
import QuizWindow from './windows/QuizWindow';
import RadarWindow from './windows/RadarWindow';
import TimelineWindow from './windows/TimelineWindow';
import CertsWindow from './windows/CertsWindow';
import RateCardWindow from './windows/RateCardWindow';
import SnippetsWindow from './windows/SnippetsWindow';
import ShortcutsWindow from './windows/ShortcutsWindow';

// Cloud data: { delay (s), duration (s), top (%), size (px), opacity }
const CLOUDS = [
  { id: 0, delay: 0,  duration: 55, top:  8, size: 90,  opacity: 0.55 },
  { id: 1, delay: 12, duration: 75, top: 16, size: 130, opacity: 0.45 },
  { id: 2, delay: 4,  duration: 45, top:  5, size: 70,  opacity: 0.6  },
  { id: 3, delay: 28, duration: 65, top: 22, size: 110, opacity: 0.35 },
  { id: 4, delay: 18, duration: 85, top: 12, size: 150, opacity: 0.3  },
] as const;

type CtxMenu = { x: number; y: number } | null;

interface DesktopProps {
  onLogOff: () => void;
}

export default function Desktop({ onLogOff }: DesktopProps) {
  const { openWindow } = useWindows();
  const [ctxMenu, setCtxMenu] = useState<CtxMenu>(null);

  // Daily quote — rotates by day-of-year
  const todayQuote = devQuotes[Math.floor(Date.now() / 86_400_000) % devQuotes.length];

  // Auto-open the About window when the desktop first loads + play startup chime
  useEffect(() => {
    const t1 = setTimeout(() => openWindow('about'), 400);
    const t2 = setTimeout(() => playStartupChime(), 600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [openWindow]);

  // Global Ctrl+Alt keyboard shortcuts
  useEffect(() => {
    const map: Record<string, import('@/types').WindowId> = {
      a: 'about', e: 'experience', s: 'skills', p: 'projects',
      c: 'contact', t: 'terminal', q: 'quiz', r: 'radar',
      l: 'timeline', g: 'certs', w: 'ratecard', i: 'snippets', k: 'shortcuts',
    };
    const handler = (ev: KeyboardEvent) => {
      if (!ev.ctrlKey || !ev.altKey) return;
      const id = map[ev.key.toLowerCase()];
      if (id) { ev.preventDefault(); openWindow(id); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [openWindow]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setCtxMenu({ x: e.clientX, y: e.clientY });
  }, []);

  const closeCtx = useCallback(() => setCtxMenu(null), []);

  const ctxItems = [
    { label: 'Arrange Icons By ▶',    action: closeCtx },
    { label: 'Refresh',               action: closeCtx },
    null,
    { label: 'Paste',                 action: closeCtx },
    { label: 'Paste Shortcut',        action: closeCtx },
    null,
    { label: 'New ▶',                 action: closeCtx },
    null,
    { label: 'Properties',            action: closeCtx },
  ];

  return (
    <motion.div
      className="absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      onContextMenu={handleContextMenu}
      onClick={closeCtx}
    >
      {/* ── Background ── */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(170deg, #d8c4a0 0%, #c9a870 35%, #b89060 65%, #9a7040 100%)',
        }}
      />

      {/* ── Animated clouds ── */}
      {CLOUDS.map((c) => (
        <div
          key={c.id}
          className="absolute pointer-events-none"
          style={{
            top:     `${c.top}%`,
            opacity: c.opacity,
            animation: `float-cloud ${c.duration}s linear ${c.delay}s infinite`,
          }}
        >
          {/* Cloud shape made of stacked ellipses */}
          <div className="relative" style={{ width: c.size, height: c.size * 0.55 }}>
            <div className="absolute rounded-full bg-white"
              style={{ width: '60%', height: '70%', bottom: 0, left: '20%' }} />
            <div className="absolute rounded-full bg-white"
              style={{ width: '45%', height: '65%', bottom: '10%', left: '5%' }} />
            <div className="absolute rounded-full bg-white"
              style={{ width: '50%', height: '75%', bottom: '5%', right: '8%' }} />
            <div className="absolute rounded-full bg-white"
              style={{ width: '70%', height: '50%', bottom: 0, left: '15%' }} />
          </div>
        </div>
      ))}

      {/* ── Mountain ridges ── */}
      <div className="absolute bottom-[30px] left-0 right-0 h-[200px]">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 120% 60% at 30% 110%, #a07040 60%, transparent 70%),
              radial-gradient(ellipse 80%  50% at 80% 120%, #8a6030 60%, transparent 72%)
            `,
          }}
        />
      </div>

      <DesktopIcons />

      {/* ── Windows ── */}
      <AboutWindow />
      <ExperienceWindow />
      <SkillsWindow />
      <EducationWindow />
      <ContactWindow />
      <ProjectsWindow />
      <CmdWindow />
      <QuizWindow />
      <RadarWindow />
      <TimelineWindow />
      <CertsWindow />
      <RateCardWindow />
      <SnippetsWindow />
      <ShortcutsWindow />

      {/* ── Daily Dev Quote (bottom-right, above taskbar) ── */}
      <motion.div
        className="absolute right-3 pointer-events-none select-none"
        style={{ bottom: 38, maxWidth: 280, zIndex: 6 }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 1 }}
      >
        <div
          className="text-[9px] leading-relaxed text-right px-2 py-1.5"
          style={{
            color: 'rgba(255,255,255,0.55)',
            textShadow: '0 1px 3px rgba(0,0,0,0.6)',
            fontFamily: 'Tahoma, sans-serif',
            fontStyle: 'italic',
          }}
        >
          {todayQuote}
        </div>
      </motion.div>

      <Taskbar onLogOff={onLogOff} />
      <BalloonNotification />
      <Screensaver />

      {/* ── Right-click context menu ── */}
      <AnimatePresence>
        {ctxMenu && (
          <>
            {/* invisible backdrop to close on click-away */}
            <div className="absolute inset-0 z-[90]" onClick={closeCtx} onContextMenu={(e) => { e.preventDefault(); closeCtx(); }} />
            <motion.div
              className="absolute z-[91] min-w-[168px]"
              style={{
                left: Math.min(ctxMenu.x, window.innerWidth  - 175),
                top:  Math.min(ctxMenu.y, window.innerHeight - 250),
                background: '#ece9d8',
                border: '1px solid #888',
                boxShadow: '3px 3px 10px rgba(0,0,0,0.45)',
              }}
              initial={{ opacity: 0, scale: 0.92, y: -4 }}
              animate={{ opacity: 1, scale: 1,    y: 0 }}
              exit={{    opacity: 0, scale: 0.92, y: -4 }}
              transition={{ duration: 0.1 }}
            >
              {ctxItems.map((item, i) =>
                item === null ? (
                  <div key={i} className="h-px bg-[#b0ada0] mx-1 my-0.5" />
                ) : (
                  <div
                    key={i}
                    className="px-3 py-1 text-[11px] cursor-pointer hover:bg-[#316ac5] hover:text-white"
                    onClick={(e) => { e.stopPropagation(); item.action(); }}
                  >
                    {item.label}
                  </div>
                )
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
