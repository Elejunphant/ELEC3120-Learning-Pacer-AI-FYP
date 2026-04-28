/**
 * Script to process all lecture PDFs and insert them into the knowledge base.
 * Uses pdf-parse for text extraction and Prisma for database insertion.
 */
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const UPLOAD_DIR = path.join(process.cwd(), 'upload');

// Define all lecture PDFs in order
const LECTURE_FILES = [
  { file: '01-Introduction.pdf', title: 'Lecture 01: Introduction to Computer Networks' },
  { file: '02-Web.pdf', title: 'Lecture 02: Web & HTTP' },
  { file: '03-Video.pdf', title: 'Lecture 03: Video Streaming' },
  { file: '04-Transport_Model.pdf', title: 'Lecture 04: Transport Layer Model' },
  { file: '05-Transport_Basics.pdf', title: 'Lecture 05: Transport Layer Basics' },
  { file: '06-TCP_Basics.pdf', title: 'Lecture 06: TCP Basics' },
  { file: '07-Congestion_Control.pdf', title: 'Lecture 07: Congestion Control' },
  { file: '08-AdvancedCC.pdf', title: 'Lecture 08: Advanced Congestion Control' },
  { file: '09-Queue.pdf', title: 'Lecture 09: Queue Management & Scheduling' },
  { file: '10-IP.pdf', title: 'Lecture 10: IP - Internet Protocol' },
  { file: '11-BGP (1).pdf', title: 'Lecture 11: BGP - Border Gateway Protocol' },
  { file: '12-Internet.pdf', title: 'Lecture 12: Internet Architecture' },
  { file: '13-LAN (1).pdf', title: 'Lecture 13: LAN - Local Area Networks' },
  { file: '14-Distance_Vector (1).pdf', title: 'Lecture 14: Distance Vector Routing' },
  { file: '15-Link_Layer (1).pdf', title: 'Lecture 15: Link Layer' },
  { file: '16_Wireless.pdf', title: 'Lecture 16: Wireless Networks (Part 1)' },
  { file: '16_Wireless (1).pdf', title: 'Lecture 16: Wireless Networks (Part 2)' },
  { file: '17-New_Networks.pdf', title: 'Lecture 17: New Network Technologies' },
  { file: '18-Security.pdf', title: 'Lecture 18: Network Security' },
];

async function extractTextFromPDF(filePath: string): Promise<string> {
  try {
    const pdfParse = await import('pdf-parse');
    const buffer = fs.readFileSync(filePath);
    const data: any = await pdfParse.default(buffer);
    return (data.text || '') as string;
  } catch (error) {
    console.error(`Error extracting text from ${filePath}:`, error);
    return '';
  }
}

function splitIntoChunks(text: string, maxChunkSize: number = 2000, overlap: number = 200): string[] {
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
    start = end - overlap;
    if (start >= text.length || chunks.length > 1000) break;
  }
  return chunks.filter((c) => c.length > 0);
}

async function processLectures() {
  console.log('Starting PDF processing...\n');

  // Clear existing knowledge documents
  const existingCount = await prisma.knowledgeDocument.count();
  if (existingCount > 0) {
    console.log(`Clearing ${existingCount} existing knowledge documents...`);
    await prisma.knowledgeDocument.deleteMany();
    console.log('Cleared.\n');
  }

  const files = LECTURE_FILES;
  let successCount = 0;
  let failCount = 0;

  for (const lecture of files) {
    const filePath = path.join(UPLOAD_DIR, lecture.file);

    if (!fs.existsSync(filePath)) {
      console.log(`SKIP: ${lecture.file} not found`);
      failCount++;
      continue;
    }

    console.log(`Processing: ${lecture.title}`);

    const text = await extractTextFromPDF(filePath);
    if (!text.trim()) {
      console.log(`  Warning: No text extracted, skipping`);
      failCount++;
      continue;
    }

    // Clean up the text
    const cleanedText = text
      .replace(/\n{3,}/g, '\n\n')  // Multiple newlines to double
      .trim();

    const chunks = splitIntoChunks(cleanedText);
    const fileSize = fs.statSync(filePath).size;

    try {
      await prisma.knowledgeDocument.create({
        data: {
          title: lecture.title,
          content: cleanedText,
          fileType: 'pdf',
          fileSize,
          chunkCount: chunks.length,
        },
      });
      console.log(`  OK: ${cleanedText.length} chars, ${chunks.length} chunks, ${(fileSize / 1024).toFixed(0)}KB`);
      successCount++;
    } catch (error) {
      console.error(`  Error saving:`, error);
      failCount++;
    }
  }

  console.log(`\n=============================`);
  console.log(`Processed: ${successCount}/${files.length}`);
  if (failCount > 0) console.log(`Failed: ${failCount}/${files.length}`);
  console.log(`=============================`);

  // Verify
  const totalCount = await prisma.knowledgeDocument.count();
  console.log(`\nTotal knowledge documents in DB: ${totalCount}`);
}

processLectures()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
