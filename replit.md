# LearningPacer — ELEC3120 Virtual TA

A Next.js 16 + Prisma (SQLite) + Tailwind + shadcn/ui learning app that acts
as a virtual teaching assistant for HKUST ELEC3120 Computer Networks.
Originally designed for Vercel; now running on Replit and intended to be
published via Replit Deployments.

## Dev

```
bun run dev   # Next.js dev server on 0.0.0.0:5000 (configured as workflow "Start application")
```

The app uses Prisma against the Replit-provisioned **Postgres** database
specified by `DATABASE_URL` (see `prisma/schema.prisma`). `src/lib/db.ts`
exports a single shared `PrismaClient` instance that is reused across hot
reloads in development.

Workflow: `Start application` runs `bun run dev`.

## Knowledge base

Two layers, both searched by `searchKnowledgeBase` in `src/app/api/chat/route.ts`:

1. **Curated topics** (`src/lib/knowledge-base.ts`) — authoritative source of
   truth. ~20 bilingual (EN/中文) topics, each with a `source` label that maps
   to the actual ELEC3120 lecture (e.g. `"ELEC3120 L07 — Congestion Control"`).
   These drive the majority of citations in chat answers.
2. **Uploaded/seeded documents** (Prisma `KnowledgeDocument` table) — for
   user-uploaded PDFs via `/api/knowledge/upload` and for the optional bulk
   seed endpoint `POST /api/knowledge/seed-lectures` (reads the latest
   `attached_assets/Lecture_*.zip`).

### PDF extraction

`src/lib/pdf-extract.ts` primarily uses **`pdf-parse` v1** (CommonJS build,
imported via `pdf-parse/lib/pdf-parse.js` to avoid the library's infamous
"debug mode reads a test PDF at import time" bug). A custom `pagerender`
callback emits `[PAGE_MARKER:N]` boundaries so citation page numbers are
accurate. A regex-based extractor (with a `looksLikeReadableText` filter
that rejects CID-font junk) is kept as a fallback.

`pdf-parse` is listed in `next.config.ts` `serverExternalPackages` so
Turbopack doesn't try to bundle its CJS entry into the edge/server graph.

### Re-seeding

Both layers live side by side; re-seed any time after dropping new exports
into `attached_assets/`:

```
curl -X POST http://localhost:5000/api/knowledge/seed-lectures
```

To wipe seeded lecture rows again without touching user uploads:

```
curl -X POST http://localhost:5000/api/knowledge/clear-seeded
```

## Notable files

- `src/lib/knowledge-base.ts` — curated bilingual topic content with
  `source: "ELEC3120 L## — ..."` labels.
- `src/lib/pdf-extract.ts` — regex PDF text extractor (+ reader-only filter
  that rejects CID-font junk). Used by upload route and seed route.
- `src/app/api/chat/route.ts` — Gemini chat with citation support; searches
  both in-code topics and DB docs, with CJK bigram tokenization so Chinese
  queries hit the right topics.
- `src/app/api/knowledge/seed-lectures/route.ts` — one-shot zip seeder.
- `src/app/api/knowledge/clear-seeded/route.ts` — delete seeded lecture docs
  (matches title regex `^L\d{2} — `), leaves user uploads alone.
- `next.config.ts` — has
  `serverExternalPackages: ["adm-zip", "@prisma/client", "pdf-parse"]` to
  stop Turbopack from bundling server-only deps.
- `postcss.config.mjs` — pins `@tailwindcss/postcss` to `base: ./src`. The
  Tailwind v4 Oxide scanner otherwise walks the whole workspace and
  spins in an infinite loop on something under `node_modules` /
  `attached_assets` / caches, pegging PostCSS at >100 % CPU until
  Turbopack times out. Scoping the base to `src/` takes the CSS compile
  from "never finishes" to ~700 ms.
- `src/lib/admin-auth.ts` — `requireAdmin()` gate for the seed and clear
  endpoints. Localhost requests pass automatically; production requires
  an `x-admin-secret` header matching the `ADMIN_SECRET` env var.

## Language / voice

All AI prompts default to **English** replies and switch to the student's
language only when they write in another language. When responding in
Chinese, **Traditional Chinese (繁體中文 HK/TW)** is enforced (no Simplified).
Technical terms are always kept in their original English form regardless
of reply language.

## Deployment

Publish via Replit Deployments (Autoscale). SQLite DB will persist as part
of the deploy filesystem; if you want per-deploy data isolation or
production-scale traffic, migrate to Postgres.
