
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
  TrendingUp,
  Calendar,
  MapPin,
  Target,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from 'lucide-react';
import type { Pattern, PatternsOutput } from '@/ai/flows';
import { authenticatedJsonRequest, AuthenticationError, RateLimitError, ApiError } from '@/lib/api-client';

interface PatternInsightsProps {
  daysBack?: number;
}

export function PatternInsights({ daysBack = 30 }: PatternInsightsProps) {
  const { logEntries } = useWellnessLog();
  const [patterns, setPatterns] = useState<PatternsOutput | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Filter entries by date range
  const recentEntries = logEntries.filter((entry) => {
    const entryDate = new Date(entry.date);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);
    return entryDate >= cutoffDate;
  });

  const handleGeneratePatterns = () => {
    if (recentEntries.length < 3) {
      setError('Need at least 3 check-ins to identify patterns');
      return;
    }

    startTransition(async () => {
      setError(null);
      try {
        const data = await authenticatedJsonRequest<PatternsOutput>('/api/ai/patterns', {
          method: 'POST',
          body: {
            entries: recentEntries,
            daysAnalyzed: daysBack,
          },
        });

        setPatterns(data);
      } catch (err) {
        if (err instanceof AuthenticationError) {
          setError('Please sign in to use pattern recognition');
        } else if (err instanceof RateLimitError) {
          setError(`Rate limit exceeded. Please try again in ${err.retryAfter} seconds`);
        } else if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError(err instanceof Error ? err.message : 'Failed to recognize patterns');
        }
      }
    });
  };

  useEffect(() => {
    if (recentEntries.length >= 3 && !patterns && !error) {
      handleGeneratePatterns();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logEntries.length]);

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
            <p>Need at least 3 check-ins to find patterns.</p>
            <p className="text-sm mt-2">{3 - recentEntries.length} more to go!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayedPatterns = isExpanded ? patterns?.patterns : patterns?.patterns.slice(0, 1);

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
            onClick={handleGeneratePatterns}
            disabled={isPending}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isPending ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isPending && !patterns && (
          <div className="space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        )}

        {error && (
          <div className="text-center py-4 text-destructive">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>Could not generate patterns.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGeneratePatterns}
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        )}

        {patterns && !isPending && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
              <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                🎯 Key Takeaway: {patterns.keyTakeaway}
              </p>
            </div>

            {displayedPatterns?.map((pattern, index) => (
              <div key={index} className="border-b pb-3 last:border-b-0">
                <div className="flex items-start gap-3">
                  <div className="mt-1">{getPatternIcon(pattern.type)}</div>
                  <div className="flex-1 space-y-1">
                    <h4 className="font-semibold text-sm">{pattern.title}</h4>
                    <p className="text-sm text-muted-foreground">{pattern.description}</p>
                    <Badge variant="outline" className="text-xs capitalize">{pattern.type}</Badge>
                  </div>
                </div>
              </div>
            ))}
            
            {patterns.patterns.length > 1 && (
              <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="w-full">
                {isExpanded ? 'Show Less' : `Show ${patterns.patterns.length - 1} More`}
                {isExpanded ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
