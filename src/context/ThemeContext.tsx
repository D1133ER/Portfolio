'use client';

/**
 * XP Theme System
 *
 * Five classic Windows XP colour themes. Each theme overrides a set of
 * CSS custom properties on :root via an injected <style> tag so that
 * XPWindow, Taskbar, and any other themed component can read them
 * WITHOUT importing this context — just reference var(--tb-from) etc.
 *
 * Only the Personalize dialog (Desktop.tsx) needs useTheme().
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ls, STORAGE_KEYS } from '@/utils/storage';

// ── Theme definition ──────────────────────────────────────────────────────────
export interface XPTheme {
  id:            string;
  name:          string;
  /** Short CSS background used as the swatch preview */
  swatch:        string;
  // Active title bar stops
  tbFrom:        string;
  tbMid:         string;
  tbTo:          string;
  // Inactive title bar stops
  tbIaFrom:      string;
  tbIaTo:        string;
  // Taskbar
  tkFrom:        string;
  tkTo:          string;
  // Start button (normal + pressed)
  stFrom:        string;
  stTo:          string;
  stActiveFrom:  string;
  stActiveTo:    string;
  // Accent / selection colour
  accent:        string;
  // Window body background
  winBg:         string;
  // Window border
  winBorder:     string;
}

export const THEMES: Record<string, XPTheme> = {
  luna: {
    id: 'luna', name: 'Luna',
    swatch: 'linear-gradient(135deg,#2c6fca 0%,#5fad2a 60%,#ece9d8 100%)',
    tbFrom:'#2c6fca', tbMid:'#1748b0', tbTo:'#1244a8',
    tbIaFrom:'#7a96c2', tbIaTo:'#4a6490',
    tkFrom:'#2573c2', tkTo:'#1244a0',
    stFrom:'#5fad2a', stTo:'#2d7012',
    stActiveFrom:'#2d6e10', stActiveTo:'#163d06',
    accent:'#316ac5', winBg:'#ece9d8', winBorder:'#0a246a',
  },
  royale: {
    id: 'royale', name: 'Royale',
    swatch: 'linear-gradient(135deg,#1a3a6b 0%,#0d2247 60%,#e8e4d8 100%)',
    tbFrom:'#1e4d8c', tbMid:'#0d2c5e', tbTo:'#091830',
    tbIaFrom:'#5a6e8a', tbIaTo:'#3a4e6a',
    tkFrom:'#0d2c5e', tkTo:'#060f1e',
    stFrom:'#1a5c9a', stTo:'#0a3060',
    stActiveFrom:'#0a3060', stActiveTo:'#061020',
    accent:'#2a5cbf', winBg:'#e8e4d8', winBorder:'#061830',
  },
  silver: {
    id: 'silver', name: 'Silver',
    swatch: 'linear-gradient(135deg,#9aa0b0 0%,#727a8a 60%,#f0f0f0 100%)',
    tbFrom:'#9aa0b0', tbMid:'#727a8a', tbTo:'#5a6070',
    tbIaFrom:'#b0b4bc', tbIaTo:'#8a8e98',
    tkFrom:'#8a8e98', tkTo:'#5a5e68',
    stFrom:'#9aa0b0', stTo:'#6a707a',
    stActiveFrom:'#6a707a', stActiveTo:'#4a505a',
    accent:'#6a709a', winBg:'#f0f0f0', winBorder:'#4a505a',
  },
  zune: {
    id: 'zune', name: 'Zune',
    swatch: 'linear-gradient(135deg,#9e2020 0%,#c04020 60%,#f0ece8 100%)',
    tbFrom:'#9e2020', tbMid:'#7a1010', tbTo:'#5a0808',
    tbIaFrom:'#8a5a5a', tbIaTo:'#6a3a3a',
    tkFrom:'#7a1010', tkTo:'#3d0707',
    stFrom:'#c04020', stTo:'#8b1510',
    stActiveFrom:'#8b1510', stActiveTo:'#5a0a08',
    accent:'#c04020', winBg:'#f0ece8', winBorder:'#4a0808',
  },
  olive: {
    id: 'olive', name: 'Olive Green',
    swatch: 'linear-gradient(135deg,#6a7a4a 0%,#506040 60%,#ece8dc 100%)',
    tbFrom:'#6a7a4a', tbMid:'#506040', tbTo:'#3a4a2a',
    tbIaFrom:'#8a9070', tbIaTo:'#6a7050',
    tkFrom:'#506040', tkTo:'#2a3a1a',
    stFrom:'#7a8a5a', stTo:'#4a5a2a',
    stActiveFrom:'#4a5a2a', stActiveTo:'#2a3a10',
    accent:'#5a6a3a', winBg:'#ece8dc', winBorder:'#2a3a1a',
  },
} as const;

export type ThemeId = keyof typeof THEMES;
const DEFAULT_THEME: ThemeId = 'luna';

// ── Context ───────────────────────────────────────────────────────────────────
interface ThemeCtx { themeId: ThemeId; theme: XPTheme; setTheme: (id: ThemeId) => void; }
const ThemeContext = createContext<ThemeCtx | null>(null);

function buildCssVars(t: XPTheme): string {
  return `
:root {
  --tb-from:${t.tbFrom};--tb-mid:${t.tbMid};--tb-to:${t.tbTo};
  --tb-ia-from:${t.tbIaFrom};--tb-ia-to:${t.tbIaTo};
  --tk-from:${t.tkFrom};--tk-to:${t.tkTo};
  --st-from:${t.stFrom};--st-to:${t.stTo};
  --st-active-from:${t.stActiveFrom};--st-active-to:${t.stActiveTo};
  --accent:${t.accent};--win-bg:${t.winBg};--win-border:${t.winBorder};
}`.trim();
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>(DEFAULT_THEME);

  // Hydrate from localStorage after mount
  useEffect(() => {
    const saved = ls.get<string>(STORAGE_KEYS.THEME, DEFAULT_THEME);
    if (saved in THEMES) setThemeId(saved as ThemeId);
  }, []);

  const setTheme = useCallback((id: ThemeId) => {
    setThemeId(id);
    ls.set(STORAGE_KEYS.THEME, id);
  }, []);

  const theme = THEMES[themeId];

  return (
    <ThemeContext.Provider value={{ themeId, theme, setTheme }}>
      {/* Inject live CSS variable overrides — zero re-renders in children */}
      <style dangerouslySetInnerHTML={{ __html: buildCssVars(theme) }} />
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
