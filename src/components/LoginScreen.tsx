'use client';

import { motion } from 'framer-motion';

interface LoginScreenProps {
  onLogin: () => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col z-[90]"
      style={{ background: 'linear-gradient(180deg, #1f4b8c 0%, #3a7bd5 40%, #2563b0 100%)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Top bar */}
      <motion.div
        className="w-full text-center py-3 px-5 text-white border-b-2 border-blue-400"
        style={{ background: 'linear-gradient(180deg, #2c5fa8 0%, #1a3c7a 100%)' }}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 120 }}
      >
        <h2 className="text-sm font-bold">Welcome</h2>
        <p className="text-[11px] text-blue-200 mt-0.5">To begin, click your user name</p>
      </motion.div>

      {/* Main login area */}
      <div className="flex-1 flex flex-col items-center justify-center gap-5">
        <motion.div
          className="flex flex-col items-center gap-3 px-9 py-5 rounded cursor-pointer min-w-[220px]"
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.3)',
          }}
          onClick={onLogin}
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 200, damping: 15 }}
          whileHover={{
            scale: 1.05,
            backgroundColor: 'rgba(255,255,255,0.25)',
            boxShadow: '0 0 30px rgba(255,255,255,0.2)',
          }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            className="w-16 h-16 rounded-full border-3 border-white flex items-center justify-center text-[22px] text-white font-bold"
            style={{ background: 'linear-gradient(135deg, #f90, #ff6600)' }}
            animate={{
              boxShadow: [
                '0 0 0px rgba(255,153,0,0.4)',
                '0 0 20px rgba(255,153,0,0.6)',
                '0 0 0px rgba(255,153,0,0.4)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            NB
          </motion.div>
          <span className="text-white text-sm font-bold">Nischal Bhandari</span>
          <motion.span
            className="text-blue-200 text-[10px]"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Click to log in
          </motion.span>
        </motion.div>

        {/* Welcome text with typewriter effect */}
        <motion.p
          className="text-blue-200 text-xs mt-4 text-center max-w-[300px]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          Welcome to Nischal&apos;s Portfolio Experience
        </motion.p>
      </div>

      {/* Bottom bar */}
      <motion.div
        className="w-full flex justify-between items-center px-5 py-2.5 border-t-2 border-blue-400"
        style={{ background: 'linear-gradient(180deg, #1a3c7a 0%, #0f2752 100%)' }}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 120 }}
      >
        <span className="text-blue-200 text-[10px]">Turn off computer</span>
        <motion.button
          className="text-white text-[11px] px-3.5 py-0.5 rounded-xl cursor-pointer border border-blue-900"
          style={{ background: 'linear-gradient(180deg, #4a90d9 0%, #2163a8 50%, #1a5298 100%)' }}
          onClick={onLogin}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Log In ▶
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
