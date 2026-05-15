'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import XPWindow from '../XPWindow';
import { jobData } from '@/data/portfolio';

// ── Playlist — portfolio career as album tracks ───────────────────────────────
interface Track {
  id:      number;
  title:   string;
  artist:  string;
  album:   string;
  year:    string;
  duration:string;
  desc:    string;
  icon:    string;
}

const TRACKS: Track[] = [
  { id: 1, title: 'Infrastructure Blues',  artist: jobData.kaski.company,      album: 'The IT Years',       year: '2019', duration: '5:21', desc: 'Five years managing hospital IT — servers, networks, and everything in between.', icon: '🏥' },
  { id: 2, title: 'Angular Groove',        artist: jobData.searchable.company,  album: 'Frontend Stories',  year: '2021', duration: '3:14', desc: 'Building Angular web apps for a US startup. Clean code and great interfaces.', icon: '💻' },
  { id: 3, title: 'Bug Hunters Anthem',    artist: jobData.skybase.company,     album: 'Quality Assured',   year: '2024', duration: '2:58', desc: 'Finding the bugs others miss. QA is the unsung hero of software.', icon: '🔬' },
  { id: 4, title: 'Full Stack Odyssey',    artist: jobData.infomax.company,     album: 'Modern Stack',      year: '2024', duration: '4:42', desc: 'React + Node + PostgreSQL. From database to UI in one dev.', icon: '🌐' },
  { id: 5, title: 'Guten Morgen Waltz',    artist: jobData.ing.company,         album: 'Deutsch Lessons',   year: '2024', duration: '6:00', desc: 'Teaching German B1 to 20+ students. Sprache ist Macht.', icon: '🇩🇪' },
  { id: 6, title: 'Portfolio.exe Theme',   artist: 'Nischal Bhandari',          album: 'Windows XP Edition',year: '2026', duration: '2:26', desc: 'The soundtrack to this very portfolio. Next.js + Framer Motion + love.', icon: '💾' },
];

// ── Animated visualizer bars ──────────────────────────────────────────────────
function Visualizer({ playing, accentColor }: { playing: boolean; accentColor: string }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setTick((t) => t + 1), 120);
    return () => clearInterval(id);
  }, [playing]);

  const BAR_COUNT = 28;
  return (
    <div className="flex items-end gap-px w-full" style={{ height: 56 }}>
      {Array.from({ length: BAR_COUNT }, (_, i) => {
        const h = playing
          ? 8 + Math.abs(Math.sin(i * 0.47 + tick * 0.25) * 30 + Math.cos(i * 0.31 + tick * 0.18) * 18)
          : 4 + (i % 4) * 2;
        return (
          <div key={i}
            style={{
              flex: 1,
              height: h,
              background: `linear-gradient(to top, ${accentColor}, ${accentColor}88)`,
              transition: playing ? 'height 0.12s ease' : 'height 0.5s ease',
              borderRadius: '1px 1px 0 0',
            }}
          />
        );
      })}
    </div>
  );
}

// ── Time format helper ────────────────────────────────────────────────────────
function fmtTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function MediaPlayerWindow() {
  const [playing,     setPlaying]     = useState(false);
  const [trackIdx,    setTrackIdx]    = useState(0);
  const [elapsed,     setElapsed]     = useState(0);
  const [volume,      setVolume]      = useState(80);
  const [muted,       setMuted]       = useState(false);
  const [shuffle,     setShuffle]     = useState(false);
  const [repeat,      setRepeat]      = useState(false);
  const [infoOpen,    setInfoOpen]    = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const track = TRACKS[trackIdx];
  const totalSecs = parseInt(track.duration.split(':')[0]) * 60 + parseInt(track.duration.split(':')[1]);

  // Timer
  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setElapsed((e) => {
          if (e >= totalSecs) {
            if (repeat) return 0;
            // Auto-next
            setTrackIdx((i) => {
              const next = shuffle ? Math.floor(Math.random() * TRACKS.length) : (i + 1) % TRACKS.length;
              return next;
            });
            return 0;
          }
          return e + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [playing, totalSecs, repeat, shuffle]);

  const playPause = useCallback(() => setPlaying((p) => !p), []);
  const stop      = useCallback(() => { setPlaying(false); setElapsed(0); }, []);
  const prev      = useCallback(() => { setTrackIdx((i) => (i - 1 + TRACKS.length) % TRACKS.length); setElapsed(0); }, []);
  const next      = useCallback(() => {
    setTrackIdx((i) => shuffle ? Math.floor(Math.random() * TRACKS.length) : (i + 1) % TRACKS.length);
    setElapsed(0);
  }, [shuffle]);

  const selectTrack = (i: number) => { setTrackIdx(i); setElapsed(0); setPlaying(true); };

  const progress = totalSecs > 0 ? (elapsed / totalSecs) * 100 : 0;
  const accentColors = ['#00c8ff', '#00ff8c', '#ff6b35', '#c86bff', '#ff3b6b', '#ffcc00'];
  const accent = accentColors[trackIdx % accentColors.length];

  return (
    <XPWindow id="mediaplayer" menuItems={['File', 'View', 'Play', 'Tools', 'Help']}
      statusText={`${playing ? '▶ Playing' : '⏸ Paused'} · ${track.title} · ${track.artist}`}
      noPadding>
      <div className="flex h-full min-h-0" style={{ background: '#1e1e1e', color: '#fff', fontFamily: 'Tahoma,sans-serif' }}>

        {/* ── Left: Now Playing ── */}
        <div className="flex flex-col w-[220px] flex-shrink-0 border-r border-[#333]">
          {/* Album art / visualizer */}
          <div className="relative flex-shrink-0 overflow-hidden" style={{ height: 140, background: '#111' }}>
            <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-20">
              {track.icon}
            </div>
            <div className="absolute bottom-0 left-0 right-0 px-2 pb-1">
              <Visualizer playing={playing} accentColor={accent} />
            </div>
            {/* Track icon overlay */}
            <motion.div className="absolute top-3 right-3 text-3xl"
              animate={playing ? { scale: [1, 1.05, 1] } : { scale: 1 }}
              transition={{ repeat: Infinity, duration: 2 }}>
              {track.icon}
            </motion.div>
          </div>

          {/* Track info */}
          <div className="px-3 py-2 flex-1 min-h-0 overflow-y-auto">
            <div className="text-[12px] font-bold truncate" style={{ color: accent }}>{track.title}</div>
            <div className="text-[10px] text-[#aaa] truncate">{track.artist}</div>
            <div className="text-[9px] text-[#666] mt-0.5">{track.album} · {track.year}</div>

            <button onClick={() => setInfoOpen((p) => !p)}
              className="text-[9px] text-[#555] hover:text-[#aaa] mt-1 flex items-center gap-0.5">
              {infoOpen ? '▲ Hide info' : '▼ Track info'}
            </button>

            <AnimatePresence>
              {infoOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <p className="text-[9px] text-[#888] mt-1 leading-relaxed">{track.desc}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Progress bar */}
          <div className="px-3 pb-1 flex-shrink-0">
            <div className="h-1.5 bg-[#333] rounded-full overflow-hidden cursor-pointer"
              onClick={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                const ratio = (e.clientX - r.left) / r.width;
                setElapsed(Math.round(ratio * totalSecs));
              }}>
              <motion.div className="h-full rounded-full" style={{ background: accent, width: `${progress}%` }}
                transition={{ duration: 0.5 }} />
            </div>
            <div className="flex justify-between text-[9px] text-[#666] mt-0.5">
              <span>{fmtTime(elapsed)}</span>
              <span>{track.duration}</span>
            </div>
          </div>

          {/* Transport controls */}
          <div className="px-3 pb-2 flex items-center justify-center gap-2 flex-shrink-0">
            {[
              { icon: '⏮',  label: 'Prev',       action: prev,      active: false },
              { icon: playing ? '⏸' : '▶', label: playing?'Pause':'Play', action: playPause, active: playing },
              { icon: '⏹',  label: 'Stop',       action: stop,      active: false },
              { icon: '⏭',  label: 'Next',       action: next,      active: false },
            ].map((b) => (
              <motion.button key={b.label} onClick={b.action} title={b.label}
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                style={{ background: b.active ? accent : '#333', color: b.active ? '#000' : '#fff' }}
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                {b.icon}
              </motion.button>
            ))}
          </div>

          {/* Volume + extras */}
          <div className="px-3 pb-2 flex items-center gap-2 flex-shrink-0">
            <button onClick={() => setMuted((m) => !m)} className="text-sm" title={muted ? 'Unmute' : 'Mute'}>
              {muted ? '🔇' : '🔊'}
            </button>
            <input type="range" min={0} max={100} value={muted ? 0 : volume}
              onChange={(e) => { setVolume(+e.target.value); setMuted(false); }}
              className="flex-1 h-1 accent-current"
              style={{ accentColor: accent }} />
            <button onClick={() => setShuffle((p) => !p)} className="text-[10px] px-1"
              style={{ color: shuffle ? accent : '#555' }} title="Shuffle">🔀</button>
            <button onClick={() => setRepeat((p) => !p)} className="text-[10px] px-1"
              style={{ color: repeat ? accent : '#555' }} title="Repeat">🔁</button>
          </div>
        </div>

        {/* ── Right: Playlist ── */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="px-3 py-2 text-[10px] font-bold border-b border-[#333]" style={{ color: accent }}>
            Now Playing — {TRACKS.length} tracks
          </div>
          <div className="flex-1 overflow-y-auto">
            {TRACKS.map((t, i) => {
              const active = i === trackIdx;
              return (
                <motion.div key={t.id}
                  className="flex items-center gap-2 px-3 py-2 cursor-pointer border-b border-[#2a2a2a]"
                  style={{ background: active ? '#2e2e3e' : 'transparent' }}
                  whileHover={{ background: '#2a2a2a' }}
                  onClick={() => selectTrack(i)}>
                  <div className="w-5 flex-shrink-0 text-center text-[10px]" style={{ color: active ? accent : '#555' }}>
                    {active && playing ? '♪' : i + 1}
                  </div>
                  <span className="text-lg flex-shrink-0">{t.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold truncate" style={{ color: active ? accent : '#ccc' }}>{t.title}</div>
                    <div className="text-[9px] text-[#666] truncate">{t.artist} · {t.year}</div>
                  </div>
                  <div className="text-[9px] text-[#555] flex-shrink-0">{t.duration}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </XPWindow>
  );
}
