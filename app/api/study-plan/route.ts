import { db } from '@/lib/db';
import { openrouterChat } from '@/lib/openrouter';

const SYSTEM_PROMPT = `You are a knowledgeable Teaching Assistant for HKUST's ELEC3120 Computer Networking course. Your task is to create a personalized, actionable study plan based on a student's quiz performance data.

You must respond with valid JSON only (no markdown code fences, no extra text). The JSON must follow this exact structure:

{
  "summary": {
    "en": "A 2-3 sentence overall assessment of the student's performance in English",
    "zh": "A 2-3 sentence overall assessment of the student's performance in Chinese"
  },
  "weakAreas": [
    {
      "topicName": "Topic name",
      "accuracy": 45,
      "severity": "high|medium|low",
      "reason": {
        "en": "Why this topic needs attention (English)",
        "zh": "Why this topic needs attention (Chinese)"
      }
    }
  ],
  "recommendedTopics": [
    {
      "topicName": "Topic name",
      "priority": 1,
      "focusArea": {
        "en": "Specific subtopic or concept to focus on (English)",
        "zh": "Specific subtopic or concept to focus on (Chinese)"
      },
      "estimatedHours": 2,
      "resources": {
        "en": "Suggested study materials or approach (English)",
        "zh": "Suggested study materials or approach (Chinese)"
      }
    }
  ],
  "studySchedule": [
    {
      "day": "Monday",
      "topic": "Topic to study",
      "duration": "1.5 hours",
      "activities": {
        "en": "Specific study activities for that day (English)",
        "zh": "Specific study activities for that day (Chinese)"
      }
    }
  ],
  "tips": [
    {
      "en": "A practical study tip in English",
      "zh": "A practical study tip in Chinese"
    }
  ]
}

Guidelines:
- Focus on topics with accuracy below 70% as weak areas
- severity "high" for accuracy < 40%, "medium" for 40-60%, "low" for 60-70%
- Recommended topics should be ordered by priority (most urgent first)
- Create a realistic 7-day study schedule
- Provide 4-6 actionable study tips
- Be encouraging but honest about areas needing improvement
- Reference specific networking concepts relevant to ELEC3120
- The schedule should balance review of weak topics and practice of all topics`;

const DEFAULT_PLAN = {
  summary: {
    en: "You're just getting started with your ELEC3120 studies! Taking quizzes regularly will help us identify your strengths and areas that need more attention. Let's build a solid foundation across all networking topics.",
    zh: "你剛剛開始ELEC3120的學習！定期參加測驗將幫助我們識別你的優勢和需要加強的領域。讓我們在所有網絡主題上打好堅實的基礎。",
  },
  weakAreas: [] as Array<{
    topicName: string;
    accuracy: number;
    severity: string;
    reason: { en: string; zh: string };
  }>,
  recommendedTopics: [
    {
      topicName: "Network Fundamentals",
      priority: 1,
      focusArea: {
        en: "OSI model, TCP/IP layers, packet switching vs circuit switching",
        zh: "OSI模型、TCP/IP層次、分組交換與電路交換",
      },
      estimatedHours: 2,
      resources: {
        en: "Review lecture slides Ch.1, practice with the knowledge base topics",
        zh: "複習第一章課件，結合知識庫主題進行練習",
      },
    },
    {
      topicName: "Transport Layer",
      priority: 2,
      focusArea: {
        en: "UDP vs TCP comparison, multiplexing/demultiplexing",
        zh: "UDP與TCP比較、多路複用/多路分解",
      },
      estimatedHours: 2,
      resources: {
        en: "Focus on understanding the differences and use cases for each protocol",
        zh: "重點理解兩種協定的區別和各自的使用場景",
      },
    },
    {
      topicName: "Reliable Transmission",
      priority: 3,
      focusArea: {
        en: "RDT protocols, ARQ mechanisms, pipelined protocols",
        zh: "RDT協定、ARQ機制、流水線協定",
      },
      estimatedHours: 1.5,
      resources: {
        en: "Draw FSM diagrams for each RDT protocol version",
        zh: "為每個RDT協定版本繪製有限狀態機圖",
      },
    },
  ],
  studySchedule: [
    {
      day: "Monday",
      topic: "Network Fundamentals",
      duration: "1.5 hours",
      activities: {
        en: "Review OSI model layers and their functions. Study packet switching concepts.",
        zh: "複習OSI模型各層及其功能。學習分組交換概念。",
      },
    },
    {
      day: "Tuesday",
      topic: "Transport Layer (UDP)",
      duration: "1 hour",
      activities: {
        en: "Study UDP header format, use cases, and why connectionless is sometimes preferred.",
        zh: "學習UDP頭部格式、使用場景，以及為什麼有時更偏好無連接協定。",
      },
    },
    {
      day: "Wednesday",
      topic: "Transport Layer (TCP)",
      duration: "1.5 hours",
      activities: {
        en: "Deep dive into TCP three-way handshake, sequence numbers, and flow control.",
        zh: "深入學習TCP三次握手、序列號和流量控制。",
      },
    },
    {
      day: "Thursday",
      topic: "Reliable Transmission",
      duration: "1.5 hours",
      activities: {
        en: "Practice drawing RDT FSMs. Compare stop-and-wait vs pipelined protocols.",
        zh: "練習繪製RDT有限狀態機。比較停等協定與流水線協定。",
      },
    },
    {
      day: "Friday",
      topic: "TCP Connection Mgmt & Flow Control",
      duration: "1 hour",
      activities: {
        en: "Study TCP connection states and sliding window mechanism.",
        zh: "學習TCP連接狀態和滑動窗口機制。",
      },
    },
    {
      day: "Saturday",
      topic: "Congestion Control & HTTP",
      duration: "2 hours",
      activities: {
        en: "Learn slow start, congestion avoidance, fast retransmit. Review HTTP/1.0 through HTTP/3.",
        zh: "學習慢啓動、擁塞避免、快速重傳。複習HTTP/1.0到HTTP/3。",
      },
    },
    {
      day: "Sunday",
      topic: "Review & Practice Quiz",
      duration: "1.5 hours",
      activities: {
        en: "Take practice quizzes on all topics. Review any areas still feeling uncertain.",
        zh: "參加所有主題的練習測驗。複習任何仍然不確定的領域。",
      },
    },
  ],
  tips: [
    {
      en: "Start with Network Fundamentals as it provides the foundation for all other topics.",
      zh: "從網絡基礎開始，因為它是所有其他主題的基礎。",
    },
    {
      en: "Draw diagrams! FSMs for RDT, packet flow for TCP handshake — visual learning is powerful.",
      zh: "畫圖！RDT的有限狀態機、TCP握手的分組流程——視覺學習非常有效。",
    },
    {
      en: "Take a quiz after each study session to reinforce what you've just learned.",
      zh: "每次學習後參加測驗，鞏固你剛剛學到的知識。",
    },
    {
      en: "Use the chat assistant to ask questions about concepts you find confusing.",
      zh: "使用聊日助手詢問你覺得困惑的概念。",
    },
    {
      en: "Focus on understanding WHY protocols work the way they do, not just memorizing facts.",
      zh: "重點理解協定為什麼呢樣工作，而不僅僅是記憶事實。",
    },
    {
      en: "Consistency beats cramming — 1-2 hours daily is more effective than 7 hours on one day.",
      zh: "堅持勝過突擊——每日1-2小時比一日7小時更有效。",
    },
  ],
};

interface TopicStat {
  topicId: string;
  topicName: string;
  total: number;
  correct: number;
  accuracy: number;
}

interface DifficultyStat {
  difficulty: string;
  total: number;
  correct: number;
  accuracy: number;
}

interface QuizStats {
  totalAttempts: number;
  correctAttempts: number;
  overallAccuracy: number;
  topicAccuracy: TopicStat[];
  difficultyAccuracy: DifficultyStat[];
  recentAttempts: Array<{ id: string; topicName: string; isCorrect: boolean; createdAt: string }>;
  streak: number;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const language: string = body.language || 'en';

    // Fetch quiz stats from the database
    const totalAttempts = await db.quizAttempt.count();
    const correctAttempts = await db.quizAttempt.count({
      where: { isCorrect: true },
    });

    if (totalAttempts === 0) {
      // No quiz data — return default study plan
      return Response.json({
        studyPlan: DEFAULT_PLAN,
        generatedFromData: false,
      });
    }

    const overallAccuracy =
      totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;

    const topicAttempts = await db.quizAttempt.findMany({
      select: { topicId: true, topicName: true, isCorrect: true, difficulty: true },
    });

    const topicMap = new Map<string, { topicName: string; total: number; correct: number }>();
    for (const a of topicAttempts) {
      if (!topicMap.has(a.topicId)) {
        topicMap.set(a.topicId, { topicName: a.topicName, total: 0, correct: 0 });
      }
      const entry = topicMap.get(a.topicId)!;
      entry.total++;
      if (a.isCorrect) entry.correct++;
    }

    const topicAccuracy = Array.from(topicMap.entries())
      .map(([topicId, data]) => ({
        topicId,
        topicName: data.topicName,
        total: data.total,
        correct: data.correct,
        accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
      }))
      .sort((a, b) => a.accuracy - b.accuracy);

    const difficultyMap = new Map<string, { total: number; correct: number }>();
    for (const a of topicAttempts) {
      if (!difficultyMap.has(a.difficulty)) {
        difficultyMap.set(a.difficulty, { total: 0, correct: 0 });
      }
      const entry = difficultyMap.get(a.difficulty)!;
      entry.total++;
      if (a.isCorrect) entry.correct++;
    }

    const difficultyAccuracy = Array.from(difficultyMap.entries()).map(
      ([difficulty, data]) => ({
        difficulty,
        total: data.total,
        correct: data.correct,
        accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
      })
    );

    // Recent attempts for context
    const recentAttempts = await db.quizAttempt.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    let streak = 0;
    for (const attempt of recentAttempts) {
      if (attempt.isCorrect) {
        streak++;
      } else {
        break;
      }
    }
    if (recentAttempts.length === 20 && recentAttempts.every((a) => a.isCorrect)) {
      streak = correctAttempts;
    }

    const quizStats: QuizStats = {
      totalAttempts,
      correctAttempts,
      overallAccuracy,
      topicAccuracy,
      difficultyAccuracy,
      recentAttempts: recentAttempts.reverse(),
      streak,
    };

    // Build the AI prompt
    const userPrompt = `Based on the following quiz statistics for an ELEC3120 Computer Networking student, create a personalized study plan.

Student Performance Data:
- Total Questions Attempted: ${quizStats.totalAttempts}
- Correct Answers: ${quizStats.correctAttempts}
- Overall Accuracy: ${quizStats.overallAccuracy}%
- Current Streak: ${quizStats.streak} consecutive correct answers

Topic Performance (sorted by accuracy, lowest first):
${quizStats.topicAccuracy
  .map(
    (t) =>
      `  - ${t.topicName}: ${t.correct}/${t.total} (${t.accuracy}%)`
  )
  .join('\n')}

Difficulty Breakdown:
${quizStats.difficultyAccuracy
  .map(
    (d) =>
      `  - ${d.difficulty}: ${d.correct}/${d.total} (${d.accuracy}%)`
  )
  .join('\n')}

Recent Activity (last 10 attempts):
${quizStats.recentAttempts
  .slice(-10)
  .map(
    (a) =>
      `  - ${a.topicName}: ${a.isCorrect ? 'Correct ✓' : 'Incorrect ✗'} (${a.createdAt})`
  )
  .join('\n')}

Respond ONLY with valid JSON matching the required structure. No markdown code fences. The user's preferred language is "${language}" but provide all text in both English and Traditional Chinese (繁體中文 / 正體中文). The Chinese fields MUST use Traditional Chinese characters (Hong Kong / Taiwan usage); never output Simplified Chinese.`;

    // Call AI
    try {
      const result = await openrouterChat([
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ]);

      if (result.error) {
        throw new Error(result.error);
      }

      let messageContent = result.text;
      if (!messageContent) {
        throw new Error('Empty response from AI');
      }

      // Clean up the response — remove possible markdown fences
      messageContent = messageContent.trim();
      if (messageContent.startsWith('```json')) {
        messageContent = messageContent.slice(7);
      }
      if (messageContent.startsWith('```')) {
        messageContent = messageContent.slice(3);
      }
      if (messageContent.endsWith('```')) {
        messageContent = messageContent.slice(0, -3);
      }
      messageContent = messageContent.trim();

      // Parse and validate the JSON
      const studyPlan = JSON.parse(messageContent);

      // Basic validation
      if (!studyPlan.summary || !studyPlan.studySchedule || !studyPlan.tips) {
        throw new Error('Invalid study plan structure');
      }

      return Response.json({
        studyPlan,
        generatedFromData: true,
      });
    } catch (aiError) {
      console.error('AI study plan generation failed, generating local plan:', aiError);

      // Fallback: generate a local plan based on quiz stats
      const localPlan = generateLocalPlan(quizStats);
      return Response.json({
        studyPlan: localPlan,
        generatedFromData: true,
        fallback: true,
      });
    }
  } catch (error) {
    console.error('Error generating study plan:', error);
    return Response.json(
      { error: 'Failed to generate study plan' },
      { status: 500 }
    );
  }
}

function generateLocalPlan(stats: QuizStats) {
  const weakTopics = stats.topicAccuracy
    .filter((t) => t.accuracy < 70)
    .sort((a, b) => a.accuracy - b.accuracy);

  const strongTopics = stats.topicAccuracy
    .filter((t) => t.accuracy >= 70)
    .sort((a, b) => b.accuracy - a.accuracy);

  const severity = (acc: number) => (acc < 40 ? 'high' : acc < 60 ? 'medium' : 'low');

  const weakAreas = weakTopics.map((t) => ({
    topicName: t.topicName,
    accuracy: t.accuracy,
    severity: severity(t.accuracy),
    reason: {
      en: `With ${t.accuracy}% accuracy across ${t.total} questions, this topic needs focused review.`,
      zh: `在${t.total}道題中準確率為${t.accuracy}%，呢個主題需要重點複習。`,
    },
  }));

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Build schedule: weak topics first, then review
  const allTopicsForSchedule = [
    ...weakTopics,
    ...strongTopics.slice(0, Math.max(0, 7 - weakTopics.length)),
  ];

  const studySchedule = days.map((day, i) => {
    const topic = allTopicsForSchedule[i % allTopicsForSchedule.length];
    const isReview = i === days.length - 1;
    return {
      day,
      topic: isReview
        ? (stats.overallAccuracy < 50 ? 'Comprehensive Review' : 'Practice & Review')
        : topic.topicName,
      duration: '1.5 hours',
      activities: isReview
        ? {
            en: 'Take practice quizzes on all topics. Focus on areas that still feel uncertain.',
            zh: '參加所有主題的練習測驗。重點複習仍然不確定的領域。',
          }
        : {
            en: `Study ${topic.topicName} concepts thoroughly. Review lecture notes and practice with quiz questions.`,
            zh: `深入學習${topic.topicName}的概念。複習課件筆記並通過測驗題進行練習。`,
          },
    };
  });

  const recommendedTopics = weakTopics.slice(0, 5).map((t, i) => ({
    topicName: t.topicName,
    priority: i + 1,
    focusArea: {
      en: `Review core concepts and practice with quiz questions to improve from ${t.accuracy}% accuracy.`,
      zh: `複習核心概念並通過測驗題練習，以提高${t.accuracy}%的準確率。`,
    },
    estimatedHours: severity(t.accuracy) === 'high' ? 3 : 2,
    resources: {
      en: 'Use the knowledge base, review lecture slides, and take targeted quizzes.',
      zh: '使用知識庫、複習課件幻燈片，並進行針對性測驗。',
    },
  }));

  const tips = [
    {
      en: `Your overall accuracy is ${stats.overallAccuracy}%. Focus on bringing weak topics above 70%.`,
      zh: `你的總體準確率為${stats.overallAccuracy}%。重點將薄弱主題提高到70%以上。`,
    },
    {
      en: `You have a streak of ${stats.streak} correct answers — keep the momentum going!`,
      zh: `你已經有${stats.streak}道題連續正確的紀錄——保持呢個勢頭！`,
    },
    {
      en: weakTopics.length > 0
        ? `Priority topics: ${weakTopics.slice(0, 3).map((t) => t.topicName).join(', ')}.`
        : 'Great job! All topics are above 70%. Focus on maintaining and deepening your knowledge.',
      zh:
        weakTopics.length > 0
          ? `優先主題：${weakTopics.slice(0, 3).map((t) => t.topicName).join('、')}。`
          : '做得很好！所有主題都在70%以上。重點保持並深化你的知識。',
    },
    {
      en: 'Draw diagrams for protocols (TCP handshake, FSMs) to reinforce visual memory.',
      zh: '為協定畫圖（TCP握手、有限狀態機）以加強視覺記憶。',
    },
    {
      en: 'After studying a topic, immediately take a quiz to test your understanding.',
      zh: '學習一個主題後，立即參加測驗來測試你的理解。',
    },
  ];

  const summaryText =
    stats.overallAccuracy >= 80
      ? {
          en: `Excellent work! You have an overall accuracy of ${stats.overallAccuracy}% across ${stats.totalAttempts} questions. You're performing well in most areas. Keep up the great work and focus on maintaining consistency.`,
          zh: `做得非常好！你在${stats.totalAttempts}道題中的總體準確率為${stats.overallAccuracy}%。你在大多數領域表現良好。繼續努力，保持穩定。`,
        }
      : stats.overallAccuracy >= 60
        ? {
            en: `Good progress! Your overall accuracy is ${stats.overallAccuracy}% across ${stats.totalAttempts} questions. You have a solid understanding of many topics but could benefit from focused review in weaker areas to strengthen your foundation.`,
            zh: `進展不錯！你在${stats.totalAttempts}道題中的總體準確率為${stats.overallAccuracy}%。你對許多主題有扎實的理解，但在薄弱領域進行重點複習將有助於加強基礎。`,
          }
        : {
            en: `You're building your knowledge with ${stats.totalAttempts} questions attempted and ${stats.overallAccuracy}% overall accuracy. This is a normal starting point — consistent study and targeted practice on weak areas will lead to significant improvement.`,
            zh: `你積累知識，已嘗試${stats.totalAttempts}道題，總體準確率為${stats.overallAccuracy}%。呢是一個正常的起點——持續學習和針對薄弱領域的練習將帶來顯著進步。`,
          };

  return {
    summary: summaryText,
    weakAreas,
    recommendedTopics,
    studySchedule,
    tips,
  };
}
