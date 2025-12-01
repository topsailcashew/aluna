
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
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
  Menu,
} from 'lucide-react';
import { useAuth, useUser } from '@/firebase';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { signOut } from 'firebase/auth';
import { useTheme } from 'next-themes';
import { Switch } from '../ui/switch';
import { Icons } from '../icons';

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

  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      {showNav && (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between px-4">
            {/* Logo */}
            <Link
              href={user ? '/dashboard' : '/'}
              className="flex items-center gap-2 group"
            >
              <span className="font-bold text-xl tracking-tight text-foreground transition-colors group-hover:text-primary">
                Aluna
              </span>
            </Link>

            {/* Desktop Navigation - Centered */}
            {isClient && user && (
              <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1 rounded-full bg-muted/50 p-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all',
                        isActive
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </nav>
            )}

            {/* Right side - Auth buttons or User menu */}
            <div className="flex items-center gap-2">
              {!isClient || isUserLoading ? (
                <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
              ) : !user ? (
                <>
                  <Button variant="ghost" asChild className="hidden sm:flex">
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                </>
              ) : (
                <>
                  {/* Mobile Menu - Hamburger */}
                  <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                    <SheetTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                      >
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[280px]">
                      <SheetHeader>
                        <SheetTitle>Menu</SheetTitle>
                      </SheetHeader>
                      <div className="flex flex-col gap-4 mt-8">
                        {/* Navigation Links */}
                        <div className="flex flex-col gap-2">
                          {navLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive = pathname === link.href;
                            return (
                              <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={cn(
                                  'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                                  isActive
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                )}
                              >
                                <Icon className="h-5 w-5" />
                                {link.label}
                              </Link>
                            );
                          })}
                        </div>

                        <div className="border-t pt-4">
                          {/* User Info */}
                          <div className="px-4 py-2 mb-2">
                            <p className="text-sm font-medium">
                              {user.displayName || 'User'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {user.email}
                            </p>
                          </div>

                          {/* Profile Link */}
                          <Link
                            href="/profile"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          >
                            <User className="h-5 w-5" />
                            Profile
                          </Link>

                          {/* Dark Mode Toggle */}
                          <div className="flex items-center justify-between px-4 py-3 rounded-lg">
                            <div className="flex items-center gap-3">
                              {theme === 'dark' ? (
                                <Moon className="h-5 w-5 text-muted-foreground" />
                              ) : (
                                <Sun className="h-5 w-5 text-muted-foreground" />
                              )}
                              <span className="text-sm font-medium text-muted-foreground">
                                Dark Mode
                              </span>
                            </div>
                            <Switch
                              checked={theme === 'dark'}
                              onCheckedChange={(checked) =>
                                setTheme(checked ? 'dark' : 'light')
                              }
                            />
                          </div>

                          {/* Sign Out */}
                          <button
                            onClick={() => {
                              handleSignOut();
                              setMobileMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors mt-2"
                          >
                            <LogOut className="h-5 w-5" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>

                  {/* Desktop User Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full hidden md:flex"
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
                </>
              )}
            </div>
          </div>
        </header>
      )}
      <main className="flex-1 flex flex-col pt-0">{children}</main>
    </div>
  );
}
