'use client';

import React, { memo } from 'react';
import { FileText, BookOpen, ChevronRight, GraduationCap, Upload } from 'lucide-react';

export interface CitationData {
  docTitle: string;
  docId: string;
  pages: number[];
  snippet: string;
  relevanceScore: number;
  source?: string;
}

// Helper to determine if a citation is from built-in knowledge base
function isBuiltInCitation(docId: string): boolean {
  return docId.startsWith('topic-');
}

interface CitationCardProps {
  citation: CitationData;
  index: number;
  language: 'en' | 'zh';
  onClick?: (citation: CitationData) => void;
}

export const CitationCard = memo(function CitationCard({
  citation,
  index,
  language,
  onClick,
}: CitationCardProps) {
  const { docTitle, docId, pages, snippet, relevanceScore, source } = citation;
  const builtIn = isBuiltInCitation(docId);

  // Format page range
  const pageDisplay = pages.length > 0
    ? pages.length === 1
      ? `p.${pages[0]}`
      : `p.${pages[0]}\u2013${pages[pages.length - 1]}`
    : null;

  // Source display (lecture reference or document name)
  const sourceDisplay = source || docTitle;

  // Truncate snippet for display
  const truncatedSnippet = snippet.length > 120
    ? snippet.slice(0, 120).trim() + '...'
    : snippet;

  // Relevance indicator
  const relevancePercent = Math.min(100, Math.round((relevanceScore / 30) * 100));
  const relevanceColor = relevancePercent >= 70
    ? 'bg-emerald-400'
    : relevancePercent >= 40
      ? 'bg-amber-400'
      : 'bg-gray-300 dark:bg-gray-600';

  return (
    <button
      onClick={() => onClick?.(citation)}
      className="w-full text-left group/cite"
      aria-label={`Source: ${sourceDisplay}${pageDisplay ? `, ${pageDisplay}` : ''}`}
    >
      <div className="flex items-start gap-2.5 p-2.5 rounded-lg border border-[#e8e8e8] dark:border-white/[0.08] bg-[#fafafa] dark:bg-white/[0.03] border-l-[3px] border-l-emerald-400 dark:border-l-emerald-500/60 hover:bg-emerald-50/60 dark:hover:bg-emerald-500/[0.06] hover:border-[#d0d0d0] dark:hover:border-white/[0.12] hover:border-l-emerald-500 dark:hover:border-l-emerald-400 hover:shadow-[0_2px_8px_rgba(16,185,129,0.08)] dark:hover:shadow-[0_2px_8px_rgba(16,185,129,0.06)] hover:-translate-y-[0.5px] active:translate-y-0 active:shadow-none transition-all duration-200 ease-out">
        {/* Citation number badge */}
        <div className="shrink-0 flex items-center justify-center h-5 w-5 rounded-full bg-[#e8e8e8] dark:bg-white/[0.08] text-[10px] font-bold text-[#666] dark:text-[#aaa] mt-0.5 group-hover/cite:bg-[#1b1b1b] dark:group-hover/cite:bg-white group-hover/cite:text-white dark:group-hover/cite:text-black transition-colors duration-200">
          {index + 1}
        </div>

        <div className="flex-1 min-w-0">
          {/* Row 1: Source type badge + source name */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <div className={`shrink-0 h-5 w-5 rounded-md flex items-center justify-center shadow-[inset_0_0_0_1px_rgba(16,185,129,0.15)] dark:shadow-[inset_0_0_0_1px_rgba(16,185,129,0.2)] group-hover/cite:bg-emerald-200 dark:group-hover/cite:bg-emerald-500/35 transition-colors duration-200 ${
              builtIn
                ? 'bg-emerald-100 dark:bg-emerald-500/25'
                : 'bg-blue-100 dark:bg-blue-500/25'
            }`}>
              {builtIn ? (
                <GraduationCap className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Upload className="h-3 w-3 text-blue-600 dark:text-blue-400" />
              )}
            </div>
            <span className={`text-[12px] font-semibold truncate ${
              builtIn
                ? 'text-emerald-800 dark:text-emerald-300'
                : 'text-blue-800 dark:text-blue-300'
            }`}>
              {sourceDisplay}
            </span>
          </div>

          {/* Row 2: Page / topic info — always visible */}
          <div className="flex items-center gap-1.5 mt-1">
            <BookOpen className="h-2.5 w-2.5 text-[#aaa] dark:text-[#666]" />
            {pageDisplay ? (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/15 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-500/25 shadow-[0_1px_2px_rgba(16,185,129,0.1)] shrink-0">
                {language === 'en' ? 'Pages' : '\u9801\u78bc'}: {pageDisplay}
              </span>
            ) : builtIn ? (
              <span className="text-[10px] text-[#999] dark:text-[#777]">
                {language === 'en' ? 'Knowledge Base Topic' : '\u77e5\u8b58\u5eab\u4e3b\u984c'}
              </span>
            ) : (
              <span className="text-[10px] text-[#999] dark:text-[#777]">
                {language === 'en' ? 'Uploaded Document' : '\u4e0a\u50b3\u6587\u6a94'}
              </span>
            )}
            {/* Topic title (when different from source) */}
            {docTitle !== sourceDisplay && (
              <span className="text-[10px] text-[#bbb] dark:text-[#555]">
                &middot; {docTitle}
              </span>
            )}
          </div>

          {/* Snippet preview */}
          <p className="text-[11px] text-[#888] dark:text-[#777] mt-1 line-clamp-2 leading-relaxed">
            &ldquo;{truncatedSnippet}&rdquo;
          </p>

          {/* Relevance bar */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="text-[9px] text-[#aaa] dark:text-[#666] uppercase tracking-wider font-medium">
              {language === 'en' ? 'Relevance' : '\u76f8\u95dc\u5ea6'}
            </span>
            <div className="flex-1 h-1 rounded-full bg-[#e8e8e8] dark:bg-white/[0.06] overflow-hidden">
              <div
                className={`h-full rounded-full ${relevanceColor} transition-all duration-500`}
                style={{ width: `${relevancePercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Expand arrow */}
        <ChevronRight className="h-3.5 w-3.5 text-[#ccc] dark:text-[#555] mt-1 shrink-0 opacity-0 group-hover/cite:opacity-100 transition-opacity duration-200" />
      </div>
    </button>
  );
});

// ──────────────────────────────────────────────────────────────
// CitationsList — renders a stack of citation cards
// ──────────────────────────────────────────────────────────────
interface CitationsListProps {
  citations: CitationData[];
  language: 'en' | 'zh';
  onCitationClick?: (citation: CitationData) => void;
}

export function CitationsList({ citations, language, onCitationClick }: CitationsListProps) {
  if (citations.length === 0) return null;

  return (
    <div className="mt-3 space-y-1.5">
      {/* Section header */}
      <div className="flex items-center gap-2 px-1">
        <div className="h-3 w-0.5 rounded-full bg-emerald-400 dark:bg-emerald-500" />
        <span className="text-[11px] font-semibold text-[#888] dark:text-[#aaa] uppercase tracking-wider">
          {language === 'en' ? 'Sources' : '\u5f15\u7528\u4f86\u6e90'}
        </span>
        <span className="inline-flex items-center justify-center h-4 px-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
          {citations.length}
        </span>
      </div>

      {/* Citation cards */}
      <div className="space-y-1.5">
        {citations.map((citation, i) => (
          <CitationCard
            key={`${citation.docId}-${i}`}
            citation={citation}
            index={i}
            language={language}
            onClick={onCitationClick}
          />
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Citation Detail Dialog — expanded view of a citation
// ──────────────────────────────────────────────────────────────
interface CitationDetailProps {
  citation: CitationData;
  language: 'en' | 'zh';
  onClose: () => void;
}

export function CitationDetail({ citation, language, onClose }: CitationDetailProps) {
  const { docTitle, docId, pages, snippet, source } = citation;
  const builtIn = isBuiltInCitation(docId);
  const pageDisplay = pages.length > 0
    ? pages.length === 1
      ? `p.${pages[0]}`
      : `p.${pages[0]}\u2013${pages[pages.length - 1]}`
    : null;
  const sourceDisplay = source || docTitle;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg rounded-xl bg-white dark:bg-[#2a2a2a] border border-[#e0e0e0] dark:border-white/[0.1] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#e8e8e8] dark:border-white/[0.06] bg-[#fafafa] dark:bg-white/[0.03]">
          <div className="flex items-center gap-2">
            {builtIn ? (
              <GraduationCap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Upload className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            )}
            <span className="text-sm font-semibold text-[#333] dark:text-[#e0e0e0]">
              {language === 'en' ? 'Source Detail' : '\u5f15\u7528\u8a73\u60c5'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[11px] text-[#888] hover:text-[#333] dark:hover:text-[#e0e0e0] px-2 py-1 rounded hover:bg-[#f0f0f0] dark:hover:bg-white/[0.06] transition-colors"
          >
            {language === 'en' ? 'Close' : '\u95dc\u9589'}
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-3">
          {/* Source type */}
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
              builtIn
                ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                : 'bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20'
            }`}>
              {builtIn
                ? (language === 'en' ? 'Knowledge Base' : '\u5167\u7f6e\u77e5\u8b58')
                : (language === 'en' ? 'Uploaded Document' : '\u4e0a\u50b3\u6587\u6a94')}
            </span>
          </div>

          {/* Source (lecture/file name) */}
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#999] dark:text-[#666] font-medium">
              {language === 'en' ? 'Source' : '\u4f86\u6e90'}
            </span>
            <p className="text-sm font-semibold text-[#333] dark:text-[#e0e0e0] mt-0.5">{sourceDisplay}</p>
          </div>

          {/* Topic (if different from source) */}
          {docTitle !== sourceDisplay && (
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#999] dark:text-[#666] font-medium">
                {language === 'en' ? 'Topic' : '\u4e3b\u984c'}
              </span>
              <p className="text-xs text-[#666] dark:text-[#aaa] mt-0.5">{docTitle}</p>
            </div>
          )}

          {/* Pages */}
          {pageDisplay ? (
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#999] dark:text-[#666] font-medium">
                {language === 'en' ? 'Pages' : '\u9801\u78bc'}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-xs font-medium text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                  <BookOpen className="h-3 w-3" />
                  {pageDisplay}
                </span>
              </div>
            </div>
          ) : builtIn ? (
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#999] dark:text-[#666] font-medium">
                {language === 'en' ? 'Reference' : '\u53c3\u8003'}
              </span>
              <p className="text-xs text-[#666] dark:text-[#aaa] mt-0.5">
                {language === 'en' ? 'Built-in knowledge base topic (no specific page)' : '\u5167\u7f6e\u77e5\u8b58\u5eab\u4e3b\u984c\uff08\u7121\u7279\u5b9a\u9801\u78bc\uff09'}
              </p>
            </div>
          ) : null}

          {/* Excerpt */}
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#999] dark:text-[#666] font-medium">
              {language === 'en' ? 'Excerpt' : '\u6458\u9304'}
            </span>
            <div className="mt-1 p-3 rounded-lg bg-[#f8f8f8] dark:bg-white/[0.03] border border-[#eee] dark:border-white/[0.06]">
              <p className="text-[13px] text-[#555] dark:text-[#bbb] leading-relaxed whitespace-pre-wrap">
                {snippet}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Utility: Parse citation JSON from streamed text
// Returns { cleanText: string, citations: CitationData[] }
// ──────────────────────────────────────────────────────────────
const CITATION_START = '<!-- LP_CITATIONS_JSON_START -->';
const CITATION_END = '<!-- LP_CITATIONS_JSON_END -->';

export function parseCitationsFromText(rawText: string): { cleanText: string; citations: CitationData[] } {
  const startIdx = rawText.indexOf(CITATION_START);
  const endIdx = rawText.indexOf(CITATION_END);

  if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
    return { cleanText: rawText, citations: [] };
  }

  const cleanText = rawText.slice(0, startIdx).trim();
  const jsonStr = rawText.slice(startIdx + CITATION_START.length, endIdx).trim();

  try {
    const parsed = JSON.parse(jsonStr);
    if (Array.isArray(parsed)) {
      return { cleanText, citations: parsed };
    }
  } catch {
    // JSON parse failed — return text as-is
  }

  return { cleanText: rawText, citations: [] };
}
