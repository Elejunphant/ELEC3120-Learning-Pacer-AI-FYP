'use client';

import React, { useMemo } from 'react';
import { Cloud, MessageSquare } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// ── Types ──────────────────────────────────────────────────────
interface WordCloudPanelProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'zh';
  messages: { role: string; content: string }[];
  onWordClick?: (word: string) => void;
}

interface WordFreq {
  word: string;
  count: number;
}

// ── Stop words ─────────────────────────────────────────────────
const STOP_WORDS_EN = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'to', 'of',
  'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through',
  'during', 'before', 'after', 'above', 'below', 'between', 'under', 'again',
  'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how',
  'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some',
  'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too',
  'very', 'just', 'because', 'but', 'and', 'or', 'if', 'while', 'about',
  'up', 'out', 'off', 'over', 'down', 'this', 'that', 'these', 'those',
  'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he', 'him', 'his', 'she',
  'her', 'it', 'its', 'they', 'them', 'their', 'what', 'which', 'who',
  'whom', 'also', 'like', 'well', 'back', 'even', 'still', 'way', 'take',
  'come', 'get', 'make', 'know', 'think', 'see', 'new', 'now', 'let',
  'say', 'said', 'many', 'much', 'use', 'used', 'using', 'one', 'two',
]);

const STOP_WORDS_ZH = new Set([
  '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都',
  '一', '個', '上', '也', '到', '説', '要', '你', '會', '着', '冇',
  '看', '好', '自己', '呢', '他', '她', '它', '們', '那', '麼', '什麼',
  '如果', '因為', '所以', '可以', '已經', '但是', '或者', '而且', '不過',
  '然後', '可能', '呢個', '那個', '呢些', '那些', '來', '去', '把', '被',
  '還', '又', '很', '非常', '比較', '能', '應該', '需要', '如何', '怎樣',
  '為什麼', '哪裏', '邊啲', '幾', '多', '少', '大', '小', '中', '時',
  '時候', '時候', '裏', '外', '前', '後', '以', '與', '及', '對', '從',
  '向', '等', '畀', '讓', '問', '答', '請', '吧', '呢', '啊', '嗎',
  '嗯', '哈', '哦', '啦', '呀', '嘛', '嗯', '好', '行', '用', '通過',
  '進行', '瞭解', '學習', '概念', '我們', '主要', '一個', '一種', '兩種',
  '不同', '包括', '例如', '比如', '以下', '關於', '首先', '其次', '最後',
]);

// ── Color palette ──────────────────────────────────────────────
const WORD_COLORS = [
  'text-emerald-700 dark:text-emerald-300',
  'text-teal-700 dark:text-teal-300',
  'text-emerald-600 dark:text-emerald-400',
  'text-teal-600 dark:text-teal-400',
  'text-emerald-500 dark:text-emerald-500',
  'text-gray-700 dark:text-gray-300',
  'text-teal-500 dark:text-teal-500',
  'text-emerald-800 dark:text-emerald-200',
];

const WORD_BG_HOVER = [
  'hover:bg-emerald-100 dark:hover:bg-emerald-900/30',
  'hover:bg-teal-100 dark:hover:bg-teal-900/30',
  'hover:bg-emerald-50 dark:hover:bg-emerald-950/30',
];

// ── Helpers ────────────────────────────────────────────────────
function extractWords(messages: { role: string; content: string }[]): WordFreq[] {
  // Collect all assistant message content
  const text = messages
    .filter((m) => m.role === 'assistant')
    .map((m) => m.content)
    .join(' ');

  if (!text.trim()) return [];

  // Tokenize: split by whitespace, punctuation, markdown syntax
  // Clean markdown formatting characters
  const cleaned = text
    .replace(/#{1,6}\s/g, ' ')  // remove markdown headers
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')  // remove bold/italic
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')  // remove links
    .replace(/`{1,3}[^`]*`{1,3}/g, '')  // remove code blocks
    .replace(/[()[\]{}<>]/g, ' ')  // remove brackets
    .replace(/[^a-zA-Z0-9\u4e00-\u9fff\s-]/g, ' ');  // keep alphanumeric, CJK, hyphens

  // Split into tokens
  const tokens = cleaned
    .split(/\s+/)
    .filter((t) => t.length > 1);

  // Count frequencies
  const freq = new Map<string, number>();
  for (const token of tokens) {
    const lower = token.toLowerCase();
    // Skip stop words
    if (STOP_WORDS_EN.has(lower) || STOP_WORDS_ZH.has(token)) continue;
    // Skip pure numbers
    if (/^\d+$/.test(lower)) continue;
    // Skip very short tokens (except CJK characters which can be meaningful)
    if (lower.length <= 2 && !/[\u4e00-\u9fff]/.test(lower)) continue;
    freq.set(lower, (freq.get(lower) || 0) + 1);
  }

  // Sort by frequency and take top 25
  return Array.from(freq.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 25);
}

// Simple deterministic "hash" for positioning — gives each word a fixed position
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

// ── Main Component ─────────────────────────────────────────────
export function WordCloudPanel({ isOpen, onClose, language, messages, onWordClick }: WordCloudPanelProps) {
  const wordFreqs = useMemo(() => extractWords(messages), [messages]);
  const maxCount = wordFreqs.length > 0 ? wordFreqs[0].count : 1;

  const labels = {
    title: language === 'en' ? 'Word Cloud' : '詞雲',
    subtitle: language === 'en'
      ? 'Key topics from your conversation'
      : '對話中的關鍵主題',
    empty: language === 'en'
      ? 'No conversation yet'
      : '暫無對話',
    emptyHint: language === 'en'
      ? 'Start chatting with your AI tutor to see key topics appear here.'
      : '開始與AI導師對話，關鍵主題會顯示在呢度。',
    clickHint: language === 'en'
      ? 'Click a word to insert it into chat'
      : '㩒詞語插入到聊日中',
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[560px] p-0 overflow-hidden">
        {/* Gradient top border */}
        <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 shrink-0" />

        <div className="px-6 pt-4 pb-2">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Cloud className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              {labels.title}
            </DialogTitle>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {labels.subtitle}
            </p>
          </DialogHeader>
        </div>

        <div className="px-6 pb-6">
          {wordFreqs.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <MessageSquare className="h-7 w-7 text-gray-300 dark:text-gray-600" />
              </div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {labels.empty}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 max-w-[240px]">
                {labels.emptyHint}
              </p>
            </div>
          ) : (
            <>
              {/* Click hint */}
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-3 flex items-center gap-1">
                <Cloud className="h-3 w-3" />
                {labels.clickHint}
              </p>

              {/* Word cloud grid layout */}
              <div className="flex flex-wrap gap-1.5 justify-center py-4 px-2 min-h-[160px] items-center">
                {wordFreqs.map((item, index) => {
                  // Scale font size based on frequency
                  const ratio = item.count / maxCount;
                  const fontSize = Math.round(14 + ratio * 22); // 14px to 36px
                  // Deterministic color and hover based on index
                  const colorIndex = hashString(item.word) % WORD_COLORS.length;
                  const bgHoverIndex = hashString(item.word + 'bg') % WORD_BG_HOVER.length;
                  const color = WORD_COLORS[colorIndex];
                  const hoverBg = WORD_BG_HOVER[bgHoverIndex];

                  return (
                    <button
                      key={item.word}
                      onClick={() => onWordClick?.(item.word)}
                      className={`${color} ${hoverBg} rounded-lg px-2 py-1 transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95 font-medium leading-tight`}
                      style={{ fontSize: `${fontSize}px` }}
                      title={`${item.word}: ${item.count}`}
                    >
                      {item.word}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
