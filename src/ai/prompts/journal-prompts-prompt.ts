/**
 * Journal Prompts Generation Prompt
 * Creates thoughtful journal prompts based on user's recent emotional state
 */

import type { LogEntry } from '@/lib/types';

export interface JournalPromptsInput {
  currentEmotion?: string;
  recentEntries?: LogEntry[];
  context?: 'check-in' | 'reflection' | 'growth';
}

export function buildJournalPromptsPrompt(input: JournalPromptsInput): string {
  const { currentEmotion, recentEntries, context = 'check-in' } = input;

  const hasRecent = recentEntries && recentEntries.length > 0;
  const recentContext = hasRecent
    ? `\n**Recent Check-ins:**
- Recent emotions: ${recentEntries!.slice(0, 5).map(e => e.emotion).join(', ')}
- Recent triggers: ${recentEntries!.flatMap(e => e.contextTags?.triggers || []).slice(0, 5).join(', ') || 'none'}`
    : '';

  const contextGuide = {
    'check-in': 'Prompts should help the user explore their current feelings and immediate context',
    'reflection': 'Prompts should encourage deeper reflection on patterns and growth',
    'growth': 'Prompts should focus on learning, resilience, and forward movement',
  };

  return `You are a thoughtful wellness coach creating journal prompts.

**Context:**
- Prompt type: ${context}
- Current emotion: ${currentEmotion || 'Not specified'}
${recentContext}

**Your Task:**
Generate 5-7 journal prompts that are:
1. **Relevant**: Connect to the user's current emotional state and recent patterns
2. **Open-ended**: Invite exploration, not yes/no answers
3. **Compassionate**: Create safe space for honest reflection
4. **Varied**: Mix immediate feelings, deeper patterns, and forward-looking questions
5. **Appropriate to context**: ${contextGuide[context]}

**Response Format:**
Return a JSON object:
{
  "prompts": [
    {
      "prompt": "The journal prompt question",
      "category": "feelings" | "thoughts" | "patterns" | "growth" | "gratitude" | "coping",
      "depth": "surface" | "moderate" | "deep",
      "why": "Why this prompt might be helpful (1 sentence)"
    }
  ],
  "recommendedPrompt": "The index (0-based) of the most relevant prompt for right now"
}

**Guidelines:**
- Start with 1-2 surface-level prompts (accessible, immediate)
- Include 2-3 moderate depth prompts (exploring connections)
- Include 1-2 deep prompts (for when ready to dig deeper)
- At least one prompt should be growth-oriented
- Avoid prompts that might feel invalidating or dismissive
- Make prompts specific enough to be helpful, open enough to be personal
- Use inclusive, trauma-informed language

**Example Prompts by Depth:**
- Surface: "What does this feeling feel like in your body right now?"
- Moderate: "What might have contributed to feeling this way today?"
- Deep: "How does this pattern connect to your values and what matters most to you?"

Generate the journal prompts now:`;
}
