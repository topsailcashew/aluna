/**
 * Pattern Recognition Prompt
 * Identifies recurring patterns in emotional wellness data
 */

import type { LogEntry } from '@/lib/types';

export interface PatternsInput {
  entries: LogEntry[];
  daysAnalyzed: number;
}

export function buildPatternsPrompt(input: PatternsInput): string {
  const { entries, daysAnalyzed } = input;

  // Prepare entry summaries with more detail for pattern analysis
  const entrySummaries = entries.map((entry) => {
    const dateStr = typeof entry.date === 'string'
      ? entry.date
      : entry.date.toDate?.()
      ? entry.date.toDate().toISOString()
      : new Date().toISOString();

    const date = new Date(dateStr);
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    const hour = date.getHours();
    const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

    return {
      date: dateStr,
      dayOfWeek,
      timeOfDay,
      emotion: entry.emotion,
      specificEmotions: entry.specificEmotions || [],
      avgIntensity: entry.sensations.length > 0
        ? entry.sensations.reduce((sum, s) => sum + s.intensity, 0) / entry.sensations.length
        : 0,
      location: entry.contextTags?.location,
      activities: entry.contextTags?.activity || [],
      triggers: entry.contextTags?.triggers || [],
      people: entry.contextTags?.people,
    };
  });

  return `You are a data analyst specializing in emotional wellness patterns.

**Dataset:**
- Analysis period: ${daysAnalyzed} days
- Total check-ins: ${entries.length}
- Check-in data:
${JSON.stringify(entrySummaries, null, 2)}

**Your Task:**
Analyze this data to identify meaningful patterns. Look for:

1. **Temporal Patterns**:
   - Day of week patterns (e.g., "Anxiety tends to peak on Mondays")
   - Time of day patterns (e.g., "Mood dips in the evening")
   - Frequency patterns (e.g., "Check-ins cluster on weekends")

2. **Emotional Patterns**:
   - Recurring emotions
   - Emotion sequences (e.g., "Anxiety often follows stress")
   - Emotion-intensity correlations

3. **Contextual Patterns**:
   - Location-emotion correlations (e.g., "Feel calm at home")
   - Activity-emotion correlations (e.g., "Energized after exercise")
   - Trigger patterns (what triggers what emotions)
   - Social patterns (emotions with certain people)

4. **Trend Patterns**:
   - Improving trends
   - Declining trends
   - Stable patterns

**Response Format:**
Return a JSON object:
{
  "patterns": [
    {
      "type": "temporal" | "emotional" | "contextual" | "trend",
      "title": "Pattern name (5-8 words)",
      "description": "What the pattern shows (2-3 sentences)",
      "confidence": "high" | "medium" | "low",
      "frequency": "How often this pattern occurs",
      "insight": "What this might mean (1-2 sentences)",
      "dataPoints": ["Specific examples from the data"]
    }
  ],
  "keyTakeaway": "Most important pattern (1-2 sentences)"
}

**Guidelines:**
- Only report patterns with at least 2-3 supporting data points
- Be specific and cite actual data
- Use "high" confidence only when pattern is very clear (70%+ of data)
- Don't make up patterns - if data is insufficient, say so
- Prioritize actionable patterns over obvious ones
- For small datasets (< 5 entries), acknowledge limitations
- Avoid over-interpretation

Identify the patterns now:`;
}
