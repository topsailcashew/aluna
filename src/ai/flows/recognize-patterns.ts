/**
 * Recognize Patterns Flow
 * Identifies recurring patterns in wellness log entries
 */

import { ai } from '../genkit';
import { buildPatternsPrompt, type PatternsInput } from '../prompts/patterns-prompt';
import { z } from 'zod';

// Output schema for patterns
const PatternSchema = z.object({
  type: z.enum(['temporal', 'emotional', 'contextual', 'trend']),
  title: z.string(),
  description: z.string(),
  confidence: z.enum(['high', 'medium', 'low']),
  frequency: z.string(),
  insight: z.string(),
  dataPoints: z.array(z.string()),
});

const PatternsOutputSchema = z.object({
  patterns: z.array(PatternSchema),
  keyTakeaway: z.string(),
});

export type Pattern = z.infer<typeof PatternSchema>;
export type PatternsOutput = z.infer<typeof PatternsOutputSchema>;

/**
 * Recognize patterns in log entries
 */
export const recognizePatternsFlow = ai.defineFlow(
  {
    name: 'recognizePatterns',
    inputSchema: z.object({
      entries: z.array(z.any()), // LogEntry array
      daysAnalyzed: z.number().default(30),
    }),
    outputSchema: PatternsOutputSchema,
  },
  async (input) => {
    // Build the prompt
    const prompt = buildPatternsPrompt({
      entries: input.entries,
      daysAnalyzed: input.daysAnalyzed,
    });

    // Call the LLM
    const result = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      prompt,
      output: {
        schema: PatternsOutputSchema,
      },
    });

    // Return parsed output
    return result.output!;
  }
);
