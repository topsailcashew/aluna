'use client';

import { useState, useEffect } from 'react';
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
// Define types inline to match API response schema
type Insight = {
  type: 'positive' | 'neutral' | 'concern';
  title: string;
  description: string;
  evidence: string;
  suggestion?: string;
};

type InsightsOutput = {
  insights: Insight[];
  summary: string;
};

interface AIInsightsCardProps {
  daysBack?: number;
}

export function AIInsightsCard({ daysBack = 7 }: AIInsightsCardProps) {
  const { logEntries } = useWellnessLog();
  const [insights, setInsights] = useState<InsightsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedInsights, setExpandedInsights] = useState<Set<number>>(new Set());

  // Filter entries by date range
  const recentEntries = logEntries.filter((entry) => {
    const entryDate = new Date(entry.date);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);
    return entryDate >= cutoffDate;
  });

  // Generate insights
  const generateInsights = async () => {
    if (recentEntries.length === 0) {
      setError('Need at least one check-in to generate insights');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entries: recentEntries,
          daysAnalyzed: daysBack,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.details || errorData.error || 'Failed to generate insights';
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Validate response structure
      if (!data.insights || !Array.isArray(data.insights)) {
        throw new Error('Invalid response format from AI');
      }

      setInsights(data);
    } catch (err) {
      console.error('AI Insights Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate insights');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-generate on mount if we have data
  useEffect(() => {
    if (recentEntries.length > 0 && !insights && !error) {
      generateInsights();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleInsight = (index: number) => {
    const newExpanded = new Set(expandedInsights);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedInsights(newExpanded);
  };

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

  const getInsightBadgeVariant = (type: Insight['type']): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (type) {
      case 'positive':
        return 'default';
      case 'concern':
        return 'destructive';
      default:
        return 'secondary';
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
            <p>Start checking in to get personalized AI insights</p>
            <p className="text-sm mt-2">We'll analyze your patterns and provide helpful feedback</p>
          </div>
        </CardContent>
      </Card>
    );
  }

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
            onClick={generateInsights}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-4 text-destructive">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={generateInsights}
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        )}

        {insights && !isLoading && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
              <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                {insights.summary}
              </p>
            </div>

            {/* Individual Insights */}
            <div className="space-y-4">
              {insights.insights.map((insight, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{getInsightIcon(insight.type)}</div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-sm">{insight.title}</h4>
                        <Badge variant={getInsightBadgeVariant(insight.type)} className="text-xs">
                          {insight.type}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground">
                        {insight.description}
                      </p>

                      {/* Expandable details */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleInsight(index)}
                        className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                      >
                        {expandedInsights.has(index) ? (
                          <>
                            <ChevronUp className="h-3 w-3 mr-1" />
                            Hide details
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-3 w-3 mr-1" />
                            Show details
                          </>
                        )}
                      </Button>

                      {expandedInsights.has(index) && (
                        <div className="mt-3 space-y-3 pl-4 border-l-2 border-muted">
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Evidence</p>
                            <p className="text-sm">{insight.evidence}</p>
                          </div>
                          {insight.suggestion && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">Suggestion</p>
                              <p className="text-sm">{insight.suggestion}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
