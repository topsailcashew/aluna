
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, Paintbrush, WandSparkles } from "lucide-react";
import { ThemeToggle } from "../theme-toggle";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const nextPath = pathname === "/dashboard" ? "/" : "/dashboard";

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur">
        <div className="flex h-16 items-center px-4">
          <div className="flex-1" />

          <div className="flex-1 flex justify-center">
            <Button
              asChild
              variant="ghost"
              className="font-bold text-lg tracking-tight hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
            >
              <Link href={nextPath}>Aluna</Link>
            </Button>
          </div>

          <div className="flex-1 flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/tools">
                    <WandSparkles className="mr-2 h-4 w-4" />
                    <span>Breathing Tools</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Paintbrush className="mr-2 h-4 w-4" />
                  <span>Theme</span>
                  <div className="ml-auto">
                    <ThemeToggle />
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
