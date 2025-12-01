'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getRelativeTime } from '@/lib/utils/date-helpers';
import { thoughtPatterns, emotionCategories } from '@/lib/data';
import type { LogEntry } from '@/lib/types';
import { Brain, Heart, Waves } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface LatestEntryCardProps {
  entry: LogEntry;
}

export function LatestEntryCard({ entry }: LatestEntryCardProps) {
  const l1Category = emotionCategories.find((c) =>
    c.subCategories.some((sc) => sc.name === entry.emotion)
  );

  const getThoughtLabel = (id: string) => {
    return thoughtPatterns.find((p) => p.id === id)?.label || id;
  };
  
  const emotionIcon = {
    Happy: '😊',
    Sad: '😢',
    Disgusted: '🤢',
    Angry: '😠',
    Fearful: '😨',
    Surprised: '😮',
  }[l1Category?.name || ''] || '🤔';


  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Your Latest Check-in</span>
          <span className="text-sm font-normal text-muted-foreground">
            {getRelativeTime(entry.date)}
          </span>
        </CardTitle>
        <CardDescription>
          A snapshot of how you were feeling.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Emotions */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
            <Heart className="h-4 w-4" />
            EMOTIONAL STATE
          </h3>
          <div className="flex items-center gap-4">
             <div className="text-4xl">{emotionIcon}</div>
             <div>
                <p className="font-bold text-xl">{entry.emotion}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                {entry.specificEmotions?.map((e) => (
                    <Badge key={e} variant="secondary">
                    {e}
                    </Badge>
                ))}
                </div>
             </div>
          </div>
        </div>

        <Separator />

        {/* Sensations */}
        {entry.sensations.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
              <Waves className="h-4 w-4" />
              PHYSICAL SENSATIONS
            </h3>
            <div className="flex flex-wrap gap-2">
              {entry.sensations.map((s) => (
                <Badge key={s.id} variant="outline" className="text-sm py-1">
                  {s.location}: <span className="font-bold ml-1">{s.intensity}/10</span>
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {entry.sensations.length > 0 && <Separator />}

        {/* Thoughts */}
        {entry.thoughts.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
              <Brain className="h-4 w-4" />
              THOUGHT PATTERNS
            </h3>
            <div className="flex flex-wrap gap-2">
              {entry.thoughts.map((t) => (
                <Badge key={t} variant="outline" className="text-sm py-1">
                  {getThoughtLabel(t)}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
