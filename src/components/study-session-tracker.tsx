'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Clock, X, RotateCcw, Timer, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFloatingDrag } from '@/hooks/use-floating-drag';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
// ── Helpers ────────────────────────────────────────────────────

function getTodayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function getDayHistoryKey(dateStr: string): string {
  return `lp-study-history-${dateStr}`;
}

function loadDaySeconds(dateStr: string): number {
  if (typeof window === 'undefined') return 0;
  try {
    const val = localStorage.getItem(getDayHistoryKey(dateStr));
    return val ? parseInt(val, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

function saveDaySeconds(dateStr: string, seconds: number) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getDayHistoryKey(dateStr), String(seconds));
  } catch {
    // silently fail
  }
}

function getWeekDays(): string[] {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const monday = new Date(now);
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  monday.setDate(now.getDate() + diff);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
}

function formatTimer(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatHM(secs: number, lang: 'en' | 'zh'): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h > 0 && m > 0) return lang === 'en' ? `${h}h ${m}m` : `${h}時${m}分`;
  if (h > 0) return lang === 'en' ? `${h}h` : `${h}時`;
  return lang === 'en' ? `${m}m` : `${m}分`;
}

function getTodayWeekIndex(): number {
  const dow = new Date().getDay(); // 0=Sun
  return dow === 0 ? 6 : dow - 1; // Mon=0, Tue=1, ..., Sun=6
}

const DAY_LABELS_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_LABELS_ZH = ['一', '二', '三', '四', '五', '六', '日'];

// ── Stat Card Sub-component ────────────────────────────────────
function StatCard({
  icon,
  label,
  value,
  bgClass,
  labelClass,
  valueClass,
  mono = false,
  small = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  bgClass: string;
  labelClass: string;
  valueClass: string;
  mono?: boolean;
  small?: boolean;
}) {
  return (
    <div className={`rounded-xl ${bgClass} p-2.5 text-center`}>
      <div className="flex items-center justify-center gap-1 mb-1">
        {icon}
        <span className={`text-[10px] font-medium ${labelClass} uppercase tracking-wide`}>
          {label}
        </span>
      </div>
      <p className={`${small ? 'text-[11px]' : 'text-sm'} font-bold ${valueClass} ${mono ? 'tabular-nums' : ''}`}>
        {value}
      </p>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────
interface StudySessionTrackerProps {
  language: 'en' | 'zh';
}

export function StudySessionTracker({ language }: StudySessionTrackerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [baseSeconds, setBaseSeconds] = useState(0);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [weekData, setWeekData] = useState<number[]>(Array.from({ length: 7 }, () => 0));

  const sessionStartRef = useRef(Date.now());
  const lastSaveTimeRef = useRef(Date.now());
  const baseSecondsRef = useRef(0);

  // ── Draggable floating widget (framer-motion) ────────────────
  const { x, y, hydrated, isDragging, wasDragged, containerRef, dragProps } = useFloatingDrag({
    storageKey: 'lp-study-tracker-position',
    defaultPosition: () => ({ x: Math.max(0, window.innerWidth - 200), y: 64 }),
  });

  // ── Initialize from localStorage ──
  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      const loaded = loadDaySeconds(getTodayKey());
      if (!cancelled) {
        baseSecondsRef.current = loaded;
        setBaseSeconds(loaded);
        sessionStartRef.current = Date.now();
        lastSaveTimeRef.current = Date.now();
      }
      const days = getWeekDays();
      const data = days.map((d) => loadDaySeconds(d));
      if (!cancelled) setWeekData(data);
    };
    init();
    return () => { cancelled = true; };
  }, []);

  // ── Tick every second for live session display ──
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.max(0, Math.floor((Date.now() - sessionStartRef.current) / 1000));
      setSessionSeconds(elapsed);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ── Persist every 30 seconds ──
  useEffect(() => {
    const saveInterval = setInterval(() => {
      const elapsed = Math.max(0, Math.floor((Date.now() - lastSaveTimeRef.current) / 1000));
      const newBase = baseSecondsRef.current + elapsed;
      saveDaySeconds(getTodayKey(), newBase);
      baseSecondsRef.current = newBase;
      lastSaveTimeRef.current = Date.now();
      setBaseSeconds(newBase);
      // Refresh week data
      const days = getWeekDays();
      const data = days.map((d) => loadDaySeconds(d));
      setWeekData(data);
    }, 30000);
    return () => clearInterval(saveInterval);
  }, []);

  // ── Save on page unload & React unmount ──
  useEffect(() => {
    const handleUnload = () => {
      const elapsed = Math.max(0, Math.floor((Date.now() - lastSaveTimeRef.current) / 1000));
      saveDaySeconds(getTodayKey(), baseSecondsRef.current + elapsed);
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      const elapsed = Math.max(0, Math.floor((Date.now() - lastSaveTimeRef.current) / 1000));
      saveDaySeconds(getTodayKey(), baseSecondsRef.current + elapsed);
    };
  }, []);

  // ── Refresh week data when panel opens ──
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    const refresh = async () => {
      const days = getWeekDays();
      const data = days.map((d) => loadDaySeconds(d));
      if (!cancelled) setWeekData(data);
    };
    refresh();
    return () => { cancelled = true; };
  }, [isOpen]);

  // ── Close panel on click outside ──
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        const target = e.target as HTMLElement;
        if (!target.closest('[data-study-tracker-toggle]')) {
          setIsOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  // ── Computed values ──
  const totalToday = baseSeconds + sessionSeconds;
  const todayIndex = getTodayWeekIndex();

  // Merge live today value into week data for chart rendering
  const chartData = weekData.map((val, i) => (i === todayIndex ? totalToday : val));
  const maxWeekTime = Math.max(...chartData, 60); // Minimum scale: 60s

  const bestDayIdx = chartData.reduce(
    (best, val, idx) => (val > chartData[best] ? idx : best),
    0,
  );
  const bestDayTime = chartData[bestDayIdx];

  // ── Reset week handler ──
  const handleResetWeek = useCallback(() => {
    const days = getWeekDays();
    for (const d of days) {
      try {
        localStorage.removeItem(getDayHistoryKey(d));
      } catch {
        /* ignore */
      }
    }
    baseSecondsRef.current = 0;
    setBaseSeconds(0);
    sessionStartRef.current = Date.now();
    lastSaveTimeRef.current = Date.now();
    setWeekData(Array.from({ length: 7 }, () => 0));
    setIsOpen(false);
  }, []);

  // ── Bilingual labels ──
  const t = {
    title: language === 'en' ? 'Study Session' : '學習時段',
    today: language === 'en' ? 'Today' : '今日',
    session: language === 'en' ? 'Session' : '當前',
    bestDay: language === 'en' ? 'Best day' : '最佳',
    thisWeek: language === 'en' ? 'This Week' : '本週',
    total: language === 'en' ? 'total' : '總計',
    reset: language === 'en' ? 'Reset week' : '重置本週',
    resetTitle: language === 'en' ? 'Reset weekly data?' : '重置本週數據？',
    resetDesc:
      language === 'en'
        ? 'This will clear all study time data for this week. This action cannot be undone.'
        : '呢將清除本週的所有學習時間數據。呢個操作無法撤回。',
    cancel: language === 'en' ? 'Cancel' : '取消',
    confirm: language === 'en' ? 'Reset' : '重置',
  };

  // Don't render until hydrated (avoids hydration mismatch)
  if (!hydrated) return null;

  return (
    <motion.div
      ref={containerRef}
      {...dragProps}
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        x,
        y,
        zIndex: 30,
        touchAction: 'none',
      }}
      className="flex flex-col items-end gap-2"
    >
      {/* ── Compact floating timer widget (clicking toggles, dragging the wrapper moves) ── */}
      <button
        data-study-tracker-toggle
        type="button"
        onClick={() => {
          if (wasDragged.current) return;
          setIsOpen((p) => !p);
        }}
        className={`flex items-center gap-2 h-8 px-3 rounded-full shadow-lg border transition-all duration-200 select-none ${
          isDragging
            ? 'shadow-2xl cursor-grabbing'
            : isOpen
              ? 'bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 border-gray-700 dark:border-gray-300 cursor-grab'
              : 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/60 dark:border-gray-700/40 text-gray-600 dark:text-gray-300 hover:border-emerald-300 dark:hover:border-emerald-600 cursor-grab'
        }`}
        aria-label={t.title}
      >
        {isOpen ? (
          <X className="h-3.5 w-3.5" />
        ) : (
          <Clock className="h-3.5 w-3.5 text-emerald-500" />
        )}
        <span className="text-xs font-medium tabular-nums">
          {formatTimer(sessionSeconds)}
        </span>
        {!isOpen && (
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        )}
      </button>

      {/* ── Expanded panel ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="w-[320px] rounded-2xl border border-gray-200/60 dark:border-gray-700/40 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 shadow-2xl overflow-hidden"
          >
            {/* Emerald gradient top accent */}
            <div className="h-0.5 w-full bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500" />

            <div className="p-4">
              {/* ── Header ── */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                    <Timer className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    {t.title}
                  </span>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      className="h-7 w-7 flex items-center justify-center rounded-md text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title={t.reset}
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="max-w-sm">
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t.resetTitle}</AlertDialogTitle>
                      <AlertDialogDescription>{t.resetDesc}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleResetWeek}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        {t.confirm}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              {/* ── Stats cards ── */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                <StatCard
                  icon={<Clock className="h-3 w-3 text-emerald-500" />}
                  label={t.today}
                  value={formatHM(totalToday, language)}
                  bgClass="bg-emerald-50 dark:bg-emerald-900/20"
                  labelClass="text-emerald-600 dark:text-emerald-400"
                  valueClass="text-emerald-700 dark:text-emerald-300"
                />
                <StatCard
                  icon={<Timer className="h-3 w-3 text-gray-400" />}
                  label={t.session}
                  value={formatTimer(sessionSeconds)}
                  bgClass="bg-gray-50 dark:bg-gray-800/50"
                  labelClass="text-gray-500 dark:text-gray-400"
                  valueClass="text-gray-700 dark:text-gray-200"
                  mono
                />
                <StatCard
                  icon={<Flame className="h-3 w-3 text-amber-500" />}
                  label={t.bestDay}
                  value={
                    bestDayTime > 0
                      ? `${language === 'en' ? DAY_LABELS_EN[bestDayIdx] : DAY_LABELS_ZH[bestDayIdx]} ${formatHM(bestDayTime, language)}`
                      : '—'
                  }
                  bgClass="bg-amber-50 dark:bg-amber-900/20"
                  labelClass="text-amber-600 dark:text-amber-400"
                  valueClass="text-amber-700 dark:text-amber-300"
                  small
                />
              </div>

              {/* ── Weekly bar chart ── */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {t.thisWeek}
                  </span>
                  <span className="text-[11px] text-gray-400 dark:text-gray-500">
                    {formatHM(totalToday, language)} {t.total}
                  </span>
                </div>

                <div
                  className="flex items-end justify-between gap-1.5"
                  style={{ height: 120 }}
                >
                  {chartData.map((secs, idx) => {
                    const isToday = idx === todayIndex;
                    const barValue = Math.max(secs, 0);
                    const pct =
                      maxWeekTime > 0 ? Math.max((barValue / maxWeekTime) * 100, 3) : 3;

                    return (
                      <div
                        key={idx}
                        className="flex-1 flex flex-col items-center gap-1"
                      >
                        {/* Time label above bar */}
                        <span
                          className={`text-[9px] tabular-nums font-medium leading-tight ${
                            isToday
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : barValue > 0
                                ? 'text-gray-500 dark:text-gray-400'
                                : 'invisible'
                          }`}
                        >
                          {barValue > 0 ? formatHM(barValue, language) : '·'}
                        </span>

                        {/* Bar */}
                        <div className="w-full flex-1 flex items-end">
                          <div
                            className={`w-full rounded-md transition-all duration-500 ease-out ${
                              isToday
                                ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 dark:from-emerald-500 dark:to-emerald-300 shadow-sm shadow-emerald-200/50 dark:shadow-emerald-900/30'
                                : barValue > 0
                                  ? 'bg-gray-200 dark:bg-gray-700'
                                  : 'border border-dashed border-gray-200 dark:border-gray-700 bg-transparent'
                            }`}
                            style={{ height: `${pct}%` }}
                          />
                        </div>

                        {/* Day label */}
                        <span
                          className={`text-[10px] font-medium ${
                            isToday
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-gray-400 dark:text-gray-500'
                          }`}
                        >
                          {language === 'en' ? DAY_LABELS_EN[idx] : DAY_LABELS_ZH[idx]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
