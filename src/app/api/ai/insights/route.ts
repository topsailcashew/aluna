import { NextRequest, NextResponse } from 'next/server';
import { runFlow } from 'genkit';
import { generateInsightsFlow } from '@/ai/flows';

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

    // Call the Genkit flow using runFlow
    const result = await runFlow(generateInsightsFlow, {
      entries,
      daysAnalyzed: daysAnalyzed || 7,
      userName,
    });

    return NextResponse.json(result);
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
