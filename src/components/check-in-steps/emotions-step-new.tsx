/**
 * Emotions Step - Mobile Check-In
 *
 * Focused emotion selection optimized for mobile with modal workflow.
 * 1. User selects primary emotion from wheel (Level 1)
 * 2. Modal opens for deeper emotion selection (Level 2 & 3)
 */

'use client';

import * as React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { EmotionWheelWrapper } from '../emotion-wheel-wrapper';
import { EmotionDetailsModal } from '../modals/emotion-details-modal';
import { FormField, FormItem, FormControl, FormMessage } from '../ui/form';
import { Badge } from '../ui/badge';
import { emotionCategories } from '@/lib/data';

interface EmotionsStepProps {
  form: UseFormReturn<any>;
}

export function EmotionsStep({ form }: EmotionsStepProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedPrimaryEmotion, setSelectedPrimaryEmotion] = React.useState<string>('');

  const currentLevel2Emotion = form.watch('emotion');
  const currentSpecificEmotions = form.watch('specificEmotions') || [];

  // Handle selection from emotion wheel (Level 1)
  const handlePrimaryEmotionSelect = (primaryEmotion: string) => {
    // Find the category to get the first Level 2 emotion
    const category = emotionCategories.find((cat) => cat.name === primaryEmotion);

    if (category && category.subCategories.length > 0) {
      setSelectedPrimaryEmotion(primaryEmotion);
      setIsModalOpen(true);
    }
  };

  // Handle saving from modal (Level 2 & 3)
  const handleModalSave = (data: { level2Emotion: string; specificEmotions: string[] }) => {
    form.setValue('emotion', data.level2Emotion, { shouldValidate: true });
    form.setValue('specificEmotions', data.specificEmotions, { shouldValidate: true });
  };

  // Get the primary emotion for the currently selected Level 2 emotion
  const getPrimaryEmotionForLevel2 = (level2: string): string => {
    for (const category of emotionCategories) {
      if (category.subCategories.some((sub) => sub.name === level2)) {
        return category.name;
      }
    }
    return '';
  };

  const currentPrimaryEmotion = currentLevel2Emotion
    ? getPrimaryEmotionForLevel2(currentLevel2Emotion)
    : '';

  const currentCategory = emotionCategories.find((cat) => cat.name === currentPrimaryEmotion);

  return (
    <div className="flex flex-col h-full py-4">
      <p className="text-sm text-muted-foreground mb-6">
        Tap on the emotion wheel to select how you're feeling.
      </p>

      {/* Emotion Wheel - Shows Primary Emotions (Level 1) */}
      <div className="relative w-full max-w-[400px] mx-auto aspect-square mb-6">
        <FormField
          control={form.control}
          name="emotion"
          render={() => (
            <FormItem className="w-full h-full">
              <FormControl>
                <div
                  onClick={() => {
                    // Open modal for currently selected emotion if any
                    if (currentPrimaryEmotion) {
                      setSelectedPrimaryEmotion(currentPrimaryEmotion);
                      setIsModalOpen(true);
                    }
                  }}
                >
                  <EmotionWheelWrapper
                    selectedEmotion={currentPrimaryEmotion}
                    onSelectEmotion={handlePrimaryEmotionSelect}
                  />
                </div>
              </FormControl>
              <FormMessage className="text-center mt-2" />
            </FormItem>
          )}
        />
      </div>

      {/* Selected Emotions Summary */}
      {currentLevel2Emotion && currentSpecificEmotions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Your emotions:</p>
            <button
              type="button"
              onClick={() => {
                setSelectedPrimaryEmotion(currentPrimaryEmotion);
                setIsModalOpen(true);
              }}
              className="text-sm text-primary hover:underline"
            >
              Edit
            </button>
          </div>

          <div className="p-4 rounded-lg bg-muted space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Feeling:</span>
              <Badge
                variant="secondary"
                style={{ backgroundColor: currentCategory?.color + '40', color: currentCategory?.color }}
              >
                {currentLevel2Emotion}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-2">
              {currentSpecificEmotions.map((emotion: string) => (
                <Badge key={emotion} variant="outline" className="text-xs">
                  {emotion}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Emotion Details Modal */}
      <EmotionDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        primaryEmotion={selectedPrimaryEmotion}
        onSave={handleModalSave}
        initialData={{
          level2Emotion: currentLevel2Emotion,
          specificEmotions: currentSpecificEmotions,
        }}
      />
    </div>
  );
}
