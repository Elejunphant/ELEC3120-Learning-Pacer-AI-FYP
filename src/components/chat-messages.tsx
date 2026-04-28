'use client';

import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import { Bot, User, ImageIcon, FileText, Copy, Check, ArrowRight, MessageSquare, ChevronDown, ClipboardList, Clock, Type, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import { MessageActions } from '@/components/message-actions';
import { TTSButton } from '@/components/tts-button';
import { ReactionDisplay, type ReactionsMap } from '@/components/emoji-reactions';
import { CitationsList, CitationDetail, parseCitationsFromText, type CitationData } from '@/components/citation-card';

export type ChatMode = 'tutor' | 'code' | 'image';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  hasImage?: boolean;
  hasPdf?: boolean;
  imageData?: string;
  isStreaming?: boolean;
  createdAt?: string;
  citations?: CitationData[];
  mode?: ChatMode;
}

interface ChatMessagesProps {
  messages: Message[];
  isStreaming: boolean;
  streamingTextRef: React.RefObject<string>;
  isLoading: boolean;
  isWaiting: boolean;
  language: 'en' | 'zh';
  onRegenerate?: (messageId: string) => void;
  onQuickReply?: (message: string) => void;
  pinnedIds?: Set<string>;
  onTogglePin?: (id: string) => void;
  highlightMessageId?: string;
  reactions?: ReactionsMap;
  onToggleReaction?: (messageId: string, emoji: string) => void;
}

// --- Code Block Component ---
const CodeBlock = memo(function CodeBlock({
  language: lang,
  children,
}: {
  language?: string;
  children: string;
}) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = children;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [children]);

  return (
    <div className="relative my-4 rounded-lg overflow-hidden bg-[#1f2024] dark:bg-[#1a1b1e] border border-[#2d2e33] dark:border-[#2a2b2f] animate-code-block-in">
      <div className="flex items-center justify-between px-4 py-2 bg-[#2a2b30] dark:bg-[#222327] border-b border-[#3a3b40] dark:border-[#2e2f33]">
        <span className="text-[12px] font-mono text-[#a8acb3] dark:text-[#9ea2a9] lowercase tracking-wide">
          {lang || 'plaintext'}
        </span>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 text-[12px] text-[#a8acb3] dark:text-[#9ea2a9] hover:text-white transition-colors duration-150 ${copied ? 'text-emerald-400' : ''}`}
          aria-label={copied ? 'Copied' : 'Copy code'}
        >
          {copied ? (
            <><Check className="h-3.5 w-3.5" /><span>Copied</span></>
          ) : (
            <><Copy className="h-3.5 w-3.5" /><span>Copy</span></>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-[13.5px] leading-[1.6] custom-scrollbar" style={{ scrollbarWidth: 'thin' }}>
        <code className="text-[#e6e8eb] font-mono">{children}</code>
      </pre>
    </div>
  );
});

// --- Relative Timestamp ---
function getRelativeTimeString(dateStr: string, language: 'en' | 'zh' = 'en'): string {
  const diff = Math.max(0, Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000));
  if (diff < 5) return language === 'zh' ? '剛剛' : 'Just now';
  if (diff < 60) return language === 'zh' ? `${diff}秒前` : `${diff}s ago`;
  if (diff < 3600) return language === 'zh' ? `${Math.floor(diff / 60)}分鐘前` : `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return language === 'zh' ? `${Math.floor(diff / 3600)}小時前` : `${Math.floor(diff / 3600)}h ago`;
  const d = new Date(dateStr);
  return language === 'zh' ? `${d.getMonth() + 1}月${d.getDate()}日` : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const RelativeTime = memo(function RelativeTime({ dateStr, language }: { dateStr?: string; language?: 'en' | 'zh' }) {
  const [text, setText] = useState(() => (dateStr ? getRelativeTimeString(dateStr, language) : ''));
  useEffect(() => {
    if (!dateStr) return;
    const interval = setInterval(() => setText(getRelativeTimeString(dateStr, language)), 10000);
    return () => clearInterval(interval);
  }, [dateStr, language]);
  if (!text) return null;
  return <span className="text-[10px] text-[#aaa] mt-1.5 select-none block tracking-wider font-light">{text}</span>;
});

// --- Markdown Components (Poe-inspired typography — generous spacing, clean hierarchy) ---
const markdownComponents = {
  code({ className, children, ...props }: React.ComponentPropsWithoutRef<'code'>) {
    const match = /language-(\w+)/.exec(className || '');
    const codeString = String(children).replace(/\n$/, '');
    if (match || codeString.includes('\n')) return <CodeBlock language={match ? match[1] : undefined}>{codeString}</CodeBlock>;
    return <code className="text-[0.9em] font-mono bg-gray-100 dark:bg-gray-800 px-[0.4em] py-[0.15em] rounded-md text-gray-800 dark:text-gray-200" {...props}>{children}</code>;
  },
  table({ children, ...props }: React.ComponentPropsWithoutRef<'table'>) {
    return <div className="my-5 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700"><table className="w-full text-[14px] border-collapse" {...props}>{children}</table></div>;
  },
  thead({ children, ...props }: React.ComponentPropsWithoutRef<'thead'>) {
    return <thead className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700" {...props}>{children}</thead>;
  },
  th({ children, ...props }: React.ComponentPropsWithoutRef<'th'>) {
    return <th className="px-3.5 py-2.5 text-left font-semibold text-gray-700 dark:text-gray-200" {...props}>{children}</th>;
  },
  td({ children, ...props }: React.ComponentPropsWithoutRef<'td'>) {
    return <td className="px-3.5 py-2.5 text-gray-700 dark:text-gray-200 border-b border-gray-100 dark:border-gray-800 last:border-b-0" {...props}>{children}</td>;
  },
  tr({ children, ...props }: React.ComponentPropsWithoutRef<'tr'>) {
    return <tr {...props}>{children}</tr>;
  },
  a({ children, ...props }: React.ComponentPropsWithoutRef<'a'>) {
    return <a className="text-emerald-700 dark:text-emerald-400 underline underline-offset-[3px] decoration-emerald-700/30 dark:decoration-emerald-400/30 hover:decoration-emerald-700 dark:hover:decoration-emerald-400 transition-colors" target="_blank" rel="noopener noreferrer" {...props}>{children}</a>;
  },
  h1({ children, ...props }: React.ComponentPropsWithoutRef<'h1'>) {
    return <h1 className="text-[1.5em] font-semibold text-gray-900 dark:text-gray-50 mt-7 mb-3 leading-tight tracking-tight first:mt-0" {...props}>{children}</h1>;
  },
  h2({ children, ...props }: React.ComponentPropsWithoutRef<'h2'>) {
    return <h2 className="text-[1.25em] font-semibold text-gray-900 dark:text-gray-50 mt-6 mb-3 leading-tight tracking-tight first:mt-0" {...props}>{children}</h2>;
  },
  h3({ children, ...props }: React.ComponentPropsWithoutRef<'h3'>) {
    return <h3 className="text-[1.1em] font-semibold text-gray-900 dark:text-gray-50 mt-5 mb-2 leading-snug first:mt-0" {...props}>{children}</h3>;
  },
  h4({ children, ...props }: React.ComponentPropsWithoutRef<'h4'>) {
    return <h4 className="text-[1em] font-semibold text-gray-900 dark:text-gray-50 mt-4 mb-2 first:mt-0" {...props}>{children}</h4>;
  },
  ul({ children, ...props }: React.ComponentPropsWithoutRef<'ul'>) {
    return <ul className="list-disc pl-6 my-4 space-y-1.5 marker:text-gray-400 dark:marker:text-gray-500" {...props}>{children}</ul>;
  },
  ol({ children, ...props }: React.ComponentPropsWithoutRef<'ol'>) {
    return <ol className="list-decimal pl-6 my-4 space-y-1.5 marker:text-gray-400 dark:marker:text-gray-500" {...props}>{children}</ol>;
  },
  li({ children, ...props }: React.ComponentPropsWithoutRef<'li'>) {
    return <li className="leading-[1.75] text-gray-800 dark:text-gray-200 [&>p]:my-0 [&>ul]:my-2 [&>ol]:my-2" {...props}>{children}</li>;
  },
  p({ children, ...props }: React.ComponentPropsWithoutRef<'p'>) {
    return <p className="text-gray-800 dark:text-gray-200 leading-[1.75] my-4 first:mt-0 last:mb-0" {...props}>{children}</p>;
  },
  strong({ children, ...props }: React.ComponentPropsWithoutRef<'strong'>) {
    return <strong className="font-semibold text-gray-900 dark:text-gray-50" {...props}>{children}</strong>;
  },
  em({ children, ...props }: React.ComponentPropsWithoutRef<'em'>) {
    return <em className="italic text-gray-800 dark:text-gray-200" {...props}>{children}</em>;
  },
  blockquote({ children, ...props }: React.ComponentPropsWithoutRef<'blockquote'>) {
    return <blockquote className="border-l-[3px] border-gray-300 dark:border-gray-600 pl-4 my-4 text-gray-600 dark:text-gray-400 italic" {...props}>{children}</blockquote>;
  },
  img({ src, alt, ...props }: React.ComponentPropsWithoutRef<'img'>) {
    if (!src) return null;
    return (
      <a href={typeof src === 'string' ? src : undefined} target="_blank" rel="noopener noreferrer" className="block my-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={typeof src === 'string' ? src : undefined}
          alt={alt || ''}
          loading="lazy"
          className="rounded-xl border border-gray-200 dark:border-gray-700 max-w-full h-auto shadow-sm hover:shadow-md transition-shadow"
          {...props}
        />
      </a>
    );
  },
  hr({ ...props }: React.ComponentPropsWithoutRef<'hr'>) {
    return <hr className="my-6 border-gray-200 dark:border-gray-700" {...props} />;
  },
};

// --- Quick Reply Chips ---
const quickReplySuggestions: Record<string, { en: string; zh: string }[]> = {
  tcp: [{ en: 'Explain TCP flow control', zh: '解釋TCP流量控制' }, { en: 'How does TCP handle packet loss?', zh: 'TCP如何處理丟包？' }, { en: 'Compare TCP and UDP', zh: '比較TCP和UDP' }],
  udp: [{ en: 'When should I use UDP over TCP?', zh: '什麼時候應該用UDP而不是TCP？' }, { en: 'Explain UDP header format', zh: '解釋UDP頭部格式' }, { en: 'What apps use UDP?', zh: '邊啲應用使用UDP？' }],
  http: [{ en: 'Compare HTTP/1.1 and HTTP/2', zh: '比較HTTP/1.1和HTTP/2' }, { en: 'How does HTTP caching work?', zh: 'HTTP緩存是如何工作的？' }, { en: 'Explain HTTP/3 and QUIC', zh: '解釋HTTP/3和QUIC' }],
  congestion: [{ en: 'Explain slow start algorithm', zh: '解釋慢啓動算法' }, { en: 'What is AIMD?', zh: '什麼是AIMD？' }, { en: 'Compare Reno and Tahoe', zh: '比較Reno和Tahoe' }],
  osi: [{ en: 'Explain the TCP/IP model', zh: '解釋TCP/IP模型' }, { en: 'What happens at each layer?', zh: '每一層發生了什麼？' }, { en: 'What is encapsulation?', zh: '什麼是封裝？' }],
  default: [{ en: 'Give me a practice question', zh: '畀我一條練習題' }, { en: 'Explain with a real-world example', zh: '用一個實際例子解釋' }, { en: 'What are common exam questions on this?', zh: '關於呢個嘅常見考試題有邊啲？' }],
};

function getSuggestions(content: string): { en: string; zh: string }[] {
  const lower = content.toLowerCase();
  if (lower.includes('tcp') && !lower.includes('udp')) return quickReplySuggestions.tcp;
  if (lower.includes('udp')) return quickReplySuggestions.udp;
  if (lower.includes('http') || lower.includes('web')) return quickReplySuggestions.http;
  if (lower.includes('congestion') || lower.includes('cwnd')) return quickReplySuggestions.congestion;
  if (lower.includes('osi') || lower.includes('layer')) return quickReplySuggestions.osi;
  return quickReplySuggestions.default;
}

const QuickReplyChips = memo(function QuickReplyChips({ message, language, onQuickReply }: { message: string; language: 'en' | 'zh'; onQuickReply: (msg: string) => void }) {
  const suggestions = getSuggestions(message);
  return (
    <div className="flex flex-wrap gap-1.5 mt-3">
      {suggestions.map((s, i) => (
        <button key={i} onClick={() => onQuickReply(language === 'en' ? s.en : s.zh)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#e1e4e8] dark:border-[#333] bg-[#f6f8fa] dark:bg-[#2a2a2a] text-[13px] text-[#555] dark:text-[#aaa] hover:bg-[#f0f0f0] dark:hover:bg-[#333] hover:border-[#ccc] dark:hover:border-[#555] transition-all duration-200">
          <span>{language === 'en' ? s.en : s.zh}</span>
          <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all duration-200 text-[#888]" />
        </button>
      ))}
    </div>
  );
});

// --- Parse AI Follow-up Suggestions ---
const SUGGESTIONS_LINE_REGEX = /LP_SUGGESTIONS:\s*\[([\s\S]*?)\]\s*$/;

function parseFollowUpSuggestions(text: string): string[] {
  const match = text.match(SUGGESTIONS_LINE_REGEX);
  if (!match) return [];
  try {
    const parsed = JSON.parse(`[${match[1]}]`);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.filter((s: unknown) => typeof s === 'string' && s.trim().length > 0).slice(0, 3);
    }
  } catch {
    // Try simple parsing without JSON
    const items = match[1].match(/"([^"]+)"/g);
    if (items) {
      return items.map((s) => s.slice(1, -1)).filter(Boolean).slice(0, 3);
    }
  }
  return [];
}

function stripSuggestionsFromText(text: string): string {
  return text.replace(SUGGESTIONS_LINE_REGEX, '').trimEnd();
}

// --- Parse "thinking" (reasoning) blocks emitted by the streaming layer.
// The backend wraps reasoning tokens in [[LP_THINK]]…[[/LP_THINK]]. During
// streaming the closing tag may not have arrived yet — treat the dangling
// block as still-thinking content.
const THINK_OPEN_TAG = '[[LP_THINK]]';
const THINK_CLOSE_TAG = '[[/LP_THINK]]';

function parseThinkingBlocks(text: string): { thinking: string; answer: string; thinkingOpen: boolean } {
  if (!text || !text.includes(THINK_OPEN_TAG)) {
    return { thinking: '', answer: text || '', thinkingOpen: false };
  }
  const thinkingParts: string[] = [];
  const answerParts: string[] = [];
  let i = 0;
  let thinkingOpen = false;
  while (i < text.length) {
    const open = text.indexOf(THINK_OPEN_TAG, i);
    if (open === -1) {
      answerParts.push(text.slice(i));
      break;
    }
    answerParts.push(text.slice(i, open));
    const afterOpen = open + THINK_OPEN_TAG.length;
    const close = text.indexOf(THINK_CLOSE_TAG, afterOpen);
    if (close === -1) {
      thinkingParts.push(text.slice(afterOpen));
      thinkingOpen = true;
      break;
    }
    thinkingParts.push(text.slice(afterOpen, close));
    i = close + THINK_CLOSE_TAG.length;
  }
  return {
    thinking: thinkingParts.join('').trim(),
    answer: answerParts.join('').trim(),
    thinkingOpen,
  };
}

const ThinkingBlock = memo(function ThinkingBlock({
  thinking,
  isActive,
  language,
  defaultOpen = false,
}: {
  thinking: string;
  isActive: boolean;
  language: 'en' | 'zh';
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen || isActive);
  // Auto-expand while actively thinking; let the user collapse afterwards.
  useEffect(() => {
    if (isActive) setOpen(true);
  }, [isActive]);
  if (!thinking) return null;
  return (
    <div className="mb-3 rounded-xl border border-emerald-200/60 dark:border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-500/[0.04]">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 text-[12px] font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50/80 dark:hover:bg-emerald-500/[0.08] rounded-xl transition-colors"
      >
        <span className="flex items-center gap-2">
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
          {isActive
            ? language === 'en' ? 'Thinking…' : '思考緊⋯⋯'
            : language === 'en' ? 'Thought process' : '思考過程'}
          {!isActive && (
            <span className="text-[10px] text-emerald-600/70 dark:text-emerald-400/60 font-normal">
              ({thinking.length} {language === 'en' ? 'chars' : '字'})
            </span>
          )}
        </span>
        <span className="text-[10px] opacity-60">{open ? (language === 'en' ? 'Hide' : '收起') : (language === 'en' ? 'Show' : '展開')}</span>
      </button>
      {open && (
        <div className="px-3 pb-3 pt-1 text-[13px] leading-[1.65] text-emerald-900/80 dark:text-emerald-100/70 whitespace-pre-wrap break-words font-mono">
          {thinking}
        </div>
      )}
    </div>
  );
});

const FollowUpSuggestions = memo(function FollowUpSuggestions({ message, language, onQuickReply }: { message: string; language: 'en' | 'zh'; onQuickReply: (msg: string) => void }) {
  const suggestions = parseFollowUpSuggestions(message);
  if (suggestions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mt-3">
      {suggestions.map((s, i) => (
        <button key={`ai-sug-${i}`} onClick={() => onQuickReply(s)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/80 dark:bg-emerald-500/10 text-[13px] text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 hover:border-emerald-300 dark:hover:border-emerald-700/60 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
          <Sparkles className="h-3 w-3 text-emerald-500 dark:text-emerald-400 shrink-0" />
          <span>{s}</span>
          <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all duration-200 text-emerald-400" />
        </button>
      ))}
    </div>
  );
});

function TimeSeparator({ dateStr, language }: { dateStr: string; language: 'en' | 'zh' }) {
  const timeStr = new Date(dateStr).toLocaleTimeString(language === 'en' ? 'en-US' : 'zh-CN', { hour: 'numeric', minute: '2-digit', hour12: language === 'en' });
  const dateStrShort = new Date(dateStr).toLocaleDateString(language === 'en' ? 'en-US' : 'zh-CN', { month: 'short', day: 'numeric' });
  return (
    <div className="flex items-center gap-3 py-2 animate-fade-in-up">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#e1e4e8] to-transparent dark:via-[#333]" />
      <span className="text-[10px] text-[#aaa] dark:text-[#666] whitespace-nowrap select-none tracking-wider font-medium">
        {dateStrShort} · {timeStr}
      </span>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#e1e4e8] to-transparent dark:via-[#333]" />
    </div>
  );
}

function EmptyChatState({ language }: { language: 'en' | 'zh' }) {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-8">
      <div className="flex flex-col items-center gap-4">
        <div className="h-16 w-16 rounded-2xl bg-[#f0f0f0] dark:bg-[#2a2a2a] flex items-center justify-center">
          <MessageSquare className="h-8 w-8 text-[#888]" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-medium text-[#333] dark:text-[#e0e0e0]">{language === 'en' ? 'Start a conversation' : '開始對話'}</p>
          <p className="text-xs text-[#888]">{language === 'en' ? 'Ask me anything about computer networking' : '問我任何關於電腦網絡嘅問題'}</p>
        </div>
        <div className="flex items-center gap-2 mt-1">
          {['Chat', 'Quiz', 'Knowledge'].map(label => (
            <span key={label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#e1e4e8] dark:border-[#333] bg-white dark:bg-[#2a2a2a] text-[12px] text-[#888]">{label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Streaming bubble with DIRECT DOM manipulation ---
// The text node is updated via ref — zero React re-renders during streaming.
// React only renders once when isStreaming goes true (show bubble) and once when false (hide bubble).
const StreamingBubble = memo(function StreamingBubble({ streamingTextRef, language }: { streamingTextRef: React.RefObject<string>; language: 'en' | 'zh' }) {
  const textNodeRef = useRef<HTMLSpanElement>(null);
  const thinkLabelRef = useRef<HTMLSpanElement>(null);
  const thinkBodyRef = useRef<HTMLDivElement>(null);
  const thinkContainerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const containerRef = useRef<HTMLElement | null>(null);
  const [thinkCollapsed, setThinkCollapsed] = useState(false);
  // Mirror collapsed state into a ref so the rAF tick (whose closure is
  // captured once) always reads the LATEST value — otherwise toggling
  // during streaming has no effect until the bubble re-renders.
  const thinkCollapsedRef = useRef(false);
  useEffect(() => { thinkCollapsedRef.current = thinkCollapsed; }, [thinkCollapsed]);

  // Set up a polling loop that reads the ref and writes directly to DOM.
  // This runs outside React's render cycle — zero re-renders.
  useEffect(() => {
    const textEl = textNodeRef.current;
    const container = containerRef.current;
    if (!textEl || !container) return;

    // Find scroll container (parent with overflow)
    const scrollParent = container.closest('.overflow-y-auto') as HTMLElement | null;

    let isAtBottom = true;

    const tick = () => {
      // Always read latest streaming text (may be empty while waiting for
      // first byte). Showing the thinking panel pre-emptively gives the
      // user immediate feedback that reasoning is happening.
      const raw = streamingTextRef.current ?? '';
      // Strip citation JSON payload and LP_SUGGESTIONS from streaming text for display
      const CITATION_START = '<!-- LP_CITATIONS_JSON_START -->';
      let displayText = raw.includes(CITATION_START)
        ? raw.split(CITATION_START)[0]
        : raw;
      const sugIdx = displayText.lastIndexOf('LP_SUGGESTIONS:');
      if (sugIdx !== -1) {
        displayText = displayText.slice(0, sugIdx).trimEnd();
      }

      const { thinking, answer, thinkingOpen } = parseThinkingBlocks(displayText);
      // Only show the green reasoning panel when ACTUAL thinking content
      // arrives. Non-reasoning models (e.g. vision/instruct variants) won't
      // emit reasoning tokens, so we shouldn't display a misleading
      // "step-by-step" placeholder forever.
      const showThinking = !!thinking;
      if (showThinking) {
        if (thinkContainerRef.current) thinkContainerRef.current.style.display = 'block';
        if (thinkBodyRef.current) {
          const collapsed = thinkCollapsedRef.current;
          thinkBodyRef.current.style.display = collapsed ? 'none' : 'block';
          if (!collapsed && thinkBodyRef.current.textContent !== thinking) {
            thinkBodyRef.current.textContent = thinking;
          }
        }
        if (thinkLabelRef.current) {
          const label = (thinking && !thinkingOpen)
            ? (language === 'en' ? 'Thought process' : '思考過程')
            : (language === 'en' ? 'Thinking…' : '思考緊⋯⋯');
          if (thinkLabelRef.current.textContent !== label) {
            thinkLabelRef.current.textContent = label;
          }
        }
      } else if (thinkContainerRef.current) {
        thinkContainerRef.current.style.display = 'none';
      }
      textEl.textContent = answer;
      if (scrollParent && isAtBottom) {
        scrollParent.scrollTop = scrollParent.scrollHeight;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    // Track if user scrolls up
    const onScroll = () => {
      if (scrollParent) {
        const dist = scrollParent.scrollHeight - scrollParent.scrollTop - scrollParent.clientHeight;
        isAtBottom = dist < 50;
      }
    };
    scrollParent?.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(rafRef.current);
      scrollParent?.removeEventListener('scroll', onScroll);
    };
  }, [streamingTextRef]);

  return (
    <div className="group msg-entering flex flex-col" ref={containerRef as React.RefObject<HTMLDivElement>}>
      {/* Tiny label only — no avatar circle (matches AI message style) */}
      <div className="flex items-center gap-2 mb-2">
        <div className="h-5 w-5 rounded-full flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
          <Bot className="h-3 w-3" />
        </div>
        <span className="text-[12px] font-medium text-gray-500 dark:text-gray-400">LearningPacer</span>
      </div>
      <div
        ref={thinkContainerRef}
        style={{ display: 'none' }}
        className="mb-3 rounded-xl border border-emerald-200/60 dark:border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-500/[0.04]"
      >
        <button
          type="button"
          onClick={() => setThinkCollapsed((v) => !v)}
          className="w-full flex items-center justify-between gap-2 px-3 py-2 text-[12px] font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100/40 dark:hover:bg-emerald-500/[0.08] rounded-t-xl transition-colors"
          aria-expanded={!thinkCollapsed}
          aria-label={language === 'en' ? 'Toggle thinking process' : '切換思考過程'}
        >
          <span className="flex items-center gap-2">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
            <span ref={thinkLabelRef}>{language === 'en' ? 'Thinking…' : '思考緊⋯⋯'}</span>
          </span>
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform duration-200 ${thinkCollapsed ? '-rotate-90' : ''}`}
          />
        </button>
        <div
          ref={thinkBodyRef}
          className="px-3 pb-3 pt-1 text-[13px] leading-[1.65] text-emerald-900/80 dark:text-emerald-100/70 whitespace-pre-wrap break-words font-mono max-h-[260px] overflow-y-auto"
        />
      </div>
      <div className="text-[16px] leading-[1.75] text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">
        <span ref={textNodeRef} />
        <span className="inline-block w-[2px] h-[18px] bg-emerald-500 dark:bg-emerald-400 ml-0.5 align-text-bottom rounded-sm animate-[blink_1s_step-end_infinite]" />
      </div>
    </div>
  );
});

// --- Word Count & Reading Time Badge ---
function getWordCount(text: string): number {
  // Strip markdown syntax for a more accurate word count
  const stripped = text
    .replace(/```[\s\S]*?```/g, '') // code blocks
    .replace(/`[^`]*`/g, '')        // inline code
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links
    .replace(/[#*_~|>-]/g, '')       // markdown symbols
    .trim();
  // Handle both English (space-separated) and Chinese (character-based)
  const englishWords = stripped.match(/[a-zA-Z0-9]+/g)?.length || 0;
  const chineseChars = stripped.match(/[\u4e00-\u9fff]/g)?.length || 0;
  return englishWords + chineseChars;
}

function getReadingTime(wordCount: number, language: 'en' | 'zh'): number {
  // Average reading speed: ~200 WPM for English, ~300 chars/min for Chinese
  return Math.max(1, Math.ceil(wordCount / (language === 'zh' ? 300 : 200)));
}

const WordCountBadge = memo(function WordCountBadge({ text, language }: { text: string; language: 'en' | 'zh' }) {
  const words = getWordCount(text);
  if (words < 15) return null; // Don't show for very short messages

  const readTime = getReadingTime(words, language);

  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-gray-100/80 dark:bg-gray-800/50 text-[10px] text-gray-400 dark:text-gray-500 select-none ml-1">
      <Type className="h-2.5 w-2.5" />
      <span>{words}</span>
      <span className="text-gray-300 dark:text-gray-600">·</span>
      <Clock className="h-2.5 w-2.5" />
      <span>
        {language === 'en'
          ? `${readTime} min read`
          : `${readTime} 分鐘閲讀`}
      </span>
    </span>
  );
});

// --- Single message row — memoized so old messages skip re-render ---
interface MessageRowProps {
  msg: Message;
  language: 'en' | 'zh';
  isLast: boolean;
  isHighlighted: boolean;
  isPinned: boolean;
  isLoading: boolean;
  reactions: ReactionsMap;
  onRegenerate?: (messageId: string) => void;
  onQuickReply?: (message: string) => void;
  onTogglePin?: (id: string) => void;
  onToggleReaction?: (messageId: string, emoji: string) => void;
}

const MessageRow = memo(function MessageRow({
  msg, language, isLast, isHighlighted, isPinned, isLoading, reactions,
  onRegenerate, onQuickReply, onTogglePin, onToggleReaction,
}: MessageRowProps) {
  const isUser = msg.role === 'user';
  const [selectedCitation, setSelectedCitation] = useState<CitationData | null>(null);

  // Parse citations from message content for assistant messages
  const { cleanText, citations } = !isUser && msg.content
    ? parseCitationsFromText(msg.content)
    : { cleanText: msg.content, citations: [] };

  // Strip suggestions from displayed text and parse them separately
  const afterSugStrip = stripSuggestionsFromText(cleanText);
  // Split out [[LP_THINK]]…[[/LP_THINK]] reasoning block so it can render
  // in its own collapsible card above the answer.
  const { thinking: msgThinking, answer: msgAnswer } = !isUser
    ? parseThinkingBlocks(afterSugStrip)
    : { thinking: '', answer: afterSugStrip };
  const displayText = msgAnswer;
  const followUpSuggestions = !isUser && msg.content ? parseFollowUpSuggestions(msg.content) : [];

  // Merge parsed citations with message-level citations
  const allCitations = [...citations, ...(msg.citations || [])];

  return (
    <div
      id={`msg-${msg.id}`}
      className={`group msg-entering ${isHighlighted ? 'ring-2 ring-emerald-400/60 dark:ring-emerald-500/40 rounded-2xl' : ''}`}
    >
      {isUser ? (
        /* ── USER MESSAGE — soft gray bubble, right-aligned (Poe style) ── */
        <div className="flex justify-end">
          <div className="max-w-[85%] flex flex-col items-end">
            <div className="rounded-2xl rounded-tr-md bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2.5 shadow-sm">
              {(msg.hasImage || msg.hasPdf) && (
                <div className="flex gap-2 mb-2 opacity-70">
                  {msg.hasImage && !msg.imageData && <span className="inline-flex items-center gap-1 text-xs"><ImageIcon className="h-3 w-3" />{language === 'en' ? 'Image' : '圖片'}</span>}
                  {msg.hasPdf && <span className="inline-flex items-center gap-1 text-xs"><FileText className="h-3 w-3" />{language === 'en' ? 'PDF' : 'PDF文檔'}</span>}
                </div>
              )}
              {msg.imageData && (
                <div className="mb-2 rounded-lg overflow-hidden max-w-[240px]">
                  <img src={msg.imageData} alt="Uploaded" className="w-full h-auto object-cover msg-image-fade" />
                </div>
              )}
              <p className="whitespace-pre-wrap break-words leading-[1.6] text-[15px]">{msg.content}</p>
            </div>
            <RelativeTime dateStr={msg.createdAt} language={language} />
          </div>
        </div>
      ) : (
        /* ── AI MESSAGE — clean text on page (no bubble, Poe style) ── */
        <div className="flex flex-col">
          {/* Tiny label only — no avatar circle */}
          <div className="flex items-center gap-2 mb-2">
            <div className="h-5 w-5 rounded-full flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <Bot className="h-3 w-3" />
            </div>
            <span className="text-[12px] font-medium text-gray-500 dark:text-gray-400">LearningPacer</span>
          </div>
          {/* Generated image (image-mode AI replies) */}
          {msg.imageData && (
            <div className="mb-3 rounded-xl overflow-hidden max-w-[480px] border border-black/5 dark:border-white/10 bg-gray-50 dark:bg-gray-900/40">
              <img
                src={msg.imageData}
                alt={msg.content || 'Generated image'}
                className="w-full h-auto object-contain msg-image-fade"
              />
            </div>
          )}
          {/* Thinking / reasoning block (collapsed by default for old messages) */}
          {msgThinking && (
            <ThinkingBlock thinking={msgThinking} isActive={false} language={language} />
          )}
          {/* Plain markdown — no background, no border, just typography */}
          <div className="text-[16px] text-gray-800 dark:text-gray-200 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
            <ReactMarkdown components={markdownComponents} urlTransform={(url) => url}>{displayText}</ReactMarkdown>
            {allCitations.length > 0 && (
              <CitationsList
                citations={allCitations}
                language={language}
                onCitationClick={(c) => setSelectedCitation(c)}
              />
            )}
          </div>
          <RelativeTime dateStr={msg.createdAt} language={language} />
        </div>
      )}
      {!isUser && displayText.length > 0 && (
        <div className="flex items-center gap-0.5 mt-3 opacity-0 group-hover:opacity-100 max-md:opacity-100 transition-opacity duration-200">
          <MessageActions content={displayText} messageId={msg.id} onRegenerate={onRegenerate} isPinned={isPinned} onTogglePin={onTogglePin} language={language} reactions={reactions} onToggleReaction={onToggleReaction} />
          <TTSButton content={displayText} language={language} />
          <div className="h-4 w-px bg-gray-200 dark:bg-white/10 mx-1" />
          <WordCountBadge text={displayText} language={language} />
        </div>
      )}
      {!isUser && onToggleReaction && (
        <ReactionDisplay messageId={msg.id} reactions={reactions} onToggleReaction={onToggleReaction} language={language} />
      )}
      {/* AI Follow-up Suggestions — only show when AI generated them */}
      {!isUser && followUpSuggestions.length > 0 && !isLoading && onQuickReply && isLast && (
        <FollowUpSuggestions message={msg.content} language={language} onQuickReply={onQuickReply} />
      )}
      {/* Default Quick Reply Chips — only when no AI suggestions */}
      {!isUser && followUpSuggestions.length === 0 && displayText.length > 0 && !isLoading && onQuickReply && isLast && (
        <QuickReplyChips message={displayText} language={language} onQuickReply={onQuickReply} />
      )}
      {/* Citation detail dialog */}
      {selectedCitation && (
        <CitationDetail
          citation={selectedCitation}
          language={language}
          onClose={() => setSelectedCitation(null)}
        />
      )}
    </div>
  );
});

// --- Main ChatMessages component ---
export function ChatMessages({ messages, isStreaming, streamingTextRef, isLoading, isWaiting, language, onRegenerate, onQuickReply, pinnedIds, onTogglePin, highlightMessageId, reactions = {}, onToggleReaction }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [copiedAll, setCopiedAll] = useState(false);
  const { toast } = useToast();
  const showCopyAll = messages.length >= 5;

  const handleCopyAll = useCallback(async () => {
    try {
      const allContent = messages.map((msg) => `**${msg.role === 'user' ? (language === 'en' ? 'You' : '你') : 'LearningPacer'}:**\n${msg.content}`).join('\n\n---\n\n');
      await navigator.clipboard.writeText(allContent);
      setCopiedAll(true);
      toast({ description: language === 'en' ? 'All messages copied!' : '已複製所有訊息！' });
      setTimeout(() => setCopiedAll(false), 2000);
    } catch { toast({ description: language === 'en' ? 'Failed to copy' : '複製失敗', variant: 'destructive' }); }
  }, [messages, language, toast]);

  // Scroll to bottom on new messages or streaming text update
  const prevCountRef = useRef(messages.length);

  // Scroll on message count change (new completed messages)
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const countChanged = messages.length !== prevCountRef.current;
    prevCountRef.current = messages.length;
    if (countChanged) {
      requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }, [messages]);

  // Lightweight scroll handler — debounce unread count calculation
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const dist = container.scrollHeight - container.scrollTop - container.clientHeight;
    setShowScrollBtn(dist > 200);
    // Only recalculate unread count when user scrolls up
    if (dist > 200) {
      setUnreadCount(1); // Show "1+" indicator instead of expensive DOM queries
    } else {
      setUnreadCount(0);
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    const c = scrollContainerRef.current;
    if (c) c.scrollTop = c.scrollHeight;
  }, []);

  useEffect(() => {
    if (highlightMessageId) {
      const el = document.getElementById(`msg-${highlightMessageId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightMessageId]);

  if (messages.length === 0 && !isLoading && !isWaiting && !isStreaming) return <EmptyChatState language={language} />;

  return (
    <>
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-6 custom-scrollbar always-show-scrollbar scroll-momentum relative" ref={scrollContainerRef} onScroll={handleScroll} onWheel={(e) => {
        // Ensure mouse wheel events are handled smoothly
        const container = scrollContainerRef.current;
        if (!container) return;
        e.stopPropagation();
      }}>
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((msg, index) => {
            const prev = index > 0 ? messages[index - 1] : null;
            const showTimeSep = prev && msg.createdAt && prev.createdAt &&
              new Date(msg.createdAt).getTime() - new Date(prev.createdAt).getTime() > 30 * 60 * 1000;

            return (
              <React.Fragment key={msg.id || index}>
                {showTimeSep && msg.createdAt && <TimeSeparator dateStr={msg.createdAt} language={language} />}
                <MessageRow
                  msg={msg} language={language}
                  isLast={index === messages.length - 1}
                  isHighlighted={highlightMessageId === msg.id}
                  isPinned={pinnedIds?.has(msg.id) ?? false}
                  isLoading={isLoading} reactions={reactions}
                  onRegenerate={onRegenerate} onQuickReply={onQuickReply}
                  onTogglePin={onTogglePin} onToggleReaction={onToggleReaction}
                />
              </React.Fragment>
            );
          })}

          {/* Streaming bubble — DIRECT DOM updates via rAF, zero React re-renders.
             Mounts as soon as streaming starts; the green reasoning panel
             only appears once real reasoning tokens arrive (so non-thinking
             models don't show a misleading placeholder). */}
          {isStreaming && (
            <StreamingBubble streamingTextRef={streamingTextRef} language={language} />
          )}

          {/* Compact "thinking" pill: shown ONLY while waiting for the
             first byte. Replaced by StreamingBubble once streaming starts. */}
          {isWaiting && !isStreaming && (
            <div className="flex gap-3 msg-entering">
              <div className="thinking-avatar shrink-0 h-7 w-7 rounded-full flex items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 text-emerald-600 dark:text-emerald-400">
                <Bot className="h-3.5 w-3.5" />
              </div>
              <div className="thinking-pill flex items-center gap-2 py-2 pl-3 pr-3.5 rounded-full">
                <div className="flex items-end gap-1 h-3">
                  <span className="thinking-dot" />
                  <span className="thinking-dot" />
                  <span className="thinking-dot" />
                </div>
                <span className="text-[11px] font-medium ml-0.5 thinking-gradient-text tracking-wide">
                  {language === 'en' ? 'thinking…' : '思考緊⋯⋯'}
                </span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {showCopyAll && (
          <button onClick={handleCopyAll}
            className="absolute top-4 right-4 z-10 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 dark:bg-[#1e1e1e]/80 backdrop-blur-sm border border-[#e1e4e8] dark:border-[#333] shadow-sm hover:shadow-md text-xs font-medium text-[#888] hover:text-[#333] dark:hover:text-[#e0e0e0] transition-all duration-200 msg-entering"
            aria-label={language === 'en' ? 'Copy all messages' : '複製所有訊息'}>
            {copiedAll ? (<><Check className="h-3.5 w-3.5" /><span>{language === 'en' ? 'Copied!' : '已複製！'}</span></>) : (<><ClipboardList className="h-3.5 w-3.5" /><span>{language === 'en' ? 'Copy All' : '複製全部'}</span></>)}
          </button>
        )}

        {showScrollBtn && (
          <button onClick={scrollToBottom}
            className="absolute bottom-4 right-4 z-10 h-9 w-9 flex items-center justify-center rounded-full bg-white dark:bg-[#2a2a2a] border border-[#e1e4e8] dark:border-[#333] shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 msg-entering"
            aria-label={language === 'en' ? 'Scroll to bottom' : '滾動到底部'}>
            <ChevronDown className="h-4 w-4 text-[#888]" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#888] text-white text-[10px] font-bold leading-none">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
        )}
      </div>
    </>
  );
}
