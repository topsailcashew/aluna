'use server';

import { generateInsights as generateInsightsFlow, type InsightsOutput } from '@/ai/flows/generate-insights';
import type { LogEntry } from '@/lib/types';

export async function generateInsights(data: {
  entries: LogEntry[];
  daysAnalyzed: number;
}): Promise<InsightsOutput> {
  try {
    const result = await generateInsightsFlow(data);
    return result;
  } catch (error) {
    console.error('Error generating insights:', error);
    throw error;
  }
}
