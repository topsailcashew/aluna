
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function NoEntries() {
  return (
    <div className="flex-1 flex items-center justify-center bg-background">
      <Card className="w-full max-w-lg text-center p-8">
        <CardContent className="space-y-4">
          <div className="text-5xl">👋</div>
          <h2 className="text-2xl font-bold">Welcome to Aluna!</h2>
          <p className="text-muted-foreground">
            It looks like you haven't logged a check-in yet. Your dashboard will
            come to life with insights and patterns once you start tracking
            your wellness.
          </p>
          <Button asChild size="lg">
            <Link href="/check-in">
              Start Your First Check-in
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
