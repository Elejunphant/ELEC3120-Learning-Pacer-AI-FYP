/**
 * One-shot endpoint that seeds the KnowledgeDocument table from the
 * ELEC3120 lecture zip attachment stored under `attached_assets/`.
 *
 * Picks the latest `Lecture_*.zip`, extracts one PDF per lecture number
 * (preferring the largest variant when duplicates exist), parses each
 * one with our shared PDF extractor, and upserts it into the DB.
 *
 * Trigger once after deploy:  curl -X POST http://localhost:5000/api/knowledge/seed-lectures
 */
import fs from 'node:fs';
import path from 'node:path';
import AdmZip from 'adm-zip';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';
import {
  PAGE_MARKER_REGEX,
  extractPdfText,
  splitIntoChunks,
} from '@/lib/pdf-extract';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const LECTURE_TITLES: Record<string, string> = {
  '01': 'L01 — Introduction',
  '02': 'L02 — Web (HTTP & DNS)',
  '03': 'L03 — Video Streaming',
  '05': 'L05 — Transport Layer Model',
  '06': 'L06 — TCP Basics',
  '07': 'L07 — Congestion Control',
  '08': 'L08 — Advanced Congestion Control',
  '09': 'L09 — Queueing',
  '10': 'L10 — IP (Network Layer)',
  '11': 'L11 — BGP (Inter-domain Routing)',
  '12': 'L12 — Internet Architecture',
  '13': 'L13 — LAN',
  '14': 'L14 — Distance Vector Routing',
  '15': 'L15 — Link Layer',
  '16': 'L16 — Wireless',
  '17': 'L17 — New Networks',
  '18': 'L18 — Security',
};

function findDefaultZip(): string | null {
  const dir = path.resolve('attached_assets');
  if (!fs.existsSync(dir)) return null;
  const candidates = fs
    .readdirSync(dir)
    .filter((f) => /^Lecture_.*\.zip$/i.test(f))
    .map((f) => ({ f, mtime: fs.statSync(path.join(dir, f)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);
  return candidates[0] ? path.join(dir, candidates[0].f) : null;
}

function parseLectureNumber(entryName: string): string | null {
  const base = path.basename(entryName);
  const m = base.match(/^(\d{2})[-_ ]/);
  return m ? m[1] : null;
}

export async function POST(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    const { searchParams } = new URL(request.url);
    const rawPath = searchParams.get('path');
    // Constrain the path parameter to files under attached_assets/ so this
    // endpoint can't be abused to open arbitrary server files.
    const attachedDir = path.resolve('attached_assets');
    let zipPath: string | null;
    if (rawPath) {
      const resolved = path.resolve(rawPath);
      if (!resolved.startsWith(attachedDir + path.sep) && resolved !== attachedDir) {
        return NextResponse.json(
          { error: 'path must be inside attached_assets/' },
          { status: 400 },
        );
      }
      zipPath = resolved;
    } else {
      zipPath = findDefaultZip();
    }
    if (!zipPath || !fs.existsSync(zipPath)) {
      return NextResponse.json(
        { error: 'Lecture zip not found. Upload it to attached_assets/ first.' },
        { status: 400 },
      );
    }

    const zip = new AdmZip(zipPath);
    const entries = zip.getEntries();

    const bestByLecture = new Map<string, (typeof entries)[number]>();
    for (const entry of entries) {
      if (entry.isDirectory) continue;
      if (!entry.entryName.toLowerCase().endsWith('.pdf')) continue;
      const num = parseLectureNumber(entry.entryName);
      if (!num) continue;
      const current = bestByLecture.get(num);
      const size = entry.header.size;
      if (!current || size > current.header.size) {
        bestByLecture.set(num, entry);
      }
    }

    const lectureNums = [...bestByLecture.keys()].sort();
    const results: Array<{
      title: string;
      chars: number;
      chunks: number;
      replaced: number;
      skipped?: string;
    }> = [];

    for (const num of lectureNums) {
      const entry = bestByLecture.get(num)!;
      const title =
        LECTURE_TITLES[num] || `L${num} — ${path.basename(entry.entryName, '.pdf')}`;

      const buffer = entry.getData();
      const extracted = await extractPdfText(buffer);
      const clean = extracted.replace(PAGE_MARKER_REGEX, '');

      if (!clean.trim()) {
        results.push({ title, chars: 0, chunks: 0, replaced: 0, skipped: 'no text extracted' });
        continue;
      }

      const chunks = splitIntoChunks(clean, 2000, 200);

      const deleted = await db.knowledgeDocument.deleteMany({ where: { title } });

      await db.knowledgeDocument.create({
        data: {
          title,
          content: extracted,
          fileType: 'pdf',
          fileSize: entry.header.size,
          chunkCount: chunks.length,
        },
      });

      results.push({ title, chars: clean.length, chunks: chunks.length, replaced: deleted.count });
    }

    return NextResponse.json({
      zipPath,
      inserted: results.filter((r) => !r.skipped).length,
      skipped: results.filter((r) => r.skipped).length,
      results,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('seed-lectures error:', error);
    return NextResponse.json({ error: `Failed to seed lectures: ${msg}` }, { status: 500 });
  }
}
