import { NextRequest, NextResponse } from 'next/server';
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { withAuth } from '@/lib/auth-middleware';

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
export const POST = withAuth(
  async (request: NextRequest, { userId }) => {
    try {
      const body = await request.json();
      const { messages, patterns, sessionId } = body;

      // Validation
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return NextResponse.json(
          { error: 'Messages array is required' },
          { status: 400 }
        );
      }

      // Crisis detection
      const allText = messages.map((m: any) => m.message).join(' ');
      if (detectCrisis(allText)) {
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
        prompt,
        output: { schema: ReflectionSchema },
      });

      return NextResponse.json(result.output);
    } catch (error: any) {
      console.error('Error generating AI reflections:', error);

      return NextResponse.json(
        { error: 'Failed to generate reflections', details: error.message },
        { status: 500 }
      );
    }
  },
  { rateLimit: 'ai-reflect' }
);
