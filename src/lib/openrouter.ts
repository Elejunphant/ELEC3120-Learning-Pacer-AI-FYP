import { db } from '@/lib/db';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ContentPart {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: { url: string };
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | ContentPart[];
}

export interface OpenRouterOptions {
  model?: string;
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
  timeout?: number;
}

interface OpenRouterResult {
  text?: string;
  stream?: ReadableStream;
  error?: string;
}

export interface OpenRouterImageResult {
  imageUrl?: string;
  text?: string;
  error?: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const DEFAULT_MODEL = process.env.OPENROUTER_MODEL || 'deepseek/deepseek-v4-flash';

// Reasoning configuration is intentionally NOT applied by default.
// Both `effort: 'low'` and `exclude: true` were observed to break
// deepseek-v4-pro: the former exhausted the reasoning budget before any
// content was produced, the latter returned a fully empty response.
// Letting the model use its own defaults yields a proper `content` reply
// and still streams reasoning tokens through `delta.reasoning`, which the
// stream parser below wraps in [[LP_THINK]]…[[/LP_THINK]] for the UI.

// Sentinels used to wrap reasoning ("thinking") tokens in the streaming
// text so the frontend can render them in a separate collapsible block.
const THINK_OPEN = '[[LP_THINK]]';
const THINK_CLOSE = '[[/LP_THINK]]';

const REQUEST_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  'HTTP-Referer': 'https://learningpacer.app',
  'X-Title': 'LearningPacer',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Retrieve the OpenRouter API key.
 *
 * Priority:
 *  1. `process.env.OPENROUTER_API_KEY`
 *  2. `AdminSetting` table  (key = 'openrouter_api_key')
 *  3. Returns empty string when neither is available.
 */
export async function getOpenRouterApiKey(): Promise<string> {
  // 1. Environment variable takes precedence (OPENROUTER_API_KEY or OPENAI_API_KEY)
  const envKey =
    process.env.OPENROUTER_API_KEY?.trim() || process.env.OPENAI_API_KEY?.trim();
  if (envKey) return envKey;

  // 2. Fall back to the database
  try {
    const setting = await db.adminSetting.findUnique({
      where: { key: 'openrouter_api_key' },
    });
    if (setting?.value?.trim()) return setting.value.trim();
  } catch (err) {
    console.error('[openrouter] Failed to read API key from database:', err);
  }

  return '';
}

// ─── Main function ──────────────────────────────────────────────────────────

/**
 * Send a chat completion request to the OpenRouter API.
 *
 * - When `options.stream` is `true`, returns `{ stream: ReadableStream }`
 *   whose chunks are **plain text** tokens extracted from the SSE data
 *   (`data: {"choices":[{"delta":{"content":"..."}}]}`) envelope.
 * - When `options.stream` is falsy (default), returns `{ text: string }`.
 * - On failure, returns `{ error: string }`.
 */
export async function openrouterChat(
  messages: ChatMessage[],
  options?: OpenRouterOptions,
): Promise<OpenRouterResult> {
  const apiKey = await getOpenRouterApiKey();
  if (!apiKey) {
    return { error: 'No OpenRouter API key configured' };
  }

  const model = options?.model || DEFAULT_MODEL;

  const body: Record<string, unknown> = {
    model,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  };

  if (options?.temperature !== undefined) body.temperature = options.temperature;
  if (options?.max_tokens !== undefined) body.max_tokens = options.max_tokens;
  if (options?.stream) body.stream = true;
  // Ask OpenRouter to pick the highest-throughput provider so we avoid
  // routing to a slow backend when faster ones are available.
  body.provider = { sort: 'throughput' };

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        ...REQUEST_HEADERS,
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(options?.timeout || 180_000), // 3-minute default timeout
    });

    // ── Non-OK HTTP status ─────────────────────────────────────────────────
    if (!response.ok) {
      let detail = `HTTP ${response.status}`;
      try {
        const errBody = await response.json();
        detail = errBody?.error?.message || errBody?.error || detail;
      } catch {
        // response body wasn't valid JSON – keep the status string
      }
      return { error: detail };
    }

    // ── Streaming path ─────────────────────────────────────────────────────
    if (options?.stream) {
      const stream: ReadableStream<Uint8Array> = new ReadableStream({
        async start(controller) {
          const reader = response.body?.getReader();
          if (!reader) {
            controller.error(new Error('No response body'));
            return;
          }

          const decoder = new TextDecoder();
          const encoder = new TextEncoder();
          let buffer = '';
          // Track whether we're currently emitting reasoning ("thinking")
          // tokens. When the stream switches between reasoning and content
          // we wrap the reasoning blocks in [[LP_THINK]]…[[/LP_THINK]] so
          // the frontend can render them in a collapsible "thinking" panel.
          let mode: 'init' | 'think' | 'content' = 'init';

          const handleDelta = (delta: { content?: string; reasoning?: string; reasoning_content?: string } | undefined) => {
            if (!delta) return;
            const reasoningTok = delta.reasoning ?? delta.reasoning_content;
            const contentTok = delta.content;

            if (reasoningTok) {
              if (mode !== 'think') {
                controller.enqueue(encoder.encode(THINK_OPEN));
                mode = 'think';
              }
              controller.enqueue(encoder.encode(reasoningTok));
            }
            if (contentTok) {
              if (mode === 'think') {
                controller.enqueue(encoder.encode(THINK_CLOSE));
              }
              mode = 'content';
              controller.enqueue(encoder.encode(contentTok));
            }
          };

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              // Keep the last (possibly incomplete) line in the buffer
              buffer = lines.pop() || '';

              for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || !trimmed.startsWith('data: ')) continue;

                const payload = trimmed.slice(6); // strip "data: "
                if (payload === '[DONE]') {
                  if (mode === 'think') controller.enqueue(encoder.encode(THINK_CLOSE));
                  controller.close();
                  return;
                }

                try {
                  const parsed = JSON.parse(payload);
                  handleDelta(parsed.choices?.[0]?.delta);
                } catch {
                  // Ignore malformed JSON lines – OpenRouter may send keep-alive comments
                }
              }
            }

            // Process any remaining data in the buffer
            if (buffer.trim()) {
              const trimmed = buffer.trim();
              if (trimmed.startsWith('data: ') && trimmed.slice(6) !== '[DONE]') {
                try {
                  const parsed = JSON.parse(trimmed.slice(6));
                  handleDelta(parsed.choices?.[0]?.delta);
                } catch {
                  // Ignore
                }
              }
            }

            if (mode === 'think') controller.enqueue(encoder.encode(THINK_CLOSE));
            controller.close();
          } catch (err) {
            controller.error(err);
          }
        },
      });

      return { stream };
    }

    // ── Non-streaming path ─────────────────────────────────────────────────
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;

    if (!text) {
      return { error: 'Empty response from OpenRouter' };
    }

    return { text };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { error: `OpenRouter request failed: ${message}` };
  }
}

// ─── Image generation ───────────────────────────────────────────────────────

const DEFAULT_IMAGE_MODEL =
  process.env.OPENROUTER_IMAGE_MODEL || 'google/gemini-2.5-flash-image';

export async function openrouterImage(
  prompt: string,
  options?: { model?: string; timeout?: number; modalities?: string[] },
): Promise<OpenRouterImageResult> {
  const apiKey = await getOpenRouterApiKey();
  if (!apiKey) {
    return { error: 'No OpenRouter API key configured' };
  }

  const model = options?.model || DEFAULT_IMAGE_MODEL;
  // Image-only models (like bytedance-seed/seedream-4.5) reject ['image','text'].
  // Default to image-only; gemini-style models that need both text+image can override.
  const modalities = options?.modalities || ['image'];

  const body = {
    model,
    messages: [{ role: 'user', content: prompt }],
    modalities,
  };

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        ...REQUEST_HEADERS,
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(options?.timeout || 120_000),
    });

    if (!response.ok) {
      let detail = `HTTP ${response.status}`;
      try {
        const errBody = await response.json();
        detail = errBody?.error?.message || errBody?.error || detail;
      } catch {
        // ignore
      }
      return { error: detail };
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message;

    // Try every known response shape:
    let imageUrl: string | undefined;
    let text = '';

    // Shape A: message.images = [{ image_url: { url } }]
    if (Array.isArray(message?.images)) {
      for (const img of message.images) {
        const u = img?.image_url?.url || img?.url;
        if (typeof u === 'string') { imageUrl = u; break; }
      }
    }

    // Shape B: message.content is a string — could be plain text or a data URL
    if (!imageUrl && typeof message?.content === 'string') {
      const c = message.content.trim();
      if (c.startsWith('data:image/') || /^https?:\/\/\S+\.(png|jpe?g|webp|gif)/i.test(c)) {
        imageUrl = c;
      } else {
        text = c;
      }
    }

    // Shape C: message.content is an array of parts (image_url + text mixed)
    if (Array.isArray(message?.content)) {
      for (const p of message.content as Array<{ type?: string; text?: string; image_url?: { url?: string } | string }>) {
        if (!imageUrl && (p?.type === 'image_url' || p?.type === 'image')) {
          const u = typeof p.image_url === 'string' ? p.image_url : p.image_url?.url;
          if (typeof u === 'string') imageUrl = u;
        } else if (p?.type === 'text' && p.text) {
          text += p.text;
        }
      }
    }

    if (!imageUrl) {
      console.error('[openrouter] No image found in response. Full payload:', JSON.stringify(data).slice(0, 1500));
      return { error: 'No image returned from model' };
    }

    return { imageUrl, text };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { error: `OpenRouter image request failed: ${message}` };
  }
}
