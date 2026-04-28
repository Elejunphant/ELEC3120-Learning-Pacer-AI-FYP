'use client';

import React, { useState, useEffect } from 'react';
import { Bookmark, X, BookmarkX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Message } from '@/components/chat-messages';
import { useFloatingDrag } from '@/hooks/use-floating-drag';

interface PinnedMessagesProps {
  messages: Message[];
  pinnedIds: Set<string>;
  onTogglePin: (id: string) => void;
  onRemovePin: (id: string) => void;
  language: 'en' | 'zh';
}

export function PinnedMessages({
  messages,
  pinnedIds,
  onTogglePin,
  onRemovePin,
  language,
}: PinnedMessagesProps) {
  const [isOpen, setIsOpen] = useState(false);

  // ── Draggable floating widget (framer-motion) ────────────────
  const {
    x,
    y,
    hydrated: dragHydrated,
    isDragging: dragIsDragging,
    wasDragged: dragWasDraggedRef,
    containerRef: dragContainerRef,
    dragProps,
  } = useFloatingDrag({
    storageKey: 'lp-pinned-messages-position',
    defaultPosition: () => ({
      x: Math.max(0, window.innerWidth - 72),
      y: Math.max(0, window.innerHeight - 72),
    }),
  });

  // Get pinned messages, sorted by original order in the chat
  const pinnedMessages = messages.filter((msg) => pinnedIds.has(msg.id));

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dragContainerRef.current &&
        !dragContainerRef.current.contains(e.target as Node)
      ) {
        const target = e.target as HTMLElement;
        if (!target.closest('[data-pinned-toggle]')) {
          setIsOpen(false);
        }
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleUnpin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onRemovePin(id);
  };

  const formatTimestamp = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString(language === 'en' ? 'en-US' : 'zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const truncateText = (text: string, maxLen: number) => {
    // Strip markdown syntax for display
    const stripped = text
      .replace(/```[\s\S]*?```/g, '[code]')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      .replace(/#{1,6}\s/g, '')
      .replace(/\n+/g, ' ')
      .trim();
    if (stripped.length <= maxLen) return stripped;
    return stripped.slice(0, maxLen) + '…';
  };

  const pinnedCount = pinnedIds.size;

  // Don't render until hydrated
  if (!dragHydrated) return null;

  return (
    <motion.div
      ref={dragContainerRef}
      {...dragProps}
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        x,
        y,
        zIndex: 50,
        touchAction: 'none',
      }}
      className="flex flex-col items-end gap-2"
    >
      {/* Floating button — clicking toggles, dragging the wrapper moves it */}
      <button
        data-pinned-toggle
        type="button"
        onClick={() => {
          if (dragWasDraggedRef.current) return;
          setIsOpen((prev) => !prev);
        }}
        className={`relative flex items-center justify-center h-12 w-12 rounded-full shadow-lg transition-all duration-200 select-none ${
          dragIsDragging
            ? 'shadow-2xl cursor-grabbing'
            : isOpen
              ? 'bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 cursor-grab'
              : 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white cursor-grab'
        }`}
        aria-label={language === 'en' ? 'Pinned messages' : '已固定的訊息'}
      >
        {isOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Bookmark className="h-5 w-5" />
        )}
        {/* Badge with count */}
        {pinnedCount > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center h-5 min-w-[20px] px-1 rounded-full bg-rose-500 text-white text-[11px] font-bold leading-none">
            {pinnedCount}
          </span>
        )}
      </button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="w-[340px] max-h-[400px] rounded-2xl border border-gray-200/60 dark:border-gray-700/60 bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl shadow-2xl flex flex-col overflow-hidden relative"
          >
            {/* Gradient top border */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 rounded-t-xl" />

            {/* Header */}
            <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-200/60 dark:border-gray-700/60">
              <div className="flex items-center gap-2">
                <Bookmark className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  {language === 'en' ? 'Pinned Messages' : '已固定的訊息'}
                </span>
                {pinnedCount > 0 && (
                  <span className="text-xs text-gray-400 dark:text-gray-500 font-normal">
                    ({pinnedCount})
                  </span>
                )}
              </div>
            </div>

            {/* Message list */}
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              {pinnedMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                  <Bookmark className="h-10 w-10 text-gray-200 dark:text-gray-700 mb-3" />
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    {language === 'en' ? 'No pinned messages' : '冇固定的訊息'}
                  </p>
                  <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">
                    {language === 'en'
                      ? 'Bookmark important messages to review later'
                      : '固定重要訊息以便稍後查看'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {pinnedMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className="group/pin px-4 py-3 hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors duration-150"
                    >
                      <div className="flex items-start gap-2">
                        {/* Role indicator */}
                        <div className="shrink-0 mt-0.5">
                          <div
                            className={`h-5 w-5 rounded flex items-center justify-center text-[10px] font-bold ${
                              msg.role === 'user'
                                ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                            }`}
                          >
                            {msg.role === 'user' ? 'U' : 'AI'}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            {truncateText(msg.content, 120)}
                          </p>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                            {formatTimestamp(msg.createdAt)}
                          </p>
                        </div>

                        {/* Unpin button */}
                        <button
                          onClick={(e) => handleUnpin(msg.id, e)}
                          className="shrink-0 flex items-center justify-center h-6 w-6 rounded-md text-gray-300 hover:text-red-500 hover:bg-red-50 dark:text-gray-600 dark:hover:text-red-400 dark:hover:bg-red-900/30 opacity-0 group-hover/pin:opacity-100 transition-all duration-150"
                          aria-label={language === 'en' ? 'Unpin message' : '取消固定'}
                          title={language === 'en' ? 'Unpin' : '取消固定'}
                        >
                          <BookmarkX className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
