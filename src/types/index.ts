export type WindowId =
  | 'about' | 'experience' | 'skills' | 'education' | 'contact' | 'projects' | 'terminal'
  | 'quiz' | 'radar' | 'timeline' | 'certs' | 'ratecard' | 'snippets' | 'shortcuts'
  | 'minesweeper' | 'notepad' | 'taskmanager';

export interface WindowState {
  id: WindowId;
  title: string;
  icon: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
  prevPosition?: { x: number; y: number };
  prevSize?: { width: number; height: number };
}

export interface JobData {
  role: string;
  company: string;
  period: string;
  icon: string;
  duties: string[];
}

export interface SkillData {
  name: string;
  level: number;
}

export interface ProjectData {
  name: string;
  description: string;
  tech: string[];
  icon: string;
}

export interface GermanWord {
  de: string;
  en: string;
  category: string;
}

export interface TechPhase {
  year: number;
  phase: string;
  techs: string[];
  color: string;
}

export interface CertData {
  name: string;
  issuer: string;
  year: string;
  icon: string;
  category: string;
  color: string;
}

export interface CodeSnippet {
  title: string;
  lang: string;
  description: string;
  code: string;
}
