'use client';

import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LanguageToggleProps {
  language: 'en' | 'zh';
  onToggle: () => void;
}

export function LanguageToggle({ language, onToggle }: LanguageToggleProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onToggle}
      className="h-9 px-3 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 gap-1.5"
      aria-label={language === 'en' ? 'Switch to Chinese' : 'Switch to English'}
    >
      <Globe className="h-3.5 w-3.5" />
      {language === 'en' ? '中文' : 'EN'}
    </Button>
  );
}
