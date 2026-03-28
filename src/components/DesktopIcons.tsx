'use client';

import { motion } from 'framer-motion';
import { useState, useCallback } from 'react';
import { useWindows } from '@/context/WindowContext';
import { WindowId } from '@/types';

const desktopIcons: { id: WindowId | '__recycle__'; icon: string; label: string }[] = [
  { id: 'about',      icon: '🖥️', label: 'My Portfolio'  },
  { id: 'projects',   icon: '📂', label: 'My Projects'   },
  { id: 'skills',     icon: '⚙️', label: 'My Skills'     },
  { id: 'terminal',   icon: '💻', label: 'cmd.exe'       },
  { id: 'quiz',       icon: '🇩🇪', label: 'Deutsch Quiz' },
  { id: 'radar',      icon: '📊', label: 'Skill Radar'  },
  { id: 'timeline',   icon: '📅', label: 'Timeline'      },
  { id: 'certs',      icon: '🏆', label: 'Credentials'  },
  { id: 'ratecard',   icon: '💼', label: 'Services'      },
  { id: 'snippets',   icon: '📝', label: 'Code Snippets'},
  { id: 'shortcuts',  icon: '⌨️', label: 'Shortcuts'    },
  { id: '__recycle__', icon: '🗑️', label: 'Recycle Bin'  },
];

export default function DesktopIcons() {
  const { openWindow } = useWindows();
  const [selected, setSelected] = useState<string | null>(null);

  // Single click — select icon
  const handleClick = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelected(id);
  }, []);

  // Double click — open window
  const handleDoubleClick = useCallback((id: string) => {
    if (id === '__recycle__') return; // no window for recycle bin
    openWindow(id as WindowId);
    setSelected(id);
  }, [openWindow]);

  return (
    // Clicking the desktop container deselects all
    <div
      className="absolute top-3 left-3 z-[5] flex flex-col flex-wrap gap-1"
      style={{ maxHeight: 'calc(100vh - 60px)' }}
      onClick={() => setSelected(null)}
    >
      {desktopIcons.map((item, i) => {
        const isSelected = selected === item.id;
        return (
          <motion.div
            key={item.id}
            className="flex flex-col items-center gap-0.5 cursor-pointer w-[68px] p-1 rounded-sm"
            style={{
              backgroundColor: isSelected ? 'rgba(49,106,197,0.55)' : 'transparent',
              outline: isSelected ? '1px dotted rgba(255,255,255,0.7)' : 'none',
            }}
            initial={{ opacity: 0, x: -30, scale: 0.5 }}
            animate={{ opacity: 1, x: 0,   scale: 1   }}
            transition={{ delay: i * 0.08, type: 'spring', stiffness: 200, damping: 15 }}
            whileHover={{ backgroundColor: isSelected ? 'rgba(49,106,197,0.55)' : 'rgba(49,106,197,0.3)' }}
            whileTap={{ scale: 0.92 }}
            onClick={(e) => handleClick(item.id, e)}
            onDoubleClick={() => handleDoubleClick(item.id)}
          >
            <motion.span
              className="text-[34px] leading-none select-none"
              whileHover={{ scale: 1.1 }}
            >
              {item.icon}
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
    </div>
  );
}
