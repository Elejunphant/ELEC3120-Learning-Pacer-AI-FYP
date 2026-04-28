'use client';

import React, { useState, useCallback } from 'react';
import { Copy, Check, RefreshCw, ThumbsUp, ThumbsDown, Bookmark, BookmarkCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EmojiReactionButton, type ReactionsMap } from '@/components/emoji-reactions';

interface MessageActionsProps {
  content: string;
  messageId: string;
  onRegenerate?: (messageId: string) => void;
  isPinned?: boolean;
  onTogglePin?: (messageId: string) => void;
  language?: 'en' | 'zh';
  reactions?: ReactionsMap;
  onToggleReaction?: (messageId: string, emoji: string) => void;
}

export function MessageActions({
  content,
  messageId,
  onRegenerate,
  isPinned = false,
  onTogglePin,
  language = 'en',
  reactions = {},
  onToggleReaction,
}: MessageActionsProps) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const { toast } = useToast();

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast({
        title: language === 'en' ? 'Copied to clipboard' : '已複製到剪貼簿',
        description: undefined,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = content;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
      } catch (err) {
        console.error('Failed to copy:', err);
      }
      document.body.removeChild(textArea);
      setCopied(true);
      toast({
        title: language === 'en' ? 'Copied to clipboard' : '已複製到剪貼簿',
        description: undefined,
      });
      setTimeout(() => setCopied(false), 2000);
    }
  }, [content, language, toast]);

  const handleFeedback = useCallback((type: 'up' | 'down') => {
    const isRemoving = feedback === type;
    setFeedback((prev) => (prev === type ? null : type));

    if (isRemoving) {
      toast({
        title: language === 'en' ? 'Feedback removed' : '反饋已移除',
        description: undefined,
      });
    } else if (type === 'up') {
      toast({
        title: language === 'en' ? 'Marked as helpful' : '標記為有用',
        description: undefined,
      });
    } else {
      toast({
        title: language === 'en' ? 'Feedback recorded' : '反饋已紀錄',
        description: undefined,
      });
    }
  }, [feedback, language, toast]);

  const handleTogglePin = useCallback(() => {
    if (onTogglePin) {
      onTogglePin(messageId);
    }
  }, [messageId, onTogglePin]);

  return (
    <div className="flex items-center gap-0.5">
      {/* Emoji reaction button */}
      {onToggleReaction && (
        <EmojiReactionButton
          messageId={messageId}
          reactions={reactions}
          onToggleReaction={onToggleReaction}
          language={language}
        />
      )}

      {/* Copy button */}
      <button
        onClick={handleCopy}
        className="flex items-center justify-center h-7 w-7 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-white/10 transition-all duration-150"
        aria-label={copied ? 'Copied' : 'Copy message'}
        title={copied ? 'Copied!' : 'Copy'}
      >
        {copied ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </button>

      {/* Regenerate button */}
      {onRegenerate && (
        <button
          onClick={() => onRegenerate(messageId)}
          className="flex items-center justify-center h-7 w-7 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-white/10 transition-all duration-150"
          aria-label="Regenerate response"
          title="Regenerate"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      )}

      {/* Divider */}
      <div className="h-4 w-px bg-gray-200 dark:bg-white/10 mx-1" />

      {/* Like button */}
      <button
        onClick={() => handleFeedback('up')}
        className={`flex items-center justify-center h-7 w-7 rounded-md transition-all duration-150 ${
          feedback === 'up'
            ? 'text-black bg-gray-200 dark:text-white dark:bg-white/15'
            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-white/10'
        }`}
        aria-label={feedback === 'up' ? 'Liked' : 'Like'}
        title="Helpful"
      >
        <ThumbsUp className="h-3.5 w-3.5" />
      </button>

      {/* Dislike button */}
      <button
        onClick={() => handleFeedback('down')}
        className={`flex items-center justify-center h-7 w-7 rounded-md transition-all duration-150 ${
          feedback === 'down'
            ? 'text-black bg-gray-200 dark:text-white dark:bg-white/15'
            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-white/10'
        }`}
        aria-label={feedback === 'down' ? 'Disliked' : 'Dislike'}
        title="Not helpful"
      >
        <ThumbsDown className="h-3.5 w-3.5" />
      </button>

      {/* Divider before bookmark */}
      {onTogglePin && (
        <>
          <div className="h-4 w-px bg-gray-200 dark:bg-white/10 mx-1" />
          <button
            onClick={handleTogglePin}
            className={`flex items-center justify-center h-7 w-7 rounded-md transition-all duration-150 ${
              isPinned
                ? 'text-black bg-gray-200 dark:text-white dark:bg-white/15'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-white/10'
            }`}
            aria-label={isPinned
              ? (language === 'en' ? 'Unpin message' : '取消固定')
              : (language === 'en' ? 'Pin message' : '固定訊息')
            }
            title={isPinned
              ? (language === 'en' ? 'Unpin message' : '取消固定')
              : (language === 'en' ? 'Pin message' : '固定訊息')
            }
          >
            {isPinned ? (
              <BookmarkCheck className="h-3.5 w-3.5" />
            ) : (
              <Bookmark className="h-3.5 w-3.5" />
            )}
          </button>
        </>
      )}
    </div>
  );
}
