import { JobData, ProjectData, SkillData, CertData, TechPhase, GermanWord, CodeSnippet } from '@/types';

export const jobData: Record<string, JobData> = {
  kaski: {
    role: 'IT Officer',
    company: 'Kaski Sewa Hospital & Research Center',
    period: '2019 – 2024',
    icon: '🏥',
    duties: [
      'Managed and maintained the hospital IT infrastructure.',
      'Provided technical support for hardware and software issues.',
      'Ensured data security, system reliability, and regular backups.',
      'Assisted in troubleshooting and resolving network-related issues.',
    ],
  },
  searchable: {
    role: 'Front-End Developer Intern (Angular)',
    company: 'Searchable Design LLC',
    period: '2021',
    icon: '💻',
    duties: [
      'Developed and maintained web applications using Angular.',
      'Collaborated with design teams to build user-friendly interfaces.',
      'Conducted code reviews and improved application performance.',
    ],
  },
  skybase: {
    role: 'Quality Assurance Intern',
    company: 'Skybase Innovation',
    period: '2024',
    icon: '🔬',
    duties: [
      'Performed software testing and quality assurance tasks.',
      'Identified bugs and contributed to process improvements.',
      'Ensured compliance with development standards.',
    ],
  },
  infomax: {
    role: 'Full Stack Web Developer',
    company: 'Infomax',
    period: '2024',
    icon: '🌐',
    duties: [
      'Developed and maintained full-stack web applications.',
      'Worked on both front-end and back-end technologies.',
    ],
  },
  ing: {
    role: 'German Language Instructor',
    company: 'ING Skill Academy',
    period: 'Ongoing',
    icon: '📚',
    duties: [
      'Delivered German language training and supported student learning.',
      'Developed lesson plans and engaging teaching materials.',
    ],
  },
  dmu: {
    role: 'Business Development / Public Relations Officer',
    company: 'Direct Marketing Unit',
    period: '2024 – Present',
    icon: '📊',
    duties: [
      'Managed client relationships and business growth initiatives.',
      'Handled communication and public relations activities.',
      'Developed strategies for market expansion and brand visibility.',
    ],
  },
};

export const technicalSkills: SkillData[] = [
  { name: 'JavaScript', level: 85 },
  { name: 'Angular', level: 80 },
  { name: 'Full Stack Dev', level: 78 },
  { name: 'Python', level: 75 },
  { name: 'Java', level: 70 },
  { name: 'C / C++ / C#', level: 68 },
  { name: 'IT Support', level: 92 },
  { name: 'System Admin', level: 85 },
  { name: 'Software Testing', level: 72 },
  { name: 'Pen Testing', level: 62 },
];

export const softSkills = [
  'Project Management',
  'Teamwork',
  'Time Management',
  'Leadership',
  'Communication',
  'Critical Thinking',
];

export const languages = [
  { name: 'English', level: 'Fluent' as const },
  { name: 'Nepali', level: 'Fluent' as const },
  { name: 'Hindi', level: 'Fluent' as const },
  { name: 'German', level: 'Intermediate' as const },
];

export const projects: ProjectData[] = [
  {
    name: 'Hospital Management System',
    description: 'Full-stack web application for managing hospital operations, patient records, and staff scheduling.',
    tech: ['Angular', 'Node.js', 'MongoDB', 'TypeScript'],
    icon: '🏥',
  },
  {
    name: 'E-Commerce Platform',
    description: 'Responsive online store with payment integration, inventory management, and admin dashboard.',
    tech: ['React', 'Express', 'PostgreSQL', 'Stripe'],
    icon: '🛒',
  },
  {
    name: 'Network Monitoring Tool',
    description: 'Real-time network monitoring and alerting system for IT infrastructure management.',
    tech: ['Python', 'Flask', 'WebSocket', 'Chart.js'],
    icon: '📡',
  },
  {
    name: 'Portfolio Website (This!)',
    description: 'Windows XP themed interactive portfolio built with Next.js and Framer Motion.',
    tech: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
    icon: '💾',
  },
];

// ── German vocabulary for quiz ────────────────────────────────────────────────
export const germanWords: GermanWord[] = [
  { de: 'Hallo',            en: 'Hello',             category: 'Greetings' },
  { de: 'Danke',            en: 'Thank you',          category: 'Greetings' },
  { de: 'Bitte',            en: 'Please',             category: 'Greetings' },
  { de: 'Entschuldigung',   en: 'Excuse me',          category: 'Greetings' },
  { de: 'Tschüss',          en: 'Goodbye',            category: 'Greetings' },
  { de: 'Guten Morgen',     en: 'Good morning',       category: 'Greetings' },
  { de: 'Wasser',           en: 'Water',              category: 'Nouns' },
  { de: 'Brot',             en: 'Bread',              category: 'Nouns' },
  { de: 'Haus',             en: 'House',              category: 'Nouns' },
  { de: 'Auto',             en: 'Car',                category: 'Nouns' },
  { de: 'Schule',           en: 'School',             category: 'Nouns' },
  { de: 'Arbeit',           en: 'Work / Job',         category: 'Nouns' },
  { de: 'Freund',           en: 'Friend',             category: 'Nouns' },
  { de: 'Familie',          en: 'Family',             category: 'Nouns' },
  { de: 'Zeit',             en: 'Time',               category: 'Concepts' },
  { de: 'Lernen',           en: 'To learn',           category: 'Verbs' },
  { de: 'Sprechen',         en: 'To speak',           category: 'Verbs' },
  { de: 'Verstehen',        en: 'To understand',      category: 'Verbs' },
  { de: 'Programmieren',    en: 'To program',         category: 'Tech' },
  { de: 'Computer',         en: 'Computer',           category: 'Tech' },
  { de: 'Netzwerk',         en: 'Network',            category: 'Tech' },
  { de: 'Sicherheit',       en: 'Security',           category: 'Tech' },
  { de: 'Krankenhaus',      en: 'Hospital',           category: 'Healthcare' },
  { de: 'Arzt',             en: 'Doctor',             category: 'Healthcare' },
];

// ── Tech evolution by year ────────────────────────────────────────────────────
export const techEvolution: TechPhase[] = [
  { year: 2019, phase: 'IT Officer',       techs: ['Windows Server', 'Active Directory', 'Networking', 'Hardware', 'SQL'],            color: '#1244a8' },
  { year: 2021, phase: 'Frontend Intern',  techs: ['Angular', 'TypeScript', 'HTML/CSS', 'Git', 'REST APIs'],                          color: '#2e7d32' },
  { year: 2022, phase: 'Full Stack',       techs: ['Node.js', 'MongoDB', 'Express', 'Python', 'Flask'],                               color: '#6a1b9a' },
  { year: 2023, phase: 'Security + QA',    techs: ['Pen Testing', 'Kali Linux', 'OWASP', 'Selenium', 'Jest'],                         color: '#b71c1c' },
  { year: 2024, phase: 'Full Stack Dev',   techs: ['React', 'Next.js', 'PostgreSQL', 'Docker', 'Stripe API'],                         color: '#e65100' },
  { year: 2025, phase: 'Modern Stack',     techs: ['Next.js 15', 'Tailwind v4', 'Framer Motion', 'TypeScript', 'Canvas/WebAudio API'], color: '#00695c' },
];

// ── Certifications ────────────────────────────────────────────────────────────
export const certifications: CertData[] = [
  { name: 'CompTIA A+',              issuer: 'CompTIA',          year: '2020', icon: '🖥️', category: 'IT',       color: '#e65100' },
  { name: 'CompTIA Network+',        issuer: 'CompTIA',          year: '2020', icon: '🌐', category: 'IT',       color: '#1565c0' },
  { name: 'Ethical Hacking (CEH)',   issuer: 'EC-Council',       year: '2021', icon: '🔐', category: 'Security', color: '#b71c1c' },
  { name: 'German Language B1',      issuer: 'Goethe-Institut',  year: '2022', icon: '🇩🇪', category: 'Language', color: '#1b5e20' },
  { name: 'Angular Developer',       issuer: 'Udemy',            year: '2021', icon: '⚡', category: 'Dev',      color: '#4a148c' },
  { name: 'Python Fundamentals',     issuer: 'Coursera',         year: '2022', icon: '🐍', category: 'Dev',      color: '#00695c' },
  { name: 'Full Stack Web Dev',      issuer: 'freeCodeCamp',     year: '2023', icon: '💻', category: 'Dev',      color: '#1a237e' },
  { name: 'IELTS Academic (7.0)',    issuer: 'British Council',  year: '2023', icon: '📝', category: 'Language', color: '#0277bd' },
  { name: 'Scrum Foundation',        issuer: 'SCRUMstudy',       year: '2024', icon: '🔄', category: 'Business', color: '#37474f' },
];

// ── Code snippets ─────────────────────────────────────────────────────────────
export const codeSnippets: CodeSnippet[] = [
  {
    title: 'Patient API Router',
    lang: 'typescript',
    description: 'Express router for patient CRUD — Hospital Management System',
    code: `import { Router, Request, Response } from 'express';
import Patient from '../models/Patient';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// GET all patients (requires auth)
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const patients = await Patient.find()
      .select('-__v')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: patients });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST create patient
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  const { name, age, diagnosis, ward } = req.body;
  const patient = new Patient({ name, age, diagnosis, ward });
  await patient.save();
  res.status(201).json({ success: true, data: patient });
});

export default router;`,
  },
  {
    title: 'useDebounce Hook',
    lang: 'typescript',
    description: 'Reusable debounce hook for search inputs',
    code: `import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number = 400): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

// Usage:
// const query = useDebounce(searchTerm, 300);
// useEffect(() => { fetchResults(query); }, [query]);`,
  },
  {
    title: 'Python Network Scanner',
    lang: 'python',
    description: 'Subnet scanner from Network Monitoring Tool project',
    code: `import socket
import concurrent.futures
from ipaddress import ip_network

def scan_host(ip: str, port: int = 80, timeout: float = 0.5) -> dict:
    """Check if a host is reachable on the network."""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(timeout)
        result = sock.connect_ex((ip, port))
        hostname = socket.gethostbyaddr(ip)[0] if result == 0 else "—"
        return {"ip": ip, "status": "UP" if result == 0 else "DOWN",
                "hostname": hostname}
    except Exception:
        return {"ip": ip, "status": "DOWN", "hostname": "—"}
    finally:
        sock.close()

def scan_subnet(cidr: str) -> list:
    hosts = [str(h) for h in ip_network(cidr, strict=False).hosts()]
    with concurrent.futures.ThreadPoolExecutor(max_workers=50) as pool:
        return list(pool.map(scan_host, hosts))`,
  },
  {
    title: 'Angular HTTP Cache Service',
    lang: 'typescript',
    description: 'HTTP caching service pattern — Searchable Design LLC',
    code: `import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class CachedHttpService {
  private cache = new Map<string, Observable<unknown>>();

  constructor(private http: HttpClient) {}

  get<T>(url: string, ttl = 60_000): Observable<T> {
    if (this.cache.has(url)) {
      return this.cache.get(url) as Observable<T>;
    }
    const req$ = this.http.get<T>(url).pipe(shareReplay(1));
    this.cache.set(url, req$);
    setTimeout(() => this.cache.delete(url), ttl);
    return req$;
  }

  invalidate(url: string) { this.cache.delete(url); }
}`,
  },
];

// ── Developer quotes (rotates daily) ─────────────────────────────────────────
export const devQuotes = [
  '"First, solve the problem. Then, write the code." — John Johnson',
  '"Code is like humor. When you have to explain it, it\'s bad." — Cory House',
  '"Any fool can write code a computer understands. Good programmers write code humans understand." — M. Fowler',
  '"Simplicity is the soul of efficiency." — Austin Freeman',
  '"The best code is code you don\'t write." — Jeff Atwood',
  '"Programs must be written for people to read, and only incidentally for machines to execute." — Abelson',
  '"Debugging is twice as hard as writing the code in the first place." — Brian Kernighan',
  '"Make it work, make it right, make it fast." — Kent Beck',
  '"The most dangerous phrase is \'We\'ve always done it this way.\'" — Grace Hopper',
  '"Talk is cheap. Show me the code." — Linus Torvalds',
  '"Clean code always looks like it was written by someone who cares." — Michael Feathers',
  '"Good software, like wine, takes time." — Joel Spolsky',
];
