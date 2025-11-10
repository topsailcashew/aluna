
"use client";

import React, { useState, useMemo } from "react";
import { emotionCategories } from "@/lib/data";
import { cn } from "@/lib/utils";

interface EmotionWheelProps {
  selectedEmotion: string; // This is now the Level 2 emotion
  onSelectEmotion: (emotion: string) => void;
}

const EmotionWheel = ({
  selectedEmotion,
  onSelectEmotion,
}: EmotionWheelProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const outerRadius = 250;
  const innerRadius = 150;
  const numSegments = emotionCategories.length;
  const angleStep = (2 * Math.PI) / numSegments;

  const subCategories = useMemo(() => 
    selectedCategory
      ? emotionCategories.find(c => c.name === selectedCategory)?.subCategories || []
      : [],
    [selectedCategory]
  );
  
  const subNumSegments = subCategories.length;
  const subAngleStep = subNumSegments > 0 ? (2 * Math.PI) / subNumSegments : 0;

  const getCoordinatesForAngle = (angle: number, radius: number) => [
    Math.cos(angle) * radius,
    Math.sin(angle) * radius,
  ];

  const handleCategorySelect = (categoryName: string) => {
    if (selectedCategory === categoryName) {
      // If clicking the same category, deselect everything
      setSelectedCategory(null);
      onSelectEmotion("");
    } else {
      setSelectedCategory(categoryName);
      // Clear the L2 emotion when a new L1 category is chosen
      onSelectEmotion("");
    }
  };

  const handleEmotionSelect = (emotionName: string) => {
    onSelectEmotion(emotionName);
  };
  
  const L1Category = emotionCategories.find(c => c.name === selectedCategory);
  const L2CategoryInfo = emotionCategories.find(c => c.subCategories.some(sc => sc.name === selectedEmotion));
  const displayCategory = L2CategoryInfo || L1Category;
  
  const displayText = selectedEmotion || selectedCategory || "Select";

  return (
    <div className="flex justify-center items-center p-4">
      <svg
        viewBox="-300 -300 600 600"
        className="w-full max-w-2xl"
        aria-label="Emotion Wheel"
      >
        <defs>
          <filter id="soft-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.1" />
          </filter>
        </defs>
        <g filter="url(#soft-shadow)">
          {/* Outer Wheel - Level 1 Categories */}
          {emotionCategories.map((category, i) => {
            const startAngle = i * angleStep - Math.PI / 2;
            const endAngle = (i + 1) * angleStep - Math.PI / 2;

            const [x1o, y1o] = getCoordinatesForAngle(startAngle, outerRadius);
            const [x2o, y2o] = getCoordinatesForAngle(endAngle, outerRadius);
            const [x1i, y1i] = getCoordinatesForAngle(startAngle, innerRadius);
            const [x2i, y2i] = getCoordinatesForAngle(endAngle, innerRadius);

            const largeArcFlag = angleStep > Math.PI ? 1 : 0;

            const pathData = `M ${x1i} ${y1i} L ${x1o} ${y1o} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2o} ${y2o} L ${x2i} ${y2i} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1i} ${y1i} Z`;
            
            const isSelected = selectedCategory === category.name;

            return (
              <g key={category.name}>
                <path
                  d={pathData}
                  fill={category.color}
                  className={cn(
                    "cursor-pointer transition-all duration-200 ease-in-out",
                     isSelected ? "opacity-100 scale-105" : "opacity-70 hover:opacity-100",
                    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
                  )}
                  transform={isSelected ? "scale(1.01)" : "scale(1)"}
                  onClick={() => handleCategorySelect(category.name)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleCategorySelect(category.name);
                    }
                  }}
                  tabIndex={0}
                  aria-label={`Select category: ${category.name}`}
                  role="button"
                />
                 <text
                    x={getCoordinatesForAngle(startAngle + angleStep / 2, (outerRadius + innerRadius) / 2)[0]}
                    y={getCoordinatesForAngle(startAngle + angleStep / 2, (outerRadius + innerRadius) / 2)[1]}
                    textAnchor="middle"
                    dy=".3em"
                    className="pointer-events-none fill-current text-sm font-semibold"
                    style={{ fill: 'white', opacity: 0.9 }}
                >
                    {category.name}
                </text>
              </g>
            );
          })}

           {/* Inner Wheel - Level 2 Emotions */}
           {selectedCategory && subCategories.map((subCategory, i) => {
              const startAngle = i * subAngleStep - Math.PI / 2;
              const endAngle = (i + 1) * subAngleStep - Math.PI / 2;

              const [x1, y1] = getCoordinatesForAngle(startAngle, innerRadius);
              const [x2, y2] = getCoordinatesForAngle(endAngle, innerRadius);

              const largeArcFlag = subAngleStep > Math.PI ? 1 : 0;

              const pathData = `M 0 0 L ${x1} ${y1} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
              
              const category = emotionCategories.find(c => c.name === selectedCategory);
              const isSelected = selectedEmotion === subCategory.name;

              return (
                <g key={subCategory.name}>
                  <path
                    d={pathData}
                    fill={category?.color}
                    className={cn(
                      "cursor-pointer transition-all duration-200 ease-in-out",
                      isSelected ? "opacity-100 scale-105 brightness-125" : "opacity-90 hover:opacity-100 hover:brightness-110",
                      "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
                    )}
                     transform={isSelected ? "scale(1.01)" : "scale(1)"}
                    onClick={() => handleEmotionSelect(subCategory.name)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        handleEmotionSelect(subCategory.name);
                      }
                    }}
                    tabIndex={0}
                    aria-label={`Select emotion: ${subCategory.name}`}
                    role="button"
                  />
                  <text
                    x={getCoordinatesForAngle(startAngle + subAngleStep / 2, innerRadius / 1.5)[0]}
                    y={getCoordinatesForAngle(startAngle + subAngleStep / 2, innerRadius / 1.5)[1]}
                    textAnchor="middle"
                    dy=".3em"
                    className="pointer-events-none fill-current text-xs font-medium"
                    style={{ fill: 'white', opacity: 0.9 }}
                  >
                    {subCategory.name}
                  </text>
                </g>
              );
           })}
        </g>
        <circle cx="0" cy="0" r="60" fill={displayCategory?.color || "hsl(var(--card))"} filter="url(#soft-shadow)" />
        <text
          x="0"
          y="0"
          textAnchor="middle"
          dy=".3em"
          className="text-lg font-bold"
          fill={displayCategory ? 'white' : 'hsl(var(--foreground))'}
        >
          {displayText}
        </text>
      </svg>
    </div>
  );
};

export { EmotionWheel };
