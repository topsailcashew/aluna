
'use client';

import { useWellnessLog } from '@/context/wellness-log-provider';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Pie, PieChart } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";

import { useMemo } from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { emotionCategories } from '@/lib/data';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  LOCATION_OPTIONS,
  ACTIVITY_OPTIONS,
  TRIGGER_OPTIONS,
  PEOPLE_OPTIONS
} from '@/lib/constants/context-options';

const emotionLegendConfig = emotionCategories.reduce((acc, category) => {
    acc[category.name] = {
        label: category.name,
        color: category.color,
    };
    return acc;
}, {} as ChartConfig);

export function RecentCheckIns() {
  const { logEntries, isLoading } = useWellnessLog();

  const sortedEntries = useMemo(() => {
    if (!logEntries) return [];
    return [...logEntries]
      .sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      .slice(0, 5);
  }, [logEntries]);

  // Helper to get context label with emoji
  const getContextLabel = (type: 'location' | 'activity' | 'trigger' | 'people', id: string) => {
    let option;
    switch (type) {
      case 'location':
        option = LOCATION_OPTIONS.find(o => o.id === id);
        break;
      case 'activity':
        option = ACTIVITY_OPTIONS.find(o => o.id === id);
        break;
      case 'trigger':
        option = TRIGGER_OPTIONS.find(o => o.id === id);
        break;
      case 'people':
        option = PEOPLE_OPTIONS.find(o => o.id === id);
        break;
    }
    return option ? `${option.emoji} ${option.label}` : id;
  };

   const emotionDistribution = useMemo(() => {
    if (!logEntries) return [];
    const emotionCounts = logEntries.reduce((acc, entry) => {
      const l1Emotion = emotionCategories.find(cat => cat.subCategories.some(sub => sub.name === entry.emotion))?.name || 'Unknown';
      acc[l1Emotion] = (acc[l1Emotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(emotionCounts).map(([name, value]) => ({
      name,
      value,
      fill: emotionLegendConfig[name]?.color,
    }));
  }, [logEntries]);

  if (isLoading) {
    return (
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <Skeleton className="h-48 w-48 rounded-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <div className="ml-auto text-right space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Emotion Distribution</CardTitle>
                <CardDescription>Your overall emotional landscape.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer
                    config={emotionLegendConfig}
                    className="mx-auto aspect-square max-h-[200px]"
                >
                    <PieChart>
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                        data={emotionDistribution}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={40}
                        strokeWidth={5}
                    />
                    <ChartLegend
                        content={<ChartLegendContent nameKey="name" />}
                        className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/3 [&>*]:justify-center"
                    />
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
        <Card>
        <CardHeader>
            <CardTitle>Recent Check-ins</CardTitle>
            <CardDescription>A look at your last few entries.</CardDescription>
        </CardHeader>
        <CardContent>
            <ScrollArea className="h-[260px]">
            <div className="space-y-4">
            {sortedEntries.length > 0 ? (
              sortedEntries.map((entry) => {
                const l1Category = emotionCategories.find(c => c.subCategories.some(sc => sc.name === entry.emotion));
                const hasContext = entry.contextTags && (
                  entry.contextTags.location ||
                  (entry.contextTags.activity && entry.contextTags.activity.length > 0) ||
                  (entry.contextTags.triggers && entry.contextTags.triggers.length > 0) ||
                  entry.contextTags.people
                );

                return (
                  <div key={entry.id} className="flex items-start gap-4 pb-4 border-b last:border-b-0 last:pb-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0" style={{backgroundColor: l1Category?.color || '#ccc'}}>
                       <span className="text-xl">
                        {
                            {
                                "Happy": "😊",
                                "Sad": "😢",
                                "Disgusted": "🤢",
                                "Angry": "😠",
                                "Fearful": "😨",
                                "Surprised": "😮"
                            }[l1Category?.name || ""] || "🤔"
                        }
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex-1">
                          <p className="text-sm font-medium leading-none">
                            {entry.emotion}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {entry.specificEmotions?.join(', ')}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-medium">
                            {formatDistanceToNow(parseISO(entry.date), { addSuffix: true })}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {entry.sensations.length} sensation{entry.sensations.length !== 1 && 's'}
                          </p>
                        </div>
                      </div>

                      {/* Context Tags */}
                      {hasContext && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {entry.contextTags?.location && (
                            <Badge variant="secondary" className="text-xs">
                              {getContextLabel('location', entry.contextTags.location)}
                            </Badge>
                          )}
                          {entry.contextTags?.activity?.map((activity) => (
                            <Badge key={activity} variant="secondary" className="text-xs">
                              {getContextLabel('activity', activity)}
                            </Badge>
                          ))}
                          {entry.contextTags?.triggers?.slice(0, 2).map((trigger) => (
                            <Badge key={trigger} variant="outline" className="text-xs">
                              {getContextLabel('trigger', trigger)}
                            </Badge>
                          ))}
                          {entry.contextTags?.people && (
                            <Badge variant="secondary" className="text-xs">
                              {getContextLabel('people', entry.contextTags.people)}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
            })
            ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No recent check-ins.</p>
            )}
            </div>
            </ScrollArea>
        </CardContent>
        </Card>
    </div>
  );
}
