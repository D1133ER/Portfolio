'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface BootScreenProps {
  onComplete: () => void;
}

export default function BootScreen({ onComplete }: BootScreenProps) {
  const [phase, setPhase] = useState<'boot' | 'done'>('boot');
  const [activeSegs, setActiveSegs] = useState<boolean[]>(Array(8).fill(false));
  const [loop, setLoop] = useState(0);

  useEffect(() => {
    if (phase !== 'boot') return;
    let segIndex = 0;
    const maxLoops = 3;

    const interval = setInterval(() => {
      if (segIndex < 8) {
        setActiveSegs((prev) => {
          const next = [...prev];
          next[segIndex] = true;
          return next;
        });
        segIndex++;
      } else {
        segIndex = 0;
        setActiveSegs(Array(8).fill(false));
        setLoop((prev) => {
          const next = prev + 1;
          if (next >= maxLoops) {
            clearInterval(interval);
            setPhase('done');
            setTimeout(onComplete, 600);
          }
          return next;
        });
      }
    }, 220);

    return () => clearInterval(interval);
  }, [phase, onComplete]);

  return (
    <AnimatePresence>
      {phase !== 'done' ? null : null}
      <motion.div
        className="absolute inset-0 bg-black flex flex-col items-center justify-center z-[100]"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* CRT Scanline overlay */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
          {Array.from({ length: 100 }).map((_, i) => (
            <div
              key={i}
              className="w-full h-[2px] bg-white"
              style={{ marginBottom: '2px' }}
            />
          ))}
        </div>

        <motion.div
          className="flex flex-col items-center gap-3"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {/* Windows Flag */}
          <motion.div
            className="flex gap-[2px] mb-1"
            initial={{ rotate: -180, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
          >
            <div className="w-[22px] h-[22px] rounded-tl-full bg-red-500" />
            <div className="w-[22px] h-[22px] rounded-tr-full bg-green-500" />
            <div className="w-[22px] h-[22px] rounded-bl-full bg-blue-500" />
            <div className="w-[22px] h-[22px] rounded-br-full bg-orange-400" />
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <span className="text-white text-[22px] sm:text-[28px] tracking-wide">
              Microsoft{' '}
              <span className="text-orange-400 italic font-bold">Windows XP</span>
            </span>
          </motion.div>

          <motion.div
            className="text-gray-400 text-[11px] -mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Professional
          </motion.div>

          {/* Loading bar */}
          <motion.div
            className="w-[160px] h-[14px] border border-gray-600 mt-8 overflow-hidden"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex gap-[2px] p-[2px] h-full">
              {activeSegs.map((active, i) => (
                <motion.div
                  key={i}
                  className="w-[14px] h-full rounded-[1px]"
                  style={{ background: active ? '#3a78c9' : 'transparent' }}
                  animate={{ opacity: active ? 1 : 0 }}
                  transition={{ duration: 0.15 }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Floating particles */}
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full"
            style={{
              left: `${20 + i * 12}%`,
              top: `${70 + (i % 3) * 8}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 2 + i * 0.3,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
