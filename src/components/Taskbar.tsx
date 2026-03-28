'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useWindows } from '@/context/WindowContext';
import { WindowId } from '@/types';
import { getMuted, setMuted, playLogoff, playShutdown, playLogoffConfirm, playShutdownConfirm } from '@/utils/sounds';
import GlitchText from './GlitchText';

interface TaskbarProps {
  onLogOff: () => void;
}

export default function Taskbar({ onLogOff }: TaskbarProps) {
  const { windows, openWindow, focusWindow, minimizeWindow } = useWindows();
  const [time, setTime]       = useState('');
  const [date, setDate]       = useState('');
  const [startOpen, setStartOpen] = useState(false);
  const [logOffDialog, setLogOffDialog] = useState<'logoff' | 'shutdown' | null>(null);
  const [muted, setMutedState] = useState(false);

  const toggleMute = () => {
    const next = !muted;
    setMutedState(next);
    setMuted(next);
  };

  useEffect(() => {
    const update = () => {
      const now  = new Date();
      let h      = now.getHours();
      const m    = now.getMinutes();
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      setTime(`${h}:${m < 10 ? '0' + m : m} ${ampm}`);
      setDate(`${months[now.getMonth()]} ${now.getDate()}`);
    };
    update();
    const interval = setInterval(update, 10000);
    return () => clearInterval(interval);
  }, []);

  const openWindowsList = windows.filter((w) => w.isOpen);

  // Active = highest zIndex among visible (non-minimized) windows
  const maxZ       = Math.max(...windows.filter((w) => w.isOpen && !w.isMinimized).map((w) => w.zIndex), 0);
  const activeId   = windows.find((w) => w.isOpen && !w.isMinimized && w.zIndex === maxZ)?.id ?? null;

  // Taskbar button click: toggle minimize / restore+focus
  const handleTaskbarClick = (id: WindowId) => {
    const win = windows.find((w) => w.id === id);
    if (!win) return;
    if (win.isMinimized) {
      focusWindow(id);          // restore + bring to front
    } else if (id === activeId) {
      minimizeWindow(id);       // already active → minimize
    } else {
      focusWindow(id);          // bring to front
    }
  };

  const startMenuItems: { id: WindowId; icon: string; label: string }[] = [
    { id: 'about',      icon: '🖥️', label: 'My Portfolio'  },
    { id: 'experience', icon: '📁', label: 'My Experience' },
    { id: 'skills',     icon: '⚙️', label: 'My Skills'     },
    { id: 'education',  icon: '🎓', label: 'Education'     },
    { id: 'projects',   icon: '📂', label: 'My Projects'   },
    { id: 'contact',    icon: '✉️', label: 'Contact Me'    },
    { id: 'terminal',   icon: '💻', label: 'Command Prompt'},
    { id: 'quiz',       icon: '🇩🇪', label: 'Deutsch Quiz' },
    { id: 'radar',      icon: '📊', label: 'Skill Radar'  },
    { id: 'timeline',   icon: '📅', label: 'Career Timeline'},
    { id: 'certs',      icon: '🏆', label: 'Credentials'  },
    { id: 'ratecard',   icon: '💼', label: 'Services'      },
    { id: 'snippets',   icon: '📝', label: 'Code Snippets'},
    { id: 'shortcuts',  icon: '⌨️', label: 'Shortcuts'    },
  ];

  return (
    <>
      {/* ── Log Off / Shut Down dialog ── */}
      <AnimatePresence>
        {logOffDialog && (
          <motion.div
            className="absolute inset-0 z-[100] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            style={{ backdropFilter: 'blur(6px)', background: 'rgba(0,0,0,0.55)' }}
          >
            {/* Animated background particles */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full pointer-events-none"
                style={{
                  width:  8 + (i % 4) * 6,
                  height: 8 + (i % 4) * 6,
                  background: logOffDialog === 'logoff' ? `rgba(49,106,197,${0.15 + (i % 3) * 0.12})` : `rgba(180,20,20,${0.15 + (i % 3) * 0.12})`,
                  left: `${10 + (i * 7) % 80}%`,
                  top:  `${15 + (i * 11) % 70}%`,
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.2, 1], opacity: [0, 0.8, 0.4], y: [0, -20 - i * 3] }}
                transition={{ delay: i * 0.07, duration: 1.2, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
              />
            ))}

            <motion.div
              key={logOffDialog}
              className="w-[380px] overflow-hidden relative"
              style={{
                background: logOffDialog === 'logoff'
                  ? 'linear-gradient(160deg, #e8f0ff 0%, #dde4f0 60%, #c8d8f5 100%)'
                  : 'linear-gradient(160deg, #fff0f0 0%, #f5dede 60%, #edd8d8 100%)',
                border: `2px solid ${logOffDialog === 'logoff' ? '#0a246a' : '#8b0000'}`,
                boxShadow: logOffDialog === 'logoff'
                  ? '0 0 0 1px #316ac5, 0 8px 40px rgba(10,36,106,0.55), 0 2px 8px rgba(0,0,0,0.3)'
                  : '0 0 0 1px #c62828, 0 8px 40px rgba(139,0,0,0.55), 0 2px 8px rgba(0,0,0,0.3)',
              }}
              initial={{ scale: 0.7, opacity: 0, y: -40, rotateX: 15 }}
              animate={{ scale: 1,   opacity: 1, y: 0,   rotateX: 0  }}
              exit={{    scale: 0.7, opacity: 0, y: 40,  rotateX: -10 }}
              transition={{ type: 'spring', stiffness: 340, damping: 24 }}
            >
              {/* Shimmer stripe at top */}
              <motion.div
                className="absolute top-0 left-0 right-0 h-[3px] pointer-events-none"
                style={{
                  background: logOffDialog === 'logoff'
                    ? 'linear-gradient(90deg, #1244a8, #42a5f5, #1244a8)'
                    : 'linear-gradient(90deg, #8b0000, #ef5350, #8b0000)',
                  backgroundSize: '200% 100%',
                }}
                animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />

              {/* Title bar */}
              <div
                className="h-[30px] flex items-center gap-2 px-3"
                style={{
                  background: logOffDialog === 'logoff'
                    ? 'linear-gradient(180deg, #3a7fd4 0%, #1244a8 60%, #0a246a 100%)'
                    : 'linear-gradient(180deg, #e05252 0%, #b71c1c 60%, #8b0000 100%)',
                }}
              >
                <div className="flex flex-wrap w-3 h-3 gap-[1px]">
                  <div className="rounded-[1px] bg-red-300   w-[5px] h-[5px]" />
                  <div className="rounded-[1px] bg-green-300 w-[5px] h-[5px]" />
                  <div className="rounded-[1px] bg-blue-300  w-[5px] h-[5px]" />
                  <div className="rounded-[1px] bg-yellow-200 w-[5px] h-[5px]" />
                </div>
                <GlitchText
                  text={logOffDialog === 'logoff' ? 'Log Off Windows' : 'Turn Off Computer'}
                  duration={900}
                  className="text-white text-[11px] font-bold tracking-wide"
                />
              </div>

              {/* Body */}
              <div className="px-6 py-6">
                {/* Icon + heading row */}
                <div className="flex items-center gap-4 mb-5">
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 18 }}
                    className="relative flex-shrink-0"
                  >
                    {/* Glow ring behind icon */}
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: logOffDialog === 'logoff' ? 'rgba(49,106,197,0.25)' : 'rgba(198,40,40,0.25)',
                        filter: 'blur(8px)',
                      }}
                      animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <span className="text-[48px] leading-none relative z-10">
                      {logOffDialog === 'logoff' ? '🔒' : '⚡'}
                    </span>
                  </motion.div>

                  <div>
                    <motion.p
                      className="text-[14px] font-bold mb-1"
                      style={{ color: logOffDialog === 'logoff' ? '#0a246a' : '#7f0000' }}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <GlitchText
                        text={logOffDialog === 'logoff' ? 'Log Off Windows' : 'Turn Off Computer'}
                        duration={1100}
                      />
                    </motion.p>
                    <motion.p
                      className="text-[11px] text-[#444] leading-relaxed"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.35 }}
                    >
                      {logOffDialog === 'logoff'
                        ? 'Are you sure you want to log off? Unsaved changes in open windows will be lost.'
                        : 'Are you sure you want to turn off the computer? All open windows will close.'}
                    </motion.p>
                  </div>
                </div>

                {/* Divider */}
                <motion.div
                  className="h-px mb-5"
                  style={{ background: logOffDialog === 'logoff' ? 'linear-gradient(90deg, transparent, #316ac5, transparent)' : 'linear-gradient(90deg, transparent, #c62828, transparent)' }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                />

                {/* Buttons */}
                <div className="flex justify-center gap-3">
                  <motion.button
                    className="px-6 py-2 text-[11px] border cursor-pointer font-bold text-white relative overflow-hidden"
                    style={{
                      background: logOffDialog === 'logoff'
                        ? 'linear-gradient(180deg, #3a7fd4 0%, #1244a8 100%)'
                        : 'linear-gradient(180deg, #e05252 0%, #b71c1c 100%)',
                      borderColor: logOffDialog === 'logoff' ? '#0a246a' : '#8b0000',
                      minWidth: 90,
                      boxShadow: logOffDialog === 'logoff' ? '0 2px 8px rgba(18,68,168,0.4)' : '0 2px 8px rgba(183,28,28,0.4)',
                    }}
                    onClick={() => {
                      if (logOffDialog === 'logoff') { playLogoffConfirm(); }
                      else                           { playShutdownConfirm(); }
                      setLogOffDialog(null);
                      onLogOff();
                    }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ filter: 'brightness(1.15)', scale: 1.03, boxShadow: '0 4px 16px rgba(0,0,0,0.35)' }}
                    whileTap={{ scale: 0.94 }}
                  >
                    {logOffDialog === 'logoff' ? '🔒 Log Off' : '⚡ Turn Off'}
                  </motion.button>
                  <motion.button
                    className="px-6 py-2 text-[11px] border border-[#888] cursor-pointer text-[#333]"
                    style={{ background: 'linear-gradient(180deg, #ece9d8 0%, #d4d0c8 100%)', minWidth: 90 }}
                    onClick={() => setLogOffDialog(null)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.48 }}
                    whileHover={{ filter: 'brightness(1.07)', scale: 1.03 }}
                    whileTap={{ scale: 0.94 }}
                    autoFocus
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Start Menu ── */}
      <AnimatePresence>
        {startOpen && (
          <>
            <motion.div
              className="absolute inset-0 z-[48]"
              onClick={() => setStartOpen(false)}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            />
            <motion.div
              className="absolute bottom-[30px] left-0 w-[280px] z-[49] rounded-t-lg overflow-hidden"
              style={{ background: '#ece9d8', border: '2px solid #0a246a', boxShadow: '4px -4px 18px rgba(0,0,0,0.5)' }}
              initial={{ y: 20, opacity: 0, scaleY: 0.8 }}
              animate={{ y: 0,  opacity: 1, scaleY: 1   }}
              exit={{    y: 20, opacity: 0, scaleY: 0.8 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
              {/* Header */}
              <div className="flex items-center gap-3 px-3 py-2.5"
                style={{ background: 'linear-gradient(180deg, #2c6fca 0%, #1244a8 100%)' }}>
                <div className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-white font-bold flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #f90, #ff6600)' }}>
                  NB
                </div>
                <div>
                  <div className="text-white font-bold text-xs">Nischal Bhandari</div>
                  <div className="text-blue-200 text-[10px]">IT Professional</div>
                </div>
              </div>
              <div className="h-[2px] bg-gradient-to-r from-orange-400 via-orange-300 to-transparent" />

              {/* Left / Right panels */}
              <div className="flex">
                {/* Left — pinned apps */}
                <div className="flex-1 border-r border-[#c0bdb0] py-1">
                  <div className="text-[9px] font-bold uppercase px-3 py-1 text-[#555]">Open</div>
                  {startMenuItems.map((item, i) => (
                    <motion.div
                      key={item.id}
                      className="flex items-center gap-3 px-3 py-1.5 cursor-pointer text-[11px] hover:bg-[#316ac5] hover:text-white transition-colors"
                      onClick={() => { openWindow(item.id); setStartOpen(false); }}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0,   opacity: 1  }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <span className="text-base w-5 text-center">{item.icon}</span>
                      <span>{item.label}</span>
                    </motion.div>
                  ))}
                </div>
                {/* Right — system places */}
                <div className="w-[110px] py-1 bg-[#dde4f0]">
                  <div className="text-[9px] font-bold uppercase px-2 py-1 text-[#555]">System</div>
                  {['My Documents','My Computer','Control Panel','Search','Run...'].map((label) => (
                    <div key={label}
                      className="px-2 py-1.5 text-[10px] cursor-pointer hover:bg-[#316ac5] hover:text-white transition-colors truncate">
                      {label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="h-[2px] bg-gradient-to-r from-gray-400 to-transparent" />
              <div className="flex justify-between items-center px-3 py-1.5 text-[10px]"
                style={{ background: 'linear-gradient(180deg, #3b87d4 0%, #1a4a8d 100%)' }}>
                <span className="text-blue-200 cursor-pointer hover:underline">📄 All Programs ▶</span>
                <div className="flex gap-3">
                  <motion.span
                    className="text-blue-200 cursor-pointer hover:text-white flex items-center gap-1"
                    onClick={() => { setStartOpen(false); playShutdown(); setLogOffDialog('shutdown'); }}
                    whileHover={{ textDecoration: 'underline' }}
                  >
                    🔴 Turn Off
                  </motion.span>
                  <motion.span
                    className="text-blue-200 cursor-pointer hover:text-white flex items-center gap-1"
                    onClick={() => { setStartOpen(false); playLogoff(); setLogOffDialog('logoff'); }}
                    whileHover={{ textDecoration: 'underline' }}
                  >
                    🔒 Log Off
                  </motion.span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Taskbar ── */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[30px] flex items-center z-[50] border-t border-[#4a84d8]"
        style={{ background: 'linear-gradient(180deg, #2573c2 0%, #1550a0 50%, #1244a0 100%)' }}
        initial={{ y: 30 }} animate={{ y: 0 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 120 }}
      >
        {/* START button */}
        <motion.div
          className="h-full flex items-center gap-1.5 px-4 cursor-pointer text-white text-xs font-bold rounded-r-2xl border-r border-green-900 flex-shrink-0"
          style={{
            background: startOpen
              ? 'linear-gradient(180deg, #2d6e10 0%, #1d5008 50%, #163d06 100%)'
              : 'linear-gradient(180deg, #5fad2a 0%, #3b8c16 50%, #2d7012 100%)',
            boxShadow: startOpen
              ? 'inset 2px 2px 4px rgba(0,0,0,0.5)'
              : 'inset 0 1px 2px rgba(255,255,255,0.3)',
          }}
          onClick={() => setStartOpen(!startOpen)}
          whileHover={{ filter: 'brightness(1.15)' }}
          whileTap={{ filter: 'brightness(0.9)' }}
        >
          <div className="flex flex-wrap w-3 h-3 gap-[1px] flex-shrink-0">
            <div className="rounded-[1px] bg-red-400   w-[5px] h-[5px]" />
            <div className="rounded-[1px] bg-green-400 w-[5px] h-[5px]" />
            <div className="rounded-[1px] bg-blue-400  w-[5px] h-[5px]" />
            <div className="rounded-[1px] bg-yellow-300 w-[5px] h-[5px]" />
          </div>
          <span className="uppercase tracking-wider text-[11px]">START</span>
        </motion.div>

        {/* Separator */}
        <div className="h-5 w-px bg-white/20 mx-1 flex-shrink-0" />

        {/* Open window buttons */}
        <div className="flex gap-0.5 flex-1 overflow-hidden min-w-0">
          <AnimatePresence>
            {openWindowsList.map((w) => {
              const isActive = w.id === activeId && !w.isMinimized;
              return (
                <motion.button
                  key={w.id}
                  className="h-[22px] flex items-center gap-1 rounded-sm px-2 cursor-pointer text-white text-[10px] whitespace-nowrap max-w-[140px] min-w-[80px] overflow-hidden"
                  style={{
                    background: isActive
                      ? 'rgba(0,0,0,0.35)'
                      : w.isMinimized
                        ? 'rgba(0,0,0,0.15)'
                        : 'rgba(255,255,255,0.15)',
                    border: isActive ? '1px inset rgba(0,0,0,0.4)' : '1px solid rgba(255,255,255,0.2)',
                    boxShadow: isActive ? 'inset 1px 1px 3px rgba(0,0,0,0.4)' : 'none',
                  }}
                  onClick={() => handleTaskbarClick(w.id)}
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 'auto', opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.25)' }}
                >
                  <span className="flex-shrink-0">{w.icon}</span>
                  <span className="truncate text-[9px]">{w.title.split('—')[0].trim()}</span>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>

        {/* System tray + clock */}
        <div className="flex items-center h-full flex-shrink-0">
          <div className="flex items-center gap-1.5 px-2 h-full border-l border-white/20"
            style={{ background: 'rgba(0,0,0,0.18)' }}>
            <span className="text-[12px] opacity-75 cursor-default" title="Network">📶</span>
            <motion.button
              className="text-[12px] opacity-75 cursor-pointer bg-transparent border-none p-0 leading-none"
              title={muted ? 'Unmute sounds' : 'Mute sounds'}
              onClick={toggleMute}
              whileHover={{ opacity: 1 }}
              whileTap={{ scale: 0.85 }}
            >
              {muted ? '🔇' : '🔊'}
            </motion.button>
            <span className="text-[12px] opacity-75 cursor-default" title="Power">⚡</span>
          </div>
          <div
            className="flex flex-col items-center justify-center px-3 h-full text-white text-[10px] leading-tight border-l border-white/20 cursor-default"
            style={{ background: 'rgba(0,0,0,0.12)', minWidth: 58 }}
            title={new Date().toLocaleDateString()}
          >
            <span className="font-bold">{time}</span>
            <span className="opacity-70">{date}</span>
          </div>
        </div>
      </motion.div>
    </>
  );
}
