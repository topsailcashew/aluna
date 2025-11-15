'use client';

import { useState } from 'react';
import { BodyComponent } from '@darshanpatel2608/human-body-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface InteractiveBodyMapProps {
  selectedPart: string;
  onPartSelect: (part: string) => void;
  onRegionSelect?: (regionId: string, parts: string[]) => void;
  className?: string;
}

// Map our detailed body parts to the package's 13 regions
export const bodyPartMapping: Record<string, string[]> = {
  head: ['Head', 'Face', 'Eyes', 'Ears', 'Nose', 'Mouth', 'Jaw', 'Neck', 'Throat'],
  chest: ['Chest', 'Upper Back', 'Shoulders'],
  stomach: ['Stomach', 'Abdomen', 'Lower Back'],
  left_shoulder: ['Left Shoulder'],
  right_shoulder: ['Right Shoulder'],
  left_arm: ['Left Arm', 'Left Elbow'],
  right_arm: ['Right Arm', 'Right Elbow'],
  left_hand: ['Left Wrist', 'Left Hand', 'Left Fingers'],
  right_hand: ['Right Wrist', 'Right Hand', 'Right Fingers'],
  left_leg_upper: ['Hips', 'Left Thigh'],
  right_leg_upper: ['Right Thigh'],
  left_leg_lower: ['Left Leg', 'Left Knee'],
  right_leg_lower: ['Right Leg', 'Right Knee'],
  left_foot: ['Left Ankle', 'Left Foot', 'Left Toes'],
  right_foot: ['Right Ankle', 'Right Foot', 'Right Toes'],
};

// Reverse mapping: our parts → package region
const partToRegion: Record<string, string> = {};
Object.entries(bodyPartMapping).forEach(([region, parts]) => {
  parts.forEach(part => {
    partToRegion[part.toLowerCase()] = region;
    partToRegion[part] = region;
  });
});

// Flatten all parts for selection
const allBodyParts = Object.values(bodyPartMapping).flat().sort();

export function InteractiveBodyMap({
  selectedPart,
  onPartSelect,
  onRegionSelect,
  className
}: InteractiveBodyMapProps) {
  // Determine which region should be highlighted
  const getBodyParams = () => {
    const params: any = {};

    // If a part is selected, highlight its region
    if (selectedPart) {
      const region = partToRegion[selectedPart];
      if (region) {
        params[region] = { selected: true };
      }
    }

    return params;
  };

  // Handle click on body region
  const handleRegionClick = (regionId: string) => {
    const partsForRegion = bodyPartMapping[regionId] || [];

    // If only one part, select it directly
    if (partsForRegion.length === 1) {
      onPartSelect(partsForRegion[0]);
    } else {
      // Notify parent about region selection for multi-part regions
      if (onRegionSelect) {
        onRegionSelect(regionId, partsForRegion);
      }
    }
  };

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      {/* Body Diagram */}
      <div className="relative p-6 rounded-2xl bg-gradient-to-br from-background to-muted/30 shadow-lg border-2 border-border/50">
        <BodyComponent
          partsInput={getBodyParams()}
          onClick={handleRegionClick}
          height="500px"
          width="250px"
        />
      </div>

      {/* Selected Part Display */}
      {selectedPart && (
        <div className="w-full">
          <Badge variant="default" className="w-full justify-center text-sm py-2">
            {selectedPart}
          </Badge>
        </div>
      )}

      {/* Instructions */}
      {!selectedPart && (
        <p className="text-xs text-muted-foreground text-center">
          Click on the body to select an area
        </p>
      )}
    </div>
  );
}
