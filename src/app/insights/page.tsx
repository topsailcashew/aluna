'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useWellnessLog } from '@/context/wellness-log-provider';
import { AIInsightsCard } from '@/components/ai-insights-card';
import { PatternInsights } from '@/components/pattern-insights';
import { CopingSuggestions } from '@/components/coping-suggestions';
import { NoEntries } from '../dashboard/no-entries';

export default function InsightsPage() {
  const { user, isUserLoading } = useUser();
  const { logEntries, isLoading } = useWellnessLog();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);
  
  const latestEntry = logEntries.length > 0 ? logEntries.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] : null;

  if (isUserLoading || !user || isLoading) {
    return (
      <div className="flex items-center justify-center h-full flex-1">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (logEntries.length === 0) {
    return <NoEntries />;
  }

  return (
    <div className="container mx-auto flex-1 space-y-6 p-4 md:p-8 pt-6">
       <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">AI Insights</h2>
        </div>
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <AIInsightsCard daysBack={7} />
        <PatternInsights daysBack={30} />
        {latestEntry && (
            <CopingSuggestions 
                currentEmotion={latestEntry.emotion}
                specificEmotions={latestEntry.specificEmotions}
                intensity={latestEntry.sensations.reduce((acc, s) => acc + s.intensity, 0) / latestEntry.sensations.length || 5}
                contextTags={latestEntry.contextTags}
                recentEntries={logEntries.slice(0, 5)}
            />
        )}
      </div>
    </div>
  );
}
