'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Keyboard,
  X,
  MessageSquarePlus,
  Search,
  Moon,
  Sun,
  BookOpen,
  GraduationCap,
  BarChart3,
  Slash,
  Calculator,
} from 'lucide-react';

interface ShortcutsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'zh';
}

const shortcuts = [
  {
    keys: ['⌘/Ctrl', 'N'],
    descriptionEn: 'New Chat',
    descriptionZh: '新對話',
    icon: MessageSquarePlus,
  },
  {
    keys: ['⌘/Ctrl', 'K'],
    descriptionEn: 'Search Conversations',
    descriptionZh: '搜尋對話',
    icon: Search,
  },
  {
    keys: ['⌘/Ctrl', 'D'],
    descriptionEn: 'Toggle Dark Mode',
    descriptionZh: '切換深色模式',
    icon: Moon,
  },
  {
    keys: ['⌘/Ctrl', 'B'],
    descriptionEn: 'Browse Topics',
    descriptionZh: '瀏覽主題',
    icon: BookOpen,
  },
  {
    keys: ['⌘/Ctrl', 'Q'],
    descriptionEn: 'Open Quiz Mode',
    descriptionZh: '開啟測驗模式',
    icon: GraduationCap,
  },
  {
    keys: ['⌘/Ctrl', 'S'],
    descriptionEn: 'View Statistics',
    descriptionZh: '查看統計',
    icon: BarChart3,
  },
  {
    keys: ['⌘/Ctrl', 'F'],
    descriptionEn: 'Formula Reference',
    descriptionZh: '公式參考',
    icon: Calculator,
  },
  {
    keys: ['Enter'],
    descriptionEn: 'Send Message',
    descriptionZh: '發送訊息',
    icon: null,
  },
  {
    keys: ['Shift', 'Enter'],
    descriptionEn: 'New Line',
    descriptionZh: '換行',
    icon: null,
  },
];

export function ShortcutsDialog({ isOpen, onClose, language }: ShortcutsDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 dark:bg-black/70" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-md z-10 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-800">
              <Keyboard className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </div>
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">
              {language === 'en' ? 'Keyboard Shortcuts' : '鍵盤快捷鍵'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label={language === 'en' ? 'Close' : '關閉'}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Shortcuts list */}
        <div className="p-3 space-y-0.5 max-h-[60vh] overflow-y-auto">
          {shortcuts.map((shortcut, index) => {
            const Icon = shortcut.icon;
            return (
              <div
                key={index}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {Icon && (
                    <Icon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  )}
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {language === 'en' ? shortcut.descriptionEn : shortcut.descriptionZh}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {shortcut.keys.map((key, ki) => (
                    <React.Fragment key={ki}>
                      {ki > 0 && <span className="text-[10px] text-gray-300 dark:text-gray-600 mx-0.5">+</span>}
                      <kbd className="inline-flex items-center justify-center h-6 min-w-[24px] px-1.5 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-[11px] font-mono text-gray-500 dark:text-gray-400 font-medium shadow-sm">
                        {key}
                      </kbd>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer hint */}
        <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30">
          <p className="text-[11px] text-gray-400 dark:text-gray-500 text-center flex items-center justify-center gap-1">
            <Slash className="h-3 w-3" />
            {language === 'en'
              ? 'Press ⌘/Ctrl+/ to toggle this dialog'
              : '㩒 ⌘/Ctrl+/ 切換呢個對話框'}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
