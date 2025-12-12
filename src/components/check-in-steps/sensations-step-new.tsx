/**
 * Sensations Step - Mobile Check-In
 *
 * Interactive body map with modal workflow for adding sensations.
 * 1. User taps on body part in interactive map
 * 2. Modal opens for intensity and notes
 * 3. Sensation is added to the list
 */

'use client';

import * as React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { InteractiveBodyMap } from '../interactive-body-map-v2';
import { SensationDetailsModal } from '../modals/sensation-details-modal';
import { FormField, FormItem, FormControl, FormMessage } from '../ui/form';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { bodyPartMapping } from '../interactive-body-map-v2';

interface SensationsStepProps {
  form: UseFormReturn<any>;
}

export function SensationsStep({ form }: SensationsStepProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedBodyPart, setSelectedBodyPart] = React.useState<string>('');
  const [selectedRegionParts, setSelectedRegionParts] = React.useState<string[]>([]);
  const [showRegionSelector, setShowRegionSelector] = React.useState(false);

  const sensations = form.watch('sensations') || [];

  // Handle body part selection from the map
  const handleBodyPartSelect = (part: string) => {
    setSelectedBodyPart(part);
    setShowRegionSelector(false);
    setIsModalOpen(true);
  };

  // Handle region selection (when multiple parts in a region)
  const handleRegionSelect = (regionId: string, parts: string[]) => {
    setSelectedRegionParts(parts);
    setShowRegionSelector(true);
  };

  // Handle selecting specific part from region
  const handleRegionPartSelect = (part: string) => {
    setSelectedBodyPart(part);
    setShowRegionSelector(false);
    setIsModalOpen(true);
  };

  // Handle saving sensation from modal
  const handleSaveSensation = (data: { location: string; intensity: number; notes: string }) => {
    const newSensation = {
      id: `sensation-${Date.now()}`,
      location: data.location,
      intensity: data.intensity,
      notes: data.notes,
    };

    const currentSensations = form.getValues('sensations') || [];
    form.setValue('sensations', [...currentSensations, newSensation], { shouldValidate: true });

    setSelectedBodyPart('');
  };

  // Remove a sensation
  const removeSensation = (id: string) => {
    const updated = sensations.filter((s: any) => s.id !== id);
    form.setValue('sensations', updated, { shouldValidate: true });
  };

  return (
    <div className="flex flex-col h-full py-4">
      <p className="text-sm text-muted-foreground mb-4">
        Tap on your body where you feel physical sensations.
      </p>

      {/* Interactive Body Map */}
      <div className="flex-1 flex flex-col items-center justify-start overflow-y-auto">
        <FormField
          control={form.control}
          name="sensations"
          render={() => (
            <FormItem className="w-full">
              <FormControl>
                <InteractiveBodyMap
                  selectedPart={selectedBodyPart}
                  onPartSelect={handleBodyPartSelect}
                  onRegionSelect={handleRegionSelect}
                  className="mb-4"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Added Sensations List */}
        {sensations.length > 0 && (
          <div className="w-full mt-4 space-y-2">
            <p className="text-sm font-medium">Sensations you're tracking:</p>
            <div className="space-y-2">
              {sensations.map((sensation: any) => (
                <div
                  key={sensation.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{sensation.location}</Badge>
                      <span className="text-sm font-medium">Intensity: {sensation.intensity}/10</span>
                    </div>
                    {sensation.notes && (
                      <p className="text-xs text-muted-foreground mt-1">{sensation.notes}</p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSensation(sensation.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Region Part Selector (for multi-part regions) */}
      {showRegionSelector && selectedRegionParts.length > 0 && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background border rounded-lg p-6 max-w-md w-full space-y-4">
            <h3 className="text-lg font-semibold">Select specific body part</h3>
            <div className="grid grid-cols-2 gap-2">
              {selectedRegionParts.map((part) => (
                <Button
                  key={part}
                  type="button"
                  variant="outline"
                  onClick={() => handleRegionPartSelect(part)}
                  className="h-auto py-3"
                >
                  {part}
                </Button>
              ))}
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowRegionSelector(false)}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Sensation Details Modal */}
      <SensationDetailsModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedBodyPart('');
        }}
        bodyPart={selectedBodyPart}
        onSave={handleSaveSensation}
      />
    </div>
  );
}
