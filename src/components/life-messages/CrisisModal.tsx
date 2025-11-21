'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Phone, ExternalLink } from 'lucide-react';

interface CrisisModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Crisis resources modal
 * Displays emergency contact information when crisis keywords are detected
 */
export function CrisisModal({ open, onOpenChange }: CrisisModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" aria-describedby="crisis-description">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-6 w-6" />
            <DialogTitle className="text-xl">You Are Not Alone</DialogTitle>
          </div>
          <DialogDescription id="crisis-description" className="sr-only">
            Emergency mental health resources and crisis support contacts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            If you are experiencing thoughts of self-harm or suicide, please reach out for help
            immediately. You deserve support.
          </p>

          {/* Emergency Hotlines */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">24/7 Crisis Support</h3>

            <div className="space-y-2">
              {/* 988 Suicide & Crisis Lifeline */}
              <div className="flex items-start gap-3 rounded-lg border p-3">
                <Phone className="h-5 w-5 mt-0.5 text-primary" />
                <div className="flex-1 space-y-1">
                  <p className="font-medium text-sm">988 Suicide & Crisis Lifeline</p>
                  <p className="text-sm text-muted-foreground">Call or text 988</p>
                  <a
                    href="tel:988"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    aria-label="Call 988 Suicide and Crisis Lifeline"
                  >
                    <Phone className="h-3 w-3" />
                    Call Now
                  </a>
                </div>
              </div>

              {/* Crisis Text Line */}
              <div className="flex items-start gap-3 rounded-lg border p-3">
                <Phone className="h-5 w-5 mt-0.5 text-primary" />
                <div className="flex-1 space-y-1">
                  <p className="font-medium text-sm">Crisis Text Line</p>
                  <p className="text-sm text-muted-foreground">Text HOME to 741741</p>
                  <a
                    href="sms:741741?body=HOME"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    aria-label="Text Crisis Text Line"
                  >
                    <Phone className="h-3 w-3" />
                    Send Text
                  </a>
                </div>
              </div>

              {/* International Resources */}
              <div className="flex items-start gap-3 rounded-lg border p-3">
                <ExternalLink className="h-5 w-5 mt-0.5 text-primary" />
                <div className="flex-1 space-y-1">
                  <p className="font-medium text-sm">International Support</p>
                  <p className="text-sm text-muted-foreground">
                    Find resources in your country
                  </p>
                  <a
                    href="https://findahelpline.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    aria-label="Find international crisis helplines (opens in new tab)"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Visit FindAHelpline.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Services */}
          <div className="rounded-lg bg-muted p-3">
            <p className="text-sm">
              <strong>In immediate danger?</strong> Call emergency services (911 in the US) or go
              to your nearest emergency room.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button asChild>
            <a href="tel:988" aria-label="Call 988 now for immediate help">
              Call 988 Now
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
