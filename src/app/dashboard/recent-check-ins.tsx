
'use client';

import { useWellnessLog } from '@/context/wellness-log-provider';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { emotionCategories, thoughtPatterns as ALL_THOUGHT_PATTERNS } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import {
  LOCATION_OPTIONS,
  ACTIVITY_OPTIONS,
  TRIGGER_OPTIONS,
  PEOPLE_OPTIONS
} from '@/lib/constants/context-options';
import { Separator } from '@/components/ui/separator';

export function RecentCheckIns() {
  const { logEntries } = useWellnessLog();

  const latestEntry = useMemo(() => {
    if (!logEntries || logEntries.length === 0) return null;
    return [...logEntries].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0];
  }, [logEntries]);

  const getContextLabel = (type: 'location' | 'activity' | 'trigger' | 'people', id: string) => {
    let option;
    const options = {
      location: LOCATION_OPTIONS,
      activity: ACTIVITY_OPTIONS,
      trigger: TRIGGER_OPTIONS,
      people: PEOPLE_OPTIONS,
    };
    option = options[type].find(o => o.id === id);
    return option ? `${option.emoji} ${option.label}` : id;
  };
  
  const getThoughtLabel = (id: string) => {
    return ALL_THOUGHT_PATTERNS.find(t => t.id === id)?.label || id;
  }

  if (!latestEntry) {
    return null; // Or a placeholder
  }

  const l1Category = emotionCategories.find(c => c.subCategories.some(sc => sc.name === latestEntry.emotion));
  const hasContext = latestEntry.contextTags && Object.values(latestEntry.contextTags).some(val => Array.isArray(val) ? val.length > 0 : !!val);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Last Check-in</CardTitle>
        <CardDescription>
          {format(parseISO(latestEntry.date), "MMMM d, yyyy 'at' h:mm a")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Emotion Summary */}
        <div className="flex items-start gap-4 p-4 rounded-lg" style={{ backgroundColor: l1Category ? `${l1Category.color}20` : '#ccc' }}>
          <div className="flex h-12 w-12 items-center justify-center rounded-full flex-shrink-0" style={{ backgroundColor: l1Category?.color || '#ccc' }}>
            <span className="text-3xl">
              {{ "Happy": "😊", "Sad": "😢", "Disgusted": "🤢", "Angry": "😠", "Fearful": "😨", "Surprised": "😮" }[l1Category?.name || ""] || "🤔"}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">You felt</p>
            <p className="text-xl font-bold">{latestEntry.emotion}</p>
            <p className="text-sm text-muted-foreground">{latestEntry.specificEmotions?.join(', ')}</p>
          </div>
        </div>

        {/* Sensations */}
        {latestEntry.sensations.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Sensations Noticed</h4>
            <div className="flex flex-wrap gap-2">
              {latestEntry.sensations.map(s => (
                <Badge key={s.id} variant="secondary">{s.location} ({s.intensity}/10)</Badge>
              ))}
            </div>
          </div>
        )}
        
        <Separator />

        {/* Thoughts */}
        {latestEntry.thoughts.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Thought Patterns</h4>
            <div className="flex flex-wrap gap-2">
              {latestEntry.thoughts.map(t => (
                <Badge key={t} variant="outline">{getThoughtLabel(t)}</Badge>
              ))}
            </div>
          </div>
        )}
        
        {hasContext && <Separator />}

        {/* Context */}
        {hasContext && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Context</h4>
            <div className="flex flex-wrap gap-2">
              {latestEntry.contextTags?.location && <Badge variant="secondary">{getContextLabel('location', latestEntry.contextTags.location)}</Badge>}
              {latestEntry.contextTags?.activity?.map(id => <Badge key={id} variant="secondary">{getContextLabel('activity', id)}</Badge>)}
              {latestEntry.contextTags?.triggers?.map(id => <Badge key={id} variant="secondary">{getContextLabel('trigger', id)}</Badge>)}
              {latestEntry.contextTags?.people && <Badge variant="secondary">{getContextLabel('people', latestEntry.contextTags.people)}</Badge>}
            </div>
          </div>
        )}
        
        {latestEntry.journalEntry && <Separator />}
        
        {/* Journal */}
        {latestEntry.journalEntry && (
           <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Journal Entry</h4>
            <p className="text-sm text-foreground bg-muted p-3 rounded-md whitespace-pre-wrap">{latestEntry.journalEntry}</p>
          </div>
        )}

      </CardContent>
    </Card>
  );
}
