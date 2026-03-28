'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import XPWindow from '../XPWindow';
import { codeSnippets } from '@/data/portfolio';

// Minimal syntax tokeniser (no deps)
function tokenise(code: string, lang: string): { text: string; type: string }[] {
  const tokens: { text: string; type: string }[] = [];

  if (lang === 'python') {
    const rules: [RegExp, string][] = [
      [/^(#[^\n]*)/, 'comment'],
      [/^("""[\s\S]*?"""|'''[\s\S]*?'''|"[^"]*"|'[^']*')/, 'string'],
      [/^(def |class |import |from |return |if |else:|elif |for |in |with |as |try:|except |finally:|pass|and |or |not |is |None|True|False)\b/, 'keyword'],
      [/^(\d+(?:\.\d+)?)/, 'number'],
      [/^([a-zA-Z_]\w*(?=\s*\())/, 'function'],
      [/^([a-zA-Z_]\w*)/, 'ident'],
      [/^(\s+)/, 'space'],
      [/^([^\w\s"'#]+)/, 'punct'],
    ];
    let rest = code;
    while (rest.length) {
      let matched = false;
      for (const [re, type] of rules) {
        const m = re.exec(rest);
        if (m) { tokens.push({ text: m[1], type }); rest = rest.slice(m[1].length); matched = true; break; }
      }
      if (!matched) { tokens.push({ text: rest[0], type: 'punct' }); rest = rest.slice(1); }
    }
    return tokens;
  }

  // TypeScript / JS tokeniser
  const tsRules: [RegExp, string][] = [
    [/^(\/\/[^\n]*)/, 'comment'],
    [/^(\/\*[\s\S]*?\*\/)/, 'comment'],
    [/^(`[^`]*`|"[^"]*"|'[^']*')/, 'string'],
    [/^(import|export|from|const|let|var|function|async|await|return|if|else|for|of|in|try|catch|finally|new|class|interface|type|extends|implements|default|throw|while|break|continue|null|undefined|true|false|void|typeof|instanceof)\b/, 'keyword'],
    [/^(\d+(?:\.\d+)?)/, 'number'],
    [/^([a-zA-Z_$][\w$]*(?=\s*[(<:]))/, 'function'],
    [/^([A-Z][a-zA-Z_$][\w$]*)/, 'type'],
    [/^([a-zA-Z_$][\w$]*)/, 'ident'],
    [/^(\s+)/, 'space'],
    [/^([^\w\s"'`/]+)/, 'punct'],
  ];
  let rest = code;
  while (rest.length) {
    let matched = false;
    for (const [re, type] of tsRules) {
      const m = re.exec(rest);
      if (m) { tokens.push({ text: m[1], type }); rest = rest.slice(m[1].length); matched = true; break; }
    }
    if (!matched) { tokens.push({ text: rest[0], type: 'punct' }); rest = rest.slice(1); }
  }
  return tokens;
}

const TOKEN_COLORS: Record<string, string> = {
  keyword:  '#569cd6',
  string:   '#ce9178',
  comment:  '#6a9955',
  number:   '#b5cea8',
  function: '#dcdcaa',
  type:     '#4ec9b0',
  ident:    '#9cdcfe',
  punct:    '#d4d4d4',
  space:    '#d4d4d4',
};

function HighlightedCode({ code, lang }: { code: string; lang: string }) {
  const tokens = tokenise(code, lang);
  return (
    <pre
      className="text-[10px] leading-[1.65] overflow-auto p-3 m-0"
      style={{ background: '#1e1e1e', color: '#d4d4d4', fontFamily: 'Consolas, "Courier New", monospace', whiteSpace: 'pre' }}
    >
      {tokens.map((t, i) => (
        <span key={i} style={{ color: TOKEN_COLORS[t.type] ?? '#d4d4d4' }}>
          {t.text}
        </span>
      ))}
    </pre>
  );
}

export default function SnippetsWindow() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [copied,    setCopied]    = useState(false);
  const [lineNums,  setLineNums]  = useState(true);

  const snippet = codeSnippets[activeIdx];

  const lines  = snippet.code.split('\n');

  const copyCode = useCallback(() => {
    const text = snippet.code;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } else {
      // Fallback for non-HTTPS / older browsers
      const el = document.createElement('textarea');
      el.value = text;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [snippet.code]);

  return (
    <XPWindow id="snippets" statusText={`📝  ${snippet.title} — ${snippet.lang}`}>
      <div className="flex h-full overflow-hidden" style={{ fontFamily: 'Tahoma, sans-serif' }}>

        {/* Sidebar — file list */}
        <div className="w-[160px] flex-shrink-0 border-r border-[#b8b5a8] overflow-y-auto"
          style={{ background: '#252526' }}>
          <div className="text-[9px] font-bold px-3 py-1.5 text-[#bbb] uppercase tracking-wider border-b border-[#3e3e3e]">
            EXPLORER
          </div>
          <div className="text-[9px] font-bold px-3 py-1 text-[#bbb] uppercase tracking-wider opacity-60">
            📁 SNIPPETS
          </div>
          {codeSnippets.map((s, i) => (
            <button
              key={i}
              className="w-full text-left px-4 py-1.5 text-[10px] truncate cursor-pointer"
              style={{
                background: activeIdx === i ? '#37373d' : 'transparent',
                color: activeIdx === i ? '#ffffff' : '#cccccc',
                borderLeft: activeIdx === i ? '2px solid #569cd6' : '2px solid transparent',
              }}
              onClick={() => { setActiveIdx(i); setCopied(false); }}
            >
              <span className="mr-1">{s.lang === 'python' ? '🐍' : s.lang === 'typescript' ? '⚡' : '📄'}</span>
              {s.title}
            </button>
          ))}
        </div>

        {/* Main editor area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tab bar */}
          <div className="flex items-center border-b border-[#3e3e3e]" style={{ background: '#2d2d2d' }}>
            <div className="px-3 py-1.5 text-[10px] flex items-center gap-1.5"
              style={{ background: '#1e1e1e', color: '#ccc', borderRight: '1px solid #3e3e3e' }}>
              <span>{snippet.lang === 'python' ? '🐍' : '⚡'}</span>
              <span>{snippet.title}.{snippet.lang === 'typescript' ? 'ts' : 'py'}</span>
              <span className="ml-1 text-[#888]">×</span>
            </div>
            <div className="flex-1" />
            {/* Toolbar */}
            <div className="flex items-center gap-1 px-2">
              <button
                className="text-[9px] px-2 py-0.5 rounded cursor-pointer"
                style={{ background: lineNums ? '#37373d' : 'transparent', color: '#ccc' }}
                onClick={() => setLineNums((v) => !v)}
              >
                #
              </button>
              <motion.button
                className="text-[9px] px-2 py-0.5 text-white cursor-pointer"
                style={{ background: copied ? '#2e7d32' : '#0e639c', borderRadius: 2 }}
                whileHover={{ filter: 'brightness(1.2)' }}
                whileTap={{ scale: 0.95 }}
                onClick={copyCode}
              >
                {copied ? '✓ Copied' : '📋 Copy'}
              </motion.button>
            </div>
          </div>

          {/* Description bar */}
          <div className="px-3 py-1.5 text-[10px] border-b border-[#3e3e3e]"
            style={{ background: '#2d2d2d', color: '#9cdcfe' }}>
            💡 {snippet.description}
          </div>

          {/* Code + line numbers */}
          <div className="flex-1 overflow-auto" style={{ background: '#1e1e1e' }}>
            <div className="flex">
              {lineNums && (
                <div className="text-[10px] leading-[1.65] text-right select-none px-2 pt-3"
                  style={{
                    fontFamily: 'Consolas, monospace',
                    color: '#858585',
                    background: '#1e1e1e',
                    borderRight: '1px solid #333',
                    minWidth: 36,
                    userSelect: 'none',
                  }}>
                  {lines.map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>
              )}
              <div className="flex-1 overflow-auto">
                <HighlightedCode code={snippet.code} lang={snippet.lang} />
              </div>
            </div>
          </div>

          {/* Status bar */}
          <div className="flex items-center gap-4 px-3 py-0.5 text-[9px]"
            style={{ background: '#007acc', color: 'white' }}>
            <span>{snippet.lang.toUpperCase()}</span>
            <span>{lines.length} lines</span>
            <span className="ml-auto">UTF-8</span>
          </div>
        </div>
      </div>
    </XPWindow>
  );
}
