import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import {
  PAGE_MARKER_REGEX,
  extractPdfText,
  insertPageMarkersForText,
  splitIntoChunks,
} from '@/lib/pdf-extract';

// GET: List all knowledge documents
export async function GET() {
  try {
    const documents = await db.knowledgeDocument.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const list = documents.map((doc) => {
      const cleanContent = doc.content.replace(PAGE_MARKER_REGEX, '');
      return {
        id: doc.id,
        title: doc.title,
        fileType: doc.fileType,
        fileSize: doc.fileSize,
        chunkCount: doc.chunkCount,
        contentLength: cleanContent.length,
        contentPreview: cleanContent.slice(0, 200) + (cleanContent.length > 200 ? '...' : ''),
        createdAt: doc.createdAt,
      };
    });

    return NextResponse.json(list);
  } catch (error) {
    console.error('Error fetching knowledge documents:', error);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

// POST: Upload a new knowledge document (form data with file + title)
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const title = formData.get('title') as string | null;
    const textContent = formData.get('content') as string | null;

    if (!file && !textContent) {
      return NextResponse.json({ error: 'File or text content is required' }, { status: 400 });
    }

    let extractedText = '';
    let fileType = 'txt';
    let fileSize = 0;

    if (file) {
      fileSize = file.size;
      const fileName = file.name.toLowerCase();
      const ext = fileName.split('.').pop() || '';
      fileType = ext as string;

      if (['txt', 'md', 'csv', 'json'].includes(ext)) {
        const buffer = Buffer.from(await file.arrayBuffer());
        extractedText = insertPageMarkersForText(buffer.toString('utf-8'));
      } else if (ext === 'pdf') {
        const buffer = Buffer.from(await file.arrayBuffer());
        extractedText = await extractPdfText(buffer);
        if (!extractedText.trim()) {
          extractedText = `[PDF document: ${file.name}]\n\nNote: Automatic text extraction was limited. For best results, please also provide the text content directly.`;
        }
      } else {
        return NextResponse.json(
          { error: `Unsupported file type: .${ext}. Supported: .txt, .md, .csv, .json, .pdf` },
          { status: 400 },
        );
      }
    }

    if (textContent) {
      extractedText = insertPageMarkersForText(textContent);
    }

    const docTitle = title || (file ? file.name : 'Untitled Document');

    const cleanForCount = extractedText.replace(PAGE_MARKER_REGEX, '');
    const chunks = splitIntoChunks(cleanForCount, 2000, 200);

    const document = await db.knowledgeDocument.create({
      data: {
        title: docTitle,
        content: extractedText,
        fileType,
        fileSize,
        chunkCount: chunks.length,
      },
    });

    return NextResponse.json(
      {
        id: document.id,
        title: document.title,
        fileType: document.fileType,
        fileSize: document.fileSize,
        chunkCount: document.chunkCount,
        contentLength: cleanForCount.length,
        createdAt: document.createdAt,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error uploading knowledge document:', error);
    return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 });
  }
}
