'use client';

import { useState, useCallback, useEffect } from 'react';
import XPWindow from '../XPWindow';

// ── Types ─────────────────────────────────────────────────────────────────────
type Op = '+' | '-' | '*' | '/' | null;

interface CalcState {
  display:             string;
  prevValue:           number | null;
  op:                  Op;
  waitingForOperand:   boolean;
  memory:              number;
}

const INIT: CalcState = {
  display: '0', prevValue: null, op: null, waitingForOperand: false, memory: 0,
};

function compute(a: number, b: number, op: Op): number {
  if (op === '+') return a + b;
  if (op === '-') return a - b;
  if (op === '*') return a * b;
  if (op === '/') return b !== 0 ? a / b : NaN;
  return b;
}

function fmt(n: number): string {
  if (isNaN(n)) return 'Error';
  if (!isFinite(n)) return n > 0 ? 'Infinity' : '-Infinity';
  // Avoid overly long decimals
  const s = String(n);
  return s.length > 18 ? parseFloat(n.toPrecision(12)).toString() : s;
}

// ── Button component ──────────────────────────────────────────────────────────
type BtnColor = 'grey' | 'dark' | 'equals';

function Btn({
  label, onClick, span = 1, color = 'grey',
}: {
  label: string; onClick: () => void; span?: number; color?: BtnColor;
}) {
  const bg =
    color === 'equals' ? 'linear-gradient(180deg,#7ab8f5 0%,#3a80d0 100%)'
    : color === 'dark'  ? 'linear-gradient(180deg,#c0bdb0 0%,#a8a498 100%)'
    :                     'linear-gradient(180deg,#ece9d8 0%,#d4d0c8 100%)';

  return (
    <button
      onClick={onClick}
      style={{
        gridColumn: span > 1 ? `span ${span}` : undefined,
        background: bg,
        border: '1px solid #888',
        boxShadow: '1px 1px 0 rgba(255,255,255,0.7) inset, -1px -1px 0 rgba(0,0,0,0.15) inset',
        height: 26,
        fontSize: 11,
        fontWeight: 'bold',
        fontFamily: 'Tahoma,sans-serif',
        cursor: 'pointer',
        color: color === 'equals' ? '#fff' : '#000',
      }}
      onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = 'inset 1px 1px 3px rgba(0,0,0,0.3)'; }}
      onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '1px 1px 0 rgba(255,255,255,0.7) inset, -1px -1px 0 rgba(0,0,0,0.15) inset'; }}
    >
      {label}
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function CalculatorWindow() {
  const [s, setS] = useState<CalcState>(INIT);

  const digit = useCallback((d: string) => {
    setS((p) => {
      if (p.waitingForOperand) return { ...p, display: d === '.' ? '0.' : d, waitingForOperand: false };
      if (d === '.' && p.display.includes('.')) return p;
      if (d === '.' ) return { ...p, display: p.display + '.' };
      return { ...p, display: p.display === '0' ? d : p.display + d };
    });
  }, []);

  const setOp = useCallback((op: Op) => {
    setS((p) => {
      const cur = parseFloat(p.display);
      if (p.prevValue !== null && p.op && !p.waitingForOperand) {
        const res = compute(p.prevValue, cur, p.op);
        return { ...p, display: fmt(res), prevValue: res, op, waitingForOperand: true };
      }
      return { ...p, prevValue: cur, op, waitingForOperand: true };
    });
  }, []);

  const equals = useCallback(() => {
    setS((p) => {
      if (p.prevValue === null || p.op === null) return p;
      const res = compute(p.prevValue, parseFloat(p.display), p.op);
      return { ...p, display: fmt(res), prevValue: null, op: null, waitingForOperand: true };
    });
  }, []);

  const clear    = useCallback(() => setS(INIT), []);
  const clearE   = useCallback(() => setS((p) => ({ ...p, display: '0' })), []);
  const backspace= useCallback(() => setS((p) => ({ ...p, display: p.display.length > 1 ? p.display.slice(0, -1) : '0' })), []);
  const negate   = useCallback(() => setS((p) => ({ ...p, display: fmt(-parseFloat(p.display)) })), []);
  const pct      = useCallback(() => setS((p) => ({ ...p, display: fmt(parseFloat(p.display) / 100), waitingForOperand: true })), []);
  const sqrt     = useCallback(() => setS((p) => ({ ...p, display: fmt(Math.sqrt(parseFloat(p.display))), waitingForOperand: true })), []);
  const recip    = useCallback(() => setS((p) => ({ ...p, display: fmt(1 / parseFloat(p.display)), waitingForOperand: true })), []);
  const memStore = useCallback(() => setS((p) => ({ ...p, memory: parseFloat(p.display) })), []);
  const memRecall= useCallback(() => setS((p) => ({ ...p, display: fmt(p.memory), waitingForOperand: true })), []);
  const memClear = useCallback(() => setS((p) => ({ ...p, memory: 0 })), []);
  const memAdd   = useCallback(() => setS((p) => ({ ...p, memory: p.memory + parseFloat(p.display) })), []);
  const memSub   = useCallback(() => setS((p) => ({ ...p, memory: p.memory - parseFloat(p.display) })), []);

  // Keyboard support
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ('0123456789'.includes(e.key)) digit(e.key);
      else if (e.key === '.')  digit('.');
      else if (e.key === '+')  setOp('+');
      else if (e.key === '-')  setOp('-');
      else if (e.key === '*')  setOp('*');
      else if (e.key === '/')  { e.preventDefault(); setOp('/'); }
      else if (e.key === 'Enter' || e.key === '=') equals();
      else if (e.key === 'Backspace') backspace();
      else if (e.key === 'Escape')    clear();
      else if (e.key === 'F9')        negate();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [digit, setOp, equals, backspace, clear, negate]);

  const display = s.display.length > 20
    ? parseFloat(s.display).toExponential(8)
    : s.display;

  return (
    <XPWindow id="calculator" menuItems={['View', 'Edit', 'Help']}
      statusText={s.memory !== 0 ? `M = ${s.memory}` : ''}>
      <div style={{ fontFamily: 'Tahoma,sans-serif', width: 200 }}>
        {/* Display */}
        <div style={{
          background: '#fff', border: '1px inset #888',
          textAlign: 'right', padding: '2px 4px', fontSize: 18, fontFamily: 'Courier New,monospace',
          marginBottom: 4, overflow: 'hidden', whiteSpace: 'nowrap', height: 32, lineHeight: '28px',
        }}>
          {display}
        </div>

        {/* Memory row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 2, marginBottom: 2 }}>
          <Btn label="MC"  onClick={memClear}  color="dark" />
          <Btn label="MR"  onClick={memRecall} color="dark" />
          <Btn label="MS"  onClick={memStore}  color="dark" />
          <Btn label="M+"  onClick={memAdd}    color="dark" />
          <Btn label="M−"  onClick={memSub}    color="dark" />
        </div>

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 2 }}>
          <Btn label="←"   onClick={backspace}         color="dark" />
          <Btn label="CE"  onClick={clearE}            color="dark" />
          <Btn label="C"   onClick={clear}             color="dark" />
          <Btn label="±"   onClick={negate}            color="dark" />

          <Btn label="7"   onClick={() => digit('7')} />
          <Btn label="8"   onClick={() => digit('8')} />
          <Btn label="9"   onClick={() => digit('9')} />
          <Btn label="÷"   onClick={() => setOp('/')} color="dark" />

          <Btn label="4"   onClick={() => digit('4')} />
          <Btn label="5"   onClick={() => digit('5')} />
          <Btn label="6"   onClick={() => digit('6')} />
          <Btn label="×"   onClick={() => setOp('*')} color="dark" />

          <Btn label="1"   onClick={() => digit('1')} />
          <Btn label="2"   onClick={() => digit('2')} />
          <Btn label="3"   onClick={() => digit('3')} />
          <Btn label="−"   onClick={() => setOp('-')} color="dark" />

          <Btn label="0"   onClick={() => digit('0')} span={2} />
          <Btn label="."   onClick={() => digit('.')} />
          <Btn label="+"   onClick={() => setOp('+')} color="dark" />

          <Btn label="%"   onClick={pct}    />
          <Btn label="√"   onClick={sqrt}   />
          <Btn label="1/x" onClick={recip}  />
          <Btn label="="   onClick={equals} color="equals" />
        </div>
      </div>
    </XPWindow>
  );
}
