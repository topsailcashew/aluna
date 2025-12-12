/**
 * Emotions Step - Mobile Check-In
 *
 * Focused emotion selection optimized for mobile with modal workflow.
 * 1. User selects primary emotion from wheel (Level 1) - outer ring
 * 2. Level 2 emotions appear in inner ring
 * 3. User selects Level 2 emotion - modal opens automatically
 * 4. User selects Level 3 specific emotions in modal
 */

'use client';

import * as React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { EmotionWheelWrapper } from '../emotion-wheel-wrapper';
import { EmotionDetailsModal } from '../modals/emotion-details-modal';
import { FormField, FormItem, FormControl, FormMessage } from '../ui/form';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Edit2 } from 'lucide-react';
import { emotionCategories } from '@/lib/data';

interface EmotionsStepProps {
  form: UseFormReturn<any>;
}

export function EmotionsStep({ form }: EmotionsStepProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedLevel2Emotion, setSelectedLevel2Emotion] = React.useState<string>('');

  const currentLevel2Emotion = form.watch('emotion');
  const currentSpecificEmotions = form.watch('specificEmotions') || [];

  // Handle Level 2 emotion selection from wheel
  const handleLevel2EmotionSelect = (level2Emotion: string) => {
    if (level2Emotion) {
      // A Level 2 emotion was selected, open the modal
      setSelectedLevel2Emotion(level2Emotion);
      setIsModalOpen(true);
    }
  };

  // Handle saving from modal (Level 3 emotions)
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
        Select from the outer ring, then choose a specific feeling from the inner ring.
      </p>

      {/* Emotion Wheel - Shows Primary Emotions (Level 1) and Level 2 */}
      <div className="relative w-full max-w-[400px] mx-auto aspect-square mb-6">
        <FormField
          control={form.control}
          name="emotion"
          render={() => (
            <FormItem className="w-full h-full">
              <FormControl>
                <EmotionWheelWrapper
                  selectedEmotion={currentLevel2Emotion}
                  onSelectEmotion={handleLevel2EmotionSelect}
                />
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
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedLevel2Emotion(currentLevel2Emotion);
                setIsModalOpen(true);
              }}
              className="text-primary hover:text-primary rounded-full px-4 transition-all hover:scale-105"
            >
              <Edit2 className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </div>

          <div className="p-4 rounded-lg bg-muted/50 backdrop-blur-sm space-y-3 border-2 border-primary/20">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Feeling:</span>
              <Badge
                variant="secondary"
                className="rounded-full px-3 py-1 font-medium"
                style={{ backgroundColor: currentCategory?.color + '40', color: currentCategory?.color }}
              >
                {currentLevel2Emotion}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-2">
              {currentSpecificEmotions.map((emotion: string) => (
                <Badge key={emotion} variant="outline" className="text-xs rounded-full px-3 py-1">
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
        primaryEmotion={getPrimaryEmotionForLevel2(selectedLevel2Emotion)}
        onSave={handleModalSave}
        initialData={{
          level2Emotion: selectedLevel2Emotion,
          specificEmotions: currentSpecificEmotions,
        }}
      />
    </div>
  );
}
