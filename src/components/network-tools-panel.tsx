'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  X,
  Wrench,
  Stethoscope,
  Settings,
  Shield,
  Terminal,
  Monitor,
  Apple,
  Copy,
  Check,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { networkTools, toolCategories } from '@/lib/network-tools-data';
import type { NetworkTool } from '@/lib/network-tools-data';
import { useToast } from '@/hooks/use-toast';

interface NetworkToolsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'zh';
}

const categoryColorMap: Record<string, {
  badge: string;
  badgeDark: string;
  pill: string;
  pillActive: string;
  icon: string;
  bg: string;
  border: string;
}> = {
  diagnostic: {
    badge: 'bg-emerald-100 text-emerald-700',
    badgeDark: 'dark:bg-emerald-900/40 dark:text-emerald-300',
    pill: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    pillActive: 'bg-emerald-600 text-white dark:bg-emerald-500',
    icon: 'text-emerald-500 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/20',
    border: 'border-l-emerald-500',
  },
  configuration: {
    badge: 'bg-amber-100 text-amber-700',
    badgeDark: 'dark:bg-amber-900/40 dark:text-amber-300',
    pill: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    pillActive: 'bg-amber-600 text-white dark:bg-amber-500',
    icon: 'text-amber-500 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/20',
    border: 'border-l-amber-500',
  },
  analysis: {
    badge: 'bg-teal-100 text-teal-700',
    badgeDark: 'dark:bg-teal-900/40 dark:text-teal-300',
    pill: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
    pillActive: 'bg-teal-600 text-white dark:bg-teal-500',
    icon: 'text-teal-500 dark:text-teal-400',
    bg: 'bg-teal-50 dark:bg-teal-950/20',
    border: 'border-l-teal-500',
  },
  security: {
    badge: 'bg-rose-100 text-rose-700',
    badgeDark: 'dark:bg-rose-900/40 dark:text-rose-300',
    pill: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    pillActive: 'bg-rose-600 text-white dark:bg-rose-500',
    icon: 'text-rose-500 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-950/20',
    border: 'border-l-rose-500',
  },
};

const categoryIconMap: Record<string, React.ReactNode> = {
  Wrench: <Wrench className="h-3.5 w-3.5" />,
  Stethoscope: <Stethoscope className="h-3.5 w-3.5" />,
  Settings: <Settings className="h-3.5 w-3.5" />,
  Search: <Search className="h-3.5 w-3.5" />,
  Shield: <Shield className="h-3.5 w-3.5" />,
};

function OsIcon({ os }: { os: string }) {
  switch (os) {
    case 'cross':
      return <Monitor className="h-3 w-3 text-gray-400" />;
    case 'windows':
      return <Terminal className="h-3 w-3 text-gray-400" />;
    case 'mac':
      return <Apple className="h-3 w-3 text-gray-400" />;
    case 'linux':
      return <Terminal className="h-3 w-3 text-gray-400" />;
    default:
      return <Monitor className="h-3 w-3 text-gray-400" />;
  }
}

function ToolCard({ tool, language }: { tool: NetworkTool; language: 'en' | 'zh' }) {
  const { toast } = useToast();
  const [copiedCmd, setCopiedCmd] = useState(false);

  const colors = categoryColorMap[tool.category] || categoryColorMap.diagnostic;
  const cat = toolCategories.find((c) => c.id === tool.category);

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(tool.command).then(() => {
      setCopiedCmd(true);
      toast({
        description: language === 'en' ? 'Command copied!' : '命令已複製！',
      });
      setTimeout(() => setCopiedCmd(false), 1500);
    });
  };

  const handleCopyExample = () => {
    if (!tool.example) return;
    navigator.clipboard.writeText(tool.example).then(() => {
      toast({
        description: language === 'en' ? 'Example copied!' : '示例已複製！',
      });
    });
  };

  return (
    <div
      className={`rounded-xl border border-gray-200 dark:border-gray-700/60 border-l-4 ${colors.border} bg-white dark:bg-[#2f2f2f] transition-all duration-200 hover:shadow-md hover:-translate-y-0.5`}
    >
      <div className="p-4 space-y-2.5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
              {tool.name}
            </h3>
            <span className={`text-xs font-medium ${colors.icon}`}>
              {language === 'zh' ? tool.nameZh : ''}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <OsIcon os={tool.os} />
            <Badge
              className={`text-[10px] border-0 px-2 py-0.5 ${colors.badge} ${colors.badgeDark}`}
            >
              {language === 'en' ? (cat?.label || '') : (cat?.labelZh || '')}
            </Badge>
          </div>
        </div>

        {/* Command */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopyCommand}
            className="flex-1 text-left rounded-lg bg-gray-900 dark:bg-gray-800 px-3 py-2 group/cmd cursor-pointer transition-colors hover:bg-gray-800 dark:hover:bg-gray-700"
            aria-label="Copy command"
          >
            <code className="text-xs font-mono text-emerald-400 break-all">
              {tool.command}
            </code>
          </button>
          <button
            onClick={handleCopyCommand}
            className="shrink-0 h-8 w-8 flex items-center justify-center rounded-md bg-gray-900 dark:bg-gray-800 hover:bg-gray-700 dark:hover:bg-gray-600 text-gray-400 hover:text-white transition-colors touch-manipulation"
            aria-label={language === 'en' ? 'Copy command' : '複製命令'}
          >
            {copiedCmd ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
          {language === 'en' ? tool.description : tool.descriptionZh}
        </p>

        {/* Example */}
        {tool.example && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopyExample}
              className="flex-1 text-left rounded-lg bg-gray-50 dark:bg-gray-800/40 px-3 py-2 border border-gray-100 dark:border-gray-700/40 cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-700/60"
              aria-label="Copy example"
            >
              <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider block mb-0.5">
                {language === 'en' ? 'Example' : '示例'}
              </span>
              <code className="text-xs font-mono text-gray-700 dark:text-gray-300 break-all">
                {tool.example}
              </code>
            </button>
            <button
              onClick={handleCopyExample}
              className="shrink-0 h-8 w-8 flex items-center justify-center rounded-md bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/40 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors touch-manipulation"
              aria-label={language === 'en' ? 'Copy example' : '複製示例'}
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function NetworkToolsPanel({ isOpen, onClose, language }: NetworkToolsPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredTools = useMemo(() => {
    let result = networkTools;

    if (activeCategory !== 'all') {
      result = result.filter((t) => t.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.nameZh.includes(q) ||
          t.command.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.descriptionZh.includes(q)
      );
    }

    return result;
  }, [searchQuery, activeCategory]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-5 pt-5 pb-0 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                <Wrench className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {language === 'en' ? 'Network Tools Reference' : '網絡工具參考'}
              </DialogTitle>
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
              {filteredTools.length} / {networkTools.length}{' '}
              {language === 'en' ? 'tools' : '工具'}
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
                  ? 'Search tools, commands, descriptions...'
                  : '搜尋工具、命令、描述...'
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
            {toolCategories
              .filter((cat) => cat.id !== 'all')
              .map((cat) => {
                const colors = categoryColorMap[cat.id] || categoryColorMap.diagnostic;
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

        {/* Tools list */}
        <div className="flex-1 px-5 pb-5 overflow-y-auto overscroll-contain custom-scrollbar">
          <div className="space-y-3">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} language={language} />
            ))}

            {filteredTools.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Search className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {language === 'en'
                    ? 'No tools found matching your search.'
                    : '冇找到匹配的工具。'}
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
