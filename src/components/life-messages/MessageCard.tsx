'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Trash2, GripVertical } from 'lucide-react';
import { LifeMessage, MoodTag } from '@/lib/types/life-messages';
import { cn } from '@/lib/utils';

const MOOD_TAGS: MoodTag[] = [
  '😔 Sad',
  '😰 Anxious',
  '😡 Angry',
  '😓 Overwhelmed',
  '😕 Confused',
  '😞 Disappointed',
  '😖 Frustrated',
  '🤐 Numb',
  '😌 Neutral',
];

interface MessageCardProps {
  message: LifeMessage;
  onUpdate: (updates: Partial<LifeMessage>) => void;
  onDelete: () => void;
  onSelect?: () => void;
  isSelected?: boolean;
  isDragging?: boolean;
  dragHandleProps?: any;
}

/**
 * Card for entering a single life message (negative self-talk)
 */
export function MessageCard({
  message,
  onUpdate,
  onDelete,
  onSelect,
  isSelected,
  isDragging,
  dragHandleProps,
}: MessageCardProps) {
  const characterCount = message.message?.length || 0;
  const maxChars = 250;
  const isOverLimit = characterCount > maxChars;

  return (
    <Card
      className={cn(
        'relative transition-all',
        isSelected && 'ring-2 ring-primary',
        isDragging && 'opacity-50 rotate-2'
      )}
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          {/* Drag Handle */}
          <button
            type="button"
            {...dragHandleProps}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded touch-none"
            aria-label="Drag to reorder message"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </button>

          {/* Delete Button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="h-8 w-8 p-0"
            aria-label="Delete this message"
          >
            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Source (Optional) */}
        <div className="space-y-2">
          <Label htmlFor={`source-${message.id}`} className="text-sm text-muted-foreground">
            Source (Optional)
          </Label>
          <Input
            id={`source-${message.id}`}
            type="text"
            placeholder="e.g., Work review, Family dinner..."
            value={message.source || ''}
            onChange={(e) => onUpdate({ source: e.target.value })}
            className="text-sm"
            aria-describedby={`source-desc-${message.id}`}
          />
          <p id={`source-desc-${message.id}`} className="sr-only">
            Optional: Where did this message come from?
          </p>
        </div>

        {/* Message Text */}
        <div className="space-y-2">
          <Label htmlFor={`message-${message.id}`} className="text-sm">
            Message <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id={`message-${message.id}`}
            placeholder="What did you tell yourself? What was the thought or message?"
            value={message.message || ''}
            onChange={(e) => onUpdate({ message: e.target.value })}
            className={cn(
              'min-h-[100px] resize-none text-sm',
              isOverLimit && 'border-destructive focus-visible:ring-destructive'
            )}
            aria-required="true"
            aria-invalid={isOverLimit}
            aria-describedby={`message-count-${message.id}`}
          />
          <p
            id={`message-count-${message.id}`}
            className={cn(
              'text-xs text-right transition-colors',
              isOverLimit ? 'text-destructive font-medium' : 'text-muted-foreground'
            )}
          >
            {characterCount} / {maxChars} characters
          </p>
        </div>

        {/* Mood Tag */}
        <div className="space-y-2">
          <Label htmlFor={`mood-${message.id}`} className="text-sm">
            Mood <span className="text-destructive">*</span>
          </Label>
          <Select
            value={message.moodTag}
            onValueChange={(value) => onUpdate({ moodTag: value as MoodTag })}
          >
            <SelectTrigger id={`mood-${message.id}`} aria-required="true">
              <SelectValue placeholder="How did you feel?" />
            </SelectTrigger>
            <SelectContent>
              {MOOD_TAGS.map((tag) => (
                <SelectItem key={tag} value={tag}>
                  {tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Confidence Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor={`confidence-${message.id}`} className="text-sm">
              How much did you believe this?
            </Label>
            <span className="text-sm font-medium tabular-nums">
              {message.confidence}%
            </span>
          </div>
          <Slider
            id={`confidence-${message.id}`}
            value={[message.confidence]}
            onValueChange={([value]) => onUpdate({ confidence: value })}
            min={0}
            max={100}
            step={5}
            className="w-full"
            aria-label={`Confidence level: ${message.confidence}%`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={message.confidence}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Not at all</span>
            <span>Completely</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
