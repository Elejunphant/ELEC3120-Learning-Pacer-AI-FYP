'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Send,
  Square,
  Image as ImageIcon,
  FileText,
  X,
  Loader2,
  Upload,
  Paperclip,
  Mic,
  MicOff,
  GraduationCap,
  Sparkles,
  Lightbulb,
  Calculator,
  Sigma,
  Target,
  BookOpen,
  Code2,
  Wand2,
} from 'lucide-react';
import type { ChatMode } from '@/components/chat-messages';
import { useToast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ChatInputProps {
  onSend: (message: string, hasImage: boolean, hasPdf: boolean, imageData?: string | null, pdfData?: string | null, pdfFileName?: string) => void;
  onStop?: () => void;
  isLoading: boolean;
  language: 'en' | 'zh';
  mode?: ChatMode;
  onModeChange?: (mode: ChatMode) => void;
}

const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

function getSupportedMimeType(): string | null {
  if (typeof window === 'undefined') return null;
  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4',
    'audio/wav',
  ];
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return null;
}

function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
  return (bytes / 1024).toFixed(1) + ' KB';
}

const quickActions = [
  {
    icon: GraduationCap,
    label: { en: 'Lecture Quiz', zh: '出測驗題' },
    prompt: {
      en: 'Generate 5 multiple-choice questions strictly based on ELEC3120 lecture content (cite which lecture each question comes from). Include detailed explanations.',
      zh: '請根據 ELEC3120 lecture 內容出 5 條選擇題，範圍隨機抽（L01–L18），每題要標明出自邊份 lecture，並附詳細解釋。',
    },
  },
  {
    icon: Sparkles,
    label: { en: 'Key Points', zh: '重點總結' },
    prompt: {
      en: 'Summarize the key exam points from ELEC3120, organized by layer: Application (L02–L03), Transport (L05–L09), Network (L10–L14), Link (L13, L15), Wireless (L16), Advanced (L17–L18).',
      zh: '請幫我總結 ELEC3120 考試重點，按層次整理：Application（L02–L03）、Transport（L05–L09）、Network（L10–L14）、Link（L13, L15）、Wireless（L16）、Advanced（L17–L18）。',
    },
  },
  {
    icon: Lightbulb,
    label: { en: 'Plain Explain', zh: '白話解釋' },
    prompt: {
      en: 'Pick a core ELEC3120 concept and explain it in plain language using Prof Meng\'s style of real-life analogies (e.g. Jimmy/mooncake for distance vector).',
      zh: '揀一個 ELEC3120 核心概念，用 Prof Meng 嘅生活化 analogy（例如 Jimmy 送 mooncake 解釋 distance vector）白話咁解釋俾我聽。',
    },
  },
  {
    icon: Sigma,
    label: { en: 'Key Formulas', zh: '必記公式' },
    prompt: {
      en: 'List all key formulas I need to memorize for ELEC3120 exam: throughput, RTT, cwnd growth (Tahoe/Reno), goodput, subnet mask/CIDR, queueing (Little\'s Law). For each, show when to apply it.',
      zh: '列出 ELEC3120 考試必記嘅公式：throughput、RTT、cwnd 增長（Tahoe/Reno）、goodput、subnet mask/CIDR、queueing（Little\'s Law）等。每條公式要講應用場景。',
    },
  },
  {
    icon: Target,
    label: { en: 'Exam Focus', zh: '考試熱點' },
    prompt: {
      en: 'Based on ELEC3120 lecture content, which topics are most likely to appear on the final exam? Rank them and explain why.',
      zh: '根據 ELEC3120 lecture 內容，final exam 最有可能考邊啲 topic？幫我排優先次序，並解釋點解。',
    },
  },
  {
    icon: Calculator,
    label: { en: 'Worked Example', zh: '例題演算' },
    prompt: {
      en: 'Give me one worked example with step-by-step calculation from ELEC3120 (e.g. TCP cwnd evolution, BGP route selection, subnetting, or Distance Vector convergence).',
      zh: '俾一題 ELEC3120 例題，逐步示範計算過程（例如 TCP cwnd 演變、BGP 選路、subnet 劃分、Distance Vector 收斂等）。',
    },
  },
];

const MODE_OPTIONS: Array<{ value: ChatMode; icon: typeof BookOpen; label: { en: string; zh: string }; placeholder: { en: string; zh: string } }> = [
  {
    value: 'tutor',
    icon: BookOpen,
    label: { en: 'Tutor', zh: '導師' },
    placeholder: { en: 'Ask about ELEC3120…', zh: '問 ELEC3120 lecture 內容…' },
  },
  {
    value: 'code',
    icon: Code2,
    label: { en: 'Code', zh: '程式' },
    placeholder: { en: 'Paste code or ask programming questions…', zh: '貼 code 或問程式問題…' },
  },
  {
    value: 'image',
    icon: Wand2,
    label: { en: 'Image', zh: '繪圖' },
    placeholder: {
      en: 'Describe an image — I will explain it in detail',
      zh: '描述一張圖 — 我會用文字詳細形容',
    },
  },
];

export function ChatInput({ onSend, onStop, isLoading, language, mode = 'tutor', onModeChange }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [attachedPdf, setAttachedPdf] = useState<{ name: string; data: string; size: number } | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isRecordingError, setIsRecordingError] = useState(false);
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // Reset height when message is cleared
  useEffect(() => {
    if (!message && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [message]);

  const handleSend = useCallback(() => {
    const trimmed = message.trim();
    if (!trimmed && !attachedImage && !attachedPdf) return;
    if (isLoading) return;

    onSend(
      trimmed || (attachedPdf
        ? (language === 'en' ? `Uploaded file: ${attachedPdf.name}` : `上傳咗檔案：${attachedPdf.name}`)
        : (language === 'en' ? 'Uploaded a file' : '上傳咗一個檔案')
      ),
      !!attachedImage,
      !!attachedPdf,
      attachedImage,
      attachedPdf?.data || null,
      attachedPdf?.name
    );
    setMessage('');
    setAttachedImage(null);
    setAttachedPdf(null);
  }, [message, attachedImage, attachedPdf, isLoading, onSend, language]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > MAX_IMAGE_SIZE) {
        toast({
          title: language === 'en' ? 'File too large' : '檔案過大',
          description: language === 'en'
            ? `Image must be under ${MAX_IMAGE_SIZE / 1024 / 1024}MB`
            : `圖片唔可以超過 ${MAX_IMAGE_SIZE / 1024 / 1024}MB`,
          variant: 'destructive',
        });
        if (imageInputRef.current) imageInputRef.current.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = () => setAttachedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // If user picks an image via the file picker, route it to the image flow.
      if (file.type.startsWith('image/')) {
        if (file.size > MAX_IMAGE_SIZE) {
          toast({
            title: language === 'en' ? 'File too large' : '檔案過大',
            description: language === 'en'
              ? `Image must be under ${MAX_IMAGE_SIZE / 1024 / 1024}MB`
              : `圖片唔可以超過 ${MAX_IMAGE_SIZE / 1024 / 1024}MB`,
            variant: 'destructive',
          });
        } else {
          const reader = new FileReader();
          reader.onload = () => setAttachedImage(reader.result as string);
          reader.readAsDataURL(file);
        }
        if (pdfInputRef.current) pdfInputRef.current.value = '';
        return;
      }

      if (file.size > MAX_PDF_SIZE) {
        toast({
          title: language === 'en' ? 'File too large' : '檔案過大',
          description: language === 'en'
            ? 'Maximum file size is 10MB.'
            : '最大檔案大小為 10MB。',
          variant: 'destructive',
        });
        if (pdfInputRef.current) pdfInputRef.current.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const dataUri = reader.result as string;
        const base64 = dataUri.split(',')[1] || '';
        setAttachedPdf({ name: file.name, data: base64, size: file.size });
      };
      reader.readAsDataURL(file);
    }
    if (pdfInputRef.current) pdfInputRef.current.value = '';
  };

  const processDroppedFile = useCallback((file: File) => {
    if (file.type.startsWith('image/')) {
      if (file.size > MAX_IMAGE_SIZE) {
        toast({
          title: language === 'en' ? 'File too large' : '檔案過大',
          description: language === 'en'
            ? `Image must be under ${MAX_IMAGE_SIZE / 1024 / 1024}MB`
            : `圖片唔可以超過 ${MAX_IMAGE_SIZE / 1024 / 1024}MB`,
          variant: 'destructive',
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = () => setAttachedImage(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      // Any other file type — PDF, DOCX, PPTX, text, code, csv, json…
      if (file.size > MAX_PDF_SIZE) {
        toast({
          title: language === 'en' ? 'File too large' : '檔案過大',
          description: language === 'en'
            ? 'Maximum file size is 10MB.'
            : '最大檔案大小為 10MB。',
          variant: 'destructive',
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const dataUri = reader.result as string;
        const base64 = dataUri.split(',')[1] || '';
        setAttachedPdf({ name: file.name, data: base64, size: file.size });
      };
      reader.readAsDataURL(file);
    }
  }, [language, toast]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processDroppedFile(file);
    }
  }, [processDroppedFile]);

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);
    const el = e.target;
    el.style.height = 'auto';
    // Allow the input to grow up to ~45% of the viewport (capped at 360px)
    // so multi-line questions stay fully visible.
    const cap = Math.min(360, Math.floor(window.innerHeight * 0.45));
    el.style.height = Math.min(el.scrollHeight, cap) + 'px';
  };

  const canSend = message.trim() || attachedImage || attachedPdf;
  const speechSupported = typeof window !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;

  // Cleanup media recorder on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop();
        } catch {}
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // Toggle voice recording
  const handleToggleRecording = useCallback(async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedMimeType();

      if (!mimeType) {
        stream.getTracks().forEach(t => t.stop());
        toast({
          title: language === 'en' ? 'Recording not supported' : '錄音不受支援',
          description: language === 'en'
            ? 'Your browser does not support audio recording. Please try Chrome or Edge.'
            : '您的瀏覽器不支援音頻錄製。請嘗試 Chrome 或 Edge。',
          variant: 'destructive',
        });
        setIsRecordingError(true);
        setTimeout(() => setIsRecordingError(false), 3000);
        return;
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];
      streamRef.current = stream;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        streamRef.current = null;
        setIsRecording(false);

        if (chunksRef.current.length === 0) return;

        const blob = new Blob(chunksRef.current, { type: mimeType });
        const reader = new FileReader();
        reader.onload = async () => {
          const base64 = (reader.result as string).split(',')[1];
          try {
            const res = await fetch('/api/transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audioData: base64, language }),
            });
            const data = await res.json();
            if (data.text) {
              setMessage(prev => (prev ? prev + ' ' : '') + data.text.trim());
            }
          } catch {
            toast({
              title: language === 'en' ? 'Transcription failed' : '轉錄失敗',
              description: language === 'en'
                ? 'Could not process audio'
                : '無法處理音頻',
              variant: 'destructive',
            });
          }
        };
        reader.readAsDataURL(blob);
      };

      mediaRecorder.onerror = () => {
        setIsRecording(false);
        setIsRecordingError(true);
        setTimeout(() => setIsRecordingError(false), 3000);
        stream.getTracks().forEach(t => t.stop());
        streamRef.current = null;
        toast({
          title: language === 'en' ? 'Recording error' : '錄音錯誤',
          variant: 'destructive',
        });
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setIsRecordingError(false);
    } catch {
      toast({
        title: language === 'en' ? 'Microphone access denied' : '麥克風存取被拒絕',
        description: language === 'en'
          ? 'Please allow microphone access in your browser settings'
          : '請在瀏覽器設定中允許麥克風存取',
        variant: 'destructive',
      });
    }
  }, [isRecording, language, toast]);

  return (
    <div
      className="relative shrink-0 px-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag & drop overlay — clean, minimal */}
      {isDragOver && (
        <div className="absolute inset-0 bg-gray-100/90 dark:bg-gray-900/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-2 touch-none rounded-none">
          <Upload className="h-7 w-7 text-gray-500 dark:text-gray-400" />
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {language === 'en' ? 'Drop files here' : '將檔案拖放至呢個'}
          </p>
        </div>
      )}

      {/* Input container — centered, Poe-style */}
      <div className="max-w-[768px] mx-auto">
        {/* Mode selector — segmented control */}
        <div className="flex items-center justify-center mb-2">
          <div className="inline-flex items-center gap-0.5 p-0.5 rounded-full bg-gray-100 dark:bg-white/5 border border-black/5 dark:border-white/10">
            {MODE_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const active = mode === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onModeChange?.(opt.value)}
                  disabled={isLoading}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium transition-all duration-150 touch-manipulation ${
                    active
                      ? 'bg-white dark:bg-[#2a2a2a] text-emerald-700 dark:text-emerald-300 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  aria-pressed={active}
                  title={language === 'en' ? opt.label.en : opt.label.zh}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{language === 'en' ? opt.label.en : opt.label.zh}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Actions Bar — only visible in Tutor mode, when input is focused or empty */}
        <div className={`flex items-center gap-2 mb-2 overflow-x-auto no-scrollbar transition-all duration-300 ${
          mode === 'tutor' && (isFocused || !message) && !isLoading
            ? 'opacity-100 translate-y-0 max-h-10'
            : 'opacity-0 translate-y-1 max-h-0 overflow-hidden pointer-events-none'
        }`}>
          {quickActions.map((action) => {
            const ActionIcon = action.icon;
            return (
              <button
                key={action.label.en}
                onClick={() => {
                  const prompt = language === 'en' ? action.prompt.en : action.prompt.zh;
                  setMessage(prompt);
                  textareaRef.current?.focus();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/40 bg-emerald-50/80 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 text-xs font-medium whitespace-nowrap transition-all duration-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:border-emerald-300/70 dark:hover:border-emerald-700/50 hover:shadow-[0_0_8px_rgba(16,185,129,0.1)] active:scale-[0.97] shrink-0 touch-manipulation"
                title={language === 'en' ? action.prompt.en : action.prompt.zh}
              >
                <ActionIcon className="h-3.5 w-3.5" />
                <span>{language === 'en' ? action.label.en : action.label.zh}</span>
              </button>
            );
          })}
        </div>

        {/* Attachments preview */}
        {(attachedImage || attachedPdf) && (
          <div className="flex gap-2 mb-2 flex-wrap">
            {attachedImage && (
              <div className="relative group rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-1.5 flex items-center gap-2">
                <div className="h-8 w-8 rounded overflow-hidden shrink-0">
                  <img src={attachedImage} alt="Preview" className="h-full w-full object-cover" />
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-300">
                  {language === 'en' ? 'Image' : '圖片'}
                </span>
                <button
                  onClick={() => setAttachedImage(null)}
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gray-400 dark:bg-gray-500 text-white flex items-center justify-center hover:bg-red-500 transition-colors shadow-sm touch-manipulation"
                  aria-label="Remove image"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            {attachedPdf && (
              <div className="relative group rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-2 flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-600 dark:text-gray-300 shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs text-gray-600 dark:text-gray-300 max-w-[120px] truncate">
                    {attachedPdf.name}
                  </span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500">
                    {formatFileSize(attachedPdf.size)}
                  </span>
                </div>
                <button
                  onClick={() => setAttachedPdf(null)}
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gray-400 dark:bg-gray-500 text-white flex items-center justify-center hover:bg-red-500 transition-colors touch-manipulation"
                  aria-label="Remove PDF"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Poe-style input container — rounded rectangle, minimal border */}
        <div
          className={`relative flex items-end rounded-2xl border transition-all duration-250 input-emerald-underline ${isFocused ? 'input-focused' : ''} ${
            isFocused
              ? 'border-emerald-300/60 dark:border-emerald-600/40 bg-white dark:bg-[#2a2a2a] input-focused-glow'
              : 'border-black/10 dark:border-white/10 bg-white dark:bg-[#2a2a2a]'
          } ${isDragOver ? 'border-gray-400 dark:border-gray-500' : ''}`}
        >
          {/* Left side buttons — image, PDF, mic */}
          <div className="flex items-center gap-0.5 pl-2.5 pb-2.5 pt-2.5 shrink-0">
            <input
              type="file"
              accept="image/*"
              ref={imageInputRef}
              onChange={handleImageUpload}
              className="hidden"
              aria-hidden="true"
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="h-7 w-7 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors duration-150 touch-manipulation"
                  onClick={() => imageInputRef.current?.click()}
                  aria-label={language === 'en' ? 'Upload image' : '上傳圖片'}
                >
                  <ImageIcon className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={6} className="text-xs">
                {language === 'en' ? 'Upload Image' : '上傳圖片'}
              </TooltipContent>
            </Tooltip>

            <input
              type="file"
              accept=".pdf,.docx,.pptx,.txt,.md,.markdown,.rst,.log,.csv,.tsv,.json,.jsonl,.xml,.yaml,.yml,.toml,.ini,.conf,.env,.html,.htm,.css,.scss,.less,.js,.jsx,.ts,.tsx,.mjs,.cjs,.py,.rb,.php,.go,.rs,.java,.kt,.scala,.swift,.c,.cc,.cpp,.cxx,.h,.hpp,.cs,.fs,.sh,.bash,.zsh,.ps1,.bat,.cmd,.sql,.graphql,.proto,.r,.jl,.lua,.pl,.tex,.bib,.srt,.vtt"
              ref={pdfInputRef}
              onChange={handlePdfUpload}
              className="hidden"
              aria-hidden="true"
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="h-7 w-7 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors duration-150 touch-manipulation"
                  onClick={() => pdfInputRef.current?.click()}
                  aria-label={language === 'en' ? 'Upload file' : '上傳檔案'}
                >
                  <Paperclip className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={6} className="text-xs">
                {language === 'en'
                  ? 'Upload file (PDF, Word, PowerPoint, text, code…)'
                  : '上傳檔案（PDF、Word、PowerPoint、文字、程式碼⋯⋯）'}
              </TooltipContent>
            </Tooltip>

            {/* Microphone — left side, third button */}
            {speechSupported && !isLoading && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative">
                    {isRecording && (
                      <span className="absolute inset-0 rounded-md bg-red-400/20 dark:bg-red-500/20 animate-mic-pulse" />
                    )}
                    <button
                      onClick={handleToggleRecording}
                      className={`relative h-7 w-7 flex items-center justify-center rounded-md transition-colors duration-150 touch-manipulation ${
                        isRecording
                          ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30'
                          : isRecordingError
                            ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30'
                            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10'
                      }`}
                      aria-label={isRecording
                        ? (language === 'en' ? 'Stop recording' : '停止錄音')
                        : (language === 'en' ? 'Voice input' : '語音輸入')}
                    >
                      {isRecordingError ? (
                        <MicOff className="h-3.5 w-3.5" />
                      ) : (
                        <Mic className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  {isRecording
                    ? (language === 'en' ? 'Stop recording' : '停止錄音')
                    : (language === 'en' ? 'Voice input' : '語音輸入')}
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaInput}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={(() => {
              const opt = MODE_OPTIONS.find((o) => o.value === mode) || MODE_OPTIONS[0];
              return language === 'en' ? opt.placeholder.en : opt.placeholder.zh;
            })()}
            className="flex-1 resize-none bg-transparent border-0 focus:outline-none text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 text-[15px] leading-relaxed py-2.5 pl-1 pr-1 max-h-[45dvh] sm:max-h-[360px] min-h-[24px] touch-manipulation textarea-smooth-resize"
            rows={1}
            disabled={isLoading}
          />

          {/* Right side — send button only */}
          <div className="flex items-center pr-2.5 pb-2.5 pt-2.5 shrink-0">
            {/* "Listening..." label when recording */}
            {isRecording && (
              <span className="text-[11px] text-red-500 dark:text-red-400 font-medium whitespace-nowrap mr-1.5">
                {language === 'en' ? 'Listening...' : '聆聽中…'}
              </span>
            )}
            {isLoading && onStop ? (
              <button
                onClick={onStop}
                className="h-8 w-8 flex items-center justify-center rounded-lg transition-all duration-200 touch-manipulation btn-press bg-[#1b1b1b] text-white dark:bg-white dark:text-black hover:bg-[#333] dark:hover:bg-gray-200 hover:scale-105"
                aria-label={language === 'en' ? 'Stop generating' : '停止生成'}
                title={language === 'en' ? 'Stop' : '停止'}
              >
                <Square className="h-3 w-3 fill-current" />
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={isLoading || !canSend}
                className={`h-8 w-8 flex items-center justify-center rounded-lg transition-all duration-200 touch-manipulation btn-press ${
                  canSend && !isLoading
                    ? 'bg-[#1b1b1b] text-white dark:bg-white dark:text-black hover:bg-[#333] dark:hover:bg-gray-200 hover:scale-105'
                    : 'bg-[#e0e0e0] text-[#999] dark:bg-[#444] dark:text-[#666] cursor-not-allowed'
                }`}
                aria-label={language === 'en' ? 'Send message' : '發送訊息'}
              >
                {isLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Disclaimer — Poe-style subtle text */}
        <p className="text-[11px] text-gray-400 dark:text-gray-500 text-center mt-1.5 px-1 tracking-wide">
          {language === 'en'
            ? 'AI may produce inaccurate information.'
            : 'AI 生成內容可能有誤，請核對 lecture notes。'}
        </p>
      </div>
    </div>
  );
}
