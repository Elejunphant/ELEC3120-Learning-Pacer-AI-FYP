'use client';

import React from 'react';
import {
  MoreHorizontal,
  SquarePen,
  BookOpen,
  GraduationCap,
  BarChart3,
  Calendar,
  Keyboard,
  Search,
  Network,
  Cloud,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface QuickActionsProps {
  language: 'en' | 'zh';
  onAction: (action: string) => void;
  hasMessages?: boolean;
}

const actions = [
  {
    id: 'new-chat',
    labelEn: 'New Chat',
    labelZh: '新對話',
    icon: SquarePen,
    shortcut: '⌘N',
  },
  {
    id: 'search',
    labelEn: 'Search Messages',
    labelZh: '搜尋訊息',
    icon: Search,
    shortcut: '⌘H',
  },
  {
    id: 'topics',
    labelEn: 'Topics',
    labelZh: '專題',
    icon: BookOpen,
    shortcut: '⌘B',
  },
  {
    id: 'quiz',
    labelEn: 'Quiz Mode',
    labelZh: '測驗模式',
    icon: GraduationCap,
    shortcut: '⌘Q',
  },
  {
    id: 'stats',
    labelEn: 'Statistics',
    labelZh: '統計',
    icon: BarChart3,
    shortcut: '⌘S',
  },
  {
    id: 'study-plan',
    labelEn: 'Study Plan',
    labelZh: '學習計劃',
    icon: Calendar,
    shortcut: null,
  },
  {
    id: 'shortcuts',
    labelEn: 'Keyboard Shortcuts',
    labelZh: '快捷鍵',
    icon: Keyboard,
    shortcut: '⌘/',
  },
  {
    id: 'protocols',
    labelEn: 'Protocol Reference',
    labelZh: '協定參考',
    icon: Network,
    shortcut: '⌘P',
  },
  {
    id: 'word-cloud',
    labelEn: 'Word Cloud',
    labelZh: '詞雲',
    icon: Cloud,
    shortcut: null,
  },
  {
    id: 'summarize',
    labelEn: 'Summarize',
    labelZh: '重點總結',
    icon: FileText,
    shortcut: null,
  },
];

export function QuickActions({ language, onAction, hasMessages }: QuickActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all duration-200"
          aria-label={language === 'en' ? 'Quick actions' : '快捷操作'}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        {actions.map((action, index) => {
          const Icon = action.icon;
          const label = language === 'en' ? action.labelEn : action.labelZh;

          // Insert separator before "Keyboard Shortcuts" (last item)
          if (index === actions.length - 1) {
            return (
              <React.Fragment key={action.id}>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onAction(action.id)}
                  className="cursor-pointer gap-2.5 py-2"
                >
                  <Icon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <span>{label}</span>
                  {action.shortcut && (
                    <DropdownMenuShortcut className="text-[10px]">
                      {action.shortcut}
                    </DropdownMenuShortcut>
                  )}
                </DropdownMenuItem>
              </React.Fragment>
            );
          }

          return (
            <DropdownMenuItem
              key={action.id}
              onClick={() => onAction(action.id)}
              className="cursor-pointer gap-2.5 py-2"
            >
              <Icon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span>{label}</span>
              {action.shortcut && (
                <DropdownMenuShortcut className="text-[10px]">
                  {action.shortcut}
                </DropdownMenuShortcut>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
