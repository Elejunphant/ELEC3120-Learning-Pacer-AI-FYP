import { db } from '@/lib/db';
import { openrouterChat, type ChatMessage } from '@/lib/openrouter';
import { knowledgeTopics } from '@/lib/knowledge-base';

interface GenerateRequest {
  count: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'all';
  topics?: string[];
  language?: 'en' | 'zh';
}

interface GeneratedQuestion {
  id: string;
  questionEn: string;
  questionZh: string;
  options: { id: string; textEn: string; textZh: string }[];
  correctAnswer: string;
  explanationEn: string;
  explanationZh: string;
  difficulty: string;
  topicId: string;
  topicNameEn: string;
  topicNameZh: string;
}

const VALID_TOPIC_IDS = new Set(knowledgeTopics.map((t) => t.id));
const VALID_OPTION_IDS = ['a', 'b', 'c', 'd'];
const QUIZ_MODEL = process.env.OPENROUTER_QUIZ_MODEL || 'qwen/qwen3-coder';

// ─── KB content (kept short to minimise input tokens) ────────────────────────

function buildKbContent(topicIds?: string[]): string {
  const topics = topicIds && topicIds.length > 0
    ? knowledgeTopics.filter((t) => topicIds.includes(t.id))
    : knowledgeTopics;
  let out = '';
  for (const t of topics) {
    out += `## ${t.title} (${t.id})\n`;
    for (const kp of t.keyPoints) out += `- ${kp.point}\n`;
    out += '\n';
  }
  return out;
}

async function buildKbContext(topicIds?: string[]): Promise<string> {
  // Cap is generous — input tokens are cheap; the speed win comes from
  // small OUTPUT (1 question per call) being generated in parallel.
  const MAX_CHARS = 9000;
  // Reserve ~1500 chars for the topic-headings overview, the rest for real
  // lecture content from the ingested PDFs.
  const HEADINGS_CAP = 1500;
  let headings = buildKbContent(topicIds);
  if (headings.length > HEADINGS_CAP) headings = headings.slice(0, HEADINGS_CAP);

  let lectureContent = '';
  try {
    const docs = await db.knowledgeDocument.findMany({ orderBy: { createdAt: 'desc' } });
    if (docs.length > 0) {
      // If specific topics are selected, prioritise documents whose title or
      // content mentions any of those topic names; otherwise sample evenly.
      const topicNames = topicIds && topicIds.length > 0
        ? knowledgeTopics
            .filter((t) => topicIds.includes(t.id))
            .flatMap((t) => [t.title.toLowerCase(), t.titleZh])
        : [];

      const matches = topicNames.length > 0
        ? docs.filter((d) => {
            const hay = `${d.title || ''} ${d.content}`.toLowerCase();
            return topicNames.some((n) => hay.includes(n));
          })
        : [];
      const ordered = matches.length > 0 ? [...matches, ...docs.filter((d) => !matches.includes(d))] : docs;

      const remaining = MAX_CHARS - headings.length - 200; // padding
      const perDoc = Math.max(400, Math.floor(remaining / Math.min(ordered.length, 6)));
      let used = 0;
      const parts: string[] = [];
      for (const doc of ordered) {
        if (used >= remaining) break;
        const slice = doc.content.slice(0, Math.min(perDoc, remaining - used));
        if (!slice) continue;
        const heading = doc.title ? `\n### ${doc.title}\n` : '\n### Lecture excerpt\n';
        parts.push(heading + slice);
        used += slice.length + heading.length;
      }
      lectureContent = '\n## Lecture Notes (excerpts from ingested PDFs)\n' + parts.join('\n---\n');
    }
  } catch (err) {
    console.warn('[Quiz Generate] DB read failed, using headings only:', err);
  }

  const combined = headings + lectureContent;
  return combined.length > MAX_CHARS ? combined.slice(0, MAX_CHARS) : combined;
}

// ─── Prompt for ONE question (smaller = faster) ──────────────────────────────

function buildSingleQuestionPrompt(
  kbContent: string,
  difficulty: 'easy' | 'medium' | 'hard',
  topics?: string[],
  variantSeed?: number
): string {
  const validTopicIds = topics && topics.length > 0 ? topics : Array.from(VALID_TOPIC_IDS);
  const variantHint = variantSeed !== undefined
    ? `\n- Variant index: ${variantSeed} — make this question DIFFERENT from typical ones (vary the angle, scenario, or numerical values).`
    : '';

  return `You are a quiz generator for HKUST ELEC3120 Computer Networking. Generate EXACTLY 1 multiple-choice question.

RULES:
- Difficulty: "${difficulty}".
- Derive the question strictly from the knowledge base below.
- 4 options labelled a/b/c/d. Exactly one correct answer.
- Bilingual: questionEn + questionZh, every option needs textEn + textZh, explanationEn + explanationZh.
- All Chinese MUST be Traditional Chinese (繁體中文 — HK/TW). Never Simplified.
- Pick topicId from: ${validTopicIds.join(', ')}.${variantHint}

OUTPUT: Return ONLY a single JSON object (no array, no markdown fences, no commentary):
{"id":"q1","questionEn":"...","questionZh":"...","options":[{"id":"a","textEn":"...","textZh":"..."},{"id":"b","textEn":"...","textZh":"..."},{"id":"c","textEn":"...","textZh":"..."},{"id":"d","textEn":"...","textZh":"..."}],"correctAnswer":"a","explanationEn":"...","explanationZh":"...","difficulty":"${difficulty}","topicId":"...","topicNameEn":"...","topicNameZh":"..."}

KNOWLEDGE BASE:
${kbContent}`;
}

// ─── Response parsing ────────────────────────────────────────────────────────

function stripMarkdownFences(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    const nl = cleaned.indexOf('\n');
    if (nl !== -1) cleaned = cleaned.slice(nl + 1);
    if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
    cleaned = cleaned.trim();
  }
  return cleaned;
}

function parseSingleQuestion(raw: string): unknown | null {
  const cleaned = stripMarkdownFences(raw);
  // Try direct parse
  try {
    return JSON.parse(cleaned);
  } catch {
    // fall through
  }
  // Extract first object
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start !== -1 && end > start) {
    try {
      return JSON.parse(cleaned.slice(start, end + 1));
    } catch {
      // fall through
    }
  }
  // Maybe an array — take first element
  try {
    const arr = JSON.parse(cleaned);
    if (Array.isArray(arr) && arr.length > 0) return arr[0];
  } catch {
    // give up
  }
  return null;
}

// ─── Validation ──────────────────────────────────────────────────────────────

function validateAndNormalize(
  q: Partial<GeneratedQuestion> | null,
  index: number,
  difficulty: 'easy' | 'medium' | 'hard',
  topics?: string[]
): GeneratedQuestion | null {
  if (!q || !q.questionEn || !q.questionZh || !q.options || q.options.length !== 4 || !q.correctAnswer) {
    return null;
  }
  if (!q.options.every((o) => o && VALID_OPTION_IDS.includes(o.id) && o.textEn && o.textZh)) return null;
  if (!VALID_OPTION_IDS.includes(q.correctAnswer)) return null;

  const topicId = q.topicId && VALID_TOPIC_IDS.has(q.topicId)
    ? q.topicId
    : topics && topics.length > 0
      ? topics[0]
      : 'knowledge-base';
  const matched = knowledgeTopics.find((t) => t.id === topicId);

  return {
    id: `kb-${index + 1}`,
    questionEn: q.questionEn,
    questionZh: q.questionZh,
    options: q.options.map((o) => ({ id: o.id, textEn: o.textEn, textZh: o.textZh })),
    correctAnswer: q.correctAnswer,
    explanationEn: q.explanationEn || 'No explanation provided.',
    explanationZh: q.explanationZh || '未提供解釋。',
    difficulty: q.difficulty || difficulty,
    topicId,
    topicNameEn: matched?.title || q.topicNameEn || 'Computer Networking',
    topicNameZh: matched?.titleZh || q.topicNameZh || '電腦網絡',
  };
}

// ─── Single-question call (fast) ─────────────────────────────────────────────

async function generateOne(
  kbContent: string,
  difficulty: 'easy' | 'medium' | 'hard',
  topics: string[] | undefined,
  variantSeed: number
): Promise<unknown | null> {
  const systemPrompt = buildSingleQuestionPrompt(kbContent, difficulty, topics, variantSeed);
  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Generate 1 ${difficulty} question now. Return ONLY the JSON object.` },
  ];

  const result = await openrouterChat(messages, {
    model: QUIZ_MODEL,
    temperature: 0.85,
    max_tokens: 1500,
    timeout: 90_000,
  });

  if (result.error || !result.text) {
    console.error(`[Quiz Generate] variant ${variantSeed} call failed:`, result.error || 'empty');
    return null;
  }
  return parseSingleQuestion(result.text);
}

// ─── Difficulty distribution helper ──────────────────────────────────────────

function pickDifficulties(count: number, requested: 'easy' | 'medium' | 'hard' | 'all'): Array<'easy' | 'medium' | 'hard'> {
  if (requested !== 'all') return Array(count).fill(requested as 'easy' | 'medium' | 'hard');
  const out: Array<'easy' | 'medium' | 'hard'> = [];
  const rota: Array<'easy' | 'medium' | 'hard'> = ['easy', 'medium', 'hard'];
  for (let i = 0; i < count; i++) out.push(rota[i % 3]);
  return out;
}

// ─── Route handler ───────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const body: GenerateRequest = await request.json();
    const { count = 5, difficulty = 'all', topics } = body;
    const questionCount = Math.max(1, Math.min(count, 20));

    if (!['easy', 'medium', 'hard', 'all'].includes(difficulty)) {
      return Response.json({ error: 'Invalid difficulty' }, { status: 400 });
    }
    if (topics && topics.some((t) => !VALID_TOPIC_IDS.has(t))) {
      return Response.json({ error: 'Invalid topic IDs' }, { status: 400 });
    }

    console.log(`[Quiz Generate] count=${questionCount} difficulty=${difficulty} topics=${JSON.stringify(topics)} model=${QUIZ_MODEL}`);

    const kbContent = await buildKbContext(topics);
    const difficulties = pickDifficulties(questionCount, difficulty);

    const t0 = Date.now();

    // Fire ALL question requests in parallel — one question per call.
    // Each call is small (~1k tokens out) so it returns fast, and they all
    // race in parallel so total wall time ≈ slowest single call.
    const settled = await Promise.allSettled(
      difficulties.map((d, i) => generateOne(kbContent, d, topics, i))
    );

    console.log(`[Quiz Generate] ${questionCount} parallel calls finished in ${Date.now() - t0}ms`);

    const valid: GeneratedQuestion[] = [];
    for (let i = 0; i < settled.length; i++) {
      const r = settled[i];
      if (r.status !== 'fulfilled') continue;
      const v = validateAndNormalize(
        r.value as Partial<GeneratedQuestion> | null,
        valid.length,
        difficulties[i],
        topics
      );
      if (v) valid.push(v);
    }

    // Single quick top-up round if some failed (still parallel).
    if (valid.length < questionCount) {
      const missing = questionCount - valid.length;
      console.warn(`[Quiz Generate] Topping up ${missing} missing questions...`);
      const topUp = await Promise.allSettled(
        Array.from({ length: missing }, (_, i) =>
          generateOne(kbContent, difficulties[valid.length + i] || 'medium', topics, 100 + i)
        )
      );
      for (let i = 0; i < topUp.length; i++) {
        const r = topUp[i];
        if (r.status !== 'fulfilled') continue;
        const v = validateAndNormalize(
          r.value as Partial<GeneratedQuestion> | null,
          valid.length,
          difficulties[valid.length] || 'medium',
          topics
        );
        if (v) valid.push(v);
        if (valid.length >= questionCount) break;
      }
    }

    if (valid.length === 0) {
      return Response.json(
        { error: 'AI generation failed. Please try again.' },
        { status: 500 }
      );
    }

    console.log(`[Quiz Generate] returning ${valid.length}/${questionCount} questions in ${Date.now() - t0}ms`);

    const answers: Record<string, { correctAnswer: string; explanationEn: string; explanationZh: string }> = {};
    for (const q of valid) {
      answers[q.id] = {
        correctAnswer: q.correctAnswer,
        explanationEn: q.explanationEn,
        explanationZh: q.explanationZh,
      };
    }

    return Response.json({
      questions: valid.map((q) => ({
        id: q.id,
        questionEn: q.questionEn,
        questionZh: q.questionZh,
        options: q.options,
        difficulty: q.difficulty,
        topicId: q.topicId,
        topicNameEn: q.topicNameEn,
        topicNameZh: q.topicNameZh,
      })),
      answers,
      source: 'knowledge-base',
      total: valid.length,
      requested: questionCount,
    });
  } catch (error) {
    console.error('[Quiz Generate] Unhandled error:', error);
    return Response.json({ error: 'Failed to generate quiz questions' }, { status: 500 });
  }
}
