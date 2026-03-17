import { JobData, ProjectData, SkillData } from '@/types';

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
