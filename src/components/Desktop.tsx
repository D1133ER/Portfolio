'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback, useEffect, memo, useRef, type CSSProperties } from 'react';
import dynamic from 'next/dynamic';
import { useWindows } from '@/context/WindowContext';
import { ls, ss, STORAGE_KEYS } from '@/utils/storage';
import { useTheme, THEMES, type ThemeId } from '@/context/ThemeContext';
import { devQuotes } from '@/data/portfolio';

import { playStartupChime, playSuccess } from '@/utils/sounds';
import DesktopIcons, { type IconSortMode } from './DesktopIcons';
import Taskbar from './Taskbar';
import BalloonNotification from './BalloonNotification';
import Screensaver from './Screensaver';
import AltTabSwitcher from './AltTabSwitcher';
import MobileNav from './MobileNav';

// Lazy-load window components — only mounted on first open
const AboutWindow       = dynamic(() => import('./windows/AboutWindow'),       { ssr: false });
const ExperienceWindow  = dynamic(() => import('./windows/ExperienceWindow'),  { ssr: false });
const SkillsWindow      = dynamic(() => import('./windows/SkillsWindow'),      { ssr: false });
const EducationWindow   = dynamic(() => import('./windows/EducationWindow'),   { ssr: false });
const ContactWindow     = dynamic(() => import('./windows/ContactWindow'),     { ssr: false });
const ProjectsWindow    = dynamic(() => import('./windows/ProjectsWindow'),    { ssr: false });
const CmdWindow         = dynamic(() => import('./windows/CmdWindow'),         { ssr: false });
const QuizWindow        = dynamic(() => import('./windows/QuizWindow'),        { ssr: false });
const RadarWindow       = dynamic(() => import('./windows/RadarWindow'),       { ssr: false });
const TimelineWindow    = dynamic(() => import('./windows/TimelineWindow'),    { ssr: false });
const CertsWindow       = dynamic(() => import('./windows/CertsWindow'),       { ssr: false });
const RateCardWindow    = dynamic(() => import('./windows/RateCardWindow'),    { ssr: false });
const SnippetsWindow    = dynamic(() => import('./windows/SnippetsWindow'),    { ssr: false });
const ShortcutsWindow   = dynamic(() => import('./windows/ShortcutsWindow'),  { ssr: false });
const MinesweeperWindow = dynamic(() => import('./windows/MinesweeperWindow'),{ ssr: false });
const NotepadWindow     = dynamic(() => import('./windows/NotepadWindow'),     { ssr: false });
const TaskManagerWindow = dynamic(() => import('./windows/TaskManagerWindow'), { ssr: false });
const PaintWindow       = dynamic(() => import('./windows/PaintWindow'),       { ssr: false });
const CalculatorWindow  = dynamic(() => import('./windows/CalculatorWindow'),  { ssr: false });
const ControlPanelWindow= dynamic(() => import('./windows/ControlPanelWindow'),{ ssr: false });
const MyComputerWindow  = dynamic(() => import('./windows/MyComputerWindow'),  { ssr: false });
const IEWindow          = dynamic(() => import('./windows/IEWindow'),          { ssr: false });
const MediaPlayerWindow = dynamic(() => import('./windows/MediaPlayerWindow'), { ssr: false });

// Cloud data: { delay (s), duration (s), top (%), size (px), opacity }
const CLOUDS = [
  { id: 0, delay: 0,  duration: 55, top:  8, size: 90,  opacity: 0.55 },
  { id: 1, delay: 12, duration: 75, top: 16, size: 130, opacity: 0.45 },
  { id: 2, delay: 4,  duration: 45, top:  5, size: 70,  opacity: 0.6  },
  { id: 3, delay: 28, duration: 65, top: 22, size: 110, opacity: 0.35 },
  { id: 4, delay: 18, duration: 85, top: 12, size: 150, opacity: 0.3  },
] as const;

const GURU_WALLPAPER_URL = '/wallpapers/gurucool-logic-imagination.png';

type WallpaperId = 'bliss' | 'luna' | 'azul' | 'autumn' | 'matrix' | 'gurucool';

type WallpaperOption = {
  id: WallpaperId;
  label: string;
  description: string;
  previewStyle: CSSProperties;
  desktopStyle: CSSProperties;
  hideSceneDecor?: boolean;
};

// XP-inspired wallpaper themes
const WALLPAPERS: readonly WallpaperOption[] = [
  {
    id: 'bliss',
    label: 'Bliss',
    description: 'Warm XP-inspired dusk gradient with the classic desktop scene.',
    previewStyle: { background: 'linear-gradient(170deg, #d8c4a0 0%, #c9a870 35%, #b89060 65%, #9a7040 100%)' },
    desktopStyle: { background: 'linear-gradient(170deg, #d8c4a0 0%, #c9a870 35%, #b89060 65%, #9a7040 100%)' },
  },
  {
    id: 'luna',
    label: 'Luna',
    description: 'Bright blue sky tones with the animated XP cloud scene.',
    previewStyle: { background: 'linear-gradient(180deg, #1a6fcd 0%, #2e8de8 40%, #6bb3f5 100%)' },
    desktopStyle: { background: 'linear-gradient(180deg, #1a6fcd 0%, #2e8de8 40%, #6bb3f5 100%)' },
  },
  {
    id: 'azul',
    label: 'Azul',
    description: 'Deep evening blues for a darker desktop mood.',
    previewStyle: { background: 'linear-gradient(170deg, #001840 0%, #003070 45%, #0050a0 100%)' },
    desktopStyle: { background: 'linear-gradient(170deg, #001840 0%, #003070 45%, #0050a0 100%)' },
  },
  {
    id: 'autumn',
    label: 'Autumn',
    description: 'Orange and amber tones with the same XP mountain foreground.',
    previewStyle: { background: 'linear-gradient(160deg, #8b3a12 0%, #c4621a 40%, #e8921a 100%)' },
    desktopStyle: { background: 'linear-gradient(160deg, #8b3a12 0%, #c4621a 40%, #e8921a 100%)' },
  },
  {
    id: 'matrix',
    label: 'Matrix',
    description: 'Dark monochrome green for the retro terminal vibe.',
    previewStyle: { background: 'linear-gradient(180deg, #000 0%, #001800 50%, #003000 100%)' },
    desktopStyle: { background: 'linear-gradient(180deg, #000 0%, #001800 50%, #003000 100%)' },
  },
  {
    id: 'gurucool',
    label: 'GuruCOOL',
    description: 'Uploaded artwork with the "Guru Knows" theme and the logic-versus-imagination scene.',
    previewStyle: {
      backgroundColor: '#0b1732',
      backgroundImage: `url(${GURU_WALLPAPER_URL})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    },
    desktopStyle: {
      backgroundColor: '#0b1732',
      backgroundImage: `url(${GURU_WALLPAPER_URL})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    },
    hideSceneDecor: true,
  },
];

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
  const { themeId, setTheme } = useTheme();
  const [ctxMenu, setCtxMenu] = useState<CtxMenu>(null);
  const [sortMode, setSortMode] = useState<IconSortMode>(null);
  const [onboardingStep, setOnboardingStep] = useState<number | null>(null);
  const [wallpaper, setWallpaper] = useState<WallpaperId>(() => {
    const saved = ls.get<string>(STORAGE_KEYS.WALLPAPER, 'bliss') as WallpaperId;
    return WALLPAPERS.some((o) => o.id === saved) ? saved : 'bliss';
  });
  const [showWallpaper, setShowWallpaper] = useState(false);
  const [personalizeTab, setPersonalizeTab] = useState<'wallpaper' | 'appearance'>('wallpaper');
  const [wpPos, setWpPos] = useState<{ x: number; y: number } | null>(null);
  const wpRef = useRef<HTMLDivElement>(null);
  const wpDragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);

  const openWallpaperPicker = useCallback(() => {
    setWpPos(null);
    setShowWallpaper(true);
  }, []);

  const closeWallpaperPicker = useCallback(() => {
    setWpPos(null);
    setShowWallpaper(false);
  }, []);

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

  const selectWallpaper = (id: WallpaperId) => {
    setWallpaper(id);
    ls.set(STORAGE_KEYS.WALLPAPER, id);
    closeWallpaperPicker();
  };

  const selectedWallpaper = WALLPAPERS.find((w) => w.id === wallpaper) ?? WALLPAPERS[0];

  // Track which windows have been opened at least once (for lazy mounting)
  const [mountedWindows, setMountedWindows] = useState<Set<string>>(new Set());
  useEffect(() => {
    const openIds = windows.filter((w) => w.isOpen).map((w) => w.id);
    if (openIds.length === 0) return;

    const frame = window.requestAnimationFrame(() => {
      setMountedWindows((prev) => {
        const next = new Set(prev);
        openIds.forEach((id) => next.add(id));
        return next;
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [windows]);

  // ── Konami code easter egg ────────────────────────────────────────────────
  const konamiBuffer = useRef<string[]>([]);
  const [showKonami, setShowKonami] = useState(false);
  const KONAMI_SEQ = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  // ── Onboarding tooltip chain (first visit only) ──────────────────────────
  const ONBOARDING_TIPS = [
    { text: '👆 Double-click icons to open windows', hint: 'Try the icons on the left!' },
    { text: '📌 Right-click the desktop for options', hint: 'Personalize, refresh, and more' },
    { text: '⌨️ Press Ctrl+Alt+K for all shortcuts',  hint: 'Open: Keyboard Shortcuts — help.exe' },
  ];

  useEffect(() => {
    const done = ls.get<boolean>(STORAGE_KEYS.ONBOARDING_DONE, false);
    if (!done) {
      const t = setTimeout(() => setOnboardingStep(0), 2000);
      return () => clearTimeout(t);
    }
  }, []); // eslint-disable-line

  // Auto-advance onboarding tips
  useEffect(() => {
    if (onboardingStep === null) return;
    const t = setTimeout(() => {
      if (onboardingStep >= ONBOARDING_TIPS.length - 1) {
        setOnboardingStep(null);
        ls.set(STORAGE_KEYS.ONBOARDING_DONE, true);
      } else {
        setOnboardingStep((p) => (p ?? 0) + 1);
      }
    }, 4500);
    return () => clearTimeout(t);
  }, [onboardingStep]); // eslint-disable-line

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
      // Konami code sequence tracker
      konamiBuffer.current = [...konamiBuffer.current, ev.key].slice(-10);
      if (konamiBuffer.current.join('|') === KONAMI_SEQ.join('|')) {
        konamiBuffer.current = [];
        playSuccess();
        setShowKonami(true);
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
    { label: 'Arrange Icons By Name',   action: () => { closeCtx(); setSortMode('name'); } },
    { label: 'Arrange Icons By Type',   action: () => { closeCtx(); setSortMode('type'); } },
    { label: 'Auto Arrange',            action: () => { closeCtx(); setSortMode(null); } },
    { label: 'Refresh',               action: () => { closeCtx(); window.location.reload(); } },
    null,
    { label: 'Open Shortcuts',        action: () => { closeCtx(); openWindow('shortcuts'); } },
    { label: 'Open Terminal',          action: () => { closeCtx(); openWindow('terminal'); } },
    { label: 'Open Task Manager',     action: () => { closeCtx(); openWindow('taskmanager'); } },
    null,
    { label: 'Personalize…',          action: () => { closeCtx(); openWallpaperPicker(); } },
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
        style={selectedWallpaper.desktopStyle}
      />

      {/* ── Animated clouds ── */}
      {!selectedWallpaper.hideSceneDecor && CLOUDS.map((c) => (
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
      {!selectedWallpaper.hideSceneDecor && (
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
      )}

      <DesktopIcons sortMode={sortMode} />

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
      {mountedWindows.has('paint')       && <PaintWindow />}
      {mountedWindows.has('calculator')  && <CalculatorWindow />}
      {mountedWindows.has('controlpanel')&& <ControlPanelWindow />}
      {mountedWindows.has('mycomputer')  && <MyComputerWindow />}
      {mountedWindows.has('ie')          && <IEWindow />}
      {mountedWindows.has('mediaplayer') && <MediaPlayerWindow />}

      {!selectedWallpaper.hideSceneDecor && <QuoteCarousel />}

      <Taskbar onLogOff={onLogOff} />
      <MobileNav />
      <BalloonNotification />
      <Screensaver />
      <AltTabSwitcher />

      {/* ── Onboarding tooltip chain ── */}
      <AnimatePresence>
        {onboardingStep !== null && (
          <motion.div
            key={`tip-${onboardingStep}`}
            className="absolute z-[80] pointer-events-auto"
            style={{
              bottom: 'calc(48px + env(safe-area-inset-bottom, 0px) + 8px)',
              left: '50%',
              transform: 'translateX(-50%)',
              maxWidth: 'min(340px, 90vw)',
            }}
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{    opacity: 0, y: 8,  scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          >
            <div
              className="flex flex-col gap-1 px-4 py-3 rounded"
              style={{
                background: 'rgba(0,0,0,0.82)',
                border: '1px solid rgba(255,255,255,0.18)',
                backdropFilter: 'blur(6px)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                fontFamily: 'Tahoma, sans-serif',
              }}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-white text-[11px] font-bold mb-0.5">
                    {ONBOARDING_TIPS[onboardingStep].text}
                  </div>
                  <div className="text-white/60 text-[10px]">
                    {ONBOARDING_TIPS[onboardingStep].hint}
                  </div>
                </div>
                <button
                  className="text-white/50 hover:text-white text-[10px] whitespace-nowrap flex-shrink-0 px-2 py-1 border border-white/20 hover:border-white/40 rounded transition-colors"
                  onClick={() => {
                    setOnboardingStep(null);
                    ls.set(STORAGE_KEYS.ONBOARDING_DONE, true);
                  }}
                >
                  Got it
                </button>
              </div>
              {/* Step indicator dots */}
              <div className="flex justify-center gap-1.5 mt-1">
                {ONBOARDING_TIPS.map((_, i) => (
                  <div key={i} className="rounded-full transition-all duration-300"
                    style={{
                      width:  i === onboardingStep ? 14 : 5,
                      height: 5,
                      background: i === onboardingStep ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Personalize Dialog (Wallpaper + Appearance) ── */}
      <AnimatePresence>
        {showWallpaper && (
          <>
            <div className="absolute inset-0 z-[88]" onClick={closeWallpaperPicker} />
            <motion.div
              ref={wpRef}
              className="absolute z-[89] flex flex-col"
              style={wpPos
                ? { left: wpPos.x, top: wpPos.y, background: 'var(--win-bg)', border: '2px solid var(--win-border)', boxShadow: '4px 4px 18px rgba(0,0,0,0.5)', width: 'min(380px, 95vw)', maxHeight: 'calc(100dvh - 20px)', overflow: 'hidden', fontFamily: 'Tahoma, sans-serif' }
                : { left: '50%', top: '50%', transform: 'translate(-50%, -50%)', background: 'var(--win-bg)', border: '2px solid var(--win-border)', boxShadow: '4px 4px 18px rgba(0,0,0,0.5)', width: 'min(380px, 95vw)', maxHeight: 'calc(100dvh - 20px)', overflow: 'hidden', fontFamily: 'Tahoma, sans-serif' }
              }
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1,   opacity: 1 }}
              exit={{    scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Title bar */}
              <div className="h-[26px] flex items-center justify-between px-2 flex-shrink-0"
                style={{ background: 'linear-gradient(180deg,var(--tb-from) 0%,var(--tb-to) 100%)', cursor: 'move', touchAction: 'none' }}
                onMouseDown={handleWpTitleMouseDown}
                onTouchStart={handleWpTitleTouchStart}>
                <span className="text-white text-[11px] font-bold">🎨 Personalize — Display Properties</span>
                <button className="w-[18px] h-[18px] rounded-[2px] border text-white text-[10px] font-bold flex items-center justify-center"
                  style={{ background: 'linear-gradient(180deg,#e86060 0%,#c03030 100%)', borderColor: '#901010' }}
                  onClick={closeWallpaperPicker} aria-label="Close">✕</button>
              </div>

              {/* Tab bar */}
              <div className="flex gap-0.5 px-2 pt-1.5 flex-shrink-0" style={{ borderBottom: '1px solid #b8b5a8' }}>
                {(['wallpaper', 'appearance'] as const).map((tab) => (
                  <button key={tab} onClick={() => setPersonalizeTab(tab)}
                    className="px-3 py-0.5 text-[10px] border-t border-x capitalize"
                    style={{
                      background: personalizeTab === tab ? 'var(--win-bg)' : '#d4d0c8',
                      borderColor: '#b8b5a8',
                      borderBottomColor: personalizeTab === tab ? 'var(--win-bg)' : '#b8b5a8',
                      fontWeight: personalizeTab === tab ? 'bold' : 'normal',
                      marginBottom: personalizeTab === tab ? -1 : 0,
                      zIndex: personalizeTab === tab ? 1 : 0,
                      position: 'relative',
                    }}>
                    {tab === 'wallpaper' ? '🖼️ Wallpaper' : '🎨 Appearance'}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="p-4 overflow-y-auto flex-1">

                {/* ── Wallpaper tab ── */}
                {personalizeTab === 'wallpaper' && (
                  <>
                    <p className="text-[10px] text-[#555] mb-3">Select a desktop background:</p>
                    <div className="mb-4 border border-[#b8b5a8] p-2.5" style={{ background: 'linear-gradient(180deg,#f7f4ea 0%,var(--win-bg) 100%)' }}>
                      <div className="w-full rounded border border-[#999]" style={{ aspectRatio: '16/10', ...selectedWallpaper.previewStyle }} />
                      <div className="mt-2">
                        <div className="text-[10px] font-bold" style={{ color: 'var(--win-border)' }}>{selectedWallpaper.label}</div>
                        <p className="text-[9px] text-[#666] mt-1 leading-snug">{selectedWallpaper.description}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {WALLPAPERS.map((wp) => (
                        <button key={wp.id} onClick={() => selectWallpaper(wp.id)} className="flex flex-col items-center gap-1">
                          <div className="w-full rounded" style={{ height: 48, ...wp.previewStyle, border: wallpaper === wp.id ? '2px solid var(--accent)' : '2px solid #999', boxShadow: wallpaper === wp.id ? '0 0 0 1px var(--accent)' : undefined }} />
                          <span className="text-[9px] text-[#444]">{wp.label}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {/* ── Appearance tab ── */}
                {personalizeTab === 'appearance' && (
                  <>
                    <p className="text-[10px] text-[#555] mb-3">Choose a Windows XP colour scheme:</p>
                    <div className="flex flex-col gap-2">
                      {(Object.values(THEMES) as import('@/context/ThemeContext').XPTheme[]).map((t) => (
                        <button key={t.id}
                          onClick={() => setTheme(t.id as ThemeId)}
                          className="flex items-center gap-3 px-3 py-2 border text-left"
                          style={{
                            background: themeId === t.id ? `${t.accent}18` : 'linear-gradient(180deg,#ece9d8 0%,#d4d0c8 100%)',
                            borderColor: themeId === t.id ? t.accent : '#b8b5a8',
                            borderWidth: themeId === t.id ? 2 : 1,
                          }}
                        >
                          {/* Colour swatch */}
                          <div className="w-10 h-8 rounded flex-shrink-0 border border-[#888]" style={{ background: t.swatch }} />
                          <div className="flex-1 min-w-0">
                            <div className="text-[10px] font-bold text-[#0a246a]">{t.name}</div>
                            <div className="flex gap-1 mt-0.5">
                              {[t.tbFrom, t.accent, t.winBg].map((c, i) => (
                                <div key={i} className="w-3 h-3 rounded-sm border border-[#aaa]" style={{ background: c }} />
                              ))}
                            </div>
                          </div>
                          {themeId === t.id && <span className="text-[10px] font-bold flex-shrink-0" style={{ color: t.accent }}>✓ Active</span>}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-[#b8b5a8]">
                  <button className="text-[10px] px-4 py-1 border border-[#999] hover:bg-[#d4d0c8]"
                    style={{ background: 'linear-gradient(180deg,#ece9d8 0%,#d4d0c8 100%)' }}
                    onClick={closeWallpaperPicker}>OK</button>
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

      {/* ── Konami Code Easter Egg ── */}
      <AnimatePresence>
        {showKonami && (
          <motion.div className="absolute inset-0 z-[200] flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.6)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowKonami(false)}>
            <motion.div
              className="text-center p-6 max-w-[340px] w-[90vw]"
              style={{ background: '#000080', border: '3px solid #00ff41', boxShadow: '0 0 40px #00ff41aa', fontFamily: 'Tahoma, sans-serif' }}
              initial={{ scale: 0.5, rotate: -10 }} animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-3xl mb-2">🎮</div>
              <div className="text-[#00ff41] font-bold text-[13px] mb-1">↑↑↓↓←→←→ BA</div>
              <div className="text-white font-bold text-[16px] mb-3">CHEAT CODE ACTIVATED!</div>
              <div className="text-[#00ff41] text-[11px] mb-3 leading-relaxed">
                <div>+99 → All Technical Skills</div>
                <div>+∞ → Coffee Consumed</div>
                <div>+1 → Secret Discovered</div>
                <div className="mt-2 text-[10px] text-[#00ff4188]">You found the Konami Code!<br/>Now you know Nischal is a gamer too. 😄</div>
              </div>
              <motion.button
                className="text-[11px] px-5 py-1.5 font-bold border border-[#00ff41] text-[#00ff41] cursor-pointer"
                style={{ background: 'rgba(0,255,65,0.1)' }}
                whileHover={{ background: 'rgba(0,255,65,0.25)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowKonami(false)}
              >
                [ENTER] Continue
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
