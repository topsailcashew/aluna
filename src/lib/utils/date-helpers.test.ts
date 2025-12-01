import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { getRelativeTime } from './date-helpers';
import { subMinutes, subHours, subDays } from 'date-fns';

describe('getRelativeTime', () => {
  beforeEach(() => {
    // Lock the current time for consistent test results
    const now = new Date('2025-01-15T12:00:00Z');
    vi.useFakeTimers();
    vi.setSystemTime(now);
  });

  afterEach(() => {
    // Restore real timers
    vi.useRealTimers();
  });

  it('should return "just now" for times less than a minute ago', () => {
    const time = subMinutes(new Date(), 0);
    expect(getRelativeTime(time)).toBe('just now');
  });

  it('should return minutes ago for times within the hour', () => {
    const time = subMinutes(new Date(), 30);
    expect(getRelativeTime(time)).toBe('30 minutes ago');
  });

  it('should return "1 minute ago" for a single minute', () => {
    const time = subMinutes(new Date(), 1);
    expect(getRelativeTime(time)).toBe('1 minute ago');
  });

  it('should return hours ago for times within the day', () => {
    const time = subHours(new Date(), 5);
    expect(getRelativeTime(time)).toBe('5 hours ago');
  });

  it('should return "yesterday" for a time yesterday', () => {
    const time = subDays(new Date(), 1);
    expect(getRelativeTime(time)).toBe('yesterday');
  });

  it('should return days ago for times within the week', () => {
    const time = subDays(new Date(), 4);
    expect(getRelativeTime(time)).toBe('4 days ago');
  });

  it('should return weeks ago for times within the month', () => {
    const time = subDays(new Date(), 15);
    expect(getRelativeTime(time)).toBe('2 weeks ago');
  });

  it('should return months ago for times within the year', () => {
    const time = subDays(new Date(), 70);
    expect(getRelativeTime(time)).toBe('2 months ago');
  });

  it('should return years ago for times over a year ago', () => {
    const time = subDays(new Date(), 400);
    expect(getRelativeTime(time)).toBe('1 year ago');
  });
});
