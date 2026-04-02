'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import XPWindow from '../XPWindow';
import { useWindows } from '@/context/WindowContext';

const DEFAULT_TEXT = `Welcome to Notepad!

You can use this notepad to jot down notes, copy portfolio details,
or draft a message before sending it via the Contact window.

Tip: Use File > Save As to download your notes as a .txt file.
`;

export default function NotepadWindow() {
  const { windows } = useWindows();
  const win = windows.find((w) => w.id === 'notepad');
  const [text, setText] = useState(DEFAULT_TEXT);
  const [wordWrap, setWordWrap] = useState(true);
  const [modified, setModified] = useState(false);
  const [showFindBar, setShowFindBar] = useState(false);
  const [findQuery, setFindQuery] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update window title when modified
  const titlePrefix = modified ? '*' : '';

  const lineCount = text.split('\n').length;
  const charCount = text.length;

  // Get current line/col from caret
  const [caretInfo, setCaretInfo] = useState({ line: 1, col: 1 });
  const updateCaret = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    const pos = ta.selectionStart;
    const before = ta.value.substring(0, pos);
    const lines = before.split('\n');
    setCaretInfo({ line: lines.length, col: lines[lines.length - 1].length + 1 });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    setModified(true);
    updateCaret();
  };

  // File → New
  const handleNew = () => {
    if (modified && !confirm('Discard unsaved changes?')) return;
    setText('');
    setModified(false);
    flash('New document');
  };

  // File → Open (local file)
  const handleOpen = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.md,.log,.csv,.json,.js,.ts,.py';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        setText(reader.result as string);
        setModified(false);
        flash(`Opened: ${file.name}`);
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // File → Save As
  const handleSave = () => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'notes.txt';
    a.click();
    URL.revokeObjectURL(url);
    setModified(false);
    flash('Saved as notes.txt');
  };

  // Edit → Select All
  const handleSelectAll = () => {
    textareaRef.current?.select();
  };

  // Edit → Copy
  const handleCopy = async () => {
    const ta = textareaRef.current;
    if (!ta) return;
    const selected = ta.value.substring(ta.selectionStart, ta.selectionEnd);
    if (selected) {
      await navigator.clipboard.writeText(selected).catch(() => {});
      flash('Copied!');
    }
  };

  // Edit → Timestamp
  const handleTimestamp = () => {
    const now = new Date();
    const ts = now.toLocaleTimeString() + ' ' + now.toLocaleDateString();
    const ta = textareaRef.current;
    if (!ta) return;
    const pos = ta.selectionStart;
    const next = text.substring(0, pos) + ts + text.substring(ta.selectionEnd);
    setText(next);
    setModified(true);
    flash('Timestamp inserted');
  };

  const flash = (msg: string) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(''), 2500);
  };

  // Find highlight — basic (just scrolls to occurrence)
  const handleFind = () => {
    if (!findQuery) return;
    const idx = text.toLowerCase().indexOf(findQuery.toLowerCase());
    if (idx === -1) { flash('Not found'); return; }
    const ta = textareaRef.current;
    if (!ta) return;
    ta.focus();
    ta.setSelectionRange(idx, idx + findQuery.length);
    flash(`Found at position ${idx}`);
  };

  // Close menu on outside click
  useEffect(() => {
    const close = () => setOpenMenu(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const menus: Record<string, { label: string; action?: () => void; separator?: boolean }[]> = {
    File: [
      { label: 'New',     action: handleNew },
      { label: 'Open…',  action: handleOpen },
      { label: 'Save As…', action: handleSave },
      { label: '', separator: true },
      { label: 'Print',  action: () => window.print() },
    ],
    Edit: [
      { label: 'Select All', action: handleSelectAll },
      { label: 'Copy',       action: handleCopy },
      { label: '', separator: true },
      { label: 'Time/Date',  action: handleTimestamp },
    ],
    Format: [
      { label: wordWrap ? '✓ Word Wrap' : '  Word Wrap', action: () => setWordWrap((p) => !p) },
    ],
    View: [
      { label: 'Find…',   action: () => { setShowFindBar((p) => !p); setOpenMenu(null); } },
    ],
  };

  return (
    <XPWindow id="notepad" menuItems={[]} noPadding>
      <div className="flex flex-col h-full" style={{ fontFamily: 'Tahoma, sans-serif', minHeight: 0 }}>
        {/* Custom menu bar */}
        <div
          className="flex items-center bg-[#ece9d8] border-b border-[#b0ada0] px-1 flex-shrink-0"
          style={{ height: 20 }}
        >
          {Object.keys(menus).map((menuName) => (
            <div key={menuName} className="relative">
              <button
                className="px-2 text-[11px] hover:bg-[#316ac5] hover:text-white rounded-sm py-0.5"
                style={{ background: openMenu === menuName ? '#316ac5' : undefined, color: openMenu === menuName ? '#fff' : undefined }}
                onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === menuName ? null : menuName); }}
              >
                {menuName}
              </button>
              {openMenu === menuName && (
                <div
                  className="absolute left-0 top-full z-50 min-w-[140px] py-0.5 shadow-lg"
                  style={{ background: '#ece9d8', border: '1px solid #999' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {menus[menuName].map((item, i) =>
                    item.separator ? (
                      <div key={i} className="border-t border-[#aaa] my-0.5" />
                    ) : (
                      <button
                        key={item.label}
                        className="block w-full text-left px-4 py-0.5 text-[11px] hover:bg-[#316ac5] hover:text-white"
                        onClick={() => { item.action?.(); setOpenMenu(null); }}
                      >
                        {item.label}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Find bar */}
        {showFindBar && (
          <div className="flex items-center gap-2 px-2 py-1 bg-[#f0f0e8] border-b border-[#bbb] flex-shrink-0">
            <span className="text-[10px]">Find:</span>
            <input
              className="border border-[#999] px-1 text-[11px] bg-white outline-none flex-1"
              style={{ height: 18 }}
              value={findQuery}
              onChange={(e) => setFindQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleFind()}
              placeholder="Search text…"
              autoFocus
            />
            <button
              className="text-[10px] px-2 border border-[#999] bg-[#d4d0c8] hover:bg-[#e0ddd5]"
              style={{ height: 18 }}
              onClick={handleFind}
            >
              Find
            </button>
            <button
              className="text-[10px] px-1 hover:opacity-70"
              onClick={() => setShowFindBar(false)}
            >
              ✕
            </button>
          </div>
        )}

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          className="flex-1 resize-none outline-none bg-white text-[12px] p-1"
          style={{
            fontFamily: 'Courier New, monospace',
            lineHeight: 1.5,
            whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
            overflowWrap: wordWrap ? 'break-word' : 'normal',
            overflowX: wordWrap ? 'hidden' : 'auto',
            minHeight: 0,
            border: 'none',
          }}
          value={text}
          onChange={handleChange}
          onKeyUp={updateCaret}
          onClick={updateCaret}
          spellCheck={false}
        />

        {/* Status bar */}
        <div
          className="flex items-center justify-between px-2 flex-shrink-0 border-t border-[#b0ada0]"
          style={{ height: 18, background: '#ece9d8', fontSize: 10, color: '#555' }}
        >
          <span>{statusMsg || `Ln ${caretInfo.line}, Col ${caretInfo.col}`}</span>
          <span>{lineCount} lines · {charCount} chars{modified ? ' · Modified' : ''}</span>
        </div>
      </div>
    </XPWindow>
  );
}
