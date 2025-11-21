import { NextRequest, NextResponse } from 'next/server';
import { ai } from '@/ai/genkit';
import { buildInsightsPrompt } from '@/ai/prompts/insights-prompt';
import { z } from 'zod';

// Output schema for insights
const InsightSchema = z.object({
  type: z.enum(['positive', 'neutral', 'concern']),
  title: z.string(),
  description: z.string(),
  evidence: z.string(),
  suggestion: z.string().optional(),
});

const InsightsOutputSchema = z.object({
  insights: z.array(InsightSchema),
  summary: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { entries, daysAnalyzed, userName } = body;

    if (!entries || entries.length === 0) {
      return NextResponse.json(
        { error: 'No entries provided' },
        { status: 400 }
      );
    }

    // Build prompt and call AI directly
    const prompt = buildInsightsPrompt({
      entries,
      daysAnalyzed: daysAnalyzed || 7,
      userName,
    });

    const result = await ai.generate({
      prompt,
      output: {
        schema: InsightsOutputSchema,
      },
    });

    return NextResponse.json(result.output);
  } catch (error: any) {
    console.error('Error generating insights:', error);
    console.error('Error details:', error.message, error.stack);
    return NextResponse.json(
      {
        error: 'Failed to generate insights',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}
