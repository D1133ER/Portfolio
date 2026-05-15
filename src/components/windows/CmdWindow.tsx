'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import XPWindow from '../XPWindow';
import { useWindows } from '@/context/WindowContext';
import {
  jobData,
  technicalSkills,
  softSkills,
  languages,
  projects,
} from '@/data/portfolio';

// ─── constants ────────────────────────────────────────────────────────────────
const PROMPT = 'C:\\Users\\Nischal>';

const BANNER = `Microsoft Windows XP [Version 5.1.2600]
(C) Copyright 1985-2001 Microsoft Corp.

Type 'help' to see available commands.`;

// ─── helpers ──────────────────────────────────────────────────────────────────
function bar(level: number, width = 10) {
  const filled = Math.round((level / 100) * width);
  return `[${'█'.repeat(filled)}${'░'.repeat(width - filled)}]`;
}

function pad(s: string, n: number) {
  return s + ' '.repeat(Math.max(0, n - s.length));
}

function hr(n = 44) {
  return '─'.repeat(n);
}

// ─── command output builders ──────────────────────────────────────────────────
function buildHelp() {
  return `
Available commands:
  help        Show this help menu
  whoami      About Nischal Bhandari
  skills      List all technical skills
  softskills  List soft skills
  languages   Language proficiencies
  experience  Full work history
  exp <key>   Detail for one job  (keys: kaski searchable skybase infomax ing dmu)
  projects    All projects
  project <n> Detail for one project (n = 1-${projects.length})
  edu         Academic background
  contact     Open Contact window
  open <win>  Open any window  (about | experience | skills | education | projects |
               contact | terminal | quiz | radar | timeline | certs | ratecard |
               snippets | shortcuts | minesweeper | notepad | taskmanager |
               paint | calculator | controlpanel | mycomputer | ie | mediaplayer)
  resume      Download CV / resume PDF  (alias: cv)
  github      Open GitHub profile in browser
  linkedin    Open LinkedIn profile in browser
  bsod        ??? (just try it)
  date        Current date & time
  sysinfo     System information
  neofetch    System overview (portfolio stats)
  mines       Launch Minesweeper
  notepad     Open Notepad
  taskmgr     Open Task Manager
  matrix      ???
  cls         Clear the screen
  exit        Close this window
`.trim();
}

function buildWhoami() {
  return `
Nischal Bhandari
${hr()}
Role       : IT Professional & Full-Stack Developer
Location   : Pokhara, Nepal
Status     : Open to Opportunities
Email      : nischalbhandari11@gmail.com
GitHub     : github.com/nischalbhandari
LinkedIn   : linkedin.com/in/nischalbhandari
${hr()}
3+ years of hands-on experience spanning IT infrastructure,
full-stack web development, software testing, and language
instruction. Passionate about clean code and continuous growth.
`.trim();
}

function buildNeofetch() {
  const now = new Date();
  const uptime = `${Math.floor(now.getHours())}h ${now.getMinutes()}m`;
  return `
       .xXXXXXXx.       nischal@PORTFOLIO-XP
      xXXXXXXXXXXx      ${hr(19)}
     xXXXXXXXXXXXXx     OS:        Windows XP Pro SP3 (Portfolio Ed.)
    xXXXXX  XXXXXXXx    Host:      nischal-portfolio.vercel.app
   xXXX       XXXXXXx   Kernel:    Next.js 16.1.7 + React 19
  xXXX   ███░  XXXXXx   Shell:     cmd.exe v2.0
 xXXXX   ░░░   XXXXXXx  Resolution: ${typeof window !== 'undefined' ? window.screen.width : 1920}x${typeof window !== 'undefined' ? window.screen.height : 1080}
xXXXXXXXXXXXXXXXXXXXXx  Terminal:  Custom CmdWindow.exe
 XXXXXXXXXXXXXXXXXXXX   CPU:       Full-Stack Dev @ 100%
  XXXXXXXXXXXXXXXXXX    Memory:    10 Skills / 10 Skills used
   XXXXXXXXXXXXXXXX     Uptime:    ${uptime} (this session)
    XXXXXXXXXXXX        Packages:  23+ windows, 50+ cmds
     XXXXXXXXXX        
      XXXXXXXX          Skills:    JS • Angular • Python • Node
       XXXXXX           Projects:  ${projects.length} · Certs: 9 · Langs: 4
        XXXX            Contact:   nischalbhandari11@gmail.com
         XX             
`.trim();
}

function buildSkills() {
  const lines = technicalSkills.map(
    (s) => `  ${pad(s.name, 20)} ${bar(s.level)}  ${s.level}%`
  );
  return `Technical Skills\n${hr()}\n${lines.join('\n')}\n${hr()}`;
}

function buildSoftSkills() {
  const items = softSkills.map((s, i) => `  ${i + 1}. ${s}`).join('\n');
  return `Soft Skills\n${hr()}\n${items}\n${hr()}`;
}

function buildLanguages() {
  const lines = languages.map(
    (l) => `  ${pad(l.name, 12)}  ${l.level}`
  );
  return `Language Proficiencies\n${hr()}\n${lines.join('\n')}\n${hr()}`;
}

function buildExperience() {
  const entries = Object.values(jobData).map(
    (j) => `  ${j.icon}  ${pad(j.role, 38)} ${j.company}\n     Period: ${j.period}`
  );
  return `Work History\n${hr()}\n${entries.join('\n\n')}\n${hr()}\nTip: type  exp <key>  for full details`;
}

function buildExpDetail(key: string) {
  const j = jobData[key];
  if (!j) {
    const keys = Object.keys(jobData).join(', ');
    return `Unknown key '${key}'. Valid keys: ${keys}`;
  }
  const duties = j.duties.map((d, i) => `  ${i + 1}. ${d}`).join('\n');
  return `${j.icon}  ${j.role}\n${hr()}\nCompany : ${j.company}\nPeriod  : ${j.period}\n\nResponsibilities:\n${duties}\n${hr()}`;
}

function buildProjects() {
  const lines = projects.map(
    (p, i) =>
      `  ${p.icon} [${i + 1}] ${p.name}\n      Tech: ${p.tech.join(', ')}`
  );
  return `My Projects\n${hr()}\n${lines.join('\n\n')}\n${hr()}\nTip: type  project <n>  for full description`;
}

function buildProjectDetail(n: number) {
  const p = projects[n - 1];
  if (!p) return `No project #${n}. Use 'projects' to see the list.`;
  const links: string[] = [];
  if (p.github) links.push(`GitHub : ${p.github}`);
  if (p.live)   links.push(`Live   : ${p.live}`);
  const linksSection = links.length > 0
    ? `\n\nLinks:\n${links.map((l) => `  ${l}`).join('\n')}`
    : '';
  return `${p.icon}  ${p.name}\n${hr()}\nDescription:\n  ${p.description}\n\nTechnologies:\n  ${p.tech.join(' • ')}${linksSection}\n${hr()}`;
}

function buildEdu() {
  return `
Academic Background
${hr()}
  🎓  BSc Information Technology
      Pokhara University  |  Graduated 2024

  📘  +2 Science (Intermediate)
      NEB Board

  🏫  SLC (School Leaving Certificate)
      Government School
${hr()}
  `;
}

function buildSysInfo() {
  return `
System Information
${hr()}
  OS          : Nischal OS v2026.0 (Professional Edition)
  Processor   : Problem-Solver™ @ Unlimited GHz
  RAM         : ${technicalSkills.length} Skills Loaded  |  ${softSkills.length} Soft Skills
  Storage     : ${projects.length} Projects Shipped
  Languages   : ${languages.length} Human Languages + Several Computer Ones
  Location    : Pokhara, Nepal  🌏
  Uptime      : 3+ Years Professional Experience
  Status      : ✅ Available & Ready to Deploy
${hr()}
  `;
}

// ─── types ────────────────────────────────────────────────────────────────────
interface Line {
  kind: 'prompt' | 'output' | 'error' | 'success';
  text: string;
}

// ─── component ────────────────────────────────────────────────────────────────
export default function CmdWindow() {
  const { getWindow, openWindow, closeWindow } = useWindows();
  const win = getWindow('terminal');

  const [lines,   setLines]   = useState<Line[]>([{ kind: 'output', text: BANNER }]);
  const [input,   setInput]   = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [matrix,  setMatrix]  = useState(false);
  const [bsod,    setBsod]    = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number | undefined>(undefined);

  // Auto-scroll on new output
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  // Matrix rain
  useEffect(() => {
    if (!matrix || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d')!;
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const cols  = Math.floor(canvas.width / 14);
    const drops = Array<number>(cols).fill(1);

    const draw = () => {
      ctx.fillStyle = 'rgba(0,0,0,0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#00ff41';
      ctx.font      = '14px monospace';
      drops.forEach((y, i) => {
        const char = String.fromCharCode(0x30a0 + Math.floor(Math.random() * 96));
        ctx.fillText(char, i * 14, y * 14);
        if (y * 14 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current!);
  }, [matrix]);

  const push = (kind: Line['kind'], text: string) =>
    setLines((prev) => [...prev, { kind, text }]);

  const runCommand = (raw: string) => {
    const trimmed = raw.trim();
    const lower   = trimmed.toLowerCase();
    const parts   = trimmed.split(/\s+/);
    const cmd     = parts[0]?.toLowerCase() ?? '';
    const arg     = parts.slice(1).join(' ');

    // Always echo the prompt line
    setLines((prev) => [...prev, { kind: 'prompt', text: `${PROMPT} ${raw}` }]);

    if (!cmd) return;

    switch (cmd) {
      case 'help':
        push('output', buildHelp());
        break;

      case 'whoami':
      case 'about':
        push('output', buildWhoami());
        break;

      case 'skills':
        push('output', buildSkills());
        break;

      case 'softskills':
      case 'soft':
        push('output', buildSoftSkills());
        break;

      case 'languages':
      case 'lang':
        push('output', buildLanguages());
        break;

      case 'experience':
      case 'exp':
        if (arg) {
          push('output', buildExpDetail(arg.toLowerCase()));
        } else {
          push('output', buildExperience());
        }
        break;

      case 'projects':
        push('output', buildProjects());
        break;

      case 'project': {
        const n = parseInt(arg, 10);
        if (!arg || isNaN(n)) {
          push('error', `Usage: project <number>  (1 – ${projects.length})`);
        } else {
          push('output', buildProjectDetail(n));
        }
        break;
      }

      case 'edu':
      case 'education':
        push('output', buildEdu());
        break;

      case 'sysinfo':
      case 'systeminfo':
        push('output', buildSysInfo());
        break;

      case 'contact':
        openWindow('contact');
        push('success', 'Opening Contact window...');
        break;

      case 'open': {
        const validWindows: Parameters<typeof openWindow>[0][] = [
          'about', 'experience', 'skills', 'education', 'projects', 'contact',
          'terminal', 'quiz', 'radar', 'timeline', 'certs', 'ratecard',
          'snippets', 'shortcuts', 'minesweeper', 'notepad', 'taskmanager',
          'paint', 'calculator', 'controlpanel', 'mycomputer', 'ie', 'mediaplayer',
        ];
        const target = arg.toLowerCase() as Parameters<typeof openWindow>[0];
        if (validWindows.includes(target)) {
          openWindow(target);
          push('success', `Opening '${target}' window...`);
        } else {
          push('error', `Unknown window '${arg}'. Type 'help' to see all available windows.`);
        }
        break;
      }

      case 'date':
      case 'time':
        push('output', `Current Date/Time: ${new Date().toLocaleString()}`);
        break;

      case 'matrix':
        push('success', 'Initiating matrix protocol...\n(Click anywhere or press Esc to exit)');
        setMatrix(true);
        break;

      case 'bsod':
      case 'bluescreen': {
        push('error', '*** STOP: 0xNISCHAL_XP_EASTER_EGG *** Initiating...');
        setTimeout(() => setBsod(true), 600);
        break;
      }

      case 'cls':
      case 'clear':
        setLines([]);
        return;

      case 'exit':
      case 'quit':
        closeWindow('terminal');
        return;

      // Easter eggs
      case 'hello':
      case 'hi':
        push('output', `Hello there! 👋  Try 'whoami' or 'help'.`);
        break;

      case 'hire':
      case 'hire me':
        push('success', '✅ Good choice! Opening Contact window so you can reach out...');
        openWindow('contact');
        break;

      case 'sudo':
        push('error', `Nice try. This machine runs on merit, not root access. 😄`);
        break;

      case 'ls':
      case 'dir':
        push('output', [
          'Directory of C:\\Users\\Nischal',
          hr(),
          '  📁  Projects       <DIR>',
          '  📁  Experience     <DIR>',
          '  📁  Skills         <DIR>',
          '  📁  Education      <DIR>',
          '  📄  resume.pdf     127 KB',
          '  💌  contact.msg    Type "contact" to open',
          hr(),
        ].join('\n'));
        break;

      case 'type':
      case 'cat':
        if (arg.toLowerCase().includes('resume')) {
          push('output', buildWhoami());
        } else {
          push('error', `The system cannot find the file '${arg}'.`);
        }
        break;

      case 'ping':
        push('output', `Pinging ${arg || 'nischalbhandari.com'} ...\nReply: bytes=32 time=1ms TTL=128\nReply: bytes=32 time=1ms TTL=128\nReply: bytes=32 time=1ms TTL=128\n\nPing statistics: 3 packets sent, 3 received, 0% loss.`);
        break;

      case 'ipconfig':
        push('output', 'Windows IP Configuration\n\nEthernet adapter Local Area Connection:\n  IPv4 Address. . . . . : 192.168.1.42\n  Subnet Mask . . . . . : 255.255.255.0\n  Default Gateway . . . : 192.168.1.1\n\n(This is fictional, obviously 😉)');
        break;

      case 'ver':
        push('output', 'Microsoft Windows XP [Version 5.1.2600] — Nischal Portfolio Edition');
        break;

      case 'echo':
        push('output', arg || '');
        break;

      case 'color': {
        push('output', `Color command noted. (Try 'matrix' for a real visual effect!)`);
        break;
      }

      case 'neofetch':
        push('success', buildNeofetch());
        break;

      case 'mines':
      case 'minesweeper':
        push('success', 'Launching Minesweeper...');
        openWindow('minesweeper');
        break;

      case 'notepad':
        push('success', 'Opening Notepad...');
        openWindow('notepad');
        break;

      case 'taskmgr':
      case 'taskmanager':
        push('success', 'Opening Task Manager... (or press Ctrl+Alt+Delete)');
        openWindow('taskmanager');
        break;

      case 'resume':
      case 'cv': {
        push('success', 'Opening CV for download...');
        const link = document.createElement('a');
        link.href     = '/nischal-bhandari-cv.pdf';
        link.download = 'Nischal-Bhandari-CV.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        break;
      }

      case 'github':
        push('success', 'Opening GitHub profile...');
        window.open('https://github.com/Nischal00', '_blank', 'noopener,noreferrer');
        break;

      case 'linkedin':
        push('success', 'Opening LinkedIn profile...');
        window.open('https://www.linkedin.com/in/nischal-bhandari-708b712a3/', '_blank', 'noopener,noreferrer');
        break;

      default:
        // Check if it's a partial match suggestion
        const allCmds = ['help','whoami','skills','softskills','languages','experience','exp','projects','project','edu','education','sysinfo','contact','open','date','matrix','cls','exit','ls','dir','ping','ipconfig','ver','echo','hire','neofetch','mines','notepad','taskmgr','resume','cv','github','linkedin','bsod'];
        const similar = allCmds.filter((c) => c.startsWith(lower.slice(0, 3)));
        const hint = similar.length > 0 ? `\nDid you mean: ${similar.join(', ')} ?` : '';
        push('error', `'${cmd}' is not recognized as an internal or external command.${hint}\nType 'help' for available commands.`);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const cmd = input;
      setHistory((h) => [cmd, ...h].slice(0, 100));
      setHistIdx(-1);
      setInput('');
      runCommand(cmd);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const idx = Math.min(histIdx + 1, history.length - 1);
      setHistIdx(idx);
      setInput(history[idx] ?? '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const idx = Math.max(histIdx - 1, -1);
      setHistIdx(idx);
      setInput(idx === -1 ? '' : (history[idx] ?? ''));
    } else if (e.key === 'Escape' && matrix) {
      setMatrix(false);
    } else if (e.key === 'Tab') {
      // Tab completion
      e.preventDefault();
      const cmds = ['help','whoami','skills','softskills','languages','experience','exp','projects','project','edu','sysinfo','contact','open','date','matrix','cls','exit','ls','dir','ping','ipconfig','ver','echo','hire','neofetch','mines','notepad','taskmgr','resume','cv','github','linkedin','bsod'];
      const match = cmds.find((c) => c.startsWith(input.toLowerCase()) && c !== input.toLowerCase());
      if (match) setInput(match);
    }
  };

  // Line color by kind
  const lineColor: Record<Line['kind'], string> = {
    output:  'text-[#b0b0b0]',
    prompt:  'text-white',
    error:   'text-[#ff6b6b]',
    success: 'text-[#50fa7b]',
  };

  if (!win?.isOpen) return null;

  const BSOD_TEXT = `A problem has been detected and Windows has been shut down to
prevent damage to your computer.

NISCHAL_XP_EASTER_EGG_FOUND

If this is the first time you've seen this Stop error screen,
restart your computer. If this screen appears again:

  Check your portfolio thoroughly.
  Open the Terminal and type 'hire'.
  Contact Nischal immediately.

Technical information:

*** STOP: 0x0000HIRE (0xNISCHAL00, 0x4A4F424F, 0x46464552, 0x21212121)

Beginning dump of physical memory...
Physical memory dump complete.

Contact nischalbhandari11@gmail.com or your nearest recruiter.`;

  return (
    <>
      {/* ── BSOD overlay (covers entire viewport) ── */}
      {bsod && (
        <div
          className="fixed inset-0 z-[9999] flex flex-col p-8 cursor-pointer select-none"
          style={{ background: '#0000aa', color: '#fff', fontFamily: 'Courier New, monospace', fontSize: 13, lineHeight: 1.6 }}
          onClick={() => setBsod(false)}
        >
          <div className="inline-block px-2 mb-4" style={{ background: '#aaa', color: '#0000aa', fontWeight: 'bold', fontSize: 13 }}>
            Windows
          </div>
          <pre className="whitespace-pre-wrap">{BSOD_TEXT}</pre>
          <div className="mt-6 text-[11px] opacity-70">(Click anywhere to dismiss)</div>
        </div>
      )}

    <XPWindow
      id="terminal"
      menuItems={['File', 'Edit', 'View', 'Help']}
      statusText={`C:\\Users\\Nischal  |  type 'help' for commands  |  Tab to autocomplete`}
      noPadding
    >
      {matrix ? (
        <div
          className="relative w-full h-full bg-black cursor-pointer"
          onClick={() => setMatrix(false)}
        >
          <canvas ref={canvasRef} className="w-full h-full" />
          <div className="absolute top-2 right-3 text-green-400 text-[10px] opacity-50 font-mono">
            Click or Esc to exit
          </div>
        </div>
      ) : (
        <div
          className="w-full h-full bg-black text-[#c0c0c0] font-mono text-[11px] flex flex-col overflow-y-auto p-2"
          style={{ cursor: 'text' }}
          onClick={(e) => {
            const inp = e.currentTarget.querySelector('input') as HTMLInputElement | null;
            inp?.focus();
          }}
        >
          {lines.map((line, i) => (
            <pre
              key={i}
              className={`whitespace-pre-wrap leading-snug mb-0.5 ${lineColor[line.kind]}`}
            >
              {line.text}
            </pre>
          ))}

          {/* Input row */}
          <div className="flex items-center gap-1 mt-1">
            <span className="text-[#50fa7b] flex-shrink-0 select-none">{PROMPT}</span>
            <input
              className="flex-1 bg-transparent text-white outline-none border-none font-mono text-[11px] caret-white"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
            />
          </div>
          <div ref={bottomRef} />
        </div>
      )}
    </XPWindow>
    </>
  );
}
