'use client';

import { useWellnessLog } from '@/context/wellness-log-provider';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { emotionCategories } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getRelativeTime } from '@/lib/utils/date-helpers';

export function RecentCheckIns() {
  const { logEntries } = useWellnessLog();

  const recentEntries = useMemo(() => {
    if (!logEntries || logEntries.length === 0) return [];
    return [...logEntries]
      .sort(
        (a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      .slice(0, 5);
  }, [logEntries]);

  if (recentEntries.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Check-ins</CardTitle>
        <CardDescription>A quick look at your latest entries.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-3">
          {recentEntries.map((entry) => {
            const l1Category = emotionCategories.find((c) =>
              c.subCategories.some((sc) => sc.name === entry.emotion)
            );
            return (
              <li
                key={entry.id}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: l1Category?.color
                      ? `${l1Category.color}30`
                      : '#ccc',
                  }}
                >
                  <span className="text-3xl">
                    {{
                      Happy: '😊',
                      Sad: '😢',
                      Disgusted: '🤢',
                      Angry: '😠',
                      Fearful: '😨',
                      Surprised: '😮',
                    }[l1Category?.name || ''] || '🤔'}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <p className="font-semibold">{entry.emotion}</p>
                    <p className="text-xs text-muted-foreground">
                      {getRelativeTime(entry.date)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {entry.specificEmotions?.slice(0, 3).map((e) => (
                      <Badge key={e} variant="secondary">
                        {e}
                      </Badge>
                    ))}
                    {entry.specificEmotions && entry.specificEmotions.length > 3 && (
                       <Badge variant="outline">+{entry.specificEmotions.length - 3}</Badge>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground hidden sm:block">
                  {entry.sensations.length} sensation
                  {entry.sensations.length !== 1 && 's'}
                </p>
              </li>
            );
          })}
        </ul>
        {logEntries.length > 5 && (
            <div className="pt-2 border-t">
                <Button variant="ghost" className="w-full" asChild>
                    <Link href="/trends">
                        View All Entries
                        <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                </Button>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
