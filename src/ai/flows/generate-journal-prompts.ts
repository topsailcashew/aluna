/**
 * Generate Journal Prompts Flow
 * Creates thoughtful journal prompts based on emotional state
 */

import { ai } from '../genkit';
import { buildJournalPromptsPrompt, type JournalPromptsInput } from '../prompts/journal-prompts-prompt';
import { z } from 'zod';

// Output schema for journal prompts
const JournalPromptSchema = z.object({
  prompt: z.string(),
  category: z.enum(['feelings', 'thoughts', 'patterns', 'growth', 'gratitude', 'coping']),
  depth: z.enum(['surface', 'moderate', 'deep']),
  why: z.string(),
});

const JournalPromptsOutputSchema = z.object({
  prompts: z.array(JournalPromptSchema),
  recommendedPrompt: z.number(),
});

export type JournalPrompt = z.infer<typeof JournalPromptSchema>;
export type JournalPromptsOutput = z.infer<typeof JournalPromptsOutputSchema>;

/**
 * Generate personalized journal prompts
 */
export const generateJournalPromptsFlow = ai.defineFlow(
  {
    name: 'generateJournalPrompts',
    inputSchema: z.object({
      currentEmotion: z.string().optional(),
      recentEntries: z.array(z.any()).optional(),
      context: z.enum(['check-in', 'reflection', 'growth']).default('check-in'),
    }),
    outputSchema: JournalPromptsOutputSchema,
  },
  async (input) => {
    // Build the prompt
    const prompt = buildJournalPromptsPrompt(input);

    // Call the LLM
    const result = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      prompt,
      output: {
        schema: JournalPromptsOutputSchema,
      },
    });

    // Return parsed output
    return result.output!;
  }
);
