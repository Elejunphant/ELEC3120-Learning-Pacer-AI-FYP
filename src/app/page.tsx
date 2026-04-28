'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatSidebar } from '@/components/chat-sidebar';
import { ChatMessages, type Message, type ChatMode } from '@/components/chat-messages';
import { ChatInput } from '@/components/chat-input';
import { WelcomeScreen } from '@/components/welcome-screen';
import { QuizPanel } from '@/components/quiz-panel';
import { TopicBrowser } from '@/components/topic-browser';
import { StatsPanel } from '@/components/stats-panel';
import { StudyPlanPanel } from '@/components/study-plan-panel';
import { LanguageToggle } from '@/components/language-toggle';
import { ThemeToggle } from '@/components/theme-toggle';
import { ConversationExport } from '@/components/conversation-export';
import { ShortcutsDialog } from '@/components/shortcuts-dialog';
import { ShortcutsTooltip } from '@/components/shortcuts-tooltip';
import { PinnedMessages } from '@/components/pinned-messages';
import { PomodoroTimer } from '@/components/pomodoro-timer';
import { StudySessionTracker } from '@/components/study-session-tracker';
import { MessageSearch } from '@/components/message-search';
import { QuickActions } from '@/components/quick-actions';
import { OnboardingTour } from '@/components/onboarding-tour';
import { MobileBottomNav } from '@/components/mobile-bottom-nav';
import { FlashcardPanel } from '@/components/flashcard-panel';
import { FormulaSheet } from '@/components/formula-sheet';
import { DailyTip } from '@/components/daily-tip';
import { ProtocolCards } from '@/components/protocol-cards';
import { GlossaryPanel } from '@/components/glossary-panel';
import { SubnetCalculator } from '@/components/subnet-calculator';
import { NetworkToolsPanel } from '@/components/network-tools-panel';
import { AISuggestions } from '@/components/ai-suggestions';
import { Scratchpad } from '@/components/scratchpad';
import { WordCloudPanel } from '@/components/word-cloud-panel';
import { StudyGoals } from '@/components/study-goals';
import { CheatsheetPanel } from '@/components/cheatsheet-panel';
import { ChatSummarizer } from '@/components/chat-summarizer';
import { FocusMode } from '@/components/focus-mode';
import { QuickReview } from '@/components/quick-review';
import type { KnowledgeTopic } from '@/lib/knowledge-base';
import type { ReactionsMap } from '@/components/emoji-reactions';
import type { CitationData } from '@/components/citation-card';
import { logStudyActivity } from '@/components/study-progress';

interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
  _count?: { messages: number };
}

export default function Home() {
  // Language — read from localStorage on first render to avoid useEffect setState.
  // One-time migration: any pre-existing user gets reset to English default.
  const [language, setLanguage] = useState<'en' | 'zh'>(() => {
    if (typeof window !== 'undefined') {
      if (localStorage.getItem('lp-lang-reset-v2') !== '1') {
        localStorage.setItem('lp-language', 'en');
        localStorage.setItem('lp-lang-reset-v2', '1');
        return 'en';
      }
      const stored = localStorage.getItem('lp-language');
      if (stored === 'zh' || stored === 'en') return stored;
    }
    return 'en';
  });
  // Persist language preference
  useEffect(() => {
    localStorage.setItem('lp-language', language);
  }, [language]);

  // Sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Chat mode (Tutor / Code / Image) — persisted in localStorage
  const [mode, setMode] = useState<ChatMode>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('lp-chat-mode');
      if (stored === 'tutor' || stored === 'code' || stored === 'image') return stored;
    }
    return 'tutor';
  });
  useEffect(() => {
    localStorage.setItem('lp-chat-mode', mode);
  }, [mode]);

  // Conversations
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  // Streaming control: `isStreaming` is a simple boolean toggle (React renders once: show/hide bubble).
  // The actual text is written DIRECTLY to the DOM via ref — zero React re-renders per token.
  const [isStreaming, setIsStreaming] = useState(false);
  const streamingTextRef = useRef<string>('');
  const abortRef = useRef<AbortController | null>(null);
  const messagesRef = useRef<Message[]>([]);

  // Panels
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizKey, setQuizKey] = useState(0);
  const [topicBrowserOpen, setTopicBrowserOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [studyPlanOpen, setStudyPlanOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [flashcardsOpen, setFlashcardsOpen] = useState(false);
  const [formulasOpen, setFormulasOpen] = useState(false);
  const [protocolsOpen, setProtocolsOpen] = useState(false);
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [subnetOpen, setSubnetOpen] = useState(false);
  const [networkToolsOpen, setNetworkToolsOpen] = useState(false);
  const [scratchpadOpen, setScratchpadOpen] = useState(false);
  const [wordCloudOpen, setWordCloudOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [goalsOpen, setGoalsOpen] = useState(false);
  const [cheatsheetOpen, setCheatsheetOpen] = useState(false);
  const [summarizerOpen, setSummarizerOpen] = useState(false);
  const [highlightMessageId, setHighlightMessageId] = useState<string | null>(null);
  const [focusMode, setFocusMode] = useState(false);
  // Pomodoro
  const [pomodoroOpen, setPomodoroOpen] = useState(false);
  const handleOpenPomodoro = useCallback(() => {
    setPomodoroOpen(true);
  }, []);

  const [pinnedIds, setPinnedIds] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('lp-pinned-ids');
        if (stored) return new Set(JSON.parse(stored));
      } catch {}
    }
    return new Set();
  });

  // Persist pinned IDs to localStorage
  useEffect(() => {
    localStorage.setItem('lp-pinned-ids', JSON.stringify([...pinnedIds]));
  }, [pinnedIds]);

  // Reactions state — stored in localStorage
  const [reactions, setReactions] = useState<ReactionsMap>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('lp-reactions');
        if (stored) return JSON.parse(stored) as ReactionsMap;
      } catch {}
    }
    return {};
  });

  // Persist reactions to localStorage
  useEffect(() => {
    localStorage.setItem('lp-reactions', JSON.stringify(reactions));
  }, [reactions]);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/conversations');
      const data = await res.json();
      setConversations(data);
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Create new conversation
  const createConversation = useCallback(
    async (firstMessage?: string): Promise<string | null> => {
      try {
        const res = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: firstMessage
              ? firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : '')
              : language === 'en'
                ? 'New Chat'
                : '新對話',
          }),
        });
        const data = await res.json();
        setActiveConversationId(data.id);
        setMessages([]);
        messagesRef.current = [];
        await fetchConversations();
        return data.id;
      } catch {
        return null;
      }
    },
    [language, fetchConversations]
  );

  // Load conversation messages
  const loadConversation = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/conversations/${id}`);
      if (res.ok) {
        const data = await res.json();
        const loaded: Message[] = data.messages.map(
          (m: { id: string; role: string; content: string; hasImage: boolean; hasPdf: boolean; imageData?: string; citations?: string; createdAt: string }) => {
            let parsedCitations: CitationData[] | undefined;
            if (m.citations) {
              try {
                parsedCitations = JSON.parse(m.citations);
              } catch {
                // ignore invalid JSON
              }
            }
            return {
              id: m.id,
              role: m.role as 'user' | 'assistant',
              content: m.content,
              hasImage: m.hasImage,
              hasPdf: m.hasPdf,
              imageData: m.imageData || undefined,
              citations: parsedCitations,
              createdAt: m.createdAt,
            };
          }
        );
        setMessages(loaded);
        messagesRef.current = loaded;
      }
    } catch {
      // silently fail
    }
  }, []);

  // Select conversation
  const handleSelectConversation = useCallback(
    (id: string) => {
      setActiveConversationId(id);
      loadConversation(id);
    },
    [loadConversation]
  );

  // Delete conversation
  const handleDeleteConversation = useCallback(
    async (id: string) => {
      try {
        await fetch(`/api/conversations/${id}`, { method: 'DELETE' });
        if (activeConversationId === id) {
          setActiveConversationId(null);
          setMessages([]);
          messagesRef.current = [];
        }
        await fetchConversations();
      } catch {
        // silently fail
      }
    },
    [activeConversationId, fetchConversations]
  );

  // Rename conversation
  const handleRenameConversation = useCallback(
    async (id: string, newTitle: string): Promise<boolean> => {
      try {
        const res = await fetch(`/api/conversations/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: newTitle }),
        });
        if (res.ok) {
          await fetchConversations();
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    [fetchConversations]
  );

  // Send message
  const handleSendMessage = useCallback(
    async (content: string, hasImage: boolean = false, hasPdf: boolean = false, imageData?: string | null, pdfData?: string | null, pdfFileName?: string) => {
      // Single-flight guard: ignore new sends while a request is still in-flight.
      // Prevents two simultaneous streams from clobbering shared refs/state.
      if (abortRef.current) return;
      let convId = activeConversationId;

      if (!convId) {
        convId = await createConversation(content);
        if (!convId) return;
      }

      const now = new Date().toISOString();

      // Add user message to UI immediately
      const userMsg: Message = {
        id: `temp-${Date.now()}`,
        role: 'user',
        content,
        hasImage,
        hasPdf,
        imageData: imageData || undefined,
        createdAt: now,
      };
      const updatedMessages = [...messagesRef.current, userMsg];
      setMessages(updatedMessages);
      messagesRef.current = updatedMessages;
      setIsStreaming(false);
      streamingTextRef.current = '';

      // Log chat activity for study progress
      logStudyActivity('chat');

      // Show the "thinking" indicator immediately
      setIsWaiting(true);

      // Prepare the assistant message ID now (content added on first chunk)
      const assistantId = `streaming-${Date.now()}`;
      const assistantCreatedAt = new Date(Date.now() + 1).toISOString();

      // New abort controller for this request
      const ac = new AbortController();
      abortRef.current = ac;

      try {
        // If image is attached, use vision API
        let res: Response;
        if (hasImage && imageData) {
          res = await fetch('/api/chat/vision', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageData,
              message: content,
              language,
              conversationId: convId,
            }),
            signal: ac.signal,
          });
        } else if (hasPdf && pdfData) {
          res = await fetch('/api/chat/pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileData: pdfData,
              fileName: pdfFileName || 'document.pdf',
              textPrompt: content,
              language,
              conversationId: convId,
            }),
            signal: ac.signal,
          });
        } else {
          const endpoint = mode === 'image' ? '/api/chat/image' : '/api/chat';
          res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: updatedMessages
                .filter((m) => m.id.startsWith('temp-') || m.role === 'user')
                .map((m) => ({ role: m.role, content: m.content })),
              conversationId: convId,
              mode,
            }),
            signal: ac.signal,
          });
        }

        if (!res.ok || !res.body) {
          throw new Error('Stream failed');
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let fullContent = '';
        let firstChunkReceived = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullContent += decoder.decode(value, { stream: true });

          if (!firstChunkReceived) {
            firstChunkReceived = true;
            setIsWaiting(false);
            setIsLoading(true);
            setIsStreaming(true);
          }

          // Write directly to ref — no React re-render, no setState, just data.
          streamingTextRef.current = fullContent;
        }

        // Finalize: move streaming text into the messages array
        setIsStreaming(false);
        streamingTextRef.current = '';
        const finalized: Message[] = [
          ...updatedMessages,
          {
            id: assistantId,
            role: 'assistant',
            content: fullContent,
            createdAt: assistantCreatedAt,
          },
        ];
        setMessages(finalized);
        messagesRef.current = finalized;
      } catch (err) {
        // If the user pressed Stop, keep whatever was streamed so far.
        const aborted =
          (err instanceof DOMException && err.name === 'AbortError') ||
          ac.signal.aborted;
        const partial = streamingTextRef.current;

        if (aborted) {
          const stopNote = language === 'en' ? '\n\n_[Stopped]_' : '\n\n_[已停止]_';
          const finalContent = (partial && partial.trim().length > 0)
            ? partial + stopNote
            : (language === 'en' ? '_[Stopped]_' : '_[已停止]_');
          const finalized: Message[] = [
            ...updatedMessages,
            {
              id: assistantId,
              role: 'assistant',
              content: finalContent,
              createdAt: assistantCreatedAt,
            },
          ];
          setMessages(finalized);
          messagesRef.current = finalized;
        } else {
          const errorMessages: Message[] = [
            ...updatedMessages,
            {
              id: assistantId,
              role: 'assistant',
              content:
                language === 'en'
                  ? 'Sorry, I encountered an error. Please try again.'
                  : '抱歉，我遇到咗一啲錯誤，請再試多次。',
              createdAt: assistantCreatedAt,
            },
          ];
          setMessages(errorMessages);
          messagesRef.current = errorMessages;
        }
      } finally {
        // Ownership-safe cleanup: only clear shared state if we still own the
        // in-flight slot (defensive — single-flight guard above should prevent overlap).
        if (abortRef.current === ac) {
          setIsStreaming(false);
          streamingTextRef.current = '';
          setIsWaiting(false);
          setIsLoading(false);
          abortRef.current = null;
        }
        fetchConversations();
      }
    },
    [activeConversationId, createConversation, language, fetchConversations, mode]
  );

  // Stop the current streaming AI response (Poe-style stop button)
  const handleStop = useCallback(() => {
    const ac = abortRef.current;
    if (ac && !ac.signal.aborted) {
      ac.abort();
    }
  }, []);

  // Handle regenerate response
  const handleRegenerate = useCallback(
    async (messageId: string) => {
      if (isLoading || isWaiting) return;

      // Find the index of the assistant message to regenerate
      const msgIndex = messagesRef.current.findIndex((m) => m.id === messageId);
      if (msgIndex === -1 || messagesRef.current[msgIndex].role !== 'assistant') return;

      // Find the preceding user message and preserve its attachments
      let userContent = '';
      let prevHasImage = false;
      let prevHasPdf = false;
      let prevImageData: string | undefined;
      for (let i = msgIndex - 1; i >= 0; i--) {
        const m = messagesRef.current[i];
        if (m.role === 'user') {
          userContent = m.content;
          prevHasImage = !!m.hasImage;
          prevHasPdf = !!m.hasPdf;
          prevImageData = m.imageData;
          break;
        }
      }
      if (!userContent && !prevHasImage && !prevHasPdf) return;

      // Trim messages up to and including the assistant message to regenerate
      const trimmedMessages = messagesRef.current.slice(0, msgIndex);
      setMessages(trimmedMessages);
      messagesRef.current = trimmedMessages;

      // Re-send the user message, preserving the original image attachment
      // (PDF attachments cannot be re-sent because the raw base64 isn't kept
      // on the message object after upload — falls back to text-only regen).
      await handleSendMessage(
        userContent,
        prevHasImage && !!prevImageData,
        false,
        prevImageData || null,
      );
    },
    [isLoading, handleSendMessage]
  );

  // Handle new chat from sidebar
  const handleNewChat = useCallback(() => {
    setActiveConversationId(null);
    setMessages([]);
    messagesRef.current = [];
    setSidebarOpen(false);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case '/':
            e.preventDefault();
            setShortcutsOpen((prev) => !prev);
            break;
          case 'n':
            e.preventDefault();
            handleNewChat();
            break;
          case 'k':
            e.preventDefault();
            setSidebarOpen(true);
            break;
          case 'b':
            e.preventDefault();
            setTopicBrowserOpen(true);
            break;
          case 'q':
            e.preventDefault();
            setQuizKey((k) => k + 1);
            setQuizOpen(true);
            break;
          case 's':
            e.preventDefault();
            setStatsOpen(true);
            break;
          case 'h':
            e.preventDefault();
            setSearchOpen(true);
            break;
          case 'f':
            e.preventDefault();
            setFormulasOpen(true);
            break;
          case 'p':
            e.preventDefault();
            setProtocolsOpen(true);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNewChat]);

  // Handle topic selection
  const handleSelectTopic = useCallback(
    async (topic: KnowledgeTopic) => {
      const content = language === 'en' ? topic.title : topic.titleZh;

      let convId = activeConversationId;
      if (!convId) {
        convId = await createConversation(content);
        if (!convId) return;
      }

      const now = new Date().toISOString();
      const userMsg: Message = {
        id: `temp-${Date.now()}`,
        role: 'user',
        content: `Tell me about ${content}`,
        createdAt: now,
      };

      // Build detailed response
      const responseContent = `**${topic.title}** / ${topic.titleZh}\n\n${
        language === 'en' ? topic.description : topic.descriptionZh
      }\n\n**${language === 'en' ? 'Key Points' : '關鍵要點'}:**\n\n${topic.keyPoints
        .map(
          (kp, i) =>
            `${i + 1}. **${language === 'en' ? kp.point : kp.pointZh}**\n   ${language === 'en' ? kp.detail : kp.detailZh}`
        )
        .join('\n\n')}`;

      const assistantMsg: Message = {
        id: `topic-${Date.now()}`,
        role: 'assistant',
        content: responseContent,
        createdAt: new Date(Date.now() + 1).toISOString(),
      };

      const updatedMessages = [...messagesRef.current, userMsg, assistantMsg];
      setMessages(updatedMessages);
      messagesRef.current = updatedMessages;

      fetchConversations();
    },
    [activeConversationId, createConversation, language, fetchConversations]
  );

  const handleOpenStats = useCallback(() => {
    setStatsOpen(true);
  }, []);

  const handleOpenStudyPlan = useCallback(() => {
    setStudyPlanOpen(true);
  }, []);

  const handleOpenFlashcards = useCallback(() => {
    setFlashcardsOpen(true);
  }, []);

  const handleOpenFormulas = useCallback(() => {
    setFormulasOpen(true);
  }, []);

  const handleOpenScratchpad = useCallback(() => {
    setScratchpadOpen(true);
  }, []);

  const handleOpenGoals = useCallback(() => {
    setGoalsOpen(true);
  }, []);

  const handleOpenCheatsheet = useCallback(() => {
    setCheatsheetOpen(true);
  }, []);

  const handleOpenSummarizer = useCallback(() => {
    setSummarizerOpen(true);
  }, []);

  // Handle delete all conversations
  const handleDeleteAllConversations = useCallback(async () => {
    try {
      await fetch('/api/conversations', { method: 'DELETE' });
      setActiveConversationId(null);
      setMessages([]);
      messagesRef.current = [];
      await fetchConversations();
    } catch {
      // silently fail
    }
  }, [fetchConversations]);

  // Handle toggle reaction
  const handleToggleReaction = useCallback((messageId: string, emoji: string) => {
    setReactions((prev) => {
      const next = { ...prev };
      const msgReactions = { ...(next[messageId] || {}) };

      if (msgReactions[emoji] && msgReactions[emoji] > 0) {
        msgReactions[emoji] -= 1;
        if (msgReactions[emoji] <= 0) {
          delete msgReactions[emoji];
        }
      } else {
        msgReactions[emoji] = (msgReactions[emoji] || 0) + 1;
      }

      if (Object.keys(msgReactions).length > 0) {
        next[messageId] = msgReactions;
      } else {
        delete next[messageId];
      }

      return next;
    });
  }, []);

  // Handle toggle pin
  const handleTogglePin = useCallback((id: string) => {
    setPinnedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Handle remove pin
  const handleRemovePin = useCallback((id: string) => {
    setPinnedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  return (
    <div className={`h-screen flex overflow-hidden transition-all duration-300 ${focusMode ? 'bg-white dark:bg-[#1a1a1a]' : 'bg-white dark:bg-[#1a1a1a]'}`}>
      {/* Sidebar — hidden in focus mode */}
      {!focusMode && (
        <ChatSidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          onNewChat={handleNewChat}
          onDeleteConversation={handleDeleteConversation}
          onRenameConversation={handleRenameConversation}
          onSelectTopic={handleSelectTopic}
          onOpenQuiz={() => {
            setQuizKey((k) => k + 1);
            setQuizOpen(true);
          }}
          onOpenFlashcards={handleOpenFlashcards}
          onOpenPomodoro={handleOpenPomodoro}
          onOpenStats={handleOpenStats}
          onOpenStudyPlan={handleOpenStudyPlan}
          onOpenFormulas={handleOpenFormulas}
          onOpenProtocols={() => setProtocolsOpen(true)}
          onOpenGlossary={() => setGlossaryOpen(true)}
          onOpenSubnetCalc={() => setSubnetOpen(true)}
          onOpenNetworkTools={() => setNetworkToolsOpen(true)}
          onOpenScratchpad={handleOpenScratchpad}
          onOpenGoals={handleOpenGoals}
          onOpenCheatsheet={handleOpenCheatsheet}
          onDeleteAllConversations={handleDeleteAllConversations}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          language={language}
        />
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen subtle-bg-gradient">
        {/* Header — Poe style: minimal, clean */}
        <header className="shrink-0 flex items-center justify-between px-3 sm:px-4 py-2.5 border-b border-gray-100 dark:border-white/[0.06] bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-md">
          <div className="flex items-center gap-2 min-w-0">
            {/* Mobile: labelled "History" button with conversation count badge */}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden inline-flex items-center gap-1.5 h-9 pl-2 pr-2.5 rounded-lg border border-gray-200/80 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 active:scale-[0.97] transition-all touch-manipulation shrink-0"
              aria-label={language === 'en' ? 'Open chat history' : '打開對話歷史'}
            >
              <Menu className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              <span className="text-[12px] font-medium text-gray-700 dark:text-gray-200">
                {language === 'en' ? 'History' : '歷史'}
              </span>
              {conversations.length > 0 && (
                <span className="ml-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-500 text-white text-[10px] font-semibold leading-none">
                  {conversations.length > 99 ? '99+' : conversations.length}
                </span>
              )}
            </button>
            {activeConversationId && (
              <h1 className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate max-w-[160px] sm:max-w-[400px]" title={conversations.find((c) => c.id === activeConversationId)?.title || ''}>
                {conversations.find((c) => c.id === activeConversationId)?.title ||
                  (language === 'en' ? 'Chat' : '對話')}
              </h1>
            )}
          </div>

          <div className="flex items-center gap-1">
            <ShortcutsTooltip language={language} />
            {activeConversationId && messages.length > 0 && (
              <ConversationExport
                messages={messages}
                title={
                  conversations.find((c) => c.id === activeConversationId)?.title ||
                  (language === 'en' ? 'Chat' : '對話')
                }
                language={language}
              />
            )}
            <QuickActions
              language={language}
              onAction={(action) => {
                switch (action) {
                  case 'new-chat':
                    handleNewChat();
                    break;
                  case 'topics':
                    setTopicBrowserOpen(true);
                    break;
                  case 'quiz':
                    setQuizKey((k) => k + 1);
                    setQuizOpen(true);
                    break;
                  case 'stats':
                    setStatsOpen(true);
                    break;
                  case 'study-plan':
                    setStudyPlanOpen(true);
                    break;
                  case 'shortcuts':
                    setShortcutsOpen(true);
                    break;
                  case 'search':
                    setSearchOpen(true);
                    break;
                  case 'protocols':
                    setProtocolsOpen(true);
                    break;
                  case 'word-cloud':
                    setWordCloudOpen(true);
                    break;
                  case 'summarize':
                    setSummarizerOpen(true);
                    break;
                }
              }}
              hasMessages={messages.length > 0}
            />
            <LanguageToggle
              language={language}
              onToggle={() => setLanguage((l) => (l === 'en' ? 'zh' : 'en'))}
            />
            <ThemeToggle />
            <FocusMode language={language} onFocusChange={setFocusMode} />
          </div>
        </header>

        {/* Content area */}
        {activeConversationId || messages.length > 0 ? (
          <>
            {activeConversationId && (
              <DailyTip language={language} />
            )}
            <ChatMessages
              messages={messages}
              isStreaming={isStreaming}
              streamingTextRef={streamingTextRef}
              isLoading={isLoading}
              isWaiting={isWaiting}
              language={language}
              onRegenerate={handleRegenerate}
              onQuickReply={handleSendMessage}
              pinnedIds={pinnedIds}
              onTogglePin={handleTogglePin}
              highlightMessageId={highlightMessageId ?? undefined}
              reactions={reactions}
              onToggleReaction={handleToggleReaction}
            />
            <ChatInput
              onSend={handleSendMessage}
              onStop={handleStop}
              isLoading={isLoading || isWaiting}
              language={language}
              mode={mode}
              onModeChange={setMode}
            />
          </>
        ) : (
          <>
            <WelcomeScreen
              language={language}
              onSendMessage={handleSendMessage}
              onOpenQuiz={() => {
                setQuizKey((k) => k + 1);
                setQuizOpen(true);
              }}
              onOpenFlashcards={() => setFlashcardsOpen(true)}
              onOpenPomodoro={() => setPomodoroOpen(true)}
              onOpenTopics={() => setTopicBrowserOpen(true)}
              onOpenStats={handleOpenStats}
              onFocusChat={() => {
                const el = document.querySelector<HTMLTextAreaElement>(
                  'textarea[data-chat-input], textarea'
                );
                el?.focus();
              }}
            />
            <ChatInput
              onSend={handleSendMessage}
              isLoading={isLoading || isWaiting}
              language={language}
              mode={mode}
              onModeChange={setMode}
            />
          </>
        )}
      </main>

      {/* All dialog panels */}
      <QuizPanel
        key={quizKey}
        isOpen={quizOpen}
        onClose={() => setQuizOpen(false)}
        language={language}
        quizKey={quizKey}
        onOpenStats={handleOpenStats}
      />
      <TopicBrowser
        isOpen={topicBrowserOpen}
        onClose={() => setTopicBrowserOpen(false)}
        language={language}
        onSelectTopic={handleSelectTopic}
      />
      <StatsPanel
        isOpen={statsOpen}
        onClose={() => setStatsOpen(false)}
        language={language}
        onOpenStudyPlan={handleOpenStudyPlan}
      />
      <StudyPlanPanel
        isOpen={studyPlanOpen}
        onClose={() => setStudyPlanOpen(false)}
        language={language}
      />
      <MessageSearch
        isOpen={searchOpen}
        onClose={() => {
          setSearchOpen(false);
        }}
        messages={messages}
        language={language}
        onJumpToMessage={(msgId) => {
          setHighlightMessageId(msgId);
          setSearchOpen(false);
          setTimeout(() => setHighlightMessageId(null), 2000);
        }}
        onSelectConversation={handleSelectConversation}
      />
      <ShortcutsDialog
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
        language={language}
      />
      {messages.length > 0 && (
        <AISuggestions
          messages={messages}
          language={language}
          onSendMessage={handleSendMessage}
          isLoading={isLoading || isWaiting}
        />
      )}
      {messages.length > 0 && (
        <PinnedMessages
          messages={messages}
          pinnedIds={pinnedIds}
          onTogglePin={handleTogglePin}
          onRemovePin={handleRemovePin}
          language={language}
        />
      )}
      {!focusMode && <PomodoroTimer language={language} defaultOpen={pomodoroOpen} />}
      {!focusMode && <StudySessionTracker language={language} />}
      <FlashcardPanel
        isOpen={flashcardsOpen}
        onClose={() => setFlashcardsOpen(false)}
        language={language}
      />
      <FormulaSheet
        isOpen={formulasOpen}
        onClose={() => setFormulasOpen(false)}
        language={language}
      />
      <ProtocolCards
        isOpen={protocolsOpen}
        onClose={() => setProtocolsOpen(false)}
        language={language}
      />
      <GlossaryPanel
        isOpen={glossaryOpen}
        onClose={() => setGlossaryOpen(false)}
        language={language}
      />
      <SubnetCalculator
        isOpen={subnetOpen}
        onClose={() => setSubnetOpen(false)}
        language={language}
      />
      <NetworkToolsPanel
        isOpen={networkToolsOpen}
        onClose={() => setNetworkToolsOpen(false)}
        language={language}
      />
      <Scratchpad
        isOpen={scratchpadOpen}
        onClose={() => setScratchpadOpen(false)}
        language={language}
        onSendMessage={handleSendMessage}
      />
      <WordCloudPanel
        isOpen={wordCloudOpen}
        onClose={() => setWordCloudOpen(false)}
        language={language}
        messages={messages}
        onWordClick={(word) => handleSendMessage(word)}
      />
      <StudyGoals
        isOpen={goalsOpen}
        onClose={() => setGoalsOpen(false)}
        language={language}
      />
      <CheatsheetPanel
        isOpen={cheatsheetOpen}
        onClose={() => setCheatsheetOpen(false)}
        language={language}
      />
      <ChatSummarizer
        isOpen={summarizerOpen}
        onClose={() => setSummarizerOpen(false)}
        messages={messages}
        language={language}
        onSendMessage={handleSendMessage}
      />
      <OnboardingTour />

      {/* Quick Topic Review — floating button */}
      <QuickReview language={language} />

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        language={language}
        activeView={quizOpen ? 'quiz' : flashcardsOpen ? 'flashcards' : searchOpen ? 'search' : 'chat'}
        onViewChange={(view) => {
          switch (view) {
            case 'chat':
              break;
            case 'quiz':
              setQuizKey((k) => k + 1);
              setQuizOpen(true);
              break;
            case 'flashcards':
              setFlashcardsOpen(true);
              break;
            case 'search':
              setSearchOpen(true);
              break;
            case 'more':
              setSidebarOpen(true);
              break;
          }
        }}
      />
    </div>
  );
}
