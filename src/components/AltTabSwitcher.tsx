'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWindows } from '@/context/WindowContext';

export default function AltTabSwitcher() {
  const { windows, focusWindow, restoreWindow } = useWindows();
  const [visible, setVisible] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);

  const openWindows = windows.filter((w) => w.isOpen);

  // Refs so event handlers always read the latest values without stale closures
  const openWindowsRef = useRef(openWindows);
  openWindowsRef.current = openWindows;
  const visibleRef = useRef(visible);
  visibleRef.current = visible;
  const selectedIdxRef = useRef(selectedIdx);
  selectedIdxRef.current = selectedIdx;
  const focusWindowRef = useRef(focusWindow);
  focusWindowRef.current = focusWindow;
  const restoreWindowRef = useRef(restoreWindow);
  restoreWindowRef.current = restoreWindow;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!e.altKey || e.key !== 'Tab') return;
      e.preventDefault();
      const wins = openWindowsRef.current;
      const count = wins.length;
      if (count === 0) return;

      if (!visibleRef.current) {
        setSelectedIdx(e.shiftKey ? count - 1 : Math.min(1, count - 1));
        setVisible(true);
      } else {
        setSelectedIdx((prev) =>
          e.shiftKey ? (prev - 1 + count) % count : (prev + 1) % count
        );
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Alt') {
        if (visibleRef.current) {
          setVisible(false);
          const w = openWindowsRef.current[selectedIdxRef.current];
          if (w) {
            if (w.isMinimized) restoreWindowRef.current(w.id);
            focusWindowRef.current(w.id);
          }
        }
      }
      if (e.key === 'Escape' && visibleRef.current) {
        setVisible(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []); // empty deps — refs always carry the latest values

  if (!visible || openWindows.length === 0) return null;

  const selectedWin = openWindows[selectedIdx];

  return (
    <AnimatePresence>
      <motion.div
        className="absolute inset-0 z-[9999] flex items-center justify-center pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.12 }}
      >
        <motion.div
          className="pointer-events-auto flex flex-col items-center gap-3 px-5 py-4 rounded"
          style={{
            background: 'rgba(10, 20, 80, 0.88)',
            border: '2px solid #4a72c4',
            boxShadow: '0 8px 40px rgba(0,0,0,0.8)',
            fontFamily: 'Tahoma, sans-serif',
            minWidth: 280,
            maxWidth: 'min(560px, 90vw)',
          }}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
        >
          {/* Title of selected window */}
          <div className="text-white text-[11px] font-bold text-center" style={{ textShadow: '0 1px 4px #000' }}>
            {selectedWin?.title ?? ''}
          </div>

          {/* Window icons grid */}
          <div className="flex flex-wrap gap-2 justify-center">
            {openWindows.map((w, i) => (
              <motion.div
                key={w.id}
                className="flex flex-col items-center gap-1 px-3 py-2 rounded cursor-pointer"
                style={{
                  background: i === selectedIdx ? 'rgba(100, 150, 255, 0.45)' : 'rgba(255,255,255,0.08)',
                  border: i === selectedIdx ? '1px solid #6496ff' : '1px solid rgba(255,255,255,0.1)',
                  minWidth: 64,
                }}
                onMouseEnter={() => setSelectedIdx(i)}
                onClick={() => {
                  setVisible(false);
                  if (w.isMinimized) restoreWindow(w.id);
                  focusWindow(w.id);
                }}
                whileHover={{ background: 'rgba(100,150,255,0.3)' }}
              >
                <span style={{ fontSize: 26 }}>{w.icon}</span>
                <span
                  className="text-white text-center leading-tight"
                  style={{ fontSize: 9, maxWidth: 60, wordBreak: 'break-word' }}
                >
                  {w.title.split('—')[0].trim()}
                </span>
              </motion.div>
            ))}
          </div>

          <div className="text-[#aab4d8] text-[9px] text-center">
            Alt+Tab to cycle · Release Alt to switch
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
