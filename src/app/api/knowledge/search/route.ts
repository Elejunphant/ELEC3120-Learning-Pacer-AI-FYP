import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const maxResults = parseInt(searchParams.get('max') || '3', 10);

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ results: [], query: '' });
    }

    const documents = await db.knowledgeDocument.findMany({
      orderBy: { createdAt: 'desc' },
    });

    if (documents.length === 0) {
      return NextResponse.json({ results: [], query });
    }

    // Simple keyword-based search with relevance scoring
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter((w) => w.length > 1);

    const scored = documents.map((doc) => {
      const contentLower = doc.content.toLowerCase();
      const titleLower = doc.title.toLowerCase();

      let score = 0;

      // Title match (high weight)
      for (const word of queryWords) {
        if (titleLower.includes(word)) score += 10;
      }

      // Content match
      for (const word of queryWords) {
        const occurrences = (contentLower.match(new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
        score += Math.min(occurrences, 5); // cap at 5 per word
      }

      // Find best matching chunk
      const chunks = doc.content.split(/\n\n+/);
      let bestChunk = '';
      let bestChunkScore = 0;

      for (const chunk of chunks) {
        const chunkLower = chunk.toLowerCase();
        let chunkScore = 0;
        for (const word of queryWords) {
          if (chunkLower.includes(word)) chunkScore += 2;
        }
        if (chunkScore > bestChunkScore) {
          bestChunkScore = chunkScore;
          bestChunk = chunk;
        }
      }

      return {
        id: doc.id,
        title: doc.title,
        fileType: doc.fileType,
        score,
        bestChunk: bestChunk ? bestChunk.slice(0, 1500) : doc.content.slice(0, 1500),
        totalChunks: chunks.length,
        createdAt: doc.createdAt,
      };
    });

    // Filter documents with any relevance, sort by score, take top N
    const results = scored
      .filter((d) => d.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults);

    return NextResponse.json({ results, query });
  } catch (error) {
    console.error('Error searching knowledge base:', error);
    return NextResponse.json(
      { error: 'Failed to search knowledge base' },
      { status: 500 }
    );
  }
}
