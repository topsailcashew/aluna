
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const nextPath = pathname === "/dashboard" ? "/" : "/dashboard";

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur">
        <div className="flex h-16 items-center justify-center">
            <Button
              asChild
              variant="ghost"
              className="font-bold text-lg tracking-tight hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
            >
              <Link href={nextPath}>
                Aluna
              </Link>
            </Button>
        </div>
      </header>
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
