'use client';

import React, { useState, useEffect } from 'react';
import { Flame, Activity, MessageSquare, GraduationCap, Loader2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// ── Types ──────────────────────────────────────────────────────────
interface DailyActivity {
  date: string;
  quizAttempts: number;
  conversationsCreated: number;
}

interface StudyActivityData {
  dailyActivity: DailyActivity[];
  streak: number;
  totalStudyDays: number;
  todayActive: boolean;
  totalQuizAttempts: number;
  totalConversations: number;
  longestStreak: number;
}

interface StudyProgressProps {
  language: 'en' | 'zh';
}

// ── localStorage helpers ──────────────────────────────────────────
const STORAGE_KEY = 'lp-study-activity';

interface ActivityEvent {
  type: 'quiz' | 'chat';
  timestamp: string;
}

function getLocalActivities(): ActivityEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function addLocalActivity(type: 'quiz' | 'chat') {
  if (typeof window === 'undefined') return;
  const activities = getLocalActivities();
  activities.push({ type, timestamp: new Date().toISOString() });
  // Keep last 90 days of events
  const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const filtered = activities.filter((a) => a.timestamp >= cutoff);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

function computeLocalDailyActivity(): Record<string, { quiz: number; chat: number }> {
  const activities = getLocalActivities();
  const map: Record<string, { quiz: number; chat: number }> = {};
  for (const a of activities) {
    const key = a.timestamp.slice(0, 10);
    if (!map[key]) map[key] = { quiz: 0, chat: 0 };
    if (a.type === 'quiz') map[key].quiz++;
    else map[key].chat++;
  }
  return map;
}

function computeLocalStreak(): number {
  const localMap = computeLocalDailyActivity();
  const dates = Object.keys(localMap).sort().reverse();
  if (dates.length === 0) return 0;

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  // Streak must start from today or yesterday
  if (dates[0] !== today && dates[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const prevDate = new Date(dates[i - 1]);
    const currDate = new Date(dates[i]);
    const diffDays = Math.round(
      (prevDate.getTime() - currDate.getTime()) / (24 * 60 * 60 * 1000)
    );
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

// ── Expose logActivity for parent components ──────────────────────
export function logStudyActivity(type: 'quiz' | 'chat') {
  addLocalActivity(type);
  // Fire-and-forget POST to API
  fetch('/api/study-activity', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type }),
  }).catch(() => {});
}

// ── Heatmap color logic ──────────────────────────────────────────
function getHeatColorDark(total: number): string {
  if (total === 0) return 'bg-white/[0.06]';
  if (total <= 1) return 'bg-emerald-900/40';
  if (total <= 3) return 'bg-emerald-700/50';
  if (total <= 6) return 'bg-emerald-500/60';
  return 'bg-emerald-400/80';
}

// ── Day labels ───────────────────────────────────────────────────
const DAY_LABELS_EN = ['', 'Mon', 'Wed', 'Fri'];
const DAY_LABELS_ZH = ['', '一', '三', '五'];
const DAY_INDICES = [1, 3, 5]; // Show Mon, Wed, Fri labels

// ── Component ────────────────────────────────────────────────────
export function StudyProgress({ language }: StudyProgressProps) {
  const [data, setData] = useState<StudyActivityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [localMap, setLocalMap] = useState<Record<string, { quiz: number; chat: number }>>({});
  const [localStreak, setLocalStreak] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('/api/study-activity');
        if (res.ok && !cancelled) {
          const json = await res.json();
          setData(json);
        }
      } catch {
        // Silently fail — will use local data only
      }
      if (!cancelled) {
        setLocalMap(computeLocalDailyActivity());
        setLocalStreak(computeLocalStreak());
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  // Refresh local data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLocalMap(computeLocalDailyActivity());
      setLocalStreak(computeLocalStreak());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Merge API data with localStorage data for heatmap
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  // Build 28-day heatmap grid (7 columns × 4 rows)
  // Each cell = one day, column = day of week, row = week number
  const heatmapCells: Array<{
    date: string;
    total: number;
    quiz: number;
    chat: number;
    col: number;
    row: number;
  }> = [];

  // Find the Sunday of 4 weeks ago as start
  const daysSinceSunday = now.getDay(); // 0=Sun
  const startDate = new Date(now.getTime() - (27 + daysSinceSunday) * 24 * 60 * 60 * 1000);

  for (let dayOffset = 0; dayOffset < 28; dayOffset++) {
    const cellDate = new Date(startDate.getTime() + dayOffset * 24 * 60 * 60 * 1000);
    const dateKey = `${cellDate.getFullYear()}-${String(cellDate.getMonth() + 1).padStart(2, '0')}-${String(cellDate.getDate()).padStart(2, '0')}`;
    const dayOfWeek = cellDate.getDay(); // 0=Sun, 1=Mon...
    const weekNum = Math.floor(dayOffset / 7);

    // Get counts from API data
    const apiDay = data?.dailyActivity.find((d) => d.date === dateKey);
    let quiz = apiDay?.quizAttempts || 0;
    let chat = apiDay?.conversationsCreated || 0;

    // Merge with localStorage data
    const localDay = localMap[dateKey];
    if (localDay) {
      quiz += localDay.quiz;
      chat += localDay.chat;
    }

    heatmapCells.push({
      date: dateKey,
      total: quiz + chat,
      quiz,
      chat,
      col: dayOfWeek,
      row: weekNum,
    });
  }

  const displayStreak = data?.streak || localStreak;
  const todayActive = data?.todayActive || (localMap[todayStr]?.quiz + localMap[todayStr]?.chat > 0);
  const totalStudyDays = data?.totalStudyDays || Object.keys(localMap).length;
  const totalQuiz = (data?.totalQuizAttempts || 0) + Object.values(localMap).reduce((sum, d) => sum + d.quiz, 0);
  const totalChat = (data?.totalConversations || 0) + Object.values(localMap).reduce((sum, d) => sum + d.chat, 0);
  const longestStreak = data?.longestStreak || localStreak;

  const t = {
    streak: language === 'en' ? 'streak' : '日連續',
    studyDays: language === 'en' ? 'study days' : '日學習',
    quizAttempts: language === 'en' ? 'quizzes' : '次測驗',
    conversations: language === 'en' ? 'conversations' : '次對話',
    longestStreak: language === 'en' ? 'longest' : '最長',
    todayActive: language === 'en' ? 'Active today' : '今日已學習',
    activity: language === 'en' ? 'Study Progress' : '學習進度',
    quizLabel: language === 'en' ? 'Q' : '測',
    chatLabel: language === 'en' ? 'C' : '聊',
    noActivity: language === 'en' ? 'No activity' : '無活動',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="px-2 py-2 space-y-3">
        {/* Header row: title + streak */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
              {t.activity}
            </span>
          </div>
          {displayStreak > 0 && (
            <div className="flex items-center gap-1 text-emerald-400">
              <Flame className="h-3.5 w-3.5" />
              <span className="text-[12px] font-bold">{displayStreak}</span>
              <span className="text-[10px] text-emerald-400/70">{t.streak}</span>
            </div>
          )}
        </div>

        {/* Heatmap grid */}
        <div className="px-1">
          {/* Day labels column */}
          <div className="grid gap-[3px]" style={{ gridTemplateColumns: '16px repeat(7, 1fr)' }}>
            {/* Day labels row */}
            <div />
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={`label-${i}`}
                className="h-3 flex items-center justify-center"
              >
                {DAY_INDICES.includes(i) && (
                  <span className="text-[8px] text-gray-600 leading-none">
                    {language === 'en' ? DAY_LABELS_EN[DAY_INDICES.indexOf(i)] : DAY_LABELS_ZH[DAY_INDICES.indexOf(i)]}
                  </span>
                )}
              </div>
            ))}

            {/* Heatmap rows (4 weeks) */}
            {Array.from({ length: 4 }).map((_, weekIdx) => {
              const weekCells = heatmapCells.filter((c) => c.row === weekIdx);
              // Sort by day of week
              weekCells.sort((a, b) => a.col - b.col);

              return (
                <React.Fragment key={`week-${weekIdx}`}>
                  {/* Row label */}
                  <div className="h-[14px] flex items-center justify-center">
                    <span className="text-[8px] text-gray-600 leading-none">
                      {weekIdx === 0
                        ? '4'
                        : weekIdx === 1
                          ? '3'
                          : weekIdx === 2
                            ? '2'
                            : '1'}
                    </span>
                  </div>
                  {/* 7 day cells */}
                  {Array.from({ length: 7 }).map((_, dayIdx) => {
                    const cell = weekCells.find((c) => c.col === dayIdx);
                    if (!cell) {
                      return <div key={`empty-${weekIdx}-${dayIdx}`} className="h-[14px] rounded-[3px]" />;
                    }

                    const total = cell.total;
                    const tooltipText =
                      total === 0
                        ? `${cell.date}: ${t.noActivity}`
                        : `${cell.date}: ${cell.quiz} ${t.quizLabel}, ${cell.chat} ${t.chatLabel}`;

                    return (
                      <Tooltip key={`${cell.date}`}>
                        <TooltipTrigger asChild>
                          <div
                            className={`h-[14px] rounded-[3px] cursor-default transition-colors duration-200 hover:ring-1 hover:ring-white/20 heatmap-cell-hover ${getHeatColorDark(total)}`}
                          />
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          className="text-[11px] px-2 py-1 bg-gray-900 text-gray-200 border-gray-700"
                        >
                          {tooltipText}
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end gap-1 mt-1.5">
            <span className="text-[8px] text-gray-600 mr-0.5">Less</span>
            {[0, 1, 3, 6].map((level) => (
              <div
                key={`legend-${level}`}
                className={`h-[10px] w-[10px] rounded-[2px] ${getHeatColorDark(level)}`}
              />
            ))}
            <span className="text-[8px] text-gray-600 ml-0.5">More</span>
          </div>
        </div>

        {/* Quick stats row */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 px-1">
          {/* Today's activity indicator */}
          <div className="flex items-center gap-1.5 col-span-2">
            <div
              className={`h-2 w-2 rounded-full transition-colors ${
                todayActive ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]' : 'bg-gray-600'
              }`}
            />
            <span className="text-[11px] text-gray-500">
              {todayActive ? t.todayActive : (language === 'en' ? 'No activity today' : '今日暫無活動')}
            </span>
          </div>

          <StatItem
            icon={<MessageSquare className="h-3 w-3 text-emerald-500" />}
            label={t.conversations}
            value={totalChat}
          />
          <StatItem
            icon={<GraduationCap className="h-3 w-3 text-emerald-500" />}
            label={t.quizAttempts}
            value={totalQuiz}
          />
          <StatItem
            icon={<Activity className="h-3 w-3 text-emerald-500" />}
            label={t.studyDays}
            value={totalStudyDays}
          />
          <StatItem
            icon={<Flame className="h-3 w-3 text-emerald-500" />}
            label={`${t.longestStreak}: ${longestStreak}`}
            value={null}
          />
        </div>
      </div>
    </TooltipProvider>
  );
}

// ── Stat item sub-component ──────────────────────────────────────
function StatItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | null;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {icon}
      {value !== null ? (
        <>
          <span className="text-[12px] font-semibold text-gray-300">{value}</span>
          <span className="text-[10px] text-gray-600">{label}</span>
        </>
      ) : (
        <span className="text-[10px] text-gray-500">{label}</span>
      )}
    </div>
  );
}
