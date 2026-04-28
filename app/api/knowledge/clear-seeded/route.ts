/**
 * Remove all seeded lecture KnowledgeDocument rows (those whose title
 * starts with `L` + two digits + ` — `). Leaves user-uploaded documents
 * untouched. Use this if the seeded content turns out to be garbage
 * (e.g. CID-encoded PDFs where regex extraction fails).
 */
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    const all = await db.knowledgeDocument.findMany({ select: { id: true, title: true } });
    const toDelete = all.filter((d) => /^L\d{2}\s—\s/.test(d.title));
    const result = await db.knowledgeDocument.deleteMany({
      where: { id: { in: toDelete.map((d) => d.id) } },
    });
    return NextResponse.json({
      deleted: result.count,
      titles: toDelete.map((d) => d.title),
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `Failed: ${msg}` }, { status: 500 });
  }
}
