/**
 * Standalone CLI wrapper for the lecture-seeding endpoint.
 *
 * The actual logic lives in `src/app/api/knowledge/seed-lectures/route.ts`
 * so it runs inside Next.js (where the Prisma engine works correctly).
 * This script simply POSTs to that endpoint.
 *
 * Usage:  bun run scripts/seed-lectures.ts [baseUrl] [zipPath]
 *   baseUrl defaults to http://localhost:5000
 *   zipPath is optional; server defaults to the latest attached zip.
 */
const baseUrl = process.argv[2] || 'http://localhost:5000';
const zipPath = process.argv[3];

const url = new URL('/api/knowledge/seed-lectures', baseUrl);
if (zipPath) url.searchParams.set('path', zipPath);

console.log(`POST ${url}`);
const res = await fetch(url, { method: 'POST' });
const body = await res.text();
console.log('status:', res.status);
console.log(body);
