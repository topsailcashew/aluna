"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getHeatmapData } from "@/lib/utils/date-helpers";
import { format, parseISO } from "date-fns";
import type { LogEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TimeHeatmapProps {
  entries: LogEntry[];
  daysBack?: number;
}

/**
 * Time Heatmap Component
 * Displays a calendar-style heatmap showing check-in frequency
 * Similar to GitHub's contribution graph
 */
export function TimeHeatmap({ entries, daysBack = 90 }: TimeHeatmapProps) {
  const heatmapData = useMemo(() => {
    const getDate = (entry: LogEntry) => {
      if (entry.date instanceof Date) return entry.date;
      if (typeof entry.date === 'string') return parseISO(entry.date);
      if ((entry.date as any).toDate) return (entry.date as any).toDate();
      return new Date();
    };

    return getHeatmapData(entries, getDate, daysBack);
  }, [entries, daysBack]);

  // Group by week for display
  const weekData = useMemo(() => {
    const weeks: Array<typeof heatmapData> = [];
    let currentWeek: typeof heatmapData = [];

    // Pad start to align with Sunday
    const firstDay = heatmapData[0];
    if (firstDay) {
      const startPadding = firstDay.day;
      for (let i = 0; i < startPadding; i++) {
        currentWeek.push({ date: '', count: 0, day: i, value: 0 });
      }
    }

    for (const day of heatmapData) {
      currentWeek.push(day);
      if (day.day === 6 || day === heatmapData[heatmapData.length - 1]) {
        // Saturday or last day
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    }

    return weeks;
  }, [heatmapData]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalDays = heatmapData.filter((d) => d.date).length;
    const activeDays = heatmapData.filter((d) => d.count > 0).length;
    const totalCheckIns = heatmapData.reduce((sum, d) => sum + d.count, 0);
    const maxInDay = Math.max(...heatmapData.map((d) => d.count), 0);

    return {
      totalDays,
      activeDays,
      totalCheckIns,
      maxInDay,
      activePercentage: totalDays > 0 ? (activeDays / totalDays) * 100 : 0,
    };
  }, [heatmapData]);

  // Get intensity color
  const getIntensityColor = (count: number): string => {
    if (count === 0) return 'bg-muted';
    if (count === 1) return 'bg-green-200 dark:bg-green-900';
    if (count === 2) return 'bg-green-400 dark:bg-green-700';
    if (count === 3) return 'bg-green-600 dark:bg-green-500';
    return 'bg-green-800 dark:bg-green-300';
  };

  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Check-in Activity</CardTitle>
            <CardDescription>
              Last {daysBack} days of check-in frequency
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary">
              {stats.activeDays}/{stats.totalDays} days
            </Badge>
            <Badge variant="secondary">
              {Math.round(stats.activePercentage)}% active
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Heatmap */}
        <div className="overflow-x-auto">
          <div className="inline-flex gap-1">
            {/* Day labels */}
            <div className="flex flex-col gap-1 justify-between py-1">
              {dayLabels.map((label, idx) => (
                <div
                  key={idx}
                  className="h-3 w-4 text-xs text-muted-foreground flex items-center justify-center"
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Heatmap grid */}
            <div className="flex gap-1">
              {weekData.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-1">
                  {week.map((day, dayIdx) => {
                    const isToday =
                      day.date &&
                      format(parseISO(day.date), 'yyyy-MM-dd') ===
                        format(new Date(), 'yyyy-MM-dd');

                    return (
                      <div
                        key={`${weekIdx}-${dayIdx}`}
                        className={cn(
                          'h-3 w-3 rounded-sm transition-colors',
                          day.date
                            ? getIntensityColor(day.count)
                            : 'bg-transparent',
                          isToday && 'ring-2 ring-primary ring-offset-1',
                          day.count > 0 && 'cursor-pointer hover:ring-2 hover:ring-primary'
                        )}
                        title={
                          day.date
                            ? `${format(parseISO(day.date), 'MMM d, yyyy')}: ${
                                day.count
                              } check-in${day.count === 1 ? '' : 's'}`
                            : ''
                        }
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-1 items-center">
            <div className="h-3 w-3 rounded-sm bg-muted" />
            <div className="h-3 w-3 rounded-sm bg-green-200 dark:bg-green-900" />
            <div className="h-3 w-3 rounded-sm bg-green-400 dark:bg-green-700" />
            <div className="h-3 w-3 rounded-sm bg-green-600 dark:bg-green-500" />
            <div className="h-3 w-3 rounded-sm bg-green-800 dark:bg-green-300" />
          </div>
          <span>More</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t">
          <div>
            <div className="text-2xl font-bold">{stats.totalCheckIns}</div>
            <div className="text-xs text-muted-foreground">Total check-ins</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{stats.activeDays}</div>
            <div className="text-xs text-muted-foreground">Active days</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{stats.maxInDay}</div>
            <div className="text-xs text-muted-foreground">Max in one day</div>
          </div>
          <div>
            <div className="text-2xl font-bold">
              {Math.round(stats.activePercentage)}%
            </div>
            <div className="text-xs text-muted-foreground">Active rate</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
