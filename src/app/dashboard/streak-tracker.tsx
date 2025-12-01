'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Flame } from 'lucide-react';
import { useStreak } from '@/hooks/use-streak';
import { useWellnessLog } from '@/context/wellness-log-provider';

export function StreakTracker() {
  const { logEntries, isLoading } = useWellnessLog();
  const streakData = useStreak(logEntries || []);

  const getStreakMessage = (streak: number) => {
    if (streak === 0) return 'Start your streak by checking in today!';
    if (streak === 1) return 'Great start! One day down.';
    if (streak < 7) return 'Keep the momentum going!';
    if (streak < 30) return 'Fantastic consistency!';
    if (streak < 100) return 'Amazing dedication to your well-being!';
    return 'Legendary consistency!';
  };
  
  return (
    <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Check-in Streak
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
            <div className="text-6xl font-bold flex items-center justify-center gap-2 text-orange-500">
                {streakData.current}
                {streakData.current > 0 && <span>🔥</span>}
            </div>
            <p className="text-sm text-muted-foreground mt-2">{getStreakMessage(streakData.current)}</p>
        </CardContent>
    </Card>
  );
}
