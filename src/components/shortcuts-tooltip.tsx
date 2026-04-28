'use client';

import React from 'react';
import {
  Keyboard,
  MessageSquarePlus,
  Search,
  BookOpen,
  GraduationCap,
  BarChart3,
  Calculator,
  Network,
  MessageCircle,
} from 'lucide-react';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';

interface ShortcutsTooltipProps {
  language: 'en' | 'zh';
}

const shortcuts = [
  {
    keys: ['Ctrl', 'N'],
    descriptionEn: 'New Chat',
    descriptionZh: '新對話',
    icon: MessageSquarePlus,
  },
  {
    keys: ['Ctrl', 'H'],
    descriptionEn: 'Search Messages',
    descriptionZh: '搜尋訊息',
    icon: Search,
  },
  {
    keys: ['Ctrl', 'B'],
    descriptionEn: 'Browse Topics',
    descriptionZh: '瀏覽主題',
    icon: BookOpen,
  },
  {
    keys: ['Ctrl', 'Q'],
    descriptionEn: 'Open Quiz',
    descriptionZh: '開啟測驗',
    icon: GraduationCap,
  },
  {
    keys: ['Ctrl', 'S'],
    descriptionEn: 'Statistics',
    descriptionZh: '統計',
    icon: BarChart3,
  },
  {
    keys: ['Ctrl', 'F'],
    descriptionEn: 'Formulas',
    descriptionZh: '公式參考',
    icon: Calculator,
  },
  {
    keys: ['Ctrl', 'P'],
    descriptionEn: 'Protocols',
    descriptionZh: '協定參考',
    icon: Network,
  },
  {
    keys: ['Ctrl', '/'],
    descriptionEn: 'All Shortcuts',
    descriptionZh: '所有快捷鍵',
    icon: Keyboard,
  },
];

export function ShortcutsTooltip({ language }: ShortcutsTooltipProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="flex items-center justify-center h-7 w-7 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all duration-200 touch-manipulation"
          aria-label={language === 'en' ? 'Keyboard shortcuts' : '鍵盤快捷鍵'}
        >
          <span className="text-[12px] font-bold leading-none">?</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={8}
        className="w-[220px] p-2.5 rounded-xl border border-gray-200/80 dark:border-gray-700/50 bg-white dark:bg-[#1e1e1e] shadow-lg"
      >
        <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
          <Keyboard className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
          <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {language === 'en' ? 'Shortcuts' : '快捷鍵'}
          </span>
        </div>
        <div className="space-y-0.5">
          {shortcuts.map((shortcut, index) => {
            const Icon = shortcut.icon;
            return (
              <div
                key={index}
                className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500 shrink-0" />
                  <span className="text-[12px] text-gray-600 dark:text-gray-300">
                    {language === 'en' ? shortcut.descriptionEn : shortcut.descriptionZh}
                  </span>
                </div>
                <div className="flex items-center gap-0.5">
                  {shortcut.keys.map((key, ki) => (
                    <React.Fragment key={ki}>
                      {ki > 0 && (
                        <span className="text-[8px] text-gray-300 dark:text-gray-600">+</span>
                      )}
                      <kbd className="inline-flex items-center justify-center h-5 min-w-[20px] px-1 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-[9px] font-mono text-gray-500 dark:text-gray-400 font-medium">
                        {key}
                      </kbd>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
