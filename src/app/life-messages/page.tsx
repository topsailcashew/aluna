'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { LifeMessagesWizard } from '@/components/life-messages/LifeMessagesWizard';
import { LifeMessageSession } from '@/lib/types/life-messages';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { authenticatedJsonRequest, AuthenticationError, RateLimitError, ApiError } from '@/lib/api-client';

/**
 * Life Messages Exercise Page
 * Protected route - requires authentication
 */
export default function LifeMessagesPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [sessionId] = useState(() => crypto.randomUUID());
  const [isExporting, setIsExporting] = useState(false);
  const [sessionCreated, setSessionCreated] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  // Show loading while checking auth
  if (isUserLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  /**
   * Save session to Firestore
   */
  const handleSave = async (sessionData: Partial<LifeMessageSession>) => {
    try {
      if (!sessionCreated) {
        // First save: create the session
        await authenticatedJsonRequest('/api/lifemessages', {
          method: 'POST',
          body: {
            sessionData: {
              ...sessionData,
              id: sessionId,
            },
          },
        });

        setSessionCreated(true);
      } else {
        // Subsequent saves: update the session
        await authenticatedJsonRequest(`/api/lifemessages/${sessionId}`, {
          method: 'PATCH',
          body: {
            updates: sessionData,
          },
        });
      }
    } catch (error) {
      console.error('Error saving session:', error);

      if (error instanceof AuthenticationError) {
        toast({
          title: 'Authentication Error',
          description: 'Please sign in to save your session.',
          variant: 'destructive',
        });
      } else if (error instanceof RateLimitError) {
        toast({
          title: 'Rate Limit',
          description: `Too many saves. Try again in ${error.retryAfter} seconds.`,
          variant: 'destructive',
        });
      } else if (error instanceof ApiError) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      }

      throw error;
    }
  };

  /**
   * Export current view as PDF
   */
  const handleExportPDF = async () => {
    setIsExporting(true);

    try {
      const summaryElement = document.getElementById('summary-canvas');

      if (!summaryElement) {
        toast({
          title: 'Export failed',
          description: 'Summary canvas not found. Please navigate to the Summary step.',
          variant: 'destructive',
        });
        return;
      }

      // Capture the summary canvas as an image
      const canvas = await html2canvas(summaryElement, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 190; // A4 width minus margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);

      // Download PDF
      pdf.save(`life-messages-${new Date().toISOString().split('T')[0]}.pdf`);

      toast({
        title: 'PDF exported',
        description: 'Your summary has been downloaded.',
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: 'Export failed',
        description: 'Could not generate PDF. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Generate shareable link
   */
  const handleShare = async () => {
    toast({
      title: 'Share feature',
      description: 'Shareable links will be available soon.',
    });

    // TODO: Implement share token generation
    // 1. Generate signed token
    // 2. Create share link
    // 3. Copy to clipboard
  };

  return (
    <div className="min-h-screen bg-background">
      <LifeMessagesWizard
        sessionId={sessionId}
        onSave={handleSave}
        onExportPDF={handleExportPDF}
        onShare={handleShare}
      />

      {/* Loading overlay during export */}
      {isExporting && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Generating PDF...</p>
          </div>
        </div>
      )}
    </div>
  );
}
