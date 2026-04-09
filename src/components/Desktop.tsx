'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback, useEffect, memo, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useWindows } from '@/context/WindowContext';
import { playStartupChime } from '@/utils/sounds';
import { devQuotes } from '@/data/portfolio';

import DesktopIcons from './DesktopIcons';
import Taskbar from './Taskbar';
import BalloonNotification from './BalloonNotification';
import Screensaver from './Screensaver';
import AltTabSwitcher from './AltTabSwitcher';

// Lazy-load window components — they're only rendered when opened
const AboutWindow = dynamic(() => import('./windows/AboutWindow'), { ssr: false });
const ExperienceWindow = dynamic(() => import('./windows/ExperienceWindow'), { ssr: false });
const SkillsWindow = dynamic(() => import('./windows/SkillsWindow'), { ssr: false });
const EducationWindow = dynamic(() => import('./windows/EducationWindow'), { ssr: false });
const ContactWindow = dynamic(() => import('./windows/ContactWindow'), { ssr: false });
const ProjectsWindow = dynamic(() => import('./windows/ProjectsWindow'), { ssr: false });
const CmdWindow = dynamic(() => import('./windows/CmdWindow'), { ssr: false });
const QuizWindow = dynamic(() => import('./windows/QuizWindow'), { ssr: false });
const RadarWindow = dynamic(() => import('./windows/RadarWindow'), { ssr: false });
const TimelineWindow = dynamic(() => import('./windows/TimelineWindow'), { ssr: false });
const CertsWindow = dynamic(() => import('./windows/CertsWindow'), { ssr: false });
const RateCardWindow = dynamic(() => import('./windows/RateCardWindow'), { ssr: false });
const SnippetsWindow = dynamic(() => import('./windows/SnippetsWindow'), { ssr: false });
const ShortcutsWindow = dynamic(() => import('./windows/ShortcutsWindow'), { ssr: false });
const MinesweeperWindow = dynamic(() => import('./windows/MinesweeperWindow'), { ssr: false });
const NotepadWindow = dynamic(() => import('./windows/NotepadWindow'), { ssr: false });
const TaskManagerWindow = dynamic(() => import('./windows/TaskManagerWindow'), { ssr: false });

// Cloud data: { delay (s), duration (s), top (%), size (px), opacity }
const CLOUDS = [
  { id: 0, delay: 0,  duration: 55, top:  8, size: 90,  opacity: 0.55 },
  { id: 1, delay: 12, duration: 75, top: 16, size: 130, opacity: 0.45 },
  { id: 2, delay: 4,  duration: 45, top:  5, size: 70,  opacity: 0.6  },
  { id: 3, delay: 28, duration: 65, top: 22, size: 110, opacity: 0.35 },
  { id: 4, delay: 18, duration: 85, top: 12, size: 150, opacity: 0.3  },
] as const;

// XP-inspired wallpaper themes
const WALLPAPERS = [
  { id: 'bliss',    label: 'Bliss',       bg: 'linear-gradient(170deg, #d8c4a0 0%, #c9a870 35%, #b89060 65%, #9a7040 100%)' },
  { id: 'luna',     label: 'Luna',        bg: 'linear-gradient(180deg, #1a6fcd 0%, #2e8de8 40%, #6bb3f5 100%)' },
  { id: 'azul',     label: 'Azul',        bg: 'linear-gradient(170deg, #001840 0%, #003070 45%, #0050a0 100%)' },
  { id: 'autumn',   label: 'Autumn',      bg: 'linear-gradient(160deg, #8b3a12 0%, #c4621a 40%, #e8921a 100%)' },
  { id: 'matrix',   label: 'Matrix',      bg: 'linear-gradient(180deg, #000 0%, #001800 50%, #003000 100%)' },
] as const;
type WallpaperId = typeof WALLPAPERS[number]['id'];

type CtxMenu = { x: number; y: number } | null;

/** Isolated quote carousel — re-renders every 15s without touching Desktop */
const QuoteCarousel = memo(function QuoteCarousel() {
  const [quoteIndex, setQuoteIndex] = useState(() => Math.floor(Date.now() / 86_400_000) % devQuotes.length);
  const [quoteVisible, setQuoteVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteVisible(false);
      setTimeout(() => {
        setQuoteIndex((prev) => (prev + 1) % devQuotes.length);
        setQuoteVisible(true);
      }, 500);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="absolute left-1/2 -translate-x-1/2 pointer-events-none select-none xp-landscape-hide"
      style={{ bottom: 'calc(42px + env(safe-area-inset-bottom, 0px))', zIndex: 6, width: 'min(480px, 90vw)' }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2, duration: 1 }}
    >
      <motion.div
        animate={{ opacity: quoteVisible ? 1 : 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div
          className="inline-block text-center w-full px-3 py-2 rounded"
          style={{
            background: 'rgba(0,0,0,0.45)',
            border: '1px solid rgba(255,255,255,0.15)',
            backdropFilter: 'blur(4px)',
            fontFamily: 'Tahoma, sans-serif',
          }}
        >
          <div
            className="text-[11px] leading-relaxed italic"
            style={{ color: 'rgba(255,255,230,0.92)', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}
          >
            {devQuotes[quoteIndex]}
          </div>
          <div className="mt-1 flex items-center justify-center gap-1">
            {devQuotes.map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-500"
                style={{
                  width: i === quoteIndex ? 14 : 5,
                  height: 5,
                  background: i === quoteIndex ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
});

interface DesktopProps {
  onLogOff: () => void;
}

export default function Desktop({ onLogOff }: DesktopProps) {
  const { openWindow, closeWindow, minimizeAllWindows, windows } = useWindows();
  const [ctxMenu, setCtxMenu] = useState<CtxMenu>(null);
  const [wallpaper, setWallpaper] = useState<WallpaperId>('bliss');
  const [showWallpaper, setShowWallpaper] = useState(false);
  const [wpPos, setWpPos] = useState<{ x: number; y: number } | null>(null);
  const wpRef = useRef<HTMLDivElement>(null);
  const wpDragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);

  // Reset position each time the dialog opens
  useEffect(() => { if (showWallpaper) setWpPos(null); }, [showWallpaper]);

  const startWpDrag = (startX: number, startY: number) => {
    const rect = wpRef.current?.getBoundingClientRect();
    if (!rect) return;
    wpDragRef.current = { startX, startY, origX: rect.left, origY: rect.top };
  };

  const handleWpTitleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    startWpDrag(e.clientX, e.clientY);
    const onMove = (ev: MouseEvent) => {
      if (!wpDragRef.current) return;
      setWpPos({
        x: wpDragRef.current.origX + (ev.clientX - wpDragRef.current.startX),
        y: wpDragRef.current.origY + (ev.clientY - wpDragRef.current.startY),
      });
    };
    const onUp = () => {
      wpDragRef.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const handleWpTitleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    startWpDrag(touch.clientX, touch.clientY);
    const onMove = (ev: TouchEvent) => {
      if (!wpDragRef.current) return;
      const t = ev.touches[0];
      setWpPos({
        x: wpDragRef.current.origX + (t.clientX - wpDragRef.current.startX),
        y: wpDragRef.current.origY + (t.clientY - wpDragRef.current.startY),
      });
    };
    const onEnd = () => {
      wpDragRef.current = null;
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onEnd);
  };

  // Load persisted wallpaper
  useEffect(() => {
    try {
      const saved = localStorage.getItem('nischal-wallpaper') as WallpaperId | null;
      if (saved && WALLPAPERS.some((w) => w.id === saved)) setWallpaper(saved);
    } catch { /* ignore */ }
  }, []);

  const selectWallpaper = (id: WallpaperId) => {
    setWallpaper(id);
    try { localStorage.setItem('nischal-wallpaper', id); } catch { /* ignore */ }
    setShowWallpaper(false);
  };

  // Track which windows have been opened at least once (for lazy mounting)
  const [mountedWindows, setMountedWindows] = useState<Set<string>>(new Set());
  useEffect(() => {
    const openIds = windows.filter((w) => w.isOpen).map((w) => w.id);
    if (openIds.length > 0) {
      setMountedWindows((prev) => {
        const next = new Set(prev);
        openIds.forEach((id) => next.add(id));
        return next;
      });
    }
  }, [windows]);

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
      if (ev.ctrlKey && ev.altKey) {
        const id = map[ev.key.toLowerCase()];
        if (id) { ev.preventDefault(); openWindow(id); }
        return;
      }
      // Alt+F4 — close the topmost active window
      if (ev.altKey && ev.key === 'F4') {
        ev.preventDefault();
        const active = windows
          .filter((w) => w.isOpen && !w.isMinimized)
          .sort((a, b) => b.zIndex - a.zIndex)[0];
        if (active) closeWindow(active.id);
        return;
      }
      // Ctrl+D — show desktop (minimize all)
      if (ev.ctrlKey && ev.key === 'd') {
        ev.preventDefault();
        minimizeAllWindows();
      }
      // Ctrl+Alt+Delete — Task Manager
      if (ev.ctrlKey && ev.altKey && ev.key === 'Delete') {
        ev.preventDefault();
        openWindow('taskmanager');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [openWindow, closeWindow, minimizeAllWindows, windows]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setCtxMenu({ x: e.clientX, y: e.clientY });
  }, []);

  const closeCtx = useCallback(() => setCtxMenu(null), []);

  const ctxItems = [
    { label: 'Arrange Icons By ▶',    action: closeCtx },
    { label: 'Refresh',               action: () => { closeCtx(); window.location.reload(); } },
    null,
    { label: 'Open Shortcuts',        action: () => { closeCtx(); openWindow('shortcuts'); } },
    { label: 'Open Terminal',          action: () => { closeCtx(); openWindow('terminal'); } },
    { label: 'Open Task Manager',     action: () => { closeCtx(); openWindow('taskmanager'); } },
    null,
    { label: 'Personalize…',          action: () => { closeCtx(); setShowWallpaper(true); } },
    { label: 'Properties',            action: () => { closeCtx(); openWindow('about'); } },
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
        className="absolute inset-0 transition-all duration-700"
        style={{ background: WALLPAPERS.find((w) => w.id === wallpaper)?.bg }}
      />

      {/* ── Animated clouds ── */}
      {CLOUDS.map((c) => (
        <div
          key={c.id}
          className="absolute pointer-events-none"
          style={{
            top:     `${c.top}%`,
            opacity: c.opacity,
            willChange: 'transform',
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
      <div className="absolute left-0 right-0 h-[200px]" style={{ bottom: 'calc(30px + env(safe-area-inset-bottom, 0px))' }}>
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

      {/* ── Windows (lazy-mounted on first open) ── */}
      {mountedWindows.has('about') && <AboutWindow />}
      {mountedWindows.has('experience') && <ExperienceWindow />}
      {mountedWindows.has('skills') && <SkillsWindow />}
      {mountedWindows.has('education') && <EducationWindow />}
      {mountedWindows.has('contact') && <ContactWindow />}
      {mountedWindows.has('projects') && <ProjectsWindow />}
      {mountedWindows.has('terminal') && <CmdWindow />}
      {mountedWindows.has('quiz') && <QuizWindow />}
      {mountedWindows.has('radar') && <RadarWindow />}
      {mountedWindows.has('timeline') && <TimelineWindow />}
      {mountedWindows.has('certs') && <CertsWindow />}
      {mountedWindows.has('ratecard') && <RateCardWindow />}
      {mountedWindows.has('snippets') && <SnippetsWindow />}
      {mountedWindows.has('shortcuts') && <ShortcutsWindow />}
      {mountedWindows.has('minesweeper') && <MinesweeperWindow />}
      {mountedWindows.has('notepad') && <NotepadWindow />}
      {mountedWindows.has('taskmanager') && <TaskManagerWindow />}

      <QuoteCarousel />

      <Taskbar onLogOff={onLogOff} />
      <BalloonNotification />
      <Screensaver />
      <AltTabSwitcher />

      {/* ── Wallpaper Picker ── */}
      <AnimatePresence>
        {showWallpaper && (
          <>
            <div className="absolute inset-0 z-[88]" onClick={() => setShowWallpaper(false)} />
            <motion.div
              ref={wpRef}
              className="absolute z-[89]"
              style={wpPos
                ? { left: wpPos.x, top: wpPos.y, background: '#ece9d8', border: '2px solid #0a246a', boxShadow: '4px 4px 18px rgba(0,0,0,0.5)', width: 'min(360px, 95vw)', fontFamily: 'Tahoma, sans-serif' }
                : { left: '50%', top: '50%', transform: 'translate(-50%, -50%)', background: '#ece9d8', border: '2px solid #0a246a', boxShadow: '4px 4px 18px rgba(0,0,0,0.5)', width: 'min(360px, 95vw)', fontFamily: 'Tahoma, sans-serif' }
              }
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1,   opacity: 1 }}
              exit={{    scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Title bar */}
              <div className="h-[26px] flex items-center justify-between px-2"
                style={{ background: 'linear-gradient(180deg,#2c6fca 0%,#1244a8 100%)', cursor: 'move', touchAction: 'none' }}
                onMouseDown={handleWpTitleMouseDown}
                onTouchStart={handleWpTitleTouchStart}>
                <span className="text-white text-[11px] font-bold">🖼️ Personalize — Wallpaper</span>
                <button
                  className="w-[18px] h-[18px] rounded-[2px] border text-white text-[10px] font-bold flex items-center justify-center"
                  style={{ background: 'linear-gradient(180deg,#e86060 0%,#c03030 100%)', borderColor: '#901010' }}
                  onClick={() => setShowWallpaper(false)}
                  aria-label="Close"
                >✕</button>
              </div>
              {/* Wallpaper grid */}
              <div className="p-4">
                <p className="text-[10px] text-[#555] mb-3">Select a wallpaper theme:</p>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {WALLPAPERS.map((wp) => (
                    <button
                      key={wp.id}
                      onClick={() => selectWallpaper(wp.id)}
                      className="flex flex-col items-center gap-1"
                    >
                      <div
                        className="w-full rounded"
                        style={{
                          height: 48,
                          background: wp.bg,
                          border: wallpaper === wp.id ? '2px solid #316ac5' : '2px solid #999',
                          boxShadow: wallpaper === wp.id ? '0 0 0 1px #316ac5' : undefined,
                        }}
                      />
                      <span className="text-[9px] text-[#444]">{wp.label}</span>
                    </button>
                  ))}
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    className="text-[10px] px-4 py-1 border border-[#999] hover:bg-[#d4d0c8]"
                    style={{ background: 'linear-gradient(180deg,#ece9d8 0%,#d4d0c8 100%)' }}
                    onClick={() => setShowWallpaper(false)}
                  >Cancel</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
