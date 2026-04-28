'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  Target,
  TrendingDown,
  BookOpen,
  Lightbulb,
  Brain,
  Clock,
  Award,
  ArrowRight,
  ChevronRight,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface StudyPlanPanelProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'zh';
}

const STUDY_PLAN_CACHE_KEY = 'lp-study-plan';
const STUDY_PLAN_CACHE_TTL = 4 * 60 * 60 * 1000; // 4 hours

interface WeakArea {
  topicName: string;
  accuracy: number;
  severity: string;
  reason: { en: string; zh: string };
}

interface RecommendedTopic {
  topicName: string;
  priority: number;
  focusArea: { en: string; zh: string };
  estimatedHours: number;
  resources: { en: string; zh: string };
}

interface ScheduleDay {
  day: string;
  topic: string;
  duration: string;
  activities: { en: string; zh: string };
}

interface StudyTip {
  en: string;
  zh: string;
}

interface StudyPlan {
  summary: { en: string; zh: string };
  weakAreas: WeakArea[];
  recommendedTopics: RecommendedTopic[];
  studySchedule: ScheduleDay[];
  tips: StudyTip[];
}

function getSeverityColor(severity: string): string {
  if (severity === 'high') return 'bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800';
  if (severity === 'medium') return 'bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800';
  return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800';
}

function getSeverityBadge(severity: string): string {
  if (severity === 'high') return 'bg-red-500 text-white';
  if (severity === 'medium') return 'bg-amber-500 text-white';
  return 'bg-yellow-500 text-white';
}

function getSeverityIcon(severity: string): React.ReactNode {
  if (severity === 'high')
    return <TrendingDown className="h-4 w-4 text-red-500 dark:text-red-400" />;
  if (severity === 'medium')
    return <AlertTriangle className="h-4 w-4 text-amber-500 dark:text-amber-400" />;
  return <Target className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
}

function getSeverityLabel(severity: string, language: 'en' | 'zh'): string {
  if (severity === 'high') return language === 'en' ? 'Critical' : '嚴重';
  if (severity === 'medium') return language === 'en' ? 'Warning' : '警告';
  return language === 'en' ? 'Caution' : '注意';
}

function getPriorityBadge(priority: number): string {
  if (priority <= 2) return 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800';
  if (priority <= 4) return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800';
  return 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800';
}

function getDayColor(index: number): string {
  const colors = [
    'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
    'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400',
    'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400',
    'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400',
    'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400',
    'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400',
  ];
  return colors[index % colors.length];
}

const DAY_SHORT: Record<string, { en: string; zh: string }> = {
  Monday: { en: 'Mon', zh: '週一' },
  Tuesday: { en: 'Tue', zh: '週二' },
  Wednesday: { en: 'Wed', zh: '週三' },
  Thursday: { en: 'Thu', zh: '週四' },
  Friday: { en: 'Fri', zh: '週五' },
  Saturday: { en: 'Sat', zh: '週六' },
  Sunday: { en: 'Sun', zh: '週日' },
};

export function StudyPlanPanel({ isOpen, onClose, language }: StudyPlanPanelProps) {
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedFromData, setGeneratedFromData] = useState(false);
  const [isFromCache, setIsFromCache] = useState(false);

  const clearCache = useCallback(() => {
    try {
      localStorage.removeItem(STUDY_PLAN_CACHE_KEY);
    } catch {
      // ignore localStorage errors
    }
  }, []);

  const fetchStudyPlan = useCallback(async (useCache = true) => {
    // Try to load from cache first
    if (useCache) {
      try {
        const cached = localStorage.getItem(STUDY_PLAN_CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (timestamp + STUDY_PLAN_CACHE_TTL > Date.now()) {
            setStudyPlan(data);
            setIsFromCache(true);
            return;
          }
        }
      } catch {
        // ignore cache errors
      }
    }

    setIsLoading(true);
    setError(null);
    setIsFromCache(false);
    try {
      const res = await fetch('/api/study-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language }),
      });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      setStudyPlan(data.studyPlan);
      setGeneratedFromData(data.generatedFromData);

      // Cache the result
      try {
        localStorage.setItem(STUDY_PLAN_CACHE_KEY, JSON.stringify({
          data: data.studyPlan,
          timestamp: Date.now(),
        }));
      } catch {
        // ignore localStorage errors
      }
    } catch {
      setError(
        language === 'en'
          ? 'Failed to generate study plan. Please try again.'
          : '生成學習計劃失敗，請重試。'
      );
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  useEffect(() => {
    if (isOpen && !studyPlan && !isLoading) {
      fetchStudyPlan(true);
    }
  }, [isOpen, studyPlan, isLoading, fetchStudyPlan]);

  const t = (obj: { en: string; zh: string } | undefined): string => {
    if (!obj) return '';
    return obj[language] || obj.en;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] p-0 gap-0 bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
        {/* Custom Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <DialogHeader className="space-y-0">
            <DialogTitle className="flex items-center gap-2.5 text-lg font-semibold text-gray-900 dark:text-gray-100">
              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40">
                <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                {language === 'en' ? 'Study Plan' : '學習計劃'}
                <DialogDescription className="text-xs font-normal mt-0.5">
                  {language === 'en'
                    ? 'AI-generated personalized study plan'
                    : 'AI生成的個性化學習計劃'}
                </DialogDescription>
                {isFromCache && (
                  <span className="text-[10px] text-gray-400 dark:text-gray-500">
                    ({language === 'en' ? 'cached' : '已緩存'})
                  </span>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-2">
            {studyPlan && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  clearCache();
                  setStudyPlan(null);
                  setIsFromCache(false);
                  fetchStudyPlan(false);
                }}
                className="h-8 px-3 text-xs text-gray-400 dark:text-gray-500 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg gap-1.5 border-gradient"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">
                  {language === 'en' ? 'Regenerate' : '重新生成'}
                </span>
                {isFromCache && (
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 ml-1">
                    ({language === 'en' ? 'cached' : '已緩存'})
                  </span>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[calc(90vh-65px)] overflow-y-auto overscroll-contain custom-scrollbar">
          <div className="p-5 space-y-5">
            {/* Loading State */}
            {isLoading && (
              <div className="relative flex flex-col items-center justify-center py-20 space-y-4">
                {/* Decorative pattern dots for loading */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03]"
                  style={{
                    backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                  }}
                />
                <div className="relative">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center">
                    <Brain className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center">
                    <Sparkles className="h-3 w-3 text-white animate-pulse" />
                  </div>
                </div>
                <div className="space-y-2 text-center">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'en'
                      ? 'Analyzing your quiz performance...'
                      : '分析你的測驗表現...'}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {language === 'en'
                      ? 'Creating a personalized study plan with AI'
                      : '使用AI創建個性化學習計劃'}
                  </p>
                </div>
                <Loader2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 animate-spin" />
              </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
              <div className="text-center py-16 space-y-4">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30">
                  <AlertTriangle className="h-8 w-8 text-red-500 dark:text-red-400" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {language === 'en' ? 'Error' : '錯誤'}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                    {error}
                  </p>
                </div>
                <Button
                  onClick={fetchStudyPlan}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                >
                  {language === 'en' ? 'Try Again' : '重試'}
                </Button>
              </div>
            )}

            {/* Study Plan Content */}
            {studyPlan && !isLoading && !error && (
              <>
                {/* Summary Card */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-4 border border-emerald-200/50 dark:border-emerald-800/50 animate-fade-in-up" style={{ animationDelay: '0ms' }}>
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 shrink-0 mt-0.5">
                      <Award className="h-[18px] w-[18px] text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                        {language === 'en' ? 'Performance Summary' : '表現總結'}
                      </h3>
                      <p className="text-sm text-emerald-700/80 dark:text-emerald-300/80 leading-relaxed">
                        {t(studyPlan.summary)}
                      </p>
                      {!generatedFromData && (
                        <Badge
                          variant="secondary"
                          className="mt-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-0 text-[10px]"
                        >
                          <Lightbulb className="h-3 w-3 mr-1" />
                          {language === 'en'
                            ? 'Default plan — take quizzes for personalization'
                            : '默認計劃——參加測驗以獲得個性化推薦'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Weak Areas */}
                {studyPlan.weakAreas.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-rose-500 dark:text-rose-400" />
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {language === 'en' ? 'Areas for Improvement' : '需要改進的領域'}
                      </h3>
                      <Badge
                        variant="secondary"
                        className="bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 border-0 text-[10px]"
                      >
                        {studyPlan.weakAreas.length}
                      </Badge>
                    </div>
                    <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
                      {studyPlan.weakAreas.map((area, idx) => (
                        <div
                          key={idx}
                          className={`rounded-xl p-3.5 border ${getSeverityColor(area.severity)}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              {getSeverityIcon(area.severity)}
                              <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                                {area.topicName}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span
                                className={`text-xs font-semibold ${
                                  area.accuracy < 40
                                    ? 'text-red-600 dark:text-red-400'
                                    : area.accuracy < 60
                                      ? 'text-amber-600 dark:text-amber-400'
                                      : 'text-yellow-600 dark:text-yellow-400'
                                }`}
                              >
                                {area.accuracy}%
                              </span>
                              <Badge
                                variant="secondary"
                                className={`${getSeverityBadge(area.severity)} text-[10px] border-0 px-2`}
                              >
                                {getSeverityLabel(area.severity, language)}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5 ml-6.5 leading-relaxed">
                            {t(area.reason)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Weak Areas */}
                {studyPlan.weakAreas.length === 0 && (
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-200/50 dark:border-emerald-800/50">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                          {language === 'en'
                            ? 'Great Performance!'
                            : '表現優秀！'}
                        </p>
                        <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-0.5">
                          {language === 'en'
                            ? 'No weak areas detected. Keep up the excellent work!'
                            : '未檢測到薄弱領域。繼續保持出色的表現！'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <Separator className="dark:bg-gray-800" />

                {/* Recommended Study Topics */}
                {studyPlan.recommendedTopics.length > 0 && (
                  <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-teal-500 dark:text-teal-400" />
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {language === 'en'
                          ? 'Recommended Study Topics'
                          : '推薦學習主題'}
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {studyPlan.recommendedTopics.map((topic, idx) => (
                        <div
                          key={idx}
                          className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3.5 border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 shrink-0 mt-0.5">
                              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                                #{topic.priority}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0 space-y-1.5">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                  {topic.topicName}
                                </span>
                                <Badge
                                  variant="secondary"
                                  className={`${getPriorityBadge(topic.priority)} text-[10px] px-1.5`}
                                >
                                  {topic.estimatedHours}h
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                                {t(topic.focusArea)}
                              </p>
                              <div className="flex items-center gap-1.5 text-xs text-teal-600 dark:text-teal-400">
                                <ArrowRight className="h-3 w-3" />
                                <span className="leading-relaxed">{t(topic.resources)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Separator className="dark:bg-gray-800" />

                {/* Weekly Study Schedule */}
                {studyPlan.studySchedule.length > 0 && (
                  <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: '450ms' }}>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-violet-500 dark:text-violet-400" />
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {language === 'en' ? 'Weekly Study Schedule' : '每週學習安排'}
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {studyPlan.studySchedule.map((day, idx) => {
                        const dayInfo = DAY_SHORT[day.day] || { en: day.day, zh: day.day };
                        return (
                          <div
                            key={idx}
                            className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                          >
                            <div
                              className={`flex items-center justify-center h-10 w-10 rounded-xl shrink-0 ${getDayColor(idx)}`}
                            >
                              <span className="text-xs font-bold">
                                {dayInfo[language]}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                  {day.topic}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                  <Clock className="h-3 w-3" />
                                  <span>{day.duration}</span>
                                </div>
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                {t(day.activities)}
                              </p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-300 dark:text-gray-600 shrink-0 mt-2" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <Separator className="dark:bg-gray-800" />

                {/* Study Tips */}
                {studyPlan.tips.length > 0 && (
                  <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {language === 'en' ? 'Study Tips' : '學習建議'}
                      </h3>
                    </div>
                    <div className="grid gap-2">
                      {studyPlan.tips.map((tip, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 p-3 bg-amber-50/50 dark:bg-amber-900/10 rounded-xl border border-amber-100/50 dark:border-amber-800/30"
                        >
                          <div className="flex items-center justify-center h-5 w-5 rounded-full bg-amber-100 dark:bg-amber-900/40 shrink-0 mt-0.5">
                            <Sparkles className="h-2.5 w-2.5 text-amber-600 dark:text-amber-400" />
                          </div>
                          <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                            {t(tip)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
