'use client';

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { X, RotateCcw, ChevronLeft, ChevronRight, BookOpen, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { knowledgeTopics } from '@/lib/knowledge-base';
import type { KnowledgeTopic } from '@/lib/knowledge-base';

// ── Types ──────────────────────────────────────────────────────

interface ReviewCard {
  id: string;
  topicId: string;
  topicTitle: string;
  topicTitleZh: string;
  front: string;
  frontZh: string;
  back: string;
  backZh: string;
}

type Screen = 'cards' | 'done';

interface QuickReviewProps {
  language: 'en' | 'zh';
}

// ── Helpers ────────────────────────────────────────────────────

const STORAGE_KEY = 'lp-quick-review-seen';

function loadSeenToday(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    // Only return IDs from today
    const today = new Date().toISOString().slice(0, 10);
    if (parsed.date !== today) return new Set();
    return new Set<string>(parsed.ids || []);
  } catch {
    return new Set();
  }
}

function saveSeenToday(ids: Set<string>) {
  if (typeof window === 'undefined') return;
  const today = new Date().toISOString().slice(0, 10);
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, ids: Array.from(ids) }));
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function buildReviewCards(): ReviewCard[] {
  const cards: ReviewCard[] = [];
  for (const topic of knowledgeTopics) {
    for (const kp of topic.keyPoints) {
      cards.push({
        id: `${topic.id}-${kp.point}`,
        topicId: topic.id,
        topicTitle: topic.title,
        topicTitleZh: topic.titleZh,
        front: kp.point,
        frontZh: kp.pointZh,
        back: kp.detail,
        backZh: kp.detailZh,
      });
    }
  }
  return cards;
}

// ── Component ──────────────────────────────────────────────────

export function QuickReview({ language }: QuickReviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [screen, setScreen] = useState<Screen>('cards');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [seenToday, setSeenToday] = useState<Set<string>>(() => loadSeenToday());
  const [cards, setCards] = useState<ReviewCard[]>(() => buildReviewCards());
  const [isShuffled, setIsShuffled] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        const target = e.target as HTMLElement;
        if (!target.closest('[data-quick-review-toggle]')) {
          setIsOpen(false);
        }
      }
    };
    // Delay to avoid immediate close
    const timeout = setTimeout(() => {
      document.addEventListener('mousedown', handler);
    }, 100);
    return () => {
      clearTimeout(timeout);
      document.removeEventListener('mousedown', handler);
    };
  }, [isOpen]);

  const allCards = useMemo(() => {
    return isShuffled ? shuffleArray(cards) : cards;
  }, [cards, isShuffled]);

  const currentCard = allCards[currentIndex];
  const totalCards = allCards.length;
  const reviewedCount = seenToday.size;

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleNext = useCallback(() => {
    // Mark current card as seen
    if (currentCard) {
      const newSeen = new Set(seenToday);
      newSeen.add(currentCard.id);
      setSeenToday(newSeen);
      saveSeenToday(newSeen);
    }
    setIsFlipped(false);
    if (currentIndex < allCards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentCard, currentIndex, allCards.length, seenToday]);

  const handlePrev = useCallback(() => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleShuffle = useCallback(() => {
    setIsShuffled(true);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, []);

  const handleReset = useCallback(() => {
    setSeenToday(new Set());
    saveSeenToday(new Set());
    setCurrentIndex(0);
    setIsFlipped(false);
    setScreen('cards');
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setScreen('cards');
    setIsFlipped(false);
  }, []);

  const handleMarkDone = useCallback(() => {
    if (currentCard) {
      const newSeen = new Set(seenToday);
      newSeen.add(currentCard.id);
      setSeenToday(newSeen);
      saveSeenToday(newSeen);
    }
    setScreen('done');
  }, [currentCard, seenToday]);

  const t = {
    title: language === 'en' ? 'Quick Review' : '快速複習',
    tapToReveal: language === 'en' ? 'Tap to reveal' : '㩒翻轉',
    answer: language === 'en' ? 'Answer' : '答案',
    reviewed: language === 'en' ? 'reviewed' : '已複習',
    next: language === 'en' ? 'Next' : '下一個',
    prev: language === 'en' ? 'Prev' : '上一個',
    shuffle: language === 'en' ? 'Shuffle' : '隨機',
    markDone: language === 'en' ? 'Done for today' : '今日完成',
    doneTitle: language === 'en' ? 'Review Complete!' : '複習完成！',
    doneMsg: language === 'en' ? 'Great work! You reviewed' : '做得好！你複習了',
    doneMsg2: language === 'en' ? 'cards today.' : '張卡片。',
    doneReset: language === 'en' ? 'Review more' : '繼續複習',
    cards: language === 'en' ? 'cards' : '張',
    of: language === 'en' ? 'of' : '/',
    flipHint: language === 'en' ? 'Click card to flip · Arrows to navigate' : '㩒卡片翻轉 · 方向鍵導航',
  };

  return (
    <>
      {/* Floating button — bottom-right, above mobile bottom nav */}
      <div
        className="fixed bottom-20 right-4 z-40 lg:bottom-6"
        ref={containerRef}
      >
        <button
          data-quick-review-toggle
          onClick={() => setIsOpen((prev) => !prev)}
          className={`flex items-center gap-1.5 h-9 px-3 rounded-full shadow-lg border transition-all duration-200 hover:scale-105 active:scale-95 ${
            isOpen
              ? 'bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 border-gray-700 dark:border-gray-300'
              : 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-gray-200/60 dark:border-gray-700/40 text-gray-600 dark:text-gray-300 hover:border-emerald-300 dark:hover:border-emerald-600'
          }`}
          aria-label={t.title}
        >
          {isOpen ? (
            <X className="h-3.5 w-3.5" />
          ) : (
            <BookOpen className="h-3.5 w-3.5 text-emerald-500" />
          )}
          <span className="text-xs font-medium whitespace-nowrap">
            {isOpen
              ? (language === 'en' ? 'Close' : '關閉')
              : (language === 'en' ? 'Review' : '複習')}
          </span>
          {!isOpen && reviewedCount > 0 && (
            <Badge className="h-4 min-w-4 px-1 rounded-full bg-emerald-500 text-white text-[9px] font-bold leading-none flex items-center justify-center">
              {reviewedCount}
            </Badge>
          )}
        </button>

        {/* Expanded panel */}
        {isOpen && (
          <div
            className="absolute bottom-12 right-0 w-[340px] sm:w-[380px] rounded-2xl border border-gray-200/60 dark:border-gray-700/40 backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 shadow-2xl overflow-hidden"
            style={{ animation: 'fadeSlideUp 0.2s ease-out' }}
          >
            {/* Emerald gradient accent */}
            <div className="h-0.5 w-full bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500" />

            {screen === 'cards' && currentCard && (
              <div className="p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                      <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                        {t.title}
                      </h3>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500">
                        {t.flipHint}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                  >
                    <X className="h-3.5 w-3.5 text-gray-400" />
                  </button>
                </div>

                {/* Card counter badge */}
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="outline" className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5">
                    {currentIndex + 1} {t.of} {totalCards}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Badge variant="secondary" className="text-[10px] font-medium px-2 py-0.5">
                      {reviewedCount}/{totalCards} {t.reviewed}
                    </Badge>
                  </div>
                </div>

                {/* Card */}
                <div
                  className="w-full cursor-pointer rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)] transition-shadow duration-300 hover:shadow-md"
                  style={{ perspective: '800px' }}
                  onClick={handleFlip}
                >
                  <div
                    className="w-full transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
                    style={{
                      transformStyle: 'preserve-3d',
                      transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    }}
                  >
                    {/* Front */}
                    <div
                      className="w-full min-h-[140px] p-4 flex flex-col items-center justify-center text-center"
                      style={{ backfaceVisibility: 'hidden' }}
                    >
                      <div className="h-1 w-12 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full mb-3" />
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-1.5 uppercase tracking-wide">
                        {language === 'en' ? currentCard.topicTitle : currentCard.topicTitleZh}
                      </p>
                      <h4 className="text-base font-bold text-gray-800 dark:text-gray-100 leading-snug">
                        {language === 'en' ? currentCard.front : currentCard.frontZh}
                      </h4>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-3">
                        {t.tapToReveal}
                      </p>
                    </div>

                    {/* Back */}
                    <div
                      className="absolute inset-0 w-full min-h-[140px] p-4 flex flex-col items-center justify-center text-center bg-gray-50 dark:bg-gray-800/60"
                      style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                    >
                      <Badge variant="outline" className="mb-2 text-[10px] font-medium text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-500/30 px-2 py-0.5">
                        {t.answer}
                      </Badge>
                      <p className="text-[13px] text-gray-600 dark:text-gray-300 leading-relaxed max-h-[100px] overflow-y-auto custom-scrollbar">
                        {language === 'en' ? currentCard.back : currentCard.backZh}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center gap-2 mt-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-30"
                    onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                    disabled={currentIndex === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {/* Progress dots */}
                  <div className="flex-1 flex justify-center gap-0.5">
                    {Array.from({ length: Math.min(totalCards, 15) }).map((_, i) => {
                      const cardIdx = totalCards <= 15 ? i : Math.round((i / 14) * (totalCards - 1));
                      const isCurrent = cardIdx === currentIndex;
                      const isSeen = allCards[cardIdx] && seenToday.has(allCards[cardIdx].id);
                      return (
                        <div
                          key={i}
                          className={`h-1 w-1 rounded-full transition-colors duration-200 ${
                            isCurrent
                              ? 'bg-emerald-500'
                              : isSeen
                                ? 'bg-emerald-300 dark:bg-emerald-600'
                                : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                        />
                      );
                    })}
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-30"
                    onClick={(e) => { e.stopPropagation(); handleNext(); }}
                    disabled={currentIndex === totalCards - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8 text-xs gap-1 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-500/30"
                    onClick={handleShuffle}
                  >
                    <RotateCcw className="h-3 w-3" />
                    {t.shuffle}
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 h-8 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={handleMarkDone}
                  >
                    {t.markDone}
                  </Button>
                </div>
              </div>
            )}

            {screen === 'done' && (
              <div className="p-6 flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center mb-3">
                  <Sparkles className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-1">
                  {t.doneTitle}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {t.doneMsg} <span className="font-bold text-emerald-600 dark:text-emerald-400">{reviewedCount}</span> {t.doneMsg2}
                </p>
                <div className="flex gap-2 w-full">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-9 text-xs rounded-lg"
                    onClick={handleReset}
                  >
                    {t.doneReset}
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 h-9 text-xs rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    onClick={handleClose}
                  >
                    {language === 'en' ? 'Close' : '關閉'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
