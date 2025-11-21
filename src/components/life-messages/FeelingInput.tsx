'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';
import { FEELING_SUGGESTIONS } from '@/lib/types/life-messages';
import { cn } from '@/lib/utils';

interface FeelingInputProps {
  selectedFeelings: string[];
  onChange: (feelings: string[]) => void;
}

/**
 * Feeling selector with suggestion chips and custom input
 */
export function FeelingInput({ selectedFeelings, onChange }: FeelingInputProps) {
  const [customInput, setCustomInput] = useState('');

  const toggleFeeling = (feeling: string) => {
    if (selectedFeelings.includes(feeling)) {
      onChange(selectedFeelings.filter((f) => f !== feeling));
    } else {
      onChange([...selectedFeelings, feeling]);
    }
  };

  const addCustomFeeling = () => {
    const trimmed = customInput.trim();
    if (trimmed && !selectedFeelings.includes(trimmed)) {
      onChange([...selectedFeelings, trimmed]);
      setCustomInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomFeeling();
    }
  };

  const removeFeeling = (feeling: string) => {
    onChange(selectedFeelings.filter((f) => f !== feeling));
  };

  return (
    <div className="space-y-4">
      {/* Label */}
      <Label className="text-sm font-medium">
        What feelings came up with this message?
      </Label>

      {/* Selected Feelings */}
      {selectedFeelings.length > 0 && (
        <div className="flex flex-wrap gap-2" role="list" aria-label="Selected feelings">
          {selectedFeelings.map((feeling) => (
            <Badge
              key={feeling}
              variant="secondary"
              className="gap-1 pr-1"
              role="listitem"
            >
              <span>{feeling}</span>
              <button
                type="button"
                onClick={() => removeFeeling(feeling)}
                className={cn(
                  'rounded-sm hover:bg-muted-foreground/20 transition-colors',
                  'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
                )}
                aria-label={`Remove ${feeling}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Suggestion Chips */}
      <div>
        <p className="text-xs text-muted-foreground mb-2">Suggestions (click to add):</p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Feeling suggestions">
          {FEELING_SUGGESTIONS.map((feeling) => {
            const isSelected = selectedFeelings.includes(feeling);
            return (
              <Button
                key={feeling}
                type="button"
                variant={isSelected ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleFeeling(feeling)}
                className="h-8 text-xs"
                aria-pressed={isSelected}
                aria-label={`${feeling}${isSelected ? ' (selected)' : ''}`}
              >
                {feeling}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Custom Input */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Label htmlFor="custom-feeling" className="sr-only">
            Add custom feeling
          </Label>
          <Input
            id="custom-feeling"
            type="text"
            placeholder="Add your own feeling..."
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="text-sm"
          />
        </div>
        <Button
          type="button"
          onClick={addCustomFeeling}
          disabled={!customInput.trim()}
          size="sm"
          aria-label="Add custom feeling"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
