import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/study-activity — returns study activity stats from DB
export async function GET() {
  try {
    const now = new Date();
    const todayStr = formatDateKey(now);

    // Get quiz attempts grouped by date (last 28 days)
    const twentyEightDaysAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
    const quizAttempts = await db.quizAttempt.findMany({
      where: {
        createdAt: { gte: twentyEightDaysAgo },
      },
      select: { createdAt: true },
    });

    // Get conversations grouped by date (last 28 days)
    const conversations = await db.conversation.findMany({
      where: {
        createdAt: { gte: twentyEightDaysAgo },
      },
      select: { createdAt: true },
    });

    // Aggregate by date
    const dateMap: Record<string, { quizAttempts: number; conversationsCreated: number }> = {};

    for (const qa of quizAttempts) {
      const key = formatDateKey(qa.createdAt);
      if (!dateMap[key]) dateMap[key] = { quizAttempts: 0, conversationsCreated: 0 };
      dateMap[key].quizAttempts++;
    }

    for (const conv of conversations) {
      const key = formatDateKey(conv.createdAt);
      if (!dateMap[key]) dateMap[key] = { quizAttempts: 0, conversationsCreated: 0 };
      dateMap[key].conversationsCreated++;
    }

    // Build daily activity array (last 28 days)
    const dailyActivity: Array<{
      date: string;
      quizAttempts: number;
      conversationsCreated: number;
    }> = [];

    for (let i = 27; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = formatDateKey(date);
      const data = dateMap[key] || { quizAttempts: 0, conversationsCreated: 0 };
      dailyActivity.push({
        date: key,
        ...data,
      });
    }

    // Calculate streak (consecutive days with activity from today backwards)
    let streak = 0;
    const todayData = dateMap[todayStr];
    if (todayData && (todayData.quizAttempts > 0 || todayData.conversationsCreated > 0)) {
      streak = 1;
      for (let i = 1; i <= 365; i++) {
        const prevDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const prevKey = formatDateKey(prevDate);
        const prevData = dateMap[prevKey];
        if (prevData && (prevData.quizAttempts > 0 || prevData.conversationsCreated > 0)) {
          streak++;
        } else {
          break;
        }
      }
    }

    // Calculate total study days (unique days with activity)
    const totalStudyDays = Object.keys(dateMap).length;

    // Check if active today
    const todayActive = !!(
      todayData && (todayData.quizAttempts > 0 || todayData.conversationsCreated > 0)
    );

    // Total quiz attempts (all time)
    const totalQuizAttempts = await db.quizAttempt.count();

    // Total conversations (all time)
    const totalConversations = await db.conversation.count();

    // Calculate longest streak
    const allDates = Object.keys(dateMap).sort();
    let longestStreak = 0;
    let currentStreak = 0;
    if (allDates.length > 0) {
      for (let i = 0; i < allDates.length; i++) {
        if (i === 0) {
          currentStreak = 1;
        } else {
          const prev = new Date(allDates[i - 1]);
          const curr = new Date(allDates[i]);
          const diffDays = Math.round(
            (curr.getTime() - prev.getTime()) / (24 * 60 * 60 * 1000)
          );
          if (diffDays === 1) {
            currentStreak++;
          } else {
            currentStreak = 1;
          }
        }
        longestStreak = Math.max(longestStreak, currentStreak);
      }
    }

    return NextResponse.json({
      dailyActivity,
      streak,
      totalStudyDays,
      todayActive,
      totalQuizAttempts,
      totalConversations,
      longestStreak,
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch study activity' },
      { status: 500 }
    );
  }
}

// POST /api/study-activity — log activity (type: 'quiz' | 'chat')
// Fire-and-forget endpoint; the client also tracks in localStorage
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type } = body as { type?: string };

    if (type !== 'quiz' && type !== 'chat') {
      return NextResponse.json(
        { error: 'Invalid activity type' },
        { status: 400 }
      );
    }

    // Activity is tracked via existing DB operations:
    // - 'quiz' → QuizAttempt records are created by quiz-panel
    // - 'chat' → Conversation records are created by chat flow
    // This endpoint serves as a signal hook for potential extensions

    return NextResponse.json({ ok: true, type });
  } catch {
    return NextResponse.json(
      { error: 'Failed to log activity' },
      { status: 500 }
    );
  }
}

function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
