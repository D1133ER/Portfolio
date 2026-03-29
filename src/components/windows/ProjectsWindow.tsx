'use client';

import { motion } from 'framer-motion';
import XPWindow from '../XPWindow';
import { projects } from '@/data/portfolio';

const addressBar = (
  <div className="bg-[#ece9d8] border-b border-[#aaa] px-2 py-1 flex items-center gap-2">
    <div className="flex gap-0.5">
      <button className="text-[10px] px-2 py-0.5 bg-[#d4d0c8] border border-[#999] rounded-sm hover:bg-[#e0ddd5] text-[#0a246a]">◀</button>
      <button className="text-[10px] px-2 py-0.5 bg-[#d4d0c8] border border-[#999] rounded-sm opacity-40 cursor-not-allowed text-[#0a246a]">▶</button>
      <button className="text-[10px] px-2 py-0.5 bg-[#d4d0c8] border border-[#999] rounded-sm hover:bg-[#e0ddd5] text-[#0a246a]">▲</button>
    </div>
    <div className="flex-1 flex items-center bg-white border border-[#999] px-2 py-0.5 text-[10px] gap-1.5 min-w-0">
      <span>📁</span>
      <span className="text-[#0a246a] truncate">C:\My Documents\Projects</span>
    </div>
    <button className="text-[10px] px-1.5 py-0.5 bg-[#d4d0c8] border border-[#999] rounded-sm hover:bg-[#e0ddd5] text-[#0a246a]">⊞</button>
  </div>
);

export default function ProjectsWindow() {
  return (
    <XPWindow
      id="projects"
      menuItems={['File', 'Edit', 'View', 'Tools', 'Help']}
      statusText={`${projects.length} objects · Local Disk (C:)`}
      toolbar={addressBar}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-1">
        {projects.map((project, i) => (
          <motion.div
            key={project.name}
            className="group flex flex-col items-center gap-2 p-3 rounded cursor-pointer"
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.09, type: 'spring', stiffness: 260 }}
            whileHover={{
              backgroundColor: 'rgba(49,106,197,0.1)',
              scale: 1.04,
            }}
          >
            <div
              className="w-16 h-16 flex items-center justify-center rounded-xl shadow-sm group-hover:shadow-md transition-shadow border"
              style={{ background: '#f7f4e3', borderColor: 'rgba(195,197,216,0.35)' }}
            >
              <span className="text-4xl leading-none">{project.icon}</span>
            </div>
            <div className="text-center">
              <span className="block text-[10px] font-bold text-[#003cad] leading-tight">{project.name}</span>
              <span className="block text-[8px] text-[#737687] mt-0.5">
                Folder · {project.tech.slice(0, 2).join(' · ')}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 p-5 border-2 border-dashed border-[#c3c5d8]/40 rounded-xl flex flex-col items-center justify-center text-center opacity-40">
        <span className="text-xl mb-1">☁</span>
        <p className="text-[9px] text-[#434655]">Drag and drop projects here to upload to System Explorer</p>
      </div>

      {/* Project detail list for extra info */}
      <div className="mt-3 border-t border-[#b8b5a8]/40 pt-3 space-y-2">
        {projects.map((project, i) => (
          <motion.div
            key={`detail-${project.name}`}
            className="flex items-start gap-2.5 p-2 rounded border"
            style={{ background: '#fdfae8', borderColor: 'rgba(195,197,216,0.25)' }}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.08 }}
          >
            <span className="text-lg leading-none flex-shrink-0 mt-0.5">{project.icon}</span>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-bold text-[#003cad]">{project.name}</div>
              <p className="text-[9px] text-[#434655] leading-relaxed mt-0.5 line-clamp-2">{project.description}</p>
              <div className="flex flex-wrap gap-0.5 mt-1">
                {project.tech.map((t, j) => (
                  <motion.span
                    key={t}
                    className="inline-block text-[7px] px-1.5 py-0.5 rounded-sm text-white font-bold"
                    style={{ background: techColor(j) }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + i * 0.08 + j * 0.04, type: 'spring' }}
                    whileHover={{ scale: 1.15 }}
                  >
                    {t}
                  </motion.span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </XPWindow>
  );
}

function techColor(index: number): string {
  const colors = ['#003cad', '#006e02', '#614100', '#8b2eaa', '#d44', '#0a8a8a'];
  return colors[index % colors.length];
}
