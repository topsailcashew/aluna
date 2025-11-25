
"use client";

import { useWellnessLog } from "@/context/wellness-log-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Pie, PieChart } from "recharts";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { emotionCategories } from "@/lib/data";
import type { ChartConfig } from "@/components/ui/chart";

const emotionLegendConfig = emotionCategories.reduce((acc, category) => {
    acc[category.name] = {
        label: category.name,
        color: category.color,
    };
    return acc;
}, {} as ChartConfig);

export function WellnessCharts() {
  const { logEntries, isLoading } = useWellnessLog();

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
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <Skeleton className="h-48 w-48 rounded-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Emotion Distribution</CardTitle>
        <CardDescription>Your overall emotional landscape based on all check-ins.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={emotionLegendConfig}
          className="mx-auto aspect-square max-h-[250px]"
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
              innerRadius={60}
              strokeWidth={5}
            />
            <ChartLegend
              content={<ChartLegendContent nameKey="name" />}
              className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
