import { Timestamp } from 'firebase/firestore';

/**
 * Mood tags for life messages
 */
export type MoodTag =
  | '😔 Sad'
  | '😰 Anxious'
  | '😡 Angry'
  | '😓 Overwhelmed'
  | '😕 Confused'
  | '😞 Disappointed'
  | '😖 Frustrated'
  | '🤐 Numb'
  | '😌 Neutral';

/**
 * A single life message (negative self-talk instance)
 */
export interface LifeMessage {
  id: string;
  source?: string; // Optional: where did this message come from?
  message: string; // Max 250 characters
  moodTag: MoodTag;
  confidence: number; // 0-100 slider value
  order: number; // For drag-drop ordering
  createdAt: Date | Timestamp;

  // Step B associations
  feelings?: string[]; // Selected or custom feelings
  belief?: string; // Core belief ("I am...")
}

/**
 * Common feeling suggestions
 */
export const FEELING_SUGGESTIONS = [
  'Worthless',
  'Inadequate',
  'Rejected',
  'Unlovable',
  'Helpless',
  'Powerless',
  'Alone',
  'Trapped',
  'Ashamed',
  'Guilty',
  'Invisible',
  'Broken',
] as const;

/**
 * Common belief suggestions
 */
export const BELIEF_SUGGESTIONS = [
  'I am not good enough',
  'I am unlovable',
  'I am a failure',
  'I am worthless',
  'I am broken',
  'I am too much',
  'I am not enough',
  'I am powerless',
  'I am alone',
  'I am undeserving',
] as const;

/**
 * Pattern/coping behavior
 */
export interface Pattern {
  id: string;
  label: string;
  isCustom: boolean;
  context?: string; // Optional context note
  createdAt: Date | Timestamp;
}

/**
 * Predefined pattern suggestions
 */
export const PATTERN_SUGGESTIONS = [
  'Perfectionism',
  'People-pleasing',
  'Overworking',
  'Avoidance',
  'Self-isolation',
  'Negative self-talk',
  'Catastrophizing',
  'All-or-nothing thinking',
  'Comparison',
  'Self-sabotage',
  'Seeking external validation',
  'Rumination',
] as const;

/**
 * SMART goal for action planning (Step E)
 */
export interface MicroGoal {
  id: string;
  specific: string; // What will you do?
  measurable: string; // How will you know you did it?
  achievable: string; // What makes this realistic?
  relevant: string; // Why does this matter?
  timeBound: string; // By when?
  reminder?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'custom';
    customDays?: number;
  };
  completed: boolean;
  createdAt: Date | Timestamp;
  completedAt?: Date | Timestamp;
}

/**
 * Complete life messages session (journal entry)
 */
export interface LifeMessageSession {
  id: string;
  userId: string;
  title?: string; // Optional user-provided title

  // Step A: Messages
  messages: LifeMessage[];

  // Step B: Mapped in individual messages
  // Step C: Patterns
  patterns: Pattern[];

  // Step D: Summary synthesis
  summarySynthesis?: string;

  // Step E: Action planning
  microGoals: MicroGoal[];

  // AI insights (if enabled)
  aiInsights?: {
    synthesis: string;
    reflections: string[];
    experiments: string[];
    generatedAt: Date | Timestamp;
  };

  // Metadata
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  isDraft: boolean;
  isComplete: boolean;
  currentStep: 0 | 1 | 2 | 3 | 4; // 0=A, 1=B, 2=C, 3=D, 4=E

  // Sharing
  shareToken?: string;
  shareExpiresAt?: Date | Timestamp;
}

/**
 * AI reflection request payload
 */
export interface AIReflectRequest {
  messages: Array<{
    message: string;
    moodTag: MoodTag;
    feelings?: string[];
    belief?: string;
  }>;
  patterns: string[];
  sessionId: string; // For rate limiting, not stored
}

/**
 * AI reflection response
 */
export interface AIReflectResponse {
  crisis?: boolean;
  crisisMessage?: string;
  synthesis?: string;
  reflections?: string[];
  experiments?: string[];
}

/**
 * Share token document
 */
export interface ShareToken {
  token: string;
  sessionId: string;
  userId: string; // Owner (for cleanup, not shown)
  createdAt: Date | Timestamp;
  expiresAt: Date | Timestamp;
  viewCount: number;
}

/**
 * AI usage tracking (for rate limiting)
 */
export interface AIUsageLog {
  id: string;
  userId?: string; // Optional (may be anonymous)
  sessionId: string;
  timestamp: Date | Timestamp;
  endpoint: 'reflect';
  success: boolean;
  hadCrisis: boolean;
}

/**
 * Local storage draft structure
 */
export interface LocalDraft {
  sessionId: string;
  lastSaved: Date;
  data: Partial<LifeMessageSession>;
}
