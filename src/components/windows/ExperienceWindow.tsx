'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import XPWindow from '../XPWindow';
import { jobData } from '@/data/portfolio';

const jobKeys = Object.keys(jobData);
const jobLabels: Record<string, string> = {
  kaski: '🏥 Kaski Hospital',
  searchable: '💻 Searchable Design',
  skybase: '🔬 Skybase Innovation',
  infomax: '🌐 Infomax',
  ing: '📚 ING Academy',
  dmu: '📊 Direct Marketing',
};

export default function ExperienceWindow() {
  const [selected, setSelected] = useState('kaski');
  const job = jobData[selected];

  const toolbar = (
    <div className="h-6 bg-[#ece9d8] border-b border-[#aaa] flex items-center px-1.5 gap-1.5 shrink-0">
      <span className="text-[10px] text-gray-500">Address</span>
      <div className="flex-1 h-[18px] bg-white border border-[#7f7f7f] rounded-[1px] px-1 text-[10px] flex items-center text-gray-600">
        C:\Work History\{selected}
      </div>
    </div>
  );

  return (
    <XPWindow
      id="experience"
      menuItems={['File', 'Edit', 'View', 'Favorites', 'Tools', 'Help']}
      statusText={`${job.role} · ${job.company}`}
      toolbar={toolbar}
      noPadding
    >
      <div className="flex flex-col sm:flex-row absolute inset-0">
        {/* Sidebar */}
        <div className="w-full sm:w-[140px] bg-[#d4d0c8] border-b sm:border-b-0 sm:border-r border-[#aaa] p-1.5 text-[10px] shrink-0 overflow-y-auto" style={{ maxHeight: '120px' }}>
          <h4 className="text-[10px] font-bold text-[#0a246a] mb-2 px-1 pb-1 border-b border-[#bbb]">
            📂 Positions
          </h4>
          <div className="flex flex-row flex-wrap sm:flex-col gap-0.5">
          {jobKeys.map((key) => (
            <motion.div
              key={key}
              className={`flex items-start gap-1 py-1 px-1.5 cursor-pointer rounded-sm text-[10px] leading-tight ${
                selected === key
                  ? 'bg-[#316ac5] text-white'
                  : 'text-blue-800 hover:bg-[#c0bdb0]'
              }`}
              onClick={() => setSelected(key)}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.97 }}
            >
              {jobLabels[key]}
            </motion.div>
          ))}
          </div>
        </div>

        {/* Detail panel */}
        <motion.div
          key={selected}
          className="flex-1 bg-white p-2.5 overflow-y-auto"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="text-[13px] font-bold text-[#0a246a] mb-0.5"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {job.icon} {job.role}
          </motion.div>
          <div className="text-[11px] text-gray-500 mb-0.5">{job.company}</div>
          <div className="text-[10px] text-gray-400 italic mb-2">📅 {job.period}</div>
          <div className="h-[1px] bg-gray-200 my-1.5" />
          <ul className="pl-4 list-disc">
            {job.duties.map((duty, i) => (
              <motion.li
                key={i}
                className="text-[11px] leading-[1.7] text-gray-700 mb-0.5"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.1 }}
              >
                {duty}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </XPWindow>
  );
}
