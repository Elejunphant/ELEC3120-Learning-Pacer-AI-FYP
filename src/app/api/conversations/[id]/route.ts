import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const conversation = await db.conversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conversation) {
      return Response.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    return Response.json(conversation);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return Response.json(
      { error: 'Failed to fetch conversation' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title } = body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return Response.json(
        { error: 'Title is required and cannot be empty' },
        { status: 400 }
      );
    }

    if (title.trim().length > 100) {
      return Response.json(
        { error: 'Title must be 100 characters or less' },
        { status: 400 }
      );
    }

    const conversation = await db.conversation.update({
      where: { id },
      data: { title: title.trim() },
    });

    return Response.json(conversation);
  } catch (error) {
    console.error('Error renaming conversation:', error);
    return Response.json(
      { error: 'Failed to rename conversation' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await db.message.deleteMany({
      where: { conversationId: id },
    });

    await db.conversation.delete({
      where: { id },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return Response.json(
      { error: 'Failed to delete conversation' },
      { status: 500 }
    );
  }
}
