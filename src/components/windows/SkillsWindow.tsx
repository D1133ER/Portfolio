'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import XPWindow from '../XPWindow';
import { technicalSkills, softSkills, languages } from '@/data/portfolio';

export default function SkillsWindow() {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <XPWindow
      id="skills"
      statusText={`${technicalSkills.length} technical skills · ${softSkills.length} soft skills · ${languages.length} languages`}
    >
      {/* Technical Skills */}
      <p className="text-[11px] font-bold text-[#0a246a] mb-1.5 pb-1 border-b border-[#c0bdb0]">
        Technical Skills
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-1.5">
        {technicalSkills.map((skill, i) => (
          <motion.div
            key={skill.name}
            className="bg-white border border-[#aaa] rounded-sm p-1.5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ scale: 1.03, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
          >
            <div className="text-[10px] font-bold text-[#0a246a] mb-0.5">{skill.name}</div>
            <div className="h-[7px] bg-gray-200 border border-[#bbb] rounded-sm overflow-hidden">
              <motion.div
                className="h-full rounded-[1px]"
                style={{
                  background: 'linear-gradient(90deg, #2c6fca, #1a90ff)',
                }}
                initial={{ width: 0 }}
                animate={{ width: animate ? `${skill.level}%` : 0 }}
                transition={{ duration: 1.2, delay: i * 0.08, ease: 'easeOut' }}
              />
            </div>
            <motion.div
              className="text-[8px] text-gray-500 mt-0.5 text-right"
              initial={{ opacity: 0 }}
              animate={{ opacity: animate ? 1 : 0 }}
              transition={{ delay: 0.8 + i * 0.08 }}
            >
              {skill.level}%
            </motion.div>
          </motion.div>
        ))}
      </div>

      <div className="h-[1px] bg-gray-400 my-2" />

      {/* Soft Skills */}
      <p className="text-[11px] font-bold text-[#0a246a] mb-1.5 pb-1 border-b border-[#c0bdb0]">
        Soft Skills
      </p>
      <div className="flex flex-wrap gap-1">
        {softSkills.map((skill, i) => (
          <motion.span
            key={skill}
            className="bg-[#d4d0c8] border border-[#999] px-2 py-0.5 text-[10px] rounded-sm text-gray-700"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + i * 0.08, type: 'spring' }}
            whileHover={{
              backgroundColor: '#316ac5',
              color: '#fff',
              scale: 1.1,
            }}
          >
            {skill}
          </motion.span>
        ))}
      </div>

      <div className="h-[1px] bg-gray-400 my-2" />

      {/* Languages */}
      <p className="text-[11px] font-bold text-[#0a246a] mb-1.5 pb-1 border-b border-[#c0bdb0]">
        Languages
      </p>
      <div>
        {languages.map((lang, i) => (
          <motion.div
            key={lang.name}
            className="flex items-center justify-between py-1 border-b border-[#e0ddd0] text-[11px] text-gray-700"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 + i * 0.1 }}
          >
            <span>{lang.name}</span>
            <span
              className={`inline-block px-2 py-0.5 text-[9px] rounded-sm text-white ${
                lang.level === 'Fluent' ? 'bg-green-700' : 'bg-amber-600'
              }`}
            >
              {lang.level}
            </span>
          </motion.div>
        ))}
      </div>
    </XPWindow>
  );
}
