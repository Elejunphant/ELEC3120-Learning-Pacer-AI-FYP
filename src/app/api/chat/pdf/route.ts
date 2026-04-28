import { openrouterChat, type ChatMessage } from '@/lib/openrouter';
import { db } from '@/lib/db';
import { TEACHER_PERSONA } from '@/lib/teacher-persona';
import { extractFileText } from '@/lib/file-extract';

const SYSTEM_PROMPT = `You are LearningPacer, a virtual teaching assistant for HKUST's ELEC3120 Computer Networking course taught by Professor Meng Zili.

${TEACHER_PERSONA}


When analyzing uploaded PDF materials (lecture notes, textbook pages, exam papers, tutorials):
- Carefully read and understand the content of the uploaded document
- Explain the content clearly and concisely
- Highlight key networking concepts, protocols, formulas, and definitions
- Relate the content to ELEC3120 course topics (Network Fundamentals, Transport Layer UDP/TCP, Reliable Transmission, TCP Connection Management, Flow & Congestion Control, Web & HTTP, Video Streaming)
- If the document contains exam questions, help solve them step by step
- If the document contains code, analyze it and explain the networking concepts involved
- If the document contains diagrams or figures, describe and explain them
- Use the Answer-Evidence-Warrant structure for explanations
- FOCUSED ANSWER: Answer ONLY what the user asks. Do NOT add unrelated background topics or prefaces. Ignore retrieved chunks that aren't relevant to the question.
- Default reply language: **English**. Switch to another language only if the user writes their question in that language. When responding in Chinese, you MUST output Traditional Chinese characters ONLY (Hong Kong / Taiwan usage). 絕對禁止輸出任何簡體字。If you catch a Simplified character, rewrite the sentence in Traditional before outputting.
- Use markdown formatting for clarity (headers, bullet points, code blocks, tables)
- Always reference relevant ELEC3120 course topics when applicable

Be helpful, accurate, and encouraging. If unsure, say so honestly.`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fileData, fileName, textPrompt, language, conversationId, imageData } = body;

    if (!fileData) {
      return Response.json(
        { error: 'PDF file data is required' },
        { status: 400 }
      );
    }

    const prompt = textPrompt && textPrompt.trim() !== ''
      ? textPrompt
      : language === 'zh'
        ? `請分析呢份 PDF 檔案「${fileName || '檔案'}」。如果涉及電腦網絡知識，請結合 ELEC3120 課程內容進行講解。`
        : `Please analyze this PDF document "${fileName || 'document'}". If it relates to computer networking, explain it in the context of ELEC3120 course material.`;

    // Store user message in database
    if (conversationId) {
      const userContent = textPrompt?.trim()
        ? `${textPrompt.trim()} (PDF: ${fileName || 'document'})`
        : `Uploaded PDF: ${fileName || 'document'}`;

      await db.message.create({
        data: {
          conversationId,
          role: 'user',
          content: userContent,
          hasPdf: true,
          imageData: imageData || undefined,
        },
      });

      // Update conversation timestamp
      await db.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });
    }

    // Extract text server-side so we can pass to a normal text LLM.
    // Supports PDF, DOCX, PPTX and a wide range of plain-text/code files.
    let extracted;
    try {
      extracted = await extractFileText(fileName || 'document', fileData);
    } catch (err) {
      console.error('[chat/pdf] File text extraction failed:', err);
      return Response.json(
        {
          error:
            language === 'zh'
              ? `無法讀取呢個檔案「${fileName || ''}」，可能係加密、損毀，或者格式未支援。`
              : `Could not read this file "${fileName || ''}". It may be encrypted, damaged, or in an unsupported format.`,
        },
        { status: 400 },
      );
    }

    if (extracted.kind === 'image') {
      return Response.json(
        {
          error:
            language === 'zh'
              ? '請使用「上傳圖片」按鈕上傳圖片，唔係用檔案上傳。'
              : 'Please upload images via the "Upload Image" button instead.',
        },
        { status: 400 },
      );
    }

    if (extracted.kind === 'unsupported') {
      return Response.json(
        {
          error:
            language === 'zh'
              ? '呢個檔案係二進制格式（例如 .exe、.zip、.mp4 等），未支援。請上傳 PDF、Word（.docx）、PowerPoint（.pptx）或者文字／程式碼檔。'
              : 'This file is a binary format (e.g. .exe, .zip, .mp4) and is not supported. Please upload PDF, Word (.docx), PowerPoint (.pptx), or any text/code file.',
        },
        { status: 400 },
      );
    }

    const fileText = extracted.text;
    if (!fileText || fileText.trim().length < 2) {
      return Response.json(
        {
          error:
            language === 'zh'
              ? '呢個檔案入面冇可讀文字（可能係掃描檔或者純圖片）。'
              : 'This file contains no readable text (it may be scanned or image-only).',
        },
        { status: 400 },
      );
    }

    // Cap the text we send so we stay well within model context limits.
    const MAX_FILE_CHARS = 60_000;
    const truncated = fileText.length > MAX_FILE_CHARS;
    const fileTextForLLM = truncated
      ? fileText.slice(0, MAX_FILE_CHARS)
      : fileText;

    const kindLabel = extracted.kind.toUpperCase();
    const userText = [
      `${prompt}`,
      '',
      `--- ${kindLabel}: ${fileName || 'document'} ---`,
      fileTextForLLM,
      truncated
        ? `\n--- (File truncated to first ${MAX_FILE_CHARS.toLocaleString()} characters; total was ${fileText.length.toLocaleString()}) ---`
        : `--- END ${kindLabel} ---`,
    ].join('\n');

    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userText },
    ];

    const result = await openrouterChat(messages, {
      model: process.env.OPENROUTER_MODEL,
      timeout: 180_000,
    });

    if (result.error) {
      throw new Error(result.error);
    }

    const content = result.text;
    if (!content) {
      throw new Error('Empty response from VLM');
    }

    // Store assistant message in database
    if (conversationId) {
      await db.message.create({
        data: {
          conversationId,
          role: 'assistant',
          content: content,
        },
      });
    }

    // Create streaming response — same pattern as vision route
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
    console.error('Error in PDF chat API:', error);
    return Response.json(
      { error: 'Failed to analyze PDF. Please try again.' },
      { status: 500 }
    );
  }
}
