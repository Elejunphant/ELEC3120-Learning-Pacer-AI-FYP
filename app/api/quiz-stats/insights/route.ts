import { db } from '@/lib/db';
import { openrouterChat, type ChatMessage } from '@/lib/openrouter';

interface WeakConcept {
  title: string;
  summary: string;
  recommendation: string;
  topicId?: string;
  topicName?: string;
  evidenceQuestionIds: string[];
}

interface InsightsResponse {
  generatedAt: string;
  totalAnalyzed: number;
  weakConcepts: WeakConcept[];
  summary: string;
}

const SYSTEM_PROMPT = `You are an expert tutor for HKUST's ELEC3120 Computer Networking course. Your job: read a list of quiz questions the student got WRONG and identify the SPECIFIC underlying CONCEPTS they don't understand — be more specific than the topic name.

For example, instead of "TCP" say "TCP fast retransmit triggered by 3 duplicate ACKs" or "the difference between cumulative ACK and selective ACK".

Output STRICT JSON ONLY, no preamble, no markdown fences. Schema:

{
  "summary": "<2-3 sentences in the requested language summarising the student's overall weakness pattern>",
  "weakConcepts": [
    {
      "title": "<short concept name, 3-10 words>",
      "summary": "<1-2 sentence explanation of WHAT the concept is and WHY the student likely got it wrong>",
      "recommendation": "<1-2 sentence concrete next-step study suggestion>",
      "evidenceQuestionIds": ["<questionId1>", "<questionId2>"]
    }
  ]
}

Rules:
- Output ONLY valid JSON. No markdown, no commentary.
- Identify 3-6 distinct weak concepts. Group similar mistakes into ONE concept rather than listing every wrong question separately.
- Each concept MUST cite at least one questionId from the input as evidence.
- If the student only made 1-2 mistakes, return 1-2 concepts.
- Language: default to English. Respond in Traditional Chinese (繁體中文 / 正體中文 — Hong Kong / Taiwan 用字, e.g. 網絡 not 網路, 軟件 not 軟體) only if the input language is explicitly "zh". 絕對禁止簡體字 when responding in Chinese.
- Be CONCRETE. Reference specific protocols, mechanisms, or formulas (e.g. "Nagle's algorithm", "CWND additive increase", "DNS recursive vs iterative").`;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const language: 'en' | 'zh' = body?.language === 'en' ? 'en' : 'zh';

    // Pull most recent wrong attempts that have rich text data attached.
    const wrongAttempts = (await db.quizAttempt.findMany({
      where: { isCorrect: false },
      orderBy: { createdAt: 'desc' },
      take: 30,
    })) as Array<{
      id: string;
      questionId: string;
      topicId: string;
      topicName: string;
      difficulty: string;
      questionText: string | null;
      selectedAnswerText: string | null;
      correctAnswerText: string | null;
      explanation: string | null;
    }>;

    const usable = wrongAttempts.filter((a) => a.questionText && a.questionText.trim().length > 0);

    if (usable.length === 0) {
      const emptyMsg =
        language === 'zh'
          ? '暫時冇足夠新嘅錯題數據。請再做幾題測驗（新題目會自動記錄詳細內容），之後再返嚟生成分析。'
          : 'Not enough recent wrong-answer data yet. Answer a few more quiz questions (new attempts capture full details automatically) and come back to generate insights.';
      return Response.json({
        generatedAt: new Date().toISOString(),
        totalAnalyzed: 0,
        weakConcepts: [],
        summary: emptyMsg,
      } satisfies InsightsResponse);
    }

    // Build a compact prompt
    const lines = usable.map((a, i) => {
      const parts = [
        `[${i + 1}] questionId=${a.questionId} topic="${a.topicName}" difficulty=${a.difficulty}`,
        `Q: ${a.questionText}`,
      ];
      if (a.selectedAnswerText) parts.push(`Student picked: ${a.selectedAnswerText}`);
      if (a.correctAnswerText) parts.push(`Correct: ${a.correctAnswerText}`);
      if (a.explanation) parts.push(`Explanation: ${a.explanation}`);
      return parts.join('\n');
    });

    const userPrompt =
      `Language: ${language}\n` +
      `Number of wrong answers to analyse: ${usable.length}\n\n` +
      `--- WRONG ANSWERS ---\n${lines.join('\n\n')}\n--- END ---\n\n` +
      `Now identify the underlying weak concepts. Output JSON only.`;

    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ];

    const result = await openrouterChat(messages, {
      model: process.env.OPENROUTER_MODEL || 'xiaomi/mimo-v2-pro',
    });

    if (result.error || !result.text) {
      console.error('Insights LLM error:', result.error);
      return Response.json(
        { error: 'AI insight generation failed. Please try again.' },
        { status: 502 }
      );
    }

    // Parse JSON (strip code fences if present)
    let raw = result.text.trim();
    raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();

    let parsed: { summary?: string; weakConcepts?: WeakConcept[] };
    try {
      parsed = JSON.parse(raw);
    } catch {
      // Try to extract a JSON object substring
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) {
        return Response.json(
          { error: 'AI returned non-JSON output. Please try again.' },
          { status: 502 }
        );
      }
      try {
        parsed = JSON.parse(match[0]);
      } catch {
        return Response.json(
          { error: 'AI returned malformed JSON. Please try again.' },
          { status: 502 }
        );
      }
    }

    // Enrich with topicId/topicName from the source attempts
    const idToTopic = new Map<string, { topicId: string; topicName: string }>();
    for (const a of usable) {
      idToTopic.set(a.questionId, { topicId: a.topicId, topicName: a.topicName });
    }

    const concepts = (parsed.weakConcepts || []).map((c) => {
      const ids = Array.isArray(c.evidenceQuestionIds) ? c.evidenceQuestionIds : [];
      const firstHit = ids.map((qid) => idToTopic.get(qid)).find(Boolean);
      return {
        title: String(c.title || '').slice(0, 200),
        summary: String(c.summary || '').slice(0, 800),
        recommendation: String(c.recommendation || '').slice(0, 800),
        topicId: firstHit?.topicId,
        topicName: firstHit?.topicName,
        evidenceQuestionIds: ids,
      } satisfies WeakConcept;
    });

    return Response.json({
      generatedAt: new Date().toISOString(),
      totalAnalyzed: usable.length,
      weakConcepts: concepts,
      summary: String(parsed.summary || '').slice(0, 1000),
    } satisfies InsightsResponse);
  } catch (error) {
    console.error('Insights route error:', error);
    return Response.json({ error: 'Failed to generate insights' }, { status: 500 });
  }
}
