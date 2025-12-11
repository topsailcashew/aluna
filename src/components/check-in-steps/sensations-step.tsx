/**
 * Sensations Step - Mobile Check-In
 *
 * Physical sensation tracking optimized for mobile.
 * Simple body part selection with intensity slider.
 */

'use client';

import * as React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { X, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { BODY_PARTS } from '@/lib/constants';

interface SensationsStepProps {
  form: UseFormReturn<any>;
}

export function SensationsStep({ form }: SensationsStepProps) {
  const [currentLocation, setCurrentLocation] = React.useState('');
  const [currentIntensity, setCurrentIntensity] = React.useState(5);

  const sensations = form.watch('sensations') || [];

  const addSensation = () => {
    if (!currentLocation) return;

    const newSensation = {
      id: `sensation-${Date.now()}`,
      location: currentLocation,
      intensity: currentIntensity,
      notes: '',
    };

    form.setValue('sensations', [...sensations, newSensation]);
    setCurrentLocation('');
    setCurrentIntensity(5);
  };

  const removeSensation = (id: string) => {
    form.setValue(
      'sensations',
      sensations.filter((s: any) => s.id !== id)
    );
  };

  return (
    <div className="flex flex-col h-full py-4 space-y-6">
      <p className="text-sm text-muted-foreground">
        Track any physical sensations you're experiencing. This is optional.
      </p>

      {/* Add Sensation Form */}
      <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
        <div className="space-y-2">
          <Label htmlFor="location">Body Location</Label>
          <Select value={currentLocation} onValueChange={setCurrentLocation}>
            <SelectTrigger id="location">
              <SelectValue placeholder="Select body part" />
            </SelectTrigger>
            <SelectContent>
              {BODY_PARTS.map((part) => (
                <SelectItem key={part} value={part}>
                  {part}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Intensity</Label>
            <span className="text-sm font-medium">{currentIntensity}/10</span>
          </div>
          <Slider
            value={[currentIntensity]}
            onValueChange={(value) => setCurrentIntensity(value[0])}
            min={0}
            max={10}
            step={1}
            className="py-4"
          />
        </div>

        <Button
          type="button"
          onClick={addSensation}
          disabled={!currentLocation}
          className="w-full"
          variant="secondary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Sensation
        </Button>
      </div>

      {/* List of Added Sensations */}
      {sensations.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">
            Added Sensations ({sensations.length})
          </Label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {sensations.map((sensation: any) => (
              <div
                key={sensation.id}
                className="flex items-center justify-between p-3 bg-background border rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium text-sm">{sensation.location}</p>
                  <p className="text-xs text-muted-foreground">
                    Intensity: {sensation.intensity}/10
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSensation(sensation.id)}
                  className="flex-none"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {sensations.length === 0 && (
        <div className="flex-1 flex items-center justify-center text-center text-sm text-muted-foreground">
          No sensations added yet.
          <br />
          You can skip this step if you're not experiencing any.
        </div>
      )}
    </div>
  );
}
