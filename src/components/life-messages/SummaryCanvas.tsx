'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ArrowDown } from 'lucide-react';
import { LifeMessage, Pattern } from '@/lib/types/life-messages';
import { cn } from '@/lib/utils';

interface SummaryCanvasProps {
  messages: LifeMessage[];
  patterns: Pattern[];
}

/**
 * Visual summary canvas showing the flow:
 * Messages → Core Beliefs → Patterns
 */
export function SummaryCanvas({ messages, patterns }: SummaryCanvasProps) {
  // Extract unique beliefs from messages
  const beliefs = Array.from(
    new Set(
      messages
        .map((m) => m.belief)
        .filter((b): b is string => b !== undefined && b.trim() !== '')
    )
  );

  return (
    <div className="space-y-8" id="summary-canvas">
      {/* Messages Row */}
      <section aria-labelledby="messages-section">
        <h3 id="messages-section" className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wide">
          Your Messages
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {messages.map((message) => (
            <Card key={message.id} className="p-4 bg-muted/50">
              <div className="space-y-2">
                <Badge variant="outline" className="text-xs">
                  {message.moodTag}
                </Badge>
                <p className="text-sm line-clamp-3">{message.message}</p>
                {message.source && (
                  <p className="text-xs text-muted-foreground italic">— {message.source}</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Arrow Down */}
      <div className="flex justify-center" aria-hidden="true">
        <ArrowDown className="h-8 w-8 text-muted-foreground" />
      </div>

      {/* Core Beliefs */}
      <section aria-labelledby="beliefs-section">
        <h3 id="beliefs-section" className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wide">
          Core Beliefs
        </h3>
        <div className="flex flex-wrap justify-center gap-4">
          {beliefs.length > 0 ? (
            beliefs.map((belief, index) => (
              <div
                key={index}
                className={cn(
                  'relative px-8 py-6 rounded-full border-2 border-primary',
                  'bg-primary/5 min-w-[200px] text-center'
                )}
              >
                <p className="font-medium">I am {belief}</p>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <p className="text-sm">No core beliefs identified yet</p>
            </div>
          )}
        </div>
      </section>

      {/* Arrow Down */}
      <div className="flex justify-center" aria-hidden="true">
        <ArrowDown className="h-8 w-8 text-muted-foreground" />
      </div>

      {/* Patterns */}
      <section aria-labelledby="patterns-section">
        <h3 id="patterns-section" className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wide">
          Resulting Patterns
        </h3>
        {patterns.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {patterns.map((pattern) => (
              <Card key={pattern.id} className="p-4 bg-accent/50">
                <div className="space-y-2">
                  <Badge variant="secondary">{pattern.label}</Badge>
                  {pattern.context && (
                    <p className="text-sm text-muted-foreground">{pattern.context}</p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-sm">No patterns identified yet</p>
          </div>
        )}
      </section>

      {/* Print Stylesheet Hook */}
      <style jsx global>{`
        @media print {
          #summary-canvas {
            page-break-inside: avoid;
          }

          #summary-canvas section {
            page-break-inside: avoid;
            margin-bottom: 2rem;
          }
        }
      `}</style>
    </div>
  );
}
