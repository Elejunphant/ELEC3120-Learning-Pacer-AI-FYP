// Conversation tag system — pre-defined tags with colors and bilingual labels

export interface ConversationTag {
  id: string;
  label: string;      // Bilingual label (EN + ZH)
  color: string;      // Tailwind color name
  bgClass: string;    // Background class for dots/badges
  textClass: string;  // Text color class
  borderClass: string; // Border class for active states
  dotClass: string;   // Small dot background
}

export const CONVERSATION_TAGS: ConversationTag[] = [
  {
    id: 'important',
    label: 'Important 重要',
    color: 'rose',
    bgClass: 'bg-rose-100 dark:bg-rose-900/40',
    textClass: 'text-rose-700 dark:text-rose-300',
    borderClass: 'border-rose-300 dark:border-rose-700',
    dotClass: 'bg-rose-500',
  },
  {
    id: 'review',
    label: 'Review 複習',
    color: 'amber',
    bgClass: 'bg-amber-100 dark:bg-amber-900/40',
    textClass: 'text-amber-700 dark:text-amber-300',
    borderClass: 'border-amber-300 dark:border-amber-700',
    dotClass: 'bg-amber-500',
  },
  {
    id: 'exam',
    label: 'Exam Prep 備考',
    color: 'violet',
    bgClass: 'bg-violet-100 dark:bg-violet-900/40',
    textClass: 'text-violet-700 dark:text-violet-300',
    borderClass: 'border-violet-300 dark:border-violet-700',
    dotClass: 'bg-violet-500',
  },
  {
    id: 'notes',
    label: 'Notes 筆記',
    color: 'emerald',
    bgClass: 'bg-emerald-100 dark:bg-emerald-900/40',
    textClass: 'text-emerald-700 dark:text-emerald-300',
    borderClass: 'border-emerald-300 dark:border-emerald-700',
    dotClass: 'bg-emerald-500',
  },
  {
    id: 'question',
    label: 'Question 問題',
    color: 'sky',
    bgClass: 'bg-sky-100 dark:bg-sky-900/40',
    textClass: 'text-sky-700 dark:text-sky-300',
    borderClass: 'border-sky-300 dark:border-sky-700',
    dotClass: 'bg-sky-500',
  },
];

export const TAGS_STORAGE_KEY = 'lp-conversation-tags';

/** Get a tag's definition by its id */
export function getTagById(id: string): ConversationTag | undefined {
  return CONVERSATION_TAGS.find((t) => t.id === id);
}

/** Load all conversation tags from localStorage */
export function loadConversationTags(): Record<string, string[]> {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(TAGS_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return {};
}

/** Save all conversation tags to localStorage */
export function saveConversationTags(tags: Record<string, string[]>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(tags));
  } catch {
    // ignore
  }
}

/** Toggle a tag on a conversation */
export function toggleConversationTag(
  conversationId: string,
  tagId: string,
  current: Record<string, string[]>
): Record<string, string[]> {
  const updated = { ...current };
  const convTags = [...(updated[conversationId] || [])];
  const idx = convTags.indexOf(tagId);
  if (idx >= 0) {
    convTags.splice(idx, 1);
  } else {
    convTags.push(tagId);
  }
  if (convTags.length > 0) {
    updated[conversationId] = convTags;
  } else {
    delete updated[conversationId];
  }
  saveConversationTags(updated);
  return updated;
}
