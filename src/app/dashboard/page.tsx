'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { useWellnessLog } from '@/context/wellness-log-provider';
import { NoEntries } from './no-entries';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { RecentCheckIns } from './recent-check-ins';
import { StatCards } from './stat-cards';

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

  return (
    <div className="flex-1 bg-gradient-to-b from-background to-muted/20 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Welcome back, {user.displayName || 'User'}
            </h1>
            <p className="text-muted-foreground mt-1">
              How are you feeling today?
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/check-in">
              <Plus className="mr-2 h-5 w-5" />
              New Check-in
            </Link>
          </Button>
        </div>

        {/* Stat Cards */}
        <StatCards />

        {/* Recent Check-ins */}
        <RecentCheckIns />

      </div>
    </div>
  );
}
