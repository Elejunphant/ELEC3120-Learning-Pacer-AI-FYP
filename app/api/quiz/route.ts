import { quizQuestions } from '@/lib/quiz-data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const topic = searchParams.get('topic');
    const topics = searchParams.get('topics');
    const difficulty = searchParams.get('difficulty');
    const count = parseInt(searchParams.get('count') || '5', 10);

    let filtered = [...quizQuestions];

    // Support single topic or multiple topics (comma-separated)
    const topicIds: string[] = [];
    if (topic && topic !== 'all') {
      topicIds.push(topic);
    }
    if (topics) {
      const split = topics.split(',').map((t) => t.trim()).filter(Boolean);
      topicIds.push(...split);
    }
    if (topicIds.length > 0) {
      const uniqueTopics = [...new Set(topicIds)];
      filtered = filtered.filter((q) => uniqueTopics.includes(q.topicId));
    }

    if (difficulty && difficulty !== 'all') {
      filtered = filtered.filter((q) => q.difficulty === difficulty);
    }

    // Shuffle and take requested count
    const shuffled = filtered.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(count, shuffled.length));

    // Remove correct answers and explanation for client
    const clientQuestions = selected.map((q) => ({
      id: q.id,
      questionEn: q.questionEn,
      questionZh: q.questionZh,
      options: q.options.map((o) => ({ id: o.id, textEn: o.textEn, textZh: o.textZh })),
      difficulty: q.difficulty,
      topicId: q.topicId,
      topicNameEn: q.topicNameEn,
      topicNameZh: q.topicNameZh,
    }));

    return Response.json({
      questions: clientQuestions,
      total: filtered.length,
      requested: count,
    });
  } catch (error) {
    console.error('Error fetching quiz questions:', error);
    return Response.json(
      { error: 'Failed to fetch quiz questions' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { questionId, selectedOptionId } = body;

    const question = quizQuestions.find((q) => q.id === questionId);

    if (!question) {
      return Response.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    const isCorrect = selectedOptionId === question.correctAnswer;

    return Response.json({
      isCorrect,
      correctAnswer: question.correctAnswer,
      explanationEn: question.explanationEn,
      explanationZh: question.explanationZh,
    });
  } catch (error) {
    console.error('Error checking quiz answer:', error);
    return Response.json(
      { error: 'Failed to check answer' },
      { status: 500 }
    );
  }
}
