'use client';

import { useEffect, useRef, useState } from 'react';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&!?';

interface GlitchTextProps {
  text: string;
  /** ms before settling on the real letter (default 1200) */
  duration?: number;
  className?: string;
  /** start scrambling immediately on mount */
  autoPlay?: boolean;
}

export default function GlitchText({
  text,
  duration = 1200,
  className = '',
  autoPlay = true,
}: GlitchTextProps) {
  const [display, setDisplay] = useState<string[]>(text.split(''));
  const rafRef  = useRef<number | undefined>(undefined);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!autoPlay) return;

    const chars = text.split('');

    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min(elapsed / duration, 1); // 0 → 1

      // Reveal chars left-to-right as progress advances
      const revealedCount = Math.floor(progress * chars.length);

      setDisplay(
        chars.map((ch, i) => {
          if (ch === ' ') return ' ';
          if (i < revealedCount) return ch;            // settled
          if (i === revealedCount) {
            // currently scrambling
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          }
          // not reached yet — show random char at low opacity (handled by CSS)
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        })
      );

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setDisplay(chars); // ensure final state is exact
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(rafRef.current!);
      startRef.current = null;
    };
  }, [text, duration, autoPlay]);

  const chars = text.split('');
  const revealedCount = display.findIndex((ch, i) => ch === chars[i] || chars[i] === ' ')
    === -1 ? 0
    : display.filter((ch, i) => ch === chars[i] || chars[i] === ' ').length;

  return (
    <span className={className} aria-label={text}>
      {display.map((ch, i) => {
        const isSettled = ch === (chars[i]) && i < revealedCount;
        const isActive  = i === Math.floor((revealedCount / chars.length) * chars.length);
        return (
          <span
            key={i}
            style={{
              opacity:   isSettled || chars[i] === ' ' ? 1 : isActive ? 1 : 0.35,
              color:     isActive && ch !== chars[i] ? '#ff4444' : undefined,
              transition: 'color 0.05s',
              display:   'inline-block',
              minWidth:  ch === ' ' ? '0.3em' : undefined,
            }}
          >
            {ch}
          </span>
        );
      })}
    </span>
  );
}
