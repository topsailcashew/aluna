
import { RecentCheckIns } from "./recent-check-ins";
import { StatCards } from "./stat-cards";
import { WellnessCharts } from "./wellness-charts";

export default function DashboardPage() {
  return (
    <div className="container mx-auto flex-1 space-y-4 p-4 md:p-8 pt-6">
       <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <StatCards />
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <WellnessCharts />
        </div>
        <div className="lg:col-span-3">
          <RecentCheckIns />
        </div>
      </div>
    </div>
  );
}
