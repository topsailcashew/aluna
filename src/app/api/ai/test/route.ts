import { NextRequest, NextResponse } from 'next/server';
import { ai } from '@/ai/genkit';

/**
 * Test endpoint to verify Google AI API is working
 * GET /api/ai/test
 */
export async function GET(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!process.env.GOOGLE_GENAI_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: 'GOOGLE_GENAI_API_KEY is not configured',
          message: 'Please add your Google AI API key to .env.local',
        },
        { status: 500 }
      );
    }

    // Simple test prompt
    const testPrompt = 'Say "Hello! The AI connection is working!" in a friendly way.';

    // Call the AI
    const result = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: testPrompt,
    });

    return NextResponse.json({
      success: true,
      message: 'Google AI API is working correctly!',
      apiKeyConfigured: true,
      model: 'gemini-2.0-flash-exp',
      testResponse: result.text,
    });
  } catch (error: any) {
    console.error('Error testing AI API:', error);

    // Detailed error handling
    let errorMessage = 'Failed to connect to Google AI API';
    let errorDetails = error.message || 'Unknown error';

    if (error.message?.includes('API key')) {
      errorMessage = 'Invalid API key';
      errorDetails = 'Please check your GOOGLE_GENAI_API_KEY in .env.local';
    } else if (error.message?.includes('quota')) {
      errorMessage = 'API quota exceeded';
      errorDetails = 'You may have exceeded your Google AI API quota';
    } else if (error.message?.includes('permission')) {
      errorMessage = 'Permission denied';
      errorDetails = 'Please ensure your API key has the necessary permissions';
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: errorDetails,
        apiKeyConfigured: !!process.env.GOOGLE_GENAI_API_KEY,
      },
      { status: 500 }
    );
  }
}
