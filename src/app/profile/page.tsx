
'use client';

import { useAuth, useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
  Save,
  Camera,
  X,
} from 'lucide-react';
import { signOut, updateProfile, updateEmail } from 'firebase/auth';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useWellnessLog } from '@/context/wellness-log-provider';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function ProfilePage() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const { logEntries } = useWellnessLog();
  const router = useRouter();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newAvatarFile, setNewAvatarFile] = useState<File | null>(null);
  const [newAvatarPreview, setNewAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
    if (user) {
      setDisplayName(user.displayName || '');
      setEmail(user.email || '');
    }
  }, [user, isUserLoading, router]);

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/');
    }
  };

  const handleSave = async () => {
    if (!user || !auth) return;

    setIsSaving(true);
    let photoURL = user.photoURL;

    try {
      // Upload new avatar if selected
      if (newAvatarFile) {
        const storage = getStorage();
        const storageRef = ref(storage, `profile-pictures/${user.uid}`);
        await uploadBytes(storageRef, newAvatarFile);
        photoURL = await getDownloadURL(storageRef);
      }
      
      // Update profile display name and photo unconditionally if in edit mode
      await updateProfile(user, {
        displayName: displayName,
        photoURL: photoURL,
      });

      // Update email if it has changed
      if (email !== user.email) {
        await updateEmail(user, email);
      }

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been saved successfully.',
      });
      setIsEditing(false);
      setNewAvatarFile(null);
      setNewAvatarPreview(null);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      let description = 'Failed to update your profile. Please try again.';
      if (error.code === 'auth/requires-recent-login') {
        description = 'Changing your email requires a recent sign-in. Please log out and log back in to continue.';
      }
      toast({
        variant: 'destructive',
        title: 'Error',
        description,
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleCancel = () => {
    setIsEditing(false);
    setDisplayName(user?.displayName || '');
    setEmail(user?.email || '');
    setNewAvatarFile(null);
    setNewAvatarPreview(null);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewAvatarFile(file);
      setNewAvatarPreview(URL.createObjectURL(file));
    }
  };

  const getUserInitials = () => {
    if (!displayName) return 'U';
    return displayName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const totalCheckIns = logEntries?.length || 0;
  const currentStreak = 0; // Placeholder
  const mostCommonEmotion = 'None yet'; // Placeholder
  const accountAge = user?.metadata?.creationTime ? format(new Date(user.metadata.creationTime), 'PPP') : 'Unknown';

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
        <Card className="border-2">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                   <AvatarImage src={newAvatarPreview || user.photoURL || ''} alt={displayName} />
                  <AvatarFallback className="bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white text-2xl font-bold">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                   <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center border-2 border-background"
                  >
                    <Camera className="h-4 w-4" />
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAvatarChange}
                      className="hidden"
                      accept="image/png, image/jpeg"
                    />
                  </button>
                )}
              </div>

              <div className="flex-1 text-center md:text-left space-y-2">
                 {isEditing ? (
                  <div className="space-y-4">
                    <Input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="text-3xl font-bold h-12"
                      placeholder="Your Name"
                    />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="text-sm h-10"
                      placeholder="your@email.com"
                    />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 justify-center md:justify-start">
                      <h1 className="text-3xl font-bold">{displayName || 'Welcome'}</h1>
                      <Badge variant="secondary" className="gap-1">
                        <Sparkles className="h-3 w-3" />
                        Active
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground justify-center md:justify-start">
                      <Mail className="h-4 w-4" />
                      <p className="text-sm">{user.email}</p>
                    </div>
                  </>
                )}
                <div className="flex items-center gap-2 text-muted-foreground justify-center md:justify-start">
                  <Calendar className="h-4 w-4" />
                  <p className="text-sm">Member since {accountAge}</p>
                </div>
              </div>

              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button onClick={handleSave} size="sm" disabled={isSaving}>
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                      Save
                    </Button>
                     <Button onClick={handleCancel} size="sm" variant="outline">
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
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
              <div className="text-2xl font-bold truncate">{mostCommonEmotion}</div>
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
                <p className="text-sm font-semibold">{displayName || 'Not set'}</p>
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

    