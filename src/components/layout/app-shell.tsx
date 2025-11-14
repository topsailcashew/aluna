
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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Menu, Paintbrush, WandSparkles, UserCircle } from "lucide-react";
import { ThemeToggle } from "../theme-toggle";
import { useUser } from "@/firebase";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const pathname = usePathname();
  const mainActionPath = user ? "/dashboard" : "/";

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur">
        <div className="flex h-16 items-center px-4">
          <div className="flex items-center">
            {/* Conditional left-side menu or placeholder */}
          </div>

          <div className="flex-1 flex justify-center">
            <Button
              asChild
              variant="ghost"
              className="font-bold text-lg tracking-tight hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
            >
              <Link href={mainActionPath}>Aluna</Link>
            </Button>
          </div>

          <div className="flex-1 flex justify-end items-center gap-2">
            {!isUserLoading && !user && (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </>
            )}
            {!isUserLoading && user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <UserCircle className="h-6 w-6" />
                      <span className="sr-only">User Menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <UserCircle className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/tools">
                        <WandSparkles className="mr-2 h-4 w-4" />
                        <span>Breathing Tools</span>
                      </Link>
                    </DropdownMenuItem>
                     <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Paintbrush className="mr-2 h-4 w-4" />
                      <span>Theme</span>
                      <div className="ml-auto">
                        <ThemeToggle />
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
