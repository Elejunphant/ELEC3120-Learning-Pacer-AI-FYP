'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  X,
  ChevronDown,
  BookOpen,
  ArrowLeftRight,
  Network,
  Globe,
  Shield,
  Link2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { glossaryTerms, glossaryCategories } from '@/lib/glossary-data';
import type { GlossaryTerm } from '@/lib/glossary-data';

interface GlossaryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'zh';
}

const categoryColorMap: Record<
  string,
  {
    border: string;
    bg: string;
    badge: string;
    badgeDark: string;
    text: string;
    pill: string;
    pillActive: string;
    icon: string;
  }
> = {
  emerald: {
    border: 'border-l-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    badge: 'bg-emerald-100 text-emerald-700',
    badgeDark: 'dark:bg-emerald-900/40 dark:text-emerald-300',
    text: 'text-emerald-600 dark:text-emerald-400',
    pill: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    pillActive: 'bg-emerald-600 text-white dark:bg-emerald-500',
    icon: 'text-emerald-500 dark:text-emerald-400',
  },
  teal: {
    border: 'border-l-teal-500',
    bg: 'bg-teal-50 dark:bg-teal-950/30',
    badge: 'bg-teal-100 text-teal-700',
    badgeDark: 'dark:bg-teal-900/40 dark:text-teal-300',
    text: 'text-teal-600 dark:text-teal-400',
    pill: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
    pillActive: 'bg-teal-600 text-white dark:bg-teal-500',
    icon: 'text-teal-500 dark:text-teal-400',
  },
  amber: {
    border: 'border-l-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    badge: 'bg-amber-100 text-amber-700',
    badgeDark: 'dark:bg-amber-900/40 dark:text-amber-300',
    text: 'text-amber-600 dark:text-amber-400',
    pill: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    pillActive: 'bg-amber-600 text-white dark:bg-amber-500',
    icon: 'text-amber-500 dark:text-amber-400',
  },
  rose: {
    border: 'border-l-rose-500',
    bg: 'bg-rose-50 dark:bg-rose-950/30',
    badge: 'bg-rose-100 text-rose-700',
    badgeDark: 'dark:bg-rose-900/40 dark:text-rose-300',
    text: 'text-rose-600 dark:text-rose-400',
    pill: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    pillActive: 'bg-rose-600 text-white dark:bg-rose-500',
    icon: 'text-rose-500 dark:text-rose-400',
  },
  purple: {
    border: 'border-l-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    badge: 'bg-purple-100 text-purple-700',
    badgeDark: 'dark:bg-purple-900/40 dark:text-purple-300',
    text: 'text-purple-600 dark:text-purple-400',
    pill: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    pillActive: 'bg-purple-600 text-white dark:bg-purple-500',
    icon: 'text-purple-500 dark:text-purple-400',
  },
};

const categoryIconMap: Record<string, React.ReactNode> = {
  BookOpen: <BookOpen className="h-3.5 w-3.5" />,
  ArrowLeftRight: <ArrowLeftRight className="h-3.5 w-3.5" />,
  Network: <Network className="h-3.5 w-3.5" />,
  Globe: <Globe className="h-3.5 w-3.5" />,
  Shield: <Shield className="h-3.5 w-3.5" />,
};

function getTermById(id: string): GlossaryTerm | undefined {
  return glossaryTerms.find((t) => t.id === id);
}

function TermCard({
  term,
  language,
  expanded,
  onToggle,
  onNavigateTo,
}: {
  term: GlossaryTerm;
  language: 'en' | 'zh';
  expanded: boolean;
  onToggle: () => void;
  onNavigateTo: (id: string) => void;
}) {
  const cat = glossaryCategories.find((c) => c.id === term.category);
  const colors = categoryColorMap[cat?.color || 'emerald'] || categoryColorMap.emerald;

  const relatedTerms = term.relatedTerms
    ?.map((id) => getTermById(id))
    .filter(Boolean) as GlossaryTerm[] | undefined;

  return (
    <button
      onClick={onToggle}
      className={`w-full text-left rounded-xl border border-gray-200 dark:border-gray-700/60 border-l-4 ${colors.border} bg-white dark:bg-[#2f2f2f] transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${expanded ? 'shadow-md ring-1 ring-black/5 dark:ring-white/5' : ''}`}
    >
      {/* Collapsed view */}
      <div className="px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                {term.term}
              </h3>
              <span className={`text-xs font-medium ${colors.text}`}>
                {term.termZh}
              </span>
            </div>
            {!expanded && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                {language === 'en' ? term.definition : term.definitionZh}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Badge
              className={`text-[10px] border-0 px-2 py-0.5 ${colors.badge} ${colors.badgeDark}`}
            >
              {language === 'en' ? (cat?.label || '') : (cat?.labelZh || '')}
            </Badge>
            <ChevronDown
              className={`h-4 w-4 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${
                expanded ? 'rotate-180' : ''
              }`}
            />
          </div>
        </div>
      </div>

      {/* Expanded view */}
      {expanded && (
        <div className={`px-4 pb-4 pt-0 border-t border-gray-100 dark:border-gray-700/40`}>
          <div className="mt-3 space-y-3">
            {/* Full definition */}
            <div className={`${colors.bg} rounded-lg p-3`}>
              <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                {language === 'en' ? term.definition : term.definitionZh}
              </p>
            </div>

            {/* Other language definition */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider mb-1">
                {language === 'en' ? '中文釋義 / Chinese' : 'English Definition'}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                {language === 'en' ? term.definitionZh : term.definition}
              </p>
            </div>

            {/* Related terms */}
            {relatedTerms && relatedTerms.length > 0 && (
              <div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider mb-1.5">
                  {language === 'en' ? 'Related Terms' : '相關術語'}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {relatedTerms.map((rt) => (
                    <button
                      key={rt.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateTo(rt.id);
                      }}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors touch-manipulation"
                    >
                      <Link2 className="h-3 w-3" />
                      {rt.term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </button>
  );
}

export function GlossaryPanel({ isOpen, onClose, language }: GlossaryPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [navigatedId, setNavigatedId] = useState<string | null>(null);

  const filteredTerms = useMemo(() => {
    let result = glossaryTerms;

    if (activeCategory !== 'all') {
      result = result.filter((t) => t.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.term.toLowerCase().includes(q) ||
          t.termZh.includes(q) ||
          t.definition.toLowerCase().includes(q) ||
          t.definitionZh.includes(q)
      );
    }

    return result;
  }, [searchQuery, activeCategory]);

  const handleNavigateTo = (id: string) => {
    // If the term is not currently visible (wrong category or search), reset filters
    const term = getTermById(id);
    if (term && activeCategory !== 'all' && term.category !== activeCategory) {
      setActiveCategory('all');
    }
    if (searchQuery.trim()) {
      // Clear search so the term is visible
      const q = searchQuery.toLowerCase();
      const termVisible = term && (
        term.term.toLowerCase().includes(q) ||
        term.termZh.includes(q) ||
        term.definition.toLowerCase().includes(q) ||
        term.definitionZh.includes(q)
      );
      if (!termVisible) {
        setSearchQuery('');
      }
    }
    setExpandedId(id);
    setNavigatedId(id);
    // Clear navigation highlight after a delay
    setTimeout(() => setNavigatedId(null), 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-5 pt-5 pb-0 shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {language === 'en' ? 'Networking Glossary' : '網絡術語表'}
            </DialogTitle>
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
              {filteredTerms.length} / {glossaryTerms.length}{' '}
              {language === 'en' ? 'terms' : '術語'}
            </span>
          </div>
        </DialogHeader>

        {/* Search + Category pills */}
        <div className="px-5 pt-3 pb-2 space-y-3 shrink-0">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === 'en'
                  ? 'Search terms and definitions...'
                  : '搜尋術語和定義...'
              }
              className="pl-9 pr-9 h-9 text-sm bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Category filter pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setActiveCategory('all')}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 touch-manipulation ${
                activeCategory === 'all'
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {language === 'en' ? 'All' : '全部'}
            </button>
            {glossaryCategories.map((cat) => {
              const colors = categoryColorMap[cat.color] || categoryColorMap.emerald;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 touch-manipulation inline-flex items-center gap-1.5 ${
                    activeCategory === cat.id
                      ? colors.pillActive
                      : colors.pill
                  }`}
                >
                  <span className={activeCategory === cat.id ? 'text-white dark:text-white' : ''}>
                    {categoryIconMap[cat.icon]}
                  </span>
                  {language === 'en' ? cat.label : cat.labelZh}
                </button>
              );
            })}
          </div>
        </div>

        {/* Terms list */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain scroll-smooth custom-scrollbar px-5 pb-5">
          <div className="space-y-2.5">
            {filteredTerms.map((term) => (
              <div
                key={term.id}
                id={`glossary-${term.id}`}
                className={`transition-all duration-300 ${
                  navigatedId === term.id
                    ? 'ring-2 ring-emerald-400 dark:ring-emerald-500 rounded-xl'
                    : ''
                }`}
              >
                <TermCard
                  term={term}
                  language={language}
                  expanded={expandedId === term.id}
                  onToggle={() =>
                    setExpandedId((prev) => (prev === term.id ? null : term.id))
                  }
                  onNavigateTo={handleNavigateTo}
                />
              </div>
            ))}

            {filteredTerms.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Search className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {language === 'en'
                    ? 'No terms found matching your search.'
                    : '冇找到匹配的術語。'}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {language === 'en'
                    ? 'Try a different keyword or clear filters.'
                    : '嘗試其他關鍵詞或清除篩選條件。'}
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
