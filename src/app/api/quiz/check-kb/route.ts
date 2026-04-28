import { NextRequest } from 'next/server';

interface CheckKbRequest {
  questionId: string;
  selectedOptionId: string;
  answers: Record<string, { correctAnswer: string; explanationEn: string; explanationZh: string }>;
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckKbRequest = await request.json();
    const { questionId, selectedOptionId, answers } = body;

    if (!questionId || !selectedOptionId || !answers) {
      return Response.json(
        { error: 'Missing required fields: questionId, selectedOptionId, answers' },
        { status: 400 }
      );
    }

    const answerData = answers[questionId];

    if (!answerData) {
      return Response.json(
        { error: `No answer data found for question "${questionId}"` },
        { status: 404 }
      );
    }

    const { correctAnswer, explanationEn, explanationZh } = answerData;
    const isCorrect = selectedOptionId === correctAnswer;

    return Response.json({
      isCorrect,
      correctAnswer,
      explanationEn: explanationEn || 'No explanation available.',
      explanationZh: explanationZh || '暫無解釋。',
    });
  } catch (error) {
    console.error('Error checking knowledge base quiz answer:', error);
    return Response.json(
      { error: 'Failed to check answer' },
      { status: 500 }
    );
  }
}
