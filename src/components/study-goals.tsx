'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Target, Plus, X, Check, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface StudyGoal {
  id: string;
  text: string;
  completed: boolean;
  tag?: string;
  createdAt: number;
}

interface StudyGoalsProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'zh';
}

const TOPIC_TAGS = [
  { en: 'TCP', zh: 'TCP' },
  { en: 'UDP', zh: 'UDP' },
  { en: 'HTTP', zh: 'HTTP' },
  { en: 'DNS', zh: 'DNS' },
  { en: 'IP', zh: 'IP' },
  { en: 'Routing', zh: '路由' },
  { en: 'Subnet', zh: '子網' },
  { en: 'Security', zh: '安全' },
  { en: 'OSI', zh: 'OSI' },
  { en: 'General', zh: '綜合' },
];

const STORAGE_KEY = 'lp-study-goals';
const MAX_GOALS = 10;

function loadGoals(): StudyGoal[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as StudyGoal[];
  } catch {}
  return [];
}

function saveGoals(goals: StudyGoal[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
}

export function StudyGoals({ isOpen, onClose, language }: StudyGoalsProps) {
  const { toast } = useToast();
  const [goals, setGoals] = useState<StudyGoal[]>(() => loadGoals());
  const [newGoalText, setNewGoalText] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const mountedRef = useRef(false);

  // Mark as mounted after hydration
  useEffect(() => {
    mountedRef.current = true;
  }, []);

  // Persist goals when they change (after mount)
  useEffect(() => {
    if (mountedRef.current) {
      saveGoals(goals);
    }
  }, [goals]);

  const completedCount = goals.filter((g) => g.completed).length;
  const totalCount = goals.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleAddGoal = useCallback(() => {
    const text = newGoalText.trim();
    if (!text) return;
    if (totalCount >= MAX_GOALS) {
      toast({
        description: language === 'en'
          ? `Maximum ${MAX_GOALS} goals allowed`
          : `最多隻能添加 ${MAX_GOALS} 個目標`,
        variant: 'destructive',
      });
      return;
    }

    const newGoal: StudyGoal = {
      id: `goal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      text,
      completed: false,
      tag: selectedTag || undefined,
      createdAt: Date.now(),
    };

    setGoals((prev) => [...prev, newGoal]);
    setNewGoalText('');
    setSelectedTag('');
  }, [newGoalText, selectedTag, totalCount, language, toast]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddGoal();
      }
    },
    [handleAddGoal]
  );

  const handleToggleGoal = useCallback((id: string) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g))
    );
  }, []);

  const handleDeleteGoal = useCallback((id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }, []);

  const getTagLabel = useCallback(
    (tag: string) => {
      const found = TOPIC_TAGS.find((t) => t.en === tag || t.zh === tag);
      return found ? (language === 'en' ? found.en : found.zh) : tag;
    },
    [language]
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px] max-h-[85vh] flex flex-col p-0 gap-0 bg-white dark:bg-[#1e1e1e]">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 pt-6 pb-2">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
            <Target className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <DialogTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {language === 'en' ? 'Study Goals' : '學習目標'}
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {language === 'en'
                ? 'Track your study progress'
                : '跟蹤你的學習進度'}
            </DialogDescription>
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-6 pb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {language === 'en' ? 'Progress' : '進度'}
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {completedCount}/{totalCount} ({progressPercent}%)
            </span>
          </div>
          <Progress value={progressPercent} className="h-2 bg-gray-100 dark:bg-gray-800" />
        </div>

        {/* Goals list */}
        <div className="flex-1 min-h-0 px-6 overflow-y-auto overscroll-contain custom-scrollbar">
          <div className="space-y-1 pb-2">
            {goals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="h-14 w-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-3">
                  <Sparkles className="h-7 w-7 text-emerald-500 dark:text-emerald-400" />
                </div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                  {language === 'en'
                    ? 'No goals yet!'
                    : '還冇學習目標！'}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 max-w-[220px]">
                  {language === 'en'
                    ? 'Add your first study goal to start tracking your progress. You can do it!'
                    : '添加你的第一個學習目標，開始跟蹤進度。你可以的！'}
                </p>
              </div>
            ) : (
              goals.map((goal) => (
                <div
                  key={goal.id}
                  className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    goal.completed
                      ? 'bg-emerald-50/60 dark:bg-emerald-900/15'
                      : 'bg-gray-50 dark:bg-gray-800/40 hover:bg-gray-100 dark:hover:bg-gray-800/60'
                  }`}
                >
                  <Checkbox
                    checked={goal.completed}
                    onCheckedChange={() => handleToggleGoal(goal.id)}
                    className="shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm leading-snug ${
                        goal.completed
                          ? 'line-through text-gray-400 dark:text-gray-500'
                          : 'text-gray-700 dark:text-gray-200'
                      }`}
                    >
                      {goal.text}
                    </p>
                    {goal.tag && (
                      <Badge
                        variant="secondary"
                        className="mt-1 text-[10px] px-1.5 py-0 h-4 font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-0"
                      >
                        {getTagLabel(goal.tag)}
                      </Badge>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="h-6 w-6 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-150 shrink-0"
                    aria-label={language === 'en' ? 'Delete goal' : '刪除目標'}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Add goal input */}
        <div className="px-6 pb-5 pt-3 border-t border-gray-100 dark:border-gray-800">
          {/* Tag selector */}
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {TOPIC_TAGS.map((tag) => (
              <button
                key={tag.en}
                onClick={() =>
                  setSelectedTag((prev) => (prev === tag.en ? '' : tag.en))
                }
                className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-all duration-150 ${
                  selectedTag === tag.en
                    ? 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {language === 'en' ? tag.en : tag.zh}
              </button>
            ))}
          </div>
          {/* Input row */}
          <div className="flex gap-2">
            <Input
              value={newGoalText}
              onChange={(e) => setNewGoalText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                language === 'en'
                  ? `Add a goal (${MAX_GOALS - totalCount} left)...`
                  : `添加目標 (剩餘${MAX_GOALS - totalCount}個)...`
              }
              maxLength={200}
              disabled={totalCount >= MAX_GOALS}
              className="h-9 text-sm bg-gray-50 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700"
            />
            <Button
              onClick={handleAddGoal}
              disabled={!newGoalText.trim() || totalCount >= MAX_GOALS}
              size="sm"
              className="h-9 px-3 bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
