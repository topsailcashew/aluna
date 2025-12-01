'use client';

import { useWellnessLog } from '@/context/wellness-log-provider';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Activity, Star, Flame } from 'lucide-react';
import { useMemo } from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { emotionCategories } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { useStreak } from '@/hooks/use-streak';

export function StatCards() {
  const { logEntries, isLoading } = useWellnessLog();
  const streakData = useStreak(logEntries || []);

  const summary = useMemo(() => {
    if (!logEntries || logEntries.length === 0) {
      return {
        lastCheckIn: 'N/A',
        mostFrequentEmotion: 'N/A',
      };
    }

    const sortedEntries = [...logEntries].sort(
      (a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()
    );

    const lastEntry = sortedEntries[0];
    const lastCheckIn = formatDistanceToNow(parseISO(lastEntry.date), {
      addSuffix: true,
    });

    const emotionCounts = sortedEntries.reduce((acc, entry) => {
      const l1Emotion = emotionCategories.find(cat => cat.subCategories.some(sub => sub.name === entry.emotion))?.name || 'Unknown';
      acc[l1Emotion] = (acc[l1Emotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostFrequentEmotion = Object.entries(emotionCounts).length > 0 
      ? Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0][0]
      : 'N/A';

    return { lastCheckIn, mostFrequentEmotion };
  }, [logEntries]);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader><Skeleton className="h-8 w-3/4 mb-2" /></CardHeader><CardContent><Skeleton className="h-4 w-1/2" /></CardContent></Card>
        <Card><CardHeader><Skeleton className="h-8 w-1/2 mb-2" /></CardHeader><CardContent><Skeleton className="h-4 w-3/4" /></CardContent></Card>
        <Card><CardHeader><Skeleton className="h-8 w-1/2 mb-2" /></CardHeader><CardContent><Skeleton className="h-4 w-3/4" /></CardContent></Card>
      </div>
    );
  }

  const getStreakMessage = (streak: number) => {
    if (streak === 0) return 'Start your streak today!';
    if (streak === 1) return 'Great start!';
    if (streak < 7) return 'Keep it up!';
    if (streak < 30) return 'Fantastic consistency!';
    if (streak < 100) return 'Amazing dedication!';
    return 'Legendary streak!';
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Last Check-in</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.lastCheckIn}</div>
          <p className="text-xs text-muted-foreground">Keep up the great work!</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Dominant Emotion</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.mostFrequentEmotion}</div>
          <p className="text-xs text-muted-foreground">Your most logged primary emotion.</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
          <Flame className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold flex items-center gap-1">
            {streakData.current} {streakData.current > 0 && '🔥'}
          </div>
          <p className="text-xs text-muted-foreground">{getStreakMessage(streakData.current)}</p>
        </CardContent>
      </Card>
    </div>
  );
}
