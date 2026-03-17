'use client';

import { motion } from 'framer-motion';
import XPWindow from '../XPWindow';

const educationData = [
  {
    icon: '🎓',
    degree: 'Bachelor of Information Technology',
    institution: 'Informatics College Pokhara & London Metropolitan University',
    year: '2021 – 2024',
  },
  {
    icon: '📋',
    degree: 'Higher Secondary Education (+2)',
    institution: 'Global Collegiate Higher Secondary School',
    year: '2014 – 2016',
  },
  {
    icon: '📄',
    degree: 'School Leaving Certificate (SLC)',
    institution: 'Global Collegiate Higher Secondary School',
    year: '2014',
  },
];

export default function EducationWindow() {
  return (
    <XPWindow
      id="education"
      statusText="3 academic records"
    >
      {educationData.map((edu, i) => (
        <motion.div
          key={i}
          className="bg-white border border-gray-300 p-2.5 mb-2 flex items-start gap-2.5"
          initial={{ opacity: 0, x: -30, rotateY: -15 }}
          animate={{ opacity: 1, x: 0, rotateY: 0 }}
          transition={{ delay: i * 0.15, type: 'spring', stiffness: 150 }}
          whileHover={{
            scale: 1.02,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            x: 5,
          }}
        >
          <motion.div
            className="text-[24px] flex-shrink-0 mt-0.5"
            whileHover={{ rotate: [0, -15, 15, 0], transition: { duration: 0.4 } }}
          >
            {edu.icon}
          </motion.div>
          <div>
            <div className="text-xs font-bold text-[#0a246a] mb-0.5">{edu.degree}</div>
            <div className="text-[11px] text-gray-500">{edu.institution}</div>
            <div className="text-[10px] text-gray-400 italic mt-1">📅 {edu.year}</div>
          </div>
        </motion.div>
      ))}
    </XPWindow>
  );
}
