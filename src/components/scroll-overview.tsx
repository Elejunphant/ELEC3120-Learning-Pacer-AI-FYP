'use client';

/**
 * Apple-style auto-playing overview for the welcome screen.
 *
 * Plays a sequence of 4 cinematic stages by itself — no scrolling
 * required. Each stage gets ~4.6s of screen time with smooth ease-in /
 * hold / ease-out transitions driven by a single rAF loop.
 *
 * Mobile-first: every typography scale uses `text-Xxl sm:text-Yxl`,
 * blur effects are reduced, and the layout collapses to a single
 * column under 640 px. Honours `prefers-reduced-motion`.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  GraduationCap,
  MessageSquare,
  Brain,
  Sparkles,
  Network,
  ChevronRight,
  X,
} from 'lucide-react';

interface ScrollOverviewProps {
  language: 'en' | 'zh';
  onGetStarted?: () => void;
}

/* ───── Smooth easing helpers ───── */
const easeOutQuart = (t: number) => {
  const x = Math.max(0, Math.min(1, t));
  return 1 - Math.pow(1 - x, 4);
};
const easeInOutCubic = (t: number) => {
  const x = Math.max(0, Math.min(1, t));
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};

/* ───── Per-stage timeline (seconds) ───── */
const STAGE_IN = 0.4;
const STAGE_HOLD = 1.3;
const STAGE_OUT = 0.3;
const STAGE_TOTAL = STAGE_IN + STAGE_HOLD + STAGE_OUT; // 2.0s per stage
const STAGE_COUNT = 4;

/** Compute reveal progress (0..1) and exit opacity (0..1) for a stage. */
function stagePhase(elapsed: number): { p: number; exit: number } {
  if (elapsed <= 0) return { p: 0, exit: 1 };
  if (elapsed <= STAGE_IN) return { p: easeOutQuart(elapsed / STAGE_IN), exit: 1 };
  if (elapsed <= STAGE_IN + STAGE_HOLD) return { p: 1, exit: 1 };
  const outT = (elapsed - STAGE_IN - STAGE_HOLD) / STAGE_OUT;
  return { p: 1, exit: 1 - easeInOutCubic(outT) };
}

export function ScrollOverview({ language, onGetStarted }: ScrollOverviewProps) {
  const t = (en: string, zh: string) => (language === 'en' ? en : zh);

  const [time, setTime] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const startRef = useRef<number | null>(null);
  const offsetRef = useRef(0);
  const rafRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  /* ─── Hydration: detect once-seen, motion preference, viewport ─── */
  useEffect(() => {
    setHydrated(true);
    try {
      if (sessionStorage.getItem('lp-overview-seen') === '1') setDismissed(true);
    } catch {}
    const mqMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mqMobile = window.matchMedia('(max-width: 639px)');
    const updateMotion = () => setReduceMotion(mqMotion.matches);
    const updateMobile = () => setIsMobile(mqMobile.matches);
    updateMotion(); updateMobile();
    mqMotion.addEventListener('change', updateMotion);
    mqMobile.addEventListener('change', updateMobile);
    return () => {
      mqMotion.removeEventListener('change', updateMotion);
      mqMobile.removeEventListener('change', updateMobile);
    };
  }, []);

  /* ─── If user prefers reduced motion, skip the show entirely ─── */
  useEffect(() => {
    if (reduceMotion) setDismissed(true);
  }, [reduceMotion]);

  /* ─── Mark seen as soon as the intro starts running ─── */
  useEffect(() => {
    if (!hydrated || dismissed) return;
    try { sessionStorage.setItem('lp-overview-seen', '1'); } catch {}
  }, [hydrated, dismissed]);

  /* ─── rAF loop — increments `time` smoothly. ─── */
  useEffect(() => {
    if (paused || dismissed || !hydrated) {
      cancelAnimationFrame(rafRef.current);
      return;
    }
    let active = true;
    startRef.current = performance.now();
    let baseOffset = offsetRef.current;
    const tick = (now: number) => {
      if (!active) return;
      const elapsed = (now - (startRef.current ?? now)) / 1000 + baseOffset;
      setTime(elapsed);
      offsetRef.current = elapsed;
      if (elapsed >= STAGE_COUNT * STAGE_TOTAL + 0.4) {
        setDismissed(true);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    // When the user returns to the tab, rAF unfreezes and `performance.now()`
    // can jump forward by seconds. Reset the start anchor so we don't skip
    // entire stages.
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        baseOffset = offsetRef.current;
        startRef.current = performance.now();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      active = false;
      cancelAnimationFrame(rafRef.current);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [paused, dismissed, hydrated]);

  /* ─── Stage maths ─── */
  const rawIndex = Math.min(STAGE_COUNT - 1, Math.floor(time / STAGE_TOTAL));
  const stageElapsed = time - rawIndex * STAGE_TOTAL;
  const { p: stageP, exit: stageExit } = stagePhase(stageElapsed);

  /* ─── Manual jump ─── */
  const jumpToStage = useCallback((idx: number) => {
    const target = idx * STAGE_TOTAL + 0.05;
    offsetRef.current = target;
    startRef.current = performance.now();
    setTime(target);
  }, []);

  const handleSkip = useCallback(() => {
    setDismissed(true);
    onGetStarted?.();
  }, [onGetStarted]);

  /* ─── Smooth fade-out → unmount ─── */
  const [unmounted, setUnmounted] = useState(false);
  useEffect(() => {
    if (!dismissed) return;
    const tm = setTimeout(() => setUnmounted(true), 550);
    return () => clearTimeout(tm);
  }, [dismissed]);

  if (unmounted) return null;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[100dvh] shrink-0 overflow-hidden flex items-center justify-center transition-opacity duration-500 ease-out"
      style={{
        opacity: dismissed ? 0 : 1,
        pointerEvents: dismissed ? 'none' : 'auto',
        contain: 'layout paint',
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      {/* Background glow — lighter on mobile to save GPU */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div
          className="absolute -top-32 sm:-top-40 left-1/2 -translate-x-1/2 w-[400px] h-[400px] sm:w-[700px] sm:h-[700px] rounded-full opacity-25 sm:opacity-30 dark:opacity-15 sm:dark:opacity-20"
          style={{
            background:
              'radial-gradient(circle, rgba(16,185,129,0.45) 0%, rgba(20,184,166,0.2) 40%, transparent 70%)',
            filter: isMobile ? 'blur(40px)' : 'blur(80px)',
            animation: 'pulseGlow 6s ease-in-out infinite',
          }}
        />
      </div>

      {/* Skip button — bigger tap target on mobile */}
      <button
        onClick={handleSkip}
        className="absolute top-3 right-3 sm:top-5 sm:right-5 z-20 inline-flex items-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-full text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-white/80 dark:bg-gray-900/60 backdrop-blur-sm border border-gray-200/60 dark:border-gray-800/60 transition-all active:scale-95 touch-manipulation"
        aria-label={t('Skip intro', '跳過介紹')}
      >
        <X className="h-3 w-3" />
        {t('Skip', '跳過')}
      </button>

      {/* Stages */}
      <div className="relative w-full h-full pb-24 sm:pb-32">
        {[0, 1, 2, 3].map((idx) => {
          const isCurrent = idx === rawIndex;
          const p = isCurrent ? stageP : 0;
          const exit = isCurrent ? stageExit : 0;
          return (
            <div
              key={idx}
              className="absolute inset-0 flex items-center justify-center px-4 sm:px-6 overflow-y-auto custom-scrollbar"
              style={{
                opacity: exit,
                pointerEvents: isCurrent ? 'auto' : 'none',
                transition: isCurrent ? 'none' : 'opacity 0.35s ease',
                willChange: isCurrent ? 'opacity, transform' : 'auto',
              }}
            >
              {idx === 0 && <StageHero p={p} t={t} />}
              {idx === 1 && <StageTutor p={p} t={t} />}
              {idx === 2 && <StagePractice p={p} t={t} />}
              {idx === 3 && <StageCTA p={p} t={t} onStart={handleSkip} />}
            </div>
          );
        })}
      </div>

      {/* Progress dots */}
      <div className="absolute bottom-5 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 dark:bg-gray-900/30 backdrop-blur-sm">
        {[0, 1, 2, 3].map((idx) => {
          const active = idx === rawIndex;
          const fill = idx < rawIndex ? 1 : active ? Math.min(1, stageElapsed / STAGE_TOTAL) : 0;
          return (
            <button
              key={idx}
              onClick={() => jumpToStage(idx)}
              className="group relative h-1.5 rounded-full overflow-hidden bg-gray-300/60 dark:bg-gray-700/60 hover:bg-gray-400/80 transition-all touch-manipulation"
              style={{ width: active ? 32 : 16 }}
              aria-label={`Stage ${idx + 1} of ${STAGE_COUNT}`}
            >
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-teal-500"
                style={{ width: `${fill * 100}%`, transition: 'width 0.1s linear' }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
 * Individual stages — every typography scale is mobile-first
 * ════════════════════════════════════════════════════════ */

function StageHero({ p, t }: { p: number; t: (en: string, zh: string) => string }) {
  const slide = (1 - p) * 24;
  const blur = (1 - p) * 6;
  return (
    <div
      className="text-center max-w-md sm:max-w-2xl"
      style={{
        opacity: p,
        transform: `translate3d(0, ${slide}px, 0)`,
        filter: blur > 0.1 ? `blur(${blur}px)` : 'none',
      }}
    >
      <div className="inline-flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-2xl shadow-emerald-500/30 mb-5 sm:mb-7 md:mb-8">
        <GraduationCap className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-white" />
      </div>
      <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-3 sm:mb-4 leading-[1.15] pb-2 bg-gradient-to-br from-gray-900 via-emerald-700 to-teal-600 dark:from-white dark:via-emerald-300 dark:to-teal-400 bg-clip-text text-transparent">
        LearningPacer
      </h1>
      <p className="text-base sm:text-xl md:text-2xl text-gray-500 dark:text-gray-400 font-light tracking-wide px-2">
        {t('Your AI tutor for ELEC3120.', '為 ELEC3120 而設嘅 AI 助教。')}
      </p>
      <p className="text-xs sm:text-sm md:text-base text-gray-400 dark:text-gray-500 mt-2 sm:mt-3">
        {t('Designed for HKUST. Built for you.', '為 HKUST 而設，為你而做。')}
      </p>
    </div>
  );
}

function StageTutor({ p, t }: { p: number; t: (en: string, zh: string) => string }) {
  const headerP = easeOutQuart(Math.max(0, p / 0.5));
  const cardP = easeOutQuart(Math.max(0, (p - 0.25) / 0.75));
  return (
    <div className="w-full max-w-md sm:max-w-2xl md:max-w-3xl">
      <div
        className="text-center mb-5 sm:mb-7 md:mb-8"
        style={{
          opacity: headerP,
          transform: `translate3d(0, ${(1 - headerP) * 24}px, 0)`,
        }}
      >
        <div className="inline-flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 mb-3 sm:mb-4">
          <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight mb-2 sm:mb-3 text-gray-900 dark:text-white leading-[1.15]">
          {t('Ask anything.', '隨時發問。')}
        </h2>
        <p className="text-sm sm:text-base md:text-lg text-gray-500 dark:text-gray-400 font-light px-3">
          {t(
            'Patient, lecture-grounded explanations — in 繁中 or English.',
            '耐心解答，緊貼 lecture notes — 中英隨意。'
          )}
        </p>
      </div>

      <div
        className="mx-auto rounded-2xl sm:rounded-3xl border border-gray-200/80 dark:border-gray-800/80 bg-white/85 dark:bg-gray-950/70 backdrop-blur shadow-2xl shadow-emerald-500/5 p-4 sm:p-6"
        style={{
          opacity: cardP,
          transform: `translate3d(0, ${(1 - cardP) * 36}px, 0) scale(${0.95 + cardP * 0.05})`,
          transformOrigin: 'center top',
        }}
      >
        <div className="flex items-start gap-2.5 sm:gap-3 mb-3 sm:mb-4">
          <div className="h-7 w-7 sm:h-8 sm:w-8 shrink-0 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-[11px] sm:text-xs font-medium text-emerald-700 dark:text-emerald-300">
            {t('You', '你')}
          </div>
          <div className="flex-1 rounded-xl sm:rounded-2xl bg-gray-100 dark:bg-gray-900 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-gray-800 dark:text-gray-200">
            {t('Explain TCP three-way handshake.', '解釋 TCP 三次握手。')}
          </div>
        </div>
        <div className="flex items-start gap-2.5 sm:gap-3">
          <div className="h-7 w-7 sm:h-8 sm:w-8 shrink-0 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <GraduationCap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
          </div>
          <div className="flex-1 rounded-xl sm:rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
            {t(
              'Sure! Imagine you are calling a friend. You say "Hi" (SYN), they reply "Hi back, can you hear me?" (SYN-ACK), and you confirm "Yes!" (ACK). Now the line is open…',
              '好！想像你打電話俾朋友：你講「喂」(SYN)，佢答「喂，聽到嗎？」(SYN-ACK)，你回「聽到！」(ACK)，條線就接通…'
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StagePractice({ p, t }: { p: number; t: (en: string, zh: string) => string }) {
  const headerP = easeOutQuart(Math.max(0, p / 0.5));
  const cardPs = [0, 1, 2].map((i) =>
    easeOutQuart(Math.max(0, (p - 0.2 - i * 0.13) / 0.5))
  );
  const items = [
    { icon: Brain, title: t('Quizzes', 'Quiz'), desc: t('500+ questions, instant feedback', '500+ 題，即時回饋'), grad: 'from-violet-500 to-purple-600' },
    { icon: Sparkles, title: t('Flashcards', '單詞卡'), desc: t('Spaced repetition that sticks', '間隔重複，記得實'), grad: 'from-amber-500 to-orange-600' },
    { icon: Network, title: t('8 Topics', '8 大主題'), desc: t('From physical layer to apps', '由物理層到應用層'), grad: 'from-cyan-500 to-blue-600' },
  ];
  return (
    <div className="w-full max-w-md sm:max-w-3xl md:max-w-5xl">
      <div
        className="text-center mb-6 sm:mb-9 md:mb-10"
        style={{
          opacity: headerP,
          transform: `translate3d(0, ${(1 - headerP) * 24}px, 0)`,
        }}
      >
        <div className="inline-flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-violet-50 dark:bg-violet-950/40 mb-3 sm:mb-4">
          <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-violet-600 dark:text-violet-400" />
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight mb-2 sm:mb-3 text-gray-900 dark:text-white leading-[1.15]">
          {t('Practice. Master.', '練習。掌握。')}
        </h2>
        <p className="text-sm sm:text-base md:text-lg text-gray-500 dark:text-gray-400 font-light px-3">
          {t(
            'Adaptive quizzes, flashcards and a Pomodoro timer — all built in.',
            '自適應 quiz、單詞卡、番茄鐘，全部內建。'
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {items.map((c, i) => {
          const cp = cardPs[i];
          const Icon = c.icon;
          return (
            <div
              key={c.title}
              className="rounded-2xl sm:rounded-3xl border border-gray-200/80 dark:border-gray-800/80 bg-white/85 dark:bg-gray-950/70 backdrop-blur p-4 sm:p-6 shadow-xl shadow-black/5"
              style={{
                opacity: cp,
                transform: `translate3d(0, ${(1 - cp) * 32}px, 0) scale(${0.96 + cp * 0.04})`,
                transformOrigin: 'center top',
              }}
            >
              <div className={`inline-flex h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-gradient-to-br ${c.grad} items-center justify-center shadow-lg mb-3 sm:mb-4`}>
                <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-1 text-gray-900 dark:text-white">{c.title}</h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{c.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StageCTA({ p, t, onStart }: { p: number; t: (en: string, zh: string) => string; onStart: () => void }) {
  const headerP = easeOutQuart(Math.max(0, p / 0.6));
  const btnP = easeOutQuart(Math.max(0, (p - 0.4) / 0.6));
  return (
    <div className="text-center max-w-md sm:max-w-2xl md:max-w-3xl">
      <h2
        className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4 sm:mb-5 leading-[1.15] pb-2 bg-gradient-to-br from-gray-900 via-emerald-700 to-teal-600 dark:from-white dark:via-emerald-300 dark:to-teal-400 bg-clip-text text-transparent"
        style={{
          opacity: headerP,
          transform: `translate3d(0, ${(1 - headerP) * 24}px, 0)`,
        }}
      >
        {t('Ready to ace ELEC3120?', '準備好 ace ELEC3120 未？')}
      </h2>
      <p
        className="text-sm sm:text-base md:text-xl text-gray-500 dark:text-gray-400 font-light mb-6 sm:mb-8 md:mb-10 px-3"
        style={{
          opacity: headerP,
          transform: `translate3d(0, ${(1 - headerP) * 24}px, 0)`,
        }}
      >
        {t('Type your first question below and let’s get started.', '喺下面打你第一條問題，我哋開始啦。')}
      </p>
      <button
        onClick={onStart}
        className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-sm sm:text-base font-medium shadow-xl shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/40 hover:scale-[1.03] active:scale-95 transition-all touch-manipulation"
        style={{
          opacity: btnP,
          transform: `translate3d(0, ${(1 - btnP) * 16}px, 0)`,
        }}
      >
        {t('Start chatting', '開始對話')}
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
