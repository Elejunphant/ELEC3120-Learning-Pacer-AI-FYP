import { openrouterChat } from '@/lib/openrouter';
import { knowledgeTopics } from '@/lib/knowledge-base';

interface GenerateRequest {
  topicIds?: string[];
  count?: number;
  language?: 'en' | 'zh';
}

function buildKbContent(topicIds?: string[]): string {
  let content = '';
  const topics = topicIds && topicIds.length > 0
    ? knowledgeTopics.filter(t => topicIds.includes(t.id))
    : knowledgeTopics;

  for (const topic of topics) {
    content += `\n## ${topic.title} / ${topic.titleZh}\n`;
    content += `${topic.description}\n${topic.descriptionZh}\n\n`;
    for (const kp of topic.keyPoints) {
      content += `- **${kp.point}** (${kp.pointZh}): ${kp.detail}\n`;
      content += `  ${kp.detailZh}\n`;
    }
  }
  return content;
}

function stripMarkdownFences(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    const firstNewline = cleaned.indexOf('\n');
    if (firstNewline !== -1) {
      cleaned = cleaned.slice(firstNewline + 1);
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.slice(0, -3);
    }
    cleaned = cleaned.trim();
  }
  return cleaned;
}

function parseAIResponse(raw: string): unknown[] {
  const cleaned = stripMarkdownFences(raw);
  const arrayStart = cleaned.indexOf('[');
  const arrayEnd = cleaned.lastIndexOf(']');

  if (arrayStart !== -1 && arrayEnd !== -1 && arrayEnd > arrayStart) {
    try {
      const parsed = JSON.parse(cleaned.slice(arrayStart, arrayEnd + 1));
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // fall through
    }
  }

  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    throw new Error('Failed to parse AI response as JSON array');
  }

  throw new Error('AI response does not contain a valid JSON array');
}

export async function POST(request: Request) {
  try {
    const body: GenerateRequest = await request.json();
    const { topicIds, count = 8 } = body;

    const cardCount = Math.max(1, Math.min(count, 20));

    let kbContent = buildKbContent(topicIds);
    if (kbContent.length > 10000) {
      kbContent = kbContent.slice(0, 10000) + '\n\n[Content truncated]';
    }

    const topicNames = topicIds && topicIds.length > 0
      ? topicIds.map(id => {
          const t = knowledgeTopics.find(kt => kt.id === id);
          return t ? `${t.title}/${t.titleZh}` : id;
        }).join(', ')
      : 'all topics';

    const systemPrompt = `You are a flashcard generator for HKUST ELEC3120 Computer Networking course. Generate flashcards based on the knowledge base content below.

CRITICAL INSTRUCTIONS:
- Generate EXACTLY ${cardCount} flashcards. No more, no less.
- Each flashcard must have a concise QUESTION/TERM on the front and a clear ANSWER/DEFINITION on the back.
- Content MUST be derived from the knowledge base. Do not make up facts.
- Provide both English and Traditional Chinese (繁體中文 / 正體中文) versions. The Chinese fields MUST use Traditional Chinese characters (Hong Kong / Taiwan usage). Never output Simplified Chinese.
- Topics to cover: ${topicNames}
- Make questions cover different aspects: definitions, comparisons, explanations, formulas, protocols.
- Front should be short (1-2 sentences or a term). Back should be comprehensive but concise.

RESPONSE FORMAT:
Return a valid JSON array. No markdown fences, no extra text. Only the JSON array.

Each item must have this structure:
{
  "front": "What is the TCP three-way handshake?",
  "back": "The TCP three-way handshake is a connection establishment process...",
  "frontZh": "什麼是TCP三次握手？",
  "backZh": "TCP三次握手是一個連接建立過程...",
  "topicId": "tcp-connection",
  "topicNameEn": "TCP Connection",
  "topicNameZh": "TCP連接"
}

KNOWLEDGE BASE:
${kbContent}`;

    // Call OpenRouter
    let aiCards: unknown[];
    try {
      const result = await openrouterChat([
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Generate exactly ${cardCount} flashcards about computer networking. Mix different question types: definitions, comparisons, explanations, how-it-works. Cover: ${topicNames}. Return ONLY the JSON array.`,
        },
      ], { temperature: 0.7 });

      if (result.error) throw new Error(result.error);
      if (!result.text) throw new Error('Empty AI response');

      aiCards = parseAIResponse(result.text);
    } catch (err) {
      console.error('AI flashcard generation error:', err);
      return Response.json(
        { error: 'Failed to generate flashcards with AI. Please try again.', details: err instanceof Error ? err.message : 'Unknown' },
        { status: 500 }
      );
    }

    // Validate cards
    const validCards: {
      front: string;
      back: string;
      frontZh: string;
      backZh: string;
      topicId: string;
      topicNameEn: string;
      topicNameZh: string;
    }[] = [];

    const validTopicIds = new Set(knowledgeTopics.map(t => t.id));

    for (const card of aiCards) {
      if (validCards.length >= cardCount) break;
      const c = card as Record<string, string>;
      if (!c.front || !c.back || !c.frontZh || !c.backZh) continue;

      const topicId = (c.topicId && validTopicIds.has(c.topicId))
        ? c.topicId
        : (topicIds && topicIds.length > 0 ? topicIds[0] : 'network-fundamentals');

      const matched = knowledgeTopics.find(t => t.id === topicId);
      validCards.push({
        front: c.front,
        back: c.back,
        frontZh: c.frontZh,
        backZh: c.backZh,
        topicId,
        topicNameEn: matched?.title || c.topicNameEn || 'Computer Networking',
        topicNameZh: matched?.titleZh || c.topicNameZh || '電腦網絡',
      });
    }

    if (validCards.length === 0) {
      return Response.json({ error: 'AI generated cards but none were valid. Please try again.' }, { status: 500 });
    }

    return Response.json({
      cards: validCards,
      total: validCards.length,
      requested: cardCount,
      source: 'knowledge-base',
    });
  } catch (error) {
    console.error('Error generating flashcards:', error);
    return Response.json({ error: 'Failed to generate flashcards' }, { status: 500 });
  }
}
