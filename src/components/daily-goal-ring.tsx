'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Target, Clock, CheckCircle2 } from 'lucide-react';

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

function formatTime(secs: number, lang: 'en' | 'zh'): string {
  const m = Math.floor(secs / 60);
  if (lang === 'en') return `${m}m`;
  return `${m}分鐘`;
}

const GOAL_STORAGE_KEY = 'lp-daily-goal-minutes';
const DEFAULT_GOAL_MINUTES = 30;

function loadGoalMinutes(): number {
  if (typeof window === 'undefined') return DEFAULT_GOAL_MINUTES;
  try {
    const val = localStorage.getItem(GOAL_STORAGE_KEY);
    return val ? parseInt(val, 10) || DEFAULT_GOAL_MINUTES : DEFAULT_GOAL_MINUTES;
  } catch {
    return DEFAULT_GOAL_MINUTES;
  }
}

function saveGoalMinutes(minutes: number) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(GOAL_STORAGE_KEY, String(minutes));
  } catch {
    // silently fail
  }
}

// ── Props ──────────────────────────────────────────────────────

interface DailyGoalRingProps {
  language: 'en' | 'zh';
}

// ── Component ──────────────────────────────────────────────────

export function DailyGoalRing({ language }: DailyGoalRingProps) {
  const [goalMinutes, setGoalMinutes] = useState(() => loadGoalMinutes());
  const initialSecs = loadDaySeconds(getTodayKey());
  const [currentSeconds, setCurrentSeconds] = useState(initialSecs);
  const [isCompleted, setIsCompleted] = useState(initialSecs >= loadGoalMinutes() * 60);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(DEFAULT_GOAL_MINUTES.toString());
  const editInputRef = useRef<HTMLInputElement>(null);
  const completedTodayRef = useRef(initialSecs >= loadGoalMinutes() * 60);

  // Poll every 15 seconds to refresh progress
  useEffect(() => {
    const interval = setInterval(() => {
      const secs = loadDaySeconds(getTodayKey());
      setCurrentSeconds(secs);
      const goalSecs = loadGoalMinutes() * 60;
      const completed = secs >= goalSecs;
      setIsCompleted(completed);

      // Trigger celebration once when crossing the threshold
      if (completed && !completedTodayRef.current) {
        completedTodayRef.current = true;
      }
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Auto-focus edit input
  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditing]);

  const handleSaveGoal = useCallback(() => {
    const val = parseInt(editValue, 10);
    if (val >= 5 && val <= 480) {
      setGoalMinutes(val);
      saveGoalMinutes(val);
      const secs = loadDaySeconds(getTodayKey());
      setIsCompleted(secs >= val * 60);
    }
    setIsEditing(false);
  }, [editValue]);

  const handleEditKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveGoal();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsEditing(false);
    }
  }, [handleSaveGoal]);

  // Computed values
  const goalSeconds = goalMinutes * 60;
  const progress = Math.min(currentSeconds / goalSeconds, 1);
  const currentMinutes = Math.floor(currentSeconds / 60);
  const remainingMinutes = Math.max(0, goalMinutes - currentMinutes);

  // SVG ring params
  const radius = 32;
  const stroke = 5;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - progress * circumference;

  // Color based on progress
  const ringColor = progress >= 0.75
    ? 'text-emerald-500'
    : progress >= 0.25
      ? 'text-amber-500'
      : 'text-red-500';

  const ringTrackColor = 'text-gray-200 dark:text-gray-700/50';

  // Labels
  const t = {
    title: language === 'en' ? 'Daily Goal' : '每日目標',
    current: language === 'en' ? 'Studied' : '已學習',
    remaining: language === 'en' ? 'remaining' : '剩餘',
    completed: language === 'en' ? 'Goal reached!' : '目標達成！',
    setGoal: language === 'en' ? 'Set goal' : '設定目標',
    minutes: language === 'en' ? 'min' : '分鐘',
  };

  return (
    <div className="px-2 py-2">
      {/* Header */}
      <div className="flex items-center justify-between px-1 mb-2">
        <div className="flex items-center gap-1.5">
          <Target className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
            {t.title}
          </span>
        </div>
        {!isEditing ? (
          <button
            onClick={() => {
              setEditValue(String(goalMinutes));
              setIsEditing(true);
            }}
            className="text-[10px] text-gray-500 hover:text-emerald-400 dark:hover:text-emerald-400 transition-colors"
          >
            {t.setGoal}
          </button>
        ) : null}
      </div>

      {/* Edit goal input */}
      {isEditing && (
        <div className="px-1 mb-2">
          <div className="flex items-center gap-1.5">
            <input
              ref={editInputRef}
              type="number"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value.slice(0, 3))}
              onKeyDown={handleEditKeyDown}
              onBlur={handleSaveGoal}
              className="w-14 h-6 px-1.5 rounded text-[12px] text-center bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-emerald-400 dark:focus:border-emerald-500"
              min={5}
              max={480}
            />
            <span className="text-[10px] text-gray-500">{t.minutes}</span>
            <button
              onClick={handleSaveGoal}
              className="h-6 px-2 rounded text-[10px] font-medium bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
            >
              {language === 'en' ? 'OK' : '確定'}
            </button>
          </div>
        </div>
      )}

      {/* Ring + Stats */}
      <div className="flex items-center gap-3 px-1">
        {/* SVG Progress Ring */}
        <div className="relative shrink-0" style={{ width: radius * 2, height: radius * 2 }}>
          <svg
            width={radius * 2}
            height={radius * 2}
            viewBox={`0 0 ${radius * 2} ${radius * 2}`}
            className="-rotate-90"
          >
            {/* Track */}
            <circle
              stroke="currentColor"
              fill="transparent"
              strokeWidth={stroke}
              strokeDasharray={`${circumference} ${circumference}`}
              className={ringTrackColor}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            {/* Progress */}
            <circle
              stroke="currentColor"
              fill="transparent"
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              className={`${ringColor} transition-all duration-700 ease-out`}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
              style={{
                filter: isCompleted
                  ? 'drop-shadow(0 0 4px rgba(16, 185, 129, 0.4))'
                  : 'none',
              }}
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {isCompleted ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            ) : (
              <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 tabular-nums">
                {Math.round(progress * 100)}%
              </span>
            )}
          </div>
        </div>

        {/* Text stats */}
        <div className="flex-1 min-w-0">
          {isCompleted ? (
            <p className="text-[12px] font-semibold text-emerald-500 dark:text-emerald-400">
              {t.completed}
            </p>
          ) : (
            <>
              <p className="text-[12px] font-medium text-gray-300 dark:text-gray-200">
                <Clock className="h-3 w-3 inline mr-1 -mt-px text-emerald-400" />
                {formatTime(currentSeconds, language)}
                <span className="text-gray-500 dark:text-gray-500 font-normal ml-1">
                  / {goalMinutes}{language === 'en' ? 'm' : '分鐘'}
                </span>
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-500 mt-0.5">
                {remainingMinutes} {t.remaining}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
