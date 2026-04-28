import { db } from '@/lib/db';

export async function GET() {
  try {
    const conversations = await db.conversation.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 50,
    });

    // Get message counts separately (SQLite compatibility)
    const convWithCounts = await Promise.all(
      conversations.map(async (conv) => {
        const msgCount = await db.message.count({
          where: { conversationId: conv.id },
        });
        return { ...conv, _count: { messages: msgCount } };
      })
    );

    return Response.json(convWithCounts);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return Response.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title } = body;

    const conversation = await db.conversation.create({
      data: {
        title: title || 'New Chat',
      },
    });

    return Response.json(conversation, { status: 201 });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return Response.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    // Delete all messages first, then all conversations
    await db.message.deleteMany({});
    await db.conversation.deleteMany({});
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting all conversations:', error);
    return Response.json(
      { error: 'Failed to delete all conversations' },
      { status: 500 }
    );
  }
}
