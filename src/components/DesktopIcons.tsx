'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback, useRef, useMemo } from 'react';
import { useWindows } from '@/context/WindowContext';
import { WindowId } from '@/types';

export type IconSortMode = 'name' | 'type' | null;

const desktopIcons: { id: WindowId | '__recycle__'; icon: string; label: string }[] = [
  { id: 'about',       icon: '🖥️', label: 'My Portfolio'  },
  { id: 'projects',    icon: '📂', label: 'My Projects'   },
  { id: 'skills',      icon: '⚙️', label: 'My Skills'     },
  { id: 'terminal',    icon: '💻', label: 'cmd.exe'       },
  { id: 'quiz',        icon: '🇩🇪', label: 'Deutsch Quiz' },
  { id: 'radar',       icon: '📊', label: 'Skill Radar'  },
  { id: 'timeline',    icon: '📅', label: 'Timeline'      },
  { id: 'certs',       icon: '🏆', label: 'Credentials'  },
  { id: 'ratecard',    icon: '💼', label: 'Services'      },
  { id: 'snippets',    icon: '📝', label: 'Code Snippets'},
  { id: 'shortcuts',   icon: '⌨️', label: 'Shortcuts'    },
  { id: 'minesweeper', icon: '💣', label: 'Minesweeper'  },
  { id: 'notepad',     icon: '🗒️', label: 'Notepad'      },
  { id: 'taskmanager', icon: '📋', label: 'Task Mgr'     },
  { id: 'paint',       icon: '🎨', label: 'Paint'       },
  { id: 'calculator',  icon: '🔢', label: 'Calculator'  },
  { id: 'controlpanel',icon: '⚙️', label: 'Control Panel'},
  { id: 'mycomputer',  icon: '💻', label: 'My Computer' },
  { id: 'ie',          icon: '🌐', label: 'Internet Exp.'},
  { id: 'mediaplayer', icon: '▶️', label: 'Media Player'},
  { id: '__recycle__', icon: '🗑️', label: 'Recycle Bin'  },
];

// Map WindowId → display title for the Recycle Bin dialog
const windowTitles: Record<WindowId, string> = {
  about:      'My Portfolio',
  experience: 'My Experience',
  skills:     'My Skills',
  education:  'Education',
  contact:    'Contact Me',
  projects:   'My Projects',
  terminal:   'Command Prompt',
  quiz:       'Deutsch Quiz',
  radar:      'Skill Radar',
  timeline:   'Career Timeline',
  certs:      'Credentials',
  ratecard:   'Services',
  snippets:   'Code Snippets',
  shortcuts:  'Shortcuts',
  minesweeper: 'Minesweeper',
  notepad:    'Notepad',
  taskmanager: 'Task Manager',
  paint:       'Paint',
  calculator:  'Calculator',
  controlpanel:'Control Panel',
  mycomputer:  'My Computer',
  ie:          'Internet Explorer',
  mediaplayer: 'Media Player',
};

const windowIcons: Record<WindowId, string> = {
  about: '🖥️', experience: '📁', skills: '⚙️', education: '🎓',
  contact: '✉️', projects: '📂', terminal: '💻', quiz: '🇩🇪',
  radar: '📊', timeline: '📅', certs: '🏆', ratecard: '💼',
  snippets: '📝', shortcuts: '⌨️',
  minesweeper: '💣', notepad: '🗒️', taskmanager: '📋', paint: '🎨',
  calculator: '🔢', controlpanel: '⚙️', mycomputer: '💻', ie: '🌐', mediaplayer: '▶️',
};

export default function DesktopIcons({ sortMode }: { sortMode?: IconSortMode }) {
  const { openWindow, recycledIds, restoreFromRecycle, emptyRecycleBin } = useWindows();
  const [selected, setSelected] = useState<string | null>(null);
  const [showRecycleBin, setShowRecycleBin] = useState(false);
  const [iconMenu, setIconMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [recycleBinPos, setRecycleBinPos] = useState<{ x: number; y: number } | null>(null);
  const recycleDragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const recycleDialogRef = useRef<HTMLDivElement>(null);
  const recycleRafRef = useRef(0);

  const handleRecycleDragStart = useCallback((clientX: number, clientY: number) => {
    const el = recycleDialogRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pos = recycleBinPos ?? { x: rect.left, y: rect.top };
    recycleDragRef.current = { startX: clientX, startY: clientY, origX: pos.x, origY: pos.y };

    const onMove = (cx: number, cy: number) => {
      if (!recycleDragRef.current) return;
      cancelAnimationFrame(recycleRafRef.current);
      recycleRafRef.current = requestAnimationFrame(() => {
        if (!recycleDragRef.current) return;
        const nx = recycleDragRef.current.origX + cx - recycleDragRef.current.startX;
        const ny = Math.max(0, recycleDragRef.current.origY + cy - recycleDragRef.current.startY);
        setRecycleBinPos({ x: nx, y: ny });
      });
    };
    const onMouseMove = (ev: MouseEvent) => onMove(ev.clientX, ev.clientY);
    const onTouchMove = (ev: TouchEvent) => { ev.preventDefault(); onMove(ev.touches[0].clientX, ev.touches[0].clientY); };
    const onUp = () => {
      recycleDragRef.current = null;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onUp);
  }, [recycleBinPos]);

  const handleClick = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelected(id);
    setIconMenu(null);
  }, []);

  const handleIconContextMenu = useCallback((id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelected(id);
    setIconMenu({ id, x: e.clientX, y: e.clientY });
  }, []);

  // Sorted icon list derived from sortMode prop
  const sortedIcons = useMemo(() => {
    const appIcons = desktopIcons.filter((i) => i.id !== '__recycle__');
    const recycle  = desktopIcons.filter((i) => i.id === '__recycle__');
    if (sortMode === 'name') {
      return [...appIcons.sort((a, b) => a.label.localeCompare(b.label)), ...recycle];
    }
    if (sortMode === 'type') {
      return [
        ...appIcons.filter((i) => !['minesweeper','notepad','paint'].includes(i.id as string)).sort((a, b) => a.label.localeCompare(b.label)),
        ...appIcons.filter((i) =>  ['minesweeper','notepad','paint'].includes(i.id as string)).sort((a, b) => a.label.localeCompare(b.label)),
        ...recycle,
      ];
    }
    return desktopIcons;
  }, [sortMode]);

  const handleDoubleClick = useCallback((id: string) => {
    if (id === '__recycle__') {
      setRecycleBinPos(null);
      setShowRecycleBin(true);
      return;
    }
    openWindow(id as WindowId);
    setSelected(id);
  }, [openWindow]);

  return (
    <div
      className="absolute top-2 left-2 z-[5] flex flex-col flex-wrap gap-1 xp-desktop-icons"
      style={{ maxHeight: 'calc(100dvh - 60px)', maxWidth: 'calc(100vw - 8px)', overflow: 'hidden' }}
      onClick={() => { setSelected(null); setIconMenu(null); }}
    >
      {sortedIcons.map((item, i) => {
        const isSelected = selected === item.id;
        const isRecycle  = item.id === '__recycle__';
        return (
          <motion.div
            key={item.id}
            className="flex flex-col items-center gap-0.5 cursor-pointer w-[60px] sm:w-[68px] p-1 rounded-sm"
            role="button"
            tabIndex={0}
            aria-label={`Open ${item.label}`}
            style={{
              backgroundColor: isSelected ? 'rgba(49,106,197,0.55)' : 'transparent',
              outline: isSelected ? '1px dotted rgba(255,255,255,0.7)' : 'none',
            }}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1   }}
            transition={{ delay: i * 0.04, duration: 0.2, ease: 'easeOut' }}
            whileHover={{ backgroundColor: isSelected ? 'rgba(49,106,197,0.55)' : 'rgba(49,106,197,0.3)' }}
            whileTap={{ scale: 0.92 }}
            onClick={(e) => handleClick(item.id, e)}
            onDoubleClick={() => handleDoubleClick(item.id)}
            onTouchEnd={(e) => { e.preventDefault(); handleDoubleClick(item.id); }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleDoubleClick(item.id);
              }
            }}
            onContextMenu={(e) => handleIconContextMenu(item.id, e)}
          >
            <motion.span
              className="text-[28px] sm:text-[34px] leading-none select-none relative"
              whileHover={{ scale: 1.1 }}
            >
              {item.icon}
              {/* Badge showing number of recycled items on the bin */}
              {isRecycle && recycledIds.length > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center leading-none"
                  style={{ lineHeight: 1 }}
                >
                  {recycledIds.length}
                </span>
              )}
            </motion.span>
            <span
              className="text-white text-[10px] text-center leading-tight select-none w-full"
              style={{ textShadow: '1px 1px 2px #000, 0 0 4px #000' }}
            >
              {item.label}
            </span>
          </motion.div>
        );
      })}

      {/* ── Per-icon context menu ── */}
      <AnimatePresence>
        {iconMenu && iconMenu.id !== '__recycle__' && (
          <>
            <div className="fixed inset-0 z-[92]" onClick={() => setIconMenu(null)}
              onContextMenu={(e) => { e.preventDefault(); setIconMenu(null); }} />
            <motion.div
              className="fixed z-[93] min-w-[140px]"
              style={{
                left: Math.min(iconMenu.x, (typeof window !== 'undefined' ? window.innerWidth : 800) - 148),
                top:  Math.min(iconMenu.y, (typeof window !== 'undefined' ? window.innerHeight : 600) - 80),
                background: '#ece9d8',
                border: '1px solid #888',
                boxShadow: '3px 3px 10px rgba(0,0,0,0.45)',
                fontFamily: 'Tahoma, sans-serif',
              }}
              initial={{ opacity: 0, scale: 0.92, y: -4 }}
              animate={{ opacity: 1, scale: 1,    y: 0 }}
              exit={{    opacity: 0, scale: 0.92, y: -4 }}
              transition={{ duration: 0.1 }}
            >
              {[
                { label: `💻 Open`, action: () => { handleDoubleClick(iconMenu.id); setIconMenu(null); } },
                null,
                { label: `ℹ️  Properties`, action: () => { openWindow('about'); setIconMenu(null); } },
              ].map((item, i) =>
                item === null ? (
                  <div key={i} className="h-px bg-[#b0ada0] mx-1 my-0.5" />
                ) : (
                  <div key={i}
                    className="px-3 py-1 text-[11px] cursor-pointer hover:bg-[#316ac5] hover:text-white"
                    onClick={(e) => { e.stopPropagation(); item.action(); }}>
                    {item.label}
                  </div>
                )
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Recycle Bin Dialog ── */}
      <AnimatePresence>
        {showRecycleBin && (
          <>
            <div
              className="fixed inset-0 z-[95]"
              onClick={() => setShowRecycleBin(false)}
            />
            <motion.div
              ref={recycleDialogRef}
              className="fixed z-[96] flex flex-col"
              style={{
                ...(recycleBinPos
                  ? { top: recycleBinPos.y, left: recycleBinPos.x }
                  : { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }),
                width: 'min(340px, 95vw)',
                background: '#ece9d8',
                border: '2px solid #0a246a',
                boxShadow: '4px 4px 18px rgba(0,0,0,0.6)',
                fontFamily: 'Tahoma, sans-serif',
              }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Title bar — draggable */}
              <div
                className="h-[26px] flex items-center justify-between px-2 flex-shrink-0 cursor-move select-none"
                style={{ background: 'linear-gradient(180deg, #2c6fca 0%, #1244a8 100%)' }}
                onMouseDown={(e) => { e.preventDefault(); handleRecycleDragStart(e.clientX, e.clientY); }}
                onTouchStart={(e) => { e.preventDefault(); handleRecycleDragStart(e.touches[0].clientX, e.touches[0].clientY); }}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">🗑️</span>
                  <span className="text-white text-[11px] font-bold">Recycle Bin</span>
                </div>
                <button
                  className="w-[18px] h-[18px] rounded-[2px] border text-white text-[10px] font-bold flex items-center justify-center"
                  style={{ background: 'linear-gradient(180deg, #e86060 0%, #c03030 100%)', borderColor: '#901010' }}
                  onClick={() => setShowRecycleBin(false)}
                  aria-label="Close Recycle Bin"
                >
                  ✕
                </button>
              </div>

              {/* Menu bar */}
              <div className="h-[20px] bg-[#ece9d8] border-b border-[#aaa] flex items-center px-1">
                {['File', 'Edit', 'View', 'Help'].map((m) => (
                  <span key={m} className="px-2 text-[11px] cursor-default rounded-sm hover:bg-[#316ac5] hover:text-white py-0.5">
                    {m}
                  </span>
                ))}
              </div>

              {/* Content */}
              <div className="p-3 min-h-[120px]">
                {recycledIds.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 py-8 opacity-50">
                    <span className="text-4xl">🗑️</span>
                    <p className="text-[11px] text-[#555]">Recycle Bin is Empty</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {recycledIds.map((id) => (
                      <div
                        key={id}
                        className="flex items-center justify-between px-2 py-1.5 hover:bg-[#d4d0c8] rounded-sm group"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{windowIcons[id]}</span>
                          <span className="text-[11px] text-[#333]">{windowTitles[id]}</span>
                        </div>
                        <button
                          className="text-[10px] px-2 py-0.5 border border-[#999] bg-[#d4d0c8] hover:bg-[#e0ddd5] text-[#0a246a] opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => { restoreFromRecycle(id); setShowRecycleBin(false); }}
                        >
                          Restore
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {recycledIds.length > 0 && (
                <div className="px-3 pb-3 flex justify-between items-center border-t border-[#c0bdb0] pt-2">
                  <span className="text-[10px] text-[#777]">{recycledIds.length} item{recycledIds.length > 1 ? 's' : ''}</span>
                  <div className="flex gap-2">
                    <button
                      className="text-[10px] px-3 py-1 border border-[#999] hover:bg-[#d4d0c8]"
                      style={{ background: 'linear-gradient(180deg, #ece9d8 0%, #d4d0c8 100%)' }}
                      onClick={() => { recycledIds.forEach(id => restoreFromRecycle(id)); setShowRecycleBin(false); }}
                    >
                      Restore All
                    </button>
                    <button
                      className="text-[10px] px-3 py-1 border border-[#999] hover:bg-[#fdd] text-red-700"
                      style={{ background: 'linear-gradient(180deg, #ece9d8 0%, #d4d0c8 100%)' }}
                      onClick={() => { emptyRecycleBin(); }}
                    >
                      Empty Bin
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
