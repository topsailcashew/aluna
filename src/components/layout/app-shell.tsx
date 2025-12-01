
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  LayoutDashboard,
  Wind,
  User,
  LogOut,
  LogIn,
  UserPlus,
  Plus,
  Moon,
  Sun,
  LineChart,
  Sparkles,
} from 'lucide-react';
import { useAuth, useUser } from '@/firebase';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { signOut } from 'firebase/auth';
import { useTheme } from 'next-themes';
import { Switch } from '../ui/switch';

export function AppShell({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const [isClient, setIsClient] = React.useState(false);
  const { theme, setTheme } = useTheme();

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/');
    }
  };

  const getUserInitials = () => {
    if (!user?.displayName) return 'U';
    return user.displayName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/check-in', label: 'Check-in', icon: Plus },
    { href: '/trends', label: 'Trends', icon: LineChart },
    { href: '/insights', label: 'Insights', icon: Sparkles },
    { href: '/tools', label: 'Tools', icon: Wind },
  ];

  const showNav = !['/', '/login', '/signup', '/life-messages'].includes(pathname);

  return (
    <div className="flex min-h-screen flex-col">
      {showNav && (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container grid h-16 grid-cols-3 items-center">
            <div className="flex items-center justify-start">
              <Link
                href={user ? '/dashboard' : '/'}
                className="flex items-center gap-2 group"
              >
                <span className="font-bold text-xl tracking-tight text-foreground transition-colors group-hover:text-primary">
                  Aluna
                </span>
              </Link>
            </div>

            {isClient && user && (
              <div className="hidden md:flex justify-center">
                <nav className="flex items-center gap-2 rounded-full bg-muted/50 p-1.5">
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                          'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {link.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            )}

            <div className="flex items-center justify-end gap-2">
              {!isClient || isUserLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full"
                    >
                      <Avatar className="h-8 w-8">
                         <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                        <AvatarFallback className="bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white text-xs">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">
                          {user.displayName || 'User'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="md:hidden">
                      {navLinks.map((link) => (
                        <DropdownMenuItem key={link.href} asChild>
                          <Link href={link.href}>
                            <link.icon className="mr-2 h-4 w-4" />
                            {link.label}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                    </div>

                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      {theme === 'dark' ? (
                        <Moon className="mr-2 h-4 w-4" />
                      ) : (
                        <Sun className="mr-2 h-4 w-4" />
                      )}
                      <span>Dark Mode</span>
                      <Switch
                        checked={theme === 'dark'}
                        onCheckedChange={(checked) =>
                          setTheme(checked ? 'dark' : 'light')
                        }
                        className="ml-auto"
                      />
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="text-destructive focus:text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </header>
      )}
      <main className="flex-1 flex flex-col pt-0">{children}</main>
    </div>
  );
}
