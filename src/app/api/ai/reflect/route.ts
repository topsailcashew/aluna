import { NextRequest, NextResponse } from 'next/server';
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getFirestore, collection, addDoc, serverTimestamp, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';

// Initialize Firebase (server-side)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

// Crisis keywords to detect
const CRISIS_KEYWORDS = [
  'suicide',
  'suicidal',
  'kill myself',
  'end my life',
  'want to die',
  'better off dead',
  'self-harm',
  'hurt myself',
  'cutting',
  'overdose',
  'no reason to live',
  'can\'t go on',
];

/**
 * Check if text contains crisis language
 */
function detectCrisis(text: string): boolean {
  const lowerText = text.toLowerCase();
  return CRISIS_KEYWORDS.some((keyword) => lowerText.includes(keyword));
}

/**
 * Check rate limiting for AI usage
 */
async function checkRateLimit(userId: string): Promise<boolean> {
  try {
    const usageRef = collection(db, 'aiUsage');
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const q = query(
      usageRef,
      where('userId', '==', userId),
      where('timestamp', '>=', Timestamp.fromDate(oneHourAgo)),
      where('endpoint', '==', 'reflect')
    );

    const snapshot = await getDocs(q);
    const usageCount = snapshot.size;

    // Limit to 10 requests per hour
    return usageCount < 10;
  } catch (error) {
    console.error('Error checking rate limit:', error);
    return true; // Allow on error
  }
}

/**
 * Log AI usage for rate limiting
 */
async function logUsage(userId: string, sessionId: string, success: boolean, hadCrisis: boolean) {
  try {
    const usageRef = collection(db, 'aiUsage');
    await addDoc(usageRef, {
      userId,
      sessionId,
      endpoint: 'reflect',
      success,
      hadCrisis,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error logging AI usage:', error);
  }
}

// Output schema for AI response
const ReflectionSchema = z.object({
  synthesis: z.string(),
  reflections: z.array(z.string()),
  experiments: z.array(z.string()),
});

/**
 * POST /api/ai/reflect
 * Generate trauma-informed reflections and experiments
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, patterns, sessionId } = body;

    // Note: We use sessionId for rate limiting but don't store message content
    const userId = sessionId || 'anonymous';

    // Validation
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Check rate limit
    const canProceed = await checkRateLimit(userId);
    if (!canProceed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    // Crisis detection
    const allText = messages.map((m: any) => m.message).join(' ');
    if (detectCrisis(allText)) {
      await logUsage(userId, sessionId, true, true);
      return NextResponse.json({
        crisis: true,
        crisisMessage:
          'If you are in immediate danger, contact local emergency services or call 988 (Suicide & Crisis Lifeline).',
      });
    }

    // Build prompt for AI
    const prompt = `You are a compassionate, trauma-informed mental health support AI. A user has completed a life messages exercise where they identified negative self-talk, mapped it to core beliefs, and recognized behavioral patterns.

**User Session:**

Messages:
${messages.map((m: any, i: number) => `${i + 1}. "${m.message}" (Mood: ${m.moodTag}, Belief: ${m.belief || 'Not specified'})`).join('\n')}

Patterns:
${patterns && patterns.length > 0 ? patterns.join(', ') : 'None specified'}

**Your Task:**

Provide:
1. A one-paragraph synthesis (2-3 sentences) of the theme connecting these messages to the core belief(s).
2. Three gentle, validating reflections that help the user understand their experience.
3. Three small, concrete experiments (one-week, low-risk) they can try to test or challenge their belief.

**Guidelines:**
- Use a non-judgmental, trauma-informed, supportive tone
- Focus on self-compassion and growth, not fixing or diagnosing
- Make experiments specific, achievable, and low-pressure
- Avoid clinical terminology or diagnosis
- Be validating and clarifying

**Important:** Do NOT include any crisis language or suggestions related to self-harm or suicide. If you detect concerning content, return {"crisis": true} instead.

Generate your response now as a JSON object with keys: synthesis, reflections (array of 3 strings), experiments (array of 3 strings).`;

    // Generate AI response
    const result = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      prompt,
      output: { schema: ReflectionSchema },
    });

    // Log successful usage (without storing content)
    await logUsage(userId, sessionId, true, false);

    return NextResponse.json(result.output);
  } catch (error: any) {
    console.error('Error generating AI reflections:', error);

    // Log failed usage
    try {
      const { sessionId } = await request.json();
      await logUsage(sessionId || 'anonymous', sessionId, false, false);
    } catch {
      // Ignore logging errors
    }

    return NextResponse.json(
      { error: 'Failed to generate reflections', details: error.message },
      { status: 500 }
    );
  }
}
