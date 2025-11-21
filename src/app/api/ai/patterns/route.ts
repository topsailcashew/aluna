import { NextRequest, NextResponse } from 'next/server';
import { ai } from '@/ai/genkit';
import { buildPatternsPrompt } from '@/ai/prompts/patterns-prompt';
import { z } from 'zod';

// Output schema for patterns
const PatternSchema = z.object({
  type: z.enum(['temporal', 'emotional', 'contextual', 'trend']),
  title: z.string(),
  description: z.string(),
  confidence: z.enum(['high', 'medium', 'low']),
  frequency: z.string(),
  insight: z.string(),
  dataPoints: z.array(z.string()),
});

const PatternsOutputSchema = z.object({
  patterns: z.array(PatternSchema),
  keyTakeaway: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { entries, daysAnalyzed } = body;

    if (!entries || entries.length < 3) {
      return NextResponse.json(
        { error: 'Need at least 3 entries to identify patterns' },
        { status: 400 }
      );
    }

    // Build prompt and call AI directly
    const prompt = buildPatternsPrompt({
      entries,
      daysAnalyzed: daysAnalyzed || 30,
    });

    const result = await ai.generate({
      prompt,
      output: {
        schema: PatternsOutputSchema,
      },
    });

    return NextResponse.json(result.output);
  } catch (error: any) {
    console.error('Error recognizing patterns:', error);
    console.error('Error details:', error.message, error.stack);
    return NextResponse.json(
      {
        error: 'Failed to recognize patterns',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}
