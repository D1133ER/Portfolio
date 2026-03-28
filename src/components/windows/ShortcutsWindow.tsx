'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import XPWindow from '../XPWindow';
import { useWindows } from '@/context/WindowContext';
import { WindowId } from '@/types';

type Section = 'Windows' | 'Taskbar' | 'CMD' | 'System';

const SHORTCUTS: Record<Section, { keys: string[]; action: string; windowId?: WindowId }[]> = {
  Windows: [
    { keys: ['Alt', 'F4'],   action: 'Close active window' },
    { keys: ['Alt', 'Space'], action: 'Window menu (Move/Resize)' },
    { keys: ['Ctrl', 'Alt', 'A'], action: 'Open About / System Properties', windowId: 'about' },
    { keys: ['Ctrl', 'Alt', 'E'], action: 'Open My Experience', windowId: 'experience' },
    { keys: ['Ctrl', 'Alt', 'S'], action: 'Open Skills Window', windowId: 'skills' },
    { keys: ['Ctrl', 'Alt', 'P'], action: 'Open My Projects', windowId: 'projects' },
    { keys: ['Ctrl', 'Alt', 'C'], action: 'Open Contact / New Message', windowId: 'contact' },
    { keys: ['Ctrl', 'Alt', 'T'], action: 'Open Command Prompt', windowId: 'terminal' },
    { keys: ['Ctrl', 'Alt', 'Q'], action: 'Open German Quiz Game', windowId: 'quiz' },
    { keys: ['Ctrl', 'Alt', 'R'], action: 'Open Skill Radar Chart', windowId: 'radar' },
    { keys: ['Ctrl', 'Alt', 'L'], action: 'Open Career Timeline', windowId: 'timeline' },
    { keys: ['Ctrl', 'Alt', 'G'], action: 'Open Credentials Wall', windowId: 'certs' },
    { keys: ['Ctrl', 'Alt', 'W'], action: 'Open Services & Rates', windowId: 'ratecard' },
    { keys: ['Ctrl', 'Alt', 'I'], action: 'Open Code Snippets IDE', windowId: 'snippets' },
    { keys: ['Ctrl', 'Alt', 'K'], action: 'Open This Shortcuts Window', windowId: 'shortcuts' },
  ],
  Taskbar: [
    { keys: ['Win'],         action: 'Open / close Start Menu' },
    { keys: ['Win', 'D'],    action: 'Show Desktop (minimize all)' },
    { keys: ['Win', 'E'],    action: 'Open My Computer' },
    { keys: ['Alt', 'Tab'],  action: 'Switch between open windows' },
    { keys: ['Ctrl', 'Esc'], action: 'Open Start Menu' },
  ],
  CMD: [
    { keys: ['Tab'],         action: 'Autocomplete command or path' },
    { keys: ['↑'],           action: 'Scroll back through command history' },
    { keys: ['↓'],           action: 'Scroll forward through history' },
    { keys: ['Ctrl', 'C'],   action: 'Cancel current command' },
    { keys: ['Ctrl', 'L'], action: 'Clear screen (or type cls)' },
    { keys: ['Enter'],       action: 'Execute command' },
  ],
  System: [
    { keys: ['F1'],          action: 'Open Help Documentation' },
    { keys: ['F2'],          action: 'Rename selected item' },
    { keys: ['F5'],          action: 'Refresh active window' },
    { keys: ['Delete'],      action: 'Delete selected item' },
    { keys: ['Ctrl', 'Z'],   action: 'Undo last action' },
    { keys: ['Ctrl', 'Y'],   action: 'Redo last action' },
    { keys: ['PrtSc'],       action: 'Take a screenshot' },
    { keys: ['Ctrl', 'A'],   action: 'Select all items' },
  ],
};

function KeyBadge({ label }: { label: string }) {
  return (
    <span
      className="inline-block px-1.5 py-0.5 text-[9px] font-bold border rounded-sm"
      style={{
        background: 'linear-gradient(180deg, #ece9d8 0%, #c8c5bc 100%)',
        borderColor: '#888',
        boxShadow: '0 1px 1px rgba(0,0,0,0.3)',
        fontFamily: 'Tahoma, sans-serif',
        color: '#111',
      }}
    >
      {label}
    </span>
  );
}

export default function ShortcutsWindow() {
  const [activeSection, setActiveSection] = useState<Section>('Windows');
  const [pressed, setPressedId] = useState<string | null>(null);
  const { openWindow } = useWindows();

  const handleAction = (item: { keys: string[]; action: string; windowId?: WindowId }) => {
    if (item.windowId) {
      const id = item.keys.join('+');
      setPressedId(id);
      setTimeout(() => setPressedId(null), 600);
      openWindow(item.windowId);
    }
  };

  return (
    <XPWindow id="shortcuts" statusText="⌨️  Keyboard Shortcuts — help.exe">
      <div className="p-3 overflow-auto" style={{ fontFamily: 'Tahoma, sans-serif' }}>

        {/* Header */}
        <div className="flex items-center gap-2 mb-3 p-2 border border-[#b8b5a8]"
          style={{ background: 'linear-gradient(180deg, #dde4f0 0%, #c8d8f5 100%)' }}>
          <span className="text-xl">⌨️</span>
          <div>
            <div className="font-bold text-[12px] text-[#0a246a]">Nischal Portfolio — Keyboard Shortcuts</div>
            <div className="text-[10px] text-[#555]">Click any shortcut with a window icon to open it directly</div>
          </div>
        </div>

        {/* Section tabs */}
        <div className="flex gap-0.5 mb-3 border-b border-[#b8b5a8]">
          {(Object.keys(SHORTCUTS) as Section[]).map((sec) => (
            <button key={sec} onClick={() => setActiveSection(sec)}
              className={`px-3 py-1 text-[10px] border-t border-x cursor-pointer transition-colors ${
                activeSection === sec
                  ? 'bg-[#ece9d8] border-[#b8b5a8] font-bold -mb-px z-10 relative'
                  : 'bg-[#d4d0c8] border-[#b8b5a8] text-[#444] hover:bg-[#dddad3]'
              }`}
            >
              { sec === 'Windows' ? '🪟 ' : sec === 'Taskbar' ? '📌 ' : sec === 'CMD' ? '💻 ' : '⚙️ ' }{sec}
            </button>
          ))}
        </div>

        {/* Shortcuts list */}
        <div className="flex flex-col gap-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col gap-1"
            >
              {SHORTCUTS[activeSection].map((item, i) => {
                const id       = item.keys.join('+');
                const isLive   = !!item.windowId;
                const isActive = pressed === id;
                return (
                  <motion.div
                    key={i}
                    className="flex items-center gap-3 px-3 py-1.5 border border-[#b8b5a8] cursor-pointer"
                    style={{
                      background: isActive
                        ? '#c8d8f5'
                        : isLive
                          ? 'linear-gradient(180deg, #ece9d8 0%, #e4e0d8 100%)'
                          : '#f0ede6',
                      borderColor: isActive ? '#316ac5' : '#b8b5a8',
                    }}
                    whileHover={isLive ? { filter: 'brightness(1.04)', x: 2 } : {}}
                    whileTap={isLive ? { scale: 0.98 } : {}}
                    onClick={() => handleAction(item)}
                    title={isLive ? `Click to open window` : undefined}
                  >
                    {/* Keys */}
                    <div className="flex items-center gap-1 flex-shrink-0 w-[160px] flex-wrap">
                      {item.keys.map((k, ki) => (
                        <span key={ki} className="flex items-center gap-0.5">
                          <KeyBadge label={k} />
                          {ki < item.keys.length - 1 && (
                            <span className="text-[9px] text-[#888]">+</span>
                          )}
                        </span>
                      ))}
                    </div>

                    {/* Action */}
                    <span className="flex-1 text-[10px] text-[#333]">{item.action}</span>

                    {/* Live indicator */}
                    {isLive && (
                      <span className="text-[9px] text-[#316ac5] font-bold flex-shrink-0">
                        {isActive ? '✓ Opened' : '→ Open'}
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Tip footer */}
        <div className="mt-3 p-2 border border-[#b8b5a8] text-[10px] text-[#555]"
          style={{ background: '#ece9d8' }}>
          💡 <strong>Tip:</strong> Shortcuts in the <em>Windows</em> tab that show <span className="text-[#316ac5] font-bold">→ Open</span> are functional — click them to launch the window directly!
        </div>
      </div>
    </XPWindow>
  );
}
