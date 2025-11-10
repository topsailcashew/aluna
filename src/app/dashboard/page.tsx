
import { RecentCheckIns } from "./recent-check-ins";
import { StatCards } from "./stat-cards";
import { WellnessCharts } from "./wellness-charts";

export default function DashboardPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-tr from-pink-400 to-purple-500 rounded-full blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full blur-3xl opacity-30 translate-x-1/2 translate-y-1/2"></div>
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-tl from-yellow-300 to-orange-400 rounded-full blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
      
      <div className="container mx-auto flex-1 space-y-4 p-4 md:p-8 pt-6 relative z-10">
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
    </div>
  );
}
