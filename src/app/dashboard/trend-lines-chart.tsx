
"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { filterByDateRange } from "@/lib/utils/date-helpers";
import { parseISO } from "date-fns";
import type { LogEntry } from "@/lib/types";

// This file is no longer used in the new dashboard layout but is kept for reference.
// If you'd like to re-introduce it, you can add it back to `src/app/dashboard/page.tsx`.

interface TrendLinesChartProps {
  entries: LogEntry[];
}

export function TrendLinesChart({ entries }: TrendLinesChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sensation Intensity Trends</CardTitle>
        <CardDescription>This component is currently not in use.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
          <p>This chart has been removed from the current dashboard layout.</p>
        </div>
      </CardContent>
    </Card>
  );
}
