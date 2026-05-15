'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import XPWindow from '../XPWindow';
import { useWindows } from '@/context/WindowContext';
import { WindowId } from '@/types';

// ── Virtual filesystem ────────────────────────────────────────────────────────
type NodeKind = 'drive' | 'folder' | 'file' | 'shortcut';

interface FSNode {
  name:      string;
  kind:      NodeKind;
  icon:      string;
  size?:     string;
  modified?: string;
  children?: FSNode[];
  action?:   () => void;         // for files: what happens on double-click
  windowId?: WindowId;           // for shortcuts
}

function buildFS(openWindow: (id: WindowId) => void, downloadCV: () => void): FSNode[] {
  return [
    {
      name: 'Local Disk (C:)', kind: 'drive', icon: '💽', size: '68.4 GB free / 120 GB',
      children: [
        {
          name: 'My Documents', kind: 'folder', icon: '📁', modified: '2026-05-14',
          children: [
            { name: 'README.txt',            kind: 'file',     icon: '📄', size: '2 KB',  modified: '2024-06-01', action: () => openWindow('notepad') },
            { name: 'Nischal-CV-2026.pdf',   kind: 'file',     icon: '📋', size: '86 KB', modified: '2026-05-14', action: downloadCV },
            { name: 'Projects',              kind: 'folder',   icon: '📂', modified: '2024-12-01', children: [
              { name: 'Hospital Management System', kind: 'shortcut', icon: '🏥', windowId: 'projects' },
              { name: 'E-Commerce Platform',        kind: 'shortcut', icon: '🛒', windowId: 'projects' },
              { name: 'Network Monitoring Tool',    kind: 'shortcut', icon: '📡', windowId: 'projects' },
              { name: 'Portfolio Website',          kind: 'shortcut', icon: '💾', windowId: 'projects' },
            ]},
            { name: 'Certificates', kind: 'folder', icon: '🏆', modified: '2024-06-01', children: [
              { name: 'CompTIA A+.cert',           kind: 'file', icon: '📜', size: '1 KB', action: () => openWindow('certs') },
              { name: 'CEH - Ethical Hacking.cert',kind: 'file', icon: '📜', size: '1 KB', action: () => openWindow('certs') },
              { name: 'IELTS 7.0 Academic.cert',   kind: 'file', icon: '📜', size: '1 KB', action: () => openWindow('certs') },
            ]},
            { name: 'German Vocab.txt', kind: 'file', icon: '🇩🇪', size: '4 KB', action: () => openWindow('quiz') },
          ],
        },
        {
          name: 'Program Files', kind: 'folder', icon: '📁', modified: '2001-10-25',
          children: [
            { name: 'Internet Explorer', kind: 'folder', icon: '📁', children: [
              { name: 'iexplore.exe', kind: 'shortcut', icon: '🌐', windowId: 'ie' },
            ]},
            { name: 'Windows Media Player', kind: 'folder', icon: '📁', children: [
              { name: 'wmplayer.exe', kind: 'shortcut', icon: '▶️', windowId: 'mediaplayer' },
            ]},
            { name: 'Accessories', kind: 'folder', icon: '📁', children: [
              { name: 'notepad.exe',    kind: 'shortcut', icon: '🗒️', windowId: 'notepad'     },
              { name: 'mspaint.exe',   kind: 'shortcut', icon: '🎨', windowId: 'paint'        },
              { name: 'calc.exe',      kind: 'shortcut', icon: '🔢', windowId: 'calculator'   },
              { name: 'solitaire.exe', kind: 'file',     icon: '🃏', size: '52 KB', action: () => openWindow('minesweeper') },
            ]},
          ],
        },
        {
          name: 'Windows', kind: 'folder', icon: '📁', modified: '2001-10-25',
          children: [
            { name: 'System32', kind: 'folder', icon: '📁', children: [
              { name: 'cmd.exe',      kind: 'shortcut', icon: '💻', windowId: 'terminal' },
              { name: 'taskmgr.exe', kind: 'shortcut', icon: '📋', windowId: 'taskmanager' },
              { name: 'minesweeper.exe', kind: 'shortcut', icon: '💣', windowId: 'minesweeper' },
            ]},
            { name: 'Fonts',   kind: 'folder', icon: '📁', children: [
              { name: 'Tahoma.ttf',  kind: 'file', icon: '🔤', size: '128 KB', modified: '2001-10-25' },
              { name: 'Arial.ttf',   kind: 'file', icon: '🔤', size: '192 KB', modified: '2001-10-25' },
              { name: 'Courier.ttf', kind: 'file', icon: '🔤', size: '96 KB',  modified: '2001-10-25' },
            ]},
          ],
        },
        {
          name: 'Users', kind: 'folder', icon: '📁', modified: '2024-01-01',
          children: [
            { name: 'Nischal', kind: 'folder', icon: '👤', children: [
              { name: 'Desktop.lnk',  kind: 'shortcut', icon: '🖥️', windowId: 'about'   },
              { name: 'portfolio.url', kind: 'shortcut', icon: '🌐', windowId: 'ie'      },
            ]},
          ],
        },
      ],
    },
    { name: '3½ Floppy (A:)', kind: 'drive', icon: '💾', size: 'Not ready', children: [] },
    { name: 'CD-ROM Drive (D:)', kind: 'drive', icon: '📀', size: '650 MB', children: [
      { name: 'WinXP_SP3_Setup.exe', kind: 'file', icon: '📦', size: '600 MB', modified: '2008-04-14', action: () => alert('🪟 Already installed! You\'re using it right now.') },
    ]},
    { name: 'Portfolio Share (Z:)', kind: 'drive', icon: '🌐', size: 'Network', children: [
      { name: 'github.com', kind: 'shortcut', icon: '✳', windowId: 'snippets' },
      { name: 'linkedin.com', kind: 'shortcut', icon: '💼', windowId: 'contact' },
    ]},
  ];
}

// ── Path / breadcrumb ─────────────────────────────────────────────────────────
function resolvePath(root: FSNode[], path: string[]): FSNode | null {
  if (path.length === 0) return null;
  let children: FSNode[] | undefined = root;
  let node: FSNode | undefined;
  for (const segment of path) {
    node = children?.find((n) => n.name === segment);
    if (!node) return null;
    children = node.children;
  }
  return node ?? null;
}

function getChildren(root: FSNode[], path: string[]): FSNode[] {
  if (path.length === 0) return root;
  const node = resolvePath(root, path);
  return node?.children ?? [];
}

export default function MyComputerWindow() {
  const { openWindow } = useWindows();
  const [path, setPath]       = useState<string[]>([]);
  const [history, setHistory] = useState<string[][]>([[]]);
  const [histIdx, setHistIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [view, setView]         = useState<'icons' | 'list'>('icons');

  const downloadCV = useCallback(() => {
    const a = document.createElement('a');
    a.href = '/nischal-bhandari-cv.pdf';
    a.download = 'Nischal-Bhandari-CV.pdf';
    a.click();
  }, []);

  const fs = useMemo(() => buildFS(openWindow, downloadCV), [openWindow, downloadCV]);
  const items = getChildren(fs, path);

  const navigate = useCallback((newPath: string[]) => {
    setPath(newPath);
    setHistory((h) => [...h.slice(0, histIdx + 1), newPath]);
    setHistIdx((i) => i + 1);
    setSelected(null);
  }, [histIdx]);

  const goBack    = () => { if (histIdx > 0) { const p = history[histIdx - 1]; setPath(p); setHistIdx(i => i - 1); setSelected(null); } };
  const goForward = () => { if (histIdx < history.length - 1) { const p = history[histIdx + 1]; setPath(p); setHistIdx(i => i + 1); setSelected(null); } };
  const goUp      = () => { if (path.length > 0) navigate(path.slice(0, -1)); };

  const handleDoubleClick = (item: FSNode) => {
    if ((item.kind === 'folder' || item.kind === 'drive') && item.children !== undefined) {
      navigate([...path, item.name]);
    } else if (item.kind === 'shortcut' && item.windowId) {
      openWindow(item.windowId);
    } else if (item.kind === 'file' && item.action) {
      item.action();
    }
  };

  const addressText = path.length === 0
    ? 'My Computer'
    : `C:\\${path.slice(1).join('\\')}`;

  const toolbar = (
    <div className="bg-[#ece9d8] border-b border-[#aaa] px-2 py-1 flex items-center gap-1.5 flex-wrap">
      <div className="flex gap-0.5">
        <button onClick={goBack}    disabled={histIdx <= 0}             className="text-[10px] px-2 py-0.5 bg-[#d4d0c8] border border-[#999] disabled:opacity-40 hover:bg-[#e0ddd5]">◀</button>
        <button onClick={goForward} disabled={histIdx >= history.length - 1} className="text-[10px] px-2 py-0.5 bg-[#d4d0c8] border border-[#999] disabled:opacity-40 hover:bg-[#e0ddd5]">▶</button>
        <button onClick={goUp}      disabled={path.length === 0}        className="text-[10px] px-2 py-0.5 bg-[#d4d0c8] border border-[#999] disabled:opacity-40 hover:bg-[#e0ddd5]">▲</button>
      </div>
      <div className="flex-1 flex items-center bg-white border border-[#999] px-2 py-0.5 text-[10px] gap-1 min-w-0">
        <span>🖥️</span>
        <span className="text-[#0a246a] truncate">{addressText}</span>
      </div>
      <div className="flex gap-0.5">
        <button onClick={() => setView('icons')} className={`text-[10px] px-1.5 py-0.5 border border-[#999] ${view==='icons' ? 'bg-[#c0bdb0]' : 'bg-[#d4d0c8] hover:bg-[#e0ddd5]'}`}>⊞</button>
        <button onClick={() => setView('list')}  className={`text-[10px] px-1.5 py-0.5 border border-[#999] ${view==='list'  ? 'bg-[#c0bdb0]' : 'bg-[#d4d0c8] hover:bg-[#e0ddd5]'}`}>≡</button>
      </div>
    </div>
  );

  const driveBar = path.length > 0 && path[0] === 'Local Disk (C:)' && (
    <div className="flex items-center gap-2 px-2 py-1 text-[9px] border-b border-[#c0bdb0]" style={{ background: '#dde4f0' }}>
      <span className="text-[#555]">Local Disk (C:)</span>
      <div className="flex-1 h-2 bg-[#c0bdb0] border border-[#999] overflow-hidden">
        <div className="h-full bg-[#316ac5]" style={{ width: '57%' }} />
      </div>
      <span className="text-[#555]">68.4 GB free of 120 GB</span>
    </div>
  );

  return (
    <XPWindow id="mycomputer" menuItems={['File', 'Edit', 'View', 'Favorites', 'Tools', 'Help']}
      statusText={`${items.length} object${items.length !== 1 ? 's' : ''}${selected ? ` · ${selected} selected` : ''}`}
      toolbar={toolbar}>
      <div className="flex h-full min-h-0 flex-col">
        {driveBar}
        {/* Breadcrumbs */}
        <div className="flex items-center gap-0.5 px-2 py-0.5 text-[9px] text-[#777] border-b border-[#e0ddd5] flex-wrap flex-shrink-0">
          <button className="hover:underline text-[#0a246a]" onClick={() => navigate([])}>My Computer</button>
          {path.map((p, i) => (
            <span key={i} className="flex items-center gap-0.5">
              <span>›</span>
              <button className="hover:underline text-[#0a246a]" onClick={() => navigate(path.slice(0, i + 1))}>{p}</button>
            </span>
          ))}
        </div>

        {/* File area */}
        <div className="flex-1 overflow-auto p-2 min-h-0">
          {view === 'icons' ? (
            <AnimatePresence mode="wait">
              <motion.div key={path.join('/')}
                className="grid gap-2"
                style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))' }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}>
                {items.map((item) => (
                  <motion.div key={item.name}
                    className="flex flex-col items-center gap-1 p-1.5 rounded cursor-pointer text-center"
                    style={{ background: selected === item.name ? 'rgba(49,106,197,0.3)' : 'transparent', outline: selected === item.name ? '1px dotted #316ac5' : 'none' }}
                    whileHover={{ background: 'rgba(49,106,197,0.15)' }}
                    onClick={() => setSelected(item.name)}
                    onDoubleClick={() => handleDoubleClick(item)}>
                    <span className="text-3xl">{item.icon}</span>
                    <span className="text-[9px] leading-tight text-[#0a246a] break-words w-full">{item.name}</span>
                  </motion.div>
                ))}
                {items.length === 0 && (
                  <div className="col-span-full text-[10px] text-[#888] text-center py-8">This folder is empty.</div>
                )}
              </motion.div>
            </AnimatePresence>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div key={path.join('/')} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }}>
                <div className="grid text-[9px] font-bold px-2 py-0.5 border-b border-[#aaa]"
                  style={{ gridTemplateColumns: '1fr 60px 80px 80px', background: '#d4d0c8' }}>
                  <span>Name</span><span>Type</span><span className="text-right">Size</span><span className="text-right">Modified</span>
                </div>
                {items.map((item) => (
                  <div key={item.name}
                    className="grid items-center px-2 py-1 hover:bg-[#316ac5] hover:text-white cursor-pointer border-b border-[#eee] group"
                    style={{ gridTemplateColumns: '1fr 60px 80px 80px', background: selected === item.name ? '#c8d8f5' : 'transparent' }}
                    onClick={() => setSelected(item.name)}
                    onDoubleClick={() => handleDoubleClick(item)}>
                    <span className="flex items-center gap-1.5 text-[10px]"><span>{item.icon}</span><span className="truncate">{item.name}</span></span>
                    <span className="text-[9px] text-[#666] group-hover:text-white/80 capitalize">{item.kind}</span>
                    <span className="text-[9px] text-[#666] group-hover:text-white/80 text-right">{item.size ?? '—'}</span>
                    <span className="text-[9px] text-[#666] group-hover:text-white/80 text-right">{item.modified ?? '—'}</span>
                  </div>
                ))}
                {items.length === 0 && (
                  <div className="text-[10px] text-[#888] text-center py-8">This folder is empty.</div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </XPWindow>
  );
}
