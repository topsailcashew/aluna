/**
 * Emotions Step - Mobile Check-In
 *
 * Focused emotion selection optimized for mobile.
 * Shows emotion wheel for primary and specific emotions.
 */

'use client';

import * as React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { EmotionWheelWrapper } from '../emotion-wheel-wrapper';
import { FormField, FormItem, FormMessage } from '../ui/form';

interface EmotionsStepProps {
  form: UseFormReturn<any>;
}

export function EmotionsStep({ form }: EmotionsStepProps) {
  return (
    <div className="flex flex-col h-full py-4">
      <p className="text-sm text-muted-foreground mb-6">
        Select how you're feeling right now. Choose one or more emotions.
      </p>

      <FormField
        control={form.control}
        name="emotion"
        render={({ field }) => (
          <FormItem className="flex-1">
            <EmotionWheelWrapper
              value={field.value}
              onChange={field.onChange}
              specificEmotions={form.watch('specificEmotions')}
              onSpecificEmotionsChange={(emotions) =>
                form.setValue('specificEmotions', emotions)
              }
            />
            <FormMessage />
          </FormItem>
        )}
      />

      {form.watch('specificEmotions')?.length > 0 && (
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <p className="text-xs text-muted-foreground mb-2">Selected emotions:</p>
          <div className="flex flex-wrap gap-2">
            {form.watch('specificEmotions').map((emotion: string) => (
              <span
                key={emotion}
                className="text-xs px-2 py-1 bg-background rounded-md"
              >
                {emotion}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
