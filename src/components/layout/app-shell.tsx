
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PenSquare, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur">
        <div className="container flex h-16 items-center">
          <Link href="/" className="mr-auto flex items-center gap-2 font-bold text-lg tracking-tight">
            <Icons.logo className="h-6 w-6"/>
            Mindful Charts
          </Link>
          <nav className="ml-auto flex items-center gap-4 text-sm font-medium text-muted-foreground">
            <Link href="/" className={cn("transition-colors hover:text-foreground", pathname === "/" && "text-foreground")}>
              Check-in
            </Link>
            <Link href="/dashboard" className={cn("transition-colors hover:text-foreground", pathname === "/dashboard" && "text-foreground")}>
              Dashboard
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
