'use client';

import { useAuth, useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Loader2,
  UserCircle,
  LogOut,
  Mail,
  Calendar,
  TrendingUp,
  Flame,
  Heart,
  Award,
  Settings,
  Shield,
  Edit,
  Sparkles,
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useWellnessLog } from '@/context/wellness-log-provider';
import { format } from 'date-fns';

export default function ProfilePage() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const { logEntries } = useWellnessLog();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

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
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Calculate user stats
  const totalCheckIns = logEntries?.length || 0;

  // Calculate streak
  const calculateStreak = () => {
    if (!logEntries || logEntries.length === 0) return 0;

    const sortedEntries = [...logEntries].sort((a, b) => {
      const dateA = typeof a.date === 'string' ? new Date(a.date) : a.date.toDate?.() || new Date();
      const dateB = typeof b.date === 'string' ? new Date(b.date) : b.date.toDate?.() || new Date();
      return dateB.getTime() - dateA.getTime();
    });

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const entry of sortedEntries) {
      const entryDate = typeof entry.date === 'string' ? new Date(entry.date) : entry.date.toDate?.() || new Date();
      entryDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === streak) {
        streak++;
      } else if (diffDays > streak) {
        break;
      }
    }

    return streak;
  };

  const currentStreak = calculateStreak();

  // Get most common emotion
  const getMostCommonEmotion = () => {
    if (!logEntries || logEntries.length === 0) return 'None yet';

    const emotionCounts: Record<string, number> = {};
    logEntries.forEach(entry => {
      emotionCounts[entry.emotion] = (emotionCounts[entry.emotion] || 0) + 1;
    });

    const mostCommon = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0];
    return mostCommon ? mostCommon[0] : 'None yet';
  };

  // Get account age
  const getAccountAge = () => {
    if (!user?.metadata?.creationTime) return 'Unknown';
    const created = new Date(user.metadata.creationTime);
    const now = new Date();
    const days = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return '1 day';
    if (days < 30) return `${days} days`;
    if (days < 365) return `${Math.floor(days / 30)} months`;
    return `${Math.floor(days / 365)} years`;
  };

  if (isUserLoading || !user) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gradient-to-b from-background to-muted/20 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card className="border-2">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                <AvatarFallback className="bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white text-2xl font-bold">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center md:text-left space-y-2">
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <h1 className="text-3xl font-bold">{user.displayName || 'Welcome'}</h1>
                  <Badge variant="secondary" className="gap-1">
                    <Sparkles className="h-3 w-3" />
                    Active
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground justify-center md:justify-start">
                  <Mail className="h-4 w-4" />
                  <p className="text-sm">{user.email}</p>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground justify-center md:justify-start">
                  <Calendar className="h-4 w-4" />
                  <p className="text-sm">Member for {getAccountAge()}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Check-ins</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCheckIns}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Flame className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-2">
                {currentStreak}
                {currentStreak > 0 && <span className="text-orange-500">🔥</span>}
              </div>
              <p className="text-xs text-muted-foreground">
                {currentStreak === 0 ? 'Start today!' : `${currentStreak} day${currentStreak > 1 ? 's' : ''}`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Most Common</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold truncate">{getMostCommonEmotion()}</div>
              <p className="text-xs text-muted-foreground">Primary emotion</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Achievements</CardTitle>
              <Award className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalCheckIns >= 30 ? '3' : totalCheckIns >= 7 ? '2' : totalCheckIns >= 1 ? '1' : '0'}
              </div>
              <p className="text-xs text-muted-foreground">Badges earned</p>
            </CardContent>
          </Card>
        </div>

        {/* Account Information */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCircle className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Display Name</label>
                <p className="text-sm font-semibold">{user.displayName || 'Not set'}</p>
              </div>
              <Separator />
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                <p className="text-sm font-semibold">{user.email}</p>
              </div>
              <Separator />
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Account Created</label>
                <p className="text-sm font-semibold">
                  {user.metadata?.creationTime
                    ? format(new Date(user.metadata.creationTime), 'PPP')
                    : 'Unknown'}
                </p>
              </div>
              <Separator />
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Last Sign In</label>
                <p className="text-sm font-semibold">
                  {user.metadata?.lastSignInTime
                    ? format(new Date(user.metadata.lastSignInTime), 'PPP')
                    : 'Unknown'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Preferences
              </CardTitle>
              <CardDescription>Customize your experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Theme</label>
                <p className="text-sm">System default</p>
              </div>
              <Separator />
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Notifications</label>
                <Badge variant="outline">Coming soon</Badge>
              </div>
              <Separator />
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Data Export</label>
                <Button variant="outline" size="sm" className="w-full">
                  Export My Data
                </Button>
              </div>
              <Separator />
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Privacy</label>
                <Button variant="outline" size="sm" className="w-full">
                  <Shield className="h-4 w-4 mr-2" />
                  Privacy Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Account Actions</CardTitle>
            <CardDescription>Manage your account security</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleSignOut} variant="outline" className="w-full">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
            <Button variant="destructive" className="w-full" disabled>
              Delete Account
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Account deletion is currently disabled. Contact support if needed.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
