'use client';

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { WindowId, WindowState } from '@/types';

const defaultWindows: WindowState[] = [
  { id: 'about',      title: 'System Properties',              icon: '🖥️', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 10, position: { x: 80,  y: 40 }, size: { width: 420, height: 420 } },
  { id: 'experience', title: 'My Experience — C:\\Work History', icon: '📁', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 10, position: { x: 110, y: 55 }, size: { width: 540, height: 380 } },
  { id: 'skills',     title: 'My Skills — System Properties',   icon: '⚙️', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 10, position: { x: 130, y: 70 }, size: { width: 420, height: 460 } },
  { id: 'education',  title: 'Education — Academic Records',    icon: '🎓', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 10, position: { x: 150, y: 90 }, size: { width: 400, height: 380 } },
  { id: 'contact',    title: 'New Message',                     icon: '✉️', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 10, position: { x: 100, y: 50 }, size: { width: 510, height: 560 } },
  { id: 'projects',   title: 'My Projects — File Manager',      icon: '📂', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 10, position: { x: 120, y: 60 }, size: { width: 520, height: 560 } },
  { id: 'terminal',   title: 'Command Prompt',                  icon: '💻', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 10, position: { x: 160, y: 80 }, size: { width: 540, height: 380 } },
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
  | { type: 'CLOSE_ALL' };

let zCounter = 10;

function reducer(state: WindowState[], action: Action): WindowState[] {
  switch (action.type) {
    case 'OPEN':
      zCounter++;
      return state.map((w) =>
        w.id === action.id ? { ...w, isOpen: true, isMinimized: false, isMaximized: false, zIndex: zCounter } : w
      );
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
    case 'CLOSE_ALL':
      return state.map((w) => ({ ...w, isOpen: false, isMinimized: false, isMaximized: false }));
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
  getWindow:     (id: WindowId) => WindowState | undefined;
}

const WindowContext = createContext<WindowContextType | null>(null);

export function WindowProvider({ children }: { children: React.ReactNode }) {
  const [windows, dispatch] = useReducer(reducer, defaultWindows);

  const openWindow     = useCallback((id: WindowId) => dispatch({ type: 'OPEN',     id }), []);
  const closeWindow    = useCallback((id: WindowId) => dispatch({ type: 'CLOSE',    id }), []);
  const minimizeWindow = useCallback((id: WindowId) => dispatch({ type: 'MINIMIZE', id }), []);
  const maximizeWindow = useCallback((id: WindowId) => dispatch({ type: 'MAXIMIZE', id }), []);
  const restoreWindow  = useCallback((id: WindowId) => dispatch({ type: 'RESTORE',  id }), []);
  const focusWindow    = useCallback((id: WindowId) => dispatch({ type: 'FOCUS',    id }), []);
  const moveWindow     = useCallback((id: WindowId, position: { x: number; y: number }) => dispatch({ type: 'MOVE', id, position }), []);
  const resizeWindow   = useCallback((id: WindowId, size: { width: number; height: number }) => dispatch({ type: 'RESIZE', id, size }), []);
  const getWindow      = useCallback((id: WindowId) => windows.find((w) => w.id === id), [windows]);

  return (
    <WindowContext.Provider value={{ windows, openWindow, closeWindow, minimizeWindow, maximizeWindow, restoreWindow, focusWindow, moveWindow, resizeWindow, getWindow }}>
      {children}
    </WindowContext.Provider>
  );
}

export function useWindows() {
  const ctx = useContext(WindowContext);
  if (!ctx) throw new Error('useWindows must be used within WindowProvider');
  return ctx;
}
