'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Trophy,
  Loader2,
  GraduationCap,
  BarChart3,
  Sparkles,
  BookOpen,
  Hash,
  Layers,
  ArrowUpDown,
  ShieldCheck,
  Link,
  Gauge,
  Globe,
  Play,
  Code,
  RotateCcw,
  Check,
  Database,
  AlertCircle,
  Timer,
  Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { logStudyActivity } from '@/components/study-progress';

interface QuizPanelProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'zh';
  quizKey: number;
  onOpenStats?: () => void;
}

interface QuizOption {
  id: 'a' | 'b' | 'c' | 'd';
  textEn: string;
  textZh: string;
}

interface QuizQuestion {
  id: string;
  questionEn: string;
  questionZh: string;
  options: QuizOption[];
  topicId: string;
  topicNameEn: string;
  topicNameZh: string;
  difficulty: string;
}

type Difficulty = 'all' | 'easy' | 'medium' | 'hard';

interface TopicInfo {
  id: string;
  nameEn: string;
  nameZh: string;
  icon: React.ReactNode;
}

const topicInfos: TopicInfo[] = [
  { id: 'network-fundamentals', nameEn: 'Network Fundamentals', nameZh: '網絡基礎', icon: <Layers className="h-4 w-4" /> },
  { id: 'transport-layer', nameEn: 'Transport Layer', nameZh: '傳輸層', icon: <ArrowUpDown className="h-4 w-4" /> },
  { id: 'reliable-transmission', nameEn: 'Reliable Transmission', nameZh: '可靠傳輸', icon: <ShieldCheck className="h-4 w-4" /> },
  { id: 'tcp-connection', nameEn: 'TCP Connection', nameZh: 'TCP連接', icon: <Link className="h-4 w-4" /> },
  { id: 'flow-congestion-control', nameEn: 'Flow & Congestion Control', nameZh: '流量與擁塞控制', icon: <Gauge className="h-4 w-4" /> },
  { id: 'web-http', nameEn: 'Web & HTTP', nameZh: 'Web與HTTP', icon: <Globe className="h-4 w-4" /> },
  { id: 'video-streaming', nameEn: 'Video Streaming', nameZh: '視頻流', icon: <Play className="h-4 w-4" /> },
  { id: 'practical-tips', nameEn: 'Practical Tips', nameZh: '實用技巧', icon: <Code className="h-4 w-4" /> },
];

const questionCounts = [5, 10, 15, 20];

const timerOptions = [
  { seconds: 15, labelEn: '15s', labelZh: '15秒' },
  { seconds: 30, labelEn: '30s', labelZh: '30秒' },
  { seconds: 60, labelEn: '60s', labelZh: '60秒' },
  { seconds: 0, labelEn: 'Off', labelZh: '關閉' },
];

const difficulties: { id: Difficulty; labelEn: string; labelZh: string; color: string; bgColor: string }[] = [
  { id: 'easy', labelEn: 'Easy', labelZh: '簡單', color: 'text-emerald-700 dark:text-emerald-400', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800' },
  { id: 'medium', labelEn: 'Medium', labelZh: '中等', color: 'text-amber-700 dark:text-amber-400', bgColor: 'bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800' },
  { id: 'hard', labelEn: 'Hard', labelZh: '困難', color: 'text-red-700 dark:text-red-400', bgColor: 'bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800' },
];

type Phase = 'config' | 'quiz' | 'results';

type TimerMode = 'per-question' | 'total' | 'off';

interface QuizState {
  questions: QuizQuestion[];
  currentIndex: number;
  selectedOptionId: string | null;
  isAnswered: boolean;
  isCorrect: boolean | null;
  correctAnswer: string | null;
  explanationEn: string;
  explanationZh: string;
  score: number;
  isFinished: boolean;
  isLoading: boolean;
  isLoadingAnswer: boolean;
}

export function QuizPanel({ isOpen, onClose, language, quizKey, onOpenStats }: QuizPanelProps) {
  const [phase, setPhase] = useState<Phase>('config');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('all');
  const [selectedCount, setSelectedCount] = useState(5);
  const [selectedTimer, setSelectedTimer] = useState(0); // seconds per question, 0=off
  const [quizConfig, setQuizConfig] = useState<{ topics: string[]; difficulty: Difficulty; count: number; timerSeconds: number } | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTimeUsed, setTotalTimeUsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const questionStartRef = useRef<number>(0);
  const [kbAnswers, setKbAnswers] = useState<Record<string, { correctAnswer: string; explanationEn: string; explanationZh: string }>>({});
  const [kbError, setKbError] = useState<string | null>(null);

  const [state, setState] = useState<QuizState>({
    questions: [],
    currentIndex: 0,
    selectedOptionId: null,
    isAnswered: false,
    isCorrect: null,
    correctAnswer: null,
    explanationEn: '',
    explanationZh: '',
    score: 0,
    isFinished: false,
    isLoading: true,
    isLoadingAnswer: false,
  });

  // quizKey is used as `key` prop in parent to force remount on new quiz

  const toggleTopic = (topicId: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topicId) ? prev.filter((t) => t !== topicId) : [...prev, topicId]
    );
  };

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startTimer = useCallback((seconds: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (seconds <= 0) return;
    setTimeLeft(seconds);
    questionStartRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          // Auto-submit: time ran out, treat as unanswered
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const elapsed = questionStartRef.current > 0 ? Math.round((Date.now() - questionStartRef.current) / 1000) : 0;
    setTotalTimeUsed((prev) => prev + elapsed);
    questionStartRef.current = 0;
  }, []);

  // Auto-submit when timer reaches 0
  useEffect(() => {
    if (phase === 'quiz' && !state.isLoading && !state.isAnswered && timeLeft === 0 && quizConfig && quizConfig.timerSeconds > 0 && state.questions.length > 0) {
      // Time's up — auto-move to next without answering
      if (state.currentIndex < state.questions.length - 1) {
        setState((prev) => ({
          ...prev,
          currentIndex: prev.currentIndex + 1,
          selectedOptionId: null,
          isAnswered: false,
          isCorrect: null,
          correctAnswer: null,
          explanationEn: '',
          explanationZh: '',
        }));
        startTimer(quizConfig.timerSeconds);
      } else {
        setState((prev) => ({ ...prev, isFinished: true }));
        setPhase('results');
        stopTimer();
      }
    }
  }, [timeLeft, phase, state.isLoading, state.isAnswered, state.currentIndex, state.questions.length, quizConfig, startTimer, stopTimer]);

  const startQuiz = async () => {
    const config = {
      topics: selectedTopics.length > 0 ? selectedTopics : [],
      difficulty: selectedDifficulty,
      count: selectedCount,
      timerSeconds: selectedTimer,
    };
    setQuizConfig(config);
    setPhase('quiz');
    setKbError(null);

    // Always use AI-generated questions from knowledge base
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 250_000); // 250 second client timeout

      const res = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          count: config.count,
          difficulty: config.difficulty === 'all' ? undefined : config.difficulty,
          topics: config.topics.length > 0 ? config.topics : undefined,
          language,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await res.json();

      if (!res.ok || !data.questions || data.questions.length === 0) {
        const errorMsg = data.error || data.details || (language === 'en'
          ? 'Failed to generate quiz questions. Please try again.'
          : '生成測驗題目失敗，請重試。');
        setKbError(errorMsg);
        setPhase('config');
        return;
      }

      setKbAnswers(data.answers || {});
      setState({
        questions: data.questions,
        currentIndex: 0,
        selectedOptionId: null,
        isAnswered: false,
        isCorrect: null,
        correctAnswer: null,
        explanationEn: '',
        explanationZh: '',
        score: 0,
        isFinished: false,
        isLoading: false,
        isLoadingAnswer: false,
      });
      setTotalTimeUsed(0);
      if (selectedTimer > 0) {
        startTimer(selectedTimer);
      }
    } catch {
      setKbError(language === 'en'
        ? 'Failed to generate quiz. Please try again.'
        : '生成測驗失敗，請重試。');
      setPhase('config');
    }
  };

  const handleSelectAnswer = async (optionId: string) => {
    if (state.isAnswered || state.isLoadingAnswer) return;

    setState((prev) => ({
      ...prev,
      selectedOptionId: optionId,
      isLoadingAnswer: true,
    }));

    try {
      let data: { isCorrect: boolean; correctAnswer: string; explanationEn: string; explanationZh: string };

      // Always use check-kb endpoint since all quizzes are KB-based
      if (Object.keys(kbAnswers).length > 0) {
        const res = await fetch('/api/quiz/check-kb', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questionId: state.questions[state.currentIndex].id,
            selectedOptionId: optionId,
            answers: kbAnswers,
          }),
        });
        data = await res.json();
      } else {
        throw new Error('No answer data available');
      }

      const newIsCorrect = data.isCorrect;
      const newScore = newIsCorrect ? state.score + 1 : state.score;

      setState((prev) => ({
        ...prev,
        isAnswered: true,
        isCorrect: newIsCorrect,
        correctAnswer: data.correctAnswer,
        explanationEn: data.explanationEn,
        explanationZh: data.explanationZh,
        score: newScore,
        isLoadingAnswer: false,
      }));
      stopTimer();

      // Log quiz activity and save quiz attempt in background
      logStudyActivity('quiz');

      const currentQ = state.questions[state.currentIndex];
      const selectedOpt = currentQ.options.find((o) => o.id === optionId);
      const correctOpt = currentQ.options.find((o) => o.id === data.correctAnswer);
      fetch('/api/quiz-attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: currentQ.id,
          topicId: currentQ.topicId,
          topicName: language === 'en' ? currentQ.topicNameEn : currentQ.topicNameZh,
          difficulty: currentQ.difficulty,
          selectedAnswer: optionId,
          correctAnswer: data.correctAnswer,
          isCorrect: newIsCorrect,
          language,
          questionText: language === 'en' ? currentQ.questionEn : currentQ.questionZh,
          selectedAnswerText: selectedOpt ? (language === 'en' ? selectedOpt.textEn : selectedOpt.textZh) : null,
          correctAnswerText: correctOpt ? (language === 'en' ? correctOpt.textEn : correctOpt.textZh) : null,
          explanation: language === 'en' ? data.explanationEn : data.explanationZh,
        }),
      }).catch(() => {});
    } catch {
      setState((prev) => ({ ...prev, isLoadingAnswer: false }));
    }
  };

  const handleNext = () => {
    if (state.currentIndex < state.questions.length - 1) {
      setState((prev) => ({
        ...prev,
        currentIndex: prev.currentIndex + 1,
        selectedOptionId: null,
        isAnswered: false,
        isCorrect: null,
        correctAnswer: null,
        explanationEn: '',
        explanationZh: '',
      }));
      if (quizConfig && quizConfig.timerSeconds > 0) {
        startTimer(quizConfig.timerSeconds);
      }
    } else {
      setState((prev) => ({ ...prev, isFinished: true }));
      setPhase('results');
      stopTimer();
    }
  };

  const handleRestart = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setPhase('config');
    setSelectedTopics([]);
    setSelectedDifficulty('all');
    setSelectedCount(5);
    setSelectedTimer(0);
    setQuizConfig(null);
    setKbAnswers({});
    setKbError(null);
    setTimeLeft(0);
    setTotalTimeUsed(0);
  };

  // Format seconds as MM:SS or just seconds
  const formatTime = (secs: number) => {
    if (secs >= 60) return `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
    return `${secs}`;
  };

  // Timer color based on urgency
  const getTimerColor = () => {
    if (!quizConfig || quizConfig.timerSeconds <= 0) return '';
    const ratio = timeLeft / quizConfig.timerSeconds;
    if (ratio > 0.5) return 'text-emerald-600 dark:text-emerald-400';
    if (ratio > 0.25) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400 animate-pulse';
  };

  // Timer ring progress
  const getTimerRingColor = () => {
    if (!quizConfig || quizConfig.timerSeconds <= 0) return 'stroke-emerald-500';
    const ratio = timeLeft / quizConfig.timerSeconds;
    if (ratio > 0.5) return 'stroke-emerald-500';
    if (ratio > 0.25) return 'stroke-amber-500';
    return 'stroke-red-500';
  };

  if (!isOpen) return null;

  const currentQ = state.questions[state.currentIndex];
  const difficultyColor = currentQ?.difficulty === 'easy'
    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
    : currentQ?.difficulty === 'medium'
      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4">
      <div className="fixed inset-0 bg-black/50 dark:bg-black/70" onClick={onClose} />
      <div className="relative bg-white dark:bg-[#1a1a1a] rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] sm:max-h-[85vh] overflow-hidden z-10 flex flex-col">
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a1a1a]">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40">
              <GraduationCap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex flex-col">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-sm leading-tight">
                {language === 'en' ? 'Quiz Mode' : '測驗模式'}
              </h2>
              {phase === 'quiz' && !state.isLoading && (
                <p className="text-[11px] text-gray-400">
                  {language === 'en' ? 'Question' : '問題'} {state.currentIndex + 1}/{state.questions.length}
                </p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 touch-manipulation"
            onClick={onClose}
            aria-label="Close quiz"
          >
            <X className="h-4 w-4 text-gray-500" />
          </Button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {/* ===================== CONFIG PHASE ===================== */}
          {phase === 'config' && (
            <div className="p-5 space-y-6">
              {/* Title */}
              <div className="text-center space-y-1.5">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 shadow-sm">
                  <Sparkles className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {language === 'en' ? 'Customize Your Quiz' : '自定義測驗'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {language === 'en'
                    ? 'AI-generated questions from knowledge base'
                    : '基於知識庫嘅 AI 生成題目'}
                </p>
              </div>

              {/* Knowledge Base Source Indicator */}
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20">
                <Database className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                  {language === 'en'
                    ? 'Questions generated from knowledge base by AI'
                    : '由 AI 從知識庫自動生成題目'}
                </span>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {kbError && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex items-start gap-2.5 p-3 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 text-xs"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{kbError}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Step 1: Select Topics */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    <BookOpen className="h-3.5 w-3.5 inline mr-1.5 text-emerald-500" />
                    {language === 'en' ? 'Select Topics' : '選擇主題'}
                  </label>
                  <button
                    onClick={() => setSelectedTopics([])}
                    className="text-[11px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {language === 'en' ? 'Clear' : '清除'}
                  </button>
                </div>
                <p className="text-[11px] text-gray-400">
                  {language === 'en'
                    ? 'Leave empty for all topics'
                    : '唔揀即係全部主題'}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {topicInfos.map((topic) => {
                    const isSelected = selectedTopics.includes(topic.id);
                    return (
                      <motion.button
                        key={topic.id}
                        onClick={() => toggleTopic(topic.id)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all duration-200 touch-manipulation ${
                          isSelected
                            ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 shadow-sm shadow-emerald-500/10'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                        whileTap={{ scale: 0.97 }}
                      >
                        {isSelected ? (
                          <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                        ) : (
                          <span className="shrink-0 text-gray-400">{topic.icon}</span>
                        )}
                        <span className="truncate">
                          {language === 'en' ? topic.nameEn : topic.nameZh}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Select Difficulty */}
              <div className="space-y-2.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {language === 'en' ? 'Difficulty Level' : '難度級別'}
                </label>
                <div className="flex gap-2">
                  {/* "All" option */}
                  <button
                    onClick={() => setSelectedDifficulty('all')}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all duration-200 touch-manipulation ${
                      selectedDifficulty === 'all'
                        ? 'border-gray-400 dark:border-gray-500 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-sm'
                        : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    {selectedDifficulty === 'all' && <Check className="h-3.5 w-3.5" />}
                    {language === 'en' ? 'All' : '全部'}
                  </button>
                  {difficulties.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setSelectedDifficulty(d.id)}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all duration-200 touch-manipulation ${
                        selectedDifficulty === d.id
                          ? `${d.bgColor} ${d.color} shadow-sm`
                          : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      {selectedDifficulty === d.id && <Check className="h-3.5 w-3.5" />}
                      {language === 'en' ? d.labelEn : d.labelZh}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Question Count */}
              <div className="space-y-2.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {language === 'en' ? 'Number of Questions' : '題目數量'}
                </label>
                <div className="flex gap-2">
                  {questionCounts.map((count) => (
                    <button
                      key={count}
                      onClick={() => setSelectedCount(count)}
                      className={`flex-1 flex items-center justify-center px-3 py-2.5 rounded-xl border text-sm font-bold transition-all duration-200 touch-manipulation ${
                        selectedCount === count
                          ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 shadow-sm shadow-emerald-500/10'
                          : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 4: Timer */}
              <div className="space-y-2.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Timer className="h-3.5 w-3.5 inline mr-1.5 text-emerald-500" />
                  {language === 'en' ? 'Time per Question' : '每題限時'}
                </label>
                <div className="flex gap-2">
                  {timerOptions.map((opt) => (
                    <button
                      key={opt.seconds}
                      onClick={() => setSelectedTimer(opt.seconds)}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all duration-200 touch-manipulation ${
                        selectedTimer === opt.seconds
                          ? opt.seconds === 0
                            ? 'border-gray-400 dark:border-gray-500 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-sm'
                            : 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 shadow-sm shadow-emerald-500/10'
                          : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      {selectedTimer === opt.seconds && opt.seconds > 0 && <Timer className="h-3 w-3" />}
                      {language === 'en' ? opt.labelEn : opt.labelZh}
                    </button>
                  ))}
                </div>
                {selectedTimer > 0 && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1"
                  >
                    <Clock className="h-3 w-3" />
                    {language === 'en'
                      ? `Auto-skip when time runs out (${selectedTimer}s/question)`
                      : `逾時自動跳過 (${selectedTimer}秒/題)`}
                  </motion.p>
                )}
              </div>

              {/* Summary & Start Button */}
              <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 p-3 space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>
                    {selectedTopics.length === 0
                      ? (language === 'en' ? 'All topics' : '全部主題')
                      : `${selectedTopics.length} ${language === 'en' ? 'topic(s)' : '個主題'}`}
                    {' · '}
                    {selectedDifficulty === 'all'
                      ? (language === 'en' ? 'All difficulties' : '全部難度')
                      : (language === 'en' ? difficulties.find(d => d.id === selectedDifficulty)?.labelEn : difficulties.find(d => d.id === selectedDifficulty)?.labelZh)}
                    {' · '}
                    {selectedCount} {language === 'en' ? 'questions' : '題'}
                    {selectedTimer > 0 && (
                      <> {' · '}
                        <Timer className="h-3 w-3 inline" /> {selectedTimer}{language === 'en' ? 's/q' : '秒/題'}
                      </>
                    )}
                  </span>
                </div>
                <Button
                  onClick={startQuiz}
                  className="w-full min-h-[44px] bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl gap-2 text-sm font-medium shadow-sm shadow-emerald-500/20 hover:shadow-md hover:shadow-emerald-500/30 transition-all duration-200 touch-manipulation"
                >
                  <Sparkles className="h-4 w-4" />
                  {language === 'en' ? 'Start Quiz' : '開始測驗'}
                </Button>
              </div>
            </div>
          )}

          {/* ===================== LOADING PHASE ===================== */}
          {phase === 'quiz' && state.isLoading && (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <Loader2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400 animate-spin" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {language === 'en' ? 'Generating questions with AI...' : '用 AI 生成題目中...'}
              </p>
              <p className="text-[11px] text-gray-400">
                {language === 'en' ? 'This may take a moment' : '請稍等片刻'}
              </p>
            </div>
          )}

          {/* ===================== QUIZ PHASE ===================== */}
          {phase === 'quiz' && !state.isLoading && currentQ && (
            <div className="p-4 sm:p-5 space-y-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-5">
              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span className="font-medium">
                    {language === 'en' ? 'Question' : '問題'} {state.currentIndex + 1} <span className="text-gray-300 dark:text-gray-600">/</span> {state.questions.length}
                  </span>
                  <div className="flex items-center gap-2">
                    {/* Timer display */}
                    {quizConfig && quizConfig.timerSeconds > 0 && !state.isAnswered && (
                      <motion.div
                        key={`timer-${state.currentIndex}-${timeLeft}`}
                        initial={{ scale: timeLeft <= 5 && timeLeft > 0 ? 1.15 : 1 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full border font-mono font-bold text-xs ${getTimerColor()} ${
                          timeLeft <= 5 && timeLeft > 0
                            ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20'
                            : timeLeft <= quizConfig.timerSeconds * 0.5
                              ? 'border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20'
                              : 'border-emerald-200 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20'
                        }`}
                      >
                        {/* Mini circular timer */}
                        <svg className="h-4 w-4 -rotate-90" viewBox="0 0 20 20">
                          <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-20" />
                          <circle
                            cx="10" cy="10" r="8" fill="none"
                            strokeWidth="2" strokeLinecap="round"
                            className={getTimerRingColor()}
                            style={{
                              strokeDasharray: `${2 * Math.PI * 8}`,
                              strokeDashoffset: `${2 * Math.PI * 8 * (1 - timeLeft / quizConfig.timerSeconds)}`,
                              transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease',
                            }}
                          />
                        </svg>
                        {formatTime(timeLeft)}
                      </motion.div>
                    )}
                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                      {language === 'en' ? currentQ.topicNameEn : currentQ.topicNameZh}
                    </Badge>
                    <Badge className={`text-[10px] h-5 px-1.5 border-0 ${difficultyColor}`} variant="secondary">
                      {currentQ.difficulty === 'easy'
                        ? (language === 'en' ? 'Easy' : '簡單')
                        : currentQ.difficulty === 'medium'
                          ? (language === 'en' ? 'Medium' : '中等')
                          : (language === 'en' ? 'Hard' : '困難')}
                    </Badge>
                  </div>
                </div>
                <Progress
                  value={((state.currentIndex + (state.isAnswered ? 1 : 0)) / state.questions.length) * 100}
                  className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-emerald-400 [&>div]:to-teal-500 rounded-full"
                />
              </div>

              {/* Question card */}
              <div className="rounded-xl p-4 border border-gray-200/60 dark:border-gray-700/40 bg-gradient-to-br from-gray-50/80 to-white dark:from-gray-800/40 dark:to-gray-800/20">
                <h3 className="text-[15px] font-semibold text-gray-900 dark:text-gray-100 leading-relaxed">
                  {language === 'en' ? currentQ.questionEn : currentQ.questionZh}
                </h3>
              </div>

              {/* Options */}
              <div className="space-y-2">
                {currentQ.options.map((option) => {
                  const isSelected = state.selectedOptionId === option.id;
                  const isCorrectAnswer = state.isAnswered && option.id === state.correctAnswer;
                  let optionStyle = 'border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-600 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-all duration-300 ease-out';

                  if (state.isAnswered) {
                    if (isCorrectAnswer) {
                      optionStyle = 'border-emerald-400 dark:border-emerald-500 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 dark:from-emerald-900/30 dark:via-teal-900/20 dark:to-emerald-900/30 text-emerald-800 dark:text-emerald-300 shadow-sm shadow-emerald-500/10';
                    } else if (isSelected && !state.isCorrect) {
                      optionStyle = 'border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300';
                    } else {
                      optionStyle = 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 text-gray-400 dark:text-gray-500 cursor-default';
                    }
                  } else if (isSelected) {
                    optionStyle = 'border-emerald-500 dark:border-emerald-500 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 ring-2 ring-emerald-500/20 dark:ring-emerald-500/30 shadow-sm shadow-emerald-500/10';
                  }

                  return (
                    <motion.button
                      key={option.id}
                      onClick={() => handleSelectAnswer(option.id)}
                      disabled={state.isAnswered || state.isLoadingAnswer}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 min-h-[44px] rounded-xl border text-sm text-left transition-all duration-300 ease-out touch-manipulation ${optionStyle}`}
                      animate={state.isAnswered && isCorrectAnswer ? { scale: [1, 1.015, 1], opacity: [0.7, 1, 1] } : {}}
                      transition={state.isAnswered && isCorrectAnswer ? { duration: 0.5, ease: 'easeOut' } : {}}
                    >
                      <span
                        className={`shrink-0 h-7 w-7 rounded-full border-2 flex items-center justify-center text-xs font-semibold transition-all duration-200 ${
                          isCorrectAnswer
                            ? 'border-emerald-500 bg-emerald-500 text-white'
                            : state.isAnswered && isSelected && !state.isCorrect
                              ? 'border-red-400 bg-red-400 text-white'
                              : isSelected && !state.isAnswered
                                ? 'border-emerald-500 bg-emerald-500 text-white'
                                : 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {isCorrectAnswer ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : state.isAnswered && isSelected && !state.isCorrect ? (
                          <XCircle className="h-3.5 w-3.5" />
                        ) : (
                          option.id.toUpperCase()
                        )}
                      </span>
                      <span className="flex-1 leading-snug">
                        {language === 'en' ? option.textEn : option.textZh}
                      </span>
                      {state.isLoadingAnswer && isSelected && (
                        <Loader2 className="h-4 w-4 animate-spin text-emerald-500 shrink-0" />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Explanation */}
              {state.isAnswered && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`p-4 rounded-xl border text-sm leading-relaxed ${
                    state.isCorrect
                      ? 'bg-gradient-to-r from-emerald-50 to-teal-50/80 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                      : 'bg-gradient-to-r from-amber-50 to-orange-50/80 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                  }`}
                >
                  <p className="font-semibold mb-1.5">
                    {state.isCorrect
                      ? (language === 'en' ? '✓ Correct!' : '✓ 正確！')
                      : (language === 'en' ? '✗ Incorrect' : '✗ 不正確')}
                  </p>
                  <p className="text-[13px]">
                    {language === 'en' ? state.explanationEn : state.explanationZh}
                  </p>
                </motion.div>
              )}

              {/* Next button */}
              {state.isAnswered && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                  <Button
                    onClick={handleNext}
                    className="w-full min-h-[44px] bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl gap-2 text-sm font-medium shadow-sm shadow-emerald-500/20 hover:shadow-md transition-all duration-200 touch-manipulation"
                  >
                    {state.currentIndex < state.questions.length - 1
                      ? (language === 'en' ? 'Next Question' : '下一題')
                      : (language === 'en' ? 'View Results' : '查看結果')}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </div>
          )}

          {/* ===================== RESULTS PHASE ===================== */}
          {phase === 'results' && (
            <div className="p-5 space-y-6">
              {/* Trophy */}
              <div className="text-center space-y-3 pt-4">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 shadow-lg shadow-emerald-500/20"
                >
                  <Trophy className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </motion.div>
                <div className="space-y-1.5">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {state.score === state.questions.length
                      ? (language === 'en' ? 'Perfect!' : '滿分！')
                      : state.score >= state.questions.length * 0.7
                        ? (language === 'en' ? 'Great Job!' : '做得好！')
                        : (language === 'en' ? 'Quiz Complete!' : '測驗完成！')}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {language === 'en'
                      ? `You got ${state.score} out of ${state.questions.length} correct`
                      : `你答對了 ${state.score}/${state.questions.length} 題`}
                  </p>
                </div>

                {/* Score bar */}
                <div className="flex items-center justify-center gap-3">
                  <Progress
                    value={(state.score / state.questions.length) * 100}
                    className="h-3 w-48 [&>div]:bg-gradient-to-r [&>div]:from-emerald-400 [&>div]:to-teal-500 rounded-full"
                  />
                  <span className="text-lg font-bold text-gray-700 dark:text-gray-300">
                    {Math.round((state.score / state.questions.length) * 100)}%
                  </span>
                </div>

                {/* Score feedback */}
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                  state.score === state.questions.length
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : state.score >= state.questions.length * 0.7
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : state.score >= state.questions.length * 0.4
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {state.score === state.questions.length
                    ? (language === 'en' ? '🌟 Perfect Score' : '🌟 滿分')
                    : state.score >= state.questions.length * 0.7
                      ? (language === 'en' ? '👍 Well Done' : '👍 表現不錯')
                      : state.score >= state.questions.length * 0.4
                        ? (language === 'en' ? '📚 Keep Practicing' : '📚 繼續練習')
                        : (language === 'en' ? '💪 Don\'t Give Up!' : '💪 不要放棄！')}
                </div>
              </div>

              {/* Quiz summary */}
              {quizConfig && (
                <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 p-3 space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Database className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                      {language === 'en' ? 'Source: Knowledge Base (AI-generated)' : '來源：知識庫（AI生成）'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>
                      {quizConfig.topics.length === 0
                        ? (language === 'en' ? 'All topics' : '全部主題')
                        : `${quizConfig.topics.length} ${language === 'en' ? 'topic(s)' : '個主題'}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Hash className="h-3.5 w-3.5" />
                    <span>{quizConfig.difficulty === 'all'
                      ? (language === 'en' ? 'All difficulties' : '全部難度')
                      : quizConfig.difficulty}</span>
                  </div>
                  {quizConfig.timerSeconds > 0 && totalTimeUsed > 0 && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        {language === 'en' ? `Total time: ${formatTime(totalTimeUsed)}` : `總用時: ${formatTime(totalTimeUsed)}`}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3 justify-center flex-wrap">
                {onOpenStats && (
                  <Button
                    onClick={onOpenStats}
                    variant="outline"
                    className="rounded-xl gap-2 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 min-h-[40px]"
                  >
                    <BarChart3 className="h-4 w-4" />
                    {language === 'en' ? 'Statistics' : '查看統計'}
                  </Button>
                )}
                <Button
                  onClick={handleRestart}
                  variant="outline"
                  className="rounded-xl gap-2 min-h-[40px]"
                >
                  <RotateCcw className="h-4 w-4" />
                  {language === 'en' ? 'New Quiz' : '新測驗'}
                </Button>
                <Button
                  onClick={onClose}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl gap-2 shadow-sm shadow-emerald-500/20 min-h-[40px]"
                >
                  {language === 'en' ? 'Done' : '完成'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
