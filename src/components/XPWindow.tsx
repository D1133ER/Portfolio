'use client';

import { motion } from 'framer-motion';
import { useRef, ReactNode, useEffect } from 'react';
import { useWindows } from '@/context/WindowContext';
import { WindowId } from '@/types';
import { playWindowOpen, playWindowClose, playClick } from '@/utils/sounds';

interface XPWindowProps {
  id: WindowId;
  children: ReactNode;
  menuItems?: string[];
  statusText?: string;
  toolbar?: ReactNode;
  /** Remove default padding so child can own its own layout */
  noPadding?: boolean;
}

export default function XPWindow({
  id,
  children,
  menuItems = ['File', 'Edit', 'View', 'Help'],
  statusText,
  toolbar,
  noPadding = false,
}: XPWindowProps) {
  const {
    windows,
    getWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    focusWindow,
    moveWindow,
    resizeWindow,
  } = useWindows();

  const dragRef  = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const resizeRef = useRef<{ startX: number; startY: number; origW: number; origH: number; dir: string } | null>(null);
  const windowRef = useRef<HTMLDivElement>(null);

  const win = getWindow(id);

  // Play sound when the window opens
  const prevOpenRef = useRef(false);
  useEffect(() => {
    if (win?.isOpen && !prevOpenRef.current) playWindowOpen();
    prevOpenRef.current = win?.isOpen ?? false;
  }, [win?.isOpen]);

  if (!win || !win.isOpen) return null;

  // Determine active window (highest zIndex among open, non-minimized)
  const maxZ = Math.max(
    ...windows.filter((w) => w.isOpen && !w.isMinimized).map((w) => w.zIndex),
    0
  );
  const isActive = win.zIndex === maxZ && !win.isMinimized;

  // ── Title bar drag ──────────────────────────────────────────────────────────
  const handleTitleMouseDown = (e: React.MouseEvent) => {
    if (win.isMaximized) return;
    e.preventDefault();
    focusWindow(id);
    const parent = windowRef.current?.parentElement?.getBoundingClientRect();
    if (!parent) return;
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: win.position.x, origY: win.position.y };

    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const nx = Math.max(0, Math.min(dragRef.current.origX + ev.clientX - dragRef.current.startX, parent.width  - 60));
      const ny = Math.max(0, Math.min(dragRef.current.origY + ev.clientY - dragRef.current.startY, parent.height - 30));
      moveWindow(id, { x: nx, y: ny });
    };
    const onUp = () => {
      dragRef.current = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  // ── Resize handle drag ──────────────────────────────────────────────────────
  const handleResizeMouseDown = (e: React.MouseEvent, dir: string) => {
    e.stopPropagation();
    e.preventDefault();
    resizeRef.current = { startX: e.clientX, startY: e.clientY, origW: win.size.width, origH: win.size.height, dir };

    const onMove = (ev: MouseEvent) => {
      if (!resizeRef.current) return;
      const dx = ev.clientX - resizeRef.current.startX;
      const dy = ev.clientY - resizeRef.current.startY;
      const newW = resizeRef.current.dir.includes('e') ? Math.max(260, resizeRef.current.origW + dx) : resizeRef.current.origW;
      const newH = resizeRef.current.dir.includes('s') ? Math.max(160, resizeRef.current.origH + dy) : resizeRef.current.origH;
      resizeWindow(id, { width: newW, height: newH });
    };
    const onUp = () => {
      resizeRef.current = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  // ── Title bar double-click toggle maximize ──────────────────────────────────
  const handleTitleDoubleClick = () => {
    if (win.isMaximized) restoreWindow(id); else maximizeWindow(id);
  };

  // ── Styles ──────────────────────────────────────────────────────────────────
  const posStyle = win.isMaximized
    ? ({ position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: 'calc(100% - 30px)' })
    : ({ position: 'absolute' as const, top: win.position.y, left: win.position.x, width: win.size.width, height: win.size.height });

  const titleGrad = isActive
    ? 'linear-gradient(180deg, #2c6fca 0%, #1748b0 50%, #1244a8 100%)'
    : 'linear-gradient(180deg, #7a96c2 0%, #5a75a8 50%, #4a6490 100%)';

  return (
    <motion.div
      ref={windowRef}
      className="flex flex-col border border-[#0a246a] rounded-t-md select-none"
      style={{
        ...posStyle,
        zIndex: win.zIndex,
        background: '#ece9d8',
        boxShadow: isActive ? '4px 4px 18px rgba(0,0,0,0.65)' : '2px 2px 8px rgba(0,0,0,0.3)',
        pointerEvents: win.isMinimized ? 'none' : 'auto',
        overflow: 'hidden',
      }}
      animate={
        win.isMinimized
          ? { scale: 0.15, opacity: 0, y: 120, transition: { duration: 0.18, ease: 'easeIn' } }
          : { scale: 1,    opacity: 1, y: 0,   transition: { type: 'spring', stiffness: 320, damping: 28 } }
      }
      initial={{ scale: 0.3, opacity: 0, y: 60 }}
      exit={{ scale: 0.2, opacity: 0, y: 80, transition: { duration: 0.15 } }}
      onMouseDown={() => focusWindow(id)}
    >
      {/* ── Title Bar ── */}
      <div
        className="h-[26px] flex items-center gap-1.5 px-1.5 flex-shrink-0 rounded-t-[5px]"
        style={{ background: titleGrad, cursor: win.isMaximized ? 'default' : 'move' }}
        onMouseDown={handleTitleMouseDown}
        onDoubleClick={handleTitleDoubleClick}
      >
        <span className="text-sm leading-none flex-shrink-0">{win.icon}</span>
        <span className="flex-1 text-white text-[11px] font-bold truncate" style={{ textShadow: '1px 1px 1px #0a2060' }}>
          {win.title}
        </span>
        <div className="flex gap-0.5 flex-shrink-0">
          {/* Minimize */}
          <motion.button
            className="w-[21px] h-[21px] rounded-[3px] border flex items-center justify-center text-white text-[11px] font-bold"
            style={{ background: 'linear-gradient(180deg, #4fa0e8 0%, #2878c8 100%)', borderColor: '#1a4a90' }}
            whileHover={{ filter: 'brightness(1.3)' }} whileTap={{ scale: 0.88 }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); playClick(); minimizeWindow(id); }}
          >
            <span style={{ marginTop: 4, display: 'block', lineHeight: 1 }}>_</span>
          </motion.button>
          {/* Maximize / Restore */}
          <motion.button
            className="w-[21px] h-[21px] rounded-[3px] border flex items-center justify-center text-white text-[10px] font-bold"
            style={{ background: 'linear-gradient(180deg, #4fa0e8 0%, #2878c8 100%)', borderColor: '#1a4a90' }}
            whileHover={{ filter: 'brightness(1.3)' }} whileTap={{ scale: 0.88 }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); playClick(); win.isMaximized ? restoreWindow(id) : maximizeWindow(id); }}
            title={win.isMaximized ? 'Restore' : 'Maximize'}
          >
            {win.isMaximized ? '❐' : '□'}
          </motion.button>
          {/* Close */}
          <motion.button
            className="w-[21px] h-[21px] rounded-[3px] border flex items-center justify-center text-white text-[11px] font-bold"
            style={{ background: 'linear-gradient(180deg, #e86060 0%, #c03030 100%)', borderColor: '#901010' }}
            whileHover={{ filter: 'brightness(1.3)' }} whileTap={{ scale: 0.88 }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); playWindowClose(); closeWindow(id); }}
          >
            ✕
          </motion.button>
        </div>
      </div>

      {/* ── Menu Bar ── */}
      <div className="h-[22px] bg-[#ece9d8] border-b border-[#aaa] flex items-center px-1 flex-shrink-0">
        {menuItems.map((item) => (
          <motion.span
            key={item}
            className="px-2 py-0.5 text-[11px] cursor-pointer rounded-sm"
            whileHover={{ backgroundColor: '#316ac5', color: '#fff' }}
          >
            {item}
          </motion.span>
        ))}
      </div>

      {/* ── Toolbar (optional) ── */}
      {toolbar}

      {/* ── Content ── */}
      <div className={`flex-1 min-h-0 relative${noPadding ? ' overflow-hidden' : ' overflow-y-auto overflow-x-hidden p-2.5'}`}>
        {children}
      </div>

      {/* ── Status Bar ── */}
      {statusText && (
        <div className="h-[20px] bg-[#ece9d8] border-t border-[#aaa] flex items-center px-2 text-[10px] text-[#444] gap-2 flex-shrink-0">
          {statusText.split('|').map((part, idx) => (
            <span key={idx} className={idx > 0 ? 'border-l border-[#aaa] pl-2' : ''}>
              {part.trim()}
            </span>
          ))}
        </div>
      )}

      {/* ── Resize handles (not when maximized) ── */}
      {!win.isMaximized && (
        <>
          {/* Right edge */}
          <div
            className="absolute top-0 right-0 w-1 h-full cursor-e-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, 'e')}
          />
          {/* Bottom edge */}
          <div
            className="absolute bottom-0 left-0 right-3 h-1 cursor-s-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, 's')}
          />
          {/* Bottom-right corner gripper */}
          <div
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize flex items-end justify-end pb-0.5 pr-0.5"
            onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" className="opacity-40">
              <circle cx="8" cy="8" r="1.2" fill="#555"/>
              <circle cx="4.5" cy="8" r="1.2" fill="#555"/>
              <circle cx="8" cy="4.5" r="1.2" fill="#555"/>
            </svg>
          </div>
        </>
      )}
    </motion.div>
  );
}
