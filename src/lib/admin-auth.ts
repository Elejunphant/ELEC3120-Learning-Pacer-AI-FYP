/**
 * Lightweight admin-guard for destructive / bulk-ingestion endpoints.
 *
 * Rule:
 *   - If `ADMIN_SECRET` env var is set, the caller must send a matching
 *     `x-admin-secret` header.
 *   - If it's not set, only requests from localhost (the dev loopback) are
 *     allowed. This keeps `bun run dev` ergonomic while blocking the
 *     public-facing Replit Deployment host.
 *
 * Returns a NextResponse 401/403 if access should be denied, or `null` if
 * the request is authorised.
 */
import { NextResponse } from 'next/server';

const LOCAL_HOSTS = new Set([
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
]);

export function requireAdmin(request: Request): NextResponse | null {
  const secret = process.env.ADMIN_SECRET;
  if (secret) {
    const provided = request.headers.get('x-admin-secret');
    if (provided !== secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return null;
  }
  // No secret configured — only allow local callers.
  let host = '';
  try {
    host = new URL(request.url).hostname;
  } catch {
    // If we can't parse the URL, fail closed.
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (!LOCAL_HOSTS.has(host)) {
    return NextResponse.json(
      {
        error:
          'Forbidden. Set ADMIN_SECRET env var and send x-admin-secret header to use this endpoint off-localhost.',
      },
      { status: 403 },
    );
  }
  return null;
}
