/**
 * Check-In Page
 *
 * Mobile-first full-screen check-in experience.
 * No app shell, no navigation - just the check-in flow.
 */

'use client';

import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { MobileCheckInForm } from '@/components/mobile-check-in-form';

export default function CheckInPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <MobileCheckInForm />;
}
