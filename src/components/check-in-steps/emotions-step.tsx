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
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '../ui/form';
import { Button } from '../ui/button';
import { emotionCategories } from '@/lib/data';

interface EmotionsStepProps {
  form: UseFormReturn<any>;
}

export function EmotionsStep({ form }: EmotionsStepProps) {
  const selectedLevel2Emotion = form.watch('emotion');

  // Get specific emotions (Level 3) for the selected Level 2 emotion
  const specificEmotionsOptions = React.useMemo(() => {
    if (!selectedLevel2Emotion) return [];
    for (const category of emotionCategories) {
      const subCategory = category.subCategories.find(
        (sub) => sub.name === selectedLevel2Emotion
      );
      if (subCategory) {
        return subCategory.emotions;
      }
    }
    return [];
  }, [selectedLevel2Emotion]);

  return (
    <div className="flex flex-col h-full py-4">
      <p className="text-sm text-muted-foreground mb-6">
        Select how you're feeling right now. Choose one or more emotions.
      </p>

      {/* Emotion Wheel */}
      <div className="relative w-full max-w-[400px] mx-auto aspect-square mb-6">
        <FormField
          control={form.control}
          name="emotion"
          render={({ field }) => (
            <FormItem className="w-full h-full">
              <FormControl>
                <EmotionWheelWrapper
                  selectedEmotion={field.value}
                  onSelectEmotion={field.onChange}
                />
              </FormControl>
              <FormMessage className="text-center mt-2" />
            </FormItem>
          )}
        />
      </div>

      {/* Specific Emotions (Level 3) */}
      {specificEmotionsOptions.length > 0 && (
        <FormField
          control={form.control}
          name="specificEmotions"
          render={() => (
            <FormItem>
              <FormLabel className="text-sm font-medium">
                Specific feelings:
              </FormLabel>
              <div className="flex flex-wrap gap-2">
                {specificEmotionsOptions.map((emotion) => (
                  <FormField
                    key={emotion}
                    control={form.control}
                    name="specificEmotions"
                    render={({ field }) => {
                      const isSelected = field.value?.includes(emotion);
                      return (
                        <FormItem key={emotion} className="p-0">
                          <FormControl>
                            <Button
                              type="button"
                              variant={isSelected ? 'default' : 'outline'}
                              size="sm"
                              className="rounded-full px-3"
                              onClick={() => {
                                const current = field.value || [];
                                if (isSelected) {
                                  field.onChange(
                                    current.filter((e: string) => e !== emotion)
                                  );
                                } else {
                                  field.onChange([...current, emotion]);
                                }
                              }}
                            >
                              {emotion}
                            </Button>
                          </FormControl>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}
