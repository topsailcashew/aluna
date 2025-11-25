'use client';

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { cn } from '@/lib/utils';

interface SwipeableCardContainerProps {
  children: React.ReactNode[];
  className?: string;
}

export function SwipeableCardContainer({
  children,
  className,
}: SwipeableCardContainerProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: false,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className={cn('flex flex-col h-full w-full', className)}>
      {/* Carousel viewport */}
      <div className="overflow-hidden flex-1 w-full" ref={emblaRef}>
        <div className="flex h-full">
          {React.Children.map(children, (child, index) => (
            <div
              key={index}
              className="flex-[0_0_100%] min-w-0 h-full overflow-y-auto overflow-x-hidden"
            >
              <div className="min-h-full w-full flex items-center justify-center p-4 pb-16">
                <div className="w-full max-w-7xl">
                  {child}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination dots */}
      {children.length > 1 && (
        <div className="flex items-center justify-center gap-2 py-3 bg-background/95 backdrop-blur-sm border-t z-50">
          {React.Children.map(children, (_, index) => (
            <button
              key={index}
              className={cn(
                'h-2 rounded-full transition-all',
                selectedIndex === index
                  ? 'w-8 bg-primary'
                  : 'w-2 bg-muted-foreground/40'
              )}
              onClick={() => emblaApi?.scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
