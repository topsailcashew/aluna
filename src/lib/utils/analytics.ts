
/**
 * Analytics Utility Functions
 * Data aggregation, transformation, and statistical calculations for dashboard
 */

import { format, parseISO } from 'date-fns';
import type { LogEntry, ChartDataPoint, EmotionFrequency } from '../types';
import { filterByDateRange, groupByDay } from './date-helpers';
import { emotionCategories } from '../data';

/**
 * Get emotion frequency from log entries
 */
export function getEmotionFrequency(entries: LogEntry[]): EmotionFrequency[] {
  const counts = new Map<string, number>();
  const total = entries.length;

  for (const entry of entries) {
    const l1Emotion = emotionCategories.find(cat => cat.subCategories.some(sub => sub.name === entry.emotion))?.name || 'Unknown';
    counts.set(l1Emotion, (counts.get(l1Emotion) || 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([emotion, count]) => ({
      emotion,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Get dominant (most frequent) emotion
 */
export function getDominantEmotion(entries: LogEntry[]): string | null {
  const frequencies = getEmotionFrequency(entries);
  return frequencies.length > 0 ? frequencies[0].emotion : null;
}

/**
 * Get emotion distribution for pie/donut chart
 */
export function getEmotionDistribution(entries: LogEntry[]): ChartDataPoint[] {
  const frequencies = getEmotionFrequency(entries);

  return frequencies.map((freq) => ({
    date: freq.emotion,
    value: freq.count,
    label: freq.emotion,
    emotion: freq.emotion,
  }));
}

/**
 * Get monthly comparison data
 */
export function getMonthlyComparison(
  entries: LogEntry[],
  currentMonthStart: Date,
  currentMonthEnd: Date,
  previousMonthStart: Date,
  previousMonthEnd: Date
): {
  current: { emotions: EmotionFrequency[]; count: number };
  previous: { emotions: EmotionFrequency[]; count: number };
} {
  const getDate = (entry: LogEntry) =>
    entry.date instanceof Date ? entry.date : parseISO(entry.date as any);

  const currentEntries = filterByDateRange(entries, getDate, currentMonthStart, currentMonthEnd);
  const previousEntries = filterByDateRange(entries, getDate, previousMonthStart, previousMonthEnd);

  return {
    current: {
      emotions: getEmotionFrequency(currentEntries),
      count: currentEntries.length,
    },
    previous: {
      emotions: getEmotionFrequency(previousEntries),
      count: previousEntries.length,
    },
  };
}

/**
 * Get top sensations by frequency
 */
export function getTopSensations(
  entries: LogEntry[],
  limit: number = 5
): Array<{ location: string; count: number; avgIntensity: number }> {
  const sensationMap = new Map<
    string,
    { count: number; totalIntensity: number }
  >();

  for (const entry of entries) {
    for (const sensation of entry.sensations) {
      const existing = sensationMap.get(sensation.location) || {
        count: 0,
        totalIntensity: 0,
      };
      sensationMap.set(sensation.location, {
        count: existing.count + 1,
        totalIntensity: existing.totalIntensity + sensation.intensity,
      });
    }
  }

  return Array.from(sensationMap.entries())
    .map(([location, data]) => ({
      location,
      count: data.count,
      avgIntensity: Math.round((data.totalIntensity / data.count) * 10) / 10,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Get thought pattern frequency
 */
export function getThoughtPatternFrequency(
  entries: LogEntry[]
): Array<{ pattern: string; count: number; percentage: number }> {
  const counts = new Map<string, number>();
  const total = entries.length;

  for (const entry of entries) {
    for (const thought of entry.thoughts || []) {
      counts.set(thought, (counts.get(thought) || 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .map(([pattern, count]) => ({
      pattern,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);
}
