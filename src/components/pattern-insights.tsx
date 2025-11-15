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
  TrendingUp,
  Calendar,
  MapPin,
  Target,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { Pattern, PatternsOutput } from '@/ai/flows';

interface PatternInsightsProps {
  daysBack?: number;
}

export function PatternInsights({ daysBack = 30 }: PatternInsightsProps) {
  const { logEntries } = useWellnessLog();
  const [patterns, setPatterns] = useState<PatternsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedPatterns, setExpandedPatterns] = useState<Set<number>>(new Set());

  // Filter entries by date range
  const recentEntries = logEntries.filter((entry) => {
    const entryDate = new Date(entry.date);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);
    return entryDate >= cutoffDate;
  });

  // Generate patterns
  const generatePatterns = async () => {
    if (recentEntries.length < 3) {
      setError('Need at least 3 check-ins to identify patterns');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/patterns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entries: recentEntries,
          daysAnalyzed: daysBack,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to recognize patterns');
      }

      const data = await response.json();
      setPatterns(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to recognize patterns');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-generate on mount if we have data
  useEffect(() => {
    if (recentEntries.length >= 3 && !patterns && !error) {
      generatePatterns();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const togglePattern = (index: number) => {
    const newExpanded = new Set(expandedPatterns);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedPatterns(newExpanded);
  };

  const getPatternIcon = (type: Pattern['type']) => {
    switch (type) {
      case 'temporal':
        return <Calendar className="h-4 w-4 text-blue-600" />;
      case 'contextual':
        return <MapPin className="h-4 w-4 text-green-600" />;
      case 'trend':
        return <TrendingUp className="h-4 w-4 text-purple-600" />;
      default:
        return <Target className="h-4 w-4 text-orange-600" />;
    }
  };

  const getConfidenceBadgeVariant = (confidence: Pattern['confidence']): 'default' | 'secondary' | 'outline' => {
    switch (confidence) {
      case 'high':
        return 'default';
      case 'medium':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (recentEntries.length < 3) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-500" />
            Pattern Recognition
          </CardTitle>
          <CardDescription>
            Identify recurring patterns in your wellness data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Need at least 3 check-ins to identify patterns</p>
            <p className="text-sm mt-2">Keep logging to discover your patterns</p>
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
              <Target className="h-5 w-5 text-orange-500" />
              Pattern Recognition
            </CardTitle>
            <CardDescription>
              Based on {daysBack} days ({recentEntries.length} check-ins)
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={generatePatterns}
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
            <p>{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={generatePatterns}
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        )}

        {patterns && !isLoading && (
          <div className="space-y-6">
            {/* Key Takeaway */}
            <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
              <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                🎯 Key Takeaway: {patterns.keyTakeaway}
              </p>
            </div>

            {/* Individual Patterns */}
            <div className="space-y-4">
              {patterns.patterns.map((pattern, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{getPatternIcon(pattern.type)}</div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <h4 className="font-semibold text-sm">{pattern.title}</h4>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs capitalize">
                            {pattern.type}
                          </Badge>
                          <Badge variant={getConfidenceBadgeVariant(pattern.confidence)} className="text-xs">
                            {pattern.confidence} confidence
                          </Badge>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground">
                        {pattern.description}
                      </p>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Frequency: {pattern.frequency}</span>
                      </div>

                      {/* Expandable details */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePattern(index)}
                        className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                      >
                        {expandedPatterns.has(index) ? (
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

                      {expandedPatterns.has(index) && (
                        <div className="mt-3 space-y-3 pl-4 border-l-2 border-muted">
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">
                              What this means
                            </p>
                            <p className="text-sm">{pattern.insight}</p>
                          </div>
                          {pattern.dataPoints.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">
                                Examples
                              </p>
                              <ul className="text-sm space-y-1">
                                {pattern.dataPoints.map((point, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <span className="text-muted-foreground">•</span>
                                    <span>{point}</span>
                                  </li>
                                ))}
                              </ul>
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
