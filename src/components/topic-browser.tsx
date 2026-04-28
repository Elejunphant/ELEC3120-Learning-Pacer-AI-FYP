'use client';

import React from 'react';
import {
  X,
  Layers,
  ArrowUpDown,
  ShieldCheck,
  Link,
  Gauge,
  Globe,
  Play,
  Code,
  Lightbulb,
  ListChecks,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  knowledgeTopics,
  type KnowledgeTopic,
} from '@/lib/knowledge-base';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Layers,
  ArrowUpDown,
  ShieldCheck,
  Link,
  Gauge,
  Globe,
  Play,
  Code,
};

interface TopicBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'zh';
  onSelectTopic: (topic: KnowledgeTopic) => void;
}

export function TopicBrowser({
  isOpen,
  onClose,
  language,
  onSelectTopic,
}: TopicBrowserProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div className="relative w-full max-w-3xl max-h-[85vh] overflow-hidden z-10 flex flex-col rounded-2xl shadow-2xl border bg-white dark:bg-[#1a1a2e] dark:border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
              <Lightbulb className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white text-sm">
                {language === 'en'
                  ? 'ELEC3120 Knowledge Base'
                  : 'ELEC3120 知識庫'}
              </h2>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                {language === 'en'
                  ? `${knowledgeTopics.length} topics available`
                  : `${knowledgeTopics.length} 個主題可用`}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </Button>
        </div>

        {/* Topics Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {knowledgeTopics.map((topic) => {
              const Icon = iconMap[topic.icon] || Layers;
              const description =
                language === 'en' ? topic.description : topic.descriptionZh;
              const title = language === 'en' ? topic.title : topic.titleZh;

              return (
                <div
                  key={topic.id}
                  className="group relative rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 p-4 transition-all duration-200 hover:border-emerald-300 dark:hover:border-emerald-500/40 hover:shadow-md hover:shadow-emerald-500/5 dark:hover:bg-white/8 flex flex-col"
                >
                  {/* Icon + Title Row */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 transition-colors group-hover:bg-emerald-200 dark:group-hover:bg-emerald-500/30">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-snug">
                        {title}
                      </h3>
                      <div className="mt-1.5">
                        <Badge
                          variant="secondary"
                          className="text-[10px] font-medium gap-1 bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-0 px-2 py-0.5"
                        >
                          <ListChecks className="h-2.5 w-2.5" />
                          {topic.keyPoints.length}{' '}
                          {language === 'en' ? 'key points' : '個要點'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 mb-4 flex-1">
                    {description}
                  </p>

                  {/* Action Button */}
                  <Button
                    onClick={() => {
                      onSelectTopic(topic);
                      onClose();
                    }}
                    size="sm"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500/20 dark:hover:bg-emerald-500/30 text-white dark:text-emerald-400 border-0 dark:border dark:border-emerald-500/30 rounded-lg gap-2 h-8 text-xs font-medium transition-all duration-200"
                  >
                    {language === 'en' ? 'Ask about this topic' : '詢問呢個主題'}
                    <ArrowUpDown className="h-3 w-3" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
