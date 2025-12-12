/**
 * Sensation Details Modal
 *
 * Modal that appears after selecting a body part, allowing users to:
 * - Set intensity level (0-10)
 * - Add optional notes
 */

'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';

interface SensationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bodyPart: string;
  onSave: (data: { location: string; intensity: number; notes: string }) => void;
  initialData?: {
    intensity: number;
    notes: string;
  };
}

export function SensationDetailsModal({
  isOpen,
  onClose,
  bodyPart,
  onSave,
  initialData,
}: SensationDetailsModalProps) {
  const [intensity, setIntensity] = React.useState(initialData?.intensity ?? 5);
  const [notes, setNotes] = React.useState(initialData?.notes ?? '');

  // Reset when opened with new body part
  React.useEffect(() => {
    if (isOpen) {
      setIntensity(initialData?.intensity ?? 5);
      setNotes(initialData?.notes ?? '');
    }
  }, [isOpen, initialData]);

  const handleSave = () => {
    onSave({
      location: bodyPart,
      intensity,
      notes,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Sensation Details</DialogTitle>
          <DialogDescription>
            Describe the sensation you're feeling in your{' '}
            <Badge variant="secondary" className="mx-1">
              {bodyPart}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Intensity Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="intensity">Intensity</Label>
              <span className="text-2xl font-bold text-primary">{intensity}</span>
            </div>
            <Slider
              id="intensity"
              value={[intensity]}
              onValueChange={(values) => setIntensity(values[0])}
              min={0}
              max={10}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>None</span>
              <span>Mild</span>
              <span>Moderate</span>
              <span>Severe</span>
            </div>
          </div>

          {/* Optional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Describe what you're feeling... (e.g., tight, sharp, dull, tingling)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={200}
              rows={4}
              className="resize-none"
            />
            <div className="text-xs text-muted-foreground text-right">
              {notes.length}/200
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Add Sensation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
