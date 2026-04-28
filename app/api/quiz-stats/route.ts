import { db } from '@/lib/db';

export async function GET() {
  try {
    const totalAttempts = await db.quizAttempt.count();
    const correctAttempts = await db.quizAttempt.count({
      where: { isCorrect: true },
    });

    const overallAccuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;

    // Fetch all attempts grouped by topic (SQLite doesn't support _sum on booleans in groupBy)
    const topicAttempts = await db.quizAttempt.findMany({
      select: { topicId: true, topicName: true, isCorrect: true, difficulty: true },
    });

    // Group by topic in JavaScript
    const topicMap = new Map<string, { topicName: string; total: number; correct: number }>();
    for (const a of topicAttempts) {
      if (!topicMap.has(a.topicId)) {
        topicMap.set(a.topicId, { topicName: a.topicName, total: 0, correct: 0 });
      }
      const entry = topicMap.get(a.topicId)!;
      entry.total++;
      if (a.isCorrect) entry.correct++;
    }

    const topicAccuracy = Array.from(topicMap.entries()).map(([topicId, data]) => ({
      topicId,
      topicName: data.topicName,
      total: data.total,
      correct: data.correct,
      accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
    })).sort((a, b) => a.topicId.localeCompare(b.topicId));

    // Group by difficulty in JavaScript
    const difficultyMap = new Map<string, { total: number; correct: number }>();
    for (const a of topicAttempts) {
      const diff = a.difficulty || 'medium'; // fallback for safety
      if (!difficultyMap.has(diff)) {
        difficultyMap.set(diff, { total: 0, correct: 0 });
      }
      const entry = difficultyMap.get(diff)!;
      entry.total++;
      if (a.isCorrect) entry.correct++;
    }

    const difficultyAccuracy = Array.from(difficultyMap.entries()).map(([difficulty, data]) => ({
      difficulty,
      total: data.total,
      correct: data.correct,
      accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
    }));

    // Recent 20 attempts (newest first)
    const recentAttempts = await db.quizAttempt.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // Calculate streak: count consecutive correct answers from most recent
    let streak = 0;
    for (const attempt of recentAttempts) {
      if (attempt.isCorrect) {
        streak++;
      } else {
        break;
      }
    }

    // If there are more than 20 attempts, we need to check beyond recent for streak
    if (recentAttempts.length === 20 && recentAttempts.every((a) => a.isCorrect)) {
      streak = correctAttempts;
    }

    return Response.json({
      totalAttempts,
      correctAttempts,
      overallAccuracy,
      topicAccuracy,
      difficultyAccuracy,
      recentAttempts: recentAttempts.reverse(), // oldest first for timeline
      streak,
    });
  } catch (error) {
    console.error('Error fetching quiz stats:', error);
    return Response.json(
      { error: 'Failed to fetch quiz stats' },
      { status: 500 }
    );
  }
}
