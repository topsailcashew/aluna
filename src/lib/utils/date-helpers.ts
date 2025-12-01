/**
 * Date Helper Functions for Analytics
 * Provides utilities for date calculations, formatting, and time-based analysis
 */

import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isYesterday, differenceInDays, differenceInHours, differenceInMinutes, startOfMonth, endOfMonth, subDays, subMonths, isSameDay, parseISO, startOfDay, endOfDay } from 'date-fns';
import { Timestamp } from 'firebase/firestore';

/**
 * Helper to convert various date types to Date object
 */
function toDate(date: Date | string | Timestamp): Date {
  if (date instanceof Date) return date;
  if (typeof date === 'string') return parseISO(date);
  if (date && typeof date === 'object' && 'toDate' in date) return date.toDate();
  return new Date(date);
}

/**
 * Format a date for display
 */
export function formatDate(date: Date | string | Timestamp, formatStr: string = 'MMM d, yyyy'): string {
  const dateObj = toDate(date);
  return format(dateObj, formatStr);
}

/**
 * Get relative time string (e.g., "2 hours ago", "yesterday")
 */
export function getRelativeTime(date: Date | string | Timestamp): string {
  const dateObj = toDate(date);
  const now = new Date();

  if (isToday(dateObj)) {
    const hours = differenceInHours(now, dateObj);
    if (hours < 1) {
      const minutes = differenceInMinutes(now, dateObj);
      if (minutes < 1) return 'just now';
      return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    }
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  }

  if (isYesterday(dateObj)) {
    return 'yesterday';
  }

  const days = differenceInDays(now, dateObj);
  if (days < 7) {
    return `${days} day${days === 1 ? '' : 's'} ago`;
  }

  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
  }

  if (days < 365) {
    const months = Math.floor(days / 30);
    return `${months} month${months === 1 ? '' : 's'} ago`;
  }

  const years = Math.floor(days / 365);
  return `${years} year${years === 1 ? '' : 's'} ago`;
}

/**
 * Get the current week's date range
 */
export function getCurrentWeek(): { start: Date; end: Date } {
  const now = new Date();
  return {
    start: startOfWeek(now, { weekStartsOn: 0 }), // Sunday
    end: endOfWeek(now, { weekStartsOn: 0 }),
  };
}

/**
 * Get the current month's date range
 */
export function getCurrentMonth(): { start: Date; end: Date } {
  const now = new Date();
  return {
    start: startOfMonth(now),
    end: endOfMonth(now),
  };
}

/**
 * Get date range for the last N days
 */
export function getLastNDays(n: number): { start: Date; end: Date } {
  const now = new Date();
  return {
    start: startOfDay(subDays(now, n - 1)),
    end: endOfDay(now),
  };
}

/**
 * Get date range for the previous month
 */
export function getPreviousMonth(): { start: Date; end: Date } {
  const now = new Date();
  const prevMonth = subMonths(now, 1);
  return {
    start: startOfMonth(prevMonth),
    end: endOfMonth(prevMonth),
  };
}

/**
 * Get all days in a date range
 */
export function getDaysInRange(start: Date, end: Date): Date[] {
  return eachDayOfInterval({ start, end });
}

/**
 * Get all days in the current week
 */
export function getDaysInCurrentWeek(): Date[] {
  const { start, end } = getCurrentWeek();
  return getDaysInRange(start, end);
}

/**
 * Get all days in the last N days
 */
export function getDaysInLastN(n: number): Date[] {
  const { start, end } = getLastNDays(n);
  return getDaysInRange(start, end);
}

/**
 * Group dates by day, returning a map of date strings to counts
 */
export function groupByDay<T>(
  items: T[],
  getDate: (item: T) => Date | string
): Map<string, T[]> {
  const grouped = new Map<string, T[]>();

  for (const item of items) {
    const date = getDate(item);
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const dayKey = format(startOfDay(dateObj), 'yyyy-MM-dd');

    if (!grouped.has(dayKey)) {
      grouped.set(dayKey, []);
    }
    grouped.get(dayKey)!.push(item);
  }

  return grouped;
}

/**
 * Get time of day from a date (morning, afternoon, evening, night)
 */
export function getTimeOfDay(date: Date | string): 'morning' | 'afternoon' | 'evening' | 'night' {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const hour = dateObj.getHours();

  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

/**
 * Get day of week name
 */
export function getDayOfWeek(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'EEEE');
}

/**
 * Check if a date is within a range
 */
export function isDateInRange(date: Date | string, start: Date, end: Date): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return dateObj >= start && dateObj <= end;
}

/**
 * Filter items by date range
 */
export function filterByDateRange<T>(
  items: T[],
  getDate: (item: T) => Date | string,
  start: Date,
  end: Date
): T[] {
  return items.filter((item) => isDateInRange(getDate(item), start, end));
}

/**
 * Calculate streak from sorted dates (newest first)
 */
export function calculateStreak(dates: (Date | string)[]): {
  current: number;
  longest: number;
} {
  if (dates.length === 0) return { current: 0, longest: 0 };

  // Convert to Date objects and sort (newest first)
  const sortedDates = dates
    .map((d) => (typeof d === 'string' ? parseISO(d) : d))
    .sort((a, b) => b.getTime() - a.getTime());

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let expectedDate = startOfDay(new Date());

  for (const date of sortedDates) {
    const dateDay = startOfDay(date);

    if (isSameDay(dateDay, expectedDate)) {
      tempStreak++;
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
      // Only count as current streak if it includes today or yesterday
      if (differenceInDays(new Date(), dateDay) <= 1) {
        currentStreak = tempStreak;
      }
      expectedDate = subDays(expectedDate, 1);
    } else if (dateDay < expectedDate) {
      // Gap in streak
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
      tempStreak = 1;
      expectedDate = subDays(dateDay, 1);
    }
  }

  return { current: currentStreak, longest: Math.max(longestStreak, tempStreak) };
}

/**
 * Get heatmap data for calendar view
 * Returns an array of objects with date, count, and value
 */
export function getHeatmapData<T>(
  items: T[],
  getDate: (item: T) => Date | string,
  daysBack: number = 90
): Array<{ date: string; count: number; day: number; value: number }> {
  const { start, end } = getLastNDays(daysBack);
  const days = getDaysInRange(start, end);
  const grouped = groupByDay(items, getDate);

  return days.map((day) => {
    const dayKey = format(day, 'yyyy-MM-dd');
    const dayItems = grouped.get(dayKey) || [];
    return {
      date: dayKey,
      count: dayItems.length,
      day: day.getDay(), // 0-6 (Sunday-Saturday)
      value: dayItems.length, // For heatmap intensity
    };
  });
}

/**
 * Get time-of-day distribution
 */
export function getTimeOfDayDistribution<T>(
  items: T[],
  getDate: (item: T) => Date | string
): Record<string, number> {
  const distribution: Record<string, number> = {
    morning: 0,
    afternoon: 0,
    evening: 0,
    night: 0,
  };

  for (const item of items) {
    const timeOfDay = getTimeOfDay(getDate(item));
    distribution[timeOfDay]++;
  }

  return distribution;
}

/**
 * Get day-of-week distribution
 */
export function getDayOfWeekDistribution<T>(
  items: T[],
  getDate: (item: T) => Date | string
): Record<string, number> {
  const distribution: Record<string, number> = {
    Sunday: 0,
    Monday: 0,
    Tuesday: 0,
    Wednesday: 0,
    Thursday: 0,
    Friday: 0,
    Saturday: 0,
  };

  for (const item of items) {
    const dayOfWeek = getDayOfWeek(getDate(item));
    distribution[dayOfWeek]++;
  }

  return distribution;
}
