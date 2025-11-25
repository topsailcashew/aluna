import { NextRequest, NextResponse } from 'next/server';
import { generateInsights, type InsightsInput } from '@/ai/flows/generate-insights';
import { withAuth } from '@/lib/auth-middleware';

export const POST = withAuth(
  async (request: NextRequest) => {
    try {
      const body: InsightsInput = await request.json();

      if (!body.entries || body.entries.length === 0) {
        return NextResponse.json(
          { error: 'No entries provided' },
          { status: 400 }
        );
      }

      const insights = await generateInsights(body);
      return NextResponse.json(insights);

    } catch (error: any) {
      console.error('Error in insights API route:', error);
      return NextResponse.json(
        {
          error: 'Failed to generate insights',
          details: error.message || 'Unknown error'
        },
        { status: 500 }
      );
    }
  },
  { rateLimit: 'ai-insights' }
);
