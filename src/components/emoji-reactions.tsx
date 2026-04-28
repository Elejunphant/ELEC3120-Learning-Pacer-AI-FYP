'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SmilePlus } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// The 6 emoji options
const EMOJI_OPTIONS = ['👍', '👎', '❤️', '😄', '🤔', '💡'] as const;

export type ReactionsMap = Record<string, Record<string, number>>;

interface EmojiReactionsProps {
  messageId: string;
  reactions: ReactionsMap;
  onToggleReaction: (messageId: string, emoji: string) => void;
  language?: 'en' | 'zh';
}

/** Small inline button to open the emoji picker */
export function EmojiReactionButton({
  messageId,
  reactions,
  onToggleReaction,
  language = 'en',
}: EmojiReactionsProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = useCallback(
    (emoji: string) => {
      onToggleReaction(messageId, emoji);
      setOpen(false);
    },
    [messageId, onToggleReaction],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="flex items-center justify-center h-7 w-7 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-200/60 dark:hover:text-gray-300 dark:hover:bg-gray-700/60 transition-all duration-150"
          aria-label={
            language === 'en' ? 'Add reaction' : '添加表情回應'
          }
          title={language === 'en' ? 'Add reaction' : '添加表情回應'}
        >
          <SmilePlus className="h-3.5 w-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        sideOffset={6}
        className="w-auto p-1.5 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg dark:shadow-black/30"
      >
        <div className="flex items-center gap-0.5">
          {EMOJI_OPTIONS.map((emoji) => {
            const count =
              reactions[messageId]?.[emoji] ?? 0;
            return (
              <TooltipProvider key={emoji} delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => handleSelect(emoji)}
                      className={`
                        relative flex items-center justify-center h-8 w-8 rounded-lg
                        text-lg transition-all duration-150
                        hover:bg-emerald-50 dark:hover:bg-emerald-900/30
                        hover:scale-110 active:scale-95
                        ${count > 0 ? 'bg-emerald-50/60 dark:bg-emerald-900/20 ring-1 ring-emerald-200 dark:ring-emerald-700/50' : ''}
                      `}
                      aria-label={emoji}
                    >
                      <span className="select-none">{emoji}</span>
                      {count > 0 && (
                        <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[14px] h-[14px] px-0.5 rounded-full bg-emerald-500 dark:bg-emerald-600 text-[9px] font-bold text-white leading-none">
                          {count}
                        </span>
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    className="text-xs bg-gray-800 dark:bg-gray-700 text-white"
                  >
                    {emoji === '👍'
                      ? language === 'en'
                        ? 'Thumbs up'
                        : '贊'
                      : emoji === '👎'
                        ? language === 'en'
                          ? 'Thumbs down'
                          : '踩'
                        : emoji === '❤️'
                          ? language === 'en'
                            ? 'Love'
                            : '喜愛'
                          : emoji === '😄'
                            ? language === 'en'
                              ? 'Haha'
                              : '哈哈'
                            : emoji === '🤔'
                              ? language === 'en'
                                ? 'Thinking'
                                : '思考'
                              : language === 'en'
                                ? 'Insightful'
                                : '有見地'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/** Display existing reactions below a message bubble */
export function ReactionDisplay({
  messageId,
  reactions,
  onToggleReaction,
  language = 'en',
}: EmojiReactionsProps) {
  const messageReactions = reactions[messageId];
  if (!messageReactions || Object.keys(messageReactions).length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-1 mt-1.5 ml-1">
      <AnimatePresence mode="popLayout">
        {Object.entries(messageReactions).map(([emoji, count]) => {
          if (count <= 0) return null;
          return (
            <motion.button
              key={emoji}
              layout
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{
                type: 'spring',
                stiffness: 500,
                damping: 25,
              }}
              onClick={() => onToggleReaction(messageId, emoji)}
              className="
                inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                border border-gray-200 dark:border-gray-700
                bg-gray-50 dark:bg-gray-800/60
                text-sm transition-all duration-150
                hover:border-emerald-300 dark:hover:border-emerald-600
                hover:bg-emerald-50 dark:hover:bg-emerald-900/20
                hover:scale-105 active:scale-95
                cursor-pointer select-none
              "
              aria-label={`${emoji} (${count}) — ${language === 'en' ? 'click to remove' : '㩒移除'}`}
              title={
                language === 'en'
                  ? `${emoji} — click to remove`
                  : `${emoji} — 㩒移除`
              }
            >
              <span className="text-xs leading-none">{emoji}</span>
              <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                {count}
              </span>
            </motion.button>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
