'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import XPWindow from '../XPWindow';

const SERVICES = [
  {
    icon: '💻',
    category: 'Full Stack Development',
    color: '#1244a8',
    items: [
      { service: 'Web App (React / Next.js)',       rate: '$800 – $2,500',  unit: 'per project' },
      { service: 'REST API with Node.js',            rate: '$400 – $1,200',  unit: 'per project' },
      { service: 'Angular Frontend Development',     rate: '$500 – $1,500',  unit: 'per project' },
      { service: 'Full Stack Hourly',                rate: '$20 – $35',      unit: 'per hour'    },
    ],
  },
  {
    icon: '🏥',
    category: 'IT Infrastructure & Support',
    color: '#2e7d32',
    items: [
      { service: 'Server Setup & Configuration',     rate: '$200 – $600',    unit: 'per setup' },
      { service: 'Network Design & Implementation',  rate: '$300 – $900',    unit: 'per project' },
      { service: 'IT Support Retainer',              rate: '$150 – $300',    unit: 'per month' },
      { service: 'IT Consulting / Audit',            rate: '$40 – $60',      unit: 'per hour' },
    ],
  },
  {
    icon: '🔐',
    category: 'Security & QA',
    color: '#b71c1c',
    items: [
      { service: 'Penetration Testing (Web App)',    rate: '$300 – $800',    unit: 'per audit' },
      { service: 'Security Assessment & Report',     rate: '$250 – $700',    unit: 'per report' },
      { service: 'QA / Test Automation Setup',       rate: '$400 – $1,000',  unit: 'per project' },
      { service: 'Code Review & Security Audit',     rate: '$30 – $50',      unit: 'per hour' },
    ],
  },
  {
    icon: '🇩🇪',
    category: 'German Language Tutoring',
    color: '#00695c',
    items: [
      { service: '1-on-1 Lessons (Beginner A1–A2)', rate: '$15 – $25',       unit: 'per hour' },
      { service: 'Group Classes (up to 4 students)', rate: '$10 – $18',      unit: 'per person/hr' },
      { service: 'B1 Exam Preparation Course',       rate: '$150 – $300',    unit: 'per course' },
      { service: 'Custom Curriculum Design',          rate: '$50 – $150',    unit: 'flat fee' },
    ],
  },
  {
    icon: '📊',
    category: 'Business Development',
    color: '#37474f',
    items: [
      { service: 'Market Research & Strategy',       rate: '$200 – $600',    unit: 'per report' },
      { service: 'Client Acquisition Consulting',    rate: '$100 – $400',    unit: 'per session' },
      { service: 'PR Campaign Planning',             rate: '$150 – $500',    unit: 'per campaign' },
      { service: 'BD Retainer',                      rate: '$200 – $500',    unit: 'per month' },
    ],
  },
];

const CONTACT = { email: 'nischalbhandari11@gmail.com', location: 'Pokhara, Nepal', availability: 'Open to remote & hybrid' };

export default function RateCardWindow() {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [copied,    setCopied]    = useState(false);

  const copyEmail = () => {
    const text = CONTACT.email;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } else {
      const el = document.createElement('textarea');
      el.value = text;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <XPWindow id="ratecard" statusText="💼  Services & Rates — Open to new opportunities">
      <div className="p-3 overflow-auto" style={{ fontFamily: 'Tahoma, sans-serif' }}>

        {/* Hero */}
        <div className="flex items-center gap-3 mb-3 p-2.5 border border-[#b8b5a8]"
          style={{ background: 'linear-gradient(180deg, #dde4f0 0%, #c8d8f5 100%)' }}>
          <span className="text-2xl">💼</span>
          <div className="flex-1">
            <div className="font-bold text-[12px] text-[#0a246a]">Nischal Bhandari — Services & Rates</div>
            <div className="text-[10px] text-[#555]">
              IT Professional · Full Stack Dev · German Instructor · Business Developer
            </div>
          </div>
          <div className="text-[9px] text-right">
            <div className="font-bold text-green-700">🟢 Available</div>
            <div className="text-[#555]">Pokhara, Nepal</div>
          </div>
        </div>

        {/* Service categories */}
        <div className="flex flex-col gap-2 mb-3">
          {SERVICES.map((svc, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}>
              <button
                className="w-full flex items-center gap-2 px-3 py-2 border border-[#b8b5a8] text-left cursor-pointer"
                style={{
                  background: activeIdx === i ? `${svc.color}14` : 'linear-gradient(180deg, #ece9d8 0%, #d4d0c8 100%)',
                  borderColor: activeIdx === i ? svc.color : '#b8b5a8',
                }}
                onClick={() => setActiveIdx(activeIdx === i ? null : i)}
              >
                <span className="text-base">{svc.icon}</span>
                <span className="font-bold text-[11px] flex-1 text-[#0a246a]">{svc.category}</span>
                <span className="text-[9px] text-[#888]">{svc.items.length} services</span>
                <span className="text-[10px] text-[#888] ml-1">{activeIdx === i ? '▲' : '▼'}</span>
              </button>

              {activeIdx === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border border-t-0 border-[#b8b5a8]"
                  style={{ background: '#fafaf8' }}
                >
                  <table className="w-full text-[10px]">
                    <thead>
                      <tr style={{ background: svc.color }}>
                        <th className="text-left py-1 px-3 text-white font-bold">Service</th>
                        <th className="text-right py-1 px-3 text-white font-bold">Rate</th>
                        <th className="text-right py-1 px-3 text-white font-bold">Unit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {svc.items.map((item, j) => (
                        <tr key={j}
                          className="border-b border-[#e0ddd5]"
                          style={{ background: j % 2 === 0 ? '#ece9d8' : '#e4e2d8' }}
                        >
                          <td className="py-1.5 px-3">{item.service}</td>
                          <td className="py-1.5 px-3 text-right font-bold text-[#0a246a]">{item.rate}</td>
                          <td className="py-1.5 px-3 text-right text-[#666]">{item.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="border-2 border-[#1244a8] p-3" style={{ background: 'linear-gradient(180deg, #dde4f0 0%, #c8d8f5 100%)' }}>
          <div className="font-bold text-[11px] text-[#0a246a] mb-2">📬 Ready to work together?</div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex-1 min-w-[160px]">
              <div className="text-[10px] mb-1">📧 {CONTACT.email}</div>
              <div className="text-[10px] text-[#555]">📍 {CONTACT.location} · {CONTACT.availability}</div>
            </div>
            <motion.button
              className="px-4 py-1.5 text-[10px] font-bold text-white border border-[#0a246a] cursor-pointer"
              style={{ background: copied ? '#2e7d32' : '#1244a8' }}
              whileHover={{ filter: 'brightness(1.12)' }}
              whileTap={{ scale: 0.95 }}
              onClick={copyEmail}
            >
              {copied ? '✓ Copied!' : '📋 Copy Email'}
            </motion.button>
          </div>
        </div>

        <div className="mt-2 text-[9px] text-[#888] text-center">
          * Rates are indicative and vary based on scope and complexity. Contact for a custom quote.
        </div>
      </div>
    </XPWindow>
  );
}
