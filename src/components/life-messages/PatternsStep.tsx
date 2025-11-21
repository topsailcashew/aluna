'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { X, Plus } from 'lucide-react';
import { Pattern, PATTERN_SUGGESTIONS } from '@/lib/types/life-messages';
import { cn } from '@/lib/utils';

interface PatternsStepProps {
  patterns: Pattern[];
  onChange: (patterns: Pattern[]) => void;
}

/**
 * Step C: Identify patterns and coping behaviors
 */
export function PatternsStep({ patterns, onChange }: PatternsStepProps) {
  const [customLabel, setCustomLabel] = useState('');
  const [editingPattern, setEditingPattern] = useState<string | null>(null);
  const [contextInput, setContextInput] = useState('');

  const togglePredefinedPattern = (label: string) => {
    const exists = patterns.find((p) => p.label === label);
    if (exists) {
      // Remove pattern
      onChange(patterns.filter((p) => p.label !== label));
    } else {
      // Add pattern
      const newPattern: Pattern = {
        id: crypto.randomUUID(),
        label,
        isCustom: false,
        createdAt: new Date(),
      };
      onChange([...patterns, newPattern]);
    }
  };

  const addCustomPattern = () => {
    const trimmed = customLabel.trim();
    if (trimmed && !patterns.find((p) => p.label === trimmed)) {
      const newPattern: Pattern = {
        id: crypto.randomUUID(),
        label: trimmed,
        isCustom: true,
        createdAt: new Date(),
      };
      onChange([...patterns, newPattern]);
      setCustomLabel('');
    }
  };

  const removePattern = (id: string) => {
    onChange(patterns.filter((p) => p.id !== id));
  };

  const updatePatternContext = (id: string, context: string) => {
    onChange(
      patterns.map((p) => (p.id === id ? { ...p, context } : p))
    );
  };

  const saveContext = () => {
    if (editingPattern) {
      updatePatternContext(editingPattern, contextInput);
      setEditingPattern(null);
      setContextInput('');
    }
  };

  const startEditingContext = (pattern: Pattern) => {
    setEditingPattern(pattern.id);
    setContextInput(pattern.context || '');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addCustomPattern();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Identify Patterns</CardTitle>
          <CardDescription>
            What patterns or coping behaviors have emerged from these beliefs?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Predefined Pattern Suggestions */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Common patterns:</Label>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Pattern suggestions">
              {PATTERN_SUGGESTIONS.map((label) => {
                const isSelected = patterns.some((p) => p.label === label);
                return (
                  <Button
                    key={label}
                    type="button"
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => togglePredefinedPattern(label)}
                    className="h-8 text-xs"
                    aria-pressed={isSelected}
                  >
                    {label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Custom Pattern Input */}
          <div className="space-y-2">
            <Label htmlFor="custom-pattern" className="text-sm font-medium">
              Add custom pattern:
            </Label>
            <div className="flex gap-2">
              <Input
                id="custom-pattern"
                type="text"
                placeholder="e.g., Emotional eating, Procrastination..."
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                onKeyDown={handleKeyDown}
                className="text-sm"
              />
              <Button
                type="button"
                onClick={addCustomPattern}
                disabled={!customLabel.trim()}
                size="sm"
                aria-label="Add custom pattern"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Selected Patterns List */}
          {patterns.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Your patterns ({patterns.length}):</Label>
              <div className="space-y-2" role="list" aria-label="Selected patterns">
                {patterns.map((pattern) => (
                  <Card key={pattern.id} className="p-3" role="listitem">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={pattern.isCustom ? 'secondary' : 'default'}>
                            {pattern.label}
                          </Badge>
                          {pattern.isCustom && (
                            <span className="text-xs text-muted-foreground">(Custom)</span>
                          )}
                        </div>

                        {/* Context Field */}
                        {editingPattern === pattern.id ? (
                          <div className="space-y-2">
                            <Textarea
                              value={contextInput}
                              onChange={(e) => setContextInput(e.target.value)}
                              placeholder="Add context or notes about this pattern..."
                              className="min-h-[60px] text-sm"
                              aria-label={`Context for ${pattern.label}`}
                            />
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                size="sm"
                                onClick={saveContext}
                                className="h-7 text-xs"
                              >
                                Save
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingPattern(null);
                                  setContextInput('');
                                }}
                                className="h-7 text-xs"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {pattern.context && (
                              <p className="text-sm text-muted-foreground">{pattern.context}</p>
                            )}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditingContext(pattern)}
                              className="h-7 text-xs"
                            >
                              {pattern.context ? 'Edit context' : 'Add context'}
                            </Button>
                          </>
                        )}
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removePattern(pattern.id)}
                        className="h-8 w-8 p-0"
                        aria-label={`Remove ${pattern.label}`}
                      >
                        <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {patterns.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No patterns selected yet. Choose from suggestions above or add your own.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
