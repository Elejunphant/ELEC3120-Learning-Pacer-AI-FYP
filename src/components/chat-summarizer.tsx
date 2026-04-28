'use client';

import React, { useState, useCallback } from 'react';
import { FileText, Copy, Check, Send, Loader2, Sparkles, MessageSquarePlus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { Message } from '@/components/chat-messages';

interface ChatSummarizerProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  language: 'en' | 'zh';
  onSendMessage: (content: string) => void;
}

export function ChatSummarizer({
  isOpen,
  onClose,
  messages,
  language,
  onSendMessage,
}: ChatSummarizerProps) {
  const { toast } = useToast();
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateSummary = useCallback(async () => {
    if (messages.length === 0) return;

    setIsLoading(true);
    setSummary('');

    const langInstruction = language === 'zh'
      ? '請用繁體中文（HK / TW 用字）回答，使用以下結構。絕對禁止輸出任何簡體字。'
      : 'Please respond in English using the following structure.';

    const systemPrompt = `You are a study assistant for a Computer Networking course (HKUST ELEC3120). Summarize this conversation. ${langInstruction}

Return ONLY a structured summary in this EXACT markdown format:

## 📌 Key Topics / 關鍵主題
- topic 1
- topic 2

## 💡 Important Concepts / 重要概念
- concept with brief explanation

## ❓ Questions Asked / 提出嘅問題
- question 1
- question 2

## 📋 Suggested Next Steps / 下一步建議
- next step 1
- next step 2`;

    // Build the conversation content
    const conversationContent = messages
      .filter((m) => !m.isStreaming)
      .map((m) => {
        const role = m.role === 'user' ? 'User' : 'Assistant';
        return `${role}: ${m.content}`;
      })
      .join('\n\n');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'user', content: `${systemPrompt}\n\n---\n\nConversation:\n\n${conversationContent}` },
          ],
          conversationId: null,
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error('Failed to generate summary');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullContent += chunk;
        setSummary(fullContent);
      }

      setSummary(fullContent);
    } catch {
      setSummary(
        language === 'en'
          ? '⚠️ Failed to generate summary. Please try again.'
          : '⚠️ 生成總結失敗，請再試。'
      );
    } finally {
      setIsLoading(false);
    }
  }, [messages, language]);

  const handleCopy = useCallback(async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      toast({
        description: language === 'en' ? 'Summary copied!' : '總結已複製！',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = summary;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [summary, language, toast]);

  const handleInsertIntoChat = useCallback(() => {
    if (!summary) return;
    const prefix = language === 'en'
      ? 'Here is a summary of our conversation:\n\n'
      : '以下係我哋對話嘅總結：\n\n';
    onSendMessage(prefix + summary);
    onClose();
  }, [summary, language, onSendMessage, onClose]);

  // Auto-generate on open if not yet generated
  const handleOpen = useCallback(() => {
    if (messages.length > 0 && !summary && !isLoading) {
      generateSummary();
    }
  }, [messages, summary, isLoading, generateSummary]);

  const hasMessages = messages.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (open && !isOpen) handleOpen();
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-[560px] max-h-[85vh] flex flex-col p-0 gap-0 bg-white dark:bg-[#1e1e1e]">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 pt-6 pb-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
            <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <DialogTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {language === 'en' ? 'Conversation Summary' : '對話總結'}
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {language === 'en'
                ? `${messages.length} messages analyzed`
                : `已分析 ${messages.length} 條訊息`}
            </DialogDescription>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 px-6 overflow-y-auto overscroll-contain custom-scrollbar">
          <div className="pb-4">
            {!hasMessages ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-14 w-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                  <MessageSquarePlus className="h-7 w-7 text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                  {language === 'en'
                    ? 'No messages to summarize'
                    : '冇訊息可以總結'}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 max-w-[240px]">
                  {language === 'en'
                    ? 'Start a conversation first, then come back here to get a summary.'
                    : '先開始對話，然後返嚟攞總結。'}
                </p>
              </div>
            ) : isLoading && !summary ? (
              /* Loading state */
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="relative h-14 w-14 mb-4">
                  <div className="absolute inset-0 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                    <Sparkles className="h-7 w-7 text-emerald-500 dark:text-emerald-400" />
                  </div>
                  <div className="absolute inset-0 rounded-2xl border-2 border-emerald-400/40 dark:border-emerald-500/30 animate-ping" />
                </div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                  {language === 'en'
                    ? 'Analyzing conversation...'
                    : '分析對話中…'}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {language === 'en'
                    ? 'This may take a moment'
                    : '請稍等片刻'}
                </p>
                <Loader2 className="h-5 w-5 text-emerald-500 dark:text-emerald-400 animate-spin mt-3" />
              </div>
            ) : summary ? (
              /* Summary content */
              <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-h2:text-base prose-h2:mt-4 prose-h2:mb-2 prose-p:text-gray-600 dark:prose-p:text-gray-400 prose-li:text-gray-600 dark:prose-li:text-gray-400 prose-strong:text-gray-800 dark:prose-strong:text-gray-200">
                {summary.split('\n').map((line, i) => {
                  if (line.startsWith('## ')) {
                    return (
                      <h2 key={i} className="text-base font-semibold text-gray-900 dark:text-gray-100 mt-4 mb-2 first:mt-0">
                        {line.replace('## ', '')}
                      </h2>
                    );
                  }
                  if (line.startsWith('- ')) {
                    return (
                      <div key={i} className="flex items-start gap-2 ml-1 py-0.5">
                        <span className="shrink-0 mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400 dark:bg-emerald-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                          {line.replace('- ', '').replace(/\*\*(.*?)\*\*/g, '$1')}
                        </span>
                      </div>
                    );
                  }
                  if (line.startsWith('---')) {
                    return <hr key={i} className="my-3 border-gray-200 dark:border-gray-700" />;
                  }
                  if (line.trim() === '') {
                    return <div key={i} className="h-2" />;
                  }
                  return (
                    <p key={i} className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {line.replace(/\*\*(.*?)\*\*/g, '$1')}
                    </p>
                  );
                })}
              </div>
            ) : (
              /* Initial state — ready to generate */
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-14 w-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-3">
                  <Sparkles className="h-7 w-7 text-emerald-500 dark:text-emerald-400" />
                </div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                  {language === 'en'
                    ? 'Ready to summarize'
                    : '準備生成總結'}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 max-w-[240px] mb-4">
                  {language === 'en'
                    ? 'Click the button below to generate an AI summary of this conversation.'
                    : '㩒下面嘅按鈕，用 AI 生成呢次對話嘅總結。'}
                </p>
                <Button
                  onClick={generateSummary}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  {language === 'en' ? 'Generate Summary' : '生成總結'}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        {hasMessages && summary && !isLoading && (
          <div className="flex items-center gap-2 px-6 pb-5 pt-3 border-t border-gray-100 dark:border-gray-800">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="flex-1 h-9 text-xs gap-1.5 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  {language === 'en' ? 'Copied!' : '已複製！'}
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  {language === 'en' ? 'Copy Summary' : '複製總結'}
                </>
              )}
            </Button>
            <Button
              size="sm"
              onClick={handleInsertIntoChat}
              className="flex-1 h-9 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Send className="h-3.5 w-3.5" />
              {language === 'en' ? 'Insert into Chat' : '插入對話'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
