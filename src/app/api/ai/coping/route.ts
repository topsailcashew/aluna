import { NextRequest, NextResponse } from 'next/server';
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

    // Call the Genkit flow
    const result = await suggestCopingFlow({
      currentEmotion,
      specificEmotions,
      intensity,
      contextTags,
      recentEntries,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating coping suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to generate coping suggestions' },
      { status: 500 }
    );
  }
}
