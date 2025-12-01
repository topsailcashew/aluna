'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';
import { useMemo } from 'react';

const insights = [
  "What is one small thing you can do today to honor how you feel?",
  "Your feelings are visitors. Let them come and go.",
  "Notice the space between your thoughts. What do you find there?",
  "Self-awareness without self-compassion is just self-criticism.",
  "What story are you telling yourself right now? Is it true?",
  "The goal is not to eliminate emotions, but to understand their message.",
  "Even on cloudy days, the sun is still shining.",
  "How you feel is valid, even if you don't know why.",
  "Progress isn't linear. Be patient with your journey.",
  "What does your body need to feel 1% more comfortable right now?",
  "A single deep breath can be a powerful anchor to the present moment.",
  "Curiosity is the antidote to judgment."
];

export function InsightOfTheDay() {
  const dailyInsight = useMemo(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).valueOf()) / 86400000);
    return insights[dayOfYear % insights.length];
  }, []);

  return (
    <Card className="bg-muted/30 border-dashed shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          Insight for Today
        </CardTitle>
        <CardDescription>A small thought for your wellness journey.</CardDescription>
      </CardHeader>
      <CardContent>
        <blockquote className="border-l-2 pl-4 italic text-lg">
          {dailyInsight}
        </blockquote>
      </CardContent>
    </Card>
  );
}
