'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Calculator,
  Search,
  X,
  Copy,
  Check,
  Globe,
  Layers,
  ArrowRightLeft,
  Link,
  Gauge,
  Play,
  Network,
  Route,
  Building2,
  EthernetPort,
  GitBranch,
  Shield,
  Wifi,
  Lightbulb,
  Lock,
  LayoutGrid,
  Zap,
  Globe2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { formulas, formulaTopicMeta, type Formula } from '@/lib/formulas';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { asciiToLatex, symbolToLatex } from '@/lib/formula-latex';

const topicIcons: Record<string, React.ElementType> = {
  Globe,
  Layers,
  ArrowRightLeft,
  Link,
  Gauge,
  Globe2,
  Play,
  Network,
  Route,
  Building2,
  EthernetPort,
  GitBranch,
  Shield,
  Wifi,
  Lightbulb,
  Lock,
  LayoutGrid,
  Zap,
};

interface FormulaSheetProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'zh';
}

export function FormulaSheet({ isOpen, onClose, language }: FormulaSheetProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const topicIds = useMemo(() => {
    const ids = [...new Set(formulas.map((f) => f.topicId))];
    return ids;
  }, []);

  const filteredFormulas = useMemo(() => {
    let filtered = formulas;

    if (activeTopic) {
      filtered = filtered.filter((f) => f.topicId === activeTopic);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (f) =>
          f.title.toLowerCase().includes(q) ||
          f.titleZh.includes(q) ||
          f.formula.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q) ||
          f.descriptionZh.includes(q) ||
          f.variables.some(
            (v) =>
              v.symbol.toLowerCase().includes(q) ||
              v.meaning.toLowerCase().includes(q) ||
              v.meaningZh.includes(q)
          )
      );
    }

    return filtered;
  }, [searchQuery, activeTopic]);

  const groupedFormulas = useMemo(() => {
    const groups: Record<string, Formula[]> = {};
    for (const f of filteredFormulas) {
      if (!groups[f.topicId]) groups[f.topicId] = [];
      groups[f.topicId].push(f);
    }
    return groups;
  }, [filteredFormulas]);

  const handleCopy = useCallback(async (formula: Formula) => {
    const text = `${formula.title} / ${formula.titleZh}\n${formula.formula}\n\n${language === 'en' ? formula.description : formula.descriptionZh}\n\n${formula.variables.map((v) => `${v.symbol} = ${language === 'en' ? v.meaning : v.meaningZh}`).join('\n')}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(formula.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Clipboard API may not be available
    }
  }, [language]);

  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setActiveTopic(null);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-5 pt-5 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
              <Calculator className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <DialogTitle className="text-base">
              {language === 'en' ? 'Formula Reference Sheet' : '公式參考表'}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs mt-1">
            {language === 'en'
              ? `${formulas.length} formulas across ${topicIds.length} topics`
              : `${topicIds.length} 個主題中的 ${formulas.length} 個公式`}
          </DialogDescription>
        </DialogHeader>

        {/* Search + Topic filter */}
        <div className="px-5 pb-3 shrink-0 space-y-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 dark:text-gray-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === 'en' ? 'Search formulas...' : '搜尋公式...'
              }
              className="w-full h-8 pl-8 pr-8 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label={language === 'en' ? 'Clear' : '清除'}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Topic filter pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={resetFilters}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                !activeTopic
                  ? 'bg-emerald-600 text-white dark:bg-emerald-500'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {language === 'en' ? 'All' : '全部'}
              <span className="text-[10px] opacity-70">({formulas.length})</span>
            </button>
            {topicIds.map((tid) => {
              const meta = formulaTopicMeta[tid];
              if (!meta) return null;
              const count = formulas.filter((f) => f.topicId === tid).length;
              const Icon = topicIcons[meta.icon] || Globe;
              return (
                <button
                  key={tid}
                  onClick={() => setActiveTopic(activeTopic === tid ? null : tid)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                    activeTopic === tid
                      ? 'bg-emerald-600 text-white dark:bg-emerald-500'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  <span className="hidden sm:inline">{language === 'en' ? meta.label : meta.labelZh}</span>
                  <span className="sm:hidden">{language === 'en' ? meta.label.split(' ')[0] : meta.labelZh.split('')[0]}</span>
                  <span className="text-[10px] opacity-70">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Formula list */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain scroll-smooth custom-scrollbar">
          <div className="px-5 pb-5">
            {Object.keys(groupedFormulas).length === 0 ? (
              <div className="py-12 text-center">
                <Calculator className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {language === 'en' ? 'No formulas match your search' : '冇匹配的公式'}
                </p>
              </div>
            ) : (
              <Accordion
                type="multiple"
                defaultValue={Object.keys(groupedFormulas)}
                className="space-y-1"
              >
                {Object.entries(groupedFormulas).map(([topicId, topicFormulas]) => {
                  const meta = formulaTopicMeta[topicId];
                  const Icon = topicIcons[meta?.icon || 'Globe'] || Globe;
                  return (
                    <AccordionItem
                      key={topicId}
                      value={topicId}
                      className="border rounded-lg border-gray-200/80 dark:border-gray-700/50 px-1 bg-white dark:bg-gray-800/30"
                    >
                      <AccordionTrigger className="hover:no-underline py-3 px-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center h-6 w-6 rounded-md bg-emerald-50 dark:bg-emerald-900/30">
                            <Icon className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <span>{language === 'en' ? meta?.label : meta?.labelZh}</span>
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-normal">
                            {topicFormulas.length}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-3 px-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {topicFormulas.map((formula) => (
                            <FormulaCard
                              key={formula.id}
                              formula={formula}
                              language={language}
                              topicLabel={language === 'en' ? meta?.label : meta?.labelZh}
                              copied={copiedId === formula.id}
                              onCopy={() => handleCopy(formula)}
                            />
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FormulaCard({
  formula,
  language,
  topicLabel,
  copied,
  onCopy,
}: {
  formula: Formula;
  language: 'en' | 'zh';
  topicLabel: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="rounded-lg border border-gray-100 dark:border-gray-700/40 bg-gray-50/50 dark:bg-gray-800/20 p-3.5 space-y-2.5 hover:border-emerald-200 dark:hover:border-emerald-800/50 transition-colors">
      {/* Title + topic badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-tight">
            {language === 'en' ? formula.title : formula.titleZh}
          </h4>
        </div>
        <button
          onClick={onCopy}
          className="shrink-0 h-7 w-7 flex items-center justify-center rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          aria-label={language === 'en' ? 'Copy formula' : '複製公式'}
          title={language === 'en' ? 'Copy formula' : '複製公式'}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-500" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* Formula display block — KaTeX rendered (falls back to mono ASCII on parse failure) */}
      <div className="rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-100 dark:border-emerald-800/30 px-3.5 py-3 overflow-x-auto formula-katex">
        <BlockMath
          math={asciiToLatex(formula.formula)}
          errorColor="#dc2626"
          renderError={() => (
            <code className="text-[13px] font-mono text-gray-700 dark:text-emerald-200 whitespace-pre-wrap break-all">
              {formula.formula}
            </code>
          )}
        />
      </div>

      {/* Description */}
      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
        {language === 'en' ? formula.description : formula.descriptionZh}
      </p>

      {/* Variables table */}
      {formula.variables.length > 0 && (
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-semibold">
            {language === 'en' ? 'Variables' : '變量'}
          </p>
          <div className="divide-y divide-gray-100 dark:divide-gray-700/40 rounded-md border border-gray-100 dark:border-gray-700/30 overflow-hidden">
            {formula.variables.map((v) => (
              <div
                key={v.symbol}
                className="flex items-baseline gap-2 px-2.5 py-1.5 text-xs bg-white dark:bg-gray-800/30"
              >
                <span className="shrink-0 text-emerald-700 dark:text-emerald-400 min-w-[48px] formula-katex-inline">
                  <InlineMath
                    math={symbolToLatex(v.symbol)}
                    errorColor="#dc2626"
                    renderError={() => <span>{v.symbol}</span>}
                  />
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {language === 'en' ? v.meaning : v.meaningZh}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
