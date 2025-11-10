"use client";

import React from "react";
import { emotions } from "@/lib/data";
import { cn } from "@/lib/utils";

interface EmotionWheelProps {
  selectedEmotion: string;
  onSelectEmotion: (emotion: string) => void;
}

const EmotionWheel = ({
  selectedEmotion,
  onSelectEmotion,
}: EmotionWheelProps) => {
  const radius = 250;
  const numSegments = emotions.length;
  const angleStep = (2 * Math.PI) / numSegments;

  const getCoordinatesForAngle = (angle: number, radius: number) => [
    Math.cos(angle) * radius,
    Math.sin(angle) * radius,
  ];

  return (
    <div className="flex justify-center items-center p-4">
      <svg
        viewBox="-300 -300 600 600"
        className="w-full max-w-2xl"
        aria-label="Emotion Wheel"
      >
        <defs>
          {emotions.map((emotion, i) => (
            <path
              key={`text-path-${i}`}
              id={`text-path-${i}`}
              d={`
                M ${getCoordinatesForAngle(
                  i * angleStep - angleStep / 2,
                  radius - 20
                ).join(" ")}
                A ${radius - 20} ${radius - 20} 0 0 1 ${getCoordinatesForAngle(
                i * angleStep + angleStep / 2,
                radius - 20
              ).join(" ")}
              `}
            />
          ))}
        </defs>

        <g>
          {emotions.map((emotion, i) => {
            const startAngle = i * angleStep - Math.PI / 2;
            const endAngle = (i + 1) * angleStep - Math.PI / 2;

            const [x1, y1] = getCoordinatesForAngle(startAngle, radius);
            const [x2, y2] = getCoordinatesForAngle(endAngle, radius);

            const largeArcFlag = angleStep > Math.PI ? 1 : 0;

            const pathData = `M 0 0 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
            
            const isSelected = selectedEmotion === emotion.name;

            return (
              <g key={emotion.name}>
                <path
                  d={pathData}
                  fill={emotion.color}
                  stroke="hsl(var(--card))"
                  strokeWidth="2"
                  className={cn(
                    "cursor-pointer transition-all duration-200 ease-in-out",
                    isSelected
                      ? "opacity-100 scale-105"
                      : "opacity-70 hover:opacity-100",
                    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
                  )}
                  transform="scale(1.01)" // Prevents stroke clipping
                  onClick={() => onSelectEmotion(emotion.name)}
                  onKeyDown={(e) => {
                    if(e.key === "Enter" || e.key === " ") {
                      onSelectEmotion(emotion.name);
                    }
                  }}
                  tabIndex={0}
                  aria-label={`Select emotion: ${emotion.name}`}
                  role="button"
                />
                <text
                  dy="-5"
                  className="pointer-events-none fill-current text-xs font-semibold"
                  style={{ fill: 'white', opacity: 0.9 }}
                >
                  <textPath
                    href={`#text-path-${i}`}
                    startOffset="50%"
                    textAnchor="middle"
                  >
                    {emotion.name}
                  </textPath>
                </text>
              </g>
            );
          })}
        </g>
        <circle cx="0" cy="0" r="60" fill="hsl(var(--card))" />
        <text
          x="0"
          y="0"
          textAnchor="middle"
          dy=".3em"
          className="text-lg font-bold"
          fill="hsl(var(--foreground))"
        >
          {selectedEmotion || "Select"}
        </text>
      </svg>
    </div>
  );
};

export { EmotionWheel };
