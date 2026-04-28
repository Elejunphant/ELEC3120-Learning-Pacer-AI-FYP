'use client';

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Sparkles, Loader2, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  Layers,
  ArrowUpDown,
  ShieldCheck,
  Link,
  Gauge,
  Globe,
  Play,
  Code,
  CheckCircle2,
  XCircle,
  RotateCcw,
  RotateCw,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import {
  knowledgeTopics,
} from '@/lib/knowledge-base';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Layers,
  ArrowUpDown,
  ShieldCheck,
  Link,
  Gauge,
  Globe,
  Play,
  Code,
};

interface FlashcardData {
  topicId: string;
  topicTitle: string;
  topicTitleZh: string;
  front: string;
  back: string;
  frontZh?: string;
  backZh?: string;
}

type Screen = 'select' | 'review' | 'results';
type CardSource = 'knowledge-base' | 'ai-generated';

interface FlashcardPanelProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'zh';
}

export function FlashcardPanel({
  isOpen,
  onClose,
  language,
}: FlashcardPanelProps) {
  const [screen, setScreen] = useState<Screen>('select');
  const [selectedTopicIds, setSelectedTopicIds] = useState<Set<string>>(new Set());
  const [cardSource, setCardSource] = useState<CardSource>('knowledge-base');
  const [aiCardCount, setAiCardCount] = useState(8);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [cards, setCards] = useState<FlashcardData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownIds, setKnownIds] = useState<Set<string>>(new Set());
  const [unknownIds, setUnknownIds] = useState<Set<string>>(new Set());
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());
  const panelRef = useRef<HTMLDivElement>(null);
  const wheelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentIndexRef = useRef(currentIndex);
  const cardsRef = useRef(cards);
  const screenRef = useRef(screen);

  // Keep refs in sync with state (avoids stale closures in document-level listener)
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { cardsRef.current = cards; }, [cards]);
  useEffect(() => { screenRef.current = screen; }, [screen]);

  // Mouse wheel support for card navigation — listens on document for reliability
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Only handle when flashcard panel is in review mode
      if (screenRef.current !== 'review') return;
      if (cardsRef.current.length === 0) return;

      // Check if the wheel event is inside the flashcard panel
      const panel = panelRef.current;
      if (!panel) return;

      // Walk up from target to check if inside panel (handles SVGs and motion elements)
      let target: Node | null = e.target as Node;
      let insidePanel = false;
      while (target && target !== document.body) {
        if (target === panel) {
          insidePanel = true;
          break;
        }
        target = target.parentNode;
      }
      if (!insidePanel) return;

      // Throttle wheel events to prevent rapid navigation
      if (wheelTimerRef.current) return;

      const delta = e.deltaY;
      if (Math.abs(delta) < 4) return; // Snappy threshold for trackpads & mice

      e.preventDefault();

      const idx = currentIndexRef.current;
      if (delta > 0) {
        // Scroll down → next card
        if (idx < cardsRef.current.length - 1) {
          setIsFlipped(false);
          setCurrentIndex((prev) => prev + 1);
        }
      } else {
        // Scroll up → previous card
        if (idx > 0) {
          setIsFlipped(false);
          setCurrentIndex((prev) => prev - 1);
        }
      }

      wheelTimerRef.current = setTimeout(() => {
        wheelTimerRef.current = null;
      }, 350);
    };

    document.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      document.removeEventListener('wheel', handleWheel);
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
    };
  }, []); // Empty deps — refs keep everything up to date

  // Generate unique key for each card
  const getCardKey = useCallback(
    (index: number) => `${cards[index]?.topicId}-${index}`,
    [cards]
  );

  // Build flashcards from selected topics
  const buildCards = useCallback(
    (topicIds: Set<string>) => {
      const result: FlashcardData[] = [];
      for (const topic of knowledgeTopics) {
        if (topicIds.has(topic.id)) {
          for (const kp of topic.keyPoints) {
            result.push({
              topicId: topic.id,
              topicTitle: topic.title,
              topicTitleZh: topic.titleZh,
              front: kp.point,
              back: kp.detail,
              frontZh: kp.pointZh,
              backZh: kp.detailZh,
            });
          }
        }
      }
      return result;
    },
    []
  );

  const handleToggleTopic = useCallback((topicId: string) => {
    setSelectedTopicIds((prev) => {
      const next = new Set(prev);
      if (next.has(topicId)) {
        next.delete(topicId);
      } else {
        next.add(topicId);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedTopicIds(new Set(knowledgeTopics.map((t) => t.id)));
  }, []);

  const handleClear = useCallback(() => {
    setSelectedTopicIds(new Set());
  }, []);

  const handleStartReview = useCallback(async () => {
    if (cardSource === 'ai-generated') {
      setIsGenerating(true);
      setAiError(null);
      try {
        const res = await fetch('/api/flashcards/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topicIds: selectedTopicIds.size > 0 ? Array.from(selectedTopicIds) : undefined,
            count: aiCardCount,
            language,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.cards || data.cards.length === 0) {
          setAiError(data.error || (language === 'en' ? 'Failed to generate flashcards.' : '生成閃卡失敗。'));
          setIsGenerating(false);
          return;
        }
        const newCards: FlashcardData[] = data.cards.map((c: Record<string, string>, i: number) => ({
          topicId: c.topicId || 'knowledge-base',
          topicTitle: c.topicNameEn || 'Computer Networking',
          topicTitleZh: c.topicNameZh || '電腦網絡',
          front: c.front,
          back: c.back,
          frontZh: c.frontZh,
          backZh: c.backZh,
        }));
        setCards(newCards);
        setCurrentIndex(0);
        setIsFlipped(false);
        setKnownIds(new Set());
        setUnknownIds(new Set());
        setReviewedIds(new Set());
        setScreen('review');
      } catch {
        setAiError(language === 'en' ? 'Failed to generate flashcards.' : '生成閃卡失敗。');
      } finally {
        setIsGenerating(false);
      }
    } else {
      const newCards = buildCards(selectedTopicIds);
      setCards(newCards);
      setCurrentIndex(0);
      setIsFlipped(false);
      setKnownIds(new Set());
      setUnknownIds(new Set());
      setReviewedIds(new Set());
      setScreen('review');
    }
  }, [selectedTopicIds, buildCards, cardSource, aiCardCount, language]);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handlePrev = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex((prev) => Math.min(cards.length - 1, prev + 1));
  }, [cards.length]);

  const handleMarkKnown = useCallback(() => {
    const key = getCardKey(currentIndex);
    setKnownIds((prev) => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });
    setUnknownIds((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
    setReviewedIds((prev) => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });
    // Auto advance
    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, cards.length, getCardKey]);

  const handleMarkUnknown = useCallback(() => {
    const key = getCardKey(currentIndex);
    setUnknownIds((prev) => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });
    setKnownIds((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
    setReviewedIds((prev) => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });
    // Auto advance
    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, cards.length, getCardKey]);

  const handleShowResults = useCallback(() => {
    setScreen('results');
  }, []);

  const handleReviewAgain = useCallback(() => {
    // Filter to only unknown cards
    const unknownCards = cards.filter((_, i) => unknownIds.has(getCardKey(i)));
    if (unknownCards.length === 0) return;
    setCards(unknownCards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setKnownIds(new Set());
    setUnknownIds(new Set());
    setReviewedIds(new Set());
    setScreen('review');
  }, [cards, unknownIds, getCardKey]);

  const handleClose = useCallback(() => {
    setScreen('select');
    setSelectedTopicIds(new Set());
    setCards([]);
    setCurrentIndex(0);
    setIsFlipped(false);
    setKnownIds(new Set());
    setUnknownIds(new Set());
    setReviewedIds(new Set());
    setAiError(null);
    onClose();
  }, [onClose]);

  // Computed values
  const totalCards = cards.length;
  const reviewedCount = reviewedIds.size;
  const progressPercent = totalCards > 0 ? (reviewedCount / totalCards) * 100 : 0;
  const allReviewed = reviewedCount === totalCards && totalCards > 0;

  const unknownCardsList = useMemo(() => {
    return cards.filter((_, i) => unknownIds.has(getCardKey(i)));
  }, [cards, unknownIds, getCardKey]);

  const knownCardsList = useMemo(() => {
    return cards.filter((_, i) => knownIds.has(getCardKey(i)));
  }, [cards, knownIds, getCardKey]);

  const currentCard = cards[currentIndex];

  // Helper to get bilingual text
  const text = (en: string, zh: string) => (language === 'en' ? en : zh);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 bg-black/60 dark:bg-black/70 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        onClick={handleClose}
      />

      {/* Dialog */}
      <motion.div
        ref={panelRef}
        className="relative w-full max-w-2xl h-[88vh] max-h-[88vh] overflow-hidden z-10 flex flex-col rounded-2xl shadow-2xl border bg-white dark:bg-[#1a1a1a] dark:border-white/10"
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <AnimatePresence mode="wait">
          {/* ==================== SELECTION SCREEN ==================== */}
          {screen === 'select' && (
            <motion.div
              key="select"
              className="flex flex-col flex-1 min-h-0 h-full"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-white/10 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                    <Layers className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900 dark:text-white text-sm">
                      {text('Flashcard Review', '閃卡複習')}
                    </h2>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                      {text(
                        'Select topics to review',
                        '選擇要複習的主題'
                      )}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"
                  onClick={handleClose}
                  aria-label="Close"
                >
                  <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </Button>
              </div>

              {/* Select All / Clear */}
              <div className="flex items-center gap-2 px-5 pt-3 pb-1 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                  onClick={handleSelectAll}
                >
                  {text('Select All', '全選')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  onClick={handleClear}
                >
                  {text('Clear', '清除')}
                </Button>
                <span className="text-[11px] text-gray-400 dark:text-gray-500 ml-auto">
                  {selectedTopicIds.size} / {knowledgeTopics.length}{' '}
                  {text('selected', '已選')}
                </span>
              </div>

              {/* Topics Grid */}
              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain scroll-smooth custom-scrollbar always-show-scrollbar p-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {knowledgeTopics.map((topic) => {
                    const Icon = iconMap[topic.icon] || Layers;
                    const isSelected = selectedTopicIds.has(topic.id);
                    const title =
                      language === 'en' ? topic.title : topic.titleZh;

                    return (
                      <motion.div
                        key={topic.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleToggleTopic(topic.id)}
                        className={`group relative rounded-xl border p-3.5 cursor-pointer transition-all duration-200 flex items-start gap-3 ${
                          isSelected
                            ? 'border-emerald-400 dark:border-emerald-500/50 bg-emerald-50/60 dark:bg-emerald-500/10 shadow-sm shadow-emerald-500/5'
                            : 'border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 hover:border-gray-300 dark:hover:border-white/20'
                        }`}
                      >
                        <Checkbox
                          checked={isSelected}
                          className="mt-0.5 shrink-0 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                          onCheckedChange={() => handleToggleTopic(topic.id)}
                        />
                        <div className="h-9 w-9 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                          <Icon className="h-[18px] w-[18px]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xs font-semibold text-gray-900 dark:text-white leading-snug">
                            {title}
                          </h3>
                          <Badge
                            variant="secondary"
                            className="mt-1.5 text-[10px] font-medium gap-1 bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-0 px-1.5 py-0"
                          >
                            {topic.keyPoints.length}{' '}
                            {text('cards', '張')}
                          </Badge>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Source Mode Toggle */}
              <div className="px-4 pb-1 shrink-0">
                <div className="flex items-center gap-2 p-1 rounded-xl bg-gray-100 dark:bg-gray-800/60">
                  <button
                    onClick={() => setCardSource('knowledge-base')}
                    className={`flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs font-medium transition-all duration-200 ${
                      cardSource === 'knowledge-base'
                        ? 'bg-white dark:bg-gray-700 text-emerald-700 dark:text-emerald-400 shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    <Database className="h-3.5 w-3.5" />
                    {text('Knowledge Base', '知識庫')}
                  </button>
                  <button
                    onClick={() => setCardSource('ai-generated')}
                    className={`flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs font-medium transition-all duration-200 ${
                      cardSource === 'ai-generated'
                        ? 'bg-white dark:bg-gray-700 text-emerald-700 dark:text-emerald-400 shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    {text('AI Generated', 'AI 生成')}
                  </button>
                </div>
              </div>

              {/* AI Card Count (only for AI mode) */}
              {cardSource === 'ai-generated' && (
                <div className="px-4 pb-1 shrink-0">
                  <label className="text-[11px] text-gray-500 dark:text-gray-400 mb-1.5 block">
                    {text('Number of cards', '卡片數量')}
                  </label>
                  <div className="flex gap-2">
                    {[4, 8, 12, 16].map((count) => (
                      <button
                        key={count}
                        onClick={() => setAiCardCount(count)}
                        className={`flex-1 h-8 rounded-lg text-xs font-bold transition-all duration-200 ${
                          aiCardCount === count
                            ? 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-sm'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Source Indicator */}
              {cardSource === 'ai-generated' && (
                <div className="mx-4 mb-1 flex items-center gap-2 px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                    {text(
                      'AI will generate flashcards from knowledge base',
                      'AI 將從知識庫生成閃卡'
                    )}
                  </span>
                </div>
              )}

              {/* AI Error */}
              {aiError && (
                <div className="mx-4 mb-1 flex items-start gap-2 p-3 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 text-xs">
                  <X className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{aiError}</span>
                </div>
              )}

              {/* Start Review Button */}
              <div className="p-4 pt-2 border-t border-gray-100 dark:border-white/10 shrink-0">
                <Button
                  onClick={handleStartReview}
                  disabled={cardSource === 'knowledge-base' ? selectedTopicIds.size === 0 : isGenerating}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 dark:disabled:text-gray-500 text-white rounded-xl h-10 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {text('Generating...', '生成...')}
                    </>
                  ) : (
                    <>
                      {cardSource === 'ai-generated' ? (
                        <Sparkles className="h-4 w-4" />
                      ) : null}
                      {text('Start Review', '開始複習')}
                      <span className="text-emerald-200 dark:text-emerald-300 ml-1.5 text-xs">
                        ({cardSource === 'ai-generated'
                          ? aiCardCount
                          : selectedTopicIds.size > 0
                            ? knowledgeTopics
                                .filter((t) => selectedTopicIds.has(t.id))
                                .reduce((sum, t) => sum + t.keyPoints.length, 0)
                            : 0}{' '}
                        {text('cards', '張')})
                      </span>
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* ==================== REVIEW SCREEN ==================== */}
          {screen === 'review' && currentCard && (
            <motion.div
              key="review"
              className="flex flex-col h-full"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {/* Progress Bar */}
              <div className="shrink-0">
                <Progress
                  value={progressPercent}
                  className="h-1 rounded-none bg-gray-100 dark:bg-gray-800 [&>div]:bg-emerald-500"
                />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"
                  onClick={handleClose}
                  aria-label="Close"
                >
                  <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </Button>
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {language === 'en'
                      ? currentCard.topicTitle
                      : currentCard.topicTitleZh}
                  </p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                    {currentIndex + 1} / {totalCards}
                  </p>
                </div>
                <div className="w-8" />
              </div>

              {/* Card Number Progress Badge */}
              <div className="flex justify-center px-5 pt-2 pb-1 shrink-0">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                  <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
                    {currentIndex + 1} / {totalCards}
                  </span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500">·</span>
                  <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                    {reviewedCount}{text(' reviewed', ' 已複習')}
                  </span>
                </div>
              </div>

              {/* Flip Card */}
              <div className="flex-1 flex flex-col items-center justify-center px-5 py-3">
                <div
                  className="w-full cursor-pointer"
                  style={{ perspective: '1200px' }}
                  onClick={handleFlip}
                >
                  <div
                    className="relative w-full transition-transform duration-[600ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
                    style={{
                      transformStyle: 'preserve-3d',
                      transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                      willChange: 'transform',
                    }}
                  >
                    {/* Front of Card */}
                    <div
                      className="w-full rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)] transition-shadow duration-300"
                      style={{ backfaceVisibility: 'hidden' }}
                    >
                      {/* Gradient top strip */}
                      <div className="h-1.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500" />
                      <div className="bg-white dark:bg-[#1e1e2e] p-6 sm:p-8 min-h-[200px] sm:min-h-[240px]">
                        <div className="flex flex-col items-center justify-center text-center min-h-[180px] sm:min-h-[210px]">
                        <Badge
                          variant="outline"
                          className="mb-4 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-0.5"
                        >
                          <Eye className="h-2.5 w-2.5 mr-1" />
                          {text('Scroll to navigate · Click to reveal', '滾輪切換 · 㩒翻轉')}
                        </Badge>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white leading-tight">
                          {currentCard.frontZh && language === 'zh'
                            ? currentCard.frontZh
                            : currentCard.front}
                        </h3>
                        </div>
                      </div>
                    </div>

                    {/* Back of Card */}
                    <div
                      className="absolute inset-0 w-full rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)] transition-shadow duration-300"
                      style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                      }}
                    >
                      <div className="h-1.5 bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-500" />
                      <div className="bg-gray-50 dark:bg-gray-800/80 p-6 sm:p-8 min-h-[200px] sm:min-h-[240px]">
                        <div className="flex flex-col items-center justify-center text-center min-h-[180px] sm:min-h-[210px]">
                        <Badge
                          variant="outline"
                          className="mb-4 text-[10px] font-medium text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-500/30 bg-teal-50 dark:bg-teal-500/10 px-2.5 py-0.5"
                        >
                          {text('Answer', '答案')}
                        </Badge>
                        <p className="text-sm sm:text-base text-gray-700 dark:text-gray-200 leading-relaxed">
                          {currentCard.backZh && language === 'zh'
                            ? currentCard.backZh
                            : currentCard.back}
                        </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation & Actions */}
              <div className="shrink-0 p-5 pt-2 space-y-3 border-t border-gray-100 dark:border-white/10">
                {/* Known / Unknown buttons */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className={`flex-1 h-11 rounded-xl gap-2 text-sm font-medium transition-all duration-200 hover:scale-[1.02] hover:shadow-md active:scale-[0.98] ${
                      reviewedIds.has(getCardKey(currentIndex)) && unknownIds.has(getCardKey(currentIndex))
                        ? 'bg-rose-50 dark:bg-rose-500/15 border-rose-300 dark:border-rose-500/40 text-rose-600 dark:text-rose-400 shadow-[0_0_0_2px_rgba(244,63,94,0.1)]'
                        : 'bg-white dark:bg-white/5 hover:bg-rose-50 dark:hover:bg-rose-500/15 hover:border-rose-300 dark:hover:border-rose-500/30 hover:text-rose-600 dark:hover:text-rose-400 hover:shadow-[0_2px_8px_rgba(244,63,94,0.08)] dark:hover:shadow-[0_2px_8px_rgba(244,63,94,0.06)]'
                    }`}
                    onClick={handleMarkUnknown}
                  >
                    <ThumbsDown className="h-4 w-4" />
                    {text('Needs Review', '需要複習')}
                  </Button>
                  <Button
                    variant="outline"
                    className={`flex-1 h-11 rounded-xl gap-2 text-sm font-medium transition-all duration-200 hover:scale-[1.02] hover:shadow-md active:scale-[0.98] ${
                      reviewedIds.has(getCardKey(currentIndex)) && knownIds.has(getCardKey(currentIndex))
                        ? 'bg-emerald-50 dark:bg-emerald-500/15 border-emerald-300 dark:border-emerald-500/40 text-emerald-600 dark:text-emerald-400 shadow-[0_0_0_2px_rgba(16,185,129,0.1)]'
                        : 'bg-white dark:bg-white/5 hover:bg-emerald-50 dark:hover:bg-emerald-500/15 hover:border-emerald-300 dark:hover:border-emerald-500/30 hover:text-emerald-600 dark:hover:text-emerald-400 hover:shadow-[0_2px_8px_rgba(16,185,129,0.08)] dark:hover:shadow-[0_2px_8px_rgba(16,185,129,0.06)]'
                    }`}
                    onClick={handleMarkKnown}
                  >
                    <ThumbsUp className="h-4 w-4" />
                    {text('Known', '已掌握')}
                  </Button>
                </div>

                {/* Previous / Next + Show Results */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-30"
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    aria-label="Previous"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="flex-1 flex justify-center gap-1">
                    {Array.from({ length: Math.min(totalCards, 20) }).map((_, i) => {
                      let dotColor = 'bg-gray-200 dark:bg-gray-700';
                      const cardIdx = totalCards <= 20 ? i : Math.round((i / 19) * (totalCards - 1));
                      if (cardIdx === currentIndex) {
                        dotColor = 'bg-emerald-500';
                      } else if (knownIds.has(getCardKey(cardIdx))) {
                        dotColor = 'bg-emerald-300 dark:bg-emerald-600';
                      } else if (unknownIds.has(getCardKey(cardIdx))) {
                        dotColor = 'bg-rose-300 dark:bg-rose-600';
                      }
                      return (
                        <div
                          key={i}
                          className={`h-1.5 w-1.5 rounded-full transition-colors duration-200 ${dotColor}`}
                        />
                      );
                    })}
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-30"
                    onClick={handleNext}
                    disabled={currentIndex === totalCards - 1}
                    aria-label="Next"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                {allReviewed && (
                  <Button
                    onClick={handleShowResults}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 text-sm font-medium gap-2"
                  >
                    {text('View Results', '查看結果')}
                  </Button>
                )}
              </div>
            </motion.div>
          )}

          {/* ==================== RESULTS SCREEN ==================== */}
          {screen === 'results' && (
            <motion.div
              key="results"
              className="flex flex-col h-full"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-white/10 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900 dark:text-white text-sm">
                      {text('Review Complete!', '複習完成！')}
                    </h2>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                      {text('Here are your results', '以下是你的結果')}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"
                  onClick={handleClose}
                  aria-label="Close"
                >
                  <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </Button>
              </div>

              {/* Results Content */}
              <div className="flex-1 overflow-y-auto overscroll-contain scroll-smooth custom-scrollbar p-5 space-y-4">
                {/* Stat Cards */}
                <div className="grid grid-cols-3 gap-3">
                  {/* Known */}
                  <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-emerald-50/60 dark:bg-emerald-500/10 p-4 text-center">
                    <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center mx-auto mb-2">
                      <ThumbsUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {knownCardsList.length}
                    </p>
                    <p className="text-[11px] text-emerald-600/70 dark:text-emerald-400/70 mt-0.5">
                      {text('Known', '已掌握')}
                    </p>
                  </div>

                  {/* Needs Review */}
                  <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-rose-50/60 dark:bg-rose-500/10 p-4 text-center">
                    <div className="h-8 w-8 rounded-lg bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center mx-auto mb-2">
                      <ThumbsDown className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                    </div>
                    <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                      {unknownCardsList.length}
                    </p>
                    <p className="text-[11px] text-rose-600/70 dark:text-rose-400/70 mt-0.5">
                      {text('Needs Review', '需要複習')}
                    </p>
                  </div>

                  {/* Total */}
                  <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-4 text-center">
                    <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center mx-auto mb-2">
                      <Layers className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    </div>
                    <p className="text-2xl font-bold text-gray-700 dark:text-gray-200">
                      {knownCardsList.length + unknownCardsList.length}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                      {text('Total', '總計')}
                    </p>
                  </div>
                </div>

                {/* Accuracy */}
                {knownCardsList.length + unknownCardsList.length > 0 && (
                  <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {text('Accuracy', '正確率')}
                      </p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {Math.round(
                          (knownCardsList.length /
                            (knownCardsList.length + unknownCardsList.length)) *
                            100
                        )}
                        %
                      </p>
                    </div>
                    <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${
                          knownCardsList.length / (knownCardsList.length + unknownCardsList.length) >= 0.7
                            ? 'bg-emerald-500'
                            : knownCardsList.length / (knownCardsList.length + unknownCardsList.length) >= 0.5
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                        }`}
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(knownCardsList.length / (knownCardsList.length + unknownCardsList.length)) * 100}%`,
                        }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                )}

                {/* Unknown Cards List */}
                {unknownCardsList.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 px-1">
                      {text(
                        'Cards to review again:',
                        '需要再次複習的卡片：'
                      )}
                    </h3>
                    <div className="space-y-1.5 max-h-52 overflow-y-auto">
                      {unknownCardsList.map((card, idx) => (
                        <div
                          key={`${card.topicId}-${idx}`}
                          className="rounded-lg border border-rose-200 dark:border-rose-500/20 bg-rose-50/50 dark:bg-rose-500/5 p-3 flex items-start gap-3"
                        >
                          <div className="h-6 w-6 rounded-md bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center shrink-0 mt-0.5">
                            <XCircle className="h-3.5 w-3.5 text-rose-500" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                              {card.frontZh && language === 'zh'
                                ? card.frontZh
                                : card.front}
                            </p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                              {language === 'en'
                                ? card.topicTitle
                                : card.topicTitleZh}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* All Known Message */}
                {unknownCardsList.length === 0 && (
                  <div className="rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/5 p-6 text-center">
                    <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                      {text('Perfect!', '太棒了！')}
                    </p>
                    <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-1">
                      {text(
                        'You know all the cards in this set.',
                        '你已掌握了呢套卡片中的所有內容。'
                      )}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="p-4 pt-2 border-t border-gray-100 dark:border-white/10 shrink-0 space-y-2">
                {unknownCardsList.length > 0 && (
                  <Button
                    onClick={handleReviewAgain}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 text-sm font-medium gap-2"
                  >
                    <RotateCw className="h-4 w-4" />
                    {text(
                      `Review Again (${unknownCardsList.length} cards)`,
                      `再次複習（${unknownCardsList.length} 張）`
                    )}
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="w-full rounded-xl h-10 text-sm font-medium gap-2 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5"
                >
                  {text('Done', '完成')}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
