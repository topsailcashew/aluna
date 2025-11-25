'use server';

import { recognizePatternsFlow, type PatternsOutput } from '@/ai/flows/recognize-patterns';
import type { LogEntry } from '@/lib/types';

export async function recognizePatterns(data: {
  entries: LogEntry[];
  daysAnalyzed: number;
}): Promise<PatternsOutput> {
  try {
    const result = await recognizePatternsFlow(data);
    return result;
  } catch (error) {
    console.error('Error recognizing patterns:', error);
    throw error;
  }
}
