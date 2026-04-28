'use client';

import React from 'react';
import {
  MessageSquare,
  GraduationCap,
  Layers,
  Search,
  MoreHorizontal,
} from 'lucide-react';

interface MobileBottomNavProps {
  language: 'en' | 'zh';
  activeView: 'chat' | 'quiz' | 'flashcards' | 'search' | 'more';
  onViewChange: (view: 'chat' | 'quiz' | 'flashcards' | 'search' | 'more') => void;
}

const navItems = [
  {
    key: 'chat' as const,
    icon: MessageSquare,
    label: { en: 'Chat', zh: '對話' },
  },
  {
    key: 'quiz' as const,
    icon: GraduationCap,
    label: { en: 'Quiz', zh: '測驗' },
  },
  {
    key: 'flashcards' as const,
    icon: Layers,
    label: { en: 'Cards', zh: '閃卡' },
  },
  {
    key: 'search' as const,
    icon: Search,
    label: { en: 'Search', zh: '搜尋' },
  },
  {
    key: 'more' as const,
    icon: MoreHorizontal,
    label: { en: 'More', zh: '更多' },
  },
];

export function MobileBottomNav({ language, activeView, onViewChange }: MobileBottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur-md border-t border-gray-200/80 dark:border-white/[0.06] safe-bottom"
      role="navigation"
      aria-label={language === 'en' ? 'Main navigation' : '主導航'}
    >
      <div className="flex items-center justify-around px-1 py-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onViewChange(item.key)}
              className={`relative flex flex-col items-center justify-center gap-0.5 min-w-[56px] py-1.5 rounded-xl transition-all duration-200 touch-manipulation ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-gray-400 dark:text-gray-500 active:text-gray-600 dark:active:text-gray-300'
              }`}
              aria-label={language === 'en' ? item.label.en : item.label.zh}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Active indicator dot */}
              <span
                className={`absolute -top-0.5 left-1/2 -translate-x-1/2 h-[3px] rounded-full transition-all duration-300 ease-out ${
                  isActive
                    ? 'w-5 bg-emerald-500 dark:bg-emerald-400'
                    : 'w-0 bg-transparent'
                }`}
              />
              <Icon
                className={`h-[20px] w-[20px] transition-all duration-200 ${
                  isActive ? 'scale-110' : 'scale-100'
                }`}
                strokeWidth={isActive ? 2.2 : 1.8}
              />
              <span
                className={`text-[10px] font-medium transition-colors duration-200 ${
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                {language === 'en' ? item.label.en : item.label.zh}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
