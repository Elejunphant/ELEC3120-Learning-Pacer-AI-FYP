'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  GraduationCap,
  ArrowUpRight,
  BookOpen,
  Brain,
  Target,
  Clock,
  Trophy,
  ChevronRight,
  Sparkles,
  Zap,
  Layers,
  BarChart3,
  Timer,
  Network,
  Globe,
  Shield,
  Radio,
  Route,
  Compass,
  RotateCcw,
} from 'lucide-react';
import { protocolCards } from '@/lib/protocol-data';
import { ExamCountdown } from '@/components/exam-countdown';

interface WelcomeScreenProps {
  language: 'en' | 'zh';
  onSendMessage: (msg: string) => void;
  onOpenQuiz: () => void;
  onOpenFlashcards?: () => void;
  onOpenPomodoro?: () => void;
  onOpenTopics?: () => void;
  onOpenStats?: () => void;
  onFocusChat?: () => void;
}

// Featured protocols for quick reference cards on welcome screen
const featuredProtocolIds = ['tcp', 'udp', 'ip', 'http', 'dns', 'arp'];

const protocolIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  tcp: Shield,
  udp: Radio,
  ip: Route,
  http: Globe,
  dns: Compass,
  arp: Network,
};

const protocolColorMap: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
  tcp: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200/60 dark:border-emerald-800/40', gradient: 'from-emerald-500 to-teal-500' },
  udp: { bg: 'bg-orange-50 dark:bg-orange-950/30', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200/60 dark:border-orange-800/40', gradient: 'from-orange-500 to-amber-500' },
  ip: { bg: 'bg-rose-50 dark:bg-rose-950/30', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-200/60 dark:border-rose-800/40', gradient: 'from-rose-500 to-pink-500' },
  http: { bg: 'bg-teal-50 dark:bg-teal-950/30', text: 'text-teal-600 dark:text-teal-400', border: 'border-teal-200/60 dark:border-teal-800/40', gradient: 'from-teal-500 to-cyan-500' },
  dns: { bg: 'bg-violet-50 dark:bg-violet-950/30', text: 'text-violet-600 dark:text-violet-400', border: 'border-violet-200/60 dark:border-violet-800/40', gradient: 'from-violet-500 to-purple-500' },
  arp: { bg: 'bg-cyan-50 dark:bg-cyan-950/30', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-200/60 dark:border-cyan-800/40', gradient: 'from-cyan-500 to-sky-500' },
};

const suggestedPrompts = [
  { en: 'Explain the TCP three-way handshake with a real-life analogy', zh: '用生活化例子解釋 TCP 三次握手（L06）', icon: '🤝' },
  { en: 'Compare Distance Vector vs Link State routing', zh: '比較 Distance Vector 同 Link State 路由演算法（L14）', icon: '🧭' },
  { en: 'Walk me through BGP route selection criteria', zh: 'BGP 選路優先次序點樣運作？（L11）', icon: '🌏' },
  { en: 'Show TCP Reno cwnd evolution with AIMD', zh: '示範 TCP Reno 嘅 cwnd 演變（Tahoe vs Reno）（L07–L08）', icon: '📈' },
];

type FeatureKey = 'chat' | 'quiz' | 'flashcards' | 'pomodoro' | 'topics' | 'progress';

const features: Array<{
  key: FeatureKey;
  icon: React.ComponentType<{ className?: string }>;
  title: { en: string; zh: string };
  desc: { en: string; zh: string };
  color: string;
  bgLight: string;
  textColor: string;
}> = [
  {
    key: 'chat',
    icon: Brain,
    title: { en: 'AI Chat', zh: 'AI 對話' },
    desc: { en: 'Ask anything about networking concepts', zh: '隨時提問網絡知識' },
    color: 'from-emerald-500 to-teal-600',
    bgLight: 'bg-emerald-50 dark:bg-emerald-950/30',
    textColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    key: 'quiz',
    icon: Target,
    title: { en: 'Smart Quiz', zh: '智能測驗' },
    desc: { en: 'Practice with AI-generated questions', zh: 'AI 生成練習題' },
    color: 'from-amber-500 to-orange-600',
    bgLight: 'bg-amber-50 dark:bg-amber-950/30',
    textColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    key: 'flashcards',
    icon: Layers,
    title: { en: 'Flashcards', zh: '閃卡複習' },
    desc: { en: 'Review key concepts quickly', zh: '快速複習核心概念' },
    color: 'from-violet-500 to-purple-600',
    bgLight: 'bg-violet-50 dark:bg-violet-950/30',
    textColor: 'text-violet-600 dark:text-violet-400',
  },
  {
    key: 'pomodoro',
    icon: Timer,
    title: { en: 'Pomodoro', zh: '番茄鐘' },
    desc: { en: 'Stay focused with timed sessions', zh: '計時專注學習' },
    color: 'from-rose-500 to-pink-600',
    bgLight: 'bg-rose-50 dark:bg-rose-950/30',
    textColor: 'text-rose-600 dark:text-rose-400',
  },
  {
    key: 'topics',
    icon: BookOpen,
    title: { en: '8 Topics', zh: '8 大專題' },
    desc: { en: 'Comprehensive networking knowledge base', zh: '全面網絡知識庫' },
    color: 'from-sky-500 to-cyan-600',
    bgLight: 'bg-sky-50 dark:bg-sky-950/30',
    textColor: 'text-sky-600 dark:text-sky-400',
  },
  {
    key: 'progress',
    icon: BarChart3,
    title: { en: 'Progress', zh: '學習統計' },
    desc: { en: 'Track your study activity', zh: '追蹤學習進度' },
    color: 'from-lime-500 to-green-600',
    bgLight: 'bg-lime-50 dark:bg-lime-950/30',
    textColor: 'text-lime-600 dark:text-lime-400',
  },
];

// Animated counter hook
function useAnimatedCounter(target: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress >= 1) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

export function WelcomeScreen({
  language,
  onSendMessage,
  onOpenQuiz,
  onOpenFlashcards,
  onOpenPomodoro,
  onOpenTopics,
  onOpenStats,
  onFocusChat,
}: WelcomeScreenProps) {
  const featureHandlers: Record<FeatureKey, (() => void) | undefined> = {
    chat: onFocusChat,
    quiz: onOpenQuiz,
    flashcards: onOpenFlashcards,
    pomodoro: onOpenPomodoro,
    topics: onOpenTopics,
    progress: onOpenStats,
  };
  const [mounted, setMounted] = useState(false);
  const topicCount = useAnimatedCounter(8, 1500);
  const questionCount = useAnimatedCounter(500, 2000);

  // Load recent topics from localStorage
  const recentTopics: string[] = (() => {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('lp-recent-topics');
        if (stored) {
          const parsed = JSON.parse(stored) as string[];
          return parsed.slice(0, 3);
        }
      }
    } catch {}
    return [];
  })();

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-start px-4 py-8 overflow-y-auto custom-scrollbar relative">
      {/* Animated gradient background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-20 dark:opacity-10"
          style={{
            background: 'radial-gradient(circle, rgba(16,185,129,0.4) 0%, rgba(20,184,166,0.2) 30%, transparent 65%)',
            filter: 'blur(80px)',
            animation: 'welcomeBlobDrift 8s ease-in-out infinite',
          }}
        />
        <div
          className="absolute -bottom-24 -right-24 w-[400px] h-[400px] rounded-full opacity-15 dark:opacity-[0.08]"
          style={{
            background: 'radial-gradient(circle, rgba(20,184,166,0.35) 0%, rgba(16,185,129,0.15) 35%, transparent 65%)',
            filter: 'blur(70px)',
            animation: 'welcomeBlobDrift2 10s ease-in-out infinite',
          }}
        />
        <div
          className="absolute top-1/3 right-0 w-[300px] h-[300px] rounded-full opacity-10 dark:opacity-[0.05]"
          style={{
            background: 'radial-gradient(circle, rgba(52,211,153,0.3) 0%, transparent 60%)',
            filter: 'blur(60px)',
            animation: 'welcomeBlobDrift3 12s ease-in-out infinite',
          }}
        />
      </div>

      <div className="max-w-2xl w-full mx-auto relative z-10">
        {/* Hero section with animated gradient background */}
        <div className="relative mb-10">
          {/* Subtle animated gradient orb */}
          <div
            className="absolute -top-20 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full opacity-30 dark:opacity-15 pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(16,185,129,0.3) 0%, rgba(20,184,166,0.15) 40%, transparent 70%)',
              filter: 'blur(60px)',
              animation: 'pulseGlow 4s ease-in-out infinite',
            }}
          />

          {/* Avatar + Name + Subtitle */}
          <div
            className={`relative text-center transition-all duration-700 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20 mb-5 animate-icon-breathe">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>

            <h1 className="text-3xl font-bold tracking-tight mb-2 animate-heading-gradient">
              LearningPacer
            </h1>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              {language === 'en'
                ? 'Your Virtual TA for ELEC3120 Computer Networks'
                : '你嘅 ELEC3120 電腦網絡虛擬助教'}
            </p>

            {/* Stats pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-4">
              <div className="inline-flex shrink-0 items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40">
                <BookOpen className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-medium whitespace-nowrap text-emerald-700 dark:text-emerald-300">
                  {topicCount} {language === 'en' ? 'Topics' : '專題'}
                </span>
              </div>
              <div className="inline-flex shrink-0 items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40">
                <Zap className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-medium whitespace-nowrap text-amber-700 dark:text-amber-300">
                  {questionCount}+ {language === 'en' ? 'Questions' : '題目'}
                </span>
              </div>
              <div className="inline-flex shrink-0 items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-50 dark:bg-violet-950/30 border border-violet-200/60 dark:border-violet-800/40">
                <Sparkles className="h-3.5 w-3.5 shrink-0 text-violet-600 dark:text-violet-400" />
                <span className="text-xs font-medium whitespace-nowrap text-violet-700 dark:text-violet-300">
                  AI {language === 'en' ? 'Powered' : '驅動'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Exam Countdown */}
        <div
          className={`mb-8 transition-all duration-700 delay-100 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <ExamCountdown language={language} />
        </div>

        {/* Quick Protocol Reference Cards */}
        <div
          className={`mb-8 transition-all duration-700 delay-150 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="flex items-center gap-2 mb-3">
            <Network className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
            <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              {language === 'en' ? 'Quick Protocol Reference' : '快速協定參考'}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {featuredProtocolIds.map((id) => {
              const proto = protocolCards.find((p) => p.id === id);
              if (!proto) return null;
              const Icon = protocolIcons[id] || Network;
              const colors = protocolColorMap[id] || protocolColorMap.tcp;
              return (
                <button
                  key={id}
                  onClick={() =>
                    onSendMessage(
                      language === 'en'
                        ? `Tell me about ${proto.name}`
                        : `介紹一下 ${proto.nameZh}`
                    )
                  }
                  className={`group relative rounded-xl border ${colors.border} ${colors.bg} p-3 text-left transition-all duration-200 hover:shadow-lg hover:shadow-black/[0.04] dark:hover:shadow-black/20 hover:-translate-y-1 hover:scale-[1.03] active:translate-y-0 active:scale-[0.99] overflow-hidden`}
                >
                  <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${colors.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  <div className={`inline-flex items-center justify-center h-7 w-7 rounded-lg ${colors.bg} mb-2`}>
                    <Icon className={`h-3.5 w-3.5 ${colors.text}`} />
                  </div>
                  <h3 className="text-[13px] font-semibold text-gray-800 dark:text-gray-200 mb-0.5">
                    {language === 'en' ? proto.name : proto.nameZh}
                  </h3>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-snug">
                    {language === 'en' ? proto.layer : proto.layerZh}
                    {proto.port ? ` · Port ${proto.port}` : ''}
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed mt-1 line-clamp-2">
                    {language === 'en' ? proto.keyFacts[0]?.value : proto.keyFacts[0]?.valueZh}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Feature cards grid */}
        <div
          className={`grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-8 transition-all duration-700 delay-200 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          {features.map((feature, idx) => {
            const handler = featureHandlers[feature.key];
            const cardClass = `group relative rounded-xl border border-gray-200/80 dark:border-gray-700/50 bg-white dark:bg-[#1e1e1e] p-3.5 text-left w-full transform-gpu will-change-transform transition-[transform,box-shadow,border-color] duration-300 ease-out hover:shadow-lg hover:shadow-black/[0.04] dark:hover:shadow-black/20 hover:border-gray-300 dark:hover:border-gray-600 hover:-translate-y-0.5 active:translate-y-0 overflow-hidden ${
              handler ? 'cursor-pointer' : 'cursor-default'
            }`;
            const inner = (
              <>
                <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className={`inline-flex items-center justify-center h-8 w-8 rounded-lg ${feature.bgLight} mb-2.5 animate-icon-breathe`} style={{ animationDelay: `${idx * 0.5}s` }}>
                  <feature.icon className={`h-4 w-4 ${feature.textColor}`} />
                </div>
                <h3 className="text-[13px] font-semibold text-gray-800 dark:text-gray-200 mb-0.5">
                  {language === 'en' ? feature.title.en : feature.title.zh}
                </h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                  {language === 'en' ? feature.desc.en : feature.desc.zh}
                </p>
              </>
            );
            return handler ? (
              <button key={idx} type="button" onClick={handler} className={cardClass}>
                {inner}
              </button>
            ) : (
              <div key={idx} className={cardClass}>
                {inner}
              </div>
            );
          })}
        </div>

        {/* Recent Topics Section */}
        {recentTopics.length > 0 && (
          <div
            className={`mb-8 transition-all duration-700 delay-[350ms] ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <RotateCcw className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {language === 'en' ? 'Recent Topics' : '最近學習'}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentTopics.map((topic, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(topic)}
                  className="group flex items-center gap-1.5 px-3 py-2 rounded-lg border border-emerald-200/50 dark:border-emerald-800/30 bg-emerald-50/60 dark:bg-emerald-950/15 text-[13px] text-gray-700 dark:text-gray-300 transition-all duration-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/25 hover:border-emerald-300/60 dark:hover:border-emerald-700/40 hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 touch-manipulation"
                >
                  <span className="truncate max-w-[160px]">{topic}</span>
                  <ArrowUpRight className="h-3 w-3 text-emerald-500 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Suggested prompts — improved */}
        <div
          className={`transition-all duration-700 delay-300 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="flex items-center gap-2.5 mb-3">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-online-dot absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <Sparkles className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              {language === 'en' ? 'Try asking' : '試下問呢啲問題'}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {suggestedPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => onSendMessage(language === 'en' ? prompt.en : prompt.zh)}
                className="group flex items-start gap-3 rounded-xl border border-gray-200/80 dark:border-gray-700/50 bg-white dark:bg-[#1e1e1e] px-4 py-3.5 text-left transition-all duration-200 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 hover:border-emerald-200/70 dark:hover:border-emerald-800/40 hover:shadow-md hover:shadow-emerald-500/[0.04] dark:hover:shadow-emerald-500/10 hover:-translate-y-0.5 active:translate-y-0"
              >
                <span className="mt-0.5 shrink-0 text-base">
                  {prompt.icon}
                </span>
                <span className="flex-1 text-[13px] leading-snug text-gray-700 dark:text-gray-300">
                  {language === 'en' ? prompt.en : prompt.zh}
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600 mt-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </button>
            ))}
          </div>
        </div>

        {/* Quick action bar */}
        <div
          className={`flex items-center justify-center gap-2 mt-6 transition-all duration-700 delay-400 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <span className="text-[11px] text-gray-400 dark:text-gray-500">
            {language === 'en' ? 'Quick start:' : '快速開始：'}
          </span>
          <div className="flex items-center gap-1.5">
            {[
              { label: language === 'en' ? 'Quiz' : '測驗', shortcut: '⌘Q' },
              { label: language === 'en' ? 'Topics' : '專題', shortcut: '⌘B' },
              { label: language === 'en' ? 'Flashcards' : '閃卡', shortcut: '💬' },
            ].map((item) => (
              <span
                key={item.label}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800/60 border border-gray-200/60 dark:border-gray-700/40"
              >
                {item.label}
                <kbd className="text-[10px] font-mono text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700/50 px-1 py-0.5 rounded">
                  {item.shortcut}
                </kbd>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
