import AdmZip from 'adm-zip';
import { readdirSync, statSync, mkdirSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const OUT_DIR = join(ROOT, 'exports');
const OUT_FILE = join(OUT_DIR, 'learningpacer-source.zip');

const EXCLUDE_DIRS = new Set([
  'node_modules',
  '.next',
  '.git',
  '.local',
  '.cache',
  '.agents',
  'generated',
  '.upm',
  'attached_assets',
  'db',
  'exports',
  'tmp',
  '.zscripts',
  'upload',
  'download',
  'mini-services',
  'examples',
  '.vscode',
  '.idea',
  '.claude',
  '.z-ai-config',
  'agent-ctx',
  'test',
  'prompt',
]);

const EXCLUDE_FILES = new Set([
  '.replit',
  'replit-entrypoint.sh',
  'Caddyfile',
  'server.log',
  '.accesslog',
  '.stats',
  'keep-server-alive.sh',
  '.env',
  'next-env.d.ts',
  'worklog.md',
  'testperm.txt',
  'dev.log',
  'dev.out.log',
  'Thumbs.db',
  '.DS_Store',
  'tsconfig.tsbuildinfo',
]);

const EXCLUDE_PATTERNS = [
  /^\.env\..+/,
  /\.tsbuildinfo$/,
  /\.log$/,
  /\.pem$/,
];

function shouldSkipFile(name) {
  if (EXCLUDE_FILES.has(name)) return true;
  return EXCLUDE_PATTERNS.some((re) => re.test(name));
}

const zip = new AdmZip();
let fileCount = 0;
let totalBytes = 0;

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const rel = relative(ROOT, full);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      if (EXCLUDE_DIRS.has(entry)) continue;
      walk(full);
    } else if (st.isFile()) {
      if (shouldSkipFile(entry)) continue;
      zip.addLocalFile(full, relative(ROOT, dir));
      fileCount += 1;
      totalBytes += st.size;
    }
  }
}

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
walk(ROOT);
zip.writeZip(OUT_FILE);

const finalSize = statSync(OUT_FILE).size;
console.log(`✓ wrote ${OUT_FILE}`);
console.log(`  files: ${fileCount}`);
console.log(`  source bytes: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
console.log(`  zip size: ${(finalSize / 1024 / 1024).toFixed(2)} MB`);
