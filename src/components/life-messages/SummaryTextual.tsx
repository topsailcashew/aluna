'use client';

import { LifeMessage, Pattern } from '@/lib/types/life-messages';

interface SummaryTextualProps {
  messages: LifeMessage[];
  patterns: Pattern[];
}

/**
 * Accessible textual summary for screen readers
 * This is visually hidden but available to assistive technology
 */
export function SummaryTextual({ messages, patterns }: SummaryTextualProps) {
  // Extract unique beliefs
  const beliefs = Array.from(
    new Set(
      messages
        .map((m) => m.belief)
        .filter((b): b is string => b !== undefined && b.trim() !== '')
    )
  );

  return (
    <div className="sr-only" aria-live="polite" role="region" aria-label="Textual summary">
      <h2>Life Messages Exercise Summary</h2>

      {/* Messages Section */}
      <section>
        <h3>Your Messages ({messages.length})</h3>
        <ol>
          {messages.map((message, index) => (
            <li key={message.id}>
              <p>Message {index + 1}:</p>
              <p>{message.message}</p>
              {message.source && <p>Source: {message.source}</p>}
              <p>Mood: {message.moodTag}</p>
              <p>Confidence level: {message.confidence}%</p>
              {message.feelings && message.feelings.length > 0 && (
                <p>Associated feelings: {message.feelings.join(', ')}</p>
              )}
              {message.belief && <p>Core belief: I am {message.belief}</p>}
            </li>
          ))}
        </ol>
      </section>

      {/* Beliefs Section */}
      <section>
        <h3>Core Beliefs Identified ({beliefs.length})</h3>
        {beliefs.length > 0 ? (
          <ul>
            {beliefs.map((belief, index) => (
              <li key={index}>I am {belief}</li>
            ))}
          </ul>
        ) : (
          <p>No core beliefs have been identified yet.</p>
        )}
      </section>

      {/* Patterns Section */}
      <section>
        <h3>Behavioral Patterns ({patterns.length})</h3>
        {patterns.length > 0 ? (
          <ul>
            {patterns.map((pattern) => (
              <li key={pattern.id}>
                <p>{pattern.label}</p>
                {pattern.context && <p>Context: {pattern.context}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p>No patterns have been identified yet.</p>
        )}
      </section>

      {/* Connection Summary */}
      <section>
        <h3>Summary</h3>
        <p>
          You have identified {messages.length} message{messages.length !== 1 ? 's' : ''} that
          reflect {beliefs.length} core belief{beliefs.length !== 1 ? 's' : ''}, leading to{' '}
          {patterns.length} behavioral pattern{patterns.length !== 1 ? 's' : ''}.
        </p>
      </section>
    </div>
  );
}
