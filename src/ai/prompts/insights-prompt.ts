/**
 * Insights Generation Prompt
 * Analyzes user's wellness log entries to generate personalized insights
 */

import type { LogEntry } from '@/lib/types';

export interface InsightsInput {
  entries: LogEntry[];
  daysAnalyzed: number;
  userName?: string;
}

export function buildInsightsPrompt(input: InsightsInput): string {
  const { entries, daysAnalyzed, userName } = input;

  // Prepare entry summaries
  const entrySummaries = entries.map((entry) => {
    const dateStr = typeof entry.date === 'string'
      ? entry.date
      : entry.date.toDate?.()
      ? entry.date.toDate().toISOString()
      : new Date().toISOString();

    return {
      date: dateStr,
      emotion: entry.emotion,
      specificEmotions: entry.specificEmotions || [],
      sensations: entry.sensations.map(s => ({
        bodyPart: s.bodyPart,
        intensity: s.intensity
      })),
      contextTags: entry.contextTags,
      hasJournal: !!entry.journalEntry,
    };
  });

  return `You are an empathetic wellness coach analyzing a user's emotional wellness data.

**User Context:**
${userName ? `- Name: ${userName}` : '- Anonymous user'}
- Analysis period: Last ${daysAnalyzed} days
- Total check-ins: ${entries.length}

**Check-in Data:**
${JSON.stringify(entrySummaries, null, 2)}

**Your Task:**
Analyze this data and provide 3-5 personalized insights that are:
1. **Compassionate & Non-judgmental**: Use warm, supportive language
2. **Specific & Actionable**: Reference actual patterns in their data
3. **Balanced**: Highlight both strengths and growth areas
4. **Evidence-based**: Point to specific patterns you observe

**Response Format:**
Return a JSON object with this structure:
{
  "insights": [
    {
      "type": "positive" | "neutral" | "concern",
      "title": "Brief insight title (5-8 words)",
      "description": "Detailed explanation (2-3 sentences)",
      "evidence": "Specific data points supporting this insight",
      "suggestion": "Optional actionable suggestion"
    }
  ],
  "summary": "One-sentence overall wellness summary"
}

**Guidelines:**
- If fewer than 3 check-ins: Focus on encouraging consistency
- Identify emotion patterns (recurring emotions, triggers, contexts)
- Notice body sensation patterns (which body parts, intensity trends)
- Recognize helpful contexts (locations/activities with positive emotions)
- Avoid clinical diagnosis or medical advice
- Be encouraging about progress, gentle about challenges
- If you notice concerning patterns (very high intensity, repeated negative emotions), use type "concern" and suggest professional support

Generate the insights now:`;
}
