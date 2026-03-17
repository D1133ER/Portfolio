'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback, useEffect } from 'react';
import { useWindows } from '@/context/WindowContext';

import DesktopIcons from './DesktopIcons';
import Taskbar from './Taskbar';
import AboutWindow from './windows/AboutWindow';
import ExperienceWindow from './windows/ExperienceWindow';
import SkillsWindow from './windows/SkillsWindow';
import EducationWindow from './windows/EducationWindow';
import ContactWindow from './windows/ContactWindow';
import ProjectsWindow from './windows/ProjectsWindow';

type CtxMenu = { x: number; y: number } | null;

interface DesktopProps {
  onLogOff: () => void;
}

export default function Desktop({ onLogOff }: DesktopProps) {
  const { openWindow } = useWindows();
  const [ctxMenu, setCtxMenu] = useState<CtxMenu>(null);

  // Auto-open the About window when the desktop first loads
  useEffect(() => {
    const t = setTimeout(() => openWindow('about'), 400);
    return () => clearTimeout(t);
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

      <Taskbar onLogOff={onLogOff} />

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
