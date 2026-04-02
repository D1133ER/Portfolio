'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import XPWindow from '../XPWindow';

/* ── Types ── */
type Difficulty = 'beginner' | 'intermediate' | 'expert';
type GameState = 'idle' | 'playing' | 'won' | 'lost';

interface Cell {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighbors: number;
}

interface Config { rows: number; cols: number; mines: number }

const CONFIGS: Record<Difficulty, Config> = {
  beginner:     { rows: 9,  cols: 9,  mines: 10 },
  intermediate: { rows: 16, cols: 16, mines: 40 },
  expert:       { rows: 16, cols: 30, mines: 99 },
};

/* ── Helpers ── */
function createBlankGrid(rows: number, cols: number): Cell[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ isMine: false, isRevealed: false, isFlagged: false, neighbors: 0 }))
  );
}

function placeMines(grid: Cell[][], rows: number, cols: number, mineCount: number, safeR: number, safeC: number): Cell[][] {
  const next = grid.map((row) => row.map((c) => ({ ...c })));
  let placed = 0;
  while (placed < mineCount) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (!next[r][c].isMine && !(Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1)) {
      next[r][c].isMine = true;
      placed++;
    }
  }
  // Compute neighbor counts
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (next[r][c].isMine) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && next[nr][nc].isMine) count++;
        }
      next[r][c].neighbors = count;
    }
  }
  return next;
}

function floodReveal(grid: Cell[][], rows: number, cols: number, r: number, c: number): Cell[][] {
  const next = grid.map((row) => row.map((cell) => ({ ...cell })));
  const queue: [number, number][] = [[r, c]];
  while (queue.length) {
    const [cr, cc] = queue.shift()!;
    if (cr < 0 || cr >= rows || cc < 0 || cc >= cols) continue;
    const cell = next[cr][cc];
    if (cell.isRevealed || cell.isFlagged || cell.isMine) continue;
    cell.isRevealed = true;
    if (cell.neighbors === 0) {
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++)
          if (dr !== 0 || dc !== 0) queue.push([cr + dr, cc + dc]);
    }
  }
  return next;
}

const NUM_COLORS = ['', '#0100fe', '#017f01', '#fe0000', '#010080', '#810002', '#008081', '#000000', '#808080'];

/* ── Component ── */
export default function MinesweeperWindow() {
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const [grid, setGrid] = useState<Cell[][]>(() => createBlankGrid(9, 9));
  const [gameState, setGameState] = useState<GameState>('idle');
  const [flagCount, setFlagCount] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [flagMode, setFlagMode] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { rows, cols, mines } = CONFIGS[difficulty];

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    timerRef.current = setInterval(() => setElapsed((p) => Math.min(p + 1, 999)), 1000);
  }, [stopTimer]);

  useEffect(() => () => stopTimer(), [stopTimer]);

  const resetGame = useCallback(() => {
    stopTimer();
    const cfg = CONFIGS[difficulty];
    setGrid(createBlankGrid(cfg.rows, cfg.cols));
    setGameState('idle');
    setFlagCount(0);
    setElapsed(0);
  }, [difficulty, stopTimer]);

  // Reset when difficulty changes
  useEffect(() => { resetGame(); }, [difficulty]); // eslint-disable-line react-hooks/exhaustive-deps

  const checkWin = useCallback((g: Cell[][], r: number, c: number) => {
    const unrevealedSafe = g.flat().filter((cell) => !cell.isMine && !cell.isRevealed).length;
    return unrevealedSafe === 0;
  }, []);

  const handleCellClick = useCallback((r: number, c: number) => {
    if (gameState === 'won' || gameState === 'lost') return;
    setGrid((prev) => {
      let g = prev.map((row) => row.map((cell) => ({ ...cell })));
      if (g[r][c].isFlagged || g[r][c].isRevealed) return prev;

      // First click — place mines ensuring (r,c) is safe
      if (gameState === 'idle') {
        g = placeMines(g, rows, cols, mines, r, c);
        startTimer();
        setGameState('playing');
      }

      if (g[r][c].isMine) {
        // Reveal all mines
        const revealed = g.map((row) =>
          row.map((cell) => cell.isMine ? { ...cell, isRevealed: true } : cell)
        );
        revealed[r][c] = { ...revealed[r][c], isRevealed: true };
        stopTimer();
        setGameState('lost');
        return revealed;
      }

      const next = floodReveal(g, rows, cols, r, c);
      if (checkWin(next, r, c)) {
        stopTimer();
        setGameState('won');
      }
      return next;
    });
  }, [gameState, rows, cols, mines, startTimer, stopTimer, checkWin]);

  const handleRightClick = useCallback((e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (gameState === 'won' || gameState === 'lost') return;
    setGrid((prev) => {
      const g = prev.map((row) => row.map((cell) => ({ ...cell })));
      const cell = g[r][c];
      if (cell.isRevealed) return prev;
      const wasFlagged = cell.isFlagged;
      cell.isFlagged = !wasFlagged;
      setFlagCount((fc) => fc + (wasFlagged ? -1 : 1));
      return g;
    });
  }, [gameState]);

  const faceEmoji = gameState === 'won' ? '😎' : gameState === 'lost' ? '😵' : '🙂';
  const mineDisplay = Math.max(mines - flagCount, -99);
  const timerDisplay = String(elapsed).padStart(3, '0');
  const mineStr = String(Math.abs(mineDisplay)).padStart(3, '0');

  // Scroll container ref for large grids
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <XPWindow id="minesweeper" menuItems={['Game', 'Help']}>
      <div className="flex flex-col items-center gap-2 p-1 select-none" style={{ fontFamily: 'Tahoma, sans-serif' }}>
        {/* Difficulty selector */}
        <div className="flex gap-1 mb-1">
          {(['beginner', 'intermediate', 'expert'] as Difficulty[]).map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className="text-[10px] px-2 py-0.5 border capitalize"
              style={{
                background: difficulty === d
                  ? 'linear-gradient(180deg, #b8b5a8 0%, #d4d0c8 100%)'
                  : 'linear-gradient(180deg, #ece9d8 0%, #d4d0c8 100%)',
                borderColor: '#999',
                boxShadow: difficulty === d ? 'inset 1px 1px 2px rgba(0,0,0,0.3)' : undefined,
                fontWeight: difficulty === d ? 'bold' : 'normal',
              }}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Info bar */}
        <div
          className="flex items-center justify-between w-full px-3 py-2"
          style={{
            background: '#c0c0c0',
            border: '3px solid',
            borderColor: '#808080 #fff #fff #808080',
            boxShadow: 'inset 2px 2px 0 #808080',
          }}
        >
          {/* Mine counter */}
          <div className="flex" style={{ background: '#000', border: '1px inset #808080', padding: '1px 3px' }}>
            {(mineDisplay < 0 ? '-' + mineStr : mineStr).split('').map((ch, i) => (
              <span key={i} style={{ color: '#f00', fontFamily: 'monospace', fontSize: 18, fontWeight: 'bold', minWidth: 12, textAlign: 'center' }}>{ch}</span>
            ))}
          </div>

          {/* Smiley reset */}
          <button
            onClick={resetGame}
            className="text-lg leading-none"
            style={{
              width: 26, height: 26,
              background: '#c0c0c0',
              border: '2px solid',
              borderColor: '#fff #808080 #808080 #fff',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onMouseDown={(e) => (e.currentTarget.style.borderColor = '#808080 #fff #fff #808080')}
            onMouseUp={(e) => (e.currentTarget.style.borderColor = '#fff #808080 #808080 #fff')}
            title="New game"
          >
            {faceEmoji}
          </button>

          {/* Timer */}
          <div className="flex" style={{ background: '#000', border: '1px inset #808080', padding: '1px 3px' }}>
            {timerDisplay.split('').map((ch, i) => (
              <span key={i} style={{ color: '#f00', fontFamily: 'monospace', fontSize: 18, fontWeight: 'bold', minWidth: 12, textAlign: 'center' }}>{ch}</span>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div
          ref={scrollRef}
          className="overflow-auto"
          style={{ maxWidth: '100%', maxHeight: 340 }}
          onContextMenu={(e) => e.preventDefault()}
        >
          <div
            style={{
              display: 'inline-grid',
              gridTemplateColumns: `repeat(${cols}, 16px)`,
              border: '3px solid',
              borderColor: '#808080 #fff #fff #808080',
              background: '#c0c0c0',
            }}
          >
            {grid.map((row, r) =>
              row.map((cell, c) => {
                const isExploded = gameState === 'lost' && cell.isMine && cell.isRevealed && !cell.isFlagged && r * cols + c === 0; // just styling
                let bg = '#c0c0c0';
                let border = '2px solid';
                let borderColor = '#fff #808080 #808080 #fff';
                let content: React.ReactNode = null;

                if (cell.isRevealed) {
                  bg = '#c0c0c0';
                  border = '1px solid #808080';
                  borderColor = '#808080';
                  if (cell.isMine) {
                    bg = gameState === 'lost' ? '#f00' : '#c0c0c0';
                    content = <span style={{ fontSize: 11 }}>💣</span>;
                  } else if (cell.neighbors > 0) {
                    content = <span style={{ color: NUM_COLORS[cell.neighbors], fontSize: 11, fontWeight: 'bold', fontFamily: 'monospace' }}>{cell.neighbors}</span>;
                  }
                } else if (cell.isFlagged) {
                  content = <span style={{ fontSize: 11 }}>🚩</span>;
                } else if (gameState === 'lost' && cell.isMine && !cell.isFlagged) {
                  content = <span style={{ fontSize: 11 }}>💣</span>;
                }

                return (
                  <div
                    key={`${r}-${c}`}
                    onClick={() => flagMode ? handleRightClick({ preventDefault: () => {} } as React.MouseEvent, r, c) : handleCellClick(r, c)}
                    onContextMenu={(e) => handleRightClick(e, r, c)}
                    style={{
                      width: 16, height: 16,
                      background: bg,
                      border,
                      borderColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: cell.isRevealed ? 'default' : 'pointer',
                      boxSizing: 'border-box',
                      userSelect: 'none',
                    }}
                  >
                    {content}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Status */}
        {gameState === 'won' && (
          <div className="text-[11px] font-bold text-green-700 bg-green-50 border border-green-300 px-3 py-1 w-full text-center">
            🎉 You Win! Time: {elapsed}s
          </div>
        )}
        {gameState === 'lost' && (
          <div className="text-[11px] font-bold text-red-700 bg-red-50 border border-red-300 px-3 py-1 w-full text-center">
            💥 Game Over! Click 🙂 to restart
          </div>
        )}
        {gameState === 'idle' && (
          <div className="text-[10px] text-[#555] text-center">Click any cell to start · Right-click to flag</div>
        )}

        {/* Flag mode toggle — visible on touch devices for mobile accessibility */}
        <button
          onClick={() => setFlagMode((p) => !p)}
          className="text-[10px] px-3 py-1 border"
          style={{
            background: flagMode
              ? 'linear-gradient(180deg, #ffd6d6 0%, #ffaaaa 100%)'
              : 'linear-gradient(180deg, #ece9d8 0%, #d4d0c8 100%)',
            borderColor: flagMode ? '#c00' : '#999',
            fontWeight: flagMode ? 'bold' : 'normal',
            cursor: 'pointer',
          }}
          title="Toggle flag mode (for mobile: tap to flag instead of reveal)"
        >
          {flagMode ? '🚩 Flag Mode ON' : '🚩 Flag Mode'}
        </button>
      </div>
    </XPWindow>
  );
}
