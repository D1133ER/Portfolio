'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import XPWindow from '../XPWindow';
import { certifications } from '@/data/portfolio';

const CATEGORIES = ['All', 'IT', 'Security', 'Dev', 'Language', 'Business'] as const;
type Cat = typeof CATEGORIES[number];

export default function CertsWindow() {
  const [filter,   setFilter]   = useState<Cat>('All');
  const [flipped,  setFlipped]  = useState<Set<string>>(new Set());

  const filtered = filter === 'All' ? certifications : certifications.filter((c) => c.category === filter);

  const toggleFlip = (name: string) => {
    const s = new Set(flipped);
    s.has(name) ? s.delete(name) : s.add(name);
    setFlipped(s);
  };

  return (
    <XPWindow id="certs" statusText="🏆  Credentials Wall — certs.msc">
      <div className="p-3 overflow-auto" style={{ fontFamily: 'Tahoma, sans-serif' }}>

        {/* Header */}
        <div className="flex items-center gap-2 mb-3 p-2 border border-[#b8b5a8]"
          style={{ background: 'linear-gradient(180deg, #dde4f0 0%, #c8d8f5 100%)' }}>
          <span className="text-2xl">🏆</span>
          <div>
            <div className="font-bold text-[12px] text-[#0a246a]">Nischal&apos;s Credentials Wall</div>
            <div className="text-[10px] text-[#555]">{certifications.length} certifications across {CATEGORIES.length - 1} domains — Click a card to flip!</div>
          </div>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-1 mb-3">
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setFilter(cat)}
              className="px-2.5 py-0.5 text-[10px] border cursor-pointer transition-all"
              style={{
                background: filter === cat ? '#1244a8' : '#ece9d8',
                color: filter === cat ? 'white' : '#333',
                borderColor: filter === cat ? '#0a246a' : '#b8b5a8',
                fontWeight: filter === cat ? 'bold' : 'normal',
              }}
            >
              {cat}
              {cat !== 'All' && (
                <span className="ml-1 opacity-70">
                  ({certifications.filter((c) => c.category === cat).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Grid of cert cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((cert, i) => {
              const isFlipped = flipped.has(cert.name);
              return (
                <motion.div
                  key={cert.name}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: i * 0.04 }}
                  className="cursor-pointer"
                  style={{ perspective: '600px' }}
                  onClick={() => toggleFlip(cert.name)}
                >
                  <motion.div
                    style={{ transformStyle: 'preserve-3d', position: 'relative', height: '90px' }}
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    {/* Front */}
                    <div
                      className="absolute inset-0 border-2 flex flex-col items-center justify-center gap-0.5 p-1.5"
                      style={{
                        backfaceVisibility: 'hidden',
                        borderColor: cert.color,
                        background: `linear-gradient(135deg, ${cert.color}18 0%, #ece9d8 100%)`,
                      }}
                    >
                      <span className="text-xl">{cert.icon}</span>
                      <div className="font-bold text-[9px] text-center text-[#0a246a] leading-tight">
                        {cert.name}
                      </div>
                      <div className="text-[8px] text-[#777]">{cert.year}</div>
                    </div>

                    {/* Back */}
                    <div
                      className="absolute inset-0 border-2 flex flex-col items-center justify-center gap-1 p-2"
                      style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                        borderColor: cert.color,
                        background: cert.color,
                      }}
                    >
                      <div className="text-white font-bold text-[9px] text-center leading-tight">{cert.name}</div>
                      <div className="text-white/80 text-[8px] text-center">{cert.issuer}</div>
                      <div className="mt-1 text-[8px] px-1.5 py-0.5 bg-white/20 text-white font-bold">
                        {cert.category.toUpperCase()}
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Footer stats */}
        <div className="mt-3 flex gap-2 flex-wrap">
          {(['IT', 'Security', 'Dev', 'Language', 'Business'] as Cat[]).map((cat) => {
            const count = certifications.filter((c) => c.category === cat).length;
            return (
              <div key={cat} className="flex-1 min-w-[60px] border border-[#b8b5a8] p-1.5 text-center"
                style={{ background: '#ece9d8' }}>
                <div className="font-bold text-[13px] text-[#0a246a]">{count}</div>
                <div className="text-[9px] text-[#666]">{cat}</div>
              </div>
            );
          })}
        </div>

        <div className="mt-2 text-[9px] text-[#888] text-center">
          💡 Click any certificate to flip and reveal details
        </div>
      </div>
    </XPWindow>
  );
}
