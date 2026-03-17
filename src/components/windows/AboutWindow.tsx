'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import XPWindow from '../XPWindow';

type Tab = 'General' | 'Career' | 'Skills';

const careerItems = [
  { role: 'IT Officer', company: 'Kaski Sewa Hospital & Research Center', period: '2019–2024', icon: '🏥' },
  { role: 'Front-End Developer Intern (Angular)', company: 'Searchable Design LLC', period: '2021', icon: '💻' },
  { role: 'Quality Assurance Intern', company: 'Skybase Innovation', period: '2024', icon: '🔬' },
  { role: 'Full Stack Web Developer', company: 'Infomax', period: '2024', icon: '🌐' },
  { role: 'German Language Instructor', company: 'ING Skill Academy', period: 'Ongoing', icon: '📚' },
  { role: 'Business Development / PR Officer', company: 'Direct Marketing Unit', period: '2024–Present', icon: '📊' },
];

const skillItems = [
  { name: 'IT Support', level: 92 },
  { name: 'System Admin', level: 85 },
  { name: 'JavaScript', level: 85 },
  { name: 'Angular', level: 80 },
  { name: 'Full Stack Dev', level: 78 },
  { name: 'Software Testing', level: 72 },
  { name: 'Pen Testing', level: 62 },
];

export default function AboutWindow() {
  const [activeTab, setActiveTab] = useState<Tab>('General');

  return (
    <XPWindow
      id="about"
      menuItems={['File', 'Edit', 'View', 'Favorites', 'Tools', 'Help']}
      statusText="IT Graduate · Full Stack Developer · Pokhara, Nepal"
    >
      {/* Tab Navigation */}
      <div className="flex gap-0.5 mb-0 border-b border-[#b8b5a8]" style={{ marginBottom: 0 }}>
        {(['General', 'Career', 'Skills'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1 text-[11px] transition-colors border-t border-x cursor-pointer ${
              activeTab === tab
                ? 'bg-[#ece9d8] border-[#b8b5a8] font-bold -mb-px z-10 relative'
                : 'bg-[#d4d0c8] border-[#b8b5a8] text-[#444] hover:bg-[#dddad3]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* General Tab */}
      {activeTab === 'General' && (
        <div className="flex flex-col gap-3 pt-1">
          {/* White content box — XP System Properties style */}
          <div className="flex gap-4 p-3 bg-white border border-[#c0bdb0]">
            {/* Left: Photo frame + Status */}
            <div className="flex flex-col items-center gap-1 w-[88px] flex-shrink-0">
              <motion.div
                className="w-[76px] h-[90px] border border-[#999] overflow-hidden flex items-center justify-center text-white text-2xl font-black select-none"
                style={{ background: 'linear-gradient(135deg, #2c6fca 0%, #1244a8 100%)' }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
              >
                NB
              </motion.div>
              <p className="text-[9px] text-[#666] mt-1">Status:</p>
              <p className="text-[10px] font-bold" style={{ color: '#008000' }}>
                Online &amp; Active
              </p>
            </div>

            {/* Right: Details */}
            <div className="flex-1 min-w-0 space-y-2">
              <motion.div initial={{ x: 15, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.15 }}>
                <h2 className="text-[13px] font-bold leading-tight" style={{ color: '#0a246a' }}>
                  IT Graduate &amp; Developer
                </h2>
                <p className="text-[9.5px] italic text-[#666] mt-0.5">
                  Redefining the digital frontier since 2019.
                </p>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
                <p className="text-[10px] underline cursor-default mb-0.5" style={{ color: '#0a246a' }}>
                  Philosophy
                </p>
                <p className="text-[9px] text-[#333] leading-relaxed">
                  Bridging full-stack development and IT infrastructure. Focused on clean interfaces, robust systems, and quality-driven engineering across every layer of the stack.
                </p>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.32 }}>
                <p className="text-[10px] underline cursor-default mb-1" style={{ color: '#0a246a' }}>
                  System
                </p>
                <div className="space-y-0.5">
                  <div className="flex text-[9.5px]">
                    <span className="w-[72px] text-[#777]">Location:</span>
                    <span className="font-bold text-[#1a1a1a]">Pokhara, Nepal</span>
                  </div>
                  <div className="flex text-[9.5px]">
                    <span className="w-[72px] text-[#777]">Graduated:</span>
                    <span className="font-bold text-[#1a1a1a]">2024</span>
                  </div>
                  <div className="flex text-[9.5px]">
                    <span className="w-[72px] text-[#777]">Availability:</span>
                    <span className="font-bold" style={{ color: '#008000' }}>Open to Opportunities</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Footer buttons — standard XP dialog style */}
          <div className="flex justify-end gap-1.5">
            <button
              className="px-5 py-0.5 text-[10px] border border-[#888] hover:bg-[#e0ddd5] active:bg-[#c8c5be] cursor-pointer"
              style={{ background: 'linear-gradient(180deg, #ece9d8 0%, #d4d0c8 100%)', minWidth: 64 }}
            >
              OK
            </button>
            <button
              className="px-5 py-0.5 text-[10px] border border-[#888] hover:bg-[#e0ddd5] active:bg-[#c8c5be] cursor-pointer"
              style={{ background: 'linear-gradient(180deg, #ece9d8 0%, #d4d0c8 100%)', minWidth: 64 }}
            >
              Cancel
            </button>
            <button
              disabled
              className="px-5 py-0.5 text-[10px] border border-[#ccc] opacity-50 cursor-not-allowed"
              style={{ background: 'linear-gradient(180deg, #ece9d8 0%, #d4d0c8 100%)', minWidth: 64 }}
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Career Tab */}
      {activeTab === 'Career' && (
        <div className="pt-3 space-y-2">
          <p className="text-[9px] font-bold text-[#003cad] uppercase tracking-widest mb-2">Work History</p>
          {careerItems.map((job, i) => (
            <motion.div
              key={job.company}
              className="flex items-start gap-2.5 p-2.5 border rounded"
              style={{ background: '#f7f4e3', borderColor: 'rgba(195,197,216,0.35)' }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, type: 'spring', stiffness: 260 }}
            >
              <span className="text-base leading-none mt-0.5 flex-shrink-0">{job.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold text-[#003cad] leading-tight">{job.role}</div>
                <div className="text-[9px] text-[#434655] mt-0.5">{job.company} · <span className="text-[#737687]">{job.period}</span></div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Skills Tab */}
      {activeTab === 'Skills' && (
        <div className="pt-3 space-y-2.5">
          <p className="text-[9px] font-bold text-[#003cad] uppercase tracking-widest mb-3">Technical Skills</p>
          {skillItems.map((skill, i) => (
            <div key={skill.name} className="flex items-center gap-3">
              <span className="text-[10px] text-[#434655] font-medium w-28 flex-shrink-0">{skill.name}</span>
              <div className="flex-1 rounded-full h-2 overflow-hidden" style={{ background: '#e6e3d2' }}>
                <motion.div
                  className="h-2 rounded-full"
                  style={{ background: 'linear-gradient(90deg, #003cad, #0051e1)' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${skill.level}%` }}
                  transition={{ delay: 0.1 + i * 0.06, duration: 0.7, ease: 'easeOut' }}
                />
              </div>
              <span className="text-[9px] font-bold text-[#003cad] w-7 text-right flex-shrink-0">{skill.level}%</span>
            </div>
          ))}
          <div className="pt-2 flex flex-wrap gap-1">
            {['IT Support', 'Full Stack Dev', 'Angular', 'QA Testing', 'System Admin', 'Pen Testing'].map((badge, i) => (
              <motion.span
                key={badge}
                className="inline-block text-white text-[8px] px-2 py-0.5 rounded-full font-bold"
                style={{ background: '#003cad' }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.07, type: 'spring', stiffness: 300 }}
                whileHover={{ scale: 1.15, y: -1 }}
              >
                {badge}
              </motion.span>
            ))}
          </div>
        </div>
      )}
    </XPWindow>
  );
}
