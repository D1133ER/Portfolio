'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import XPWindow from '../XPWindow';
import { technicalSkills, softSkills, languages } from '@/data/portfolio';

// All skills to display on radar
const RADAR_GROUPS = {
  Technical: [
    { name: 'JavaScript',    level: 85 },
    { name: 'Angular',       level: 80 },
    { name: 'Full Stack',    level: 78 },
    { name: 'Python',        level: 75 },
    { name: 'IT Support',    level: 92 },
    { name: 'System Admin',  level: 85 },
    { name: 'Pen Testing',   level: 62 },
    { name: 'QA/Testing',    level: 72 },
  ],
  Domain: [
    { name: 'Healthcare IT', level: 88 },
    { name: 'Teaching',      level: 82 },
    { name: 'Business Dev',  level: 75 },
    { name: 'PR & Comms',    level: 72 },
    { name: 'Networking',    level: 84 },
    { name: 'Security',      level: 68 },
    { name: 'German (B1)',   level: 68 },
    { name: 'Project Mgmt',  level: 77 },
  ],
} as const;

type GroupKey = keyof typeof RADAR_GROUPS;

const CX = 160;
const CY = 160;
const R  = 130;

function polarToXY(angle: number, radius: number): [number, number] {
  const rad = (angle - 90) * (Math.PI / 180);
  return [CX + radius * Math.cos(rad), CY + radius * Math.sin(rad)];
}

function RadarChart({ skills, color }: { skills: { name: string; level: number }[]; color: string }) {
  const n = skills.length;
  const angles = skills.map((_, i) => (360 / n) * i);

  // Concentric grid rings
  const rings = [20, 40, 60, 80, 100];

  // Skill polygon
  const poly = skills.map((s, i) => {
    const [x, y] = polarToXY(angles[i], (s.level / 100) * R);
    return `${x},${y}`;
  }).join(' ');

  // Full outer for gridlines
  const outerPoly = angles.map((a) => {
    const [x, y] = polarToXY(a, R);
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width="320" height="320" viewBox="0 0 320 320" style={{ maxWidth: '100%', height: 'auto' }}>
      {/* Grid rings */}
      {rings.map((pct) => {
        const pts = angles.map((a) => {
          const [x, y] = polarToXY(a, (pct / 100) * R);
          return `${x},${y}`;
        }).join(' ');
        return (
          <polygon key={pct} points={pts} fill="none"
            stroke="#c0bdb0" strokeWidth="0.8" strokeDasharray="3,3" />
        );
      })}

      {/* Axis lines */}
      {angles.map((a, i) => {
        const [x, y] = polarToXY(a, R);
        return <line key={i} x1={CX} y1={CY} x2={x} y2={y} stroke="#c0bdb0" strokeWidth="0.8" />;
      })}

      {/* Skill fill polygon */}
      <motion.polygon
        points={poly}
        fill={`${color}33`}
        stroke={color}
        strokeWidth="2"
        initial={{ scale: 0, originX: '50%', originY: '50%' }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.7, type: 'spring' }}
      />

      {/* Skill dots */}
      {skills.map((s, i) => {
        const [x, y] = polarToXY(angles[i], (s.level / 100) * R);
        return (
          <motion.circle
            key={i} cx={x} cy={y} r="4"
            fill={color} stroke="white" strokeWidth="1.5"
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ delay: 0.05 * i, type: 'spring' }}
          />
        );
      })}

      {/* Labels */}
      {skills.map((s, i) => {
        const [x, y] = polarToXY(angles[i], R + 18);
        const anchor = x < CX - 5 ? 'end' : x > CX + 5 ? 'start' : 'middle';
        return (
          <text key={i} x={x} y={y + 4}
            textAnchor={anchor} fontSize="9" fill="#333" fontFamily="Tahoma, sans-serif">
            {s.name}
          </text>
        );
      })}

      {/* Percent labels on 80% ring */}
      {[20, 40, 60, 80, 100].map((p) => {
        const [, y] = polarToXY(0, (p / 100) * R);
        return (
          <text key={p} x={CX + 3} y={y - 2}
            fontSize="7.5" fill="#888" fontFamily="Tahoma, sans-serif">{p}%</text>
        );
      })}
    </svg>
  );
}

export default function RadarWindow() {
  const [activeGroup, setActiveGroup] = useState<GroupKey>('Technical');

  const skills = RADAR_GROUPS[activeGroup];
  const avg    = Math.round(skills.reduce((s, x) => s + x.level, 0) / skills.length);
  const peak   = skills.reduce((a, b) => a.level > b.level ? a : b);
  const lowest = skills.reduce((a, b) => a.level < b.level ? a : b);

  const colors: Record<GroupKey, string> = {
    Technical: '#1244a8',
    Domain:    '#2e7d32',
  };

  return (
    <XPWindow id="radar" statusText="📊  Interactive Skill Radar — sys_stats.exe">
      <div className="p-3 overflow-auto" style={{ fontFamily: 'Tahoma, sans-serif' }}>

        {/* Tabs */}
        <div className="flex gap-0.5 mb-3 border-b border-[#b8b5a8]">
          {(Object.keys(RADAR_GROUPS) as GroupKey[]).map((g) => (
            <button key={g} onClick={() => setActiveGroup(g)}
              className={`px-4 py-1 text-[11px] border-t border-x cursor-pointer transition-colors ${
                activeGroup === g
                  ? 'bg-[#ece9d8] border-[#b8b5a8] font-bold -mb-px z-10 relative'
                  : 'bg-[#d4d0c8] border-[#b8b5a8] text-[#444] hover:bg-[#dddad3]'
              }`}
            >
              {g} Skills
            </button>
          ))}
        </div>

        <div className="flex gap-4 flex-col sm:flex-row flex-wrap">
          {/* Radar SVG */}
          <div className="border border-[#b8b5a8] p-2 self-start mx-auto sm:mx-0" style={{ background: '#fafaf8' }}>
            <RadarChart skills={[...skills]} color={colors[activeGroup]} />
          </div>

          {/* Side panel with stats */}
          <div className="flex-1 min-w-[140px] flex flex-col gap-2">

            {/* Summary cards */}
            <div className="border border-[#b8b5a8] p-2.5" style={{ background: '#dde4f0' }}>
              <div className="text-[10px] font-bold text-[#0a246a] mb-2">📈 Statistics</div>
              {[
                { label: 'Average',  val: `${avg}%`,         icon: '📊' },
                { label: 'Peak',     val: `${peak.name}`,    icon: '🏆' },
                { label: 'Growing',  val: `${lowest.name}`,  icon: '🌱' },
              ].map(({ label, val, icon }) => (
                <div key={label} className="flex justify-between text-[10px] mb-1.5">
                  <span>{icon} {label}</span>
                  <span className="font-bold text-[#0a246a] max-w-[80px] text-right truncate">{val}</span>
                </div>
              ))}
            </div>

            {/* Skill list with bars */}
            <div className="border border-[#b8b5a8] p-2.5 flex flex-col gap-1.5" style={{ background: '#ece9d8' }}>
              <div className="text-[10px] font-bold text-[#0a246a] mb-1">Skill Breakdown</div>
              {[...skills].sort((a, b) => b.level - a.level).map((s) => (
                <div key={s.name}>
                  <div className="flex justify-between text-[9px] mb-0.5">
                    <span className="truncate">{s.name}</span>
                    <span className="font-bold ml-1">{s.level}%</span>
                  </div>
                  <div className="h-1.5 bg-[#c0bdb0] overflow-hidden">
                    <motion.div
                      className="h-full"
                      style={{ background: colors[activeGroup] }}
                      initial={{ width: 0 }}
                      animate={{ width: `${s.level}%` }}
                      transition={{ duration: 0.5, delay: 0.05 }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Language proficiency (bonus) */}
            <div className="border border-[#b8b5a8] p-2.5" style={{ background: '#ece9d8' }}>
              <div className="text-[10px] font-bold text-[#0a246a] mb-1.5">🌍 Languages</div>
              {languages.map((l) => (
                <div key={l.name} className="flex justify-between text-[9px] mb-1">
                  <span>{l.name}</span>
                  <span className="px-1.5 py-0.5 text-[8px] font-bold text-white"
                    style={{ background: l.level === 'Fluent' ? '#1244a8' : '#2e7d32' }}>
                    {l.level}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Soft skills pills */}
        <div className="mt-3 border border-[#b8b5a8] p-2.5" style={{ background: '#ece9d8' }}>
          <div className="text-[10px] font-bold text-[#0a246a] mb-2">🤝 Soft Skills</div>
          <div className="flex flex-wrap gap-1.5">
            {softSkills.map((s) => (
              <span key={s} className="px-2 py-0.5 text-[9px] border border-[#b8b5a8]"
                style={{ background: '#d4d0c8' }}>
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </XPWindow>
  );
}
