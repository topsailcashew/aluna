import { NextRequest, NextResponse } from 'next/server';
import { runFlow } from 'genkit';
import { recognizePatternsFlow } from '@/ai/flows';

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

    // Call the Genkit flow using runFlow
    const result = await runFlow(recognizePatternsFlow, {
      entries,
      daysAnalyzed: daysAnalyzed || 30,
    });

    return NextResponse.json(result);
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
