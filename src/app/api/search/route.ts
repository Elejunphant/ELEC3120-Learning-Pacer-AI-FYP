import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body as { query?: string };

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    const trimmed = query.trim();

    // Search messages across all conversations (case-insensitive)
    // SQLite: use contains without mode, then filter in JS for case-insensitive matching
    const messages = await db.message.findMany({
      where: {
        content: {
          contains: trimmed,
        },
      },
      include: {
        conversation: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // fetch more, filter below
    });

    // Case-insensitive filter in JS (SQLite LIKE is case-insensitive by default,
    // but we double-check to be safe)
    const lowerQuery = trimmed.toLowerCase();
    const filtered = messages.filter((m) =>
      m.content.toLowerCase().includes(lowerQuery)
    );
    const limited = filtered.slice(0, 20);

    // Group results by conversation
    const grouped = new Map<
      string,
      {
        conversationId: string;
        conversationTitle: string;
        messages: {
          id: string;
          content: string;
          role: string;
          createdAt: string;
        }[];
      }
    >();

    for (const msg of limited) {
      const convId = msg.conversationId;
      const existing = grouped.get(convId);

      const messageEntry = {
        id: msg.id,
        content: msg.content,
        role: msg.role,
        createdAt: msg.createdAt.toISOString(),
      };

      if (existing) {
        existing.messages.push(messageEntry);
      } else {
        grouped.set(convId, {
          conversationId: convId,
          conversationTitle: msg.conversation.title,
          messages: [messageEntry],
        });
      }
    }

    const results = Array.from(grouped.values());

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Failed to search messages' },
      { status: 500 }
    );
  }
}
