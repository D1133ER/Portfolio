/**
 * Centralised storage utility — single source of truth for all
 * localStorage / sessionStorage keys and typed get/set helpers.
 *
 * Every key that any component stores is registered here so there
 * are no more magic strings scattered across the codebase.
 */

// ── Key registry ──────────────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  // localStorage (persists across sessions)
  WALLPAPER:        'nischal-wallpaper',
  MUTE:             'nischal-portfolio-muted',
  QUIZ_HIGH_SCORES: 'nischal-quiz-scores',
  MINES_BEST_TIMES: 'nischal-mines-times',
  THEME:            'nischal-xp-theme',
  ONBOARDING_DONE:  'nischal-onboarding-v1',  // versioned so future tours can re-show
  // sessionStorage (cleared on tab close)
  WINDOWS_STATE:    'nischal-portfolio-windows',
  HAS_VISITED:      'nischal-portfolio-visited',
} as const;

// ── Helpers ───────────────────────────────────────────────────────────────────
function safeRead<T>(store: Storage, key: string, fallback: T): T {
  try {
    const raw = store.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWrite<T>(store: Storage, key: string, value: T): void {
  try {
    store.setItem(key, JSON.stringify(value));
  } catch { /* quota exceeded / private mode — ignore */ }
}

// ── localStorage API ──────────────────────────────────────────────────────────
export const ls = {
  get<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback;
    return safeRead(localStorage, key, fallback);
  },
  set<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    safeWrite(localStorage, key, value);
  },
  remove(key: string): void {
    try { localStorage.removeItem(key); } catch { /* ignore */ }
  },
};

// ── sessionStorage API ────────────────────────────────────────────────────────
export const ss = {
  get<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback;
    return safeRead(sessionStorage, key, fallback);
  },
  set<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    safeWrite(sessionStorage, key, value);
  },
};

// ── Typed domain helpers ──────────────────────────────────────────────────────

export type QuizHighScores = {
  [dir in 'de→en' | 'en→de']?: {
    score:   number;
    correct: number;
    total:   number;
    streak:  number;
    date:    string;   // ISO string
  };
};

export type MinesBestTimes = {
  [diff in 'beginner' | 'intermediate' | 'expert']?: number; // seconds
};

export function getQuizHighScores(): QuizHighScores {
  return ls.get<QuizHighScores>(STORAGE_KEYS.QUIZ_HIGH_SCORES, {});
}

export function saveQuizHighScore(
  dir: 'de→en' | 'en→de',
  score: number,
  correct: number,
  total: number,
  streak: number,
): void {
  const scores = getQuizHighScores();
  const prev = scores[dir];
  if (!prev || score > prev.score) {
    ls.set(STORAGE_KEYS.QUIZ_HIGH_SCORES, {
      ...scores,
      [dir]: { score, correct, total, streak, date: new Date().toISOString() },
    });
  }
}

export function getMinesBestTimes(): MinesBestTimes {
  return ls.get<MinesBestTimes>(STORAGE_KEYS.MINES_BEST_TIMES, {});
}

export function saveMinesBestTime(
  difficulty: 'beginner' | 'intermediate' | 'expert',
  seconds: number,
): void {
  const times = getMinesBestTimes();
  const prev = times[difficulty];
  if (prev === undefined || seconds < prev) {
    ls.set(STORAGE_KEYS.MINES_BEST_TIMES, { ...times, [difficulty]: seconds });
  }
}
