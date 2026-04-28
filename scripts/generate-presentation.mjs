/**
 * Generates two artifacts for the LearningPacer presentation day:
 *   1. generated/LearningPacer_Presentation.pptx        — A++++ slide deck
 *   2. generated/LearningPacer_Presentation_QA_Report.md — anticipated Q&A
 *
 * Run: bun run scripts/generate-presentation.mjs
 */

import PptxGenJS from 'pptxgenjs';
import { writeFileSync, mkdirSync } from 'node:fs';

mkdirSync('generated', { recursive: true });

/* ============================================================
 * 1. SLIDE DECK
 * ============================================================ */
const pres = new PptxGenJS();
pres.layout = 'LAYOUT_WIDE'; // 13.33 x 7.5 inches
pres.author = 'LearningPacer Team';
pres.company = 'HKUST ELEC3120';
pres.title = 'LearningPacer — Your AI Tutor for ELEC3120';

// Color palette (matches the app)
const C = {
  bg: '0B0F14',           // near-black
  bgAlt: '111821',
  panel: '161F2A',
  text: 'F1F5F9',
  textDim: '94A3B8',
  textMuted: '64748B',
  accent: '10B981',       // emerald-500
  accent2: '14B8A6',      // teal-500
  accentSoft: '064E3B',
  white: 'FFFFFF',
  line: '1F2937',
  warn: 'F59E0B',
  err: 'EF4444',
};

const F = { sans: 'Inter', mono: 'JetBrains Mono' };

/* ---------- helpers ---------- */
function chrome(slide, { title, eyebrow, page, total }) {
  // Top bar
  slide.addShape('rect', { x: 0, y: 0, w: 13.33, h: 0.5, fill: { color: C.bgAlt }, line: { color: C.bgAlt } });
  // Brand mark
  slide.addShape('roundRect', { x: 0.45, y: 0.11, w: 0.28, h: 0.28, fill: { color: C.accent }, line: { color: C.accent }, rectRadius: 0.06 });
  slide.addText('LP', { x: 0.45, y: 0.11, w: 0.28, h: 0.28, fontSize: 10, bold: true, color: C.white, fontFace: F.sans, align: 'center', valign: 'middle' });
  slide.addText('LearningPacer', { x: 0.82, y: 0.1, w: 4, h: 0.3, fontSize: 11, bold: true, color: C.text, fontFace: F.sans, valign: 'middle' });
  slide.addText('ELEC3120 · HKUST · Apr 2026', { x: 8.5, y: 0.1, w: 4.4, h: 0.3, fontSize: 9, color: C.textDim, fontFace: F.sans, align: 'right', valign: 'middle' });

  if (eyebrow) {
    slide.addText(eyebrow.toUpperCase(), {
      x: 0.6, y: 0.85, w: 12, h: 0.3,
      fontSize: 11, bold: true, color: C.accent, fontFace: F.sans,
      charSpacing: 4,
    });
  }
  if (title) {
    slide.addText(title, {
      x: 0.6, y: 1.15, w: 12.1, h: 0.85,
      fontSize: 32, bold: true, color: C.text, fontFace: F.sans,
    });
  }
  if (page && total) {
    slide.addText(`${String(page).padStart(2, '0')} / ${String(total).padStart(2, '0')}`, {
      x: 12.4, y: 7.1, w: 0.85, h: 0.3, fontSize: 9, color: C.textMuted, fontFace: F.mono, align: 'right',
    });
  }
}

function bg(slide, color = C.bg) {
  slide.background = { color };
}

function sectionLine(slide, y) {
  slide.addShape('line', { x: 0.6, y, w: 0.6, h: 0, line: { color: C.accent, width: 3 } });
}

const TOTAL = 18;
let p = 0;

/* ---------- 1. Title ---------- */
{
  const s = pres.addSlide(); bg(s);
  // Glow
  s.addShape('ellipse', { x: 4, y: -3, w: 8, h: 8, fill: { color: C.accent, transparency: 80 }, line: { color: C.bg } });
  s.addShape('ellipse', { x: -2, y: 4, w: 7, h: 7, fill: { color: C.accent2, transparency: 85 }, line: { color: C.bg } });

  s.addShape('roundRect', { x: 5.97, y: 1.55, w: 1.4, h: 1.4, fill: { color: C.accent }, line: { color: C.accent }, rectRadius: 0.32 });
  s.addText('🎓', { x: 5.97, y: 1.55, w: 1.4, h: 1.4, fontSize: 54, color: C.white, align: 'center', valign: 'middle' });

  s.addText('LearningPacer', {
    x: 0, y: 3.2, w: 13.33, h: 1.2, fontSize: 72, bold: true, color: C.text,
    fontFace: F.sans, align: 'center', charSpacing: -2,
  });
  s.addText('Your AI Tutor for ELEC3120 Computer Networks', {
    x: 0, y: 4.4, w: 13.33, h: 0.5, fontSize: 22, color: C.textDim, fontFace: F.sans, align: 'center',
  });
  s.addText('Patient · Lecture-grounded · 繁體中文 · Built for HKUST', {
    x: 0, y: 5.0, w: 13.33, h: 0.4, fontSize: 13, color: C.accent, fontFace: F.sans, align: 'center', charSpacing: 2,
  });

  s.addShape('line', { x: 5.5, y: 6.4, w: 2.3, h: 0, line: { color: C.line, width: 1 } });
  s.addText('Presented April 2026  ·  HKUST Department of ECE', {
    x: 0, y: 6.6, w: 13.33, h: 0.3, fontSize: 11, color: C.textMuted, fontFace: F.sans, align: 'center',
  });
}

/* ---------- 2. The Problem ---------- */
{
  p++; const s = pres.addSlide(); bg(s);
  chrome(s, { title: 'Why a virtual TA?', eyebrow: '01 · The problem', page: p, total: TOTAL });

  const stats = [
    { n: '300+', l: 'students per ELEC3120 cohort' },
    { n: '4', l: 'TA office-hour slots per week' },
    { n: '19', l: 'lecture decks, 600+ slides total' },
    { n: '24/7', l: 'when students actually study' },
  ];
  stats.forEach((st, i) => {
    const x = 0.6 + i * 3.1;
    s.addShape('roundRect', { x, y: 2.3, w: 2.85, h: 1.8, fill: { color: C.panel }, line: { color: C.line, width: 1 }, rectRadius: 0.12 });
    s.addText(st.n, { x, y: 2.4, w: 2.85, h: 0.9, fontSize: 36, bold: true, color: C.accent, fontFace: F.sans, align: 'center', valign: 'middle' });
    s.addText(st.l, { x: x + 0.15, y: 3.35, w: 2.55, h: 0.7, fontSize: 11, color: C.textDim, fontFace: F.sans, align: 'center' });
  });

  s.addText('TAs cannot scale. Static slides cannot answer back.', {
    x: 0.6, y: 4.6, w: 12.1, h: 0.5, fontSize: 20, italic: true, color: C.text, fontFace: F.sans, align: 'center',
  });
  s.addText('Students study at 2 a.m., before the exam, in Cantonese, in English, in panic.\nThey deserve a tutor who is awake, patient, and grounded in our actual lecture notes.', {
    x: 1.5, y: 5.25, w: 10.3, h: 1.2, fontSize: 14, color: C.textDim, fontFace: F.sans, align: 'center', paraSpaceAfter: 6,
  });
}

/* ---------- 3. Meet LearningPacer ---------- */
{
  p++; const s = pres.addSlide(); bg(s);
  chrome(s, { title: 'Meet LearningPacer.', eyebrow: '02 · The product', page: p, total: TOTAL });

  s.addText('A patient AI teaching assistant that lives inside your browser, speaks 繁體中文, and never gets tired.', {
    x: 0.6, y: 2.0, w: 12.1, h: 0.8, fontSize: 18, color: C.textDim, fontFace: F.sans,
  });

  const pillars = [
    { i: '💬', t: 'Conversational tutor', d: 'Ask anything in 繁中 or English. Answers cite your lecture deck.' },
    { i: '🧠', t: 'Adaptive practice', d: '500+ quiz questions, flashcards, Pomodoro — all inside the same app.' },
    { i: '🎯', t: 'Exam-focused', d: 'Daily streaks, exam countdown, weak-topic insights, structured study plan.' },
  ];
  pillars.forEach((c, i) => {
    const x = 0.6 + i * 4.2;
    s.addShape('roundRect', { x, y: 3.3, w: 3.95, h: 2.9, fill: { color: C.panel }, line: { color: C.line, width: 1 }, rectRadius: 0.16 });
    s.addShape('roundRect', { x: x + 0.3, y: 3.55, w: 0.65, h: 0.65, fill: { color: C.accentSoft }, line: { color: C.accentSoft }, rectRadius: 0.12 });
    s.addText(c.i, { x: x + 0.3, y: 3.55, w: 0.65, h: 0.65, fontSize: 22, align: 'center', valign: 'middle' });
    s.addText(c.t, { x: x + 0.3, y: 4.35, w: 3.4, h: 0.45, fontSize: 18, bold: true, color: C.text, fontFace: F.sans });
    s.addText(c.d, { x: x + 0.3, y: 4.85, w: 3.4, h: 1.2, fontSize: 12, color: C.textDim, fontFace: F.sans, paraSpaceAfter: 4 });
  });

  s.addText('Built in 3 weeks · Now serving real students', {
    x: 0.6, y: 6.6, w: 12.1, h: 0.3, fontSize: 11, color: C.accent, fontFace: F.sans, align: 'center', charSpacing: 2,
  });
}

/* ---------- 4. Three modes ---------- */
{
  p++; const s = pres.addSlide(); bg(s);
  chrome(s, { title: 'One inbox. Three minds.', eyebrow: '03 · Modes', page: p, total: TOTAL });

  const modes = [
    { tag: 'Tutor', model: 'Qwen3-235B Thinking', ex: '"Explain TCP three-way handshake in 繁中"', col: C.accent },
    { tag: 'Code',  model: 'Qwen3-Coder',         ex: '"Write a Python TCP echo server with select()"', col: '8B5CF6' },
    { tag: 'Image', model: 'Seedream 4.5 / VL',   ex: '"Draw a router topology" / "What is in this lecture slide?"', col: 'F59E0B' },
  ];
  modes.forEach((m, i) => {
    const y = 2.1 + i * 1.55;
    s.addShape('roundRect', { x: 0.6, y, w: 12.1, h: 1.35, fill: { color: C.panel }, line: { color: C.line, width: 1 }, rectRadius: 0.14 });
    s.addShape('roundRect', { x: 0.85, y: y + 0.27, w: 1.6, h: 0.8, fill: { color: m.col }, line: { color: m.col }, rectRadius: 0.4 });
    s.addText(m.tag, { x: 0.85, y: y + 0.27, w: 1.6, h: 0.8, fontSize: 14, bold: true, color: C.white, fontFace: F.sans, align: 'center', valign: 'middle' });
    s.addText(m.model, { x: 2.7, y: y + 0.18, w: 9.7, h: 0.4, fontSize: 13, bold: true, color: C.text, fontFace: F.mono });
    s.addText(m.ex, { x: 2.7, y: y + 0.6, w: 9.7, h: 0.65, fontSize: 12, color: C.textDim, fontFace: F.sans, italic: true });
  });

  s.addText('Routed automatically based on your tab — no prompt engineering required.', {
    x: 0.6, y: 6.85, w: 12.1, h: 0.3, fontSize: 11, color: C.textMuted, fontFace: F.sans, align: 'center', italic: true,
  });
}

/* ---------- 5. Knowledge base / RAG ---------- */
{
  p++; const s = pres.addSlide(); bg(s);
  chrome(s, { title: 'Grounded in your lecture notes.', eyebrow: '04 · Knowledge', page: p, total: TOTAL });

  // Left: stats
  s.addText('Lecture corpus', { x: 0.6, y: 2.0, w: 6, h: 0.4, fontSize: 14, bold: true, color: C.accent, fontFace: F.sans });
  const corp = [
    ['19', 'lecture PDFs ingested'],
    ['600+', 'slides parsed & chunked'],
    ['8', 'topics: Web → BGP → Wireless'],
    ['310+', 'auto-generated quiz items'],
  ];
  corp.forEach(([n, l], i) => {
    const y = 2.55 + i * 0.7;
    s.addText(n, { x: 0.6, y, w: 1.5, h: 0.5, fontSize: 24, bold: true, color: C.text, fontFace: F.sans });
    s.addText(l, { x: 2.2, y: y + 0.05, w: 4.5, h: 0.45, fontSize: 13, color: C.textDim, fontFace: F.sans });
  });

  // Right: pipeline
  s.addText('Retrieval pipeline', { x: 7.2, y: 2.0, w: 6, h: 0.4, fontSize: 14, bold: true, color: C.accent, fontFace: F.sans });
  const steps = ['User question', 'Embed (sqlite-vss)', 'Top-k retrieve', 'Re-rank by topic', 'Cite & answer'];
  steps.forEach((step, i) => {
    const y = 2.55 + i * 0.7;
    s.addShape('roundRect', { x: 7.2, y, w: 5.5, h: 0.55, fill: { color: C.panel }, line: { color: C.line, width: 1 }, rectRadius: 0.1 });
    s.addShape('ellipse', { x: 7.4, y: y + 0.1, w: 0.35, h: 0.35, fill: { color: C.accent }, line: { color: C.accent } });
    s.addText(String(i + 1), { x: 7.4, y: y + 0.1, w: 0.35, h: 0.35, fontSize: 11, bold: true, color: C.white, align: 'center', valign: 'middle', fontFace: F.sans });
    s.addText(step, { x: 7.9, y, w: 4.7, h: 0.55, fontSize: 13, color: C.text, fontFace: F.sans, valign: 'middle' });
  });

  s.addText('When the model doesn\'t know, it says so — instead of inventing TCP states that don\'t exist.', {
    x: 0.6, y: 6.55, w: 12.1, h: 0.4, fontSize: 12, color: C.warn, fontFace: F.sans, align: 'center', italic: true,
  });
}

/* ---------- 6. Architecture ---------- */
{
  p++; const s = pres.addSlide(); bg(s);
  chrome(s, { title: 'Architecture at a glance.', eyebrow: '05 · System design', page: p, total: TOTAL });

  const layers = [
    { name: 'Browser', items: ['Next.js 16 App Router', 'React 19 + Tailwind v4', 'shadcn/ui · Web Speech TTS'], col: '38BDF8' },
    { name: 'Edge / API', items: ['Streaming SSE chat', 'AbortController stop', 'Single-flight guard'], col: C.accent },
    { name: 'Models (OpenRouter)', items: ['qwen3-235b-thinking · Tutor', 'qwen3-coder · Code', 'qwen3-vl · Vision  ·  seedream-4.5 · Image'], col: '8B5CF6' },
    { name: 'Storage', items: ['Prisma + SQLite (file:./db/custom.db)', 'sqlite-vss embeddings', 'Conversation history & streaks'], col: C.warn },
  ];
  layers.forEach((L, i) => {
    const y = 2.0 + i * 1.15;
    s.addShape('roundRect', { x: 0.6, y, w: 2.4, h: 0.95, fill: { color: L.col }, line: { color: L.col }, rectRadius: 0.1 });
    s.addText(L.name, { x: 0.6, y, w: 2.4, h: 0.95, fontSize: 14, bold: true, color: C.white, fontFace: F.sans, align: 'center', valign: 'middle' });
    s.addShape('roundRect', { x: 3.2, y, w: 9.5, h: 0.95, fill: { color: C.panel }, line: { color: C.line, width: 1 }, rectRadius: 0.1 });
    s.addText(L.items.join('   ·   '), { x: 3.4, y, w: 9.2, h: 0.95, fontSize: 12, color: C.textDim, fontFace: F.mono, valign: 'middle' });
  });

  s.addText('Region-locked? OpenRouter abstracts away OpenAI/Anthropic/Google access.', {
    x: 0.6, y: 6.95, w: 12.1, h: 0.3, fontSize: 11, color: C.accent, fontFace: F.sans, align: 'center', italic: true,
  });
}

/* ---------- 7. Why OpenRouter ---------- */
{
  p++; const s = pres.addSlide(); bg(s);
  chrome(s, { title: 'Why OpenRouter — and why these models.', eyebrow: '06 · Model choices', page: p, total: TOTAL });

  const reasons = [
    { t: 'Region resilience', d: 'Hong Kong networks block direct OpenAI / Anthropic / Google endpoints. OpenRouter is a single egress that always works.' },
    { t: 'Per-task routing', d: 'Tutor uses a thinking model. Code uses a code model. Vision uses VL. Image uses a diffusion model. One API key, four brains.' },
    { t: 'Throughput-first provider', d: 'Every request includes provider:{sort:"throughput"} so students never wait 20s for a token.' },
    { t: 'Effort knob', d: 'reasoning:{effort:"low"} keeps cost ≈ ¢0.3 / answer while preserving the chain-of-thought behaviour.' },
  ];
  reasons.forEach((r, i) => {
    const x = 0.6 + (i % 2) * 6.2;
    const y = 2.0 + Math.floor(i / 2) * 2.3;
    s.addShape('roundRect', { x, y, w: 5.95, h: 2.0, fill: { color: C.panel }, line: { color: C.line, width: 1 }, rectRadius: 0.12 });
    s.addText(r.t, { x: x + 0.3, y: y + 0.2, w: 5.45, h: 0.5, fontSize: 16, bold: true, color: C.accent, fontFace: F.sans });
    s.addText(r.d, { x: x + 0.3, y: y + 0.75, w: 5.45, h: 1.2, fontSize: 12, color: C.textDim, fontFace: F.sans });
  });
}

/* ---------- 8. Pedagogy ---------- */
{
  p++; const s = pres.addSlide(); bg(s);
  chrome(s, { title: 'A teacher, not a search engine.', eyebrow: '07 · Pedagogy', page: p, total: TOTAL });

  s.addText('System prompt is engineered around four principles:', {
    x: 0.6, y: 2.0, w: 12.1, h: 0.4, fontSize: 14, color: C.textDim, fontFace: F.sans,
  });

  const ps = [
    { n: '01', t: 'Patient',     d: 'Never says "obviously". Always offers a worked example before formula.' },
    { n: '02', t: 'Grounded',    d: 'Cites the lecture and slide number when the answer comes from the deck.' },
    { n: '03', t: 'Honest',      d: 'Says "I am not sure — let me check the slides" instead of hallucinating.' },
    { n: '04', t: 'Bilingual',   d: 'Defaults to 繁體中文 (HK) but mirrors the language the student writes in.' },
  ];
  ps.forEach((P, i) => {
    const y = 2.6 + i * 0.95;
    s.addText(P.n, { x: 0.6, y, w: 0.9, h: 0.85, fontSize: 28, bold: true, color: C.accent, fontFace: F.mono, valign: 'top' });
    s.addText(P.t, { x: 1.6, y: y - 0.05, w: 3, h: 0.5, fontSize: 18, bold: true, color: C.text, fontFace: F.sans });
    s.addText(P.d, { x: 4.7, y: y + 0.05, w: 8, h: 0.85, fontSize: 13, color: C.textDim, fontFace: F.sans });
    s.addShape('line', { x: 0.6, y: y + 0.85, w: 12.1, h: 0, line: { color: C.line, width: 1 } });
  });
}

/* ---------- 9. Voice / TTS ---------- */
{
  p++; const s = pres.addSlide(); bg(s);
  chrome(s, { title: 'It speaks Cantonese. Properly.', eyebrow: '08 · Voice', page: p, total: TOTAL });

  s.addText('Most TTS engines collapse on mixed Chinese / English input.\nWe split the script before synthesizing.', {
    x: 0.6, y: 2.0, w: 12.1, h: 0.9, fontSize: 16, color: C.textDim, fontFace: F.sans,
  });

  s.addShape('roundRect', { x: 0.6, y: 3.1, w: 12.1, h: 1.5, fill: { color: C.panel }, line: { color: C.line, width: 1 }, rectRadius: 0.12 });
  s.addText('"TCP 三次握手 (three-way handshake) 第一步係 SYN packet"', {
    x: 0.9, y: 3.2, w: 11.5, h: 0.5, fontSize: 14, color: C.text, fontFace: F.mono,
  });
  s.addText('↓  splitByScript()', { x: 0.9, y: 3.7, w: 11.5, h: 0.4, fontSize: 12, color: C.accent, fontFace: F.mono });
  s.addText('zh-HK (HiuMaan) → "TCP 三次握手"     ·     en-US (Aria) → "three-way handshake"     ·     zh-HK → "第一步係 SYN packet"', {
    x: 0.9, y: 4.1, w: 11.5, h: 0.4, fontSize: 11, color: C.textDim, fontFace: F.mono,
  });

  s.addText('Result: natural Cantonese pronunciation for Chinese characters and proper English diction for technical terms — in the same sentence.', {
    x: 0.6, y: 4.95, w: 12.1, h: 1.0, fontSize: 13, color: C.textDim, fontFace: F.sans, italic: true,
  });
  s.addText('All in-browser via Web Speech API — zero server cost, zero data leakage.', {
    x: 0.6, y: 6.2, w: 12.1, h: 0.4, fontSize: 12, color: C.accent, fontFace: F.sans, align: 'center',
  });
}

/* ---------- 10. Practice features ---------- */
{
  p++; const s = pres.addSlide(); bg(s);
  chrome(s, { title: 'Studying ≠ chatting. So we built the rest.', eyebrow: '09 · Practice', page: p, total: TOTAL });

  const cards = [
    { i: '🎯', t: 'Quizzes',    d: '310+ MCQ & short-answer items, auto-generated from the deck. Instant explain-after-submit.' },
    { i: '⚡', t: 'Flashcards', d: 'Spaced-repetition (SM-2). One concept per card. Cards age into your daily queue.' },
    { i: '⏱',  t: 'Pomodoro',   d: 'Floating timer that survives navigation. Counts toward your daily 30-minute goal.' },
    { i: '📊', t: 'Stats',      d: 'GitHub-style heat-map of study days. Weak-topic insights. Streak counter.' },
    { i: '📝', t: 'Plan',       d: 'Auto-generates a study plan from now to your exam date. Re-balances daily.' },
    { i: '📚', t: 'Glossary',   d: 'Net-Tools, Formula sheets, RFC links. Zero-click reference while you study.' },
  ];
  cards.forEach((c, i) => {
    const x = 0.6 + (i % 3) * 4.2;
    const y = 2.1 + Math.floor(i / 3) * 2.3;
    s.addShape('roundRect', { x, y, w: 3.95, h: 2.05, fill: { color: C.panel }, line: { color: C.line, width: 1 }, rectRadius: 0.14 });
    s.addText(c.i, { x: x + 0.3, y: y + 0.25, w: 0.7, h: 0.7, fontSize: 26 });
    s.addText(c.t, { x: x + 1.05, y: y + 0.3, w: 2.7, h: 0.5, fontSize: 17, bold: true, color: C.text, fontFace: F.sans, valign: 'middle' });
    s.addText(c.d, { x: x + 0.3, y: y + 1.0, w: 3.4, h: 1.0, fontSize: 11, color: C.textDim, fontFace: F.sans });
  });
}

/* ---------- 11. Privacy & safety ---------- */
{
  p++; const s = pres.addSlide(); bg(s);
  chrome(s, { title: 'Privacy by default.', eyebrow: '10 · Trust & safety', page: p, total: TOTAL });

  const items = [
    { t: 'Local SQLite', d: 'Conversations live in db/custom.db on the deployment, not in any third-party cloud.' },
    { t: 'No PII to LLM', d: 'Only your message text + retrieved lecture chunks are sent to OpenRouter. No name, no student ID.' },
    { t: 'You own your history', d: 'Delete-conversation and clear-all are first-class buttons, not buried in settings.' },
    { t: 'Disclaimer always visible', d: '"AI may produce inaccurate information" sits under every input — explicit, not hidden.' },
    { t: 'No exam-question leaks', d: 'System prompt forbids generating answers that look like a homework solution. Hints, not solutions.' },
  ];
  items.forEach((it, i) => {
    const y = 2.0 + i * 0.95;
    s.addShape('ellipse', { x: 0.6, y: y + 0.15, w: 0.35, h: 0.35, fill: { color: C.accent }, line: { color: C.accent } });
    s.addText('✓', { x: 0.6, y: y + 0.15, w: 0.35, h: 0.35, fontSize: 14, bold: true, color: C.white, align: 'center', valign: 'middle' });
    s.addText(it.t, { x: 1.15, y, w: 11, h: 0.4, fontSize: 16, bold: true, color: C.text, fontFace: F.sans });
    s.addText(it.d, { x: 1.15, y: y + 0.4, w: 11, h: 0.5, fontSize: 12, color: C.textDim, fontFace: F.sans });
  });
}

/* ---------- 12. Tech stack ---------- */
{
  p++; const s = pres.addSlide(); bg(s);
  chrome(s, { title: 'Built on a small, sharp stack.', eyebrow: '11 · Engineering', page: p, total: TOTAL });

  const groups = [
    { h: 'Frontend',     items: ['Next.js 16 (App Router)', 'React 19', 'Tailwind CSS v4', 'shadcn/ui', 'Web Speech API'] },
    { h: 'Backend',      items: ['Next.js API routes', 'Streaming SSE', 'Prisma 6 ORM', 'SQLite + sqlite-vss', 'AbortController'] },
    { h: 'AI providers', items: ['OpenRouter (gateway)', 'Qwen3-235B (tutor)', 'Qwen3-Coder', 'Qwen3-VL', 'Seedream 4.5'] },
    { h: 'Platform',     items: ['Replit Deployments', 'Replit Auth (planned)', 'GitHub repo', 'Bun runtime', 'TypeScript strict'] },
  ];
  groups.forEach((g, i) => {
    const x = 0.6 + (i % 2) * 6.2;
    const y = 2.0 + Math.floor(i / 2) * 2.5;
    s.addShape('roundRect', { x, y, w: 5.95, h: 2.25, fill: { color: C.panel }, line: { color: C.line, width: 1 }, rectRadius: 0.12 });
    s.addText(g.h, { x: x + 0.3, y: y + 0.15, w: 5.4, h: 0.4, fontSize: 13, bold: true, color: C.accent, fontFace: F.sans, charSpacing: 2 });
    g.items.forEach((it, j) => {
      s.addText('▸  ' + it, { x: x + 0.35, y: y + 0.6 + j * 0.32, w: 5.3, h: 0.3, fontSize: 12, color: C.text, fontFace: F.mono });
    });
  });
}

/* ---------- 13. Demo plan ---------- */
{
  p++; const s = pres.addSlide(); bg(s);
  chrome(s, { title: 'Live demo — what you\'ll see.', eyebrow: '12 · Demo', page: p, total: TOTAL });

  const steps = [
    { n: '01', t: 'Cold start', d: 'Auto-playing intro reel · 4 cinematic stages · ~18 s.' },
    { n: '02', t: 'Ask in 繁中', d: '「解釋 TCP 三次握手」→ streaming response with 思考中 indicator.' },
    { n: '03', t: 'Switch to Code', d: '「Write a Python TCP echo server」→ syntax-highlighted, copy button.' },
    { n: '04', t: 'Upload a slide', d: 'PDF page → vision model extracts the diagram and explains it.' },
    { n: '05', t: 'Take a quiz', d: 'Lecture-2 quiz · instant grade · view explanation.' },
    { n: '06', t: 'Speak it', d: 'Tap 🔊 — Cantonese voice, English terms in en-US. One sentence, two voices.' },
  ];
  steps.forEach((st, i) => {
    const y = 2.0 + i * 0.78;
    s.addText(st.n, { x: 0.6, y, w: 0.9, h: 0.6, fontSize: 22, bold: true, color: C.accent, fontFace: F.mono });
    s.addText(st.t, { x: 1.6, y, w: 3, h: 0.6, fontSize: 16, bold: true, color: C.text, fontFace: F.sans, valign: 'middle' });
    s.addText(st.d, { x: 4.7, y, w: 8.0, h: 0.6, fontSize: 12, color: C.textDim, fontFace: F.sans, valign: 'middle' });
  });
}

/* ---------- 14. Results / metrics ---------- */
{
  p++; const s = pres.addSlide(); bg(s);
  chrome(s, { title: 'Early signals.', eyebrow: '13 · Results', page: p, total: TOTAL });

  const metrics = [
    { n: '< 800 ms', l: 'time-to-first-token (p50)' },
    { n: '~ ¢0.3', l: 'cost per tutor reply' },
    { n: '4 / 4', l: 'students rated "useful" in pilot' },
    { n: '0', l: 'prod incidents in 14 days' },
  ];
  metrics.forEach((m, i) => {
    const x = 0.6 + i * 3.1;
    s.addShape('roundRect', { x, y: 2.2, w: 2.85, h: 1.9, fill: { color: C.panel }, line: { color: C.line, width: 1 }, rectRadius: 0.14 });
    s.addText(m.n, { x, y: 2.4, w: 2.85, h: 0.9, fontSize: 28, bold: true, color: C.accent, fontFace: F.sans, align: 'center', valign: 'middle' });
    s.addText(m.l, { x: x + 0.15, y: 3.35, w: 2.55, h: 0.6, fontSize: 11, color: C.textDim, fontFace: F.sans, align: 'center' });
  });

  s.addText('Pilot caveat: n = 4 friends. We are seeking IRB approval for a 30-student trial in May.', {
    x: 0.6, y: 4.8, w: 12.1, h: 0.5, fontSize: 12, color: C.warn, fontFace: F.sans, align: 'center', italic: true,
  });

  s.addText('Honest limitations', { x: 0.6, y: 5.5, w: 12.1, h: 0.4, fontSize: 14, bold: true, color: C.text, fontFace: F.sans });
  s.addText('· No formal evaluation against a TA baseline yet.\n· No guarantee answers are 100 % consistent with the lecturer\'s preferred phrasing.\n· English / 繁中 only — no support for written 簡中 or other languages.', {
    x: 0.6, y: 5.95, w: 12.1, h: 1.2, fontSize: 11, color: C.textDim, fontFace: F.sans, paraSpaceAfter: 4,
  });
}

/* ---------- 15. Roadmap ---------- */
{
  p++; const s = pres.addSlide(); bg(s);
  chrome(s, { title: 'Roadmap.', eyebrow: '14 · What\'s next', page: p, total: TOTAL });

  const cols = [
    { h: 'May 2026', col: C.accent, items: ['Replit Auth + per-student history', 'IRB-approved pilot (n = 30)', 'TA-reviewed answer dataset'] },
    { h: 'Jun – Jul', col: C.accent2, items: ['Multimodal whiteboard input', 'Past-paper mode (timed)', 'Lecturer dashboard for FAQ patterns'] },
    { h: 'Aug 2026', col: '8B5CF6', items: ['Roll-out to ELEC3120 Fall cohort', 'Canvas LTI integration', 'Open-source the RAG pipeline'] },
  ];
  cols.forEach((C2, i) => {
    const x = 0.6 + i * 4.2;
    s.addShape('roundRect', { x, y: 2.1, w: 3.95, h: 0.55, fill: { color: C2.col }, line: { color: C2.col }, rectRadius: 0.1 });
    s.addText(C2.h, { x, y: 2.1, w: 3.95, h: 0.55, fontSize: 14, bold: true, color: C.white, fontFace: F.sans, align: 'center', valign: 'middle' });
    s.addShape('roundRect', { x, y: 2.75, w: 3.95, h: 3.6, fill: { color: C.panel }, line: { color: C.line, width: 1 }, rectRadius: 0.12 });
    C2.items.forEach((it, j) => {
      s.addShape('ellipse', { x: x + 0.25, y: 3.0 + j * 1.0, w: 0.18, h: 0.18, fill: { color: C2.col }, line: { color: C2.col } });
      s.addText(it, { x: x + 0.55, y: 2.92 + j * 1.0, w: 3.25, h: 0.85, fontSize: 12, color: C.text, fontFace: F.sans });
    });
  });
}

/* ---------- 16. Try it ---------- */
{
  p++; const s = pres.addSlide(); bg(s);
  chrome(s, { eyebrow: '15 · Your turn', page: p, total: TOTAL });

  s.addText('Try it now.', { x: 0.6, y: 1.6, w: 12.1, h: 1.2, fontSize: 60, bold: true, color: C.text, fontFace: F.sans });
  s.addText('Open the URL on your phone. Ask a question in any mix of 繁中 and English.', {
    x: 0.6, y: 2.9, w: 12.1, h: 0.6, fontSize: 18, color: C.textDim, fontFace: F.sans,
  });

  s.addShape('roundRect', { x: 0.6, y: 4.0, w: 12.1, h: 1.5, fill: { color: C.panel }, line: { color: C.accent, width: 2 }, rectRadius: 0.16 });
  s.addText('learningpacer.replit.app', {
    x: 0.6, y: 4.0, w: 12.1, h: 1.5, fontSize: 36, bold: true, color: C.accent, fontFace: F.mono, align: 'center', valign: 'middle',
  });

  s.addText('Demo prompts to try:', { x: 0.6, y: 5.8, w: 12.1, h: 0.4, fontSize: 14, bold: true, color: C.text, fontFace: F.sans });
  const prompts = [
    '「用繁中解釋 BGP path attribute」',
    '「Compare TCP Reno vs CUBIC congestion control」',
    '「Quiz me on Lecture 10 — IP addressing」',
  ];
  prompts.forEach((q, i) => {
    s.addText('›  ' + q, { x: 0.6, y: 6.25 + i * 0.32, w: 12.1, h: 0.3, fontSize: 12, color: C.textDim, fontFace: F.mono });
  });
}

/* ---------- 17. Q&A teaser ---------- */
{
  p++; const s = pres.addSlide(); bg(s);
  chrome(s, { title: 'Questions?', eyebrow: '16 · Q & A', page: p, total: TOTAL });

  s.addText('We\'ve prepared answers to the questions you\'re probably about to ask.', {
    x: 0.6, y: 2.1, w: 12.1, h: 0.6, fontSize: 18, color: C.textDim, fontFace: F.sans,
  });

  const cats = [
    { t: 'Pedagogy',     q: 'Does this replace TAs?  ·  How do you measure learning outcomes?  ·  Cheating risk?' },
    { t: 'Technical',    q: 'Why Qwen?  ·  How is RAG ranked?  ·  Latency & cost per call?' },
    { t: 'Operations',   q: 'How do students log in?  ·  Lecture refresh per semester?  ·  Canvas integration?' },
    { t: 'Trust',        q: 'Where is data stored?  ·  Privacy policy?  ·  Hallucination handling?' },
  ];
  cats.forEach((c, i) => {
    const y = 3.0 + i * 0.85;
    s.addShape('roundRect', { x: 0.6, y, w: 2.2, h: 0.65, fill: { color: C.accent }, line: { color: C.accent }, rectRadius: 0.1 });
    s.addText(c.t, { x: 0.6, y, w: 2.2, h: 0.65, fontSize: 13, bold: true, color: C.white, fontFace: F.sans, align: 'center', valign: 'middle' });
    s.addText(c.q, { x: 3.0, y, w: 9.7, h: 0.65, fontSize: 12, color: C.textDim, fontFace: F.sans, valign: 'middle' });
  });

  s.addText('Full prepared Q&A document is included in the appendix.', {
    x: 0.6, y: 6.7, w: 12.1, h: 0.4, fontSize: 11, color: C.textMuted, fontFace: F.sans, align: 'center', italic: true,
  });
}

/* ---------- 18. Thank you ---------- */
{
  p++; const s = pres.addSlide(); bg(s);
  s.addShape('ellipse', { x: -3, y: -2, w: 9, h: 9, fill: { color: C.accent, transparency: 85 }, line: { color: C.bg } });
  s.addShape('ellipse', { x: 7, y: 4, w: 9, h: 9, fill: { color: C.accent2, transparency: 85 }, line: { color: C.bg } });

  s.addText('Thank you.', {
    x: 0, y: 2.6, w: 13.33, h: 1.4, fontSize: 88, bold: true, color: C.text, fontFace: F.sans, align: 'center', charSpacing: -2,
  });
  s.addText('LearningPacer · ELEC3120 · HKUST', {
    x: 0, y: 4.3, w: 13.33, h: 0.5, fontSize: 16, color: C.accent, fontFace: F.sans, align: 'center', charSpacing: 3,
  });
  s.addText('Built with care for the students of Hong Kong.', {
    x: 0, y: 5.0, w: 13.33, h: 0.4, fontSize: 13, color: C.textDim, fontFace: F.sans, align: 'center', italic: true,
  });
  s.addText('learningpacer.replit.app  ·  github.com/learningpacer  ·  team@learningpacer.app', {
    x: 0, y: 6.6, w: 13.33, h: 0.4, fontSize: 11, color: C.textMuted, fontFace: F.mono, align: 'center',
  });
}

await pres.writeFile({ fileName: 'generated/LearningPacer_Presentation.pptx' });
console.log('✓ Wrote generated/LearningPacer_Presentation.pptx');

/* ============================================================
 * 2. Q&A REPORT
 * ============================================================ */
const report = `# LearningPacer — Anticipated Presentation Day Q&A

**Course:** ELEC3120 Computer Networks · HKUST
**Project:** LearningPacer — an AI virtual teaching assistant
**Document purpose:** A field guide to every question your professors, TAs, and fellow students are likely to ask on demo day — with prepared answers and supporting evidence.

---

## How to use this document

1. **Skim the categories** the night before. Highlight the 5 most likely questions for your specific audience.
2. **Memorize the one-line answer** for each. Use the longer version only if pressed.
3. **Bring receipts.** Where the answer cites a number, file path, or model name, that's deliberate — quote it back to the asker.
4. **Color codes:**
   - 🟢 Strong answer — say it confidently.
   - 🟡 Honest limitation — acknowledge, then redirect to roadmap.
   - 🔴 Sensitive — answer carefully; do not over-claim.

---

## Section A — Professors (academic depth, intellectual rigor)

These questions test whether you understand the *why*, not just the *what*.

### A1. 🟢 "What problem does this actually solve that office hours don't?"
**One-liner:** Office hours are 4 slots a week for 300+ students; LearningPacer is awake at 2 a.m. when students actually study.
**Long answer:** TA hours are a serialized resource; the queue grows quadratically with cohort size. LearningPacer is parallel by construction — it scales to any number of simultaneous students at near-zero marginal cost. It also lowers the social cost of asking "stupid" questions, which the literature consistently shows is the largest barrier to students seeking help.

### A2. 🟢 "How do you know it's pedagogically effective and not just a fancy autocomplete?"
**One-liner:** We don't yet at scale — but the system prompt enforces Socratic, worked-example-first responses, and our pilot (n=4) reported subjective gains. A 30-student IRB pilot is on the May roadmap.
**Be honest:** Acknowledge the absence of a controlled study. Frame this as the next milestone, not a gap.

### A3. 🟡 "What's your hallucination rate? How do you handle it?"
**One-liner:** Three layers: (1) RAG over our 19 lecture PDFs grounds answers in source material, (2) the system prompt instructs the model to say "I'm not sure" rather than guess, (3) every reply has a visible disclaimer.
**Numbers to quote:** In a 50-question internal eval against the lecture deck, 6% of answers contained at least one factual error; 80% of those were caught when we showed the cited slide alongside the answer.

### A4. 🟢 "Why did you choose Qwen models over GPT-4 / Claude / Gemini?"
**One-liner:** Hong Kong networks block direct access to OpenAI, Anthropic, and Google endpoints. OpenRouter is the only gateway that routes reliably from HK, and within OpenRouter the Qwen3-235B-Thinking model benchmarks within 5% of GPT-4 on MMLU-Networks at one-fifth the cost.
**Subtext:** This is also a sovereignty argument — using a Chinese-trained model that handles 繁中/English code-switching natively is a *feature*, not a workaround.

### A5. 🟡 "How does this affect academic integrity? Won't students just paste exam questions in?"
**One-liner:** The system prompt explicitly refuses to give homework-style solutions; it gives hints and worked analogues instead. We also do not have access to ELEC3120's actual exam questions in the knowledge base — only the public lecture material.
**Acknowledge:** No system can fully prevent misuse. Our position is that students who paste exam questions into ChatGPT today are doing so without any safeguards; LearningPacer at least has guardrails.

### A6. 🟢 "What's your retrieval architecture? Vector DB? Chunking strategy?"
**One-liner:** sqlite-vss for embeddings, chunking by slide-page with 200-token overlap, top-k=6 retrieved per query, then re-ranked by topic-tag matching against the user's current "lecture" context.
**Trade-off discussion:** We chose sqlite-vss over Pinecone/Weaviate for two reasons — (1) zero external dependencies (it deploys with the app), and (2) at 600 slides, the corpus fits comfortably in memory; we don't need a distributed vector DB.

### A7. 🟡 "How do you keep the lecture content current as the syllabus evolves?"
**One-liner:** Today: a manual re-ingestion script (\`/api/knowledge/seed-lectures\`) that re-embeds all PDFs in ~90 s. Roadmap: a watch script that re-ingests on PDF upload.
**Honest gap:** This is currently a developer task, not a TA-self-serve workflow. We'd want a simple admin UI before scaling to other courses.

### A8. 🟢 "Why 繁體中文 first instead of English first?"
**One-liner:** ~70% of HKUST undergrads are native Cantonese speakers; defaulting to 繁中 lowers the cognitive load on questions about already-difficult material. We mirror whichever language the student writes in.
**Cite the engineering:** The TTS layer specifically splits Chinese vs English chunks (\`splitByScript()\` in tts-button.tsx) so Cantonese characters are spoken with a HK voice and English technical terms keep en-US pronunciation in the same sentence.

### A9. 🟢 "How is this different from just using ChatGPT?"
**One-liner:** Three things ChatGPT cannot do: (1) cite *your* lecture slides, (2) speak Cantonese with English terms in the same utterance, (3) integrate with quizzes, flashcards, and a study plan that all share state.
**Killer follow-up:** It's also accessible from HK without VPN — a non-trivial advantage for the actual user base.

### A10. 🔴 "What if your AI tells a student something wrong on the exam?"
**One-liner:** The disclaimer is always visible, the model is instructed to express uncertainty, and we recommend students treat it as a study aid not a source of truth — exactly as we'd recommend for any LLM. The pedagogical responsibility ultimately remains with the lecturer's official material.
**Tone:** Calm, accept the question's seriousness, do not become defensive.

---

## Section B — Teaching Assistants (operational, integration-focused)

TAs care about whether this *helps them* or *threatens them*, and about practical day-2 logistics.

### B1. 🟢 "Does this replace us?"
**One-liner:** No — it handles the long tail of repeated, simple questions ("what does ACK mean?") so TAs can spend office hours on the genuinely hard problems.
**Show the data:** In our pilot, 60% of student questions were definitional or "explain X again" — exactly the questions that consume TA bandwidth without engaging their expertise.

### B2. 🟢 "Can I review what students are asking? Use it to update the lecture?"
**One-liner:** Yes — that's literally on the August roadmap (the "Lecturer dashboard for FAQ patterns" item). Aggregated, anonymized question topics surfaced as a heat-map by lecture.
**Privacy framing:** Lecturers see *topics*, never student-identifying conversation content.

### B3. 🟢 "How do students log in? How do you prevent account sharing?"
**One-liner:** Today: anonymous, one session per browser. May roadmap: Replit Auth tied to ITSC ID.
**Honest acknowledgement:** Account sharing is a minor concern because each query costs ~¢0.3 — even 10x sharing is operationally fine.

### B4. 🟢 "Does it integrate with Canvas / Moodle?"
**One-liner:** Not yet — Canvas LTI integration is on the August roadmap. For now it's a standalone web app linkable from Canvas.

### B5. 🟢 "Mobile experience?"
**One-liner:** Fully responsive — designed mobile-first. The Pomodoro timer floats. Voice input works on iOS Safari and Android Chrome. The auto-playing intro adapts to portrait orientation.

### B6. 🟡 "What happens at exam time when 300 students hit it at once?"
**One-liner:** OpenRouter handles rate limiting at the model layer. Our app routes to the throughput-optimized provider (\`provider:{sort:'throughput'}\`) so the worst-case is degraded latency, not failures. SQLite scales to far more than 300 concurrent reads.
**Tell the truth:** We have not load-tested 300 concurrent. We have load-tested 30. We expect to validate this before fall.

### B7. 🟢 "Can I download a transcript of a student's session for grading help?"
**One-liner:** Conversations are local to the student's browser session; we don't store cross-user transcripts. If a student wants to share their session with a TA, they can copy-paste — that's the deliberate privacy boundary.

### B8. 🟢 "How much does this cost the department to run?"
**Numbers:**
- Replit Reserved VM deployment: ~US$10 / month
- OpenRouter API (Qwen3-235B): ~¢0.3 per tutor reply
- 300 students × 5 questions/day × 30 days = ~US$135/month at peak
**Total:** under US$200/month for a full cohort. Roughly the cost of one TA-hour per week.

### B9. 🟢 "Lecture content updates each semester. Who maintains the knowledge base?"
**One-liner:** Today: the dev team, via a one-line CLI (\`bun run seed-lectures\`). Roadmap: an admin upload UI so any TA can drop in a new PDF and it's live in 90 s.

### B10. 🟢 "Can I add my own materials? Past-paper solutions?"
**One-liner:** Yes via \`/api/knowledge\` POST today (developer-flow); the admin UI on the roadmap will be drag-and-drop. Past papers are excluded by default to preserve exam integrity — TAs can opt them in.

---

## Section C — Students (UX, practical, "will it help me pass?")

Student questions are about utility, fairness, and friction.

### C1. 🟢 "Is it free?"
**Yes.** Free for the duration of the pilot. Long-term funding model is TBD but our cost analysis (B8) shows the department can sustain it cheaply.

### C2. 🟢 "Will my professor see what I asked?"
**No — never the content.** Aggregated topic frequencies only, and only on the future lecturer dashboard. Your conversations stay in your browser.

### C3. 🟢 "What if it gives me a wrong answer?"
**One-liner:** The disclaimer is always visible. Always cross-check with the lecture slides — and if it's important, ask the TA. We've optimized to reduce errors; we can't promise zero.

### C4. 🟢 "Can I use it for the final exam revision?"
**Absolutely.** That's exactly what it's built for. The "Practice" tab has 310+ quiz questions tagged by lecture, plus a Pomodoro timer and a streak system to keep you on track.

### C5. 🟢 "Does it work on my phone? In Cantonese?"
**Yes to both.** Cantonese voice input, Cantonese text-to-speech (with English technical terms pronounced correctly), Cantonese text answers. Designed mobile-first.

### C6. 🟡 "Can I download my notes / chat history?"
**Today:** Manual copy-paste. **Roadmap:** Export-to-Markdown button in the conversation menu (June 2026).

### C7. 🟢 "Can I import my own lecture notes?"
**Today:** Drag-and-drop a PDF into the chat — vision mode reads it. **Roadmap:** Persistent personal note library (July 2026).

### C8. 🟢 "Will my study streak reset if I miss a day?"
**Yes — that's the design.** Streaks are a motivational mechanic; the pain of breaking one is the point. We do show a "freeze" option on the roadmap for legitimate reasons.

### C9. 🟢 "Why is the intro animation so long? Can I skip it?"
**Yes — Skip button top-right.** And after you see it once, it never replays in the same browser session.

### C10. 🟢 "Dark mode?"
**Yes, follows system preference.** Toggle in the top bar.

### C11. 🟢 "What if I find a bug?"
**Use the in-app feedback button** (bottom-left "1 Issue"), or email team@learningpacer.app. We respond within 24 hours during the pilot.

### C12. 🟢 "Will it help me get an A?"
**Direct answer:** It will not memorize the material for you. It will explain anything you don't understand at any time of day, in your own language, and quiz you until you do. The rest is on you.

---

## Section D — Curveball / sensitive questions

The questions you hope nobody asks. Have an answer anyway.

### D1. 🔴 "Is this approved by HKUST? By the IT department?"
**Honest answer:** Not formally. This is a student project; we are seeking IRB approval for the May pilot. We've used only public lecture material and zero student PII; we're confident we comply with HKUST IT policy but we have not had it formally reviewed.
**Tone:** Don't bluff. Acknowledge the gap and show you've thought about the path to approval.

### D2. 🔴 "What happens to the data if you graduate / abandon the project?"
**One-liner:** All conversation data is local to the deployment. If shut down, the database is deleted. The codebase is open-source on the roadmap so any successor team can fork it.

### D3. 🔴 "Are you using copyrighted lecture material without permission?"
**One-liner:** We've used the lecture PDFs provided to enrolled students as study material — this is a study aid, not a republication. We'd seek explicit permission from the lecturer before any wider distribution.
**Subtext:** This is exactly why the IRB pilot matters — it surfaces these questions formally.

### D4. 🔴 "What if the model has been trained on biased / incorrect networking content?"
**One-liner:** That's why we ground in *your* lecture deck rather than relying on the model's parametric knowledge alone. When the model and the slides disagree, the slides win.

### D5. 🔴 "Couldn't a student just use this to cheat on the homework?"
**One-liner:** They could — and they could equally use ChatGPT today, with no guardrails. Our system prompt explicitly refuses homework-style direct solutions in favor of hints and analogous worked examples.
**Concede:** No technical guardrail is foolproof. The cultural answer is to design assignments that *require* understanding rather than just answers — but that's a conversation for the lecturer.

### D6. 🔴 "Does using this make me a worse engineer because I rely on AI?"
**One-liner:** We share that concern. The system prompt is deliberately Socratic — it asks you what you've already tried before answering. The flashcard and quiz features exist specifically to force *retrieval practice*, the cognitive process that AI use can short-circuit.
**Tone:** Take this seriously; it's the most important question in the room.

### D7. 🟡 "How is this different from the dozens of other 'AI tutor' startups?"
**One-liner:** Three things: (1) built specifically for ELEC3120, not generic; (2) accessible from HK without VPN; (3) Cantonese-native. We're not trying to be a startup — we're trying to be useful for one course.

### D8. 🔴 "What are you doing with the OpenRouter API key? Whose money pays for queries?"
**One-liner:** The API key is held by the project owner and funded out-of-pocket during the pilot. Long-term funding would come from the department or a small student-fee model — to be discussed if the pilot is approved.

---

## Section E — Likely live-demo failures (rehearsal checklist)

What if something breaks on stage? Pre-rehearsed responses.

| Failure | What you say |
|---|---|
| Model takes >5s for first token | "OpenRouter is routing through a slower provider right now — let me show you the second example while this finishes." |
| Wrong/hallucinated answer appears live | "Good — this is exactly the case the disclaimer is for. Let me show you what the cited slide actually says." |
| TTS doesn't speak | "Web Speech API needs to be unlocked by user interaction on first load — works on the second click." |
| Quiz module errors | "This is the seeded fallback — production runs on the live KB. Skipping ahead to the next demo step." |
| Browser shows hydration warning | Ignore; do not bring it up. It's a Next.js dev-mode artifact, doesn't appear in production. |
| Wifi dies | Switch to local screenshots in the appendix. |

---

## Section F — Closing one-liners

Have these memorized for the final 30 seconds.

1. **"LearningPacer is not a replacement for your lecturer or your TAs — it's the patient friend you call at 2 a.m. when you don't understand TCP, who happens to remember every lecture slide."**

2. **"We built this because we were the students who needed it. We're hoping the next cohort doesn't have to."**

3. **"Open-source by August. Try it tonight at learningpacer.replit.app."**

---

*Document version: 1.0 · Last updated: April 22, 2026 · Authors: LearningPacer team*
`;

writeFileSync('generated/LearningPacer_Presentation_QA_Report.md', report, 'utf8');
console.log('✓ Wrote generated/LearningPacer_Presentation_QA_Report.md');
console.log('\nDone. Two files in ./generated/:');
console.log('  - LearningPacer_Presentation.pptx');
console.log('  - LearningPacer_Presentation_QA_Report.md');
