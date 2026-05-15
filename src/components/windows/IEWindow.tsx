'use client';

import { useState, useCallback, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import XPWindow from '../XPWindow';

// ── Fake pages ────────────────────────────────────────────────────────────────
interface Page { title: string; render: () => React.ReactNode }

function HomeContent() {
  return (
    <div style={{ fontFamily: 'Times New Roman, serif', fontSize: 13, padding: 12, background: '#fff', height: '100%', overflow: 'auto' }}>
      {/* IE default home page */}
      <div style={{ background: 'linear-gradient(180deg,#2c6fca,#1244a8)', padding: '8px 12px', margin: '-12px -12px 12px', color: '#fff' }}>
        <span style={{ fontSize: 18, fontWeight: 'bold' }}>🪟 Microsoft Windows XP</span>
        <span style={{ fontSize: 11, marginLeft: 8, opacity: 0.8 }}>Internet Explorer 6.0</span>
      </div>
      <table width="100%" cellPadding={8} style={{ borderCollapse: 'collapse' }}>
        <tbody>
          <tr>
            <td width="60%" valign="top">
              <h2 style={{ color: '#1244a8', borderBottom: '2px solid #1244a8', paddingBottom: 4 }}>
                Welcome to Nischal&apos;s Portfolio
              </h2>
              <p style={{ lineHeight: 1.6 }}>
                Nischal Bhandari is an <strong>IT Graduate &amp; Full-Stack Developer</strong> from Pokhara, Nepal.
                With 3+ years of experience across IT infrastructure, web development, and language instruction.
              </p>
              <p style={{ lineHeight: 1.6 }}>
                Navigate this portfolio using the desktop icons, or type an address in the bar above.
              </p>
              <h3 style={{ color: '#1244a8' }}>Quick Links</h3>
              <ul style={{ lineHeight: 2 }}>
                {[
                  ['portfolio://about',    '👤 About Me'],
                  ['portfolio://projects', '📂 My Projects'],
                  ['portfolio://contact',  '✉️ Contact'],
                  ['portfolio://skills',   '⚙️ Skills & Technologies'],
                ].map(([href, label]) => (
                  <li key={href}>
                    <a href={href} style={{ color: '#0000cc' }} onClick={(e) => e.preventDefault()}>{label}</a>
                  </li>
                ))}
              </ul>
            </td>
            <td width="40%" valign="top" style={{ borderLeft: '1px solid #ccc', paddingLeft: 12 }}>
              <h3 style={{ color: '#1244a8', marginTop: 0 }}>Tech Stack</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {['JavaScript','Angular','React','Node.js','Python','TypeScript','Next.js','PostgreSQL'].map((t) => (
                  <span key={t} style={{ background: '#dde4f0', border: '1px solid #b8b5a8', padding: '1px 6px', fontSize: 11 }}>{t}</span>
                ))}
              </div>
              <h3 style={{ color: '#1244a8' }}>Fast Facts</h3>
              <table style={{ fontSize: 11, width: '100%' }}>
                <tbody>
                  {[['Location', '🌏 Pokhara, Nepal'], ['Experience', '3+ years'], ['Languages', '4 spoken'], ['Status', '✅ Open to hire']].map(([k,v]) => (
                    <tr key={k}><td style={{ color: '#888', paddingRight: 8 }}>{k}:</td><td><strong>{v}</strong></td></tr>
                  ))}
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
      <hr style={{ borderColor: '#ccc', margin: '12px 0' }} />
      <p style={{ fontSize: 11, color: '#888', textAlign: 'center' }}>
        © 2026 Nischal Bhandari · Pokhara, Nepal · nischalbhandari.com.np
      </p>
    </div>
  );
}

function BlankContent() {
  return <div style={{ background: '#fff', height: '100%' }} />;
}

function ErrorContent({ url }: { url: string }) {
  return (
    <div style={{ fontFamily: 'Tahoma,Arial,sans-serif', fontSize: 13, padding: 20, background: '#fff', height: '100%' }}>
      <h1 style={{ color: '#c00', fontSize: 18 }}>The page cannot be displayed</h1>
      <hr style={{ borderColor: '#c00' }} />
      <p>The page you are looking for is currently unavailable. The Web site might be experiencing technical difficulties, or you may need to adjust your browser settings.</p>
      <p><strong>URL:</strong> {url}</p>
      <details>
        <summary style={{ color: '#0000cc', cursor: 'pointer' }}>More information</summary>
        <p style={{ fontSize: 11, color: '#555' }}>
          HTTP Error 404 · Page Not Found<br />
          Technical Information: The server returned status code 404.
        </p>
      </details>
    </div>
  );
}

const PAGES: Record<string, Page> = {
  'nischalbhandari.com.np':   { title: 'Nischal Bhandari — Portfolio', render: HomeContent },
  'www.nischalbhandari.com.np':{ title: 'Nischal Bhandari — Portfolio', render: HomeContent },
  'about:home':               { title: 'MSN — Your personal internet', render: HomeContent },
  'about:blank':              { title: 'about:blank', render: BlankContent },
  'http://nischalbhandari.com.np': { title: 'Nischal Bhandari — Portfolio', render: HomeContent },
  'https://nischalbhandari.com.np':{ title: 'Nischal Bhandari — Portfolio', render: HomeContent },
};

const EXTERNAL_PREFIXES = [
  'https://github.com',
  'https://linkedin.com',
  'https://www.linkedin.com',
  'https://resend.com',
  'https://vercel.com',
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function IEWindow() {
  const [addressInput, setAddressInput] = useState('nischalbhandari.com.np');
  const [currentUrl,   setCurrentUrl]   = useState('nischalbhandari.com.np');
  const [history,      setHistory]      = useState(['nischalbhandari.com.np']);
  const [histIdx,      setHistIdx]      = useState(0);
  const [loading,      setLoading]      = useState(false);
  const [tabs, setTabs] = useState([{ id: 0, url: 'nischalbhandari.com.np', title: 'Nischal Bhandari — Portfolio' }]);
  const [activeTab, setActiveTab] = useState(0);

  const navigateTo = useCallback((rawUrl: string) => {
    const url = rawUrl.trim().replace(/^https?:\/\//, '').replace(/\/$/, '') || 'about:blank';
    const canonical = rawUrl.trim();

    // External URLs — open in real browser
    if (EXTERNAL_PREFIXES.some((p) => canonical.startsWith(p))) {
      window.open(canonical, '_blank', 'noopener,noreferrer');
      return;
    }

    setLoading(true);
    const page = PAGES[url] ?? PAGES[rawUrl.trim()];

    setTimeout(() => {
      setLoading(false);
      const display = url;
      setCurrentUrl(display);
      setAddressInput(display);
      setHistory((h) => [...h.slice(0, histIdx + 1), display]);
      setHistIdx((i) => i + 1);
      const title = page?.title ?? `${url} - Error`;
      setTabs((prev) => prev.map((t) => t.id === activeTab ? { ...t, url: display, title } : t));
    }, 300 + Math.random() * 400);
  }, [histIdx, activeTab]);

  const goBack    = () => { if (histIdx > 0) { const u = history[histIdx-1]; setCurrentUrl(u); setAddressInput(u); setHistIdx(i => i-1); } };
  const goForward = () => { if (histIdx < history.length-1) { const u = history[histIdx+1]; setCurrentUrl(u); setAddressInput(u); setHistIdx(i => i+1); } };
  const goHome    = () => navigateTo('nischalbhandari.com.np');
  const refresh   = () => navigateTo(currentUrl);
  const stop      = () => setLoading(false);

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') navigateTo(addressInput);
  };

  const addTab = () => {
    const id = Date.now();
    setTabs((prev) => [...prev, { id, url: 'about:blank', title: 'New Tab' }]);
    setActiveTab(id);
    setCurrentUrl('about:blank');
    setAddressInput('about:blank');
  };

  const page = PAGES[currentUrl];

  const toolbar = (
    <div>
      {/* Tab bar */}
      <div className="flex items-end gap-0.5 px-1 pt-0.5" style={{ background: '#d4d0c8', borderBottom: '1px solid #aaa' }}>
        {tabs.map((t) => (
          <div key={t.id}
            className="flex items-center gap-1 px-3 py-1 text-[10px] cursor-pointer border-t border-x max-w-[120px]"
            style={{
              background: t.id === activeTab ? '#ece9d8' : '#c0bdb0',
              borderColor: '#999',
              borderBottomColor: t.id === activeTab ? '#ece9d8' : '#999',
              marginBottom: t.id === activeTab ? -1 : 0,
              zIndex: t.id === activeTab ? 1 : 0,
              position: 'relative',
            }}
            onClick={() => { setActiveTab(t.id); setCurrentUrl(t.url); setAddressInput(t.url); }}>
            <span className="truncate">{t.title.split(' — ')[0]}</span>
            {tabs.length > 1 && (
              <button className="text-[9px] text-[#888] hover:text-red-600 ml-1"
                onClick={(e) => { e.stopPropagation(); setTabs((prev) => prev.filter((x) => x.id !== t.id)); if (activeTab === t.id) setActiveTab(tabs[0].id); }}>✕</button>
            )}
          </div>
        ))}
        <button onClick={addTab} className="px-2 py-1 text-[10px] text-[#555] hover:text-black">+</button>
      </div>

      {/* Navigation bar */}
      <div className="bg-[#ece9d8] border-b border-[#aaa] px-2 py-1 flex items-center gap-1.5">
        <div className="flex gap-0.5">
          {[['◀', goBack, histIdx <= 0], ['▶', goForward, histIdx >= history.length-1], ['✕', stop, !loading], ['🔄', refresh, false], ['🏠', goHome, false]].map(([label, fn, disabled]) => (
            <button key={String(label)} onClick={fn as () => void} disabled={disabled as boolean}
              className="text-[10px] px-1.5 py-0.5 bg-[#d4d0c8] border border-[#999] hover:bg-[#e0ddd5] disabled:opacity-40">
              {label as string}
            </button>
          ))}
        </div>
        <div className="text-[10px] text-[#555] flex-shrink-0">Address</div>
        <div className="flex-1 flex items-center bg-white border border-[#999] px-1 py-0.5 gap-1 min-w-0">
          <span className="text-[10px] text-[#555]">🌐</span>
          <input
            className="flex-1 text-[10px] outline-none bg-transparent min-w-0"
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
            onKeyDown={onKey}
          />
        </div>
        <button onClick={() => navigateTo(addressInput)}
          className="text-[10px] px-2 py-0.5 bg-[#d4d0c8] border border-[#999] hover:bg-[#e0ddd5] flex-shrink-0">
          Go
        </button>
      </div>

      {/* Loading bar */}
      <AnimatePresence>
        {loading && (
          <motion.div className="h-0.5 bg-[#316ac5] origin-left"
            initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }} />
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <XPWindow id="ie" menuItems={['File', 'Edit', 'View', 'Favorites', 'Tools', 'Help']}
      statusText={loading ? 'Opening page…' : `Done | Internet | Protected Mode: Off`}
      toolbar={toolbar} noPadding>
      <div className="w-full h-full overflow-auto" style={{ background: '#fff' }}>
        {loading ? (
          <div className="flex items-center justify-center h-full text-[#555] text-[11px]">
            <div className="text-center">
              <div className="text-3xl mb-3">🌐</div>
              <div>Opening {currentUrl}…</div>
            </div>
          </div>
        ) : page ? (
          page.render()
        ) : (
          <ErrorContent url={currentUrl} />
        )}
      </div>
    </XPWindow>
  );
}
