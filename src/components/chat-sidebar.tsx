'use client';

import React, { useCallback, useState, useMemo, useRef, useEffect } from 'react';
import {
  Plus,
  MessageSquare,
  BookOpen,
  Trash2,
  Hash,
  GraduationCap,
  BarChart3,
  Calendar,
  Search,
  X,
  Trash,
  ChevronDown,
  Timer,
  Layers,
  Pencil,
  Check,
  Calculator,
  Network,
  Wrench,
  StickyNote,
  Target,
  FileText,
  Tags,
  Filter,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { knowledgeTopics } from '@/lib/knowledge-base';
import type { KnowledgeTopic } from '@/lib/knowledge-base';
import { useToast } from '@/hooks/use-toast';
import { StudyProgress } from '@/components/study-progress';
import { DailyGoalRing } from '@/components/daily-goal-ring';
import { ExamCountdown } from '@/components/exam-countdown';
import {
  CONVERSATION_TAGS,
  loadConversationTags,
  saveConversationTags,
  toggleConversationTag,
  getTagById,
  type ConversationTag,
} from '@/lib/conversation-tags';

interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
  _count?: { messages: number };
}

interface ChatSidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => Promise<boolean>;
  onSelectTopic: (topic: KnowledgeTopic) => void;
  onOpenQuiz: () => void;
  onOpenFlashcards: () => void;
  onOpenPomodoro: () => void;
  onOpenStats: () => void;
  onOpenStudyPlan: () => void;
  onOpenFormulas: () => void;
  onOpenProtocols: () => void;
  onOpenGlossary: () => void;
  onOpenSubnetCalc: () => void;
  onOpenNetworkTools: () => void;
  onOpenScratchpad: () => void;
  onOpenGoals: () => void;
  onOpenCheatsheet: () => void;
  onDeleteAllConversations: () => void;
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'zh';
}

type TimePeriod = 'today' | 'yesterday' | 'previous7days' | 'older';

interface GroupedConversations {
  label: string;
  labelZh: string;
  period: TimePeriod;
  conversations: Conversation[];
}

function groupByTimePeriod(
  convs: Conversation[],
  language: 'en' | 'zh'
): GroupedConversations[] {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);
  const sevenDaysAgoStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);

  const groups: Record<TimePeriod, Conversation[]> = {
    today: [],
    yesterday: [],
    previous7days: [],
    older: [],
  };

  for (const conv of convs) {
    const updatedAt = new Date(conv.updatedAt);
    if (updatedAt >= todayStart) {
      groups.today.push(conv);
    } else if (updatedAt >= yesterdayStart) {
      groups.yesterday.push(conv);
    } else if (updatedAt >= sevenDaysAgoStart) {
      groups.previous7days.push(conv);
    } else {
      groups.older.push(conv);
    }
  }

  const labels: Record<TimePeriod, { en: string; zh: string }> = {
    today: { en: 'Today', zh: '今日' },
    yesterday: { en: 'Yesterday', zh: '昨日' },
    previous7days: { en: 'Previous 7 Days', zh: '過去7日' },
    older: { en: 'Older', zh: '更早' },
  };

  const order: TimePeriod[] = ['today', 'yesterday', 'previous7days', 'older'];
  const result: GroupedConversations[] = [];

  for (const period of order) {
    if (groups[period].length > 0) {
      groups[period].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      result.push({
        label: labels[period].en,
        labelZh: labels[period].zh,
        period,
        conversations: groups[period],
      });
    }
  }

  return result;
}

/** Small colored dot for a tag */
function TagDot({ tag, size = 'sm' }: { tag: ConversationTag; size?: 'sm' | 'md' }) {
  const sizeClass = size === 'sm' ? 'h-[6px] w-[6px]' : 'h-3 w-3';
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={`${sizeClass} rounded-full inline-block shrink-0 ring-1 ring-white/20`}
            style={{ backgroundColor: tag.dotClass.replace('bg-', '').replace('-500', '') === 'rose' ? '#f43f5e' : tag.dotClass.replace('bg-', '').replace('-500', '') === 'amber' ? '#f59e0b' : tag.dotClass.replace('bg-', '').replace('-500', '') === 'violet' ? '#8b5cf6' : tag.dotClass.replace('bg-', '').replace('-500', '') === 'emerald' ? '#10b981' : '#0ea5e9' }}
          />
        </TooltipTrigger>
        <TooltipContent side="top" className="text-[11px] px-2 py-1">
          {tag.label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/** Color dot utility — map tag id to a raw CSS color for inline styles */
function getTagColor(tagId: string): string {
  const colorMap: Record<string, string> = {
    important: '#f43f5e',
    review: '#f59e0b',
    exam: '#8b5cf6',
    notes: '#10b981',
    question: '#0ea5e9',
  };
  return colorMap[tagId] || '#888';
}

export function ChatSidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onRenameConversation,
  onSelectTopic,
  onOpenQuiz,
  onOpenFlashcards,
  onOpenPomodoro,
  onOpenStats,
  onOpenStudyPlan,
  onOpenFormulas,
  onOpenProtocols,
  onOpenGlossary,
  onOpenSubnetCalc,
  onOpenNetworkTools,
  onOpenScratchpad,
  onOpenGoals,
  onOpenCheatsheet,
  onDeleteAllConversations,
  isOpen,
  onClose,
  language,
}: ChatSidebarProps) {
  const { toast } = useToast();
  const [topicsOpen, setTopicsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  // ── Tag state ──
  const [conversationTags, setConversationTags] = useState<Record<string, string[]>>(() =>
    loadConversationTags()
  );
  const [tagFilter, setTagFilter] = useState<string | null>(null); // active filter tag id
  const [tagPopupId, setTagPopupId] = useState<string | null>(null); // which conv is showing tag picker
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tagButtonRef = useRef<HTMLButtonElement | null>(null);

  // Sync tags on mount (in case changed in another tab)
  useEffect(() => {
    const handler = () => setConversationTags(loadConversationTags());
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const handleToggleTag = useCallback((convId: string, tagId: string) => {
    setConversationTags((prev) => toggleConversationTag(convId, tagId, prev));
  }, []);

  const handleTagRightClick = useCallback((e: React.MouseEvent, convId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setTagPopupId((prev) => (prev === convId ? null : convId));
  }, []);

  const handleTagLongPressStart = useCallback((convId: string) => {
    longPressTimerRef.current = setTimeout(() => {
      setTagPopupId((prev) => (prev === convId ? null : convId));
    }, 500);
  }, []);

  const handleTagLongPressEnd = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  // ── End tag state ──

  const handleDeleteAll = async () => {
    setIsDeleting(true);
    try {
      await onDeleteAllConversations();
      setDeleteAllDialogOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // Auto-focus the edit input when editing starts
  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  const startEditing = useCallback(
    (convId: string, currentTitle: string) => {
      setEditingId(convId);
      setEditTitle(currentTitle);
    },
    []
  );

  const cancelEditing = useCallback(() => {
    setEditingId(null);
    setEditTitle('');
  }, []);

  const saveEditing = useCallback(async () => {
    if (!editingId || !editTitle.trim()) {
      cancelEditing();
      return;
    }
    const success = await onRenameConversation(editingId, editTitle.trim());
    if (success) {
      toast({
        description: language === 'en' ? 'Title updated' : '標題已更新',
      });
    }
    cancelEditing();
  }, [editingId, editTitle, onRenameConversation, language, toast, cancelEditing]);

  const handleEditKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        saveEditing();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        cancelEditing();
      }
    },
    [saveEditing, cancelEditing]
  );

  const filteredConversations = useMemo(() => {
    let result = conversations;

    // Apply tag filter first
    if (tagFilter) {
      result = result.filter((c) => {
        const tags = conversationTags[c.id] || [];
        return tags.includes(tagFilter);
      });
    }

    // Then apply search query
    if (!searchQuery.trim()) return result;
    const query = searchQuery.toLowerCase();
    return result.filter((c) => c.title.toLowerCase().includes(query));
  }, [conversations, searchQuery, tagFilter, conversationTags]);

  const groupedConversations = useMemo(() => {
    return groupByTimePeriod(filteredConversations, language);
  }, [filteredConversations, language]);

  const showClearSearch = searchQuery.trim().length > 0;

  // Count how many conversations have each tag
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const tag of CONVERSATION_TAGS) {
      counts[tag.id] = 0;
    }
    for (const convId of Object.keys(conversationTags)) {
      // Only count if the conversation still exists
      if (conversations.some((c) => c.id === convId)) {
        for (const tagId of conversationTags[convId]) {
          if (counts[tagId] !== undefined) {
            counts[tagId]++;
          }
        }
      }
    }
    return counts;
  }, [conversationTags, conversations]);

  const formatDate = useCallback(
    (dateStr: string) => {
      const date = new Date(dateStr);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      if (days === 0) {
        return language === 'en' ? 'Today' : '今日';
      } else if (days === 1) {
        return language === 'en' ? 'Yesterday' : '昨日';
      } else if (days < 7) {
        return language === 'en' ? `${days}d ago` : `${days}日前`;
      } else {
        return date.toLocaleDateString(language === 'en' ? 'en-US' : 'zh-CN', {
          month: 'short',
          day: 'numeric',
        });
      }
    },
    [language]
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar — Poe style: clean minimal dark */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-[260px] flex flex-col lg:relative lg:translate-x-0 overflow-hidden safe-top safe-bottom sidebar-bottom-glow ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out`}
        style={{ backgroundColor: 'var(--sidebar, #1b1b1b)', color: 'var(--sidebar-foreground, #e0e0e0)', willChange: 'transform' }}
      >
        {/* Emerald gradient accent strip at very top */}
        <div className="h-[3px] w-full bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 shrink-0" />

        {/* Top section: New Chat button + Search */}
        <div className="px-3 pt-[max(12px,env(safe-area-inset-top))] shrink-0">
          {/* New Chat button — bordered outline style with hover glow + scale */}
          <button
            onClick={onNewChat}
            className="flex items-center justify-center gap-2 w-full h-[40px] rounded-lg text-[13px] font-medium transition-all duration-200 ease-out touch-manipulation hover:scale-[1.02] hover:shadow-[0_0_16px_rgba(16,185,129,0.25)] active:scale-[0.98] btn-press new-chat-btn-glow btn-shine"
            style={{
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'var(--sidebar-foreground, #e0e0e0)',
              backgroundColor: 'transparent',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--sidebar-accent, #2f2f2f)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(16,185,129,0.3)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.15)';
            }}
          >
            <Plus className="h-4 w-4" />
            {language === 'en' ? 'New Chat' : '新對話'}
          </button>
        </div>

        {/* Search input — minimal */}
        <div className="px-3 pt-2 pb-1 shrink-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none" style={{ color: '#888888' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === 'en' ? 'Search...' : '搜尋...'
              }
              className="w-full h-8 pl-8 pr-7 rounded-lg text-[13px] focus:outline-none transition-colors duration-150"
              style={{
                backgroundColor: '#2a2a2a',
                color: '#e0e0e0',
                border: '1px solid transparent',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'transparent';
              }}
            />
            {showClearSearch && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center rounded transition-colors"
                style={{ color: '#888888' }}
                aria-label="Clear search"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Close button for mobile */}
        <div className="lg:hidden px-3 pb-1 shrink-0 flex justify-end">
          <button
            onClick={onClose}
            className="h-7 w-7 flex items-center justify-center rounded transition-colors touch-manipulation"
            style={{ color: '#888888' }}
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tag filter chips — show if any tag has conversations */}
        {Object.values(tagCounts).some((c) => c > 0) && (
          <div className="px-3 pb-1 shrink-0">
            <div className="flex items-center gap-1 flex-wrap">
              {CONVERSATION_TAGS.map((tag) => {
                const count = tagCounts[tag.id] || 0;
                if (count === 0) return null;
                const isActive = tagFilter === tag.id;
                return (
                  <button
                    key={tag.id}
                    onClick={() => setTagFilter((prev) => (prev === tag.id ? null : tag.id))}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium transition-all duration-150 touch-manipulation border"
                    style={{
                      backgroundColor: isActive ? `${getTagColor(tag.id)}22` : 'transparent',
                      borderColor: isActive ? `${getTagColor(tag.id)}66` : 'rgba(255,255,255,0.08)',
                      color: isActive ? getTagColor(tag.id) : '#888888',
                    }}
                  >
                    <span
                      className="h-[5px] w-[5px] rounded-full shrink-0"
                      style={{ backgroundColor: getTagColor(tag.id) }}
                    />
                    <span className="hidden sm:inline truncate max-w-[50px]">{tag.label.split(' ')[0]}</span>
                    <span className="sm:hidden">{count}</span>
                  </button>
                );
              })}
              {tagFilter && (
                <button
                  onClick={() => setTagFilter(null)}
                  className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium transition-colors duration-150 touch-manipulation"
                  style={{ color: '#888888' }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color = '#c0c0c0';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color = '#888888';
                  }}
                >
                  <X className="h-2.5 w-2.5" />
                  {language === 'en' ? 'Clear' : '清除'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Conversations list */}
        <div className="relative flex-1 min-h-0">
          <ScrollArea className="h-full px-2 py-1">
            <div>
              {groupedConversations.map((group, groupIdx) => (
                <div key={group.period} className={`mb-1 ${groupIdx > 0 ? 'mt-2 pt-2 border-t border-white/[0.06]' : ''}`}>
                  <p className="text-[11px] px-3 py-1.5 font-medium" style={{ color: '#666666' }}>
                    {language === 'en' ? group.label : group.labelZh}
                  </p>
                  {group.conversations.map((conv) => {
                    const convTags = conversationTags[conv.id] || [];
                    return (
                      <div
                        key={conv.id}
                        className="group flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-all duration-150 sidebar-item-glow sidebar-item-slide"
                        style={{
                          backgroundColor:
                            activeConversationId === conv.id
                              ? '#2f2f2f'
                              : editingId === conv.id
                              ? '#2f2f2f'
                              : 'transparent',
                          color:
                            activeConversationId === conv.id
                              ? '#e0e0e0'
                              : '#b0b0b0',
                        }}
                        onClick={() => {
                          if (editingId === conv.id) return;
                          onSelectConversation(conv.id);
                          onClose();
                        }}
                        onContextMenu={(e) => handleTagRightClick(e, conv.id)}
                        onMouseDown={() => handleTagLongPressStart(conv.id)}
                        onMouseUp={handleTagLongPressEnd}
                        onTouchStart={() => handleTagLongPressStart(conv.id)}
                        onTouchEnd={handleTagLongPressEnd}
                        onMouseEnter={(e) => {
                          if (activeConversationId !== conv.id && editingId !== conv.id) {
                            (e.currentTarget as HTMLElement).style.backgroundColor = '#2a2a2a';
                          }
                        }}
                        onMouseLeave={(e) => {
                          handleTagLongPressEnd();
                          if (activeConversationId !== conv.id && editingId !== conv.id) {
                            (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        {/* Bot icon — small gray circle */}
                        <div
                          className="h-[28px] w-[28px] rounded-full flex items-center justify-center shrink-0 relative"
                          style={{ backgroundColor: '#3a3a3a' }}
                        >
                          <MessageSquare className="h-3.5 w-3.5" style={{ color: '#999999' }} />
                          {/* Colored tag dots overlay */}
                          {convTags.length > 0 && (
                            <div className="absolute -top-0.5 -right-0.5 flex gap-0">
                              {convTags.slice(0, 3).map((tagId) => (
                                <span
                                  key={tagId}
                                  className="h-[7px] w-[7px] rounded-full ring-1 ring-[#3a3a3a]"
                                  style={{ backgroundColor: getTagColor(tagId) }}
                                />
                              ))}
                              {convTags.length > 3 && (
                                <span
                                  className="h-[7px] w-[7px] rounded-full ring-1 ring-[#3a3a3a] flex items-center justify-center text-[5px] font-bold"
                                  style={{ backgroundColor: '#555', color: '#ddd' }}
                                >
                                  +
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {editingId === conv.id ? (
                          <>
                            <input
                              ref={editInputRef}
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value.slice(0, 100))}
                              onKeyDown={handleEditKeyDown}
                              onBlur={saveEditing}
                              className="flex-1 text-[13px] rounded px-1.5 py-0.5 min-w-0 focus:outline-none"
                              style={{
                                backgroundColor: '#3a3a3a',
                                color: '#e0e0e0',
                                border: '1px solid rgba(255,255,255,0.12)',
                              }}
                              maxLength={100}
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                saveEditing();
                              }}
                              className="h-6 w-6 flex items-center justify-center rounded transition-colors duration-100 touch-manipulation shrink-0"
                              style={{ color: '#e0e0e0' }}
                              aria-label={language === 'en' ? 'Save' : '保存'}
                            >
                              <Check className="h-3 w-3" />
                            </button>
                          </>
                        ) : (
                          <>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="text-[13px] truncate">{conv.title}</p>
                                {/* Inline tag dots for active/visible state */}
                                {convTags.length > 0 && (
                                  <div className="flex gap-0.5 shrink-0">
                                    {convTags.slice(0, 2).map((tagId) => (
                                      <span
                                        key={tagId}
                                        className="h-[5px] w-[5px] rounded-full"
                                        style={{ backgroundColor: getTagColor(tagId) }}
                                      />
                                    ))}
                                  </div>
                                )}
                              </div>
                              <p className="text-[10px] truncate mt-0.5" style={{ color: '#666666' }}>
                                {formatDate(conv.updatedAt)}
                              </p>
                            </div>

                            {/* Tag button — visible on hover */}
                            <Popover
                              open={tagPopupId === conv.id}
                              onOpenChange={(open) => {
                                if (!open) setTagPopupId(null);
                              }}
                            >
                              <PopoverTrigger asChild>
                                <button
                                  ref={(el) => {
                                    if (tagPopupId === conv.id) {
                                      tagButtonRef.current = el;
                                    }
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setTagPopupId((prev) => (prev === conv.id ? null : conv.id));
                                  }}
                                  className="opacity-0 group-hover:opacity-100 h-6 w-6 flex items-center justify-center rounded transition-all duration-100 touch-manipulation shrink-0"
                                  style={{ color: '#888888' }}
                                  aria-label={
                                    language === 'en' ? 'Tag conversation' : '標記對話'
                                  }
                                >
                                  <Tags className="h-3 w-3" />
                                </button>
                              </PopoverTrigger>
                              <PopoverContent
                                side="right"
                                align="start"
                                sideOffset={4}
                                className="w-[200px] p-2 rounded-xl border border-gray-200/80 dark:border-white/10 bg-white dark:bg-[#1e1e1e] shadow-lg z-[100]"
                                onOpenAutoFocus={(e) => e.preventDefault()}
                                onInteractOutside={(e) => {
                                  // Don't close if clicking inside the popover
                                  const target = e.target as HTMLElement;
                                  if (target.closest('[data-radix-popper-content-wrapper]')) return;
                                }}
                              >
                                <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 px-1 mb-1.5">
                                  {language === 'en' ? 'Tags 標籤' : '標籤 Tags'}
                                </p>
                                <div className="space-y-0.5">
                                  {CONVERSATION_TAGS.map((tag) => {
                                    const isActive = (conversationTags[conv.id] || []).includes(tag.id);
                                    return (
                                      <button
                                        key={tag.id}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleToggleTag(conv.id, tag.id);
                                        }}
                                        className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-[12px] transition-colors duration-100 text-left"
                                        style={{
                                          backgroundColor: isActive ? `${getTagColor(tag.id)}15` : 'transparent',
                                          color: isActive ? getTagColor(tag.id) : '#b0b0b0',
                                        }}
                                        onMouseEnter={(e) => {
                                          if (!isActive) {
                                            (e.currentTarget as HTMLElement).style.backgroundColor = '#2a2a2a';
                                          }
                                        }}
                                        onMouseLeave={(e) => {
                                          if (!isActive) {
                                            (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                                          } else {
                                            (e.currentTarget as HTMLElement).style.backgroundColor = `${getTagColor(tag.id)}15`;
                                          }
                                        }}
                                      >
                                        <span
                                          className={`h-4 w-4 rounded-md flex items-center justify-center shrink-0 border transition-colors duration-100`}
                                          style={{
                                            borderColor: isActive ? getTagColor(tag.id) : 'rgba(255,255,255,0.1)',
                                            backgroundColor: isActive ? `${getTagColor(tag.id)}25` : 'transparent',
                                          }}
                                        >
                                          {isActive && (
                                            <Check className="h-2.5 w-2.5" style={{ color: getTagColor(tag.id) }} />
                                          )}
                                        </span>
                                        <span className="flex-1 truncate">{tag.label}</span>
                                        <span
                                          className="h-[6px] w-[6px] rounded-full shrink-0"
                                          style={{ backgroundColor: getTagColor(tag.id) }}
                                        />
                                      </button>
                                    );
                                  })}
                                </div>
                              </PopoverContent>
                            </Popover>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditing(conv.id, conv.title);
                              }}
                              className="opacity-0 group-hover:opacity-100 h-6 w-6 flex items-center justify-center rounded transition-all duration-100 touch-manipulation shrink-0"
                              style={{ color: '#888888' }}
                              aria-label={
                                language === 'en' ? 'Rename conversation' : '重命名對話'
                              }
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteConversation(conv.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 h-6 w-6 flex items-center justify-center rounded transition-all duration-100 touch-manipulation shrink-0"
                              style={{ color: '#888888' }}
                              aria-label={
                                language === 'en' ? 'Delete conversation' : '刪除對話'
                              }
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}

              {conversations.length === 0 && (
                <p className="text-[13px] text-center py-8" style={{ color: '#666666' }}>
                  {language === 'en' ? 'No conversations yet' : '暫無對話'}
                </p>
              )}

              {conversations.length > 0 && filteredConversations.length === 0 && (
                <p className="text-[13px] text-center py-8" style={{ color: '#666666' }}>
                  {tagFilter
                    ? (language === 'en' ? 'No tagged conversations' : '無標記對話')
                    : (language === 'en' ? 'No matches' : '未找到匹配')}
                </p>
              )}
            </div>

            {/* Knowledge topics collapsible */}
            <div className="mt-2">
              <div
                className="h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.15), transparent)' }}
              />
            </div>
            <Collapsible open={topicsOpen} onOpenChange={setTopicsOpen}>
              <CollapsibleTrigger
                className="flex items-center gap-2 px-3 py-2 w-full text-[13px] font-medium rounded-lg transition-colors duration-100 touch-manipulation"
                style={{ color: '#888888' }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = '#2a2a2a';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                }}
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span className="flex-1 text-left">
                  {language === 'en' ? 'Knowledge Base' : '知識庫'}
                </span>
                <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${topicsOpen ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-0 mt-0.5">
                {knowledgeTopics.map((topic) => (
                  <div
                    key={topic.id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer text-[13px] transition-all duration-150 sidebar-item-glow"
                    style={{ color: '#888888' }}
                    onClick={() => {
                      onSelectTopic(topic);
                      onClose();
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = '#2a2a2a';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                    }}
                  >
                    <Hash className="h-3 w-3 shrink-0" style={{ color: '#666666' }} />
                    <span className="truncate">
                      {language === 'en' ? topic.title : topic.titleZh}
                    </span>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          </ScrollArea>
        </div>

        {/* Study Progress Widget */}
        <div className="shrink-0">
          <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.15), transparent)' }} />
          <StudyProgress language={language} />
        </div>

        {/* Daily Goal Ring */}
        <div className="shrink-0">
          <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.15), transparent)' }} />
          <DailyGoalRing language={language} />
        </div>

        {/* Exam Countdown (compact) */}
        <div className="shrink-0">
          <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.15), transparent)' }} />
          <div className="px-3 py-2">
            <ExamCountdown language={language} compact />
          </div>
        </div>

        {/* Bottom section: Tools + Management */}
        <div className="shrink-0">
          <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.15), transparent)' }} />
          <div className="px-2 py-1.5 space-y-0 pb-[max(8px,env(safe-area-inset-bottom))]">
            {/* Tools — compact grid */}
            <div className="grid grid-cols-2 gap-0.5">
              {[
                { label: language === 'en' ? 'Quiz' : '測驗', onClick: onOpenQuiz, icon: GraduationCap },
                { label: language === 'en' ? 'Flashcards' : '閃卡', onClick: onOpenFlashcards, icon: Layers },
                { label: language === 'en' ? 'Pomodoro' : '番茄鍾', onClick: () => { onOpenPomodoro(); onClose(); }, icon: Timer },
                { label: language === 'en' ? 'Stats' : '統計', onClick: onOpenStats, icon: BarChart3 },
                { label: language === 'en' ? 'Plan' : '計劃', onClick: onOpenStudyPlan, icon: Calendar },
                { label: language === 'en' ? 'Formulas' : '公式', onClick: () => { onOpenFormulas(); onClose(); }, icon: Calculator },
                { label: language === 'en' ? 'Protocols' : '協定', onClick: () => { onOpenProtocols(); onClose(); }, icon: Network },
                { label: language === 'en' ? 'Glossary' : '術語表', onClick: () => { onOpenGlossary(); onClose(); }, icon: BookOpen },
                { label: language === 'en' ? 'Subnet' : '子網', onClick: () => { onOpenSubnetCalc(); onClose(); }, icon: Calculator },
                { label: language === 'en' ? 'Net Tools' : '網工', onClick: () => { onOpenNetworkTools(); onClose(); }, icon: Wrench },
                { label: language === 'en' ? 'Notes' : '筆記', onClick: () => { onOpenScratchpad(); onClose(); }, icon: StickyNote },
                { label: language === 'en' ? 'Goals' : '目標', onClick: () => { onOpenGoals(); onClose(); }, icon: Target },
                { label: language === 'en' ? 'Cheat Sheet' : '速查', onClick: () => { onOpenCheatsheet(); onClose(); }, icon: FileText },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-[12px] transition-colors duration-100 touch-manipulation text-left"
                  style={{ color: '#888888' }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = '#2a2a2a';
                    (e.currentTarget as HTMLElement).style.color = '#c0c0c0';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                    (e.currentTarget as HTMLElement).style.color = '#888888';
                  }}
                >
                  <item.icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </div>

            {/* Delete All — red */}
            {conversations.length > 0 && (
              <AlertDialog open={deleteAllDialogOpen} onOpenChange={setDeleteAllDialogOpen}>
                <AlertDialogTrigger asChild>
                  <button
                    className="flex items-center gap-2.5 w-full px-3 py-1.5 rounded-lg text-[13px] transition-colors duration-100 touch-manipulation"
                    style={{ color: '#b44' }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = '#2a2a2a';
                      (e.currentTarget as HTMLElement).style.color = '#d66';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                      (e.currentTarget as HTMLElement).style.color = '#b44';
                    }}
                  >
                    <Trash className="h-4 w-4" />
                    {language === 'en' ? 'Delete All Chats' : '刪除所有對話'}
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {language === 'en'
                        ? 'Delete All Conversations?'
                        : '刪除所有對話？'}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {language === 'en'
                        ? 'This will permanently delete all your conversation history and messages. This action cannot be undone.'
                        : '呢個動作會永久刪除你所有嘅對話歷史同訊息。呢個操作無法撤回。'}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>
                      {language === 'en' ? 'Cancel' : '取消'}
                    </AlertDialogCancel>
                    <Button
                      onClick={handleDeleteAll}
                      disabled={isDeleting}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      {isDeleting
                        ? (language === 'en' ? 'Deleting...' : '刪除中...')
                        : (language === 'en' ? 'Delete All' : '全部刪除')}
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
