
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
import { Skeleton } from "../ui/skeleton";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const pathname = usePathname();
  const mainActionPath = user ? "/dashboard" : "/";

  // Hide check-in button on the form page itself
  const showCheckInButton = user && !pathname.startsWith('/check-in');

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Button
              asChild
              variant="link"
              className="px-0 font-bold text-lg tracking-tight text-foreground hover:no-underline"
            >
              <Link href={mainActionPath}>Aluna</Link>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {isUserLoading ? (
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
              </div>
            ) : !user ? (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </>
            ) : (
                <>
                  {showCheckInButton && (
                    <Button asChild>
                      <Link href="/check-in">New Check-in</Link>
                    </Button>
                  )}
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
                </>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
