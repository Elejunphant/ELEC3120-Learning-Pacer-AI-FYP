import AdmZip from 'adm-zip';
import { extractPdfText } from '@/lib/pdf-extract';

export interface ExtractedFile {
  text: string;
  kind:
    | 'pdf'
    | 'docx'
    | 'pptx'
    | 'text'
    | 'image'
    | 'unsupported';
}

const TEXT_EXTENSIONS = new Set([
  'txt', 'md', 'markdown', 'rst', 'log',
  'csv', 'tsv', 'json', 'jsonl', 'ndjson', 'xml', 'yaml', 'yml', 'toml', 'ini', 'conf', 'env',
  'html', 'htm', 'css', 'scss', 'sass', 'less',
  'js', 'jsx', 'ts', 'tsx', 'mjs', 'cjs',
  'py', 'rb', 'php', 'go', 'rs', 'java', 'kt', 'kts', 'scala', 'swift', 'm', 'mm',
  'c', 'cc', 'cpp', 'cxx', 'h', 'hpp', 'hxx',
  'cs', 'fs', 'vb',
  'sh', 'bash', 'zsh', 'fish', 'ps1', 'bat', 'cmd',
  'sql', 'graphql', 'gql', 'proto',
  'r', 'jl', 'lua', 'pl', 'pm', 'vim',
  'tex', 'bib', 'srt', 'vtt',
  'gitignore', 'dockerignore', 'editorconfig', 'dockerfile',
]);

const IMAGE_EXTENSIONS = new Set([
  'png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg', 'tiff', 'tif', 'heic',
]);

function getExtension(fileName: string): string {
  const idx = fileName.lastIndexOf('.');
  if (idx === -1) return fileName.toLowerCase();
  return fileName.slice(idx + 1).toLowerCase();
}

// Hard cap on uncompressed size for any single archive entry (DOCX/PPTX).
// Protects against zip-bomb style payloads that decompress to gigabytes.
const MAX_ENTRY_UNCOMPRESSED = 25 * 1024 * 1024; // 25 MB
// Hard cap on total uncompressed text we will read from one archive.
const MAX_TOTAL_UNCOMPRESSED = 60 * 1024 * 1024; // 60 MB

function looksLikeBinary(raw: string): boolean {
  if (raw.length === 0) return false;
  let nul = 0;
  let ctrl = 0;
  // Sample up to first 64 KB for speed
  const sampleLen = Math.min(raw.length, 65536);
  for (let i = 0; i < sampleLen; i++) {
    const c = raw.charCodeAt(i);
    if (c === 0) nul++;
    // Control chars excluding tab(9), LF(10), CR(13), and anything >= 32
    else if (c < 32 && c !== 9 && c !== 10 && c !== 13) ctrl++;
  }
  // > 0.5% NULs, or > 5% non-printable control chars → binary
  return nul / sampleLen > 0.005 || ctrl / sampleLen > 0.05;
}

function stripXmlToText(xml: string): string {
  return xml
    .replace(/<w:tab\s*\/?>/g, '\t')
    .replace(/<w:br\s*\/?>/g, '\n')
    .replace(/<\/w:p>/g, '\n')
    .replace(/<a:br\s*\/?>/g, '\n')
    .replace(/<\/a:p>/g, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function safeReadEntry(entry: AdmZip.IZipEntry): string {
  const uncompressed = entry.header?.size ?? 0;
  if (uncompressed > MAX_ENTRY_UNCOMPRESSED) {
    throw new Error(`Archive entry too large: ${entry.entryName}`);
  }
  return entry.getData().toString('utf-8');
}

function extractDocxText(buffer: Buffer): string {
  const zip = new AdmZip(buffer);
  const entry = zip.getEntry('word/document.xml');
  if (!entry) throw new Error('document.xml not found in DOCX');
  const xml = safeReadEntry(entry);
  return stripXmlToText(xml);
}

function extractPptxText(buffer: Buffer): string {
  const zip = new AdmZip(buffer);
  const slideEntries = zip
    .getEntries()
    .filter((e) => /^ppt\/slides\/slide\d+\.xml$/.test(e.entryName))
    .sort((a, b) => {
      const an = parseInt(a.entryName.match(/slide(\d+)\.xml$/)?.[1] || '0', 10);
      const bn = parseInt(b.entryName.match(/slide(\d+)\.xml$/)?.[1] || '0', 10);
      return an - bn;
    });

  if (slideEntries.length === 0) throw new Error('No slides found in PPTX');

  const parts: string[] = [];
  let totalRead = 0;
  for (let idx = 0; idx < slideEntries.length; idx++) {
    const e = slideEntries[idx];
    totalRead += e.header?.size ?? 0;
    if (totalRead > MAX_TOTAL_UNCOMPRESSED) {
      throw new Error('PPTX exceeds maximum total uncompressed size');
    }
    const xml = safeReadEntry(e);
    const text = stripXmlToText(xml);
    if (text.trim()) {
      parts.push(`--- Slide ${idx + 1} ---\n${text}`);
    }
  }
  return parts.join('\n\n');
}

/**
 * Extract readable text from an uploaded file (base64 encoded).
 * Supports: PDF, DOCX, PPTX, and a wide range of plain-text/code formats.
 */
export async function extractFileText(
  fileName: string,
  base64Data: string,
): Promise<ExtractedFile> {
  const ext = getExtension(fileName);
  const buffer = Buffer.from(base64Data, 'base64');

  // Server-side hard cap on raw upload size (defense in depth — frontend
  // also enforces 10MB but client checks are bypassable).
  const MAX_UPLOAD_BYTES = 15 * 1024 * 1024; // 15 MB
  if (buffer.length > MAX_UPLOAD_BYTES) {
    throw new Error(`File too large (${buffer.length} bytes)`);
  }

  if (ext === 'pdf') {
    const text = await extractPdfText(buffer);
    return { text, kind: 'pdf' };
  }

  if (ext === 'docx') {
    return { text: extractDocxText(buffer), kind: 'docx' };
  }

  if (ext === 'pptx') {
    return { text: extractPptxText(buffer), kind: 'pptx' };
  }

  if (IMAGE_EXTENSIONS.has(ext)) {
    return { text: '', kind: 'image' };
  }

  // Treat anything else as plain text (also handles files without extensions
  // and uncommon code/data extensions). Reject if content sniffs as binary.
  const raw = buffer.toString('utf-8');
  if (looksLikeBinary(raw)) {
    return { text: '', kind: 'unsupported' };
  }
  return { text: raw, kind: 'text' };
}
