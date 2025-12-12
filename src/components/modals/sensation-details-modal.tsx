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
import { Plus, X } from 'lucide-react';

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

  // Get intensity color based on value
  const getIntensityColor = (value: number) => {
    if (value <= 3) return 'text-green-500';
    if (value <= 6) return 'text-yellow-500';
    if (value <= 8) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Sensation Details</DialogTitle>
          <DialogDescription>
            Describe the sensation you're feeling in your{' '}
            <Badge variant="secondary" className="mx-1 rounded-full px-3 py-1">
              {bodyPart}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Intensity Slider */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="intensity" className="text-base font-medium">Intensity</Label>
              <span className={`text-4xl font-bold transition-colors ${getIntensityColor(intensity)}`}>
                {intensity}
              </span>
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
            <Label htmlFor="notes" className="text-base font-medium">Notes (optional)</Label>
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

        {/* Action Buttons - Full Width with Icons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full py-6 text-base font-medium hover:scale-105 transition-all"
          >
            <X className="w-5 h-5 mr-2" />
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            className="w-full py-6 text-base font-medium shadow-[0_0_25px_rgba(var(--primary-rgb),0.6)] hover:shadow-[0_0_35px_rgba(var(--primary-rgb),0.8)] hover:scale-105 transition-all"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
