'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import XPWindow from '../XPWindow';

type Tool = 'pencil' | 'eraser' | 'line' | 'rect' | 'fill';

const PALETTE = [
  '#000000','#808080','#800000','#808000','#008000','#008080','#000080','#800080',
  '#ffffff','#c0c0c0','#ff0000','#ffff00','#00ff00','#00ffff','#0000ff','#ff00ff',
];

const SIZES = [1, 3, 5, 10, 20];

const TOOL_ICONS: Record<Tool, string> = {
  pencil: '✏️',
  eraser: '🩹',
  line:   '╱',
  rect:   '▭',
  fill:   '🪣',
};

const CANVAS_W = 800;
const CANVAS_H = 500;

/** Flood-fill using a scan-line stack algorithm */
function floodFill(ctx: CanvasRenderingContext2D, sx: number, sy: number, fillColor: string) {
  const imgData = ctx.getImageData(0, 0, CANVAS_W, CANVAS_H);
  const data    = imgData.data;
  const idx     = (x: number, y: number) => (y * CANVAS_W + x) * 4;

  const target = data.slice(idx(sx, sy), idx(sx, sy) + 4);
  const fill   = hexToRgba(fillColor);

  if (target[0] === fill[0] && target[1] === fill[1] && target[2] === fill[2]) return;

  const stack: [number, number][] = [[sx, sy]];
  const visited = new Uint8Array(CANVAS_W * CANVAS_H);

  while (stack.length) {
    const [x, y] = stack.pop()!;
    if (x < 0 || x >= CANVAS_W || y < 0 || y >= CANVAS_H) continue;
    const i = y * CANVAS_W + x;
    if (visited[i]) continue;
    const p = idx(x, y);
    if (!colorMatch(data, p, target)) continue;
    visited[i] = 1;
    data[p] = fill[0]; data[p+1] = fill[1]; data[p+2] = fill[2]; data[p+3] = 255;
    stack.push([x+1,y],[x-1,y],[x,y+1],[x,y-1]);
  }
  ctx.putImageData(imgData, 0, 0);
}

function colorMatch(data: Uint8ClampedArray, p: number, target: Uint8ClampedArray | number[]) {
  return data[p]===target[0] && data[p+1]===target[1] && data[p+2]===target[2];
}

function hexToRgba(hex: string): [number,number,number,number] {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return [r,g,b,255];
}

export default function PaintWindow() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null); // for preview (line/rect)

  const [tool,    setTool]    = useState<Tool>('pencil');
  const [color,   setColor]   = useState('#000000');
  const [size,    setSize]    = useState(3);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [statusMsg, setStatus] = useState('Ready');

  const isDrawing   = useRef(false);
  const startPos    = useRef({ x: 0, y: 0 });
  const lastPos     = useRef({ x: 0, y: 0 });
  const snapData    = useRef<ImageData | null>(null); // snapshot for line/rect preview

  // ── Init canvas ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    const initial = ctx.getImageData(0, 0, CANVAS_W, CANVAS_H);
    setHistory([initial]);
    setHistIdx(0);
  }, []);

  // ── History helpers ───────────────────────────────────────────────────────────
  const saveSnapshot = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const snap = ctx.getImageData(0, 0, CANVAS_W, CANVAS_H);
    setHistory((prev) => {
      const trimmed = prev.slice(0, histIdx + 1);
      return [...trimmed, snap].slice(-20); // max 20 steps
    });
    setHistIdx((i) => Math.min(i + 1, 19));
  }, [histIdx]);

  const undo = useCallback(() => {
    if (histIdx <= 0) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const newIdx = histIdx - 1;
    ctx.putImageData(history[newIdx], 0, 0);
    setHistIdx(newIdx);
    setStatus('Undo');
  }, [histIdx, history]);

  // ── Coordinate helper ─────────────────────────────────────────────────────────
  function getPos(e: React.MouseEvent | React.TouchEvent) {
    const cvs = canvasRef.current!;
    const rect = cvs.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: Math.round((clientX - rect.left) * scaleX),
      y: Math.round((clientY - rect.top)  * scaleY),
    };
  }

  // ── Drawing ───────────────────────────────────────────────────────────────────
  const onDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const pos = getPos(e);
    const ctx  = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    isDrawing.current = true;
    startPos.current  = pos;
    lastPos.current   = pos;

    if (tool === 'fill') {
      saveSnapshot();
      floodFill(ctx, pos.x, pos.y, color);
      setStatus(`Filled at (${pos.x}, ${pos.y})`);
      isDrawing.current = false;
      return;
    }

    if (tool === 'line' || tool === 'rect') {
      snapData.current = ctx.getImageData(0, 0, CANVAS_W, CANVAS_H);
    }

    if (tool === 'pencil' || tool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  };

  const onMove = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing.current) {
      const pos = getPos(e);
      setStatus(`${pos.x}, ${pos.y}`);
      return;
    }
    const pos = getPos(e);
    const ctx  = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    setStatus(`${pos.x}, ${pos.y}`);

    if (tool === 'pencil') {
      ctx.lineWidth   = size;
      ctx.strokeStyle = color;
      ctx.lineCap     = 'round';
      ctx.lineJoin    = 'round';
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (tool === 'eraser') {
      ctx.lineWidth   = size * 3;
      ctx.strokeStyle = '#ffffff';
      ctx.lineCap     = 'round';
      ctx.lineJoin    = 'round';
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if ((tool === 'line' || tool === 'rect') && snapData.current) {
      // Restore snapshot then draw preview
      ctx.putImageData(snapData.current, 0, 0);
      ctx.lineWidth   = size;
      ctx.strokeStyle = color;
      ctx.fillStyle   = color;
      if (tool === 'line') {
        ctx.beginPath();
        ctx.moveTo(startPos.current.x, startPos.current.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      } else {
        const w = pos.x - startPos.current.x;
        const h = pos.y - startPos.current.y;
        ctx.strokeRect(startPos.current.x, startPos.current.y, w, h);
      }
    }
    lastPos.current = pos;
  };

  const onUp = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    const pos = getPos(e as React.MouseEvent);
    const ctx  = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    if (tool === 'line' || tool === 'rect') {
      // Commit final shape
      if (snapData.current) ctx.putImageData(snapData.current, 0, 0);
      ctx.lineWidth   = size;
      ctx.strokeStyle = color;
      if (tool === 'line') {
        ctx.beginPath();
        ctx.moveTo(startPos.current.x, startPos.current.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      } else {
        const w = pos.x - startPos.current.x;
        const h = pos.y - startPos.current.y;
        ctx.strokeRect(startPos.current.x, startPos.current.y, w, h);
      }
      snapData.current = null;
    }
    saveSnapshot();
    setStatus('Ready');
  };

  // ── Keyboard shortcuts ────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo]);

  // ── Save as PNG ───────────────────────────────────────────────────────────────
  const handleSave = () => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const a = document.createElement('a');
    a.href     = cvs.toDataURL('image/png');
    a.download = 'paint-nischal.png';
    a.click();
    setStatus('Saved!');
  };

  const handleClear = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    saveSnapshot();
    setStatus('Canvas cleared');
  };

  return (
    <XPWindow id="paint" menuItems={['File', 'Edit', 'View', 'Image', 'Colors', 'Help']} noPadding
      statusText={`${statusMsg} | ${tool} | ${color} | size: ${size}px`}>
      <div className="flex flex-col h-full" style={{ fontFamily: 'Tahoma, sans-serif' }}>

        {/* ── Tool / action bar ── */}
        <div className="flex items-center gap-1 px-1.5 py-1 flex-shrink-0 flex-wrap"
          style={{ background: '#d4d0c8', borderBottom: '1px solid #aaa' }}>

          {/* Tools */}
          <div className="flex gap-0.5 flex-shrink-0 border border-[#999] p-0.5" style={{ background: '#c0c0c0' }}>
            {(Object.keys(TOOL_ICONS) as Tool[]).map((t) => (
              <button key={t} onClick={() => setTool(t)}
                title={t.charAt(0).toUpperCase() + t.slice(1)}
                aria-pressed={tool === t}
                className="w-8 h-8 flex items-center justify-center text-sm border"
                style={{
                  background: tool === t ? '#808080' : '#c0c0c0',
                  borderColor: tool === t ? '#555 #ddd #ddd #555' : '#ddd #555 #555 #ddd',
                  fontSize: t === 'line' || t === 'rect' ? 12 : 14,
                  boxShadow: tool === t ? 'inset 1px 1px 2px rgba(0,0,0,0.4)' : undefined,
                }}>
                {TOOL_ICONS[t]}
              </button>
            ))}
          </div>

          <div className="h-7 w-px bg-[#888] mx-0.5 flex-shrink-0" />

          {/* Brush sizes */}
          <div className="flex gap-0.5 flex-shrink-0 items-center border border-[#999] px-1 py-0.5" style={{ background: '#c0c0c0' }}>
            {SIZES.map((s) => (
              <button key={s} onClick={() => setSize(s)} title={`${s}px`}
                className="flex items-center justify-center"
                style={{
                  width: 20, height: 20,
                  background: size === s ? '#808080' : '#c0c0c0',
                  border: `1px solid ${size === s ? '#555' : '#aaa'}`,
                }}>
                <div className="rounded-full bg-current"
                  style={{ width: Math.min(s * 1.5, 14), height: Math.min(s * 1.5, 14), background: '#000' }} />
              </button>
            ))}
          </div>

          <div className="h-7 w-px bg-[#888] mx-0.5 flex-shrink-0" />

          {/* Action buttons */}
          <div className="flex gap-1 flex-shrink-0">
            <button onClick={undo} disabled={histIdx <= 0}
              className="text-[10px] px-2 py-0.5 border border-[#999] disabled:opacity-40"
              style={{ background: 'linear-gradient(180deg,#ece9d8 0%,#d4d0c8 100%)' }}>
              ↩ Undo
            </button>
            <button onClick={handleClear}
              className="text-[10px] px-2 py-0.5 border border-[#999]"
              style={{ background: 'linear-gradient(180deg,#ece9d8 0%,#d4d0c8 100%)' }}>
              🗑 Clear
            </button>
            <button onClick={handleSave}
              className="text-[10px] px-2 py-0.5 border border-[#999]"
              style={{ background: 'linear-gradient(180deg,#ece9d8 0%,#d4d0c8 100%)' }}>
              💾 Save PNG
            </button>
          </div>
        </div>

        {/* ── Canvas area ── */}
        <div className="flex-1 overflow-auto" style={{ background: '#808080', padding: 6 }}>
          <div style={{ position: 'relative', display: 'inline-block', cursor: 'crosshair' }}>
            <canvas
              ref={canvasRef}
              width={CANVAS_W}
              height={CANVAS_H}
              style={{ display: 'block', maxWidth: '100%' }}
              onMouseDown={onDown}
              onMouseMove={onMove}
              onMouseUp={onUp}
              onMouseLeave={(e) => { if (isDrawing.current) onUp(e); }}
              onTouchStart={onDown}
              onTouchMove={onMove}
              onTouchEnd={onUp}
            />
            <canvas ref={overlayRef} width={CANVAS_W} height={CANVAS_H}
              style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', opacity: 0 }} />
          </div>
        </div>

        {/* ── Colour palette ── */}
        <div className="flex items-center gap-2 px-2 py-1 flex-shrink-0 flex-wrap"
          style={{ background: '#d4d0c8', borderTop: '1px solid #aaa' }}>
          {/* Current colour swatch */}
          <div className="flex-shrink-0 flex items-center gap-1">
            <div className="w-7 h-7 border-2 border-[#555]" style={{ background: color }} title={`Current: ${color}`} />
            <span className="text-[9px] text-[#333]">{color}</span>
          </div>
          <div className="h-6 w-px bg-[#888] flex-shrink-0" />
          {/* Palette swatches */}
          <div className="flex flex-wrap gap-0.5">
            {PALETTE.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className="w-5 h-5 flex-shrink-0 border"
                style={{
                  background: c,
                  borderColor: color === c ? '#000' : '#888',
                  borderWidth: color === c ? 2 : 1,
                  boxShadow: color === c ? '0 0 0 1px #fff inset' : undefined,
                }}
                title={c}
                aria-label={`Select colour ${c}`}
              />
            ))}
          </div>
          {/* Custom colour input */}
          <div className="flex items-center gap-1 flex-shrink-0 ml-auto">
            <span className="text-[9px] text-[#555]">Custom:</span>
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)}
              className="w-7 h-6 cursor-pointer border-0 p-0"
              style={{ background: 'none' }} aria-label="Custom colour picker" />
          </div>
        </div>
      </div>
    </XPWindow>
  );
}
