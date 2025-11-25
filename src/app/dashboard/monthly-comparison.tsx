
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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { getMonthlyComparison } from "@/lib/utils/analytics";
import { getCurrentMonth, getPreviousMonth } from "@/lib/utils/date-helpers";
import { format } from "date-fns";
import type { LogEntry } from "@/lib/types";

interface MonthlyComparisonProps {
  entries: LogEntry[];
}

/**
 * Monthly Comparison Component
 * Compares current month vs. previous month metrics
 */
export function MonthlyComparison({ entries }: MonthlyComparisonProps) {
  const comparisonData = useMemo(() => {
    const current = getCurrentMonth();
    const previous = getPreviousMonth();

    return getMonthlyComparison(
      entries,
      current.start,
      current.end,
      previous.start,
      previous.end
    );
  }, [entries]);

  // Format data for bar chart
  const chartData = useMemo(() => {
    const currentEmotions = comparisonData.current.emotions.slice(0, 5);
    const previousEmotions = comparisonData.previous.emotions.slice(0, 5);

    // Get unique emotions
    const allEmotions = new Set([
      ...currentEmotions.map((e) => e.emotion),
      ...previousEmotions.map((e) => e.emotion),
    ]);

    return Array.from(allEmotions).map((emotion) => {
      const current =
        currentEmotions.find((e) => e.emotion === emotion)?.count || 0;
      const previous =
        previousEmotions.find((e) => e.emotion === emotion)?.count || 0;

      return {
        emotion,
        current,
        previous,
      };
    });
  }, [comparisonData]);

  const currentMonth = format(getCurrentMonth().start, 'MMMM');
  const previousMonth = format(getPreviousMonth().start, 'MMMM');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Comparison</CardTitle>
        <CardDescription>
          Comparing {currentMonth} vs. {previousMonth}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Check-in Count */}
          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Check-ins</span>
              {comparisonData.current.count !==
                comparisonData.previous.count && (
                <Badge variant="secondary">
                  {comparisonData.current.count >
                  comparisonData.previous.count
                    ? '+'
                    : ''}
                  {comparisonData.current.count -
                    comparisonData.previous.count}
                </Badge>
              )}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">
                {comparisonData.current.count}
              </span>
              <span className="text-sm text-muted-foreground">
                vs {comparisonData.previous.count}
              </span>
            </div>
          </div>

          {/* Dominant Emotion */}
          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Top Emotion
              </span>
            </div>
            <div className="space-y-1">
              <div className="font-semibold truncate">
                {comparisonData.current.emotions[0]?.emotion || 'N/A'}
              </div>
              <div className="text-xs text-muted-foreground">
                {comparisonData.current.emotions[0]?.count || 0} times this
                month
              </div>
            </div>
          </div>
        </div>

        {/* Emotion Distribution Comparison */}
        {chartData.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-4">
              Top 5 Emotion Frequency
            </h4>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis
                    dataKey="emotion"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    label={{
                      value: 'Count',
                      angle: -90,
                      position: 'insideLeft',
                      style: { fontSize: 12 },
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Legend />
                  <Bar
                    dataKey="current"
                    fill="hsl(var(--primary))"
                    name={currentMonth}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="previous"
                    fill="hsl(var(--muted))"
                    name={previousMonth}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
}
