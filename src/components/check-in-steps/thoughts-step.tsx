/**
 * Thoughts Step - Mobile Check-In
 *
 * Thought pattern identification optimized for mobile.
 * Simple checkbox list with clear labels.
 */

'use client';

import * as React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { thoughtPatterns } from '@/lib/data';

interface ThoughtsStepProps {
  form: UseFormReturn<any>;
}

export function ThoughtsStep({ form }: ThoughtsStepProps) {
  const selectedThoughts = form.watch('thoughts') || [];

  const toggleThought = (thoughtId: string) => {
    const current = selectedThoughts;
    if (current.includes(thoughtId)) {
      form.setValue(
        'thoughts',
        current.filter((id: string) => id !== thoughtId)
      );
    } else {
      form.setValue('thoughts', [...current, thoughtId]);
    }
  };

  return (
    <div className="flex flex-col h-full py-4">
      <p className="text-sm text-muted-foreground mb-6">
        Which thought patterns are you experiencing? Select all that apply. This step is optional.
      </p>

      <div className="space-y-4 overflow-y-auto flex-1">
        {thoughtPatterns.map((pattern) => (
          <div
            key={pattern.id}
            className="flex items-start space-x-3 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
            onClick={() => toggleThought(pattern.id)}
          >
            <Checkbox
              id={pattern.id}
              checked={selectedThoughts.includes(pattern.id)}
              onCheckedChange={() => toggleThought(pattern.id)}
              className="mt-1"
            />
            <div className="flex-1 space-y-1">
              <Label
                htmlFor={pattern.id}
                className="text-sm font-medium leading-none cursor-pointer"
              >
                {pattern.label}
              </Label>
              {pattern.description && (
                <p className="text-xs text-muted-foreground">
                  {pattern.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedThoughts.length > 0 && (
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <p className="text-xs text-muted-foreground mb-2">
            {selectedThoughts.length} pattern{selectedThoughts.length !== 1 ? 's' : ''} selected
          </p>
        </div>
      )}
    </div>
  );
}
