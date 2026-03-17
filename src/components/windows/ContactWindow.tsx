'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import XPWindow from '../XPWindow';

export default function ContactWindow() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({ name: false, email: false });

  const handleSend = () => {
    const nameErr = !formData.name.trim();
    const emailErr = !formData.email.trim() || !/^[^@]+@[^@]+\.[^@]+$/.test(formData.email);
    setErrors({ name: nameErr, email: emailErr });
    if (nameErr || emailErr) return;
    setShowSuccess(true);
    setFormData({ name: '', email: '', message: '' });
    setErrors({ name: false, email: false });
    setTimeout(() => setShowSuccess(false), 4000);
  };

  const toolbar = (
    <div className="bg-[#ece9d8] border-b border-[#b0ada0] px-2 py-1 flex items-center justify-between">
      <div className="flex items-center gap-0.5">
        {/* Send */}
        <button
          onClick={handleSend}
          className="flex flex-col items-center gap-0.5 px-3 py-0.5 hover:bg-[#d4d0c8] rounded-sm cursor-pointer"
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(180deg, #5fad2a 0%, #3b8c16 100%)',
              boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.4)',
            }}
          >
            <span className="text-white font-bold" style={{ fontSize: 14, marginLeft: 2 }}>▶</span>
          </div>
          <span className="text-[9px]">Send</span>
        </button>
        <div className="h-8 w-px bg-[#b0ada0] mx-1" />
        <button className="flex flex-col items-center gap-0.5 px-2 py-0.5 hover:bg-[#d4d0c8] rounded-sm">
          <span className="text-base leading-none">📎</span>
          <span className="text-[9px]">Attach</span>
        </button>
        <button className="flex flex-col items-center gap-0.5 px-2 py-0.5 hover:bg-[#d4d0c8] rounded-sm">
          <span className="text-base leading-none">👤</span>
          <span className="text-[9px]">Address</span>
        </button>
      </div>
      <div className="flex gap-0.5 mr-2">
        <button className="w-7 h-7 flex items-center justify-center hover:bg-[#d4d0c8] rounded-sm text-sm">🔗</button>
        <button className="w-7 h-7 flex items-center justify-center hover:bg-[#d4d0c8] rounded-sm text-sm">👥</button>
      </div>
    </div>
  );

  return (
    <XPWindow
      id="contact"
      menuItems={['File', 'Edit', 'View', 'Insert', 'Format', 'Tools', 'Message']}
      statusText="Message size: 1.2 KB    |    Connection: Online (Broadband)"
      toolbar={toolbar}
    >
      {/* TO/CC/SUBJECT rows — extend to full width */}
      <div className="-mx-2.5 -mt-2.5">
        {/* TO */}
        <div className="flex items-center border-b border-[#d4d0c8]">
          <span className="w-16 text-right pr-2 text-[10px] font-bold text-[#555] flex-shrink-0 py-1.5 self-stretch flex items-center justify-end bg-[#e8e5dc] border-r border-[#b0ada0]">
            TO:
          </span>
          <span className="flex-1 px-2 py-1.5 text-[10px] text-[#0a246a] bg-white">
            nischalbhandari11@gmail.com
          </span>
        </div>
        {/* CC */}
        <div className="flex items-center border-b border-[#d4d0c8]">
          <span className="w-16 text-right pr-2 text-[10px] font-bold text-[#555] flex-shrink-0 py-1.5 self-stretch flex items-center justify-end bg-[#e8e5dc] border-r border-[#b0ada0]">
            CC:
          </span>
          <input
            type="text"
            placeholder="Add recipients..."
            className="flex-1 px-2 py-1.5 text-[10px] bg-white outline-none placeholder-[#aaa]"
          />
        </div>
        {/* SUBJECT */}
        <div className="flex items-center border-b border-[#d4d0c8]">
          <span className="w-16 text-right pr-2 text-[10px] font-bold text-[#555] flex-shrink-0 py-1.5 self-stretch flex items-center justify-end bg-[#e8e5dc] border-r border-[#b0ada0]">
            SUBJECT:
          </span>
          <span className="flex-1 px-2 py-1.5 text-[11px] font-semibold bg-white">
            Inquiry via My Computer Portfolio
          </span>
        </div>
      </div>

      {/* Form body */}
      <div className="mt-3 space-y-2.5">
        {/* Name + Email side by side */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-[9px] font-bold uppercase tracking-widest text-[#555] mb-1">
              Your Name
            </label>
            <input
              type="text"
              className={`w-full border px-2 py-1.5 text-[10px] bg-white outline-none focus:border-[#0a246a] ${
                errors.name ? 'border-red-500' : 'border-[#aaa]'
              }`}
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              autoComplete="off"
            />
          </div>
          <div className="flex-1">
            <label className="block text-[9px] font-bold uppercase tracking-widest text-[#555] mb-1">
              Email Address
            </label>
            <input
              type="email"
              className={`w-full border px-2 py-1.5 text-[10px] bg-white outline-none focus:border-[#0a246a] ${
                errors.email ? 'border-red-500' : 'border-[#aaa]'
              }`}
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              autoComplete="off"
            />
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="block text-[9px] font-bold uppercase tracking-widest text-[#555] mb-1">
            Message
          </label>
          <textarea
            className="w-full border border-[#aaa] px-2 py-1.5 text-[10px] bg-white outline-none focus:border-[#0a246a] resize-none"
            rows={6}
            placeholder="Type your message here..."
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          />
        </div>

        {/* Bottom: social links + send button */}
        <div className="flex items-center justify-between pt-0.5">
          <div className="flex gap-4">
            <a
              href="https://github.com/Nischal00"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-0.5 hover:opacity-70 transition-opacity"
            >
              <span className="text-[18px]">✳</span>
              <span className="text-[8px] text-[#444]">GitHub</span>
            </a>
            <a
              href="https://www.linkedin.com/in/nischal-bhandari-708b712a3/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-0.5 hover:opacity-70 transition-opacity"
            >
              <span className="text-[18px]">💼</span>
              <span className="text-[8px] text-[#444]">LinkedIn</span>
            </a>
          </div>
          <motion.button
            className="flex items-center gap-2 px-5 py-2 rounded-full text-white text-[11px] font-bold"
            style={{
              background: 'linear-gradient(180deg, #5fad2a 0%, #3b8c16 100%)',
              boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.3)',
            }}
            onClick={handleSend}
            whileTap={{ scale: 0.95 }}
            whileHover={{ filter: 'brightness(1.1)' }}
          >
            ✉ SEND MESSAGE
          </motion.button>
        </div>
      </div>

      {/* Success overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center z-50"
            style={{ background: 'rgba(0,0,0,0.35)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-[#ece9d8] border border-[#0a246a] p-5 max-w-[220px] text-center shadow-lg"
              initial={{ scale: 0.7 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.7 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <div className="text-3xl mb-2">✅</div>
              <p className="text-[11px] font-bold text-[#333] mb-1">Message Sent!</p>
              <p className="text-[9px] text-[#666] mb-3">Nischal will get back to you soon.</p>
              <button
                className="text-[10px] px-4 py-1 border border-[#999] hover:bg-[#e0ddd5]"
                style={{ background: 'linear-gradient(180deg, #ece9d8 0%, #d4d0c8 100%)' }}
                onClick={() => setShowSuccess(false)}
              >
                OK
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </XPWindow>
  );
}
