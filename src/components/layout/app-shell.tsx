
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
            Mindful Charts
          </Link>
          <div className="flex-1 flex justify-center">
            <nav className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
              <Link href="/" className={cn("transition-colors hover:text-foreground", pathname === "/" && "text-foreground")}>
                Check-in
              </Link>
              <Link href="/dashboard" className={cn("transition-colors hover:text-foreground", pathname === "/dashboard" && "text-foreground")}>
                Dashboard
              </Link>
            </nav>
          </div>
           <div className="w-40" />
        </div>
      </header>
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
