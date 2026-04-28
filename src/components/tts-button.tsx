'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Volume2, Loader2, XCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Strip markdown formatting for cleaner TTS output
function stripMarkdown(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/~~([^~]+)~~/g, '$1')
    .replace(/^[-*_]{3,}\s*$/gm, '')
    .replace(/^>\s+/gm, '')
    .replace(/\|/g, ' ')
    .replace(/^[\s]*[-:]+[\s]*[-|:]+/gm, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Voice name keywords ranked by quality — prefer "Neural" / "Online" voices.
// For Cantonese: WanLung (HK male), HiuMaan/HiuGaai (HK female).
// For English:   Aria/Jenny/Guy (US neural).
const ZH_HK_PREFERRED = ['HiuMaan', 'HiuGaai', 'WanLung', 'Sin-ji'];
const EN_PREFERRED = ['Aria', 'Jenny', 'Guy', 'Samantha', 'Karen', 'Daniel'];

// Pick the best available voice for a given language. For Chinese we
// specifically prefer Cantonese (zh-HK) since the app targets HKUST users.
function pickVoice(language: 'en' | 'zh'): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return undefined;

  if (language === 'zh') {
    // Prefer named natural Cantonese voices first
    for (const name of ZH_HK_PREFERRED) {
      const m = voices.find((v) => v.name.includes(name));
      if (m) return m;
    }
    // Then any zh-HK voice
    const hk = voices.find((v) => v.lang === 'zh-HK');
    if (hk) return hk;
    // Fall back to other Chinese variants
    for (const locale of ['zh-TW', 'zh-CN', 'zh-SG']) {
      const m = voices.find((v) => v.lang === locale);
      if (m) return m;
    }
    return voices.find((v) => v.lang.startsWith('zh'));
  }

  // English path
  for (const name of EN_PREFERRED) {
    const m = voices.find((v) => v.name.includes(name) && v.lang.startsWith('en'));
    if (m) return m;
  }
  for (const locale of ['en-US', 'en-GB', 'en-AU', 'en-CA']) {
    const m = voices.find((v) => v.lang === locale);
    if (m) return m;
  }
  return voices.find((v) => v.lang.startsWith('en'));
}

// Split text into runs of consecutive Chinese vs non-Chinese characters
// so each run can be spoken with the appropriate voice. Punctuation and
// numbers stick to the surrounding script so the prosody stays smooth.
function splitByScript(text: string): Array<{ lang: 'zh' | 'en'; text: string }> {
  const out: Array<{ lang: 'zh' | 'en'; text: string }> = [];
  // CJK Unified Ideographs + extensions + Bopomofo + CJK punctuation
  const isCJK = (ch: string) => /[\u3400-\u9FFF\uF900-\uFAFF\u3000-\u303F\uFF00-\uFFEF]/.test(ch);
  let buf = '';
  let curLang: 'zh' | 'en' | null = null;
  for (const ch of text) {
    const chLang: 'zh' | 'en' | null = isCJK(ch)
      ? 'zh'
      : /[A-Za-z]/.test(ch)
        ? 'en'
        : null; // neutral (digits, punctuation, whitespace)
    if (chLang === null) {
      buf += ch;
      continue;
    }
    if (curLang === null) curLang = chLang;
    if (chLang !== curLang) {
      if (buf.trim()) out.push({ lang: curLang, text: buf });
      buf = ch;
      curLang = chLang;
    } else {
      buf += ch;
    }
  }
  if (buf.trim()) out.push({ lang: (curLang ?? 'en'), text: buf });
  return out;
}

type TTSState = 'idle' | 'loading' | 'playing' | 'error';

interface TTSButtonProps {
  content: string;
  language: 'en' | 'zh';
}

export function TTSButton({ content, language }: TTSButtonProps) {
  const [state, setState] = useState<TTSState>('idle');
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const cancelledRef = useRef<boolean>(false);

  const handleClick = useCallback(() => {
    // If currently playing, stop and reset
    if (state === 'playing') {
      cancelledRef.current = true;
      window.speechSynthesis.cancel();
      utteranceRef.current = null;
      setState('idle');
      return;
    }

    // If loading, ignore click
    if (state === 'loading') return;

    // Check browser support
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setState('error');
      setTimeout(() => setState('idle'), 2000);
      return;
    }

    try {
      setState('loading');

      // Clean text and limit to 2000 chars
      const cleanedText = stripMarkdown(content).slice(0, 2000);

      if (cleanedText.trim().length === 0) {
        setState('idle');
        return;
      }

      // Cancel any existing speech
      window.speechSynthesis.cancel();

      // Split mixed-script content so each chunk is spoken with the
      // matching voice (Cantonese for 中文, English for English).
      const chunks = splitByScript(cleanedText);
      if (chunks.length === 0) { setState('idle'); return; }

      const zhVoice = pickVoice('zh');
      const enVoice = pickVoice('en');

      cancelledRef.current = false;
      let started = false;

      const speakNext = (idx: number) => {
        if (cancelledRef.current || idx >= chunks.length) {
          setState('idle');
          utteranceRef.current = null;
          return;
        }
        const { lang, text } = chunks[idx];
        const u = new SpeechSynthesisUtterance(text);
        u.lang = lang === 'zh' ? 'zh-HK' : 'en-US';
        u.rate = 1.0;
        u.pitch = 1.0;
        u.volume = 1.0;
        const v = lang === 'zh' ? zhVoice : enVoice;
        if (v) u.voice = v;
        u.onstart = () => {
          if (!started) { setState('playing'); started = true; }
        };
        u.onend = () => speakNext(idx + 1);
        u.onerror = () => {
          if (!cancelledRef.current) {
            setState('error');
            utteranceRef.current = null;
            setTimeout(() => setState('idle'), 2000);
          }
        };
        utteranceRef.current = u;
        window.speechSynthesis.speak(u);
      };

      speakNext(0);
    } catch {
      setState('error');
      setTimeout(() => setState('idle'), 2000);
    }
  }, [content, language, state]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const tooltipLabel = language === 'en' ? 'Listen' : '收聽';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={handleClick}
          className={`flex items-center justify-center h-7 w-7 rounded-md transition-all duration-150 ${
            state === 'error'
              ? 'text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
              : state === 'playing'
                ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200/60 dark:hover:bg-gray-700/60'
          }`}
          aria-label={tooltipLabel}
          aria-live="polite"
        >
          {state === 'idle' && <Volume2 className="h-3.5 w-3.5" />}
          {state === 'loading' && (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          )}
          {state === 'playing' && (
            <Volume2 className="h-3.5 w-3.5 animate-pulse" />
          )}
          {state === 'error' && <XCircle className="h-3.5 w-3.5" />}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        {state === 'error'
          ? language === 'en'
            ? 'Failed to generate audio'
            : '語音生成失敗'
          : state === 'playing'
            ? language === 'en'
              ? 'Click to stop'
              : '㩒停止'
            : tooltipLabel}
      </TooltipContent>
    </Tooltip>
  );
}
