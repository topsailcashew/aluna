/**
 * Migration Runner for Aluna Wellness App
 * Handles lazy migration of LogEntry documents from v1 to v2+
 *
 * Strategy: Non-destructive, lazy migrations
 * - Migrations run on-read, not in batch
 * - All new fields are optional
 * - Version field added to track migration status
 * - Backward compatible with existing data
 */

import { Timestamp } from 'firebase/firestore';
import type { LogEntry, LegacyLogEntry } from '../types';

// Current schema version
export const CURRENT_VERSION = 2;

// Migration function type
type MigrationFunction = (data: any) => Promise<any> | any;

/**
 * Registry of all migrations
 * Key: version number to migrate FROM
 * Value: migration function
 */
const migrations: Record<number, MigrationFunction> = {};

/**
 * Migration from v1 (legacy) to v2 (Phase 1)
 * Adds:
 * - version field
 * - createdAt/updatedAt timestamps
 * - Optional new fields (quickMood, context, journal)
 */
migrations[1] = (data: any) => {
  // Handle both old ISO string dates and Firestore Timestamps
  let dateTimestamp: Timestamp;

  if (typeof data.date === 'string') {
    // Legacy: ISO string date
    dateTimestamp = Timestamp.fromDate(new Date(data.date));
  } else if (data.date?.toDate) {
    // Already a Timestamp
    dateTimestamp = data.date;
  } else {
    // Fallback: use current time
    dateTimestamp = Timestamp.now();
  }

  return {
    // Keep all existing fields
    ...data,

    // Update date to Timestamp if it was string
    date: dateTimestamp,

    // Add version tracking
    version: 2,

    // Add metadata timestamps
    createdAt: data.createdAt || dateTimestamp,
    updatedAt: data.updatedAt || dateTimestamp,

    // Add userId if missing (should be added from context)
    userId: data.userId || '',

    // Initialize optional Phase 1 fields as undefined (not null)
    quickMoodEmoji: data.quickMoodEmoji,
    quickMoodTimestamp: data.quickMoodTimestamp,
    contextTags: data.contextTags,
    journalEntry: data.journalEntry,

    // Initialize optional Phase 2 fields
    voiceNoteUrl: data.voiceNoteUrl,
    voiceNoteDuration: data.voiceNoteDuration,
    photoUrls: data.photoUrls,
    relatedGoalIds: data.relatedGoalIds,

    // Initialize optional Phase 3 fields
    medicationsTaken: data.medicationsTaken,
    sleepData: data.sleepData,
  };
};

/**
 * Future migrations would go here
 * Example:
 * migrations[2] = (data: any) => {
 *   return {
 *     ...data,
 *     version: 3,
 *     // ... new fields for v3
 *   };
 * };
 */

/**
 * Main migration function
 * Detects version and runs appropriate migrations sequentially
 *
 * @param entry Raw data from Firestore
 * @returns Migrated LogEntry
 */
export async function migrateLogEntry(entry: any): Promise<LogEntry> {
  // If already at current version, return as-is
  if (entry.version && entry.version >= CURRENT_VERSION) {
    return entry as LogEntry;
  }

  // Determine starting version
  const startVersion = entry.version || 1;

  let current = { ...entry };

  // Run migrations sequentially from startVersion to CURRENT_VERSION
  for (let v = startVersion; v < CURRENT_VERSION; v++) {
    if (migrations[v]) {
      try {
        current = await migrations[v](current);
      } catch (error) {
        console.error(`Migration from v${v} to v${v+1} failed:`, error);
        throw new Error(`Migration failed at version ${v}: ${error}`);
      }
    }
  }

  return current as LogEntry;
}

/**
 * Batch migrate multiple entries
 * Useful for migrating entire collections
 *
 * @param entries Array of raw entries
 * @returns Array of migrated entries
 */
export async function migrateBatch(entries: any[]): Promise<LogEntry[]> {
  return Promise.all(entries.map(entry => migrateLogEntry(entry)));
}

/**
 * Check if an entry needs migration
 *
 * @param entry Entry to check
 * @returns true if migration needed
 */
export function needsMigration(entry: any): boolean {
  return !entry.version || entry.version < CURRENT_VERSION;
}

/**
 * Get migration status for an entry
 *
 * @param entry Entry to check
 * @returns Status object
 */
export function getMigrationStatus(entry: any): {
  currentVersion: number;
  targetVersion: number;
  needsMigration: boolean;
  isLegacy: boolean;
} {
  const currentVersion = entry.version || 1;
  const isLegacy = !entry.version && typeof entry.date === 'string';

  return {
    currentVersion,
    targetVersion: CURRENT_VERSION,
    needsMigration: currentVersion < CURRENT_VERSION,
    isLegacy,
  };
}

/**
 * Validate that a migrated entry has all required fields
 *
 * @param entry Migrated entry to validate
 * @returns true if valid
 * @throws Error if invalid
 */
export function validateMigratedEntry(entry: LogEntry): boolean {
  const required = ['id', 'date', 'emotion', 'specificEmotions', 'sensations', 'thoughts', 'version'];

  for (const field of required) {
    if (!(field in entry)) {
      throw new Error(`Migrated entry missing required field: ${field}`);
    }
  }

  // Validate version is current
  if (entry.version !== CURRENT_VERSION) {
    throw new Error(`Migrated entry has version ${entry.version}, expected ${CURRENT_VERSION}`);
  }

  // Validate types
  if (!(entry.date instanceof Timestamp) && !(typeof (entry.date as any)?.toDate === 'function')) {
    throw new Error('Migrated entry date is not a Timestamp');
  }

  if (!Array.isArray(entry.specificEmotions)) {
    throw new Error('Migrated entry specificEmotions is not an array');
  }

  if (!Array.isArray(entry.sensations)) {
    throw new Error('Migrated entry sensations is not an array');
  }

  if (!Array.isArray(entry.thoughts)) {
    throw new Error('Migrated entry thoughts is not an array');
  }

  return true;
}

/**
 * Migration statistics
 * Useful for monitoring migration progress
 */
export type MigrationStats = {
  total: number;
  migrated: number;
  alreadyCurrent: number;
  failed: number;
  errors: Array<{ entryId: string; error: string }>;
};

/**
 * Migrate entries and collect statistics
 *
 * @param entries Entries to migrate
 * @returns Migration statistics
 */
export async function migrateWithStats(entries: any[]): Promise<{
  migratedEntries: LogEntry[];
  stats: MigrationStats;
}> {
  const stats: MigrationStats = {
    total: entries.length,
    migrated: 0,
    alreadyCurrent: 0,
    failed: 0,
    errors: [],
  };

  const migratedEntries: LogEntry[] = [];

  for (const entry of entries) {
    try {
      if (!needsMigration(entry)) {
        stats.alreadyCurrent++;
        migratedEntries.push(entry as LogEntry);
      } else {
        const migrated = await migrateLogEntry(entry);
        validateMigratedEntry(migrated);
        stats.migrated++;
        migratedEntries.push(migrated);
      }
    } catch (error) {
      stats.failed++;
      stats.errors.push({
        entryId: entry.id || 'unknown',
        error: error instanceof Error ? error.message : String(error),
      });
      console.error(`Failed to migrate entry ${entry.id}:`, error);
    }
  }

  return { migratedEntries, stats };
}

/**
 * Log migration statistics to console
 */
export function logMigrationStats(stats: MigrationStats): void {
  console.log('=== Migration Statistics ===');
  console.log(`Total entries: ${stats.total}`);
  console.log(`Already at v${CURRENT_VERSION}: ${stats.alreadyCurrent}`);
  console.log(`Migrated: ${stats.migrated}`);
  console.log(`Failed: ${stats.failed}`);

  if (stats.errors.length > 0) {
    console.log('\n=== Migration Errors ===');
    stats.errors.forEach(({ entryId, error }) => {
      console.error(`Entry ${entryId}: ${error}`);
    });
  }
}
