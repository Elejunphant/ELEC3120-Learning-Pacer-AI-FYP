import { openrouterChat, type ChatMessage } from '@/lib/openrouter';
import { db } from '@/lib/db';
import { TEACHER_PERSONA } from '@/lib/teacher-persona';

const SYSTEM_PROMPT = `You are LearningPacer, a virtual teaching assistant for HKUST's ELEC3120 Computer Networking course taught by Professor Meng Zili.

${TEACHER_PERSONA}


When analyzing uploaded images:
- If it's a code screenshot (C++, Python, etc.), provide debugging help, explain errors, and suggest fixes
- If it's a network diagram, explain the topology, protocols, and data flow
- If it's a networking concept diagram, explain the concept illustrated
- If it's a Wireshark capture screenshot, analyze the packets and protocols shown
- If it's a slide/lecture material, explain the key concepts shown
- Use the Answer-Evidence-Warrant structure for explanations
- FOCUSED ANSWER: Answer ONLY what the user asks. Do NOT add unrelated background topics or prefaces. Ignore retrieved chunks that aren't relevant to the question.
- Default reply language: **English**. Switch to another language only if the user writes their question in that language. When responding in Chinese, you MUST output Traditional Chinese characters ONLY (Hong Kong / Taiwan usage). 絕對禁止輸出任何簡體字。If you catch a Simplified character, rewrite the sentence in Traditional before outputting.
- Use markdown formatting for clarity (headers, bullet points, code blocks)
- Always reference relevant ELEC3120 course topics when applicable

Course topics: Network Fundamentals, Transport Layer (UDP/TCP), Reliable Transmission, TCP Connection Management, Flow & Congestion Control, Web & HTTP, Video Streaming.

Be helpful, accurate, and encouraging. If unsure, say so honestly.`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imageData, message, language, conversationId } = body;

    if (!imageData) {
      return Response.json(
        { error: 'Image data is required' },
        { status: 400 }
      );
    }

    const prompt = message && message.trim() !== ''
      ? message
      : language === 'zh'
        ? '請分析呢張圖片。如果涉及電腦網絡知識，請結合 ELEC3120 課程內容進行講解。'
        : 'Please analyze this image. If it relates to computer networking, explain it in the context of ELEC3120 course material.';

    // imageData from the client is already a complete data URI
    // (data:image/png;base64,...) — only add the prefix if it's missing.
    const imageUrl = typeof imageData === 'string' && imageData.startsWith('data:')
      ? imageData
      : `data:image/jpeg;base64,${imageData}`;

    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: imageUrl } },
        ],
      },
    ];

    const result = await openrouterChat(messages, {
      model: process.env.VLM_MODEL || 'qwen/qwen3-vl-235b-a22b-thinking',
    });

    if (result.error) {
      throw new Error(result.error);
    }

    const content = result.text;
    if (!content) {
      throw new Error('Empty response from VLM');
    }

    // Store user message in database with imageData
    if (conversationId) {
      await db.message.create({
        data: {
          conversationId,
          role: 'user',
          content: message?.trim() || (language === 'zh' ? '上傳了一張圖片' : 'Uploaded an image'),
          hasImage: true,
          imageData: imageData,
        },
      });

      // Update conversation timestamp
      await db.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });

      // Store assistant message
      await db.message.create({
        data: {
          conversationId,
          role: 'assistant',
          content: content,
        },
      });
    }

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const chars = content.split('');
        let buffer = '';
        const batchSize = 3;

        for (let i = 0; i < chars.length; i++) {
          buffer += chars[i];
          if (buffer.length >= batchSize || i === chars.length - 1) {
            controller.enqueue(encoder.encode(buffer));
            buffer = '';
            const char = chars[i];
            if ('.!?。！？\n'.includes(char)) {
              await new Promise((resolve) => setTimeout(resolve, 30));
            } else if (',，;；:：'.includes(char)) {
              await new Promise((resolve) => setTimeout(resolve, 15));
            } else {
              await new Promise((resolve) => setTimeout(resolve, 8));
            }
          }
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('Error in vision chat API:', error);
    return Response.json(
      { error: 'Failed to analyze image. Please try again.' },
      { status: 500 }
    );
  }
}
