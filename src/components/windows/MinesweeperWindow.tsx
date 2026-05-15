'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import XPWindow from '../XPWindow';
import { saveMinesBestTime, getMinesBestTimes, type MinesBestTimes } from '@/utils/storage';

type Difficulty = 'beginner' | 'intermediate' | 'expert';
type GameState  = 'idle' | 'playing' | 'won' | 'lost';
/** Unrevealed cycling state: blank → flag → question → blank */
type CellMark   = 'none' | 'flag' | 'question';

interface Cell {
  isMine:     boolean;
  isRevealed: boolean;
  mark:       CellMark;
  neighbors:  number;
}

interface Config { rows: number; cols: number; mines: number }

const CONFIGS: Record<Difficulty, Config> = {
  beginner:     { rows: 9,  cols: 9,  mines: 10 },
  intermediate: { rows: 16, cols: 16, mines: 40 },
  expert:       { rows: 16, cols: 30, mines: 99 },
};

function createBlankGrid(rows: number, cols: number): Cell[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ isMine: false, isRevealed: false, mark: 'none' as CellMark, neighbors: 0 }))
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
    if (cell.isRevealed || cell.mark !== 'none' || cell.isMine) continue;
    cell.isRevealed = true;
    if (cell.neighbors === 0) {
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++)
          if (dr !== 0 || dc !== 0) queue.push([cr + dr, cc + dc]);
    }
  }
  return next;
}

/** Chord-click: if a revealed numbered cell has exactly the right number of flags around it,
 *  auto-reveal all non-flagged, non-revealed neighbours. */
function chordReveal(grid: Cell[][], rows: number, cols: number, r: number, c: number): Cell[][] | null {
  const cell = grid[r][c];
  if (!cell.isRevealed || cell.neighbors === 0) return null;
  let flagCount = 0;
  for (let dr = -1; dr <= 1; dr++)
    for (let dc = -1; dc <= 1; dc++) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc].mark === 'flag') flagCount++;
    }
  if (flagCount !== cell.neighbors) return null;
  let next = grid.map((row) => row.map((cl) => ({ ...cl })));
  for (let dr = -1; dr <= 1; dr++)
    for (let dc = -1; dc <= 1; dc++) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        const n = next[nr][nc];
        if (!n.isRevealed && n.mark !== 'flag') {
          next = floodReveal(next, rows, cols, nr, nc);
        }
      }
    }
  return next;
}

const NUM_COLORS = ['', '#0100fe', '#017f01', '#fe0000', '#010080', '#810002', '#008081', '#000000', '#808080'];

function fmt(n: number) { return String(n).padStart(3, '0'); }

export default function MinesweeperWindow() {
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const [grid,       setGrid]       = useState<Cell[][]>(() => createBlankGrid(9, 9));
  const [gameState,  setGameState]  = useState<GameState>('idle');
  const [flagCount,  setFlagCount]  = useState(0);
  const [elapsed,    setElapsed]    = useState(0);
  const [flagMode,   setFlagMode]   = useState(false);
  const [bestTimes,  setBestTimes]  = useState<MinesBestTimes>({});

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { rows, cols, mines } = CONFIGS[difficulty];

  // Load best times from storage on mount
  useEffect(() => { setBestTimes(getMinesBestTimes()); }, []);

  const stopTimer  = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);
  const startTimer = useCallback(() => {
    stopTimer();
    timerRef.current = setInterval(() => setElapsed((p) => Math.min(p + 1, 999)), 1000);
  }, [stopTimer]);

  useEffect(() => () => stopTimer(), [stopTimer]);

  const resetGame = useCallback((diff = difficulty) => {
    stopTimer();
    const cfg = CONFIGS[diff];
    setGrid(createBlankGrid(cfg.rows, cfg.cols));
    setGameState('idle');
    setFlagCount(0);
    setElapsed(0);
  }, [difficulty, stopTimer]);

  useEffect(() => { resetGame(difficulty); }, [difficulty]); // eslint-disable-line

  const handleCellClick = useCallback((r: number, c: number) => {
    if (gameState === 'won' || gameState === 'lost') return;

    setGrid((prev) => {
      const cell = prev[r][c];
      if (cell.mark !== 'none') return prev;   // flagged or question — ignore left click

      // Chord click on already-revealed numbered cell
      if (cell.isRevealed && cell.neighbors > 0) {
        const chorded = chordReveal(prev, rows, cols, r, c);
        if (!chorded) return prev;
        const hitMine = chorded.flat().some((cl) => cl.isMine && cl.isRevealed && !prev.flat()[0].isMine); // check new reveals
        // Check if any newly revealed mine
        const prevFlat = prev.flat();
        const nextFlat = chorded.flat();
        const newMineTrigger = nextFlat.find((cl, i) => cl.isMine && cl.isRevealed && !prevFlat[i].isRevealed);
        if (newMineTrigger) {
          const exploded = chorded.map((row) => row.map((cl) => cl.isMine ? { ...cl, isRevealed: true } : cl));
          stopTimer();
          setGameState('lost');
          return exploded;
        }
        const unrevealedSafe = nextFlat.filter((cl) => !cl.isMine && !cl.isRevealed).length;
        if (unrevealedSafe === 0) { stopTimer(); setGameState('won'); void hitMine; }
        return chorded;
      }

      if (cell.isRevealed) return prev;

      let g = prev.map((row) => row.map((cl) => ({ ...cl })));

      if (gameState === 'idle') {
        g = placeMines(g, rows, cols, mines, r, c);
        startTimer();
        setGameState('playing');
      }

      if (g[r][c].isMine) {
        const exploded = g.map((row) => row.map((cl) => cl.isMine ? { ...cl, isRevealed: true } : cl));
        stopTimer();
        setGameState('lost');
        return exploded;
      }

      const next = floodReveal(g, rows, cols, r, c);
      const unrevealedSafe = next.flat().filter((cl) => !cl.isMine && !cl.isRevealed).length;
      if (unrevealedSafe === 0) {
        stopTimer();
        setGameState('won');
        saveMinesBestTime(difficulty, elapsed > 0 ? elapsed : 1);
        setBestTimes(getMinesBestTimes());
      }
      return next;
    });
  }, [gameState, rows, cols, mines, startTimer, stopTimer, difficulty, elapsed]);

  const handleRightClick = useCallback((e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (gameState === 'won' || gameState === 'lost') return;
    setGrid((prev) => {
      const g = prev.map((row) => row.map((cl) => ({ ...cl })));
      const cell = g[r][c];
      if (cell.isRevealed) return prev;
      // Cycle: none → flag → question → none
      const nextMark: CellMark = cell.mark === 'none' ? 'flag' : cell.mark === 'flag' ? 'question' : 'none';
      const delta = cell.mark === 'none' ? 1 : cell.mark === 'flag' ? -1 : 0;
      cell.mark = nextMark;
      setFlagCount((fc) => fc + delta);
      return g;
    });
  }, [gameState]);

  const faceEmoji   = gameState === 'won' ? '😎' : gameState === 'lost' ? '😵' : '🙂';
  const mineDisplay = Math.max(mines - flagCount, -99);
  const bestTime    = bestTimes[difficulty];

  return (
    <XPWindow id="minesweeper" menuItems={['Game', 'Help']}>
      <div className="flex flex-col items-center gap-2 p-1 select-none" style={{ fontFamily: 'Tahoma, sans-serif' }}>

        {/* Difficulty selector */}
        <div className="flex gap-1 mb-1">
          {(['beginner', 'intermediate', 'expert'] as Difficulty[]).map((d) => (
            <button key={d} onClick={() => setDifficulty(d)}
              className="text-[10px] px-2 py-0.5 border capitalize"
              style={{
                background: difficulty === d ? 'linear-gradient(180deg,#b8b5a8 0%,#d4d0c8 100%)' : 'linear-gradient(180deg,#ece9d8 0%,#d4d0c8 100%)',
                borderColor: '#999',
                boxShadow: difficulty === d ? 'inset 1px 1px 2px rgba(0,0,0,0.3)' : undefined,
                fontWeight: difficulty === d ? 'bold' : 'normal',
              }}>
              {d}
            </button>
          ))}
        </div>

        {/* Info bar */}
        <div className="flex items-center justify-between w-full px-3 py-2"
          style={{ background: '#c0c0c0', border: '3px solid', borderColor: '#808080 #fff #fff #808080', boxShadow: 'inset 2px 2px 0 #808080' }}>

          {/* Mine counter */}
          <div className="flex" style={{ background: '#000', border: '1px inset #808080', padding: '1px 3px' }}>
            {(mineDisplay < 0 ? '-' + fmt(Math.abs(mineDisplay)) : fmt(mineDisplay)).split('').map((ch, i) => (
              <span key={i} style={{ color: '#f00', fontFamily: 'monospace', fontSize: 18, fontWeight: 'bold', minWidth: 12, textAlign: 'center' }}>{ch}</span>
            ))}
          </div>

          {/* Smiley reset */}
          <button onClick={() => resetGame()} style={{ width: 26, height: 26, background: '#c0c0c0', border: '2px solid', borderColor: '#fff #808080 #808080 #fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}
            onMouseDown={(e) => (e.currentTarget.style.borderColor = '#808080 #fff #fff #808080')}
            onMouseUp={(e)   => (e.currentTarget.style.borderColor = '#fff #808080 #808080 #fff')}
            title="New game" aria-label="New game">
            {faceEmoji}
          </button>

          {/* Timer */}
          <div className="flex" style={{ background: '#000', border: '1px inset #808080', padding: '1px 3px' }}>
            {fmt(elapsed).split('').map((ch, i) => (
              <span key={i} style={{ color: '#f00', fontFamily: 'monospace', fontSize: 18, fontWeight: 'bold', minWidth: 12, textAlign: 'center' }}>{ch}</span>
            ))}
          </div>
        </div>

        {/* Best time badge */}
        {bestTime !== undefined && (
          <div className="text-[9px] text-[#555] w-full text-right pr-1">
            🏆 Best ({difficulty}): <span className="font-bold text-[#003cad]">{bestTime}s</span>
          </div>
        )}

        {/* Grid */}
        <div className="overflow-auto" style={{ maxWidth: '100%', maxHeight: 340 }}
          onContextMenu={(e) => e.preventDefault()}>
          <div style={{ display: 'inline-grid', gridTemplateColumns: `repeat(${cols}, 16px)`, border: '3px solid', borderColor: '#808080 #fff #fff #808080', background: '#c0c0c0' }}>
            {grid.map((row, r) =>
              row.map((cell, c) => {
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
                } else if (cell.mark === 'flag') {
                  content = <span style={{ fontSize: 11 }}>🚩</span>;
                } else if (cell.mark === 'question') {
                  content = <span style={{ fontSize: 11, fontWeight: 'bold', color: '#a000a0' }}>?</span>;
                } else if (gameState === 'lost' && cell.isMine) {
                  content = <span style={{ fontSize: 11 }}>💣</span>;
                }

                return (
                  <div key={`${r}-${c}`}
                    onClick={() => flagMode
                      ? handleRightClick({ preventDefault: () => {} } as React.MouseEvent, r, c)
                      : handleCellClick(r, c)}
                    onContextMenu={(e) => handleRightClick(e, r, c)}
                    style={{ width: 16, height: 16, background: bg, border, borderColor, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: cell.isRevealed ? 'default' : 'pointer', boxSizing: 'border-box', userSelect: 'none' }}
                  >
                    {content}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Status messages */}
        {gameState === 'won' && (
          <div className="text-[11px] font-bold text-green-700 bg-green-50 border border-green-300 px-3 py-1 w-full text-center">
            🎉 You Win! {elapsed}s{bestTime === elapsed ? ' — New Best! 🏆' : ''}
          </div>
        )}
        {gameState === 'lost' && (
          <div className="text-[11px] font-bold text-red-700 bg-red-50 border border-red-300 px-3 py-1 w-full text-center">
            💥 Game Over! Click 🙂 to restart
          </div>
        )}
        {gameState === 'idle' && (
          <div className="text-[10px] text-[#555] text-center">
            Click any cell to start · Right-click to cycle flag / ? / clear
          </div>
        )}
        {gameState === 'playing' && (
          <div className="text-[10px] text-[#555] text-center">
            Right-click: flag → ? → clear · Double-click numbered cell to chord
          </div>
        )}

        {/* Flag mode toggle (mobile) */}
        <button onClick={() => setFlagMode((p) => !p)}
          className="text-[10px] px-3 py-1 border"
          style={{ background: flagMode ? 'linear-gradient(180deg,#ffd6d6 0%,#ffaaaa 100%)' : 'linear-gradient(180deg,#ece9d8 0%,#d4d0c8 100%)', borderColor: flagMode ? '#c00' : '#999', fontWeight: flagMode ? 'bold' : 'normal', cursor: 'pointer' }}
          title="Toggle flag mode (tap instead of right-click on mobile)"
          aria-pressed={flagMode}
        >
          {flagMode ? '🚩 Flag Mode ON' : '🚩 Flag Mode'}
        </button>
      </div>
    </XPWindow>
  );
}
