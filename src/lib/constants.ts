/**
 * Application-wide constants
 *
 * Centralized location for magic numbers, strings, and configuration values
 * to improve maintainability and prevent typos.
 */

// ============================================================================
// VALIDATION LIMITS
// ============================================================================

export const VALIDATION_LIMITS = {
  /** Maximum characters for sensation notes */
  SENSATION_NOTES_MAX: 200,
  /** Maximum characters for journal entries */
  JOURNAL_ENTRY_MAX: 2000,
  /** Minimum intensity value for sensations */
  INTENSITY_MIN: 0,
  /** Maximum intensity value for sensations */
  INTENSITY_MAX: 10,
  /** Minimum password length */
  PASSWORD_MIN_LENGTH: 6,
  /** Minimum emotions that must be selected */
  MIN_EMOTIONS: 1,
  /** Maximum photo uploads per entry */
  MAX_PHOTOS_PER_ENTRY: 5,
  /** Maximum voice note duration in seconds */
  MAX_VOICE_NOTE_DURATION: 300, // 5 minutes
} as const;

// ============================================================================
// DEFAULT VALUES
// ============================================================================

export const DEFAULT_VALUES = {
  /** Default user ID for guest/unauthenticated users */
  GUEST_USER_ID: 'guest',
  /** Default intensity for new sensations */
  DEFAULT_INTENSITY: 5,
  /** Current check-in data version */
  CHECKIN_VERSION: 1,
  /** Default pagination limit */
  DEFAULT_PAGE_SIZE: 100,
  /** Default emotion category color */
  DEFAULT_EMOTION_COLOR: '#94a3b8', // slate-400
} as const;

// ============================================================================
// TIME CONSTANTS
// ============================================================================

export const TIME_CONSTANTS = {
  /** Milliseconds in one hour */
  ONE_HOUR_MS: 3600000,
  /** Milliseconds in one day */
  ONE_DAY_MS: 86400000,
  /** Milliseconds in one week */
  ONE_WEEK_MS: 604800000,
  /** Seconds before auto-save triggers */
  AUTO_SAVE_DELAY_MS: 10000, // 10 seconds
  /** Session timeout in minutes */
  SESSION_TIMEOUT_MINUTES: 60,
  /** Token refresh interval in minutes */
  TOKEN_REFRESH_INTERVAL_MINUTES: 50,
} as const;

// ============================================================================
// FIRESTORE COLLECTION NAMES
// ============================================================================

export const COLLECTIONS = {
  /** User documents */
  USERS: 'users',
  /** Wellness entries subcollection */
  WELLNESS_ENTRIES: 'wellnessEntries',
  /** Life Messages sessions subcollection */
  LIFE_MESSAGE_SESSIONS: 'lifeMessageSessions',
  /** Goals subcollection */
  GOALS: 'goals',
  /** AI-generated insights subcollection */
  INSIGHTS: 'insights',
  /** Therapist access grants subcollection */
  THERAPIST_ACCESS: 'therapistAccess',
  /** Shared reports subcollection */
  SHARED_REPORTS: 'sharedReports',
  /** User profile singleton */
  PROFILE: 'profile',
  /** AI usage tracking collection */
  AI_USAGE: 'aiUsage',
  /** Therapists collection */
  THERAPISTS: 'therapists',
} as const;

// ============================================================================
// API ENDPOINTS
// ============================================================================

export const API_ENDPOINTS = {
  /** AI insights generation */
  AI_INSIGHTS: '/api/ai/insights',
  /** AI pattern recognition */
  AI_PATTERNS: '/api/ai/patterns',
  /** AI coping suggestions */
  AI_COPING: '/api/ai/coping',
  /** AI reflection prompts */
  AI_REFLECT: '/api/ai/reflect',
  /** Life Messages sessions */
  LIFE_MESSAGES: '/api/lifemessages',
  /** Health check endpoint */
  HEALTH: '/api/health',
} as const;

// ============================================================================
// RATE LIMIT CONFIGURATION
// ============================================================================

export const RATE_LIMITS = {
  AI_REFLECT: { limit: 10, windowMs: 3600000 }, // 10 per hour
  AI_COPING: { limit: 20, windowMs: 3600000 }, // 20 per hour
  AI_INSIGHTS: { limit: 5, windowMs: 3600000 }, // 5 per hour
  AI_PATTERNS: { limit: 10, windowMs: 3600000 }, // 10 per hour
  LIFE_MESSAGES: { limit: 30, windowMs: 3600000 }, // 30 per hour
} as const;

// ============================================================================
// UI CONSTANTS
// ============================================================================

export const UI_CONSTANTS = {
  /** Toast notification duration in milliseconds */
  TOAST_DURATION: 5000,
  /** Animation duration for transitions */
  ANIMATION_DURATION: 300,
  /** Debounce delay for search inputs */
  SEARCH_DEBOUNCE_MS: 300,
  /** Number of recent entries to show */
  RECENT_ENTRIES_COUNT: 5,
  /** Maximum items in dropdown */
  MAX_DROPDOWN_ITEMS: 50,
  /** Mobile breakpoint in pixels */
  MOBILE_BREAKPOINT: 768,
  /** Tablet breakpoint in pixels */
  TABLET_BREAKPOINT: 1024,
} as const;

// ============================================================================
// EMOTION CATEGORIES
// ============================================================================

export const EMOTION_COLORS = {
  Happy: '#f97316', // orange-500
  Sad: '#ec4899', // pink-500
  Disgusted: '#a855f7', // purple-500
  Angry: '#14b8a6', // teal-500
  Fearful: '#06b6d4', // cyan-500
  Surprised: '#eab308', // yellow-500
} as const;

// ============================================================================
// FORM STEP IDS
// ============================================================================

export const CHECK_IN_STEPS = {
  FEEL: 'feel',
  REFLECT: 'reflect',
  UNDERSTAND: 'understand',
} as const;

export const LIFE_MESSAGES_STEPS = {
  FEELINGS: 'feelings',
  BELIEFS: 'beliefs',
  PATTERNS: 'patterns',
  GOALS: 'goals',
  SUMMARY: 'summary',
} as const;

// ============================================================================
// ERROR MESSAGES
// ============================================================================

export const ERROR_MESSAGES = {
  AUTH_REQUIRED: 'Please log in to continue',
  AUTH_FAILED: 'Authentication failed. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later.',
  INVALID_INPUT: 'Please check your input and try again.',
  SERVER_ERROR: 'An error occurred. Please try again.',
  NOT_FOUND: 'The requested resource was not found.',
  PERMISSION_DENIED: 'You do not have permission to perform this action.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
} as const;

// ============================================================================
// SUCCESS MESSAGES
// ============================================================================

export const SUCCESS_MESSAGES = {
  CHECK_IN_SAVED: 'Your wellness check-in has been logged successfully.',
  ACCOUNT_CREATED: 'Your account has been created successfully.',
  LOGIN_SUCCESS: 'Welcome back!',
  LOGOUT_SUCCESS: 'You have been logged out successfully.',
  SETTINGS_SAVED: 'Your settings have been saved.',
  SESSION_SAVED: 'Your session has been saved.',
} as const;

// ============================================================================
// STORAGE KEYS (for localStorage/sessionStorage)
// ============================================================================

export const STORAGE_KEYS = {
  THEME: 'aluna-theme',
  DRAFT_CHECK_IN: 'aluna-draft-checkin',
  DRAFT_LIFE_MESSAGE: 'aluna-draft-life-message',
  LAST_VISIT: 'aluna-last-visit',
  ONBOARDING_COMPLETED: 'aluna-onboarding',
} as const;

// ============================================================================
// FEATURE FLAGS
// ============================================================================

export const FEATURES = {
  VOICE_NOTES: process.env.NEXT_PUBLIC_ENABLE_VOICE_NOTES === 'true',
  PHOTO_UPLOADS: process.env.NEXT_PUBLIC_ENABLE_PHOTO_UPLOADS === 'true',
  OFFLINE_MODE: process.env.NEXT_PUBLIC_ENABLE_OFFLINE_MODE === 'true',
  AI_INSIGHTS: true, // Always enabled
  LIFE_MESSAGES: true, // Always enabled
} as const;

// ============================================================================
// BODY PARTS (for sensation tracking)
// ============================================================================

export const BODY_PARTS = [
  'Head',
  'Face',
  'Eyes',
  'Ears',
  'Nose',
  'Mouth',
  'Jaw',
  'Neck',
  'Throat',
  'Shoulders',
  'Chest',
  'Upper Back',
  'Lower Back',
  'Stomach',
  'Abdomen',
  'Hips',
  'Arms',
  'Elbows',
  'Wrists',
  'Hands',
  'Fingers',
  'Legs',
  'Thighs',
  'Knees',
  'Ankles',
  'Feet',
  'Toes',
  'Other',
] as const;

// ============================================================================
// CONTEXT TAG OPTIONS
// ============================================================================

export const LOCATION_OPTIONS = [
  'home',
  'work',
  'outdoors',
  'transit',
  'social',
  'gym',
  'healthcare',
  'other',
] as const;

export const TIME_OF_DAY_OPTIONS = [
  'morning',
  'afternoon',
  'evening',
  'night',
] as const;

export const PEOPLE_OPTIONS = [
  'alone',
  'with_partner',
  'with_family',
  'with_friends',
  'with_strangers',
  'in_group',
] as const;

// ============================================================================
// CRISIS RESOURCES
// ============================================================================

export const CRISIS_HOTLINES = [
  {
    name: '988 Suicide & Crisis Lifeline',
    phone: '988',
    description: '24/7 free and confidential support',
    url: 'https://988lifeline.org/',
  },
  {
    name: 'Crisis Text Line',
    phone: 'Text HOME to 741741',
    description: 'Free 24/7 crisis support via text',
    url: 'https://www.crisistextline.org/',
  },
  {
    name: 'SAMHSA National Helpline',
    phone: '1-800-662-4357',
    description: 'Treatment referral and information service',
    url: 'https://www.samhsa.gov/find-help/national-helpline',
  },
] as const;

// ============================================================================
// TYPE HELPERS
// ============================================================================

/** Extract values from const objects */
export type ValueOf<T> = T[keyof T];

/** Make specific keys required */
export type RequireKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

/** Make specific keys optional */
export type PartialKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
