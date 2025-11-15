import { NextRequest, NextResponse } from 'next/server';
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

    // Call the Genkit flow
    const result = await generateInsightsFlow({
      entries,
      daysAnalyzed: daysAnalyzed || 7,
      userName,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating insights:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}
