'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface InteractiveBodyMapProps {
  selectedPart: string;
  onPartSelect: (part: string) => void;
  className?: string;
}

// Body part coordinates and regions for SVG mapping
const bodyPartRegions = {
  // Head region
  Head: { cx: 200, cy: 50, rx: 35, ry: 40 },
  Face: { cx: 200, cy: 55, rx: 25, ry: 30 },
  Eyes: { cx: 200, cy: 45, rx: 20, ry: 8 },
  Ears: { points: [[165, 50], [235, 50]] }, // Left and right ear circles
  Nose: { cx: 200, cy: 60, rx: 8, ry: 12 },
  Mouth: { cx: 200, cy: 72, rx: 12, ry: 6 },
  Jaw: { cx: 200, cy: 82, rx: 28, ry: 18 },

  // Neck and torso
  Neck: { cx: 200, cy: 100, rx: 20, ry: 15 },
  Throat: { cx: 200, cy: 105, rx: 15, ry: 10 },
  Shoulders: { points: [[145, 120], [255, 120]] }, // Left and right shoulder circles
  Chest: { cx: 200, cy: 145, rx: 45, ry: 30 },
  'Upper Back': { cx: 200, cy: 135, rx: 40, ry: 25 },
  'Lower Back': { cx: 200, cy: 200, rx: 35, ry: 30 },
  Stomach: { cx: 200, cy: 180, rx: 40, ry: 25 },
  Abdomen: { cx: 200, cy: 210, rx: 38, ry: 20 },
  Hips: { cx: 200, cy: 235, rx: 50, ry: 20 },

  // Arms
  Arms: { points: [[120, 160], [280, 160]] }, // Left and right arm paths
  Elbows: { points: [[105, 195], [295, 195]] },
  Wrists: { points: [[95, 235], [305, 235]] },
  Hands: { points: [[90, 260], [310, 260]] },
  Fingers: { points: [[85, 280], [315, 280]] },

  // Legs
  Legs: { points: [[170, 280], [230, 280]] }, // Left and right leg paths
  Thighs: { points: [[170, 270], [230, 270]] },
  Knees: { points: [[165, 330], [235, 330]] },
  Ankles: { points: [[160, 390], [240, 390]] },
  Feet: { points: [[155, 415], [245, 415]] },
  Toes: { points: [[150, 430], [250, 430]] },
};

export function InteractiveBodyMap({
  selectedPart,
  onPartSelect,
  className
}: InteractiveBodyMapProps) {
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);

  const isSelected = (part: string) => selectedPart === part;
  const isHovered = (part: string) => hoveredPart === part;

  const getRegionColor = (part: string) => {
    if (isSelected(part)) return 'fill-primary';
    if (isHovered(part)) return 'fill-primary/40';
    return 'fill-muted hover:fill-muted-foreground/20';
  };

  const renderEllipse = (part: string, region: { cx: number; cy: number; rx: number; ry: number }) => (
    <ellipse
      key={part}
      cx={region.cx}
      cy={region.cy}
      rx={region.rx}
      ry={region.ry}
      className={cn(
        'cursor-pointer transition-all duration-200 stroke-border stroke-[1.5]',
        getRegionColor(part)
      )}
      onClick={() => onPartSelect(part)}
      onMouseEnter={() => setHoveredPart(part)}
      onMouseLeave={() => setHoveredPart(null)}
    >
      <title>{part}</title>
    </ellipse>
  );

  const renderCircles = (part: string, points: number[][]) => (
    <g key={part}>
      {points.map((point, idx) => (
        <circle
          key={`${part}-${idx}`}
          cx={point[0]}
          cy={point[1]}
          r={15}
          className={cn(
            'cursor-pointer transition-all duration-200 stroke-border stroke-[1.5]',
            getRegionColor(part)
          )}
          onClick={() => onPartSelect(part)}
          onMouseEnter={() => setHoveredPart(part)}
          onMouseLeave={() => setHoveredPart(null)}
        >
          <title>{part}</title>
        </circle>
      ))}
    </g>
  );

  const renderArmPath = (part: string, points: number[][]) => {
    const isLeft = points[0][0] < 200;
    const startX = points[0][0];
    const startY = points[0][1];

    // Create arm shape path
    const path = isLeft
      ? `M ${startX + 20} ${startY} Q ${startX} ${startY + 35}, ${startX + 10} ${startY + 75} L ${startX + 15} ${startY + 75} Q ${startX + 5} ${startY + 35}, ${startX + 25} ${startY} Z`
      : `M ${startX - 20} ${startY} Q ${startX} ${startY + 35}, ${startX - 10} ${startY + 75} L ${startX - 15} ${startY + 75} Q ${startX - 5} ${startY + 35}, ${startX - 25} ${startY} Z`;

    return (
      <path
        key={`${part}-${isLeft ? 'left' : 'right'}`}
        d={path}
        className={cn(
          'cursor-pointer transition-all duration-200 stroke-border stroke-[1.5]',
          getRegionColor(part)
        )}
        onClick={() => onPartSelect(part)}
        onMouseEnter={() => setHoveredPart(part)}
        onMouseLeave={() => setHoveredPart(null)}
      >
        <title>{part}</title>
      </path>
    );
  };

  const renderLegPath = (part: string, points: number[][]) => {
    const isLeft = points[0][0] < 200;
    const startX = points[0][0];
    const startY = points[0][1];

    // Create leg shape path
    const path = isLeft
      ? `M ${startX - 10} ${startY} L ${startX - 8} ${startY + 65} Q ${startX - 5} ${startY + 80}, ${startX} ${startY + 95} L ${startX + 5} ${startY + 95} Q ${startX + 2} ${startY + 80}, ${startX} ${startY + 65} L ${startX + 2} ${startY} Z`
      : `M ${startX + 10} ${startY} L ${startX + 8} ${startY + 65} Q ${startX + 5} ${startY + 80}, ${startX} ${startY + 95} L ${startX - 5} ${startY + 95} Q ${startX - 2} ${startY + 80}, ${startX} ${startY + 65} L ${startX - 2} ${startY} Z`;

    return (
      <path
        key={`${part}-${isLeft ? 'left' : 'right'}`}
        d={path}
        className={cn(
          'cursor-pointer transition-all duration-200 stroke-border stroke-[1.5]',
          getRegionColor(part)
        )}
        onClick={() => onPartSelect(part)}
        onMouseEnter={() => setHoveredPart(part)}
        onMouseLeave={() => setHoveredPart(null)}
      >
        <title>{part}</title>
      </path>
    );
  };

  return (
    <div className={cn('w-full flex flex-col items-center', className)}>
      <svg
        viewBox="0 0 400 460"
        className="w-full max-w-md"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background */}
        <rect width="400" height="460" fill="transparent" />

        {/* Render body parts */}
        {Object.entries(bodyPartRegions).map(([part, region]) => {
          if ('cx' in region) {
            return renderEllipse(part, region);
          } else if ('points' in region) {
            // Special rendering for arms and legs
            if (part === 'Arms') {
              return (
                <g key={part}>
                  {region.points.map((point) => renderArmPath(part, [point]))}
                </g>
              );
            } else if (part === 'Legs') {
              return (
                <g key={part}>
                  {region.points.map((point) => renderLegPath(part, [point]))}
                </g>
              );
            }
            return renderCircles(part, region.points);
          }
          return null;
        })}

        {/* Show label for selected/hovered part */}
        {(selectedPart || hoveredPart) && (
          <text
            x="200"
            y="450"
            textAnchor="middle"
            className="fill-foreground text-sm font-medium"
          >
            {selectedPart || hoveredPart}
          </text>
        )}
      </svg>

      {/* Instructions */}
      <p className="text-xs text-muted-foreground text-center mt-2">
        Click on a body part to select it
      </p>
    </div>
  );
}
