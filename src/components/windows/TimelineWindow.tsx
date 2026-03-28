'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import XPWindow from '../XPWindow';
import { techEvolution, jobData } from '@/data/portfolio';

type Tab = 'Career' | 'TechDNA';

const careerEvents = [
  {
    year: '2019',
    role: 'IT Officer',
    company: 'Kaski Sewa Hospital',
    icon: '🏥',
    color: '#1244a8',
    dur: '2019 – 2024',
    achievement: 'Managed entire hospital IT infrastructure for 5 years',
    skills: ['Windows Server', 'Active Directory', 'Networking', 'SQL', 'Security'],
  },
  {
    year: '2021',
    role: 'Front-End Intern',
    company: 'Searchable Design LLC',
    icon: '💻',
    color: '#2e7d32',
    dur: '2021',
    achievement: 'Built Angular web apps, code review experience in US startup',
    skills: ['Angular', 'TypeScript', 'REST APIs', 'Git'],
  },
  {
    year: '2024',
    role: 'QA Intern',
    company: 'Skybase Innovation',
    icon: '🔬',
    color: '#6a1b9a',
    dur: '2024',
    achievement: 'Improved test coverage, identified critical production bugs',
    skills: ['Selenium', 'Jest', 'Bug Tracking', 'QA Processes'],
  },
  {
    year: '2024',
    role: 'Full Stack Developer',
    company: 'Infomax',
    icon: '🌐',
    color: '#e65100',
    dur: '2024',
    achievement: 'Full-stack apps with modern React/Node stack',
    skills: ['React', 'Node.js', 'PostgreSQL', 'Express'],
  },
  {
    year: '2024',
    role: 'German Instructor',
    company: 'ING Skill Academy',
    icon: '📚',
    color: '#00695c',
    dur: 'Ongoing',
    achievement: 'Teaching German B1 level — 20+ students',
    skills: ['Curriculum Design', 'Teaching', 'German B1', 'Public Speaking'],
  },
  {
    year: '2024',
    role: 'BD / PR Officer',
    company: 'Direct Marketing Unit',
    icon: '📊',
    color: '#37474f',
    dur: '2024 – Present',
    achievement: 'Growing client base and market presence',
    skills: ['Business Dev', 'PR', 'Client Relations', 'Strategy'],
  },
];

export default function TimelineWindow() {
  const [activeTab,   setActiveTab]   = useState<Tab>('Career');
  const [expanded,    setExpanded]    = useState<number | null>(null);
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);

  return (
    <XPWindow id="timeline" statusText="📅  Career Timeline & Tech Evolution">
      <div className="p-3 overflow-auto h-full" style={{ fontFamily: 'Tahoma, sans-serif' }}>

        {/* Tabs */}
        <div className="flex gap-0.5 mb-3 border-b border-[#b8b5a8]">
          {(['Career', 'TechDNA'] as Tab[]).map((t) => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-4 py-1 text-[11px] border-t border-x cursor-pointer transition-colors ${
                activeTab === t
                  ? 'bg-[#ece9d8] border-[#b8b5a8] font-bold -mb-px z-10 relative'
                  : 'bg-[#d4d0c8] border-[#b8b5a8] text-[#444] hover:bg-[#dddad3]'
              }`}
            >
              {t === 'Career' ? '🗂 Career Timeline' : '🧬 Tech DNA'}
            </button>
          ))}
        </div>

        {/* ── Career Tab ── */}
        {activeTab === 'Career' && (
          <div className="relative pl-8">
            {/* Vertical line */}
            <div className="absolute left-[14px] top-0 bottom-0 w-0.5 bg-[#b8b5a8]" />

            {careerEvents.map((ev, i) => (
              <motion.div
                key={i}
                className="relative mb-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                {/* Dot */}
                <motion.div
                  className="absolute -left-[22px] top-[10px] w-3 h-3 rounded-full border-2 border-white"
                  style={{ background: ev.color }}
                  whileHover={{ scale: 1.4 }}
                />

                {/* Card */}
                <motion.div
                  className="border border-[#b8b5a8] overflow-hidden cursor-pointer"
                  style={{ background: expanded === i ? '#dde4f0' : '#ece9d8' }}
                  whileHover={{ filter: 'brightness(1.03)' }}
                  onClick={() => setExpanded(expanded === i ? null : i)}
                >
                  <div className="flex items-center gap-2 px-3 py-2">
                    <span className="text-base flex-shrink-0">{ev.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-[11px] text-[#0a246a] truncate">{ev.role}</div>
                      <div className="text-[10px] text-[#555] truncate">{ev.company}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-[9px] font-bold px-1.5 py-0.5 text-white" style={{ background: ev.color }}>
                        {ev.dur}
                      </div>
                    </div>
                    <span className="text-[10px] text-[#888] ml-1">{expanded === i ? '▲' : '▼'}</span>
                  </div>

                  <AnimatePresence>
                    {expanded === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 pb-2.5 border-t border-[#c0bdb0]">
                          <p className="text-[10px] text-[#333] mt-2 mb-2 leading-relaxed">
                            🏆 {ev.achievement}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {ev.skills.map((s) => (
                              <span key={s} className="text-[9px] px-1.5 py-0.5 border border-[#b8b5a8]"
                                style={{ background: '#d4d0c8' }}>
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            ))}
          </div>
        )}

        {/* ── Tech DNA Tab ── */}
        {activeTab === 'TechDNA' && (
          <div className="flex flex-col gap-2">
            <div className="text-[10px] text-[#555] mb-1">
              Hover a phase to see technologies learned. Click to expand.
            </div>
            {techEvolution.map((phase, i) => (
              <motion.div
                key={phase.year}
                className="border border-[#b8b5a8] overflow-hidden cursor-pointer"
                style={{ background: hoveredYear === i ? `${phase.color}18` : '#ece9d8' }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                onMouseEnter={() => setHoveredYear(i)}
                onMouseLeave={() => setHoveredYear(null)}
                onClick={() => setExpanded(expanded === i + 100 ? null : i + 100)}
              >
                <div className="flex items-center gap-3 px-3 py-2">
                  {/* Year badge */}
                  <div
                    className="text-white text-[10px] font-bold px-2 py-1 flex-shrink-0 min-w-[40px] text-center"
                    style={{ background: phase.color }}
                  >
                    {phase.year}
                  </div>

                  {/* Bar */}
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold text-[#0a246a] mb-1">{phase.phase}</div>
                    <div className="h-2 bg-[#d4d0c8] overflow-hidden">
                      <motion.div
                        className="h-full"
                        style={{ background: phase.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(phase.techs.length / 5) * 100}%` }}
                        transition={{ duration: 0.6, delay: i * 0.1 }}
                      />
                    </div>
                  </div>

                  <span className="text-[9px] text-[#888] ml-1 flex-shrink-0">
                    {phase.techs.length} techs
                  </span>
                </div>

                <AnimatePresence>
                  {(expanded === i + 100 || hoveredYear === i) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className="overflow-hidden"
                    >
                      <div className="px-3 pb-2 border-t border-[#c0bdb0]">
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {phase.techs.map((t) => (
                            <span
                              key={t}
                              className="text-[9px] px-1.5 py-0.5 text-white font-bold"
                              style={{ background: phase.color }}
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}

            {/* Legend: continuous growth line */}
            <div className="mt-2 border border-[#b8b5a8] p-2.5" style={{ background: '#ece9d8' }}>
              <div className="text-[10px] font-bold text-[#0a246a] mb-2">📈 Growth Summary</div>
              <div className="flex items-end gap-1 h-[50px]">
                {techEvolution.map((p, i) => (
                  <motion.div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                    <motion.div
                      className="w-full"
                      style={{ background: p.color, minHeight: 4 }}
                      initial={{ height: 0 }}
                      animate={{ height: `${(p.techs.length / 5) * 44}px` }}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                    />
                    <span className="text-[7px] text-[#777]">{String(p.year).slice(2)}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </XPWindow>
  );
}
