/**
 * Emotion Details Modal
 *
 * Modal that appears after selecting a primary emotion from the wheel,
 * allowing users to select deeper levels (Level 2 and Level 3 emotions).
 */

'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { emotionCategories } from '@/lib/data';
import { cn } from '@/lib/utils';

interface EmotionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  primaryEmotion: string; // Level 1 (e.g., "Happy")
  onSave: (data: { level2Emotion: string; specificEmotions: string[] }) => void;
  initialData?: {
    level2Emotion: string;
    specificEmotions: string[];
  };
}

export function EmotionDetailsModal({
  isOpen,
  onClose,
  primaryEmotion,
  onSave,
  initialData,
}: EmotionDetailsModalProps) {
  const [selectedLevel2, setSelectedLevel2] = React.useState<string>(
    initialData?.level2Emotion ?? ''
  );
  const [selectedSpecificEmotions, setSelectedSpecificEmotions] = React.useState<string[]>(
    initialData?.specificEmotions ?? []
  );

  // Get the emotion category data
  const category = emotionCategories.find((cat) => cat.name === primaryEmotion);

  // Reset when opened with new primary emotion
  React.useEffect(() => {
    if (isOpen) {
      setSelectedLevel2(initialData?.level2Emotion ?? '');
      setSelectedSpecificEmotions(initialData?.specificEmotions ?? []);
    }
  }, [isOpen, initialData]);

  // Get available specific emotions based on Level 2 selection
  const availableSpecificEmotions = React.useMemo(() => {
    if (!selectedLevel2 || !category) return [];
    const subCategory = category.subCategories.find((sub) => sub.name === selectedLevel2);
    return subCategory?.emotions ?? [];
  }, [selectedLevel2, category]);

  const toggleSpecificEmotion = (emotion: string) => {
    if (selectedSpecificEmotions.includes(emotion)) {
      setSelectedSpecificEmotions(selectedSpecificEmotions.filter((e) => e !== emotion));
    } else {
      setSelectedSpecificEmotions([...selectedSpecificEmotions, emotion]);
    }
  };

  const handleSave = () => {
    if (!selectedLevel2) return; // Require at least Level 2 selection

    onSave({
      level2Emotion: selectedLevel2,
      specificEmotions: selectedSpecificEmotions,
    });
    onClose();
  };

  const canSave = selectedLevel2 && selectedSpecificEmotions.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>How are you feeling?</DialogTitle>
          <DialogDescription>
            You selected{' '}
            <Badge
              variant="secondary"
              className="mx-1"
              style={{ backgroundColor: category?.color + '40', color: category?.color }}
            >
              {primaryEmotion}
            </Badge>
            . Let's get more specific.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Level 2 Emotions */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Select a specific feeling</h3>
            <div className="grid grid-cols-2 gap-2">
              {category?.subCategories.map((subCat) => (
                <Button
                  key={subCat.name}
                  type="button"
                  variant={selectedLevel2 === subCat.name ? 'default' : 'outline'}
                  onClick={() => {
                    setSelectedLevel2(subCat.name);
                    // Clear specific emotions when changing Level 2
                    setSelectedSpecificEmotions([]);
                  }}
                  className="h-auto py-3"
                >
                  {subCat.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Level 3 Emotions (Specific) */}
          {availableSpecificEmotions.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium">
                Select one or more emotions that describe how you feel
              </h3>
              <div className="flex flex-wrap gap-2">
                {availableSpecificEmotions.map((emotion) => {
                  const isSelected = selectedSpecificEmotions.includes(emotion);
                  return (
                    <Button
                      key={emotion}
                      type="button"
                      variant={isSelected ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleSpecificEmotion(emotion)}
                      className="rounded-full"
                    >
                      {emotion}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Selected Summary */}
          {selectedSpecificEmotions.length > 0 && (
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm font-medium mb-2">Your selections:</p>
              <div className="flex flex-wrap gap-2">
                {selectedSpecificEmotions.map((emotion) => (
                  <Badge key={emotion} variant="secondary">
                    {emotion}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={!canSave}>
            Save Emotions
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
