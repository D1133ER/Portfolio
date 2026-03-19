// Web Audio API–based sound effects for the XP portfolio.
// All functions are safe to call from any component — they silently
// do nothing if the AudioContext cannot be created or if muted.

let _muted = false;
let _ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!_ctx) {
      _ctx = new (
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      )();
    }
    // Resume if suspended (browser autoplay policy)
    if (_ctx.state === 'suspended') _ctx.resume();
    return _ctx;
  } catch {
    return null;
  }
}

export function getMuted() {
  return _muted;
}
export function setMuted(v: boolean) {
  _muted = v;
}

function note(freq: number, t: number, dur: number, type: OscillatorType = 'sine', vol = 0.18) {
  const ctx = getCtx();
  if (!ctx || _muted) return;
  const osc = ctx.createOscillator();
  const g   = ctx.createGain();
  osc.connect(g);
  g.connect(ctx.destination);
  osc.frequency.value = freq;
  osc.type = type;
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.start(t);
  osc.stop(t + dur);
}

/** Three ascending tones — played when a window opens */
export function playWindowOpen() {
  const ctx = getCtx();
  if (!ctx || _muted) return;
  const now = ctx.currentTime;
  [523, 659, 784].forEach((f, i) => note(f, now + i * 0.07, 0.15, 'sine', 0.14));
}

/** Three descending tones — played when a window closes */
export function playWindowClose() {
  const ctx = getCtx();
  if (!ctx || _muted) return;
  const now = ctx.currentTime;
  [784, 659, 523].forEach((f, i) => note(f, now + i * 0.06, 0.12, 'sine', 0.11));
}

/** Short tick — button / icon clicks */
export function playClick() {
  const ctx = getCtx();
  if (!ctx || _muted) return;
  note(900, ctx.currentTime, 0.05, 'square', 0.07);
}

/** Two-beat error sound — invalid form input etc. */
export function playError() {
  const ctx = getCtx();
  if (!ctx || _muted) return;
  const now = ctx.currentTime;
  note(220, now,       0.15, 'square', 0.18);
  note(220, now + 0.2, 0.15, 'square', 0.18);
}

/** Short celebratory chime — message sent, etc. */
export function playSuccess() {
  const ctx = getCtx();
  if (!ctx || _muted) return;
  const now = ctx.currentTime;
  [523, 659, 784, 1047].forEach((f, i) => note(f, now + i * 0.1, 0.2, 'sine', 0.12));
}

/** XP-ish startup melody — played on first desktop load */
export function playStartupChime() {
  const ctx = getCtx();
  if (!ctx || _muted) return;
  const now = ctx.currentTime;
  // E4 – G4 – D5 – E5 spaced out
  [330, 392, 587, 659].forEach((f, i) => note(f, now + i * 0.22, 0.3, 'sine', 0.16));
}

/** Descending soft chord — played when the Log Off dialog opens */
export function playLogoff() {
  const ctx = getCtx();
  if (!ctx || _muted) return;
  const now = ctx.currentTime;
  // Fading descend: A4 → E4 → C4, feels like "winding down"
  note(440, now,        0.28, 'sine',     0.17);
  note(330, now + 0.18, 0.28, 'sine',     0.14);
  note(262, now + 0.36, 0.40, 'sine',     0.12);
}

/** Heavy descending buzz — played when Turn Off / Shutdown dialog opens */
export function playShutdown() {
  const ctx = getCtx();
  if (!ctx || _muted) return;
  const now = ctx.currentTime;
  // Low rumble + two descending sawtooth beeps
  note(120, now,        0.5,  'sawtooth', 0.12);
  note(220, now + 0.05, 0.25, 'square',   0.14);
  note(180, now + 0.28, 0.25, 'square',   0.12);
  note(100, now + 0.50, 0.6,  'sawtooth', 0.10);
}

/** Confirmed logoff — single low "goodbye" tone before screen transition */
export function playLogoffConfirm() {
  const ctx = getCtx();
  if (!ctx || _muted) return;
  const now = ctx.currentTime;
  [330, 262, 196].forEach((f, i) => note(f, now + i * 0.14, 0.22, 'sine', 0.15));
}

/** Confirmed shutdown — low power-down sweep */
export function playShutdownConfirm() {
  const ctx = getCtx();
  if (!ctx || _muted) return;
  const now = ctx.currentTime;
  // Sweeping down from 300 → 60 Hz over ~1 s using rapid notes
  [300, 240, 180, 130, 90, 60].forEach((f, i) =>
    note(f, now + i * 0.13, 0.25, 'sawtooth', 0.13)
  );
}
