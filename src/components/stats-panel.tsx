'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  BarChart3,
  Brain,
  Target,
  Flame,
  TrendingUp,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Calendar,
  Sparkles,
  Loader2,
  Lightbulb,
  BookMarked,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
// No AlertDialog — using inline confirmation to avoid portal/z-index nesting bugs

interface StatsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'zh';
  onOpenStudyPlan: () => void;
}

interface TopicStat {
  topicId: string;
  topicName: string;
  total: number;
  correct: number;
  accuracy: number;
}

interface DifficultyStat {
  difficulty: string;
  total: number;
  correct: number;
  accuracy: number;
}

interface RecentAttempt {
  id: string;
  topicName: string;
  isCorrect: boolean;
  createdAt: string;
}

interface StatsData {
  totalAttempts: number;
  correctAttempts: number;
  overallAccuracy: number;
  topicAccuracy: TopicStat[];
  difficultyAccuracy: DifficultyStat[];
  recentAttempts: RecentAttempt[];
  streak: number;
}

interface WeakConcept {
  title: string;
  summary: string;
  recommendation: string;
  topicId?: string;
  topicName?: string;
  evidenceQuestionIds: string[];
}

interface InsightsData {
  generatedAt: string;
  totalAnalyzed: number;
  weakConcepts: WeakConcept[];
  summary: string;
}

function getAccuracyColor(accuracy: number): string {
  if (accuracy >= 70) return 'text-emerald-600 dark:text-emerald-400';
  if (accuracy >= 50) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-500 dark:text-red-400';
}

function getAccuracyBg(accuracy: number): string {
  if (accuracy >= 70) return 'bg-emerald-500';
  if (accuracy >= 50) return 'bg-amber-500';
  return 'bg-red-500';
}

function getAccuracyBarBg(accuracy: number): string {
  if (accuracy >= 70) return 'bg-emerald-100 dark:bg-emerald-900/30';
  if (accuracy >= 50) return 'bg-amber-100 dark:bg-amber-900/30';
  return 'bg-red-100 dark:bg-red-900/30';
}

function getAccuracyCardBg(accuracy: number): string {
  if (accuracy >= 70) return 'bg-emerald-50 dark:bg-emerald-900/20';
  if (accuracy >= 50) return 'bg-amber-50 dark:bg-amber-900/20';
  return 'bg-rose-50 dark:bg-rose-900/20';
}

function getAccuracyIconBg(accuracy: number): string {
  if (accuracy >= 70) return 'bg-emerald-100 dark:bg-emerald-900/40';
  if (accuracy >= 50) return 'bg-amber-100 dark:bg-amber-900/40';
  return 'bg-rose-100 dark:bg-rose-900/40';
}

function getDifficultyLabel(difficulty: string, language: 'en' | 'zh'): string {
  if (difficulty === 'easy') return language === 'en' ? 'Easy' : '簡單';
  if (difficulty === 'medium') return language === 'en' ? 'Medium' : '中等';
  if (difficulty === 'hard') return language === 'en' ? 'Hard' : '困難';
  return difficulty;
}

function getDifficultyColor(difficulty: string): string {
  if (difficulty === 'easy') return 'bg-emerald-500';
  if (difficulty === 'medium') return 'bg-amber-500';
  return 'bg-red-500';
}

function getDifficultyBadge(difficulty: string): string {
  if (difficulty === 'easy') return 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400';
  if (difficulty === 'medium') return 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400';
  return 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400';
}

// --- Progress Ring Component ---
function ProgressRing({
  value,
  size = 72,
  strokeWidth = 5,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  const getColor = (v: number) => {
    if (v >= 70) return { stroke: '#10b981', glow: 'rgba(16,185,129,0.25)' };
    if (v >= 50) return { stroke: '#f59e0b', glow: 'rgba(245,158,11,0.25)' };
    return { stroke: '#ef4444', glow: 'rgba(239,68,68,0.25)' };
  };

  const color = getColor(value);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Subtle pulsing glow ring */}
      <div
        className="absolute inset-[-4px] rounded-full animate-ring-pulse"
        style={{ background: `radial-gradient(circle, ${color.glow} 0%, transparent 70%)` }}
        aria-hidden="true"
      />
      <svg
        className="-rotate-90"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200 dark:text-gray-700"
        />
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color.stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.3s ease',
            filter: `drop-shadow(0 0 4px ${color.glow})`,
          }}
        />
      </svg>
      {/* Percentage text in center */}
      <span
        className={`absolute text-sm font-bold ${
          value >= 70
            ? 'text-emerald-600 dark:text-emerald-400'
            : value >= 50
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-red-500 dark:text-red-400'
        }`}
      >
        {value}%
      </span>
    </div>
  );
}

export function StatsPanel({ isOpen, onClose, language, onOpenStudyPlan }: StatsPanelProps) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);

  const generateInsights = useCallback(async () => {
    setIsLoadingInsights(true);
    setInsightsError(null);
    try {
      const res = await fetch('/api/quiz-stats/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setInsightsError(err.error || (language === 'zh' ? '生成失敗，請再試。' : 'Failed to generate. Please try again.'));
        return;
      }
      const data = (await res.json()) as InsightsData;
      setInsights(data);
    } catch {
      setInsightsError(language === 'zh' ? '網絡錯誤，請再試。' : 'Network error. Please try again.');
    } finally {
      setIsLoadingInsights(false);
    }
  }, [language]);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/quiz-stats');
      if (!res.ok) {
        console.error('Failed to fetch quiz stats:', res.status);
        return;
      }
      const data = await res.json();
      // Defensive: ensure data has expected shape even if API returns unexpected format
      setStats({
        totalAttempts: data.totalAttempts ?? 0,
        correctAttempts: data.correctAttempts ?? 0,
        overallAccuracy: data.overallAccuracy ?? 0,
        topicAccuracy: Array.isArray(data.topicAccuracy) ? data.topicAccuracy : [],
        difficultyAccuracy: Array.isArray(data.difficultyAccuracy) ? data.difficultyAccuracy : [],
        recentAttempts: Array.isArray(data.recentAttempts) ? data.recentAttempts : [],
        streak: data.streak ?? 0,
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchStats();
    }
  }, [isOpen, fetchStats]);

  const handleReset = async () => {
    setIsResetting(true);
    try {
      const deleteRes = await fetch('/api/quiz-attempt', { method: 'DELETE' });
      if (!deleteRes.ok) {
        console.error('Failed to reset quiz attempts:', deleteRes.status);
        setIsResetting(false);
        return;
      }
      // Brief delay to let DB settle after deleteMany
      await new Promise(resolve => setTimeout(resolve, 200));
      await fetchStats();
    } catch (err) {
      console.error('Reset error:', err);
    } finally {
      setIsResetting(false);
      setResetDialogOpen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4">
      <div className="fixed inset-0 bg-black/50 dark:bg-black/70" onClick={onClose} />
      <div className="relative bg-white dark:bg-[#1a1a1a] rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto z-10 scrollbar-thin">
        {/* Gradient accent bar at top */}
        <div className="h-1 rounded-t-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500" />
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-[#1a1a1a] rounded-t-2xl z-10">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40">
              <BarChart3 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
              {language === 'en' ? 'Study Statistics' : '學習統計'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-xs text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg gap-1.5 hover:border-red-200 dark:hover:border-red-800 border border-transparent transition-all duration-200"
              onClick={() => setResetDialogOpen(true)}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">
                {language === 'en' ? 'Reset' : '重置'}
              </span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
              onClick={onClose}
              aria-label={language === 'en' ? 'Close' : '關閉'}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Inline Reset Confirmation — avoids Radix AlertDialog portal z-index conflicts */}
        {resetDialogOpen && (
          <div className="absolute inset-0 z-20 bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-sm rounded-2xl flex items-center justify-center p-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#222] rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl p-5 max-w-sm w-full space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30">
                  <RotateCcw className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {language === 'en' ? 'Reset Statistics?' : '重置統計數據？'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {language === 'en'
                      ? 'This will permanently delete all quiz records. This action cannot be undone.'
                      : '呢個動作會永久刪除你所有嘅測驗紀錄。呢個操作無法撤回。'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setResetDialogOpen(false)}
                  disabled={isResetting}
                  className="rounded-lg"
                >
                  {language === 'en' ? 'Cancel' : '取消'}
                </Button>
                <Button
                  onClick={handleReset}
                  disabled={isResetting}
                  className="bg-red-600 hover:bg-red-700 text-white rounded-lg gap-1.5"
                >
                  {isResetting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {isResetting
                    ? (language === 'en' ? 'Resetting...' : '重置中...')
                    : (language === 'en' ? 'Reset All' : '全部重置')}
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        <div className="p-5 space-y-6">
          {isLoading && !stats ? (
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="space-y-6 py-4"
            >
              {/* Skeleton stat cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Skeleton className="h-8 w-8 rounded-lg mx-auto" />
                  <Skeleton className="h-7 w-12 mx-auto" />
                  <Skeleton className="h-3 w-16 mx-auto" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-8 w-8 rounded-lg mx-auto" />
                  <Skeleton className="h-7 w-12 mx-auto" />
                  <Skeleton className="h-3 w-16 mx-auto" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-8 w-8 rounded-lg mx-auto" />
                  <Skeleton className="h-7 w-12 mx-auto" />
                  <Skeleton className="h-3 w-16 mx-auto" />
                </div>
              </div>
              {/* Skeleton progress bar */}
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <Skeleton className="h-2.5 w-full rounded-full" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <Skeleton className="h-2.5 w-full rounded-full" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <Skeleton className="h-2.5 w-full rounded-full" />
                </div>
              </div>
            </motion.div>
          ) : stats && stats.totalAttempts === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800">
                <BarChart3 className="h-8 w-8 text-gray-400 dark:text-gray-500" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {language === 'en'
                    ? 'No Data Yet'
                    : '暫無數據'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                  {language === 'en'
                    ? 'Complete some quiz questions to see your study statistics here.'
                    : '完成啲測驗題目後，呢度會顯示你嘅學習統計。'}
                </p>
              </div>
            </div>
          ) : stats ? (
            <>
              {/* Overall Stats Cards */}
              <div className="grid grid-cols-3 gap-3">
                {/* Total Questions */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-4 text-center shadow-inner shadow-emerald-100/50 dark:shadow-emerald-900/20 hover-lift">
                  <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 mx-auto mb-2">
                    <Brain className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stats.totalAttempts}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    {language === 'en' ? 'Total Questions' : '總題數'}
                  </p>
                </div>

                {/* Correct Rate — with progress ring */}
                <div
                  className={`rounded-xl p-4 text-center bg-gradient-to-br ${
                    stats.overallAccuracy >= 70
                      ? 'from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20'
                      : stats.overallAccuracy >= 50
                        ? 'from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20'
                        : 'from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20'
                  }`}
                >
                  <div className="flex justify-center mb-2">
                    <ProgressRing value={stats.overallAccuracy} size={72} strokeWidth={5} />
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    {language === 'en' ? 'Correct Rate' : '正確率'}
                  </p>
                </div>

                {/* Current Streak — with celebration animation */}
                <div className={`rounded-xl p-4 text-center hover-lift ${stats.streak >= 5 ? 'bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-amber-900/20 dark:via-orange-900/15 dark:to-rose-900/20 ring-1 ring-amber-200/40 dark:ring-amber-700/30' : 'bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20'}`}>
                  <div className={`flex items-center justify-center h-8 w-8 rounded-lg ${stats.streak >= 5 ? 'bg-orange-100 dark:bg-orange-900/40' : 'bg-rose-100 dark:bg-rose-900/40'} mx-auto mb-2 ${stats.streak >= 5 ? 'animate-celebrate' : ''}`}>
                    <Flame className={`h-4 w-4 ${stats.streak >= 5 ? 'text-orange-500 animate-pulse' : 'text-orange-500 dark:text-orange-400'}`} />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stats.streak}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    {language === 'en' ? 'Streak' : '連續正確'}
                  </p>
                  {stats.streak >= 5 && (
                    <motion.p
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                      className="text-[10px] text-orange-600 dark:text-orange-400 font-semibold mt-1"
                    >
                      🔥 {language === 'en' ? `${stats.streak} streak!` : `連續${stats.streak}題！`}
                    </motion.p>
                  )}
                </div>
              </div>

              {/* Topic Breakdown */}
              {stats.topicAccuracy.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {language === 'en' ? 'Topic Breakdown' : '主題分佈'}
                    </h3>
                  </div>
                  <div className="space-y-2.5">
                    {stats.topicAccuracy.map((topic) => (
                      <div key={topic.topicId} className="space-y-1.5 group/bar">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600 dark:text-gray-300 font-medium truncate max-w-[60%]">
                            {topic.topicName}
                          </span>
                          <span className="text-gray-400 dark:text-gray-500 shrink-0">
                            {topic.correct}/{topic.total}{' '}
                            <span className={`opacity-0 group-hover/bar:opacity-100 transition-opacity duration-200 font-semibold ${getAccuracyColor(topic.accuracy)}`}>
                              ({topic.accuracy}%)
                            </span>
                          </span>
                        </div>
                        <div className={`h-2.5 rounded-full ${getAccuracyBarBg(topic.accuracy)} overflow-hidden`}>
                          <div
                            className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${
                              topic.accuracy >= 70
                                ? 'from-emerald-400 to-emerald-500'
                                : topic.accuracy >= 50
                                  ? 'from-amber-400 to-amber-500'
                                  : 'from-red-400 to-red-500'
                            }`}
                            style={{ width: `${topic.accuracy}%`, backgroundImage: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)', backgroundSize: '200% 100%', animation: 'shimmerBar 2s ease-in-out infinite' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator className="dark:bg-gray-800" />

              {/* Difficulty Breakdown */}
              {stats.difficultyAccuracy.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {language === 'en' ? 'Difficulty Breakdown' : '難度分佈'}
                  </h3>
                  <div className="space-y-4">
                    {['easy', 'medium', 'hard'].map((diff) => {
                      const stat = stats.difficultyAccuracy.find(
                        (d) => d.difficulty === diff
                      );
                      if (!stat) return null;

                      return (
                        <div key={diff} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="secondary"
                                className={`text-[10px] border-0 ${getDifficultyBadge(diff)}`}
                              >
                                {getDifficultyLabel(diff, language)}
                              </Badge>
                              <span className="text-gray-400 dark:text-gray-500">
                                {stat.correct}/{stat.total}
                              </span>
                            </div>
                            <span
                              className={`font-medium ${getAccuracyColor(stat.accuracy)}`}
                            >
                              {stat.accuracy}%
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${
                                diff === 'easy'
                                  ? 'from-emerald-400 to-teal-500'
                                  : diff === 'medium'
                                    ? 'from-amber-400 to-orange-500'
                                    : 'from-red-400 to-rose-500'
                              }`}
                              style={{ width: `${stat.accuracy}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <Separator className="dark:bg-gray-800" />

              {/* AI Weak-Concept Insights */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {language === 'en' ? 'AI Weak-Concept Analysis' : 'AI 弱點概念分析'}
                    </h3>
                  </div>
                  {insights && !isLoadingInsights && (
                    <button
                      onClick={generateInsights}
                      className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      {language === 'en' ? 'Regenerate' : '重新生成'}
                    </button>
                  )}
                </div>

                {!insights && !isLoadingInsights && !insightsError && (
                  <div className="rounded-xl border border-dashed border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-900/10 p-4 text-center space-y-3">
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                      {language === 'en'
                        ? 'Let AI read your wrong answers and identify the SPECIFIC concepts you don\'t fully understand — not just the topic.'
                        : '畀 AI 讀過你做錯嘅題目，幫你揾出具體唔識嘅概念 — 唔只係主題咁籠統。'}
                    </p>
                    <Button
                      onClick={generateInsights}
                      size="sm"
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg gap-1.5 h-8 text-xs"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      {language === 'en' ? 'Generate Insights' : '生成分析'}
                    </Button>
                  </div>
                )}

                {isLoadingInsights && (
                  <div className="rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-900/10 p-4 flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                    <span className="text-xs text-gray-600 dark:text-gray-300">
                      {language === 'en' ? 'AI is analysing your wrong answers…' : 'AI 正在分析你嘅錯題…'}
                    </span>
                  </div>
                )}

                {insightsError && !isLoadingInsights && (
                  <div className="rounded-xl border border-red-200 dark:border-red-800/50 bg-red-50/50 dark:bg-red-900/10 p-3 text-xs text-red-600 dark:text-red-400 flex items-center justify-between gap-2">
                    <span>{insightsError}</span>
                    <button
                      onClick={generateInsights}
                      className="shrink-0 text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                    >
                      {language === 'en' ? 'Retry' : '重試'}
                    </button>
                  </div>
                )}

                {insights && !isLoadingInsights && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-3"
                  >
                    {insights.summary && (
                      <div className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200/60 dark:border-amber-800/40 p-3.5">
                        <p className="text-xs text-gray-700 dark:text-gray-200 leading-relaxed">
                          {insights.summary}
                        </p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2">
                          {language === 'en'
                            ? `Based on your last ${insights.totalAnalyzed} wrong answers`
                            : `基於你最近 ${insights.totalAnalyzed} 條錯題`}
                        </p>
                      </div>
                    )}

                    {insights.weakConcepts.length === 0 && !insights.summary && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-4">
                        {language === 'en' ? 'No clear weak concepts detected yet.' : '暫時揾唔到明顯嘅弱點概念。'}
                      </p>
                    )}

                    {insights.weakConcepts.map((c, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-800/30 p-3.5 space-y-2"
                      >
                        <div className="flex items-start gap-2">
                          <div className="shrink-0 flex items-center justify-center h-6 w-6 rounded-md bg-amber-100 dark:bg-amber-900/40">
                            <BookMarked className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-snug">
                              {c.title}
                            </h4>
                            {c.topicName && (
                              <Badge
                                variant="secondary"
                                className="mt-1 text-[10px] px-1.5 py-0 h-4 font-normal bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                              >
                                {c.topicName}
                              </Badge>
                            )}
                          </div>
                          <span className="shrink-0 text-[10px] text-gray-400 dark:text-gray-500">
                            {language === 'en'
                              ? `${c.evidenceQuestionIds.length} Q`
                              : `${c.evidenceQuestionIds.length} 題`}
                          </span>
                        </div>
                        {c.summary && (
                          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed pl-8">
                            {c.summary}
                          </p>
                        )}
                        {c.recommendation && (
                          <div className="pl-8">
                            <div className="rounded-lg bg-emerald-50/60 dark:bg-emerald-900/15 border border-emerald-100 dark:border-emerald-800/30 px-2.5 py-2 flex items-start gap-1.5">
                              <Sparkles className="h-3 w-3 text-emerald-600 dark:text-emerald-400 mt-[3px] shrink-0" />
                              <p className="text-[11px] text-emerald-700 dark:text-emerald-300 leading-relaxed">
                                {c.recommendation}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>

              <Separator className="dark:bg-gray-800" />

              {/* Generate Study Plan Button */}
              <Button
                onClick={onOpenStudyPlan}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium text-sm gap-2 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div className="flex items-center justify-center h-5 w-5 rounded-md bg-white/20">
                  <Calendar className="h-3.5 w-3.5" />
                </div>
                <span>{language === 'en' ? 'Generate Study Plan' : '生成學習計劃'}</span>
                <Sparkles className="h-3.5 w-3.5 ml-auto" />
              </Button>

              {/* Recent Activity */}
              {stats.recentAttempts.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {language === 'en' ? 'Recent Activity' : '最近活動'}
                  </h3>
                  <div className="space-y-0 max-h-48 overflow-y-auto scrollbar-thin pr-1 relative">
                    {/* Timeline connecting line */}
                    <div className="absolute left-[11px] top-2 bottom-2 w-px bg-gray-200 dark:bg-gray-700" />
                    {[...stats.recentAttempts].reverse().slice(0, 10).map((attempt, idx) => (
                      <div
                        key={attempt.id}
                        className="flex items-center gap-3 py-2.5 relative"
                      >
                        <div className="shrink-0 relative z-10">
                          {attempt.isCorrect ? (
                            <CheckCircle2 className="h-[18px] w-[18px] text-emerald-500 dark:text-emerald-400" />
                          ) : (
                            <XCircle className="h-[18px] w-[18px] text-red-400 dark:text-red-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
                            {attempt.topicName}
                          </p>
                        </div>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 shrink-0">
                          {new Date(attempt.createdAt).toLocaleTimeString(
                            language === 'en' ? 'en-US' : 'zh-CN',
                            { hour: '2-digit', minute: '2-digit' }
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
