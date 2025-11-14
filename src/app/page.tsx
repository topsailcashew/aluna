
'use client';

import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || user) {
    return (
      <main className="w-screen h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center bg-background p-4 text-center">
        <div className="relative z-10 w-full px-4">
            <h1 className="font-extrabold text-5xl sm:text-7xl md:text-8xl tracking-tighter text-foreground mb-4">
                Find Your Inner Balance
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                Aluna helps you understand your emotional landscape. Log your feelings, sensations, and thoughts to uncover patterns and cultivate self-awareness.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild size="lg">
                    <Link href="/signup">Get Started for Free</Link>
                </Button>
                <Button asChild variant="ghost" size="lg">
                    <Link href="/login">I Already Have an Account</Link>
                </Button>
            </div>
        </div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-tr from-pink-400 to-purple-500 rounded-full blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full blur-3xl opacity-30 translate-x-1/2 translate-y-1/2"></div>
    </main>
  );
}
