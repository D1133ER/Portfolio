'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWindows } from '@/context/WindowContext';
import { WindowId } from '@/types';
import XPWindow from '../XPWindow';

/* fake background processes for authenticity */
const FAKE_PROCS = [
  { name: 'System Idle Process', pid: 0,    cpu: 98, mem: '28 K' },
  { name: 'System',              pid: 4,    cpu: 0,  mem: '240 K' },
  { name: 'smss.exe',            pid: 108,  cpu: 0,  mem: '392 K' },
  { name: 'csrss.exe',           pid: 468,  cpu: 0,  mem: '3,400 K' },
  { name: 'winlogon.exe',        pid: 492,  cpu: 0,  mem: '4,800 K' },
  { name: 'services.exe',        pid: 536,  cpu: 0,  mem: '3,200 K' },
  { name: 'lsass.exe',           pid: 548,  cpu: 0,  mem: '1,540 K' },
  { name: 'svchost.exe',         pid: 712,  cpu: 0,  mem: '4,900 K' },
  { name: 'svchost.exe',         pid: 808,  cpu: 0,  mem: '22,400 K' },
  { name: 'explorer.exe',        pid: 1496, cpu: 0,  mem: '14,200 K' },
  { name: 'taskmgr.exe',         pid: 1888, cpu: 1,  mem: '3,600 K' },
];

// Map windowId to a fake .exe
const WIN_EXE: Record<string, string> = {
  about: 'sysprops.exe', experience: 'explorer.exe', skills: 'msconfig.exe',
  education: 'certmgmt.exe', contact: 'outlook.exe', projects: 'filemanager.exe',
  terminal: 'cmd.exe', quiz: 'quiz.exe', radar: 'radar.exe',
  timeline: 'timeline.exe', certs: 'certmgmt.exe', ratecard: 'services.exe',
  snippets: 'notepad++.exe', shortcuts: 'help.exe',
  minesweeper: 'winmine.exe', notepad: 'notepad.exe', taskmanager: 'taskmgr.exe',
};

/* ── Performance graph hook ── */
function usePerformanceData(active: boolean) {
  const [cpu, setCpu] = useState<number[]>(Array(60).fill(0));
  const [mem, setMem] = useState<number[]>(Array(60).fill(40));

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      setCpu((prev) => {
        const next = [...prev.slice(1), Math.round(Math.random() * 25 + 2)];
        return next;
      });
      setMem((prev) => {
        const last = prev[prev.length - 1];
        const delta = (Math.random() - 0.45) * 3;
        const next = [...prev.slice(1), Math.max(38, Math.min(72, last + delta))];
        return next;
      });
    }, 500);
    return () => clearInterval(id);
  }, [active]);

  return { cpu, mem };
}

function SparkLine({ data, color, label, unit = '%' }: { data: number[]; color: string; label: string; unit?: string }) {
  const max = 100;
  const w = 260, h = 60;
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`)
    .join(' ');
  const area = `0,${h} ${pts} ${w},${h}`;
  const current = data[data.length - 1];

  return (
    <div className="mb-3">
      <div className="flex justify-between text-[10px] mb-1" style={{ color: '#444' }}>
        <span className="font-bold">{label}</span>
        <span style={{ color }}>{current.toFixed(0)}{unit}</span>
      </div>
      <div style={{ background: '#000', border: '1px solid #444', position: 'relative', height: h }}>
        <svg width={w} height={h} style={{ display: 'block', width: '100%', height: '100%' }} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
          {/* Grid lines */}
          {[25, 50, 75].map((v) => (
            <line key={v} x1={0} y1={h - (v / max) * h} x2={w} y2={h - (v / max) * h}
              stroke="#1a3a1a" strokeWidth={0.5} />
          ))}
          <polygon points={area} fill={color} fillOpacity={0.3} />
          <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} />
        </svg>
        {[0, 25, 50, 75, 100].map((v) => (
          <div key={v} style={{
            position: 'absolute', right: 2,
            bottom: `${(v / max) * 100}%`,
            color: '#555', fontSize: 7, lineHeight: 1,
          }}>{v}</div>
        ))}
      </div>
    </div>
  );
}

export default function TaskManagerWindow() {
  const { windows, closeWindow, focusWindow } = useWindows();
  const [tab, setTab] = useState<'applications' | 'processes' | 'performance'>('applications');
  const { cpu, mem } = usePerformanceData(tab === 'performance');

  const openWins = windows.filter((w) => w.isOpen);

  // Processes: combine fake + real open windows
  const processes = [
    ...openWins.map((w, i) => ({
      name: WIN_EXE[w.id] ?? `${w.id}.exe`,
      pid: 2000 + i * 73,
      cpu: Math.floor(Math.random() * 3),
      mem: `${(Math.random() * 8 + 2).toFixed(0)},000 K`,
      windowId: w.id as WindowId,
    })),
    ...FAKE_PROCS,
  ];

  const totalCpu = cpu[cpu.length - 1] ?? 0;
  const totalMem = mem[mem.length - 1] ?? 0;

  const tabs = ['applications', 'processes', 'performance'] as const;

  return (
    <XPWindow id="taskmanager" menuItems={['File', 'Options', 'View', 'Windows', 'Help']} noPadding>
      <div className="flex flex-col h-full" style={{ fontFamily: 'Tahoma, sans-serif', minHeight: 0 }}>
        {/* Tab bar */}
        <div className="flex border-b border-[#aaa] bg-[#ece9d8] px-1 pt-1 flex-shrink-0">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-3 py-1 text-[11px] capitalize border-t border-l border-r -mb-px"
              style={{
                background: tab === t ? '#ece9d8' : '#d4d0c8',
                borderColor: tab === t ? '#aaa' : '#bbb',
                borderBottomColor: tab === t ? '#ece9d8' : '#aaa',
                fontWeight: tab === t ? 'bold' : 'normal',
                zIndex: tab === t ? 1 : 0,
              }}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col" style={{ minHeight: 0 }}>
          <AnimatePresence mode="wait">
            {tab === 'applications' && (
              <motion.div
                key="applications"
                className="flex-1 overflow-hidden flex flex-col p-2"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
              >
                {/* Header */}
                <div
                  className="grid text-[10px] font-bold px-2 py-0.5 flex-shrink-0"
                  style={{ gridTemplateColumns: '1fr 80px', background: '#d4d0c8', borderBottom: '1px solid #aaa' }}
                >
                  <span>Task</span>
                  <span>Status</span>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {openWins.length === 0 ? (
                    <div className="text-[10px] text-[#888] p-4 text-center">No open windows</div>
                  ) : (
                    openWins.map((w) => (
                      <div
                        key={w.id}
                        className="grid items-center px-2 py-1 hover:bg-[#316ac5] hover:text-white cursor-pointer group"
                        style={{ gridTemplateColumns: '1fr 80px', borderBottom: '1px solid #e8e5dc' }}
                        onClick={() => focusWindow(w.id)}
                      >
                        <span className="text-[11px] flex items-center gap-1.5 truncate">
                          <span>{w.icon}</span>
                          <span className="truncate">{w.title}</span>
                        </span>
                        <span className="text-[10px]" style={{ color: w.isMinimized ? '#999' : '#007700' }}>
                          {w.isMinimized ? 'Minimized' : 'Running'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
                {/* Footer */}
                <div className="flex justify-end gap-2 pt-2 flex-shrink-0 border-t border-[#bbb]">
                  <button
                    className="text-[10px] px-3 py-1 border border-[#999] hover:bg-[#fdd]"
                    style={{ background: 'linear-gradient(180deg,#ece9d8 0%,#d4d0c8 100%)' }}
                    onClick={() => {
                      const top = [...openWins].sort((a, b) => b.zIndex - a.zIndex)[0];
                      if (top) closeWindow(top.id);
                    }}
                  >
                    End Task
                  </button>
                  <button
                    className="text-[10px] px-3 py-1 border border-[#999] hover:bg-[#d4d0c8]"
                    style={{ background: 'linear-gradient(180deg,#ece9d8 0%,#d4d0c8 100%)' }}
                    onClick={() => {
                      const top = [...openWins].sort((a, b) => b.zIndex - a.zIndex)[0];
                      if (top) focusWindow(top.id);
                    }}
                  >
                    Switch To
                  </button>
                </div>
              </motion.div>
            )}

            {tab === 'processes' && (
              <motion.div
                key="processes"
                className="flex-1 overflow-hidden flex flex-col p-2"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
              >
                <div
                  className="grid text-[10px] font-bold px-2 py-0.5 flex-shrink-0"
                  style={{ gridTemplateColumns: '1fr 50px 50px 70px', background: '#d4d0c8', borderBottom: '1px solid #aaa' }}
                >
                  <span>Image Name</span>
                  <span>PID</span>
                  <span>CPU</span>
                  <span>Mem Usage</span>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {processes.map((p, i) => (
                    <div
                      key={`${p.name}-${p.pid}`}
                      className="grid items-center px-2 py-0.5 hover:bg-[#d4d0c8]"
                      style={{ gridTemplateColumns: '1fr 50px 50px 70px', borderBottom: '1px solid #eee' }}
                    >
                      <span className="text-[10px] truncate">{p.name}</span>
                      <span className="text-[10px] text-[#555]">{p.pid}</span>
                      <span className="text-[10px]">{typeof p.cpu === 'number' ? p.cpu : 0}</span>
                      <span className="text-[10px] text-right pr-2">{(p as {mem:string}).mem}</span>
                    </div>
                  ))}
                </div>
                <div className="flex-shrink-0 pt-1 border-t border-[#bbb]">
                  <span className="text-[10px] text-[#555]">{processes.length} processes</span>
                </div>
              </motion.div>
            )}

            {tab === 'performance' && (
              <motion.div
                key="performance"
                className="flex-1 overflow-y-auto p-3"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
              >
                <SparkLine data={cpu} color="#00cc00" label="CPU Usage" />
                <SparkLine data={mem} color="#ff9900" label="Memory (RAM) Usage" />

                <div className="grid grid-cols-2 gap-2 mt-2 text-[10px]">
                  <div className="bg-[#f5f5ef] border border-[#ccc] p-2">
                    <div className="font-bold text-[#333] mb-1">CPU</div>
                    <div className="text-[#555]">Usage: <span style={{ color: '#00aa00' }}>{totalCpu.toFixed(0)}%</span></div>
                    <div className="text-[#555]">Processes: {processes.length}</div>
                    <div className="text-[#555]">Uptime: {Math.floor(Date.now() / 60000) % 9999}m</div>
                  </div>
                  <div className="bg-[#f5f5ef] border border-[#ccc] p-2">
                    <div className="font-bold text-[#333] mb-1">Physical Memory</div>
                    <div className="text-[#555]">Total: <span style={{ color: '#ff8800' }}>512 MB</span></div>
                    <div className="text-[#555]">Available: {(512 - totalMem * 5.12).toFixed(0)} MB</div>
                    <div className="text-[#555]">In Use: {(totalMem * 5.12).toFixed(0)} MB</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom status bar */}
        <div
          className="flex items-center justify-between px-2 flex-shrink-0 border-t border-[#bbb]"
          style={{ height: 20, background: '#d4d0c8', fontSize: 10, color: '#555' }}
        >
          <span>CPU Usage: {totalCpu.toFixed(0)}%</span>
          <span>Commit Charge: {(totalMem * 5.12).toFixed(0)} MB / 512 MB</span>
        </div>
      </div>
    </XPWindow>
  );
}
