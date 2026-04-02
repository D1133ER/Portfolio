'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function NotFound() {
  const [glitchText, setGlitchText] = useState('');

  useEffect(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&!?';
    const target = 'PAGE_NOT_FOUND';
    let settled = 0;

    const interval = setInterval(() => {
      setGlitchText(
        target
          .split('')
          .map((ch, i) => {
            if (ch === '_') return ' ';
            if (i < settled) return ch;
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('')
      );
      settled++;
      if (settled > target.length) clearInterval(interval);
    }, 60);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="min-h-[100dvh] flex flex-col items-center justify-center p-6 font-[Tahoma,Arial,sans-serif]"
      style={{ background: '#000080' }}
    >
      {/* CRT scanlines */}
      <div
        className="fixed inset-0 pointer-events-none z-10"
        style={{
          background:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)',
        }}
      />

      <div className="max-w-[650px] w-full text-white relative z-20">
        {/* Title block */}
        <div className="mb-6">
          <span
            className="inline-block px-2 py-0.5 text-[14px] font-bold"
            style={{ background: '#aaa', color: '#000080' }}
          >
            Windows
          </span>
        </div>

        {/* BSOD content */}
        <div className="text-[14px] leading-relaxed space-y-4">
          <p>
            A problem has been detected and the page you requested has been
            stopped to prevent damage to your browsing experience.
          </p>

          <p className="font-bold font-mono text-[13px] tracking-wide">
            {glitchText || 'PAGE_NOT_FOUND'}
          </p>

          <p>
            If this is the first time you&apos;ve seen this error screen, restart
            your browser. If this screen appears again, follow these steps:
          </p>

          <p>
            Check to make sure the URL is typed correctly. If so, contact the
            website administrator for further assistance.
          </p>

          <p className="font-bold mt-6">Technical information:</p>
          <p className="font-mono text-[12px]">
            *** STOP: 0x00000404 (0x00000001, 0x00000000, 0xNOTF0UND)
          </p>
          <p className="font-mono text-[12px]">
            *** page.sys — Address FFFFF404 base at FFFFF000
          </p>
        </div>

        {/* Return link */}
        <div className="mt-10">
          <Link
            href="/"
            className="inline-block px-6 py-2.5 text-[12px] font-bold text-white border border-white/50 hover:bg-white/10 transition-colors"
          >
            Press any key to return to Desktop...
          </Link>
        </div>

        {/* Memory dump animation */}
        <div className="mt-6 text-[11px] opacity-60 font-mono">
          <p>Physical memory dump complete.</p>
          <p>Contact administrator: nischalbhandari11@gmail.com</p>
        </div>
      </div>
    </div>
  );
}
