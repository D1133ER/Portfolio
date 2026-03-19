'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface Balloon {
  id: number;
  icon: string;
  title: string;
  message: string;
}

const SEQUENCE: Omit<Balloon, 'id'>[] = [
  {
    icon: '📬',
    title: 'Nischal Bhandari',
    message: 'Open to full-time & freelance opportunities!',
  },
  {
    icon: '💡',
    title: 'Quick Tip',
    message: 'Double-click any desktop icon to open a window.',
  },
  {
    icon: '📄',
    title: 'Reminder',
    message: "Don't forget to check My Projects for the resume!",
  },
];

export default function BalloonNotifications() {
  const [queue, setQueue] = useState<Balloon[]>([]);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    SEQUENCE.forEach((b, i) => {
      // Show each balloon at 8 s, 16 s, 24 s
      const showTimer = setTimeout(() => {
        const balloon = { ...b, id: i };
        setQueue((q) => [...q, balloon]);

        // Auto-dismiss after 5 seconds
        const dismissTimer = setTimeout(
          () => setQueue((q) => q.filter((x) => x.id !== i)),
          5000
        );
        timers.push(dismissTimer);
      }, (i + 1) * 8000);

      timers.push(showTimer);
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  const dismiss = (id: number) => setQueue((q) => q.filter((x) => x.id !== id));

  return (
    <div className="absolute bottom-[34px] right-3 z-[60] flex flex-col-reverse gap-2 items-end pointer-events-none">
      <AnimatePresence>
        {queue.map((b) => (
          <motion.div
            key={b.id}
            className="relative pointer-events-auto"
            initial={{ opacity: 0, x: 50, scale: 0.85 }}
            animate={{ opacity: 1, x: 0,  scale: 1    }}
            exit={{    opacity: 0, x: 50, scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          >
            {/* Balloon body */}
            <div
              className="max-w-[230px] rounded-sm text-[10px] leading-snug"
              style={{
                background: '#ffffe1',
                border: '1px solid #7f7f7f',
                boxShadow: '2px 2px 8px rgba(0,0,0,0.38)',
              }}
            >
              {/* Title row */}
              <div
                className="flex items-center justify-between gap-2 px-2 py-1 border-b border-[#ddd]"
                style={{ background: 'linear-gradient(180deg,#f0f0e6 0%,#e4e4d4 100%)' }}
              >
                <span className="font-bold text-[#0a246a] flex items-center gap-1 truncate">
                  <span className="flex-shrink-0">{b.icon}</span>
                  <span className="truncate">{b.title}</span>
                </span>
                <button
                  className="text-[12px] text-[#777] hover:text-black leading-none flex-shrink-0 cursor-pointer"
                  onClick={() => dismiss(b.id)}
                  aria-label="Dismiss"
                >
                  ✕
                </button>
              </div>

              {/* Message */}
              <div className="px-3 py-2 text-[#333]">{b.message}</div>
            </div>

            {/* Triangle tail → points downward toward the taskbar */}
            <div className="absolute -bottom-[7px] right-[20px] w-0 h-0"
              style={{ borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderTop: '7px solid #7f7f7f' }} />
            <div className="absolute -bottom-[6px] right-[21px] w-0 h-0"
              style={{ borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '6px solid #ffffe1' }} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
