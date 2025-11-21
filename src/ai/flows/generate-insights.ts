/**
 * Generate Insights Flow
 * Analyzes wellness log entries and generates personalized insights
 */

import { ai } from '../genkit';
import { buildInsightsPrompt, type InsightsInput } from '../prompts/insights-prompt';
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

export type Insight = z.infer<typeof InsightSchema>;
export type InsightsOutput = z.infer<typeof InsightsOutputSchema>;

/**
 * Generate personalized insights from log entries
 */
export const generateInsightsFlow = ai.defineFlow(
  {
    name: 'generateInsights',
    inputSchema: z.object({
      entries: z.array(z.any()), // LogEntry array
      daysAnalyzed: z.number().default(7),
      userName: z.string().optional(),
    }),
    outputSchema: InsightsOutputSchema,
  },
  async (input) => {
    // Build the prompt
    const prompt = buildInsightsPrompt({
      entries: input.entries,
      daysAnalyzed: input.daysAnalyzed,
      userName: input.userName,
    });

    // Call the LLM
    const result = await ai.generate({
      prompt,
      output: {
        schema: InsightsOutputSchema,
      },
    });

    // Return parsed output
    return result.output!;
  }
);
