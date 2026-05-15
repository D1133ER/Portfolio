'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useTransition, useCallback } from 'react';
import XPWindow from '../XPWindow';
import { playSuccess, playError } from '@/utils/sounds';

type FieldErrors = { name: boolean; email: boolean; message: boolean };

const EMPTY_FORM = { name: '', email: '', message: '' };
const EMPTY_ERRORS: FieldErrors = { name: false, email: false, message: false };

function validate(form: typeof EMPTY_FORM): FieldErrors {
  return {
    name:    !form.name.trim(),
    email:   !form.email.trim() || !/^[^@]+@[^@]+\.[^@]+$/.test(form.email),
    message: form.message.trim().length < 10,
  };
}

export default function ContactWindow() {
  const [formData,    setFormData]    = useState(EMPTY_FORM);
  const [errors,      setErrors]      = useState<FieldErrors>(EMPTY_ERRORS);
  const [errorMsg,    setErrorMsg]    = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // React 19: useTransition gives us isPending for free — no manual `sending` boolean
  const [isPending, startTransition] = useTransition();

  const handleField = useCallback(
    (field: keyof typeof EMPTY_FORM) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));
        // Clear field error on change
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: false }));
      },
    [errors],
  );

  const handleSend = useCallback(() => {
    const errs = validate(formData);
    setErrors(errs);
    setErrorMsg('');

    if (errs.name || errs.email || errs.message) {
      playError();
      return;
    }

    startTransition(async () => {
      try {
        const res  = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name:    formData.name.trim(),
            email:   formData.email.trim(),
            message: formData.message.trim(),
          }),
        });
        const data = await res.json() as { error?: string; retryAfter?: number; scope?: string };

        if (!res.ok) {
          // Show a human-friendly wait time for rate-limit responses
          if (res.status === 429 && data.retryAfter) {
            const secs = data.retryAfter;
            const wait = secs >= 3600
              ? `${Math.ceil(secs / 3600)} hour${Math.ceil(secs / 3600) > 1 ? 's' : ''}`
              : secs >= 60
                ? `${Math.ceil(secs / 60)} minute${Math.ceil(secs / 60) > 1 ? 's' : ''}`
                : `${secs} second${secs !== 1 ? 's' : ''}`;
            const scope = data.scope === 'email'
              ? 'This email address was used recently.'
              : 'Too many requests from your connection.';
            setErrorMsg(`${scope} Please try again in ${wait}.`);
          } else {
            setErrorMsg(data.error ?? 'Failed to send. Please try again.');
          }
          playError();
          return;
        }

        playSuccess();
        setShowSuccess(true);
        setFormData(EMPTY_FORM);
        setErrors(EMPTY_ERRORS);
        setTimeout(() => setShowSuccess(false), 4000);
      } catch {
        setErrorMsg('Network error. Please check your connection and try again.');
        playError();
      }
    });
  }, [formData]);

  // ── Outlook-style toolbar ──
  const toolbar = (
    <div className="bg-[#ece9d8] border-b border-[#b0ada0] px-2 py-1 flex items-center justify-between">
      <div className="flex items-center gap-0.5">
        <button
          onClick={handleSend}
          disabled={isPending}
          className="flex flex-col items-center gap-0.5 px-3 py-0.5 hover:bg-[#d4d0c8] rounded-sm cursor-pointer disabled:cursor-wait"
          aria-label="Send message"
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{
              background: isPending
                ? 'linear-gradient(180deg, #999 0%, #777 100%)'
                : 'linear-gradient(180deg, #5fad2a 0%, #3b8c16 100%)',
              boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.4)',
            }}
          >
            {isPending
              ? <span className="text-white text-[10px]">⏳</span>
              : <span className="text-white font-bold" style={{ fontSize: 14, marginLeft: 2 }}>▶</span>
            }
          </div>
          <span className="text-[9px]">{isPending ? 'Sending' : 'Send'}</span>
        </button>
        <div className="h-8 w-px bg-[#b0ada0] mx-1" />
        <button disabled title="Not available" className="flex flex-col items-center gap-0.5 px-2 py-0.5 rounded-sm opacity-40 cursor-not-allowed">
          <span className="text-base leading-none">📎</span>
          <span className="text-[9px]">Attach</span>
        </button>
        <button disabled title="Not available" className="flex flex-col items-center gap-0.5 px-2 py-0.5 rounded-sm opacity-40 cursor-not-allowed">
          <span className="text-base leading-none">👤</span>
          <span className="text-[9px]">Address</span>
        </button>
      </div>
      <div className="flex gap-0.5 mr-2">
        <button disabled title="Not available" className="w-7 h-7 flex items-center justify-center rounded-sm text-sm opacity-40 cursor-not-allowed">🔗</button>
        <button disabled title="Not available" className="w-7 h-7 flex items-center justify-center rounded-sm text-sm opacity-40 cursor-not-allowed">👥</button>
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
      {/* ── Header rows ── */}
      <div className="-mx-2.5 -mt-2.5">
        <div className="flex items-center border-b border-[#d4d0c8]">
          <span className="w-16 text-right pr-2 text-[10px] font-bold text-[#555] flex-shrink-0 py-1.5 self-stretch flex items-center justify-end bg-[#e8e5dc] border-r border-[#b0ada0]">TO:</span>
          <span className="flex-1 px-2 py-1.5 text-[10px] text-[#0a246a] bg-white">nischalbhandari11@gmail.com</span>
        </div>
        <div className="flex items-center border-b border-[#d4d0c8]">
          <span className="w-16 text-right pr-2 text-[10px] font-bold text-[#555] flex-shrink-0 py-1.5 self-stretch flex items-center justify-end bg-[#e8e5dc] border-r border-[#b0ada0]">CC:</span>
          <input type="text" placeholder="Add recipients…" className="flex-1 px-2 py-1.5 text-[10px] bg-white outline-none placeholder-[#aaa]" />
        </div>
        <div className="flex items-center border-b border-[#d4d0c8]">
          <span className="w-16 text-right pr-2 text-[10px] font-bold text-[#555] flex-shrink-0 py-1.5 self-stretch flex items-center justify-end bg-[#e8e5dc] border-r border-[#b0ada0]">SUBJECT:</span>
          <span className="flex-1 px-2 py-1.5 text-[11px] font-semibold bg-white">Inquiry via My Computer Portfolio</span>
        </div>
      </div>

      {/* ── Form body ── */}
      <div className="mt-3 space-y-2.5">
        {/* Name + Email */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-[9px] font-bold uppercase tracking-widest text-[#555] mb-1">Your Name</label>
            <input
              type="text"
              className={`w-full border px-2 py-1.5 text-[10px] bg-white outline-none focus:border-[#0a246a] ${errors.name ? 'border-red-500' : 'border-[#aaa]'}`}
              placeholder="John Doe"
              value={formData.name}
              onChange={handleField('name')}
              autoComplete="off"
              aria-invalid={errors.name}
              aria-label="Your name"
            />
            {errors.name && <p className="text-[9px] text-red-500 mt-0.5">Name is required.</p>}
          </div>
          <div className="flex-1">
            <label className="block text-[9px] font-bold uppercase tracking-widest text-[#555] mb-1">Email Address</label>
            <input
              type="email"
              className={`w-full border px-2 py-1.5 text-[10px] bg-white outline-none focus:border-[#0a246a] ${errors.email ? 'border-red-500' : 'border-[#aaa]'}`}
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleField('email')}
              autoComplete="off"
              aria-invalid={errors.email}
              aria-label="Your email address"
            />
            {errors.email && <p className="text-[9px] text-red-500 mt-0.5">Valid email required.</p>}
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="block text-[9px] font-bold uppercase tracking-widest text-[#555] mb-1">Message</label>
          <textarea
            className={`w-full border px-2 py-1.5 text-[10px] bg-white outline-none focus:border-[#0a246a] resize-none ${errors.message ? 'border-red-500' : 'border-[#aaa]'}`}
            rows={6}
            placeholder="Type your message here…"
            value={formData.message}
            onChange={handleField('message')}
            aria-invalid={errors.message}
            aria-label="Your message"
          />
          {errors.message && <p className="text-[9px] text-red-500 mt-0.5">Message must be at least 10 characters.</p>}
        </div>

        {/* API error */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-[10px] text-red-600 bg-red-50 border border-red-200 px-2 py-1 rounded"
              role="alert"
            >
              {errorMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Social + Send */}
        <div className="flex items-center justify-between pt-0.5">
          <div className="flex gap-4">
            <a href="https://github.com/Nischal00" target="_blank" rel="noopener noreferrer"
              className="flex flex-col items-center gap-0.5 hover:opacity-70 transition-opacity"
              aria-label="GitHub profile">
              <span className="text-[18px]">✳</span>
              <span className="text-[8px] text-[#444]">GitHub</span>
            </a>
            <a href="https://www.linkedin.com/in/nischal-bhandari-708b712a3/" target="_blank" rel="noopener noreferrer"
              className="flex flex-col items-center gap-0.5 hover:opacity-70 transition-opacity"
              aria-label="LinkedIn profile">
              <span className="text-[18px]">💼</span>
              <span className="text-[8px] text-[#444]">LinkedIn</span>
            </a>
          </div>
          <motion.button
            className="flex items-center gap-2 px-5 py-2 rounded-full text-white text-[11px] font-bold"
            onClick={handleSend}
            whileTap={{ scale: 0.95 }}
            whileHover={{ filter: 'brightness(1.1)' }}
            aria-label="Send message"
            disabled={isPending}
            style={{
              background: isPending
                ? 'linear-gradient(180deg, #999 0%, #777 100%)'
                : 'linear-gradient(180deg, #5fad2a 0%, #3b8c16 100%)',
              boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.3)',
              cursor: isPending ? 'wait' : 'pointer',
            }}
          >
            {isPending ? '⏳ SENDING…' : '✉ SEND MESSAGE'}
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
              role="dialog"
              aria-label="Message sent confirmation"
            >
              <div className="text-3xl mb-2">✅</div>
              <p className="text-[11px] font-bold text-[#333] mb-1">Message Sent!</p>
              <p className="text-[9px] text-[#666] mb-3">Nischal will get back to you soon.</p>
              <button
                className="text-[10px] px-4 py-1 border border-[#999] hover:bg-[#e0ddd5]"
                style={{ background: 'linear-gradient(180deg, #ece9d8 0%, #d4d0c8 100%)' }}
                onClick={() => setShowSuccess(false)}
                autoFocus
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
