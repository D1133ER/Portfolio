'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import { WindowId, WindowState } from '@/types';

const STORAGE_KEY = 'nischal-portfolio-windows';

const defaultWindows: WindowState[] = [
  { id: 'about',      title: 'System Properties',              icon: '🖥️', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 10, position: { x: 80,  y: 40  }, size: { width: 420, height: 420 } },
  { id: 'experience', title: 'My Experience — C:\\Work History', icon: '📁', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 10, position: { x: 110, y: 55  }, size: { width: 540, height: 380 } },
  { id: 'skills',     title: 'My Skills — System Properties',   icon: '⚙️', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 10, position: { x: 130, y: 70  }, size: { width: 420, height: 460 } },
  { id: 'education',  title: 'Education — Academic Records',    icon: '🎓', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 10, position: { x: 150, y: 90  }, size: { width: 400, height: 380 } },
  { id: 'contact',    title: 'New Message',                     icon: '✉️', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 10, position: { x: 100, y: 50  }, size: { width: 510, height: 560 } },
  { id: 'projects',   title: 'My Projects — File Manager',      icon: '📂', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 10, position: { x: 120, y: 60  }, size: { width: 520, height: 560 } },
  { id: 'terminal',   title: 'Command Prompt',                  icon: '💻', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 10, position: { x: 160, y: 80  }, size: { width: 540, height: 380 } },
  { id: 'quiz',       title: 'German Quiz — Lernspiel.exe',     icon: '🇩🇪', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 10, position: { x: 180, y: 60  }, size: { width: 440, height: 420 } },
  { id: 'radar',      title: 'Skill Radar — sys_stats.exe',     icon: '📊', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 10, position: { x: 200, y: 70  }, size: { width: 500, height: 500 } },
  { id: 'timeline',   title: 'Career Timeline — history.log',   icon: '📅', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 10, position: { x: 90,  y: 50  }, size: { width: 600, height: 460 } },
  { id: 'certs',        title: 'Credentials Wall — certs.msc',    icon: '🏆', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 10, position: { x: 140, y: 65  }, size: { width: 520, height: 440 } },
  { id: 'ratecard',     title: 'Services & Rates — services.exe', icon: '💼', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 10, position: { x: 110, y: 55  }, size: { width: 480, height: 500 } },
  { id: 'snippets',     title: 'Code Snippets — notepad++.exe',   icon: '📝', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 10, position: { x: 170, y: 75  }, size: { width: 580, height: 480 } },
  { id: 'shortcuts',    title: 'Keyboard Shortcuts — help.exe',   icon: '⌨️', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 10, position: { x: 220, y: 90  }, size: { width: 420, height: 420 } },
  { id: 'minesweeper',  title: 'Minesweeper',                     icon: '💣', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 10, position: { x: 240, y: 100 }, size: { width: 320, height: 400 } },
  { id: 'notepad',      title: 'Untitled — Notepad',              icon: '🗒️', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 10, position: { x: 180, y: 80  }, size: { width: 480, height: 380 } },
  { id: 'taskmanager',  title: 'Windows Task Manager',            icon: '📋', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 10, position: { x: 160, y: 70  }, size: { width: 500, height: 440 } },
];

type Action =
  | { type: 'OPEN';     id: WindowId }
  | { type: 'CLOSE';    id: WindowId }
  | { type: 'MINIMIZE'; id: WindowId }
  | { type: 'MAXIMIZE'; id: WindowId }
  | { type: 'RESTORE';  id: WindowId }
  | { type: 'FOCUS';    id: WindowId }
  | { type: 'MOVE';     id: WindowId; position: { x: number; y: number } }
  | { type: 'RESIZE';   id: WindowId; size: { width: number; height: number } }
  | { type: 'RESIZE_POSITION'; id: WindowId; position: { x: number; y: number }; size: { width: number; height: number } }
  | { type: 'MINIMIZE_ALL' }
  | { type: 'CLOSE_ALL' }
  | { type: 'HYDRATE'; state: WindowState[] };

let zCounter = 10;

function loadPersistedState(): WindowState[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WindowState[];
    // Validate shape — every defaultWindow ID must be present (ignore extra)
    if (
      !Array.isArray(parsed) ||
      !defaultWindows.every((dw) => parsed.some((p) => p.id === dw.id))
    ) {
      return null;
    }
    // Restore zCounter to max saved value
    const maxZ = Math.max(...parsed.map((w) => w.zIndex), 10);
    zCounter = maxZ;
    return parsed;
  } catch {
    return null;
  }
}

function persistState(state: WindowState[]) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* ignore quota errors */ }
}

function reducer(state: WindowState[], action: Action): WindowState[] {
  switch (action.type) {
    case 'OPEN': {
      zCounter++;
      // Maximize on portrait-mobile OR landscape-phone (small viewport height)
      const isMobile = typeof window !== 'undefined' && (window.innerWidth < 768 || window.innerHeight < 500);
      return state.map((w) =>
        w.id === action.id ? { ...w, isOpen: true, isMinimized: false, isMaximized: isMobile, zIndex: zCounter } : w
      );
    }
    case 'CLOSE':
      return state.map((w) => (w.id === action.id ? { ...w, isOpen: false, isMinimized: false, isMaximized: false } : w));
    case 'MINIMIZE':
      return state.map((w) => (w.id === action.id ? { ...w, isMinimized: true } : w));
    case 'MAXIMIZE':
      return state.map((w) =>
        w.id === action.id
          ? { ...w, isMaximized: true, isMinimized: false, prevPosition: w.position, prevSize: w.size }
          : w
      );
    case 'RESTORE':
      return state.map((w) =>
        w.id === action.id
          ? {
              ...w,
              isMaximized: false,
              isMinimized: false,
              position: w.prevPosition ?? w.position,
              size: w.prevSize ?? w.size,
            }
          : w
      );
    case 'FOCUS':
      zCounter++;
      return state.map((w) =>
        w.id === action.id ? { ...w, isMinimized: false, zIndex: zCounter } : w
      );
    case 'MOVE':
      return state.map((w) => (w.id === action.id ? { ...w, position: action.position } : w));
    case 'RESIZE':
      return state.map((w) => (w.id === action.id ? { ...w, size: action.size } : w));
    case 'RESIZE_POSITION':
      return state.map((w) => (w.id === action.id ? { ...w, position: action.position, size: action.size } : w));
    case 'MINIMIZE_ALL':
      return state.map((w) => (w.isOpen ? { ...w, isMinimized: true } : w));
    case 'CLOSE_ALL':
      return state.map((w) => ({ ...w, isOpen: false, isMinimized: false, isMaximized: false }));
    case 'HYDRATE':
      return action.state;
    default:
      return state;
  }
}

interface WindowContextType {
  windows: WindowState[];
  openWindow:    (id: WindowId) => void;
  closeWindow:   (id: WindowId) => void;
  minimizeWindow:(id: WindowId) => void;
  maximizeWindow:(id: WindowId) => void;
  restoreWindow: (id: WindowId) => void;
  focusWindow:   (id: WindowId) => void;
  moveWindow:    (id: WindowId, position: { x: number; y: number }) => void;
  resizeWindow:  (id: WindowId, size: { width: number; height: number }) => void;
  resizePositionWindow: (id: WindowId, position: { x: number; y: number }, size: { width: number; height: number }) => void;
  minimizeAllWindows: () => void;
  getWindow:     (id: WindowId) => WindowState | undefined;
  recycledIds:        WindowId[];
  restoreFromRecycle: (id: WindowId) => void;
  emptyRecycleBin:    () => void;
}

const WindowContext = createContext<WindowContextType | null>(null);

export function WindowProvider({ children }: { children: React.ReactNode }) {
  const [windows, dispatch] = useReducer(reducer, defaultWindows);
  const [recycledIds, setRecycledIds] = React.useState<WindowId[]>([]);
  const windowsRef = useRef(windows);
  windowsRef.current = windows;

  // Hydrate persisted state after mount to avoid SSR mismatch
  const isInitialMount = useRef(true);
  useEffect(() => {
    const persisted = loadPersistedState();
    if (persisted) {
      dispatch({ type: 'HYDRATE', state: persisted });
    }
  }, []);

  // Persist window state to sessionStorage on changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    persistState(windows);
  }, [windows]);

  const openWindow     = useCallback((id: WindowId) => {
    dispatch({ type: 'OPEN', id });
    setRecycledIds((prev) => prev.filter((r) => r !== id));
  }, []);
  const closeWindow    = useCallback((id: WindowId) => {
    const isCurrentlyOpen = windowsRef.current.find((w) => w.id === id)?.isOpen ?? false;
    dispatch({ type: 'CLOSE', id });
    if (isCurrentlyOpen) {
      setRecycledIds((prev) => {
        const next = prev.filter((r) => r !== id);
        return [...next, id].slice(-10);
      });
    }
  }, []);
  const restoreFromRecycle = useCallback((id: WindowId) => {
    dispatch({ type: 'OPEN', id });
    setRecycledIds((prev) => prev.filter((r) => r !== id));
  }, []);
  const emptyRecycleBin = useCallback(() => setRecycledIds([]), []);
  const minimizeWindow = useCallback((id: WindowId) => dispatch({ type: 'MINIMIZE', id }), []);
  const maximizeWindow = useCallback((id: WindowId) => dispatch({ type: 'MAXIMIZE', id }), []);
  const restoreWindow  = useCallback((id: WindowId) => dispatch({ type: 'RESTORE',  id }), []);
  const focusWindow    = useCallback((id: WindowId) => dispatch({ type: 'FOCUS',    id }), []);
  const moveWindow     = useCallback((id: WindowId, position: { x: number; y: number }) => dispatch({ type: 'MOVE', id, position }), []);
  const resizeWindow   = useCallback((id: WindowId, size: { width: number; height: number }) => dispatch({ type: 'RESIZE', id, size }), []);
  const resizePositionWindow = useCallback((id: WindowId, position: { x: number; y: number }, size: { width: number; height: number }) => dispatch({ type: 'RESIZE_POSITION', id, position, size }), []);
  const minimizeAllWindows = useCallback(() => dispatch({ type: 'MINIMIZE_ALL' }), []);
  const getWindow      = useCallback((id: WindowId) => windows.find((w) => w.id === id), [windows]);

  // When the user rotates to landscape on a phone (small height), maximize any
  // open windowed windows so they don't overflow the shrunken viewport.
  useEffect(() => {
    const handleResize = () => {
      if (typeof window === 'undefined') return;
      if (window.innerHeight < 500) {
        windowsRef.current
          .filter((w) => w.isOpen && !w.isMaximized && !w.isMinimized)
          .forEach((w) => dispatch({ type: 'MAXIMIZE', id: w.id }));
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <WindowContext.Provider value={{ windows, openWindow, closeWindow, minimizeWindow, maximizeWindow, restoreWindow, focusWindow, moveWindow, resizeWindow, resizePositionWindow, minimizeAllWindows, getWindow, recycledIds, restoreFromRecycle, emptyRecycleBin }}>
      {children}
    </WindowContext.Provider>
  );
}

export function useWindows() {
  const ctx = useContext(WindowContext);
  if (!ctx) throw new Error('useWindows must be used within WindowProvider');
  return ctx;
}
