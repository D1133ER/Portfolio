'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import XPWindow from '../XPWindow';
import { germanWords } from '@/data/portfolio';
import { getQuizHighScores, saveQuizHighScore, type QuizHighScores } from '@/utils/storage';

type Mode      = 'menu' | 'playing' | 'result';
type Direction = 'de→en' | 'en→de';

interface WrongAnswer {
  question:      string;
  yourAnswer:    string;
  correctAnswer: string;
  category:      string;
}

const BADGES = [
  { threshold: 5,  label: 'Anfänger',           icon: '🌱', desc: 'Beginner — Getting started!' },
  { threshold: 10, label: 'Lernender',           icon: '📖', desc: 'Learner — Keep it up!' },
  { threshold: 16, label: 'Fortgeschrittener',   icon: '⚡', desc: 'Advanced — Impressive!' },
  { threshold: 22, label: 'Polyglot',            icon: '🏆', desc: 'Polyglot — Mastered them all!' },
];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function buildChoices(correct: string, pool: string[]): string[] {
  const wrong = shuffle(pool.filter((w) => w !== correct)).slice(0, 3);
  return shuffle([correct, ...wrong]);
}

function getBadge(n: number) {
  return [...BADGES].reverse().find((b) => n >= b.threshold) ?? null;
}

export default function QuizWindow() {
  const [mode,        setMode]        = useState<Mode>('menu');
  const [direction,   setDirection]   = useState<Direction>('de→en');
  const [questions,   setQuestions]   = useState<typeof germanWords>([]);
  const [qIndex,      setQIndex]      = useState(0);
  const [choices,     setChoices]     = useState<string[]>([]);
  const [selected,    setSelected]    = useState<string | null>(null);
  const [correct,     setCorrect]     = useState(0);
  const [streak,      setStreak]      = useState(0);
  const [bestStreak,  setBestStreak]  = useState(0);
  const [score,       setScore]       = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState<WrongAnswer[]>([]);
  const [highScores,  setHighScores]  = useState<QuizHighScores>({});
  const [reviewTab,   setReviewTab]   = useState<'summary' | 'mistakes'>('summary');

  // Speed bonus: track time per question
  const questionStartRef = useRef<number>(Date.now());

  // Load high scores on mount
  useEffect(() => { setHighScores(getQuizHighScores()); }, []);

  const startQuiz = useCallback((dir: Direction) => {
    setDirection(dir);
    const qs = shuffle(germanWords);
    setQuestions(qs);
    setQIndex(0);
    setCorrect(0);
    setStreak(0);
    setBestStreak(0);
    setScore(0);
    setSelected(null);
    setWrongAnswers([]);
    setReviewTab('summary');
    setMode('playing');
    questionStartRef.current = Date.now();
  }, []);

  // Build choices whenever question changes
  useEffect(() => {
    if (mode !== 'playing' || !questions[qIndex]) return;
    const current = questions[qIndex];
    const pool = direction === 'de→en'
      ? germanWords.map((w) => w.en)
      : germanWords.map((w) => w.de);
    setChoices(buildChoices(direction === 'de→en' ? current.en : current.de, pool));
    setSelected(null);
    questionStartRef.current = Date.now();
  }, [qIndex, mode, questions, direction]);

  const handleAnswer = useCallback((choice: string) => {
    if (selected !== null) return;
    setSelected(choice);

    const current = questions[qIndex];
    const answer  = direction === 'de→en' ? current.en : current.de;
    const elapsed = (Date.now() - questionStartRef.current) / 1000;
    const isRight = choice === answer;

    if (isRight) {
      const newStreak = streak + 1;
      const newBest   = Math.max(bestStreak, newStreak);
      // Speed bonus: < 3s = +5 pts, streak >= 3 = double base
      const basePoints = newStreak >= 3 ? 20 : 10;
      const speedBonus = elapsed < 3 ? 5 : 0;
      setStreak(newStreak);
      setBestStreak(newBest);
      setCorrect((c) => c + 1);
      setScore((s) => s + basePoints + speedBonus);
    } else {
      setStreak(0);
      const question = direction === 'de→en' ? current.de : current.en;
      setWrongAnswers((prev) => [
        ...prev,
        { question, yourAnswer: choice, correctAnswer: answer, category: current.category },
      ]);
    }

    setTimeout(() => {
      if (qIndex + 1 >= questions.length) {
        // Compute final correct count including this answer
        const finalCorrect = isRight ? correct + 1 : correct;
        const finalScore   = isRight ? score + (streak + 1 >= 3 ? 20 : 10) + (elapsed < 3 ? 5 : 0) : score;
        const finalStreak  = isRight ? Math.max(bestStreak, streak + 1) : bestStreak;
        saveQuizHighScore(direction, finalScore, finalCorrect, questions.length, finalStreak);
        setHighScores(getQuizHighScores());
        setMode('result');
      } else {
        setQIndex((i) => i + 1);
      }
    }, 900);
  }, [selected, questions, qIndex, direction, streak, bestStreak, correct, score]);

  const current = questions[qIndex];
  const answer  = current ? (direction === 'de→en' ? current.en : current.de) : '';
  const finalCorrect = mode === 'result' ? correct : 0;

  return (
    <XPWindow id="quiz" statusText="🇩🇪  Deutsch Lernspiel — Vocabulary Quiz">
      <div className="p-3 h-full overflow-auto" style={{ fontFamily: 'Tahoma, sans-serif' }}>

        {/* ── MENU ── */}
        {mode === 'menu' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4 py-4">
            <div className="text-center mb-2">
              <div className="text-3xl mb-1">🇩🇪</div>
              <div className="font-bold text-[14px] text-[#0a246a]">Deutsch Lernspiel</div>
              <div className="text-[11px] text-[#555] mt-1">
                {germanWords.length} words · {[...new Set(germanWords.map((w) => w.category))].length} categories
              </div>
            </div>

            <div className="w-full max-w-[280px] flex flex-col gap-2">
              {([
                ['de→en', '🇩🇪 German → English', 'See the German, pick the English'],
                ['en→de', '🇬🇧 English → German', 'See the English, pick the German'],
              ] as [Direction, string, string][]).map(([dir, label, sub]) => {
                const hs = highScores[dir];
                return (
                  <motion.button key={dir}
                    className="w-full text-left px-4 py-3 border border-[#b8b5a8] text-[11px] cursor-pointer"
                    style={{ background: 'linear-gradient(180deg,#ece9d8 0%,#d4d0c8 100%)' }}
                    whileHover={{ filter: 'brightness(1.06)' }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => startQuiz(dir)}
                  >
                    <div className="font-bold text-[12px]">{label}</div>
                    <div className="text-[#666] text-[10px]">{sub}</div>
                    {hs && (
                      <div className="flex gap-3 mt-1 text-[9px] text-[#0a246a]">
                        <span>🏆 Best: <b>{hs.score} pts</b></span>
                        <span>✅ {hs.correct}/{hs.total}</span>
                        <span>🔥 ×{hs.streak}</span>
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Badge guide */}
            <div className="mt-2 w-full max-w-[280px] border border-[#b8b5a8] p-3" style={{ background: '#dde4f0' }}>
              <div className="text-[10px] font-bold text-[#0a246a] mb-2">🏅 Achievement Badges</div>
              <div className="flex flex-col gap-1.5">
                {BADGES.map((b) => (
                  <div key={b.label} className="flex items-center gap-2 text-[10px]">
                    <span className="text-base">{b.icon}</span>
                    <span className="font-bold w-[120px]">{b.label}</span>
                    <span className="text-[#555]">— {b.threshold}+ correct</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── PLAYING ── */}
        {mode === 'playing' && current && (
          <div className="flex flex-col gap-3">
            {/* Progress */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-[#d4d0c8] border border-[#9e9b91] overflow-hidden">
                <div className="h-full transition-all duration-300"
                  style={{ width: `${(qIndex / questions.length) * 100}%`, background: '#316ac5' }} />
              </div>
              <span className="text-[10px] text-[#555] w-14 text-right">{qIndex + 1} / {questions.length}</span>
            </div>

            {/* Stats row */}
            <div className="flex gap-2 text-[10px] flex-wrap">
              <span className="px-2 py-0.5 border border-[#b8b5a8]" style={{ background: '#ece9d8' }}>✅ {correct}</span>
              {wrongAnswers.length > 0 && (
                <span className="px-2 py-0.5 border border-red-200 text-red-700" style={{ background: '#fff0f0' }}>
                  ❌ {wrongAnswers.length}
                </span>
              )}
              {streak >= 2 && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="px-2 py-0.5 border border-orange-300 text-orange-700 font-bold"
                  style={{ background: '#fff3e0' }}>
                  🔥 ×{streak}
                </motion.span>
              )}
              <span className="px-2 py-0.5 ml-auto border border-[#b8b5a8]" style={{ background: '#ece9d8' }}>⭐ {score}</span>
            </div>

            {/* Category + question */}
            <div className="text-[10px] text-[#777]">
              Category: <span className="font-bold text-[#0a246a]">{current.category}</span>
            </div>
            <div className="p-4 border-2 border-[#316ac5] text-center"
              style={{ background: 'linear-gradient(180deg,#dde9ff 0%,#c8d8f5 100%)' }}>
              <div className="text-[10px] text-[#555] mb-1">
                {direction === 'de→en' ? 'What does this German word mean?' : 'What is this in German?'}
              </div>
              <div className="text-[22px] font-bold text-[#0a246a]">
                {direction === 'de→en' ? current.de : current.en}
              </div>
            </div>

            {/* Choices */}
            <div className="grid grid-cols-2 gap-2">
              {choices.map((ch) => {
                const isCorrect  = ch === answer;
                const isSelected = ch === selected;
                let bg = 'linear-gradient(180deg,#ece9d8 0%,#d4d0c8 100%)';
                let border = '#b8b5a8';
                if (selected !== null) {
                  if (isCorrect)         { bg = 'linear-gradient(180deg,#c8f5d0 0%,#a0e0b0 100%)'; border = '#2e7d32'; }
                  else if (isSelected)   { bg = 'linear-gradient(180deg,#ffd5d5 0%,#ffb0b0 100%)'; border = '#c62828'; }
                }
                return (
                  <motion.button key={ch}
                    className="p-2.5 text-[11px] border-2 cursor-pointer text-left"
                    style={{ background: bg, borderColor: border }}
                    whileHover={selected === null ? { filter: 'brightness(1.07)' } : {}}
                    whileTap={selected === null ? { scale: 0.97 } : {}}
                    onClick={() => handleAnswer(ch)}
                    aria-label={`Answer: ${ch}`}
                  >
                    {ch}
                    {selected !== null && isCorrect  && <span className="ml-1">✓</span>}
                    {selected !== null && isSelected && !isCorrect && <span className="ml-1">✗</span>}
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── RESULT ── */}
        {mode === 'result' && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4 py-4">
            <div className="text-3xl">
              {finalCorrect >= questions.length * 0.8 ? '🎉' : finalCorrect >= questions.length * 0.5 ? '👍' : '📖'}
            </div>
            <div className="font-bold text-[14px] text-[#0a246a] text-center">Quiz Complete!</div>

            {/* Result tabs */}
            <div className="w-full max-w-[300px]">
              <div className="flex gap-0.5 border-b border-[#b8b5a8] mb-2">
                {(['summary', 'mistakes'] as const).map((t) => (
                  <button key={t} onClick={() => setReviewTab(t)}
                    className={`px-3 py-1 text-[10px] capitalize border-t border-x cursor-pointer ${
                      reviewTab === t ? 'bg-[#ece9d8] border-[#b8b5a8] font-bold -mb-px z-10 relative' : 'bg-[#d4d0c8] border-[#b8b5a8] text-[#444]'
                    }`}
                  >
                    {t === 'mistakes' ? `❌ Mistakes (${wrongAnswers.length})` : '📊 Summary'}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {reviewTab === 'summary' && (
                  <motion.div key="summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {/* Score breakdown */}
                    <div className="w-full border border-[#b8b5a8] p-3" style={{ background: '#ece9d8' }}>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span>Correct answers</span><span className="font-bold">{finalCorrect} / {questions.length}</span>
                      </div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span>Best streak</span><span className="font-bold">🔥 ×{bestStreak}</span>
                      </div>
                      <div className="flex justify-between text-[11px] mb-2">
                        <span>Final score</span><span className="font-bold text-[#0a246a]">⭐ {score}</span>
                      </div>
                      <div className="h-2 bg-[#d4d0c8] border border-[#9e9b91] overflow-hidden">
                        <motion.div className="h-full bg-[#316ac5]"
                          initial={{ width: 0 }}
                          animate={{ width: `${(finalCorrect / questions.length) * 100}%` }}
                          transition={{ duration: 0.8 }} />
                      </div>
                    </div>

                    {/* Personal best indicator */}
                    {(() => {
                      const hs = highScores[direction];
                      const isNewBest = !hs || score >= hs.score;
                      return isNewBest ? (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 400, delay: 0.2 }}
                          className="mt-2 text-center text-[10px] font-bold text-yellow-700 border border-yellow-400 py-1"
                          style={{ background: '#fffde7' }}>
                          🌟 New Personal Best!
                        </motion.div>
                      ) : (
                        <div className="mt-2 text-center text-[10px] text-[#555]">
                          Personal best: {hs?.score} pts ({hs?.correct}/{hs?.total})
                        </div>
                      );
                    })()}
                  </motion.div>
                )}

                {reviewTab === 'mistakes' && (
                  <motion.div key="mistakes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {wrongAnswers.length === 0 ? (
                      <div className="text-center py-4 text-[11px] text-green-700 font-bold">
                        🎉 Perfect score — no mistakes!
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1.5 max-h-[180px] overflow-y-auto">
                        {wrongAnswers.map((wa, i) => (
                          <div key={i} className="border border-[#e0ddd5] p-2 text-[10px]"
                            style={{ background: '#fff8f8' }}>
                            <div className="font-bold text-[#0a246a]">{wa.question}</div>
                            <div className="text-red-600">✗ You said: <em>{wa.yourAnswer}</em></div>
                            <div className="text-green-700">✓ Correct: <strong>{wa.correctAnswer}</strong></div>
                            <div className="text-[9px] text-[#999] mt-0.5">{wa.category}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Badge */}
            {getBadge(finalCorrect) && (() => {
              const b = getBadge(finalCorrect)!;
              return (
                <motion.div initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.4 }}
                  className="border-2 border-yellow-400 px-5 py-3 text-center"
                  style={{ background: 'linear-gradient(135deg,#fffde7 0%,#fff59d 100%)' }}>
                  <div className="text-3xl mb-1">{b.icon}</div>
                  <div className="font-bold text-[13px] text-[#795548]">Badge Unlocked!</div>
                  <div className="font-bold text-[12px] text-[#0a246a]">{b.label}</div>
                  <div className="text-[10px] text-[#555]">{b.desc}</div>
                </motion.div>
              );
            })()}

            <div className="flex gap-2 mt-2">
              <motion.button className="px-5 py-1.5 text-[11px] border border-[#888] font-bold cursor-pointer"
                style={{ background: 'linear-gradient(180deg,#ece9d8 0%,#d4d0c8 100%)' }}
                whileHover={{ filter: 'brightness(1.07)' }} whileTap={{ scale: 0.95 }}
                onClick={() => startQuiz(direction)}>
                🔄 Play Again
              </motion.button>
              <motion.button className="px-5 py-1.5 text-[11px] border border-[#888] cursor-pointer"
                style={{ background: 'linear-gradient(180deg,#ece9d8 0%,#d4d0c8 100%)' }}
                whileHover={{ filter: 'brightness(1.07)' }} whileTap={{ scale: 0.95 }}
                onClick={() => setMode('menu')}>
                ← Menu
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </XPWindow>
  );
}
