'use client';

/**
 * MobileNav — floating action button + full-app drawer for ≤ 480px touch screens.
 *
 * Only rendered in the DOM on all screens but hidden via CSS (.xp-mobile-only).
 * The FAB sits above the taskbar (bottom-right corner) and slides up a full
 * app-launcher grid when tapped.
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWindows } from '@/context/WindowContext';
import { WindowId } from '@/types';

const PINNED: { id: WindowId; icon: string; label: string }[] = [
  { id: 'about',    icon: '🖥️', label: 'About'   },
  { id: 'projects', icon: '📂', label: 'Projects' },
  { id: 'contact',  icon: '✉️', label: 'Contact'  },
  { id: 'skills',   icon: '⚙️', label: 'Skills'   },
  { id: 'terminal', icon: '💻', label: 'Terminal' },
];

const ALL_APPS: { id: WindowId; icon: string; label: string }[] = [
  { id: 'about',       icon: '🖥️', label: 'About'        },
  { id: 'experience',  icon: '📁', label: 'Experience'   },
  { id: 'skills',      icon: '⚙️', label: 'Skills'       },
  { id: 'education',   icon: '🎓', label: 'Education'    },
  { id: 'projects',    icon: '📂', label: 'Projects'     },
  { id: 'contact',     icon: '✉️', label: 'Contact'      },
  { id: 'terminal',    icon: '💻', label: 'Terminal'     },
  { id: 'timeline',    icon: '📅', label: 'Timeline'     },
  { id: 'certs',       icon: '🏆', label: 'Credentials'  },
  { id: 'radar',       icon: '📊', label: 'Skill Radar'  },
  { id: 'ratecard',    icon: '💼', label: 'Services'     },
  { id: 'snippets',    icon: '📝', label: 'Snippets'     },
  { id: 'quiz',        icon: '🇩🇪', label: 'Deutsch Quiz' },
  { id: 'minesweeper', icon: '💣', label: 'Minesweeper'  },
  { id: 'paint',       icon: '🎨', label: 'Paint'        },
  { id: 'calculator',  icon: '🔢', label: 'Calculator'   },
  { id: 'controlpanel',icon: '⚙️', label: 'Control Panel'},
  { id: 'mycomputer',  icon: '💻', label: 'My Computer'  },
  { id: 'ie',          icon: '🌐', label: 'Internet Exp.' },
  { id: 'mediaplayer', icon: '▶️', label: 'Media Player' },
  { id: 'notepad',     icon: '🗒️', label: 'Notepad'      },
  { id: 'taskmanager', icon: '📋', label: 'Task Mgr'     },
  { id: 'shortcuts',   icon: '⌨️', label: 'Shortcuts'    },
];

export default function MobileNav() {
  const { openWindow, windows } = useWindows();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openWindowCount = windows.filter((w) => w.isOpen && !w.isMinimized).length;

  const launch = useCallback((id: WindowId) => {
    openWindow(id);
    setDrawerOpen(false);
  }, [openWindow]);

  return (
    // xp-mobile-only hides this on desktop via globals.css
    <div className="xp-mobile-only fixed z-[52] flex-col items-end"
      style={{ bottom: 'calc(36px + env(safe-area-inset-bottom, 0px) + 8px)', right: 12 }}>

      {/* ── Full-screen drawer ── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-[53]"
              style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
            />

            {/* Drawer panel — slides up from the FAB */}
            <motion.div
              className="fixed z-[54] rounded-2xl overflow-hidden flex flex-col"
              style={{
                bottom: 'calc(36px + env(safe-area-inset-bottom, 0px) + 72px)',
                right: 12,
                width: 'min(340px, calc(100vw - 24px))',
                maxHeight: 'calc(100dvh - 160px)',
                background: 'rgba(8, 16, 48, 0.96)',
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: '0 -8px 40px rgba(0,0,0,0.6)',
              }}
              initial={{ y: 30, opacity: 0, scale: 0.95 }}
              animate={{ y: 0,  opacity: 1, scale: 1    }}
              exit={{    y: 30, opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <span className="text-white font-bold text-[13px]">All Applications</span>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="text-white/60 hover:text-white text-[18px] leading-none w-7 h-7 flex items-center justify-center"
                  aria-label="Close app drawer"
                >✕</button>
              </div>

              {/* App grid — scrollable */}
              <div className="overflow-y-auto p-3">
                <div className="grid grid-cols-4 gap-2">
                  {ALL_APPS.map((app) => {
                    const isOpen = windows.some((w) => w.id === app.id && w.isOpen && !w.isMinimized);
                    return (
                      <motion.button
                        key={app.id}
                        onClick={() => launch(app.id)}
                        className="flex flex-col items-center gap-1.5 p-2 rounded-xl relative"
                        style={{
                          background: isOpen ? 'rgba(49,106,197,0.35)' : 'rgba(255,255,255,0.06)',
                          border: isOpen ? '1px solid rgba(49,106,197,0.6)' : '1px solid rgba(255,255,255,0.08)',
                        }}
                        whileTap={{ scale: 0.9 }}
                        aria-label={`Open ${app.label}`}
                      >
                        <span className="text-2xl leading-none">{app.icon}</span>
                        <span className="text-white text-[9px] text-center leading-tight font-medium">
                          {app.label}
                        </span>
                        {/* Green dot = currently open */}
                        {isOpen && (
                          <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-green-400" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Quick-access pinned bar at bottom of drawer */}
              <div className="flex items-center justify-around px-3 py-2 border-t border-white/10">
                {PINNED.map((app) => (
                  <button key={app.id} onClick={() => launch(app.id)}
                    className="flex flex-col items-center gap-0.5 p-1"
                    aria-label={app.label}>
                    <span className="text-xl">{app.icon}</span>
                    <span className="text-white/60 text-[8px]">{app.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── FAB (Floating Action Button) ── */}
      <motion.button
        onClick={() => setDrawerOpen((p) => !p)}
        className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-2xl"
        style={{
          background: drawerOpen
            ? 'linear-gradient(135deg, #1244a8 0%, #0a246a 100%)'
            : 'linear-gradient(135deg, #2c6fca 0%, #1244a8 100%)',
          border: '2px solid rgba(255,255,255,0.25)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)',
        }}
        whileTap={{ scale: 0.9 }}
        aria-label={drawerOpen ? 'Close app launcher' : 'Open app launcher'}
        aria-expanded={drawerOpen}
      >
        {/* Windows flag logo */}
        <motion.div
          className="flex flex-wrap w-6 h-6 gap-[2px]"
          animate={{ rotate: drawerOpen ? 180 : 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="flex-1 rounded-[2px] bg-red-400" />
          <div className="flex-1 rounded-[2px] bg-green-400" />
          <div className="flex-1 rounded-[2px] bg-blue-400" />
          <div className="flex-1 rounded-[2px] bg-yellow-300" />
        </motion.div>

        {/* Open-window count badge */}
        {openWindowCount > 0 && !drawerOpen && (
          <motion.div
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-400 flex items-center justify-center"
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            style={{ fontSize: 9, fontWeight: 'bold', color: '#000' }}
          >
            {openWindowCount}
          </motion.div>
        )}
      </motion.button>
    </div>
  );
}
