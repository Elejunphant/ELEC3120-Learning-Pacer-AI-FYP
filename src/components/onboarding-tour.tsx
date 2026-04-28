'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  MessageSquare,
  HelpCircle,
  Compass,
  ArrowRight,
  Volume2,
  FileText,
  Calendar,
  BarChart3,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'lp-onboarding-completed';

interface TourStep {
  icon: React.ComponentType<{ className?: string }>;
  titleEn: string;
  titleZh: string;
  descEn: string;
  descZh: string;
  features?: { icon: React.ComponentType<{ className?: string }>; en: string; zh: string }[];
}

const steps: TourStep[] = [
  {
    icon: GraduationCap,
    titleEn: 'Welcome to LearningPacer!',
    titleZh: '歡迎來到LearningPacer！',
    descEn:
      'Your AI-powered teaching assistant for HKUST ELEC3120 Computer Networking. Get instant help with concepts, quiz practice, and personalized study plans.',
    descZh:
      '你的AI驅動助教，為HKUST ELEC3120電腦網絡課程量身打造。即時攞概念講解、測驗練習和個性化學習計劃。',
  },
  {
    icon: MessageSquare,
    titleEn: 'Ask Anything',
    titleZh: '隨時提問',
    descEn:
      'Type any networking question in the chat — from TCP handshakes to IP subnetting. The AI TA responds with clear, detailed explanations tailored to your course.',
    descZh:
      '在聊日中輸入任何網絡問題 — 從TCP三次握手到IP子網劃分。AI助教會畀出清晰、詳細的解答，專為你的課程量身定製。',
    features: [
      { icon: MessageSquare, en: 'Instant AI responses', zh: '即時AI回覆' },
      { icon: FileText, en: 'Image & PDF analysis', zh: '圖片與PDF分析' },
    ],
  },
  {
    icon: HelpCircle,
    titleEn: 'Test Your Knowledge',
    titleZh: '測試你的知識',
    descEn:
      'Challenge yourself with MCQ quizzes covering all 8 ELEC3120 topics. Track your progress, identify weak areas, and get personalized study recommendations.',
    descZh:
      '用涵蓋全部8個ELEC3120主題的選擇題挑戰自己。追蹤你的進度、識別薄弱環節，並獲得個性化學習建議。',
    features: [
      { icon: HelpCircle, en: '37+ quiz questions', zh: '37+道測驗題' },
      { icon: BarChart3, en: 'Performance analytics', zh: '成績分析' },
      { icon: Calendar, en: 'Personalized study plan', zh: '個性化學習計劃' },
    ],
  },
  {
    icon: Compass,
    titleEn: 'Start Exploring',
    titleZh: '開始探索',
    descEn:
      'Dive into the knowledge base, listen to AI responses with text-to-speech, upload lecture slides for analysis, and much more. Your networking journey starts here!',
    descZh:
      '深入知識庫、用語音合成收聽AI回覆、上傳課件進行分析等等。你的網絡學習之旅從呢度開始！',
    features: [
      { icon: Volume2, en: 'Text-to-speech', zh: '語音合成' },
      { icon: FileText, en: 'PDF upload', zh: 'PDF上傳' },
      { icon: Compass, en: 'Knowledge browser', zh: '知識庫瀏覽' },
      { icon: Calendar, en: 'Study planner', zh: '學習計劃' },
    ],
  },
];

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
    scale: 0.95,
  }),
};

const iconVariants = {
  hidden: { scale: 0.6, opacity: 0, rotate: -15 },
  visible: {
    scale: 1,
    opacity: 1,
    rotate: 0,
    transition: { type: 'spring', stiffness: 200, damping: 15, delay: 0.15 },
  },
};

export function OnboardingTour() {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const hasCheckedRef = useRef(false);
  const [language, setLanguage] = useState<'en' | 'zh'>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('lp-language');
      if (stored === 'zh' || stored === 'en') return stored;
    }
    return 'en';
  });

  useEffect(() => {
    // Guard against React StrictMode double-mount in development
    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    try {
      const completed = localStorage.getItem(STORAGE_KEY);
      if (completed === 'true') return;
    } catch {
      // localStorage may be unavailable (private browsing, etc.)
      return;
    }

    const openTimer = setTimeout(() => {
      setIsOpen(true);
    }, 600);

    return () => clearTimeout(openTimer);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // Silently fail if localStorage is unavailable
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setDirection(1);
      setCurrentStep((s) => s + 1);
    } else {
      handleClose();
    }
  };

  const handleSkip = () => {
    handleClose();
  };

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const StepIcon = step.icon;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[480px] p-0 overflow-hidden bg-white dark:bg-gray-900 border-gray-200/80 dark:border-gray-700/60 shadow-2xl shadow-emerald-500/10 dark:shadow-emerald-500/5"
      >
        {/* Top gradient bar */}
        <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500" />

        <DialogTitle className="sr-only">
          {language === 'en' ? 'Onboarding Tour' : '新手引導'}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {language === 'en'
            ? 'Welcome tour for LearningPacer'
            : 'LearningPacer 歡迎引導'}
        </DialogDescription>

        <div className="px-6 pt-6 pb-2">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4"
            >
              {/* Animated icon */}
              <div className="flex justify-center">
                <motion.div
                  variants={iconVariants}
                  initial="hidden"
                  animate="visible"
                  className="relative"
                >
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                    <StepIcon className="h-8 w-8 text-white" />
                  </div>
                  {/* Glow ring */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 blur-xl opacity-30"
                    animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.08, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </motion.div>
              </div>

              {/* Step badge */}
              <div className="flex justify-center">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-800/40">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {language === 'en' ? `Step ${currentStep + 1} of ${steps.length}` : `第 ${currentStep + 1} 步，共 ${steps.length} 步`}
                </span>
              </div>

              {/* Title */}
              <h2 className="text-xl font-bold text-center text-gray-900 dark:text-gray-100 leading-tight">
                {language === 'en' ? step.titleEn : step.titleZh}
              </h2>

              {/* Description */}
              <p className="text-sm text-center text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm mx-auto">
                {language === 'en' ? step.descEn : step.descZh}
              </p>

              {/* Feature pills (for steps that have them) */}
              {step.features && step.features.length > 0 && (
                <motion.div
                  className="flex flex-wrap justify-center gap-2 pt-1"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.3 }}
                >
                  {step.features.map((feat, i) => {
                    const FeatIcon = feat.icon;
                    return (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + i * 0.07, duration: 0.25 }}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800/80 px-3 py-1.5 rounded-lg border border-gray-200/80 dark:border-gray-700/60"
                      >
                        <FeatIcon className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
                        {language === 'en' ? feat.en : feat.zh}
                      </motion.span>
                    );
                  })}
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Step indicator dots */}
        <div className="flex items-center justify-center gap-2 py-3">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > currentStep ? 1 : -1);
                setCurrentStep(i);
              }}
              className="group relative outline-none"
              aria-label={`Go to step ${i + 1}`}
            >
              <motion.div
                className={cn(
                  'h-2 rounded-full transition-colors duration-300',
                  i === currentStep
                    ? 'bg-emerald-500'
                    : i < currentStep
                      ? 'bg-emerald-400'
                      : 'bg-gray-300 dark:bg-gray-600'
                )}
                animate={{ width: i === currentStep ? 24 : 8 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              />
            </button>
          ))}
        </div>

        {/* Action buttons */}
        <div className="px-6 pb-6 pt-2">
          <div className="flex items-center gap-3">
            {!isLastStep && (
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="flex-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl h-11 text-sm font-medium transition-all duration-200"
              >
                {language === 'en' ? 'Skip' : '跳過'}
              </Button>
            )}
            <Button
              onClick={handleNext}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl h-11 text-sm font-semibold shadow-md shadow-emerald-500/25 hover:shadow-lg hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 gap-2"
            >
              {isLastStep
                ? language === 'en'
                  ? 'Get Started'
                  : '開始使用'
                : language === 'en'
                  ? 'Next'
                  : '下一步'}
              {isLastStep ? (
                <GraduationCap className="h-4 w-4" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
