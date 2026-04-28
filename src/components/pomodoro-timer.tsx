'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Timer, Play, Pause, RotateCcw, SkipForward, X, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useFloatingDrag } from '@/hooks/use-floating-drag';

// ── Types ──────────────────────────────────────────────────────
type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

interface PomodoroSettings {
  workDuration: number;      // minutes
  shortBreakDuration: number; // minutes
  longBreakDuration: number;  // minutes
  sessionsBeforeLongBreak: number;
}

interface PomodoroState {
  mode: TimerMode;
  remainingSeconds: number;
  isRunning: boolean;
  currentSession: number;
  settings: PomodoroSettings;
}

const STORAGE_KEY = 'lp-pomodoro-state';

const DEFAULT_SETTINGS: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsBeforeLongBreak: 4,
};

const INITIAL_STATE: PomodoroState = {
  mode: 'focus',
  remainingSeconds: DEFAULT_SETTINGS.workDuration * 60,
  isRunning: false,
  currentSession: 1,
  settings: DEFAULT_SETTINGS,
};

// ── Helpers ────────────────────────────────────────────────────
function loadState(): PomodoroState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PomodoroState;
    // Validate essential fields
    if (
      parsed.mode &&
      typeof parsed.remainingSeconds === 'number' &&
      typeof parsed.isRunning === 'boolean' &&
      parsed.settings
    ) {
      // If timer was running when page closed, check if enough real time has passed
      // We don't have a timestamp, so just reset to paused state
      return { ...parsed, isRunning: false };
    }
    return null;
  } catch {
    return null;
  }
}

function saveState(state: PomodoroState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // silently fail
  }
}

function getModeDuration(mode: TimerMode, settings: PomodoroSettings): number {
  switch (mode) {
    case 'focus':
      return settings.workDuration * 60;
    case 'shortBreak':
      return settings.shortBreakDuration * 60;
    case 'longBreak':
      return settings.longBreakDuration * 60;
  }
}

function getNextMode(mode: TimerMode, session: number, totalSessions: number): { mode: TimerMode; session: number } {
  if (mode === 'focus') {
    if (session >= totalSessions) {
      return { mode: 'longBreak', session };
    }
    return { mode: 'shortBreak', session };
  }
  // After a break, go back to focus
  if (mode === 'longBreak') {
    return { mode: 'focus', session: 1 };
  }
  // After short break
  return { mode: 'focus', session: session + 1 };
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    // Play a gentle two-tone notification
    const playTone = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };
    const now = ctx.currentTime;
    playTone(523.25, now, 0.2);         // C5
    playTone(659.25, now + 0.15, 0.2);  // E5
    playTone(783.99, now + 0.3, 0.4);   // G5
  } catch {
    // Audio not available
  }
}

// ── Circular Progress Ring ────────────────────────────────────
function CircularProgress({
  progress,
  mode,
  size = 140,
  strokeWidth = 8,
}: {
  progress: number; // 0 to 1
  mode: TimerMode;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  const getColor = () => {
    switch (mode) {
      case 'focus':
        return 'stroke-emerald-500';
      case 'shortBreak':
        return 'stroke-amber-500';
      case 'longBreak':
        return 'stroke-teal-500';
    }
  };

  const getTrackColor = () => {
    switch (mode) {
      case 'focus':
        return 'stroke-emerald-100 dark:stroke-emerald-900/40';
      case 'shortBreak':
        return 'stroke-amber-100 dark:stroke-amber-900/40';
      case 'longBreak':
        return 'stroke-teal-100 dark:stroke-teal-900/40';
    }
  };

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        className={getTrackColor()}
      />
      {/* Progress */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className={`${getColor()} transition-[stroke-dashoffset] duration-500 ease-linear`}
      />
    </svg>
  );
}

// ── Mode Badge ─────────────────────────────────────────────────
function ModeBadge({ mode, language }: { mode: TimerMode; language: 'en' | 'zh' }) {
  const labels: Record<TimerMode, { en: string; zh: string }> = {
    focus: { en: 'Focus', zh: '專注' },
    shortBreak: { en: 'Short Break', zh: '短休息' },
    longBreak: { en: 'Long Break', zh: '長休息' },
  };

  const styles: Record<TimerMode, string> = {
    focus: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
    shortBreak: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
    longBreak: 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300',
  };

  return (
    <Badge variant="secondary" className={`${styles[mode]} border-0 font-medium`}>
      {labels[mode][language]}
    </Badge>
  );
}

// ── Main Component ─────────────────────────────────────────────
interface PomodoroTimerProps {
  language: 'en' | 'zh';
  defaultOpen?: boolean;
}

export function PomodoroTimer({ language, defaultOpen = false }: PomodoroTimerProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [showSettings, setShowSettings] = useState(false);

  // ── Draggable floating widget (framer-motion) ────────────────
  const { x, y, hydrated, isDragging, wasDragged, containerRef, dragProps } = useFloatingDrag({
    storageKey: 'lp-pomodoro-position',
    defaultPosition: () => ({ x: 16, y: Math.max(0, window.innerHeight - 128) }),
  });

  // Initialize state from localStorage or defaults
  const [state, setState] = useState<PomodoroState>(() => {
    return loadState() || { ...INITIAL_STATE };
  });

  const { toast } = useToast();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Timer interval — runs even when panel is collapsed
  useEffect(() => {
    if (state.isRunning) {
      intervalRef.current = setInterval(() => {
        setState((prev) => {
          if (prev.remainingSeconds <= 1) {
            // Timer finished
            const next = getNextMode(prev.mode, prev.currentSession, prev.settings.sessionsBeforeLongBreak);
            return {
              ...prev,
              isRunning: false,
              mode: next.mode,
              currentSession: next.session,
              remainingSeconds: getModeDuration(next.mode, prev.settings),
            };
          }
          return {
            ...prev,
            remainingSeconds: prev.remainingSeconds - 1,
          };
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [state.isRunning]);

  // Notify when timer finishes (watch for transition from running to not running with 0 remaining)
  const prevRunningRef = useRef(state.isRunning);
  const prevRemainingRef = useRef(state.remainingSeconds);
  useEffect(() => {
    if (prevRunningRef.current && !state.isRunning && state.remainingSeconds === 0) {
      // Timer just finished
      playNotificationSound();
      const modeLabels: Record<TimerMode, { en: string; zh: string }> = {
        focus: { en: 'Focus session complete!', zh: '專注時段結束！' },
        shortBreak: { en: 'Short break is over!', zh: '短休息結束！' },
        longBreak: { en: 'Long break is over!', zh: '長休息結束！' },
      };
      const nextMode = getNextMode(state.mode, state.currentSession, state.settings.sessionsBeforeLongBreak);
      const nextModeLabels: Record<TimerMode, { en: string; zh: string }> = {
        focus: { en: 'Starting focus session...', zh: '開始專注時段...' },
        shortBreak: { en: 'Take a short break!', zh: '休息一下吧！' },
        longBreak: { en: 'Take a long break!', zh: '好好休息一下！' },
      };
      toast({
        title: modeLabels[state.mode][language],
        description: nextModeLabels[nextMode.mode][language],
      });
    }
    prevRunningRef.current = state.isRunning;
    prevRemainingRef.current = state.remainingSeconds;
  }, [state.isRunning, state.remainingSeconds, state.mode, state.currentSession, state.settings, language, toast]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        const target = e.target as HTMLElement;
        if (!target.closest('[data-pomodoro-toggle]')) {
          setIsOpen(false);
          setShowSettings(false);
        }
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleStartPause = useCallback(() => {
    setState((prev) => ({ ...prev, isRunning: !prev.isRunning }));
  }, []);

  const handleReset = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isRunning: false,
      remainingSeconds: getModeDuration(prev.mode, prev.settings),
    }));
  }, []);

  const handleSkip = useCallback(() => {
    setState((prev) => {
      const next = getNextMode(prev.mode, prev.currentSession, prev.settings.sessionsBeforeLongBreak);
      return {
        ...prev,
        mode: next.mode,
        currentSession: next.session,
        remainingSeconds: getModeDuration(next.mode, prev.settings),
        isRunning: false,
      };
    });
  }, []);

  const handleUpdateSettings = useCallback((newSettings: PomodoroSettings) => {
    setState((prev) => {
      const updated = { ...prev, settings: newSettings };
      // If the mode hasn't changed, update remaining time based on new settings
      updated.remainingSeconds = getModeDuration(prev.mode, newSettings);
      return updated;
    });
  }, []);

  // Computed values
  const totalDuration = getModeDuration(state.mode, state.settings);
  const progress = state.remainingSeconds / totalDuration;
  const isFocus = state.mode === 'focus';

  // Badge text for floating button — always show MM:SS so users can see
  // at a glance how long the next session is, even before starting.
  const badgeText = formatTime(state.remainingSeconds);

  const labels = {
    title: language === 'en' ? 'Pomodoro Timer' : '番茄鍾',
    session: language === 'en'
      ? `Session ${state.currentSession} of ${state.settings.sessionsBeforeLongBreak}`
      : `第 ${state.currentSession} / ${state.settings.sessionsBeforeLongBreak} 個`,
    start: language === 'en' ? 'Start' : '開始',
    pause: language === 'en' ? 'Pause' : '暫停',
    reset: language === 'en' ? 'Reset' : '重置',
    skip: language === 'en' ? 'Skip' : '跳過',
    settings: language === 'en' ? 'Settings' : '設定',
    workDuration: language === 'en' ? 'Work Duration' : '工作時長',
    shortBreak: language === 'en' ? 'Short Break' : '短休息',
    longBreak: language === 'en' ? 'Long Break' : '長休息',
    minutes: language === 'en' ? 'min' : '分鐘',
    close: language === 'en' ? 'Close' : '關閉',
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
        zIndex: 50,
        touchAction: 'none',
      }}
      className="flex flex-col items-start gap-2"
    >
      {/* Floating button — clicking toggles, dragging the wrapper moves it */}
      <button
        data-pomodoro-toggle
        type="button"
        onClick={() => {
          if (wasDragged.current) return;
          setIsOpen((p) => !p);
        }}
        className={`relative flex items-center justify-center h-12 w-12 rounded-full shadow-lg transition-all duration-200 select-none ${
          isDragging
            ? 'shadow-2xl shadow-emerald-500/20 scale-105 cursor-grabbing'
            : 'cursor-grab hover:shadow-xl active:cursor-grabbing'
        } ${
          isOpen
            ? 'bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900'
            : 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white'
        }`}
        aria-label={labels.title}
      >
        {isOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Timer className="h-5 w-5" />
        )}
        {/* Badge showing remaining time */}
        {badgeText && !isOpen && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center h-5 min-w-[40px] px-1 rounded-full bg-gray-800 dark:bg-gray-700 text-white text-[10px] font-bold leading-none tabular-nums pointer-events-none">
            {badgeText}
          </span>
        )}
      </button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="w-[300px] rounded-2xl border border-gray-200/60 dark:border-gray-700/40 backdrop-blur-xl bg-white/80 dark:bg-[#2f2f2f]/80 shadow-2xl flex flex-col overflow-hidden relative"
          >
            {/* Gradient top border */}
            <div className={`absolute top-0 left-0 right-0 h-0.5 rounded-t-xl ${
              isFocus
                ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500'
                : state.mode === 'shortBreak'
                  ? 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500'
                  : 'bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-500'
            }`} />

            <AnimatePresence mode="wait">
              {showSettings ? (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.15 }}
                  className="p-4"
                >
                  {/* Settings header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                        {labels.settings}
                      </span>
                    </div>
                    <button
                      onClick={() => setShowSettings(false)}
                      className="h-7 w-7 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      aria-label={labels.close}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Work duration */}
                  <div className="space-y-3">
                    <SettingRow
                      label={labels.workDuration}
                      value={state.settings.workDuration}
                      options={[25, 30, 45, 60]}
                      unit={labels.minutes}
                      onSelect={(v) =>
                        handleUpdateSettings({ ...state.settings, workDuration: v })
                      }
                    />
                    <SettingRow
                      label={labels.shortBreak}
                      value={state.settings.shortBreakDuration}
                      options={[5, 10]}
                      unit={labels.minutes}
                      onSelect={(v) =>
                        handleUpdateSettings({ ...state.settings, shortBreakDuration: v })
                      }
                    />
                    <SettingRow
                      label={labels.longBreak}
                      value={state.settings.longBreakDuration}
                      options={[15, 20]}
                      unit={labels.minutes}
                      onSelect={(v) =>
                        handleUpdateSettings({ ...state.settings, longBreakDuration: v })
                      }
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="timer"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  className="p-4 flex flex-col items-center"
                >
                  {/* Mode badge + settings button */}
                  <div className="flex items-center justify-between w-full mb-3">
                    <ModeBadge mode={state.mode} language={language} />
                    <button
                      onClick={() => setShowSettings(true)}
                      className="h-7 w-7 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      aria-label={labels.settings}
                    >
                      <Settings className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Circular progress + timer */}
                  <div className="relative flex items-center justify-center my-2">
                    <CircularProgress progress={progress} mode={state.mode} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-gray-900 dark:text-gray-50 tabular-nums tracking-tight">
                        {formatTime(state.remainingSeconds)}
                      </span>
                    </div>
                  </div>

                  {/* Session counter */}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-3">
                    {labels.session}
                  </p>

                  <Separator className="w-full mb-3 bg-gray-200/60 dark:bg-gray-700/40" />

                  {/* Control buttons */}
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-full border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={handleReset}
                      aria-label={labels.reset}
                      title={labels.reset}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>

                    <Button
                      size="icon"
                      className={`h-12 w-12 rounded-full shadow-md transition-colors ${
                        isFocus
                          ? 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white'
                          : state.mode === 'shortBreak'
                            ? 'bg-amber-500 hover:bg-amber-600 dark:bg-amber-400 dark:hover:bg-amber-500 text-white'
                            : 'bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white'
                      }`}
                      onClick={handleStartPause}
                      aria-label={state.isRunning ? labels.pause : labels.start}
                    >
                      {state.isRunning ? (
                        <Pause className="h-5 w-5" />
                      ) : (
                        <Play className="h-5 w-5 ml-0.5" />
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-full border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={handleSkip}
                      aria-label={labels.skip}
                      title={labels.skip}
                    >
                      <SkipForward className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Setting Row ────────────────────────────────────────────────
function SettingRow({
  label,
  value,
  options,
  unit,
  onSelect,
}: {
  label: string;
  value: number;
  options: number[];
  unit: string;
  onSelect: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
      <div className="flex items-center gap-1">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onSelect(opt)}
            className={`h-7 min-w-[36px] px-2 rounded-md text-xs font-medium transition-colors ${
              value === opt
                ? 'bg-emerald-600 text-white dark:bg-emerald-500'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {opt}{unit}
          </button>
        ))}
      </div>
    </div>
  );
}
