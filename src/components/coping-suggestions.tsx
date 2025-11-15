'use client';

import { useState } from 'react';
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
import {
  Heart,
  Activity,
  Brain,
  Users,
  Palette,
  Zap,
  RefreshCw,
  Clock
} from 'lucide-react';
import type { CopingStrategy, CopingOutput } from '@/ai/flows';

interface CopingSuggestionsProps {
  currentEmotion: string;
  specificEmotions: string[];
  intensity: number;
  contextTags?: {
    location?: string;
    activity?: string[];
    triggers?: string[];
    people?: string;
  };
  recentEntries?: any[];
}

export function CopingSuggestions({
  currentEmotion,
  specificEmotions,
  intensity,
  contextTags,
  recentEntries,
}: CopingSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<CopingOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSuggestions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/coping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentEmotion,
          specificEmotions,
          intensity,
          contextTags,
          recentEntries,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate coping suggestions');
      }

      const data = await response.json();
      setSuggestions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate suggestions');
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryIcon = (category: CopingStrategy['category']) => {
    switch (category) {
      case 'immediate':
        return <Zap className="h-4 w-4" />;
      case 'grounding':
        return <Heart className="h-4 w-4" />;
      case 'physical':
        return <Activity className="h-4 w-4" />;
      case 'cognitive':
        return <Brain className="h-4 w-4" />;
      case 'social':
        return <Users className="h-4 w-4" />;
      case 'creative':
        return <Palette className="h-4 w-4" />;
    }
  };

  const getIntensityColor = (strategyIntensity: CopingStrategy['intensity']) => {
    switch (strategyIntensity) {
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-500" />
              Coping Strategies
            </CardTitle>
            <CardDescription>
              Personalized suggestions for {currentEmotion.toLowerCase()}
            </CardDescription>
          </div>
          {!suggestions && (
            <Button
              onClick={generateSuggestions}
              disabled={isLoading}
              size="sm"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                'Get Suggestions'
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2 p-4 border rounded-lg">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <div className="flex gap-2 mt-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-24" />
                </div>
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
              onClick={generateSuggestions}
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        )}

        {suggestions && !isLoading && (
          <div className="space-y-6">
            {/* Priority Tip */}
            <div className="p-4 rounded-lg bg-pink-50 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-800">
              <div className="flex items-start gap-2">
                <Zap className="h-5 w-5 text-pink-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-pink-900 dark:text-pink-100 mb-1">
                    Start Here
                  </p>
                  <p className="text-sm text-pink-800 dark:text-pink-200">
                    {suggestions.priorityTip}
                  </p>
                </div>
              </div>
            </div>

            {/* Strategies */}
            <div className="space-y-4">
              {suggestions.strategies.map((strategy, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 text-muted-foreground">
                      {getCategoryIcon(strategy.category)}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-sm">{strategy.title}</h4>
                        <Badge variant="outline" className="text-xs capitalize">
                          {strategy.category}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground">
                        {strategy.description}
                      </p>

                      <div className="flex flex-wrap gap-2 pt-2">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {strategy.duration}
                        </div>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${getIntensityColor(strategy.intensity)}`}
                        >
                          {strategy.intensity} effort
                        </Badge>
                      </div>

                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground italic">
                          💡 {strategy.bestFor}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={generateSuggestions}
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Get New Suggestions
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
