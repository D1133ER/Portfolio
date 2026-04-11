'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

import GlitchText from './GlitchText';

interface LoginScreenProps {
  onLogin: () => void;
}

// Characters to scatter in the background
const GLITCH_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&!?<>/\\[]{}|';

function GlitchBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Each cell has a "kind": normal | bright | highlight
    type Kind = 'normal' | 'bright' | 'highlight';
    type Cell = { char: string; opacity: number; dir: 1 | -1; speed: number; glitchTimer: number; kind: Kind };

    const pickKind = (): Kind => {
      const r = Math.random();
      if (r < 0.07) return 'highlight';  // ~7% cyan/orange accent
      if (r < 0.30) return 'bright';     // ~23% brighter blue-white
      return 'normal';
    };

    const createCell = (): Cell => {
      const kind = pickKind();
      return {
        char:        GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)],
        opacity:     Math.random() * 0.55,
        dir:         (Math.random() > 0.5 ? 1 : -1) as 1 | -1,
        speed:       0.004 + Math.random() * 0.014,
        glitchTimer: Math.floor(Math.random() * 80),
        kind,
      };
    };

    let cols = 1;
    let rows = 1;
    let cellSize = 18;
    let cells: Cell[] = [];

    const rebuildGrid = () => {
      const nextWidth = Math.max(1, Math.round(canvas.clientWidth));
      const nextHeight = Math.max(1, Math.round(canvas.clientHeight));

      canvas.width = nextWidth;
      canvas.height = nextHeight;

      cellSize = nextWidth < 480 ? 16 : 18;
      cols = Math.max(1, Math.ceil(nextWidth / cellSize));
      rows = Math.max(1, Math.ceil(nextHeight / cellSize));
      cells = Array.from({ length: cols * rows }, createCell);
    };

    rebuildGrid();

    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(rebuildGrid)
      : null;

    resizeObserver?.observe(canvas.parentElement ?? canvas);
    window.addEventListener('resize', rebuildGrid);
    window.addEventListener('orientationchange', rebuildGrid);

    let raf: number;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = `bold ${Math.max(12, cellSize - 3)}px monospace`;

      cells.forEach((cell, idx) => {
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        const x   = col * cellSize + 2;
        const y   = row * cellSize + (cellSize - 4);

        // Fade in/out
        cell.opacity += cell.speed * cell.dir;
        const maxOp = cell.kind === 'highlight' ? 0.85
                    : cell.kind === 'bright'    ? 0.60
                    : 0.40;
        if (cell.opacity >= maxOp) { cell.opacity = maxOp; cell.dir = -1; }
        if (cell.opacity <= 0)     { cell.opacity = 0;     cell.dir = 1;
          // re-roll kind when a cell resets so the grid stays dynamic
          cell.kind = pickKind();
        }

        // Scramble char frequently
        cell.glitchTimer--;
        if (cell.glitchTimer <= 0) {
          cell.char        = GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
          cell.glitchTimer = 8 + Math.floor(Math.random() * 70);
        }

        // Pick colour by kind
        const colour = cell.kind === 'highlight'
          ? (Math.random() > 0.5
              ? `rgba(80, 220, 255, ${cell.opacity})`   // cyan
              : `rgba(255, 160,  60, ${cell.opacity})`) // orange
          : cell.kind === 'bright'
          ? `rgba(220, 235, 255, ${cell.opacity})`      // bright white-blue
          : `rgba(140, 185, 255, ${cell.opacity})`;     // standard blue

        ctx.fillStyle = colour;
        ctx.fillText(cell.char, x, y);
      });

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      resizeObserver?.disconnect();
      window.removeEventListener('resize', rebuildGrid);
      window.removeEventListener('orientationchange', rebuildGrid);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [glitchCycle, setGlitchCycle] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setGlitchCycle((prev) => prev + 1);
    }, 4800);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col z-[90]"
      style={{ background: 'linear-gradient(180deg, #1f4b8c 0%, #3a7bd5 40%, #2563b0 100%)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.5 }}
    >
      {/* ── Glitch character background ── */}
      <GlitchBackground />
      {/* Top bar */}
      <motion.div
        className="xp-login-topbar w-full text-center py-3 px-5 text-white border-b-2 border-blue-400 relative z-[1]"
        style={{ background: 'linear-gradient(180deg, #2c5fa8 0%, #1a3c7a 100%)' }}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 120 }}
      >
        <h2 className="text-sm font-bold">Welcome</h2>
        <p className="text-[11px] text-blue-200 mt-0.5">To begin, click your user name</p>
      </motion.div>

      {/* Main login area */}
      <div className="xp-login-main flex-1 min-h-0 flex flex-col items-center justify-center gap-3 landscape:gap-1 landscape:py-2 overflow-y-auto relative z-[1]">
        <motion.div
          className="xp-login-wordmark px-4 text-center select-none pointer-events-none"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          style={{ textShadow: '0 2px 12px rgba(3, 12, 35, 0.9)' }}
        >
          <GlitchText
            key={`guru-knows-${glitchCycle}`}
            text='"Guru Knows"'
            duration={1300}
            className="xp-login-wordmark-title block font-bold text-white"
          />
          <GlitchText
            key={`gurucool-${glitchCycle}`}
            text='- GuruCOOL'
            duration={1650}
            className="xp-login-wordmark-subtitle mt-1 block font-bold text-[#ffe8a6]"
          />
        </motion.div>

        <motion.div
          className="xp-login-card flex flex-col items-center gap-3 px-6 sm:px-9 py-5 rounded cursor-pointer w-[90vw] max-w-[280px]"
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.3)',
          }}
          onClick={onLogin}
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 200, damping: 15 }}
          whileHover={{
            scale: 1.05,
            backgroundColor: 'rgba(255,255,255,0.25)',
            boxShadow: '0 0 30px rgba(255,255,255,0.2)',
          }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            className="w-16 h-16 rounded-full border-3 border-white flex items-center justify-center text-[22px] text-white font-bold xp-login-avatar"
            style={{ background: 'linear-gradient(135deg, #f90, #ff6600)' }}
            animate={{
              boxShadow: [
                '0 0 0px rgba(255,153,0,0.4)',
                '0 0 20px rgba(255,153,0,0.6)',
                '0 0 0px rgba(255,153,0,0.4)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            NB
          </motion.div>
          <span className="text-white text-sm font-bold">Nischal Bhandari</span>
          <motion.span
            className="text-blue-200 text-[10px]"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Click to log in
          </motion.span>
        </motion.div>

        {/* Welcome text with typewriter effect */}
        <motion.p
          className="text-blue-200 text-xs mt-4 text-center max-w-[300px]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          Welcome to Nischal&apos;s Portfolio Experience
        </motion.p>
      </div>

      {/* Bottom bar */}
      <motion.div
        className="xp-login-bottom-bar w-full flex justify-between items-center px-5 py-2.5 border-t-2 border-blue-400 relative z-[1]"
        style={{ background: 'linear-gradient(180deg, #1a3c7a 0%, #0f2752 100%)' }}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 120 }}
      >
        <span className="text-blue-200 text-[10px]">Turn off computer</span>
        <motion.button
          className="text-white text-[11px] px-3.5 py-0.5 rounded-xl cursor-pointer border border-blue-900"
          style={{ background: 'linear-gradient(180deg, #4a90d9 0%, #2163a8 50%, #1a5298 100%)' }}
          onClick={onLogin}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Log In ▶
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
