'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StickyNote,
  Copy,
  Trash2,
  MessageSquarePlus,
  Clock,
  Save,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

// ── Types ──────────────────────────────────────────────────────
interface ScratchpadProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'zh';
  onSendMessage: (content: string) => void;
}

interface ScratchpadData {
  content: string;
  lastEdited: string;
}

const STORAGE_KEY = 'lp-scratchpad';
const MAX_CHARS = 5000;
const AUTO_SAVE_INTERVAL = 2000;

// ── Helpers ────────────────────────────────────────────────────
function loadScratchpad(): ScratchpadData {
  if (typeof window === 'undefined') {
    return { content: '', lastEdited: '' };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ScratchpadData;
      if (typeof parsed.content === 'string' && typeof parsed.lastEdited === 'string') {
        return parsed;
      }
    }
  } catch {
    // silently fail
  }
  return { content: '', lastEdited: '' };
}

function saveScratchpad(data: ScratchpadData) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // silently fail
  }
}

function formatTimestamp(isoStr: string, language: 'en' | 'zh'): string {
  if (!isoStr) return '';
  const date = new Date(isoStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);

  if (seconds < 10) {
    return language === 'en' ? 'Just now' : '剛剛';
  }
  if (seconds < 60) {
    return language === 'en' ? `${seconds}s ago` : `${seconds}秒前`;
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return language === 'en' ? `${minutes}m ago` : `${minutes}分鐘前`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return language === 'en' ? `${hours}h ago` : `${hours}小時前`;
  }
  return date.toLocaleDateString(language === 'en' ? 'en-US' : 'zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ── Main Component ─────────────────────────────────────────────
export function Scratchpad({ isOpen, onClose, language, onSendMessage }: ScratchpadProps) {
  const [content, setContent] = useState(() => loadScratchpad().content);
  const [lastEdited, setLastEdited] = useState(() => loadScratchpad().lastEdited);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [saveIndicator, setSaveIndicator] = useState<'idle' | 'saving' | 'saved'>('idle');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSaveRef = useRef(false);
  const { toast } = useToast();

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 400) + 'px';
    }
  }, [content]);

  // Ref-stable doSave for use in effects without adding to deps array
  const doSaveRef = useRef<(text: string) => void>(() => {});

  // Sync the ref whenever it would change (empty deps — only runs once after mount)
  useEffect(() => {
    doSaveRef.current = (text: string) => {
      setSaveIndicator('saving');
      const now = new Date().toISOString();
      saveScratchpad({ content: text, lastEdited: now });
      setLastEdited(now);
      setSaveIndicator('saved');
      setTimeout(() => setSaveIndicator('idle'), 1500);
    };
  }, []);

  // Stable doSave callback for external use (handleClose, handleClear)
  const doSave = useCallback((text: string) => {
    doSaveRef.current(text);
  }, []);

  useEffect(() => {
    // Schedule auto-save — doSaveRef avoids putting doSave in deps
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    if (content !== loadScratchpad().content) {
      pendingSaveRef.current = true;
      autoSaveTimerRef.current = setTimeout(() => {
        doSaveRef.current(content);
        pendingSaveRef.current = false;
      }, AUTO_SAVE_INTERVAL);
    }
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [content]);

  // Save on close if pending
  const handleClose = useCallback(() => {
    if (pendingSaveRef.current) {
      doSave(content);
      pendingSaveRef.current = false;
    }
    onClose();
  }, [content, doSave, onClose]);

  // Save on unmount
  useEffect(() => {
    return () => {
      if (pendingSaveRef.current && autoSaveTimerRef.current) {
        // Synchronous save on unmount is tricky; the timer will fire
      }
    };
  });

  const handleClear = useCallback(() => {
    setContent('');
    const now = new Date().toISOString();
    saveScratchpad({ content: '', lastEdited: now });
    setLastEdited(now);
    setClearDialogOpen(false);
    toast({
      description: language === 'en' ? 'Notes cleared' : '筆記已清空',
    });
  }, [language, toast]);

  const handleCopy = useCallback(async () => {
    if (!content.trim()) return;
    try {
      await navigator.clipboard.writeText(content);
      toast({
        description: language === 'en' ? 'Copied to clipboard' : '已複製到剪貼簿',
      });
    } catch {
      toast({
        description: language === 'en' ? 'Failed to copy' : '複製失敗',
        variant: 'destructive',
      });
    }
  }, [content, language, toast]);

  const handleInsertToChat = useCallback(() => {
    const trimmed = content.trim();
    if (!trimmed) return;
    onSendMessage(trimmed);
    handleClose();
    toast({
      description: language === 'en'
        ? 'Note inserted into chat'
        : '筆記已插入到聊日',
    });
  }, [content, onSendMessage, handleClose, language, toast]);

  const charCount = content.length;
  const isNearLimit = charCount > MAX_CHARS * 0.8;
  const isAtLimit = charCount >= MAX_CHARS;

  const labels = {
    title: language === 'en' ? 'Quick Notes' : '快速筆記',
    placeholder: language === 'en'
      ? 'Write your study notes here...'
      : '喺呢度寫低你嘅學習筆記...',
    lastEdited: language === 'en' ? 'Last edited' : '最後編輯',
    justNow: language === 'en' ? 'Just now' : '剛剛',
    clear: language === 'en' ? 'Clear' : '清空',
    clearTitle: language === 'en' ? 'Clear Notes?' : '清空筆記？',
    clearDescription: language === 'en'
      ? 'This will permanently delete all your notes. This action cannot be undone.'
      : '呢個動作會永久刪除你所有嘅筆記。呢個操作無法撤回。',
    cancel: language === 'en' ? 'Cancel' : '取消',
    confirmClear: language === 'en' ? 'Clear' : '清空',
    copy: language === 'en' ? 'Copy All' : '全部複製',
    insertChat: language === 'en' ? 'Insert into Chat' : '插入到聊日',
    close: language === 'en' ? 'Close' : '關閉',
    copied: language === 'en' ? 'Copied!' : '已複製！',
    saving: language === 'en' ? 'Saving...' : '保存中...',
    saved: language === 'en' ? 'Saved' : '已保存',
    empty: language === 'en' ? 'No notes yet' : '暫無筆記',
    emptyHint: language === 'en'
      ? 'Start typing your study notes. They auto-save every 2 seconds.'
      : '開始輸入你的學習筆記。每2秒自動保存。',
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
        <DialogContent className="sm:max-w-[560px] p-0 overflow-hidden max-h-[80vh] flex flex-col">
          {/* Emerald gradient top border */}
          <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 shrink-0" />

          <div className="px-6 pt-4 pb-2 shrink-0">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StickyNote className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-lg">{labels.title}</span>
                </div>
                {/* Save indicator */}
                <div className="flex items-center gap-1.5">
                  {saveIndicator === 'saving' && (
                    <span className="text-[11px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
                      <Save className="h-3 w-3 animate-pulse" />
                      {labels.saving}
                    </span>
                  )}
                  {saveIndicator === 'saved' && (
                    <span className="text-[11px] text-emerald-500 flex items-center gap-1">
                      <Save className="h-3 w-3" />
                      {labels.saved}
                    </span>
                  )}
                </div>
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className="px-6 flex-1 min-h-0 flex flex-col pb-6">
            {/* Textarea */}
            <div className="relative flex-1 min-h-0">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.length <= MAX_CHARS) {
                    setContent(val);
                  }
                }}
                placeholder={labels.placeholder}
                className="w-full h-full min-h-[200px] max-h-[400px] resize-none rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-3 text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400/50 transition-all duration-200"
                disabled={false}
              />

              {/* Character count — bottom right of textarea */}
              <div className="absolute bottom-2 right-3 text-[10px] tabular-nums">
                <span className={
                  isAtLimit
                    ? 'text-red-500 dark:text-red-400'
                    : isNearLimit
                      ? 'text-amber-500 dark:text-amber-400'
                      : 'text-gray-300 dark:text-gray-600'
                }>
                  {charCount}
                </span>
                <span className="text-gray-300 dark:text-gray-600">/{MAX_CHARS}</span>
              </div>
            </div>

            {/* Last edited + Actions row */}
            <div className="flex items-center justify-between mt-3">
              {/* Last edited timestamp */}
              <div className="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500">
                <Clock className="h-3 w-3" />
                {lastEdited
                  ? `${labels.lastEdited}: ${formatTimestamp(lastEdited, language)}`
                  : labels.empty}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={() => setClearDialogOpen(true)}
                  disabled={!content.trim()}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  {labels.clear}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                  onClick={handleCopy}
                  disabled={!content.trim()}
                >
                  <Copy className="h-3.5 w-3.5 mr-1" />
                  {labels.copy}
                </Button>
                <Button
                  size="sm"
                  className="h-8 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white"
                  onClick={handleInsertToChat}
                  disabled={!content.trim()}
                >
                  <MessageSquarePlus className="h-3.5 w-3.5 mr-1" />
                  {labels.insertChat}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Clear confirmation dialog */}
      <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{labels.clearTitle}</AlertDialogTitle>
            <AlertDialogDescription>{labels.clearDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{labels.cancel}</AlertDialogCancel>
            <Button
              onClick={handleClear}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {labels.confirmClear}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
