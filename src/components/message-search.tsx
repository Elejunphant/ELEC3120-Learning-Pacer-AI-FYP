'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Search, X, Bot, User, Globe, Loader2, MessageSquare } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface GlobalSearchResult {
  conversationId: string;
  conversationTitle: string;
  messages: {
    id: string;
    content: string;
    role: string;
    createdAt: string;
  }[];
}

interface MessageSearchProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  language: 'en' | 'zh';
  onJumpToMessage: (messageId: string) => void;
  onSelectConversation?: (conversationId: string) => void;
}

function highlightText(text: string, query: string): React.ReactNode[] {
  if (!query.trim()) return [text];

  const parts: React.ReactNode[] = [];
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  let lastIndex = 0;

  let index = lowerText.indexOf(lowerQuery, lastIndex);
  while (index !== -1) {
    // Add text before the match
    if (index > lastIndex) {
      parts.push(text.slice(lastIndex, index));
    }
    // Add the highlighted match
    parts.push(
      <mark
        key={`mark-${index}`}
        className="bg-yellow-200 dark:bg-yellow-500/40 text-gray-900 dark:text-gray-100 rounded-sm px-0.5"
      >
        {text.slice(index, index + query.length)}
      </mark>
    );
    lastIndex = index + query.length;
    index = lowerText.indexOf(lowerQuery, lastIndex);
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

function truncateContent(content: string, maxLength: number = 120): string {
  // Remove markdown formatting for display
  const stripped = content
    .replace(/```[\s\S]*?```/g, ' [code block] ')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/#{1,6}\s/g, '')
    .replace(/\n+/g, ' ')
    .trim();

  if (stripped.length <= maxLength) return stripped;
  return stripped.slice(0, maxLength) + '...';
}

function formatRelativeTime(dateStr: string, language: 'en' | 'zh'): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (language === 'en') {
    if (diffSec < 5) return 'Just now';
    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } else {
    if (diffSec < 5) return '剛剛';
    if (diffSec < 60) return `${diffSec}秒前`;
    if (diffMin < 60) return `${diffMin}分鐘前`;
    if (diffHour < 24) return `${diffHour}小時前`;
    if (diffDay < 7) return `${diffDay}日前`;
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  }
}

export function MessageSearch({
  isOpen,
  onClose,
  messages,
  language,
  onJumpToMessage,
  onSelectConversation,
}: MessageSearchProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Global search state
  const [globalResults, setGlobalResults] = useState<GlobalSearchResult[]>([]);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [globalSearched, setGlobalSearched] = useState(false);
  const [showGlobal, setShowGlobal] = useState(false);

  // Focus input when dialog opens
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure dialog is mounted
      setTimeout(() => inputRef.current?.focus(), 100);
      // Reset global search state when dialog opens
      setGlobalResults([]);
      setGlobalLoading(false);
      setGlobalSearched(false);
      setShowGlobal(false);
    }
  }, [isOpen]);

  // Filter messages by query (local)
  const results = useMemo(() => {
    if (!query.trim()) return [];
    const lower = query.toLowerCase();
    return messages.filter((msg) =>
      msg.content.toLowerCase().includes(lower)
    );
  }, [query, messages]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Search all conversations
  const handleSearchAll = useCallback(async () => {
    if (!query.trim()) return;
    setGlobalLoading(true);
    setGlobalSearched(true);
    setShowGlobal(true);

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setGlobalResults(data.results || []);
      }
    } catch {
      // silently fail
    } finally {
      setGlobalLoading(false);
    }
  }, [query]);

  // Handle selecting a result from another conversation
  const handleSelectGlobalResult = useCallback(
    (conversationId: string) => {
      if (onSelectConversation) {
        onSelectConversation(conversationId);
      }
      onClose();
    },
    [onSelectConversation, onClose]
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
        {/* Search input area */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <Search className="h-4 w-4 text-gray-400 dark:text-gray-500 shrink-0" />
          <div className="relative flex-1">
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                // Reset global search when query changes
                if (globalSearched) {
                  setGlobalResults([]);
                  setGlobalSearched(false);
                  setShowGlobal(false);
                }
              }}
              placeholder={
                language === 'en'
                  ? 'Search messages...'
                  : '搜尋訊息...'
              }
              className="border-0 shadow-none focus-visible:ring-0 h-8 text-sm bg-transparent dark:bg-transparent px-0 focus:ring-2 focus:ring-emerald-400/30 pr-10"
            />
            <kbd className="absolute right-0 top-1/2 -translate-y-1/2 text-[10px] px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-400 font-mono pointer-events-none">ESC</kbd>
          </div>
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setGlobalResults([]);
                setGlobalSearched(false);
                setShowGlobal(false);
              }}
              className="shrink-0 h-5 w-5 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Clear search"
            >
              <X className="h-3 w-3 text-gray-400" />
            </button>
          )}
        </div>

        <DialogHeader className="sr-only">
          <DialogTitle>
            {language === 'en' ? 'Search Messages' : '搜尋訊息'}
          </DialogTitle>
          <DialogDescription>
            {language === 'en'
              ? 'Search within the current conversation or all conversations'
              : '在當前對話或所有對話中搜尋'}
          </DialogDescription>
        </DialogHeader>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {!showGlobal ? (
            <>
              {/* Local search results */}
              {query.trim() && results.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <Search className="h-8 w-8 text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {language === 'en' ? 'No messages found' : '未找到訊息'}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {language === 'en'
                      ? 'Try a different search term'
                      : '嘗試其他搜尋詞'}
                  </p>
                </div>
              )}

              {results.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => onJumpToMessage(msg.id)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800 last:border-b-0 transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`shrink-0 h-6 w-6 rounded-md flex items-center justify-center mt-0.5 ${
                        msg.role === 'user'
                          ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {msg.role === 'user' ? (
                        <User className="h-3 w-3" />
                      ) : (
                        <Bot className="h-3 w-3" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                          {msg.role === 'user'
                            ? language === 'en' ? 'You' : '你'
                            : 'LearningPacer'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-2">
                        {highlightText(truncateContent(msg.content), query)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}

              {!query.trim() && (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <Search className="h-8 w-8 text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    {language === 'en'
                      ? 'Type to search messages'
                      : '輸入以搜尋訊息'}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">
                    {language === 'en'
                      ? 'Press Esc to close'
                      : '按 Esc 關閉'}
                  </p>
                </div>
              )}

              {/* Search All Conversations button — shown below local results */}
              {query.trim() && !globalSearched && (
                <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSearchAll}
                    className="w-full justify-center gap-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-sm h-8 rounded-lg"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    {language === 'en'
                      ? 'Search All Conversations'
                      : '搜尋所有對話'}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Global search results */}
              {globalLoading && (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <Loader2 className="h-6 w-6 text-emerald-500 animate-spin mb-3" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {language === 'en'
                      ? 'Searching all conversations...'
                      : '搜尋所有對話...'}
                  </p>
                </div>
              )}

              {!globalLoading && globalResults.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <Globe className="h-8 w-8 text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {language === 'en'
                      ? 'No results in other conversations'
                      : '其他對話中揾唔到結果'}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {language === 'en'
                      ? 'Try a different search term'
                      : '嘗試其他搜尋詞'}
                  </p>
                </div>
              )}

              {globalResults.map((group) => (
                <div key={group.conversationId}>
                  {/* Conversation header */}
                  <button
                    onClick={() => handleSelectGlobalResult(group.conversationId)}
                    className="w-full text-left px-4 py-2.5 bg-gray-50 dark:bg-gray-900/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border-b border-gray-200 dark:border-gray-800 transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                        {highlightText(group.conversationTitle, query)}
                      </span>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 ml-auto shrink-0">
                        {group.messages.length}{' '}
                        {language === 'en'
                          ? group.messages.length === 1 ? 'msg' : 'msgs'
                          : group.messages.length === 1 ? '條' : '條'}
                      </span>
                    </div>
                  </button>

                  {/* Messages in this conversation */}
                  {group.messages.map((msg) => (
                    <button
                      key={msg.id}
                      onClick={() => handleSelectGlobalResult(group.conversationId)}
                      className="w-full text-left px-4 pl-8 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800 last:border-b-0 transition-colors"
                    >
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`shrink-0 h-5 w-5 rounded flex items-center justify-center mt-0.5 ${
                            msg.role === 'user'
                              ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          {msg.role === 'user' ? (
                            <User className="h-2.5 w-2.5" />
                          ) : (
                            <Bot className="h-2.5 w-2.5" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                              {msg.role === 'user'
                                ? language === 'en' ? 'You' : '你'
                                : 'LP'}
                            </span>
                            <span className="text-[10px] text-gray-300 dark:text-gray-600">
                              {formatRelativeTime(msg.createdAt, language)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">
                            {highlightText(truncateContent(msg.content), query)}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ))}

              {/* Back to local results */}
              {!globalLoading && (
                <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowGlobal(false)}
                    className="w-full justify-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm h-8 rounded-lg"
                  >
                    <Search className="h-3.5 w-3.5" />
                    {language === 'en'
                      ? 'Back to Current Conversation'
                      : '返回當前對話'}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer with result count */}
        {!showGlobal && query.trim() && results.length > 0 && (
          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900/40 border-t border-gray-200 dark:border-gray-800">
            <p className="text-[11px] text-gray-400 dark:text-gray-500">
              {results.length}{' '}
              {language === 'en'
                ? results.length === 1 ? 'result found' : 'results found'
                : results.length === 1 ? '個結果' : '個結果'}
            </p>
          </div>
        )}

        {showGlobal && !globalLoading && globalResults.length > 0 && (
          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900/40 border-t border-gray-200 dark:border-gray-800">
            <p className="text-[11px] text-gray-400 dark:text-gray-500">
              {globalResults.length}{' '}
              {language === 'en'
                ? globalResults.length === 1 ? 'conversation' : 'conversations'
                : globalResults.length === 1 ? '個對話' : '個對話'}
              {' · '}
              {globalResults.reduce((sum, g) => sum + g.messages.length, 0)}{' '}
              {language === 'en'
                ? 'messages found'
                : '條訊息'}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
