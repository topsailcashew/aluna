
'use server';

/**
 * @fileOverview AI flow for generating wellness insights from log entries.
 *
 * - generateInsights - A Server Action to generate personalized insights.
 * - InsightsInput - The input type for the generateInsights function.
 * - InsightsOutput - The return type for the generateInsights function.
 */

import { ai } from '../genkit';
import { buildInsightsPrompt } from '../prompts/insights-prompt';
import { z } from 'zod';

// Input schema for insights
const InsightsInputSchema = z.object({
  entries: z.array(z.any()), // LogEntry array
  daysAnalyzed: z.number().default(7),
  userName: z.string().optional(),
});
export type InsightsInput = z.infer<typeof InsightsInputSchema>;

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
 * Server Action to generate personalized insights from log entries.
 * This function can be called directly from client components.
 */
export async function generateInsights(input: InsightsInput): Promise<InsightsOutput> {
  return generateInsightsFlow(input);
}


/**
 * Genkit flow to generate personalized insights from log entries
 */
const generateInsightsFlow = ai.defineFlow(
  {
    name: 'generateInsightsFlow',
    inputSchema: InsightsInputSchema,
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
