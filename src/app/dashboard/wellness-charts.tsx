
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
  ChartStyle,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartConfig } from "@/components/ui/chart";
import { emotionCategories, thoughtPatterns as thoughtPatternConfig } from "@/lib/data";
import { format, parseISO } from "date-fns";
import { useMemo } from "react";

const L2Emotions = emotionCategories.flatMap(cat => cat.subCategories);

const emotionChartConfig = L2Emotions.reduce((acc, emotion) => {
    const category = emotionCategories.find(c => c.subCategories.some(sc => sc.name === emotion.name));
    acc[emotion.name] = {
        label: emotion.name,
        color: category?.color || '#ccc',
    };
    return acc;
}, {} as ChartConfig);

const emotionLegendConfig = emotionCategories.reduce((acc, category) => {
    acc[category.name] = {
        label: category.name,
        color: category.color,
    };
    return acc;
}, {} as ChartConfig);


const thoughtChartConfig = thoughtPatternConfig.reduce((acc, pattern) => {
  acc[pattern.id] = {
    label: pattern.label,
  };
  return acc;
}, {} as ChartConfig);


export function WellnessCharts() {
  const { logEntries } = useWellnessLog();

  const emotionFrequency = useMemo(() => {
    const emotionCounts: {[key: string]: number} = {};
    logEntries.forEach(entry => {
        emotionCounts[entry.emotion] = (emotionCounts[entry.emotion] || 0) + 1;
    });
    return L2Emotions.map(emotion => ({
      emotion: emotion.name,
      count: emotionCounts[emotion.name] || 0,
      fill: emotionChartConfig[emotion.name]?.color
    })).filter(e => e.count > 0);
  }, [logEntries]);

  const sensationTimeline = useMemo(() => {
    return logEntries
      .flatMap(entry => entry.sensations.map(sensation => ({
        date: entry.date,
        intensity: sensation.intensity,
        location: sensation.location,
      })))
      .sort((a,b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
      .map(s => ({
        ...s,
        date: format(parseISO(s.date), 'MMM d')
      }));
  }, [logEntries]);
  
  const thoughtPatternFrequency = useMemo(() => {
    const counts: { [key: string]: number } = {};
    for (const entry of logEntries) {
      for (const thought of entry.thoughts) {
        counts[thought] = (counts[thought] || 0) + 1;
      }
    }
    return thoughtPatternConfig.map(pattern => ({
      name: pattern.label,
      value: counts[pattern.id] || 0,
      fill: `hsl(var(--chart-${(thoughtPatternConfig.indexOf(pattern) % 5) + 1}))`,
    }));
  }, [logEntries]);

  if (logEntries.length === 0) {
    return (
      <Card className="w-full py-20">
        <CardContent className="text-center">
          <p className="text-muted-foreground">No data yet. Start by adding a new check-in entry.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Emotion Frequency</CardTitle>
          <CardDescription>
            How often you've felt each emotion.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={emotionChartConfig} className="min-h-[300px] w-full">
            <BarChart accessibilityLayer data={emotionFrequency}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="emotion"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                interval={0}
                tick={{ fontSize: 12, angle: -45, textAnchor: 'end' }}
                height={60}
              />
              <YAxis />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
               <ChartLegend content={<ChartLegendContent nameKey="name" payload={emotionCategories.map(cat => ({ value: cat.name, color: cat.color, type: 'square' }))} />} />
              <Bar dataKey="count" radius={4} barSize={20} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sensation Intensity Over Time</CardTitle>
          <CardDescription>
            Intensity of physical sensations you've logged.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="min-h-[300px] w-full">
            <LineChart
              accessibilityLayer
              data={sensationTimeline}
              margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 10]} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="intensity"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{
                  fill: "hsl(var(--primary))",
                }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

       <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Thought Patterns</CardTitle>
          <CardDescription>
            A breakdown of your recorded thought patterns.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
            <ChartContainer
                config={thoughtChartConfig}
                className="mx-auto aspect-square max-h-[400px]"
            >
                <PieChart>
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                    data={thoughtPatternFrequency}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    strokeWidth={5}
                >
                    <ChartStyle />
                </Pie>
                <ChartLegend
                    content={<ChartLegendContent nameKey="name" />}
                    className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                />
                </PieChart>
            </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
