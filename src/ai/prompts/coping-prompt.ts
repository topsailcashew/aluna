/**
 * Coping Suggestions Prompt
 * Generates personalized coping strategies based on current emotional state
 */

import type { LogEntry } from '@/lib/types';

export interface CopingInput {
  currentEmotion: string;
  specificEmotions: string[];
  intensity: number; // 1-10
  contextTags?: {
    location?: string;
    activity?: string[];
    triggers?: string[];
    people?: string;
  };
  recentEntries?: LogEntry[]; // For personalization
}

export function buildCopingPrompt(input: CopingInput): string {
  const { currentEmotion, specificEmotions, intensity, contextTags, recentEntries } = input;

  const hasHistory = recentEntries && recentEntries.length > 0;
  const historyContext = hasHistory
    ? `\n**User's Recent History (for personalization):**
- Recent check-ins: ${recentEntries!.length}
- Recent emotions: ${recentEntries!.map(e => e.emotion).join(', ')}
- Recent contexts: ${recentEntries!.map(e => e.contextTags?.location || 'unknown').join(', ')}`
    : '';

  return `You are a compassionate wellness coach providing coping strategies.

**Current Emotional State:**
- Primary emotion: ${currentEmotion}
- Specific feelings: ${specificEmotions.join(', ')}
- Intensity: ${intensity}/10
${contextTags?.location ? `- Location: ${contextTags.location}` : ''}
${contextTags?.activity && contextTags.activity.length > 0 ? `- Activities: ${contextTags.activity.join(', ')}` : ''}
${contextTags?.triggers && contextTags.triggers.length > 0 ? `- Triggers: ${contextTags.triggers.join(', ')}` : ''}
${contextTags?.people ? `- With: ${contextTags.people}` : ''}
${historyContext}

**Your Task:**
Provide 4-6 practical coping strategies tailored to this specific situation. Consider:
1. The intensity level (high intensity needs immediate calming, low intensity can use reflective practices)
2. The context (location-appropriate suggestions)
3. The emotion type (different strategies for anxiety vs sadness vs anger)
4. What might have worked before (if history available)

**Response Format:**
Return a JSON object:
{
  "strategies": [
    {
      "category": "immediate" | "grounding" | "physical" | "cognitive" | "social" | "creative",
      "title": "Strategy name (3-5 words)",
      "description": "How to do it (2-3 sentences)",
      "duration": "Estimated time (e.g., '2-5 minutes', '10-15 minutes')",
      "intensity": "low" | "medium" | "high" (effort required),
      "bestFor": "When this works best (1 sentence)"
    }
  ],
  "priorityTip": "Most important immediate action based on current state"
}

**Guidelines:**
- Start with immediate/grounding techniques for high intensity (7+)
- Include at least one quick technique (under 5 minutes)
- Make suggestions context-appropriate (e.g., don't suggest loud music if at work)
- Use clear, actionable language
- Avoid suggesting harmful coping mechanisms
- For very high intensity or concerning patterns, include suggestion to reach out for support
- Be specific and practical, not generic

Generate the coping strategies now:`;
}
