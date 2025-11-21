/**
 * Suggest Coping Flow
 * Generates personalized coping strategies based on current emotional state
 */

import { ai } from '../genkit';
import { buildCopingPrompt, type CopingInput } from '../prompts/coping-prompt';
import { z } from 'zod';

// Output schema for coping strategies
const CopingStrategySchema = z.object({
  category: z.enum(['immediate', 'grounding', 'physical', 'cognitive', 'social', 'creative']),
  title: z.string(),
  description: z.string(),
  duration: z.string(),
  intensity: z.enum(['low', 'medium', 'high']),
  bestFor: z.string(),
});

const CopingOutputSchema = z.object({
  strategies: z.array(CopingStrategySchema),
  priorityTip: z.string(),
});

export type CopingStrategy = z.infer<typeof CopingStrategySchema>;
export type CopingOutput = z.infer<typeof CopingOutputSchema>;

/**
 * Generate personalized coping strategies
 */
export const suggestCopingFlow = ai.defineFlow(
  {
    name: 'suggestCoping',
    inputSchema: z.object({
      currentEmotion: z.string(),
      specificEmotions: z.array(z.string()),
      intensity: z.number().min(1).max(10),
      contextTags: z.object({
        location: z.string().optional(),
        activity: z.array(z.string()).optional(),
        triggers: z.array(z.string()).optional(),
        people: z.string().optional(),
      }).optional(),
      recentEntries: z.array(z.any()).optional(),
    }),
    outputSchema: CopingOutputSchema,
  },
  async (input) => {
    // Build the prompt
    const prompt = buildCopingPrompt(input);

    // Call the LLM
    const result = await ai.generate({
      prompt,
      output: {
        schema: CopingOutputSchema,
      },
    });

    // Return parsed output
    return result.output!;
  }
);
