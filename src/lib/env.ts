/**
 * Environment Variable Validation
 *
 * Validates required environment variables at application startup
 * to catch configuration issues early.
 *
 * @module env
 */

import { z } from 'zod';

/**
 * Schema for environment variables
 *
 * Defines required and optional environment variables with validation rules.
 */
const envSchema = z.object({
  // Firebase Client Configuration (required)
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1, 'Firebase Project ID is required'),
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1, 'Firebase API Key is required'),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1, 'Firebase Auth Domain is required'),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1, 'Firebase Storage Bucket is required'),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1, 'Firebase Messaging Sender ID is required'),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1, 'Firebase App ID is required'),

  // Firebase Admin Configuration (required for server-side)
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().email().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),

  // Google AI Configuration (required)
  GOOGLE_GENAI_API_KEY: z.string().min(1, 'Google AI API Key is required'),

  // Security Configuration (optional)
  ALLOWED_ORIGINS: z.string().optional(),

  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Feature Flags (optional)
  NEXT_PUBLIC_ENABLE_VOICE_NOTES: z.enum(['true', 'false']).default('false'),
  NEXT_PUBLIC_ENABLE_PHOTO_UPLOADS: z.enum(['true', 'false']).default('false'),
  NEXT_PUBLIC_ENABLE_OFFLINE_MODE: z.enum(['true', 'false']).default('false'),

  // Error Tracking (optional)
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),

  // Analytics (optional)
  NEXT_PUBLIC_PLAUSIBLE_DOMAIN: z.string().optional(),
});

/**
 * Validated and typed environment variables
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Parse and validate environment variables
 *
 * @returns Validated environment variables
 * @throws {Error} If validation fails
 */
function parseEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(
        (err) => `  - ${err.path.join('.')}: ${err.message}`
      );

      throw new Error(
        `Environment variable validation failed:\n${errorMessages.join('\n')}\n\n` +
          'Please check your .env.local file and ensure all required variables are set.\n' +
          'See .env.example for reference.'
      );
    }

    throw error;
  }
}

/**
 * Validated environment variables
 *
 * Use this instead of process.env for type-safe access to environment variables.
 *
 * @example
 * ```ts
 * import { env } from '@/lib/env';
 *
 * const apiKey = env.GOOGLE_GENAI_API_KEY;
 * ```
 */
export const env = parseEnv();

/**
 * Check if running in production
 */
export const isProduction = env.NODE_ENV === 'production';

/**
 * Check if running in development
 */
export const isDevelopment = env.NODE_ENV === 'development';

/**
 * Check if running in test environment
 */
export const isTest = env.NODE_ENV === 'test';

/**
 * Get Firebase configuration object
 *
 * @returns Firebase client configuration
 */
export function getFirebaseConfig() {
  return {
    projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
}

/**
 * Get Firebase Admin configuration
 *
 * @returns Firebase Admin configuration or null if not available
 */
export function getFirebaseAdminConfig() {
  if (!env.FIREBASE_PROJECT_ID || !env.FIREBASE_CLIENT_EMAIL || !env.FIREBASE_PRIVATE_KEY) {
    return null;
  }

  return {
    projectId: env.FIREBASE_PROJECT_ID,
    clientEmail: env.FIREBASE_CLIENT_EMAIL,
    privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  };
}

/**
 * Get allowed origins for CORS
 *
 * @returns Array of allowed origins
 */
export function getAllowedOrigins(): string[] {
  if (!env.ALLOWED_ORIGINS) {
    return [];
  }

  return env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean);
}

/**
 * Feature flag checks
 */
export const features = {
  voiceNotes: env.NEXT_PUBLIC_ENABLE_VOICE_NOTES === 'true',
  photoUploads: env.NEXT_PUBLIC_ENABLE_PHOTO_UPLOADS === 'true',
  offlineMode: env.NEXT_PUBLIC_ENABLE_OFFLINE_MODE === 'true',
} as const;

/**
 * Log environment configuration (safe for logging)
 *
 * Logs environment status without exposing sensitive values.
 */
export function logEnvironmentStatus(): void {
  console.log('Environment Configuration:');
  console.log(`  - NODE_ENV: ${env.NODE_ENV}`);
  console.log(`  - Firebase Project: ${env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`);
  console.log(`  - Firebase Admin: ${getFirebaseAdminConfig() ? 'Configured' : 'Not Configured'}`);
  console.log(`  - Google AI: ${env.GOOGLE_GENAI_API_KEY ? 'Configured' : 'Not Configured'}`);
  console.log(`  - Allowed Origins: ${getAllowedOrigins().length} origin(s)`);
  console.log('Feature Flags:');
  console.log(`  - Voice Notes: ${features.voiceNotes}`);
  console.log(`  - Photo Uploads: ${features.photoUploads}`);
  console.log(`  - Offline Mode: ${features.offlineMode}`);
}
