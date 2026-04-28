'use client';

import React, { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { protocolCards, layerFilters } from '@/lib/protocol-data';
import type { ProtocolCard } from '@/lib/protocol-data';

interface ProtocolCardsProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'zh';
}

const colorMap: Record<string, { border: string; bg: string; badge: string; dot: string; text: string; darkBadge: string; darkBorder: string }> = {
  emerald: {
    border: 'border-l-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    badge: 'bg-emerald-100 text-emerald-700',
    dot: 'bg-emerald-400',
    text: 'text-emerald-600 dark:text-emerald-400',
    darkBadge: 'dark:bg-emerald-900/40 dark:text-emerald-300',
    darkBorder: '',
  },
  violet: {
    border: 'border-l-violet-500',
    bg: 'bg-violet-50 dark:bg-violet-950/30',
    badge: 'bg-violet-100 text-violet-700',
    dot: 'bg-violet-400',
    text: 'text-violet-600 dark:text-violet-400',
    darkBadge: 'dark:bg-violet-900/40 dark:text-violet-300',
    darkBorder: '',
  },
  blue: {
    border: 'border-l-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    badge: 'bg-blue-100 text-blue-700',
    dot: 'bg-blue-400',
    text: 'text-blue-600 dark:text-blue-400',
    darkBadge: 'dark:bg-blue-900/40 dark:text-blue-300',
    darkBorder: '',
  },
  orange: {
    border: 'border-l-orange-500',
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    badge: 'bg-orange-100 text-orange-700',
    dot: 'bg-orange-400',
    text: 'text-orange-600 dark:text-orange-400',
    darkBadge: 'dark:bg-orange-900/40 dark:text-orange-300',
    darkBorder: '',
  },
  rose: {
    border: 'border-l-rose-500',
    bg: 'bg-rose-50 dark:bg-rose-950/30',
    badge: 'bg-rose-100 text-rose-700',
    dot: 'bg-rose-400',
    text: 'text-rose-600 dark:text-rose-400',
    darkBadge: 'dark:bg-rose-900/40 dark:text-rose-300',
    darkBorder: '',
  },
  teal: {
    border: 'border-l-teal-500',
    bg: 'bg-teal-50 dark:bg-teal-950/30',
    badge: 'bg-teal-100 text-teal-700',
    dot: 'bg-teal-400',
    text: 'text-teal-600 dark:text-teal-400',
    darkBadge: 'dark:bg-teal-900/40 dark:text-teal-300',
    darkBorder: '',
  },
  amber: {
    border: 'border-l-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    badge: 'bg-amber-100 text-amber-700',
    dot: 'bg-amber-400',
    text: 'text-amber-600 dark:text-amber-400',
    darkBadge: 'dark:bg-amber-900/40 dark:text-amber-300',
    darkBorder: '',
  },
  green: {
    border: 'border-l-green-500',
    bg: 'bg-green-50 dark:bg-green-950/30',
    badge: 'bg-green-100 text-green-700',
    dot: 'bg-green-400',
    text: 'text-green-600 dark:text-green-400',
    darkBadge: 'dark:bg-green-900/40 dark:text-green-300',
    darkBorder: '',
  },
  cyan: {
    border: 'border-l-cyan-500',
    bg: 'bg-cyan-50 dark:bg-cyan-950/30',
    badge: 'bg-cyan-100 text-cyan-700',
    dot: 'bg-cyan-400',
    text: 'text-cyan-600 dark:text-cyan-400',
    darkBadge: 'dark:bg-cyan-900/40 dark:text-cyan-300',
    darkBorder: '',
  },
  purple: {
    border: 'border-l-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    badge: 'bg-purple-100 text-purple-700',
    dot: 'bg-purple-400',
    text: 'text-purple-600 dark:text-purple-400',
    darkBadge: 'dark:bg-purple-900/40 dark:text-purple-300',
    darkBorder: '',
  },
};

const layerColorMap: Record<string, string> = {
  Application: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  Transport: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  Network: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  Presentation: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
};

function ProtocolCardComponent({ card, language }: { card: ProtocolCard; language: 'en' | 'zh' }) {
  const colors = colorMap[card.color] || colorMap.emerald;

  return (
    <div className={`rounded-xl border border-gray-200 dark:border-gray-700/60 border-l-4 ${colors.border} bg-white dark:bg-[#2f2f2f] p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
            {card.name}
          </h3>
          <p className={`text-sm ${colors.text} font-medium`}>
            {card.nameZh}
          </p>
        </div>
        {card.port && (
          <Badge variant="secondary" className="text-[11px] font-mono shrink-0 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-0">
            :{card.port}
          </Badge>
        )}
      </div>

      {/* Layer badge */}
      <Badge className={`text-[11px] border-0 mb-2.5 ${layerColorMap[card.layer] || 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
        {language === 'en' ? card.layer : card.layerZh}
      </Badge>

      {/* Description */}
      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2 mb-3">
        {language === 'en' ? card.description : card.descriptionZh}
      </p>

      {/* Key facts */}
      <div className="flex flex-wrap gap-1.5">
        {card.keyFacts.map((fact, i) => (
          <div
            key={i}
            className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] ${colors.badge} ${colors.darkBadge}`}
          >
            <span className="font-medium">{language === 'en' ? fact.label : fact.labelZh}:</span>
            <span className="opacity-80">{language === 'en' ? fact.value : fact.valueZh}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProtocolCards({ isOpen, onClose, language }: ProtocolCardsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredCards = useMemo(() => {
    let result = protocolCards;

    // Filter by layer
    if (activeFilter !== 'all') {
      result = result.filter((card) => card.layer === activeFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (card) =>
          card.name.toLowerCase().includes(query) ||
          card.nameZh.includes(query) ||
          card.description.toLowerCase().includes(query) ||
          card.descriptionZh.includes(query) ||
          card.layer.toLowerCase().includes(query)
      );
    }

    return result;
  }, [searchQuery, activeFilter]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-5 pt-5 pb-0 shrink-0">
          <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {language === 'en' ? 'Protocol Reference' : '協定參考'}
          </DialogTitle>
        </DialogHeader>

        {/* Search + Filters */}
        <div className="px-5 pt-3 pb-2 space-y-3 shrink-0">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === 'en' ? 'Search protocols...' : '搜尋協定...'
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

          {/* Filter tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {layerFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 touch-manipulation ${
                  activeFilter === filter.id
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {language === 'en' ? filter.label : filter.labelZh}
              </button>
            ))}
          </div>
        </div>

        {/* Cards grid */}
        <div className="flex-1 overflow-y-auto px-5 pb-5 scrollbar-thin">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredCards.map((card) => (
              <ProtocolCardComponent
                key={card.id}
                card={card}
                language={language}
              />
            ))}
          </div>

          {filteredCards.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="h-8 w-8 text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {language === 'en'
                  ? 'No protocols found matching your search.'
                  : '冇找到匹配的協定。'}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
