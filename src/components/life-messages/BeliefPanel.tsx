'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { FeelingInput } from './FeelingInput';
import { BeliefInput } from './BeliefInput';
import { LifeMessage } from '@/lib/types/life-messages';
import { cn } from '@/lib/utils';

interface BeliefPanelProps {
  message: LifeMessage;
  onUpdate: (updates: Partial<LifeMessage>) => void;
  onClose: () => void;
  isOpen: boolean;
}

/**
 * Right-side panel for mapping feelings and beliefs to a message
 */
export function BeliefPanel({ message, onUpdate, onClose, isOpen }: BeliefPanelProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        className={cn(
          'fixed right-0 top-0 h-full w-full sm:w-[400px] bg-background border-l z-50',
          'transform transition-transform duration-300 ease-in-out',
          'overflow-y-auto',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        role="complementary"
        aria-label="Belief mapping panel"
      >
        <Card className="h-full border-0 rounded-none">
          <CardHeader className="sticky top-0 bg-background z-10 border-b">
            <div className="flex items-start justify-between">
              <div className="flex-1 pr-8">
                <CardTitle className="text-lg">Map to Belief</CardTitle>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {message.message || 'No message text'}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 -mt-1"
                aria-label="Close belief panel"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 p-6">
            {/* Mood Tag Display */}
            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs text-muted-foreground mb-1">Mood</p>
              <p className="text-sm font-medium">{message.moodTag}</p>
            </div>

            {/* Confidence Display */}
            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs text-muted-foreground mb-1">Belief Strength</p>
              <p className="text-sm font-medium">{message.confidence}%</p>
            </div>

            {/* Feelings Input */}
            <FeelingInput
              selectedFeelings={message.feelings || []}
              onChange={(feelings) => onUpdate({ feelings })}
            />

            {/* Belief Input */}
            <BeliefInput
              belief={message.belief || ''}
              onChange={(belief) => onUpdate({ belief })}
            />

            {/* Help Text */}
            <div className="rounded-lg bg-muted p-4 mt-6">
              <h4 className="text-sm font-semibold mb-2">How to use this</h4>
              <ul className="text-xs text-muted-foreground space-y-2">
                <li>• Identify the feelings this message triggered</li>
                <li>• Look for the deeper belief underneath</li>
                <li>• Core beliefs often start with "I am..."</li>
                <li>• Be gentle with yourself in this process</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </aside>
    </>
  );
}
