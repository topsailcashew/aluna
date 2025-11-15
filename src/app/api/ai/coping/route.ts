import { NextRequest, NextResponse } from 'next/server';
import { runFlow } from 'genkit';
import { suggestCopingFlow } from '@/ai/flows';

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

    // Call the Genkit flow using runFlow
    const result = await runFlow(suggestCopingFlow, {
      currentEmotion,
      specificEmotions,
      intensity,
      contextTags,
      recentEntries,
    });

    return NextResponse.json(result);
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
