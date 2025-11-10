
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LineChart, PenSquare } from "lucide-react";

import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="/" className="mr-6 flex items-center gap-2 font-semibold">
            <Icons.logo className="size-6 text-primary" />
            <span className="font-headline text-xl font-medium">Mindful Charts</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link
              href="/"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === "/" ? "text-foreground" : "text-foreground/60"
              )}
            >
              Check-in
            </Link>
            <Link
              href="/dashboard"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === "/dashboard" ? "text-foreground" : "text-foreground/60"
              )}
            >
              Dashboard
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
