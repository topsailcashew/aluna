
'use client';

import { useState, useEffect, useTransition } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useWellnessLog } from '@/context/wellness-log-provider';
import {
  Sparkles,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Lightbulb,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { generateInsights } from '@/actions/generate-insights';
import type { InsightsOutput, Insight } from '@/ai/flows/generate-insights';

interface AIInsightsCardProps {
  daysBack?: number;
}

export function AIInsightsCard({ daysBack = 7 }: AIInsightsCardProps) {
  const { logEntries } = useWellnessLog();
  const [insights, setInsights] = useState<InsightsOutput | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const recentEntries = logEntries.filter((entry) => {
    const entryDate = entry.date instanceof Date ? entry.date : entry.date.toDate();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);
    return entryDate >= cutoffDate;
  });

  const handleGenerateInsights = () => {
    if (recentEntries.length === 0) {
      setError('Need at least one check-in to generate insights');
      return;
    }

    startTransition(async () => {
      setError(null);
      try {
        const data = await generateInsights({
          entries: recentEntries,
          daysAnalyzed: daysBack,
        });

        if (!data.insights || !Array.isArray(data.insights)) {
          throw new Error('Invalid response format from AI');
        }

        setInsights(data);
      } catch (err) {
        console.error('AI Insights Error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to generate insights';
        setError(errorMessage);
      }
    });
  };

  useEffect(() => {
    if (recentEntries.length > 0 && !insights && !error) {
      handleGenerateInsights();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logEntries.length]);

  const getInsightIcon = (type: Insight['type']) => {
    switch (type) {
      case 'positive':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'concern':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default:
        return <Lightbulb className="h-4 w-4 text-blue-600" />;
    }
  };

  if (recentEntries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Key Insight
          </CardTitle>
          <CardDescription>
            Personalized insights from your check-ins
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Start checking in to get personalized AI insights.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const displayedInsights = isExpanded ? insights?.insights : insights?.insights.slice(0, 1);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Key Insight
            </CardTitle>
            <CardDescription>
              Based on your last {daysBack} days ({recentEntries.length} check-ins)
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateInsights}
            disabled={isPending}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isPending ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isPending && !insights && (
          <div className="space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        )}

        {error && (
          <div className="text-center py-4 text-destructive">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>Could not generate insights.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateInsights}
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        )}

        {insights && !isPending && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
              <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                ✨ Summary: {insights.summary}
              </p>
            </div>

            {displayedInsights?.map((insight, index) => (
              <div key={index} className="border-b pb-3 last:border-b-0">
                <div className="flex items-start gap-3">
                  <div className="mt-1">{getInsightIcon(insight.type)}</div>
                  <div className="flex-1 space-y-1">
                      <h4 className="font-semibold text-sm">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground">{insight.description}</p>
                      <Badge variant="outline" className="text-xs capitalize">{insight.type}</Badge>
                  </div>
                </div>
              </div>
            ))}
            
            {insights.insights.length > 1 && (
               <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="w-full">
                {isExpanded ? 'Show Less' : `Show ${insights.insights.length - 1} More`}
                {isExpanded ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
              </Button>
            )}

          </div>
        )}
      </CardContent>
    </Card>
  );
}
