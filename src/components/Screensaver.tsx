'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

const IDLE_MS = 60_000; // 1 minute of no interaction

// ── Matrix rain canvas ────────────────────────────────────────────────────────
function MatrixRain({ canvasRef }: { canvasRef: React.RefObject<HTMLCanvasElement | null> }) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const FONT_SIZE = 14;
    let cols = Math.floor(canvas.width / FONT_SIZE);
    const drops: number[] = Array(cols).fill(1);
    const bright: boolean[] = Array(cols).fill(false);

    const CHARS =
      'ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ' +
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&!?<>/\\[]{}|';

    let raf: number;

    const draw = () => {
      cols = Math.floor(canvas.width / FONT_SIZE);
      while (drops.length < cols)  { drops.push(1); bright.push(false); }

      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${FONT_SIZE}px monospace`;

      for (let i = 0; i < cols; i++) {
        const ch = CHARS[Math.floor(Math.random() * CHARS.length)];
        const x  = i * FONT_SIZE;
        const y  = drops[i] * FONT_SIZE;

        if (bright[i]) {
          ctx.fillStyle = '#ffffff';
        } else if (drops[i] < 6) {
          ctx.fillStyle = '#80ffb0';
        } else {
          ctx.fillStyle = `rgba(0, ${175 + Math.floor(Math.random() * 80)}, 65, 0.9)`;
        }

        ctx.fillText(ch, x, y);

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i]  = 0;
          bright[i] = Math.random() > 0.7;
        }
        drops[i]++;
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef as React.RefObject<HTMLCanvasElement>}
      className="absolute inset-0 w-full h-full"
    />
  );
}

// ── Hacker terminal log ───────────────────────────────────────────────────────
const TERMINAL_LINES = [
  '> INITIALISING INTRUSION SEQUENCE...',
  '> BYPASSING FIREWALL         [████████████] 100%',
  '> ACCESSING MAINFRAME........OK',
  '> DECRYPTING CREDENTIALS......',
  '> USER: nischal_bhandari     CLEARANCE: LEVEL 5',
  '> ROLE: Full-Stack Developer & IT Professional',
  '> SKILLS: JS · Angular · Python · Node · C++',
  '> EXPERIENCE: 3+ yrs         STATUS: OPEN_TO_HIRE',
  '> LOCATION: Pokhara, Nepal   SIGNAL: ENCRYPTED',
  '> PROJECTS SHIPPED: 4        BUGS FIXED: ∞',
  '> ESTABLISHING SECURE TUNNEL.........DONE',
  '> PORTFOLIO ACCESS: *** GRANTED ***',
  '> WARNING: RESUME NOT YET DOWNLOADED',
  '> TIP: type  hire  in cmd.exe to contact',
];

function HackerTerminal() {
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [cursor,       setCursor]       = useState(true);
  const idxRef = useRef(0);

  useEffect(() => {
    const next = () => {
      if (idxRef.current >= TERMINAL_LINES.length) return;
      setVisibleLines((p) => [...p, TERMINAL_LINES[idxRef.current]]);
      idxRef.current++;
      setTimeout(next, 280 + Math.random() * 260);
    };
    const t = setTimeout(next, 400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setCursor((c) => !c), 500);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className="absolute bottom-[52px] left-[28px] font-mono text-[11px] leading-[1.75] pointer-events-none select-none"
      style={{ color: '#00ff41', textShadow: '0 0 8px #00ff41aa', zIndex: 3 }}
    >
      {visibleLines.map((line, i) => (
        <div key={i}>
          {line}
          {i === visibleLines.length - 1 && cursor && (
            <span
              className="inline-block w-[7px] h-[12px] ml-0.5 align-middle"
              style={{ background: '#00ff41', boxShadow: '0 0 6px #00ff41' }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Glitch text (top-right status) ───────────────────────────────────────────
const GLITCH_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%!?';
function GlitchLabel({ text }: { text: string }) {
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    let settled = 0;
    const chars = text.split('');
    const iv = setInterval(() => {
      setDisplay(
        chars.map((ch, i) => {
          if (ch === ' ') return ' ';
          if (i < settled) return ch;
          return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
        }).join('')
      );
      settled++;
      if (settled > chars.length) clearInterval(iv);
    }, 50);
    return () => clearInterval(iv);
  }, [text]);

  return <>{display}</>;
}

// ── Bouncing NISCHAL.EXE box ──────────────────────────────────────────────────
const BOX_W  = 158;
const BOX_H  = 44;
const BSPEED = 1.8;

function BouncingBox() {
  const posRef  = useRef({ x: 220, y: 160 });
  const velRef  = useRef({ x: BSPEED, y: BSPEED });
  const [pos,   setPos] = useState({ x: 220, y: 160 });
  const rafRef  = useRef<number | undefined>(undefined);

  useEffect(() => {
    const step = () => {
      posRef.current.x += velRef.current.x;
      posRef.current.y += velRef.current.y;
      const maxX = window.innerWidth  - BOX_W;
      const maxY = window.innerHeight - BOX_H - 32;
      if (posRef.current.x <= 0 || posRef.current.x >= maxX) {
        velRef.current.x *= -1;
        posRef.current.x  = Math.max(0, Math.min(posRef.current.x, maxX));
      }
      if (posRef.current.y <= 0 || posRef.current.y >= maxY) {
        velRef.current.y *= -1;
        posRef.current.y  = Math.max(0, Math.min(posRef.current.y, maxY));
      }
      setPos({ ...posRef.current });
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current!);
  }, []);

  return (
    <div
      className="absolute font-mono font-bold text-[12px] flex items-center gap-2 px-3 pointer-events-none select-none"
      style={{
        left:       pos.x,
        top:        pos.y,
        width:      BOX_W,
        height:     BOX_H,
        color:      '#00ff41',
        background: 'rgba(0, 12, 0, 0.88)',
        border:     '1.5px solid #00ff41',
        boxShadow:  '0 0 22px #00ff4177, inset 0 0 10px #00ff4118',
        zIndex:     4,
        letterSpacing: '0.06em',
      }}
    >
      <span style={{ textShadow: '0 0 10px #00ff41' }}>▶</span>
      <div>
        <div style={{ textShadow: '0 0 8px #00ff41' }}>NISCHAL.EXE</div>
        <div className="text-[9px] opacity-60 tracking-widest">RUNNING...</div>
      </div>
    </div>
  );
}

// ── CRT scanline overlay ──────────────────────────────────────────────────────
function Scanlines() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background:
          'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)',
        zIndex: 5,
      }}
    />
  );
}

// ── Main Screensaver ──────────────────────────────────────────────────────────
export default function Screensaver() {
  const [active,  setActive]  = useState(false);
  const idleRef   = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const activeRef = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const resetIdle = () => {
    if (activeRef.current) {
      activeRef.current = false;
      setActive(false);
    }
    clearTimeout(idleRef.current);
    idleRef.current = setTimeout(() => {
      activeRef.current = true;
      setActive(true);
    }, IDLE_MS);
  };

  useEffect(() => {
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'] as const;
    events.forEach((e) => window.addEventListener(e, resetIdle, { passive: true }));
    idleRef.current = setTimeout(() => {
      activeRef.current = true;
      setActive(true);
    }, IDLE_MS);
    return () => {
      events.forEach((e) => window.removeEventListener(e, resetIdle));
      clearTimeout(idleRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="screensaver"
          className="absolute inset-0 z-[200] bg-black overflow-hidden select-none"
          style={{ cursor: 'none' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{    opacity: 0 }}
          transition={{ duration: 0.5 }}
          onMouseMove={resetIdle}
          onMouseDown={resetIdle}
        >
          {/* 1 — Matrix rain */}
          <MatrixRain canvasRef={canvasRef} />

          {/* 2 — CRT scanlines */}
          <Scanlines />

          {/* 3 — Hacker terminal log */}
          <HackerTerminal />

          {/* 4 — Bouncing exe box */}
          <BouncingBox />

          {/* 5 — Top-right status badge */}
          <div
            className="absolute top-3 right-4 font-mono text-[10px] leading-[1.6] pointer-events-none select-none"
            style={{ color: '#00ff41', textShadow: '0 0 6px #00ff41aa', zIndex: 6, opacity: 0.8 }}
          >
            <div><GlitchLabel text="SYS: NISCHAL_OS v2026.0" /></div>
            <div className="opacity-60 text-right">{new Date().toLocaleTimeString()} · SECURE</div>
          </div>

          {/* 6 — Wake hint */}
          <div
            className="absolute bottom-[38px] w-full text-center font-mono pointer-events-none"
            style={{ color: '#00ff4155', fontSize: 10, letterSpacing: '0.2em', zIndex: 6 }}
          >
            MOVE MOUSE OR PRESS ANY KEY TO WAKE
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
