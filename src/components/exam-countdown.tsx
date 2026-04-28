'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CalendarDays, Clock, Settings, ChevronUp, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ExamCountdownProps {
  language: 'en' | 'zh';
  compact?: boolean;
}

// Default exam date: May 20, 2026 (typical final exam period)
const DEFAULT_EXAM_DATE = '2026-05-20T09:00:00';

function getExamDate(): Date {
  try {
    const stored = localStorage.getItem('lp-exam-date');
    if (stored) return new Date(stored);
  } catch {}
  return new Date(DEFAULT_EXAM_DATE);
}

function saveExamDate(date: Date) {
  try {
    localStorage.setItem('lp-exam-date', date.toISOString());
  } catch {}
}

function getTimeRemaining(examDate: Date) {
  const now = new Date();
  const diff = examDate.getTime() - now.getTime();

  if (diff <= 0) {
    return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }

  return {
    total: diff,
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    isPast: false,
  };
}

function formatExamDate(date: Date, lang: 'en' | 'zh'): string {
  return date.toLocaleDateString(lang === 'en' ? 'en-US' : 'zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ExamCountdown({ language, compact = false }: ExamCountdownProps) {
  const [examDate, setExamDate] = useState<Date>(() => getExamDate());
  const [timeLeft, setTimeLeft] = useState(() => getTimeRemaining(getExamDate()));
  const [showSettings, setShowSettings] = useState(false);
  const [dateInput, setDateInput] = useState(() => getExamDate().toISOString().slice(0, 16));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeRemaining(examDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [examDate]);

  const handleDateChange = useCallback((newDate: string) => {
    setDateInput(newDate);
    const d = new Date(newDate);
    if (!isNaN(d.getTime())) {
      setExamDate(d);
      saveExamDate(d);
      setTimeLeft(getTimeRemaining(d));
    }
  }, []);

  const handleReset = useCallback(() => {
    const d = new Date(DEFAULT_EXAM_DATE);
    setExamDate(d);
    saveExamDate(d);
    setTimeLeft(getTimeRemaining(d));
    setDateInput(d.toISOString().slice(0, 16));
  }, []);

  if (!examDate) return null;

  // Urgency levels
  const urgency = timeLeft.isPast
    ? 'past'
    : timeLeft.days <= 3
      ? 'critical'
      : timeLeft.days <= 7
        ? 'urgent'
        : timeLeft.days <= 14
          ? 'soon'
          : 'relaxed';

  const urgencyColors = {
    past: {
      bg: 'bg-gray-100 dark:bg-gray-800/50 border-gray-300 dark:border-gray-600',
      text: 'text-gray-500 dark:text-gray-400',
      accent: 'text-gray-400',
      ring: 'ring-gray-300/20',
    },
    critical: {
      bg: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/50',
      text: 'text-red-700 dark:text-red-400',
      accent: 'text-red-500',
      ring: 'ring-red-500/20',
    },
    urgent: {
      bg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50',
      text: 'text-amber-700 dark:text-amber-400',
      accent: 'text-amber-500',
      ring: 'ring-amber-500/20',
    },
    soon: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50',
      text: 'text-emerald-700 dark:text-emerald-400',
      accent: 'text-emerald-500',
      ring: 'ring-emerald-500/20',
    },
    relaxed: {
      bg: 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-800/40',
      text: 'text-emerald-700 dark:text-emerald-400',
      accent: 'text-emerald-500',
      ring: 'ring-emerald-500/10',
    },
  };

  const colors = urgencyColors[urgency];

  // Compact version (for sidebar)
  if (compact) {
    return (
      <div className={`rounded-xl border px-3 py-2.5 ${colors.bg}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <CalendarDays className={`h-3.5 w-3.5 shrink-0 ${colors.accent}`} />
            <span className={`text-xs font-semibold truncate ${colors.text}`}>
              {timeLeft.isPast
                ? (language === 'en' ? 'Exam Day!' : '考試日！')
                : language === 'en'
                  ? `${timeLeft.days}d ${timeLeft.hours}h`
                  : `${timeLeft.days}日 ${timeLeft.hours}時`}
            </span>
          </div>
          <span className="text-[10px] text-gray-400 dark:text-gray-500 shrink-0">
            {examDate.toLocaleDateString(language === 'en' ? 'en-US' : 'zh-CN', { month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>
    );
  }

  // Full version (for welcome screen)
  return (
    <div className={`relative rounded-2xl border ${colors.bg} overflow-hidden transition-all duration-500`}>
      {/* Decorative gradient strip */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
        timeLeft.isPast
          ? 'from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500'
          : urgency === 'critical'
            ? 'from-red-500 to-rose-500'
            : urgency === 'urgent'
              ? 'from-amber-500 to-orange-500'
              : 'from-emerald-500 to-teal-500'
      }`} />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`inline-flex items-center justify-center h-8 w-8 rounded-xl ${
              timeLeft.isPast
                ? 'bg-gray-200 dark:bg-gray-700'
                : urgency === 'critical'
                  ? 'bg-red-100 dark:bg-red-900/40'
                  : urgency === 'urgent'
                    ? 'bg-amber-100 dark:bg-amber-900/40'
                    : 'bg-emerald-100 dark:bg-emerald-900/40'
            }`}>
              <GraduationCap className={`h-4 w-4 ${colors.accent}`} />
            </div>
            <div>
              <h3 className={`text-sm font-bold ${colors.text}`}>
                {timeLeft.isPast
                  ? (language === 'en' ? 'Exam Day!' : '考試日！')
                  : (language === 'en' ? 'Exam Countdown' : '考試倒數計時')}
              </h3>
              <p className="text-[11px] text-gray-400 dark:text-gray-500">
                {formatExamDate(examDate, language)}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center justify-center h-7 w-7 rounded-lg hover:bg-gray-200/60 dark:hover:bg-gray-700/60 transition-colors touch-manipulation"
            aria-label={language === 'en' ? 'Settings' : '設定'}
          >
            {showSettings ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <Settings className="h-4 w-4 text-gray-400" />
            )}
          </button>
        </div>

        {/* Countdown Display */}
        {!timeLeft.isPast && (
          <div className="flex items-center justify-center gap-2 mb-3">
            {[
              { value: timeLeft.days, label: language === 'en' ? 'Days' : '日' },
              { value: timeLeft.hours, label: language === 'en' ? 'Hrs' : '時' },
              { value: timeLeft.minutes, label: language === 'en' ? 'Min' : '分' },
              { value: timeLeft.seconds, label: language === 'en' ? 'Sec' : '秒' },
            ].map((unit, idx) => (
              <React.Fragment key={unit.label}>
                <motion.div
                  key={`${unit.label}-${unit.value}`}
                  initial={{ y: -4, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className={`flex flex-col items-center justify-center min-w-[52px] px-2 py-2 rounded-xl border ${
                    idx === 0
                      ? `border-current/10 ${colors.bg} ring-2 ${colors.ring}`
                      : 'border-gray-200/60 dark:border-gray-700/40 bg-white/50 dark:bg-gray-800/30'
                  }`}
                >
                  <span className={`text-xl font-bold tabular-nums ${colors.text}`}>
                    {String(unit.value).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium mt-0.5">
                    {unit.label}
                  </span>
                </motion.div>
                {idx < 3 && (
                  <span className={`text-lg font-bold ${colors.accent} opacity-40`}>:</span>
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Study tip based on urgency */}
        <div className="text-center">
          {timeLeft.isPast ? (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {language === 'en'
                ? 'Good luck on your exam!'
                : '祝你考試順利！'}
            </p>
          ) : (
            <p className={`text-xs font-medium ${colors.text}`}>
              {urgency === 'critical'
                ? (language === 'en'
                    ? 'Focus on key concepts and formulas!'
                    : '集中複習關鍵概念和公式！')
                : urgency === 'urgent'
                  ? (language === 'en'
                      ? 'Review flashcards and practice quiz!'
                      : '複習閃卡和測驗練習！')
                  : urgency === 'soon'
                    ? (language === 'en'
                        ? 'Consistent review leads to better results!'
                        : '持續複習，效果更好！')
                    : (language === 'en'
                        ? 'Start early, review regularly!'
                        : '盡早開始，定期複習！')}
            </p>
          )}
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
              className="overflow-hidden"
            >
              <div className="pt-3 mt-3 border-t border-gray-200/60 dark:border-gray-700/40 space-y-2">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  {language === 'en' ? 'Exam Date & Time' : '考試日期同時間'}
                </label>
                <input
                  type="datetime-local"
                  value={dateInput}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-300 dark:focus:border-emerald-700 transition-all"
                />
                <button
                  onClick={handleReset}
                  className="text-[11px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {language === 'en' ? 'Reset to default' : '恢復默認'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
