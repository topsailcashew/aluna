'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { BELIEF_SUGGESTIONS } from '@/lib/types/life-messages';

interface BeliefInputProps {
  belief: string;
  onChange: (belief: string) => void;
}

/**
 * Belief input with "I am..." prefix and suggestions
 */
export function BeliefInput({ belief, onChange }: BeliefInputProps) {
  const insertSuggestion = (suggestion: string) => {
    onChange(suggestion);
  };

  return (
    <div className="space-y-4">
      {/* Label */}
      <Label htmlFor="belief-input" className="text-sm font-medium">
        What core belief does this reflect?
      </Label>

      {/* Input with prefix */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
          I am
        </span>
        <Input
          id="belief-input"
          type="text"
          placeholder="not good enough, unlovable, broken..."
          value={belief}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1"
          aria-describedby="belief-description"
        />
      </div>
      <p id="belief-description" className="text-xs text-muted-foreground">
        Complete the statement: "I am..."
      </p>

      {/* Suggestion Chips */}
      <div>
        <p className="text-xs text-muted-foreground mb-2">Suggestions (click to insert):</p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Belief suggestions">
          {BELIEF_SUGGESTIONS.map((suggestion) => {
            const isActive = belief === suggestion;
            return (
              <Button
                key={suggestion}
                type="button"
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                onClick={() => insertSuggestion(suggestion)}
                className="h-8 text-xs"
                aria-pressed={isActive}
                aria-label={`Insert: ${suggestion}`}
              >
                {suggestion}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
