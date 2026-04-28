// Shared PDF & text extraction helpers used by both the upload API route
// and scripts (e.g. the lecture seed script). Output embeds page markers
// of the form `[PAGE_MARKER:N]` on their own lines so downstream search can
// resolve citations to page numbers.

export const PAGE_MARKER_REGEX = /\[PAGE_MARKER:(\d+)\]/g;
const CHARS_PER_PAGE_ESTIMATE = 2500;

/**
 * Estimate and insert page markers for plain text documents.
 */
export function insertPageMarkersForText(text: string): string {
  if (PAGE_MARKER_REGEX.test(text)) {
    PAGE_MARKER_REGEX.lastIndex = 0;
    return text;
  }
  PAGE_MARKER_REGEX.lastIndex = 0;

  const lines = text.split('\n');
  const result: string[] = [];
  let charCount = 0;
  let pageNumber = 1;

  result.push(`[PAGE_MARKER:1]`);

  for (const line of lines) {
    result.push(line);
    charCount += line.length + 1;
    if (charCount >= CHARS_PER_PAGE_ESTIMATE) {
      if (line.trim() === '') {
        pageNumber++;
        result.push(`[PAGE_MARKER:${pageNumber}]`);
        charCount = 0;
      } else if (charCount >= CHARS_PER_PAGE_ESTIMATE * 1.3) {
        pageNumber++;
        result.push(`[PAGE_MARKER:${pageNumber}]`);
        charCount = 0;
      }
    }
  }

  return result.join('\n');
}

/**
 * High-level PDF → text helper. Primary path uses `pdf-parse` which
 * handles CID-encoded subset fonts (common in lecture slides) correctly.
 * Falls back to the regex-based extractor if pdf-parse fails for any
 * reason. Output includes `[PAGE_MARKER:N]` separators so citation
 * page numbers can be resolved downstream.
 */
export async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    // Capture per-page text via pdf-parse's pagerender callback so we can
    // emit real [PAGE_MARKER:N] separators for citation page numbers.
    // pdf-parse v1 is a CommonJS module; use its inner lib entry to avoid
    // the well-known "debug mode reads a test PDF at import time" issue.
    const pdfParseMod = await import('pdf-parse/lib/pdf-parse.js');
    const pdf = (pdfParseMod.default ?? pdfParseMod) as (
      buf: Buffer,
      opts?: { pagerender?: (pageData: { getTextContent: (opts: { normalizeWhitespace: boolean; disableCombineTextItems: boolean }) => Promise<{ items: Array<{ str: string; transform: number[] }> }> }) => Promise<string> },
    ) => Promise<{ text: string; numpages: number }>;

    const pages: string[] = [];
    const render = async (pageData: Parameters<NonNullable<Parameters<typeof pdf>[1]>['pagerender']>[0]) => {
      const tc = await pageData.getTextContent({
        normalizeWhitespace: true,
        disableCombineTextItems: false,
      });
      let lastY: number | null = null;
      const parts: string[] = [];
      for (const it of tc.items) {
        const y = it.transform?.[5];
        if (lastY !== null && y !== lastY) parts.push('\n');
        parts.push(it.str);
        lastY = y ?? lastY;
      }
      const pageText = parts.join('');
      pages.push(pageText);
      return pageText;
    };

    const data = await pdf(buffer, { pagerender: render });
    if (pages.length > 0) {
      const out: string[] = [];
      for (let i = 0; i < pages.length; i++) {
        out.push(`[PAGE_MARKER:${i + 1}]`);
        out.push(pages[i]);
      }
      return out.join('\n');
    }
    // Fallback: pdf-parse gave us full text but no per-page breakdown.
    if (data.text && data.text.trim().length > 0) {
      return insertPageMarkersForText(data.text);
    }
  } catch (err) {
    console.warn('[pdf-extract] pdf-parse failed, falling back to regex extractor:', err);
  }
  return extractTextFromPDFBuffer(buffer);
}

/**
 * Extract text from a PDF buffer with page boundary detection.
 */
export function extractTextFromPDFBuffer(buffer: Buffer): string {
  const raw = buffer.toString('latin1');
  const allLines: { text: string; page: number }[] = [];

  const pagePositions: number[] = [];
  const pageTypeRegex = /\/Type\s*\/Page(?!\s*s)/g;
  let pageMatch;
  while ((pageMatch = pageTypeRegex.exec(raw)) !== null) {
    pagePositions.push(pageMatch.index);
  }
  pagePositions.sort((a, b) => a - b);

  interface TextBlock {
    text: string;
    position: number;
  }
  const blocks: TextBlock[] = [];

  const textObjRegex = /BT\s*([\s\S]*?)\s*ET/g;
  let match;
  while ((match = textObjRegex.exec(raw)) !== null) {
    const block = match[1];
    const lines: string[] = [];

    const tjRegex = /\(([^)]*)\)\s*Tj/g;
    let tjMatch;
    while ((tjMatch = tjRegex.exec(block)) !== null) {
      const decoded = decodePDFString(tjMatch[1]).trim();
      if (looksLikeReadableText(decoded)) lines.push(decoded);
    }
    const tjArrayRegex = /\[(.*?)\]\s*TJ/gi;
    let tjArrayMatch;
    while ((tjArrayMatch = tjArrayRegex.exec(block)) !== null) {
      const arrayContent = tjArrayMatch[1];
      const strRegex = /\(([^)]*)\)/g;
      let strMatch;
      while ((strMatch = strRegex.exec(arrayContent)) !== null) {
        const decoded = decodePDFString(strMatch[1]).trim();
        if (looksLikeReadableText(decoded)) lines.push(decoded);
      }
    }

    if (lines.length > 0) {
      blocks.push({ text: lines.join('\n'), position: match.index });
    }
  }

  if (blocks.length === 0) {
    const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
    let streamMatch;
    while ((streamMatch = streamRegex.exec(raw)) !== null) {
      const stream = streamMatch[1];
      const lines: string[] = [];
      const strRegex = /\(([^)]{1,200})\)/g;
      let strMatch;
      while ((strMatch = strRegex.exec(stream)) !== null) {
        const decoded = decodePDFString(strMatch[1]).trim();
        if (looksLikeReadableText(decoded)) lines.push(decoded);
      }
      if (lines.length > 0) {
        blocks.push({ text: lines.join('\n'), position: streamMatch.index });
      }
    }
  }

  if (pagePositions.length > 0) {
    for (const block of blocks) {
      let pageNum = 1;
      for (let i = pagePositions.length - 1; i >= 0; i--) {
        if (block.position >= pagePositions[i]) {
          pageNum = i + 1;
          break;
        }
      }
      allLines.push({ text: block.text, page: pageNum });
    }
  } else {
    let charAcc = 0;
    let pageNum = 1;
    for (const block of blocks) {
      allLines.push({ text: block.text, page: pageNum });
      charAcc += block.text.length;
      if (charAcc >= CHARS_PER_PAGE_ESTIMATE) {
        pageNum++;
        charAcc = 0;
      }
    }
  }

  if (allLines.length === 0) return '';

  const result: string[] = [];
  let currentPage = allLines[0].page;
  result.push(`[PAGE_MARKER:${currentPage}]`);
  for (const item of allLines) {
    if (item.page !== currentPage) {
      currentPage = item.page;
      result.push(`[PAGE_MARKER:${currentPage}]`);
    }
    result.push(item.text);
  }

  return result.join('\n');
}

function decodePDFString(str: string): string {
  let result = str.replace(/\\([0-7]{1,3})/g, (_, octal) => String.fromCharCode(parseInt(octal, 8)));
  result = result.replace(/\\([0-9a-fA-F]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  result = result.replace(/\\n/g, ' ').replace(/\\r/g, ' ').replace(/\\t/g, ' ');
  result = result.replace(/\\\\/g, '\\').replace(/\\\(/g, '(').replace(/\\\)/g, ')');
  return result;
}

/**
 * Heuristic: keep only strings that look like real prose — mostly printable
 * characters (ASCII letters/digits/punctuation or common unicode), at most
 * a small fraction of control/binary bytes. This suppresses the compressed
 * stream fragments my regex-based extractor sometimes picks up from
 * lecture PDFs that use CID-encoded fonts.
 */
function looksLikeReadableText(s: string): boolean {
  if (!s) return false;
  const trimmed = s.trim();
  if (!trimmed) return false;

  // Reject tokens with any meaningful amount of binary control bytes —
  // these are the strongest "this is a compressed stream" signal.
  let total = 0;
  let control = 0;
  for (const ch of trimmed) {
    const code = ch.codePointAt(0)!;
    total++;
    if (code < 0x20 && ch !== '\n' && ch !== '\t') control++;
  }
  if (control / total > 0.05) return false;

  // Short tokens: allow if they're pure ASCII printable / CJK. This keeps
  // real technical labels like "IP", "L2", "R1", "Wi-Fi" without letting
  // high-bit Latin-1 glyphs through.
  if (trimmed.length < 6) {
    for (const ch of trimmed) {
      const code = ch.codePointAt(0)!;
      const isAsciiPrintable = code >= 0x20 && code <= 0x7e;
      const isCJK = code >= 0x3000 && code <= 0x9fff;
      if (!isAsciiPrintable && !isCJK) return false;
    }
    // And must have at least one letter/digit/CJK char (not pure punctuation).
    return /[A-Za-z0-9\u4e00-\u9fff]/.test(trimmed);
  }

  // Longer tokens (>=6 chars) must look like actual prose: require a real
  // word (3+ consecutive ASCII letters or 2+ CJK) and at least 50% of chars
  // be letters/digits/spaces — this rejects CID-font gibberish with the
  // occasional ASCII fragment like "å¾ãSqwDPÂÃ>.äîÇÔÓZF~½=".
  if (!/[A-Za-z]{3,}|[\u4e00-\u9fff]{2,}/.test(trimmed)) return false;
  const lettersOrDigits = trimmed.match(/[A-Za-z0-9\u4e00-\u9fff\s]/g);
  if (!lettersOrDigits || lettersOrDigits.length / total < 0.5) return false;
  return true;
}

export function splitIntoChunks(text: string, maxChunkSize: number, overlap: number): string[] {
  const chunks: string[] = [];
  if (!text || text.length === 0) return chunks;

  let start = 0;
  while (start < text.length) {
    let end = Math.min(start + maxChunkSize, text.length);
    if (end < text.length) {
      const lastPeriod = text.lastIndexOf('.', end);
      const lastNewline = text.lastIndexOf('\n', end);
      const breakPoint = Math.max(lastPeriod, lastNewline);
      if (breakPoint > start + maxChunkSize * 0.5) end = breakPoint + 1;
    }
    chunks.push(text.slice(start, end).trim());
    if (end >= text.length) break;
    const nextStart = end - overlap;
    start = nextStart > start ? nextStart : start + 1;
    if (chunks.length > 10000) break;
  }
  return chunks.filter((c) => c.length > 0);
}
