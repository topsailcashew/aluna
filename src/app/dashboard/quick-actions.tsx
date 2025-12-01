'use client';

import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, LineChart, Sparkles } from 'lucide-react';


export function QuickActions() {
  return (
    <Card className="shadow-sm">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-lg font-medium">How are you feeling today?</p>
            <div className="flex gap-2">
              <Button asChild size="lg">
                  <Link href="/check-in">
                  <Plus className="mr-2 h-5 w-5" />
                  New Check-in
                  </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                  <Link href="/trends">
                    <LineChart className="mr-2 h-5 w-5" />
                    View Trends
                  </Link>
              </Button>
            </div>
        </CardContent>
    </Card>
  );
}
