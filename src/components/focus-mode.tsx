'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Minimize2, Maximize2, Eye, EyeOff } from 'lucide-react';

interface FocusModeProps {
  language: 'en' | 'zh';
  onFocusChange?: (isFocus: boolean) => void;
  children: React.ReactNode;
}

export function FocusMode({ language, onFocusChange, children }: FocusModeProps) {
  const [isFocus, setIsFocus] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const toggleFocus = useCallback(() => {
    setIsFocus((prev) => {
      const next = !prev;
      onFocusChange?.(next);
      // Show brief toast notification
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
      return next;
    });
  }, [onFocusChange]);

  // Keyboard shortcut: Escape to exit focus mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFocus) {
        toggleFocus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocus, toggleFocus]);

  return (
    <>
      {/* Focus toggle button — in header area */}
      <button
        onClick={toggleFocus}
        className={`relative flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-medium transition-all duration-200 touch-manipulation ${
          isFocus
            ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/60'
            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-700 dark:hover:text-gray-200'
        }`}
        title={
          isFocus
            ? (language === 'en' ? 'Exit Focus Mode (Esc)' : '退出專注模式 (Esc)')
            : (language === 'en' ? 'Enter Focus Mode' : '進入專注模式')
        }
        aria-label={
          isFocus
            ? (language === 'en' ? 'Exit Focus Mode' : '退出專注模式')
            : (language === 'en' ? 'Enter Focus Mode' : '進入專注模式')
        }
      >
        {isFocus ? (
          <>
            <EyeOff className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{language === 'en' ? 'Focus' : '專注'}</span>
          </>
        ) : (
          <>
            <Eye className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{language === 'en' ? 'Focus' : '專注'}</span>
          </>
        )}
        {/* Active indicator dot */}
        {isFocus && (
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 animate-online-pulse" />
        )}
      </button>

      {/* Toast notification */}
      {showToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[100] animate-slideDown">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg backdrop-blur-xl border ${
            isFocus
              ? 'bg-emerald-50/90 dark:bg-emerald-950/90 border-emerald-200/60 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300'
              : 'bg-gray-50/90 dark:bg-gray-900/90 border-gray-200/60 dark:border-gray-700/40 text-gray-700 dark:text-gray-300'
          }`}>
            {isFocus ? (
              <EyeOff className="h-3.5 w-3.5" />
            ) : (
              <Eye className="h-3.5 w-3.5" />
            )}
            <span className="text-xs font-medium">
              {isFocus
                ? (language === 'en' ? 'Focus Mode ON — Press Esc to exit' : '專注模式已開啓 — 按 Esc 退出')
                : (language === 'en' ? 'Focus Mode OFF' : '專注模式已關閉')
              }
            </span>
          </div>
        </div>
      )}

      {/* Children (the main app) wrapped with focus mode context */}
      {children}
    </>
  );
}

// Export a hook to use focus mode state in child components
export function useFocusMode() {
  // This is a simple implementation — in a real app, you'd use context
  // For now, we check the DOM for the focus mode indicator
  const [isFocus, setIsFocus] = useState(false);
  
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const focusBtn = document.querySelector('[aria-label*="Focus"]');
      if (focusBtn) {
        const isActive = focusBtn.closest('button')?.classList.contains('bg-emerald-100') ||
          focusBtn.closest('button')?.classList.contains('bg-emerald-900');
        setIsFocus(!!isActive);
      }
    });
    
    const headerEl = document.querySelector('header');
    if (headerEl) {
      observer.observe(headerEl, { attributes: true, subtree: true, attributeFilter: ['class'] });
    }
    
    return () => observer.disconnect();
  }, []);
  
  return isFocus;
}
