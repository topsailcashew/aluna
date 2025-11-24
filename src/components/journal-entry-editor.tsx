
"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BookOpen, Lightbulb } from "lucide-react";

interface JournalEntryEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  minChars?: number;
  maxChars?: number;
  prompts?: string[];
}

const DEFAULT_PROMPTS = [
  "What am I grateful for today?",
  "What could I have done differently?",
  "What did I learn about myself?",
  "What do I need right now?",
  "What patterns am I noticing?",
  "How can I show myself compassion?",
];

/**
 * Journal Entry Editor - Step 5 of Check-in Form
 * Free-form text area for reflective writing
 * Includes character count, optional prompts, and word suggestions
 */
export function JournalEntryEditor({
  value,
  onChange,
  className,
  minChars = 0,
  maxChars = 2000,
  prompts = DEFAULT_PROMPTS,
}: JournalEntryEditorProps) {
  const [showPrompts, setShowPrompts] = useState(false);

  const charCount = value.length;
  const wordCount = value.trim().split(/\s+/).filter(Boolean).length;
  const isNearLimit = charCount > maxChars * 0.9;
  const isOverLimit = charCount > maxChars;

  const handlePromptClick = (prompt: string) => {
    // If empty, use prompt as starter
    // If has content, append prompt on new line
    const newValue = value.trim()
      ? `${value}\n\n${prompt}\n`
      : `${prompt}\n`;
    onChange(newValue);
    setShowPrompts(false);
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="p-4 sm:p-6 w-full max-w-3xl mx-auto">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-2xl font-semibold">Journal Entry</h2>
              <Badge variant="outline" className="text-xs">
                Optional
              </Badge>
            </div>
            <button
              type="button"
              onClick={() => setShowPrompts(!showPrompts)}
              className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
            >
              <Lightbulb className="h-4 w-4" />
              {showPrompts ? "Hide" : "Show"} Prompts
            </button>
          </div>
          <p className="text-muted-foreground">
            Take a moment to reflect on your experience. What's on your mind?
          </p>
        </div>

        {showPrompts && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-base">Writing Prompts</CardTitle>
              <CardDescription>
                Click a prompt to add it to your journal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {prompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePromptClick(prompt)}
                    className="text-left p-3 text-sm rounded-lg border border-border hover:border-primary hover:bg-accent transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex-1 flex flex-col p-4 sm:p-6 pt-0">
        <Label htmlFor="journal-entry" className="sr-only">
          Journal entry
        </Label>
        <Textarea
          id="journal-entry"
          value={value}
          onChange={(e) => {
            // Enforce max character limit
            if (e.target.value.length <= maxChars) {
              onChange(e.target.value);
            }
          }}
          placeholder="Write freely here... This is your space to explore your thoughts, feelings, and insights. There are no rules - just let your thoughts flow."
          className={cn(
            "flex-1 w-full max-w-3xl mx-auto resize-none text-base leading-relaxed p-6 rounded-lg border-none bg-background/50 focus-visible:ring-0 focus-visible:ring-offset-0",
            isOverLimit && "border-destructive focus-visible:ring-destructive"
          )}
        />
      </div>
      
      <div className="p-4 sm:p-6 pt-2 w-full max-w-3xl mx-auto">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>
              {wordCount} {wordCount === 1 ? "word" : "words"}
            </span>
            {minChars > 0 && charCount < minChars && (
              <span className="text-yellow-600">
                {minChars - charCount} more characters recommended
              </span>
            )}
          </div>
          <span
            className={cn(
              isNearLimit && !isOverLimit && "text-yellow-600",
              isOverLimit && "text-destructive font-medium"
            )}
          >
            {charCount} / {maxChars} characters
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Journal Entry Preview
 * Displays journal entry in a read-only format
 */
export function JournalEntryPreview({
  content,
  timestamp,
}: {
  content: string;
  timestamp?: Date;
}) {
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Journal Entry
          </CardTitle>
          {timestamp && (
            <span className="text-xs text-muted-foreground">
              {timestamp.toLocaleString()}
            </span>
          )}
        </div>
        <CardDescription>{wordCount} words</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm max-w-none">
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {content}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
