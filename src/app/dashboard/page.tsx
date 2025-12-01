'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useWellnessLog } from '@/context/wellness-log-provider';
import { NoEntries } from './no-entries';
import { InsightOfTheDay } from './insight-of-the-day';
import { LatestEntryCard } from './latest-entry-card';
import { StreakTracker } from './streak-tracker';
import { QuickActions } from './quick-actions';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const { logEntries, isLoading } = useWellnessLog();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

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

  const latestEntry = logEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  return (
    <div className="flex-1 bg-gradient-to-b from-background to-muted/20 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Welcome back, {user.displayName || 'User'}
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's a look at your wellness journey.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <QuickActions />
            <LatestEntryCard entry={latestEntry} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <InsightOfTheDay />
            <StreakTracker />
          </div>
        </div>
        
      </div>
    </div>
  );
}
