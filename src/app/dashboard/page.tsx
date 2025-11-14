
'use client';

import { RecentCheckIns } from "./recent-check-ins";
import { StatCards } from "./stat-cards";
import { WellnessCharts } from "./wellness-charts";
import { TimeHeatmap } from "./time-heatmap";
import { TrendLinesChart } from "./trend-lines-chart";
import { MonthlyComparison } from "./monthly-comparison";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useWellnessLog } from "@/context/wellness-log-provider";

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const { logEntries } = useWellnessLog();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
      <div className="flex items-center justify-center h-full flex-1">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden flex-1">
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-tr from-pink-400 to-purple-500 rounded-full blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full blur-3xl opacity-30 translate-x-1/2 translate-y-1/2"></div>
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-tl from-yellow-300 to-orange-400 rounded-full blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"></div>

      <div className="container mx-auto flex-1 space-y-6 p-4 md:p-8 pt-6 relative z-10">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>

        {/* Stat Cards */}
        <StatCards />

        {/* Time Heatmap - Full Width */}
        <TimeHeatmap entries={logEntries} daysBack={90} />

        {/* Trend Analysis - Side by Side */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <TrendLinesChart entries={logEntries} />
          <MonthlyComparison entries={logEntries} />
        </div>

        {/* Original Charts & Recent Check-ins */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
          <div className="lg:col-span-4">
            <WellnessCharts />
          </div>
          <div className="lg:col-span-3">
            <RecentCheckIns />
          </div>
        </div>
      </div>
    </div>
  );
}
