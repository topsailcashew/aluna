import { NextRequest, NextResponse } from 'next/server';
import { ai } from '@/ai/genkit';
import { buildCopingPrompt } from '@/ai/prompts/coping-prompt';
import { z } from 'zod';

// Output schema for coping strategies
const CopingStrategySchema = z.object({
  category: z.enum(['immediate', 'grounding', 'physical', 'cognitive', 'social', 'creative']),
  title: z.string(),
  description: z.string(),
  duration: z.string(),
  intensity: z.enum(['low', 'medium', 'high']),
  bestFor: z.string(),
});

const CopingOutputSchema = z.object({
  strategies: z.array(CopingStrategySchema),
  priorityTip: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      currentEmotion,
      specificEmotions,
      intensity,
      contextTags,
      recentEntries,
    } = body;

    if (!currentEmotion || !specificEmotions || intensity === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Build prompt and call AI directly
    const prompt = buildCopingPrompt({
      currentEmotion,
      specificEmotions,
      intensity,
      contextTags,
      recentEntries,
    });

    const result = await ai.generate({
      prompt,
      output: {
        schema: CopingOutputSchema,
      },
    });

    return NextResponse.json(result.output);
  } catch (error: any) {
    console.error('Error generating coping suggestions:', error);
    console.error('Error details:', error.message, error.stack);
    return NextResponse.json(
      {
        error: 'Failed to generate coping suggestions',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}
