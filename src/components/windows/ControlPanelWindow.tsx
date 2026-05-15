'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import XPWindow from '../XPWindow';
import { useWindows } from '@/context/WindowContext';
import { useTheme, THEMES, type ThemeId } from '@/context/ThemeContext';
import { getMuted, setMuted, playClick, playWindowOpen } from '@/utils/sounds';

// ── Panel registry ────────────────────────────────────────────────────────────
type PanelId =
  | 'home' | 'display' | 'sound' | 'system' | 'programs' | 'accounts'
  | 'datetime' | 'regional' | 'screensaver' | 'security';

interface CPItem {
  id:          PanelId | '__window__';
  icon:        string;
  label:       string;
  description: string;
  windowId?:   import('@/types').WindowId;
}

const ITEMS: CPItem[] = [
  { id: 'display',      icon: '🖥️', label: 'Display',           description: 'Change wallpaper, themes, and appearance.' },
  { id: 'sound',        icon: '🔊', label: 'Sounds & Audio',    description: 'Control volume and sound schemes.' },
  { id: 'system',       icon: '⚙️', label: 'System',            description: 'Hardware and software information.' },
  { id: 'accounts',     icon: '👤', label: 'User Accounts',     description: 'Change your account settings and picture.' },
  { id: 'programs',     icon: '📦', label: 'Add/Remove Programs', description: 'Install or uninstall programs.' },
  { id: 'datetime',     icon: '🕐', label: 'Date and Time',     description: 'Set the date, time, and time zone.' },
  { id: 'regional',     icon: '🌏', label: 'Regional Settings', description: 'Language, numbers, and currency formats.' },
  { id: 'security',     icon: '🛡️', label: 'Security Center',  description: 'Monitor your computer\'s security status.' },
  { id: 'screensaver',  icon: '💤', label: 'Screen Saver',      description: 'Set screen saver settings.' },
  { id: '__window__',   icon: '⌨️', label: 'Keyboard',          description: 'Keyboard shortcuts and settings.', windowId: 'shortcuts' },
  { id: '__window__',   icon: '📋', label: 'Task Manager',      description: 'View running processes.', windowId: 'taskmanager' },
  { id: '__window__',   icon: '🎨', label: 'Appearance',        description: 'Change XP colour themes.', windowId: undefined },
];

// ── Subpanels ─────────────────────────────────────────────────────────────────
function PanelDisplay({ onPersonalize }: { onPersonalize: () => void }) {
  const { themeId, setTheme } = useTheme();
  return (
    <div className="space-y-3">
      <p className="text-[10px] text-[#555]">Customise the appearance of your desktop.</p>
      <div className="border border-[#b8b5a8] p-3" style={{ background: '#dde4f0' }}>
        <div className="text-[10px] font-bold text-[#0a246a] mb-2">Colour Scheme</div>
        <div className="grid grid-cols-2 gap-2">
          {Object.values(THEMES).map((t) => (
            <button key={t.id} onClick={() => setTheme(t.id as ThemeId)}
              className="flex items-center gap-2 px-2 py-1.5 border text-[10px] text-left"
              style={{ background: themeId === t.id ? `${t.accent}22` : '#ece9d8', borderColor: themeId === t.id ? t.accent : '#b8b5a8', borderWidth: themeId === t.id ? 2 : 1 }}>
              <div className="w-8 h-6 rounded-sm border border-[#888] flex-shrink-0" style={{ background: t.swatch }} />
              <span className="font-bold truncate">{t.name}</span>
              {themeId === t.id && <span className="ml-auto text-[#316ac5]">✓</span>}
            </button>
          ))}
        </div>
      </div>
      <button onClick={onPersonalize}
        className="text-[10px] px-4 py-1 border border-[#888] hover:bg-[#d4d0c8]"
        style={{ background: 'linear-gradient(180deg,#ece9d8 0%,#d4d0c8 100%)' }}>
        🖼️ Change Wallpaper…
      </button>
    </div>
  );
}

function PanelSound() {
  const [muted, setMutedState] = useState(getMuted());
  const toggle = () => { const next = !muted; setMutedState(next); setMuted(next); };
  const testSounds = [
    { label: 'Window Open',   fn: playWindowOpen },
    { label: 'Click',         fn: playClick       },
  ];
  return (
    <div className="space-y-3">
      <p className="text-[10px] text-[#555]">Adjust the volume and sound scheme for your computer.</p>
      <div className="flex items-center gap-3 p-3 border border-[#b8b5a8]" style={{ background: '#dde4f0' }}>
        <span className="text-2xl">{muted ? '🔇' : '🔊'}</span>
        <div>
          <div className="text-[11px] font-bold text-[#0a246a]">Master Volume</div>
          <div className="text-[10px] text-[#555] mt-0.5">{muted ? 'Muted' : 'On'}</div>
        </div>
        <button onClick={toggle}
          className="ml-auto text-[10px] px-3 py-1 border border-[#888]"
          style={{ background: muted ? 'linear-gradient(180deg,#ffd6d6 0%,#ffb0b0 100%)' : 'linear-gradient(180deg,#d6ffd6 0%,#b0ffb0 100%)' }}>
          {muted ? '🔇 Unmute' : '🔊 Mute'}
        </button>
      </div>
      <div className="border border-[#b8b5a8] p-2" style={{ background: '#ece9d8' }}>
        <div className="text-[10px] font-bold text-[#0a246a] mb-2">Sound Scheme — Preview</div>
        <div className="flex gap-2 flex-wrap">
          {testSounds.map((s) => (
            <button key={s.label} onClick={s.fn}
              className="text-[10px] px-2 py-0.5 border border-[#999] hover:bg-[#d4d0c8]"
              style={{ background: 'linear-gradient(180deg,#ece9d8 0%,#d4d0c8 100%)' }}>
              ▶ {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function PanelSystem() {
  const { theme } = useTheme();
  return (
    <div className="space-y-2 text-[10px]">
      <p className="text-[#555]">View basic information about your computer&apos;s configuration.</p>
      <div className="border border-[#b8b5a8] p-3" style={{ background: '#fff' }}>
        <div className="font-bold text-[#0a246a] mb-2 pb-1 border-b border-[#ddd]">System Information</div>
        {[
          ['System:', 'Nischal OS v2026 (XP Professional)'],
          ['Owner:', 'Nischal Bhandari'],
          ['Location:', 'Pokhara, Nepal 🌏'],
          ['Processor:', 'Problem-Solver™ @ Unlimited GHz'],
          ['RAM:', '10 Skills Loaded'],
          ['Current Theme:', theme.name],
          ['Status:', '✅ Open to Opportunities'],
        ].map(([k, v]) => (
          <div key={k} className="flex gap-2 py-0.5 border-b border-[#f0ede5]">
            <span className="text-[#777] w-28 flex-shrink-0">{k}</span>
            <span className="text-[#222] font-medium">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PanelAccounts() {
  return (
    <div className="space-y-3 text-[10px]">
      <p className="text-[#555]">Change settings for your user account.</p>
      <div className="flex items-center gap-4 p-3 border border-[#b8b5a8]" style={{ background: '#dde4f0' }}>
        <div className="w-16 h-20 border border-[#999] overflow-hidden flex-shrink-0">
          <img src="/avatar.jpg" alt="Nischal Bhandari" className="w-full h-full object-cover object-top"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
        </div>
        <div>
          <div className="font-bold text-[13px] text-[#0a246a]">Nischal Bhandari</div>
          <div className="text-[#555] mt-1">Account type: <span className="font-bold">Administrator</span></div>
          <div className="text-[#555]">Status: <span className="font-bold text-green-700">Online</span></div>
          <div className="text-[#555] mt-1">Location: Pokhara, Nepal</div>
        </div>
      </div>
    </div>
  );
}

function PanelPrograms() {
  const { openWindow } = useWindows();
  const apps = [
    { id: 'about' as const,       icon: '🖥️', name: 'System Properties',        size: '420 KB', date: '2024' },
    { id: 'projects' as const,    icon: '📂', name: 'My Projects — File Manager', size: '380 KB', date: '2024' },
    { id: 'terminal' as const,    icon: '💻', name: 'Command Prompt',             size: '156 KB', date: '2024' },
    { id: 'minesweeper' as const, icon: '💣', name: 'Minesweeper',                size: '88 KB',  date: '2001' },
    { id: 'paint' as const,       icon: '🎨', name: 'Paint',                      size: '244 KB', date: '2001' },
    { id: 'notepad' as const,     icon: '🗒️', name: 'Notepad',                   size: '36 KB',  date: '2001' },
    { id: 'mediaplayer' as const, icon: '▶️', name: 'Windows Media Player',       size: '512 KB', date: '2003' },
    { id: 'ie' as const,          icon: '🌐', name: 'Internet Explorer 6',        size: '1.2 MB', date: '2001' },
    { id: 'calculator' as const,  icon: '🔢', name: 'Calculator',                 size: '62 KB',  date: '2001' },
  ];
  return (
    <div className="text-[10px]">
      <p className="text-[#555] mb-2">Currently installed programs:</p>
      <div className="border border-[#b8b5a8] overflow-hidden">
        <div className="grid font-bold px-2 py-1 border-b border-[#b8b5a8]"
          style={{ gridTemplateColumns: '1fr 60px 50px', background: '#d4d0c8', fontSize: 9 }}>
          <span>Name</span><span className="text-right">Size</span><span className="text-right">Year</span>
        </div>
        <div className="max-h-40 overflow-y-auto">
          {apps.map((a) => (
            <div key={a.id} className="grid items-center px-2 py-1 hover:bg-[#316ac5] hover:text-white cursor-pointer border-b border-[#eee] group"
              style={{ gridTemplateColumns: '1fr 60px 50px' }}
              onDoubleClick={() => openWindow(a.id)}>
              <span className="flex items-center gap-1.5"><span>{a.icon}</span><span className="truncate">{a.name}</span></span>
              <span className="text-right text-[9px] text-[#888] group-hover:text-white/70">{a.size}</span>
              <span className="text-right text-[9px] text-[#888] group-hover:text-white/70">{a.date}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="text-[9px] text-[#888] mt-1">Double-click to open. {apps.length} programs listed.</p>
    </div>
  );
}

function PanelDateTime() {
  const now = new Date();
  const nepal = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kathmandu' }));
  return (
    <div className="space-y-3 text-[10px]">
      <p className="text-[#555]">Date, time, and timezone settings.</p>
      <div className="border border-[#b8b5a8] p-4 text-center" style={{ background: '#fff' }}>
        <div className="text-[28px] font-bold text-[#0a246a] font-mono">
          {nepal.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
        <div className="text-[13px] text-[#555] mt-1">
          {nepal.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
        <div className="mt-2 inline-block px-3 py-1 border border-[#b8b5a8] text-[10px]" style={{ background: '#dde4f0' }}>
          🌏 Asia/Kathmandu — UTC+5:45
        </div>
      </div>
    </div>
  );
}

function PanelRegional() {
  return (
    <div className="space-y-2 text-[10px]">
      <p className="text-[#555]">Language, number, and currency format settings.</p>
      {[
        ['Location', '🇳🇵 Pokhara, Nepal'],
        ['Language (UI)', 'English (US)'],
        ['Language (Spoken)', 'Nepali · Hindi · English · German (B1)'],
        ['Number Format', '1,234.56'],
        ['Currency', 'NPR (Nepalese Rupee)'],
        ['Date Format', 'DD/MM/YYYY'],
        ['Calendar', 'Gregorian (also BS)'],
      ].map(([k, v]) => (
        <div key={k} className="flex gap-2 py-1 border-b border-[#e0ddd5]">
          <span className="text-[#777] w-32 flex-shrink-0">{k}:</span>
          <span className="text-[#222]">{v}</span>
        </div>
      ))}
    </div>
  );
}

function PanelSecurity() {
  const { openWindow } = useWindows();
  return (
    <div className="space-y-2 text-[10px]">
      <p className="text-[#555]">Windows Security Center helps keep your computer secure.</p>
      {[
        { icon: '✅', label: 'Firewall', status: 'ON', color: '#2e7d32' },
        { icon: '✅', label: 'Antivirus', status: 'Up-to-date', color: '#2e7d32' },
        { icon: '✅', label: 'Automatic Updates', status: 'ON', color: '#2e7d32' },
        { icon: '✅', label: 'Certifications', status: '9 Active', color: '#1244a8' },
      ].map((item) => (
        <div key={item.label} className="flex items-center gap-2 p-2 border border-[#b8b5a8]" style={{ background: '#f0fff0' }}>
          <span>{item.icon}</span>
          <span className="flex-1 font-medium">{item.label}</span>
          <span className="font-bold" style={{ color: item.color }}>{item.status}</span>
        </div>
      ))}
      <button onClick={() => openWindow('certs')}
        className="text-[10px] px-3 py-1 border border-[#888] hover:bg-[#d4d0c8] mt-1"
        style={{ background: 'linear-gradient(180deg,#ece9d8 0%,#d4d0c8 100%)' }}>
        🏆 View Certificates
      </button>
    </div>
  );
}

function PanelScreenSaver() {
  return (
    <div className="space-y-3 text-[10px]">
      <p className="text-[#555]">Screen saver settings. The screensaver activates after 60 seconds of inactivity.</p>
      <div className="border border-[#b8b5a8] p-3 text-center" style={{ background: '#000', borderRadius: 2 }}>
        <div className="text-green-400 font-mono text-[11px] leading-relaxed">
          <div>{'> NISCHAL_OS v2026 ACTIVE'}</div>
          <div>{'> IDLE DETECTED...'}</div>
          <div className="animate-pulse">{'> SCREENSAVER LOADING ██████░░░░'}</div>
        </div>
      </div>
      <div className="flex gap-2">
        {[['Screen Saver', 'Matrix Rain'], ['Wait', '60 seconds'], ['On resume', 'Show desktop']].map(([k, v]) => (
          <div key={k} className="flex-1 border border-[#b8b5a8] p-2" style={{ background: '#ece9d8' }}>
            <div className="text-[9px] text-[#777]">{k}</div>
            <div className="font-bold text-[10px] text-[#0a246a]">{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ControlPanelWindow() {
  const { openWindow } = useWindows();
  const [panel, setPanel] = useState<PanelId>('home');
  const [view, setView]   = useState<'classic' | 'category'>('classic');

  const currentItem = panel !== 'home' ? ITEMS.find((i) => i.id === panel) : null;

  const handleOpen = (item: CPItem) => {
    if (item.id === '__window__' && item.windowId) {
      openWindow(item.windowId);
    } else if (item.id !== '__window__') {
      setPanel(item.id);
    } else {
      // Appearance item → opens Personalize via custom event
      openWindow('about'); // fallback
    }
  };

  // Toolbar
  const toolbar = (
    <div className="bg-[#ece9d8] border-b border-[#aaa] px-2 py-1 flex items-center gap-2">
      <div className="flex gap-0.5">
        <button onClick={() => setPanel('home')} className="text-[10px] px-2 py-0.5 bg-[#d4d0c8] border border-[#999] hover:bg-[#e0ddd5]">◀ Back</button>
      </div>
      <div className="flex-1 flex items-center bg-white border border-[#999] px-2 py-0.5 text-[10px] gap-1">
        <span>⚙️</span>
        <span className="text-[#0a246a] truncate">
          Control Panel{currentItem ? ` \\ ${currentItem.label}` : ''}
        </span>
      </div>
      <div className="flex gap-0.5">
        <button onClick={() => setView(v => v === 'classic' ? 'category' : 'classic')}
          className="text-[9px] px-2 py-0.5 bg-[#d4d0c8] border border-[#999] hover:bg-[#e0ddd5]">
          {view === 'classic' ? '📋 Category' : '⊞ Classic'} View
        </button>
      </div>
    </div>
  );

  return (
    <XPWindow id="controlpanel" menuItems={['File', 'Edit', 'View', 'Favorites', 'Tools', 'Help']}
      statusText={`${ITEMS.length} objects | Control Panel`} toolbar={toolbar}>
      <div className="flex h-full" style={{ minHeight: 0 }}>
        {/* Sidebar */}
        <div className="w-[140px] flex-shrink-0 border-r border-[#c0bdb0] p-2 text-[10px]" style={{ background: '#dde4f0' }}>
          <div className="font-bold text-[#0a246a] mb-2 pb-1 border-b border-[#b8b5a8]">Control Panel</div>
          <p className="text-[9px] text-[#555] leading-relaxed">
            Pick a category to change Windows settings, or switch to Classic View.
          </p>
          <div className="mt-3 space-y-1">
            <div className="text-[9px] font-bold text-[#0a246a] uppercase tracking-wide mb-1">See Also</div>
            {[
              { label: '❓ Help & Support', id: 'shortcuts' as const },
              { label: '🌐 Windows Update', id: 'ie' as const },
            ].map((link) => (
              <button key={link.label} onClick={() => openWindow(link.id)}
                className="block w-full text-left text-[9px] text-[#0000cc] underline hover:text-[#c00]">
                {link.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main panel */}
        <div className="flex-1 p-3 overflow-y-auto">
          <AnimatePresence mode="wait">
            {panel === 'home' ? (
              <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}>
                {view === 'classic' ? (
                  <>
                    <p className="text-[10px] text-[#555] mb-3">
                      Double-click an item to open its settings.
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      {ITEMS.map((item, i) => (
                        <motion.div key={`${item.id}-${i}`}
                          className="flex flex-col items-center gap-1 p-2 rounded cursor-pointer text-center"
                          whileHover={{ background: 'rgba(49,106,197,0.15)' }}
                          onDoubleClick={() => handleOpen(item)}
                          onClick={() => {}}
                          title={item.description}
                        >
                          <span className="text-2xl">{item.icon}</span>
                          <span className="text-[9px] leading-tight text-[#0a246a]">{item.label}</span>
                        </motion.div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    {ITEMS.map((item, i) => (
                      <motion.div key={`${item.id}-${i}`}
                        className="flex items-center gap-3 p-2 border border-[#b8b5a8] cursor-pointer"
                        style={{ background: '#ece9d8' }}
                        whileHover={{ background: 'rgba(49,106,197,0.1)' }}
                        onDoubleClick={() => handleOpen(item)}>
                        <span className="text-xl">{item.icon}</span>
                        <div>
                          <div className="text-[10px] font-bold text-[#0a246a]">{item.label}</div>
                          <div className="text-[9px] text-[#666]">{item.description}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div key={panel} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#c0bdb0]">
                  <span className="text-xl">{currentItem?.icon}</span>
                  <div>
                    <div className="text-[12px] font-bold text-[#0a246a]">{currentItem?.label}</div>
                    <div className="text-[9px] text-[#666]">{currentItem?.description}</div>
                  </div>
                </div>
                {panel === 'display'     && <PanelDisplay onPersonalize={() => openWindow('about')} />}
                {panel === 'sound'       && <PanelSound />}
                {panel === 'system'      && <PanelSystem />}
                {panel === 'accounts'    && <PanelAccounts />}
                {panel === 'programs'    && <PanelPrograms />}
                {panel === 'datetime'    && <PanelDateTime />}
                {panel === 'regional'    && <PanelRegional />}
                {panel === 'security'    && <PanelSecurity />}
                {panel === 'screensaver' && <PanelScreenSaver />}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </XPWindow>
  );
}
