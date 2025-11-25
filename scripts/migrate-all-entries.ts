/**
 * Batch Migration Script for Aluna Wellness App
 * Migrates all wellness entries from v1 to current version
 *
 * Usage: tsx scripts/migrate-all-entries.ts
 *
 * WARNING: This script modifies production data. Always backup before running!
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { migrateLogEntry, validateMigratedEntry, needsMigration, CURRENT_VERSION, logMigrationStats } from '../src/lib/migrations/migration-runner';
import type { MigrationStats } from '../src/lib/migrations/migration-runner';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Firebase Admin SDK
// Note: In production, use service account credentials
// For local development, this uses Application Default Credentials
try {
  initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
} catch (error) {
  console.error('Failed to initialize Firebase Admin:', error);
  process.exit(1);
}

const db = getFirestore();

/**
 * Migration options
 */
type MigrationOptions = {
  dryRun: boolean; // If true, don't write changes
  batchSize: number; // Number of documents per batch
  userId?: string; // Migrate specific user only
  skipValidation: boolean; // Skip validation (not recommended)
};

const DEFAULT_OPTIONS: MigrationOptions = {
  dryRun: false,
  batchSize: 500, // Firestore batch limit
  skipValidation: false,
};

/**
 * Migrate all wellness entries for a single user
 */
async function migrateUserEntries(
  userId: string,
  options: MigrationOptions
): Promise<MigrationStats> {
  console.log(`\n📝 Migrating entries for user: ${userId}`);

  const entriesRef = db.collection(`users/${userId}/wellnessEntries`);

  // Query entries that need migration (no version field or version < CURRENT_VERSION)
  const snapshot = await entriesRef.get();

  if (snapshot.empty) {
    console.log(`No entries found for user ${userId}`);
    return {
      total: 0,
      migrated: 0,
      alreadyCurrent: 0,
      failed: 0,
      errors: [],
    };
  }

  const stats: MigrationStats = {
    total: snapshot.size,
    migrated: 0,
    alreadyCurrent: 0,
    failed: 0,
    errors: [],
  };

  // Process in batches
  const docs = snapshot.docs;
  let batchCount = 0;
  let batch = db.batch();

  for (let i = 0; i < docs.length; i++) {
    const doc = docs[i];
    const data = doc.data();

    try {
      // Check if migration needed
      if (!needsMigration(data)) {
        stats.alreadyCurrent++;
        console.log(`  ✓ ${doc.id} already at v${CURRENT_VERSION}`);
        continue;
      }

      // Migrate
      const migrated = await migrateLogEntry(data);

      // Validate
      if (!options.skipValidation) {
        validateMigratedEntry(migrated);
      }

      // Add to batch
      if (!options.dryRun) {
        batch.update(doc.ref, migrated);
        batchCount++;
      }

      stats.migrated++;
      console.log(`  ✓ ${doc.id} migrated from v${data.version || 1} to v${migrated.version}`);

      // Commit batch when limit reached
      if (batchCount >= options.batchSize) {
        if (!options.dryRun) {
          await batch.commit();
          console.log(`  💾 Committed batch of ${batchCount} updates`);
        }
        batch = db.batch();
        batchCount = 0;
      }
    } catch (error) {
      stats.failed++;
      const errorMsg = error instanceof Error ? error.message : String(error);
      stats.errors.push({ entryId: doc.id, error: errorMsg });
      console.error(`  ✗ ${doc.id} failed: ${errorMsg}`);
    }
  }

  // Commit remaining batch
  if (batchCount > 0 && !options.dryRun) {
    await batch.commit();
    console.log(`  💾 Committed final batch of ${batchCount} updates`);
  }

  return stats;
}

/**
 * Migrate all users' entries
 */
async function migrateAllUsers(options: MigrationOptions): Promise<void> {
  console.log('🚀 Starting migration for all users...\n');
  console.log(`Options:`, options);

  if (options.dryRun) {
    console.log('⚠️  DRY RUN MODE - No changes will be written\n');
  }

  const usersSnapshot = await db.collection('users').get();

  if (usersSnapshot.empty) {
    console.log('No users found.');
    return;
  }

  console.log(`Found ${usersSnapshot.size} users\n`);

  const overallStats: MigrationStats = {
    total: 0,
    migrated: 0,
    alreadyCurrent: 0,
    failed: 0,
    errors: [],
  };

  for (const userDoc of usersSnapshot.docs) {
    const userId = userDoc.id;

    // Skip if migrating specific user only
    if (options.userId && userId !== options.userId) {
      continue;
    }

    try {
      const userStats = await migrateUserEntries(userId, options);

      // Aggregate stats
      overallStats.total += userStats.total;
      overallStats.migrated += userStats.migrated;
      overallStats.alreadyCurrent += userStats.alreadyCurrent;
      overallStats.failed += userStats.failed;
      overallStats.errors.push(...userStats.errors);
    } catch (error) {
      console.error(`Failed to migrate user ${userId}:`, error);
      overallStats.failed++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('MIGRATION COMPLETE');
  console.log('='.repeat(50));
  logMigrationStats(overallStats);

  if (options.dryRun) {
    console.log('\n⚠️  This was a DRY RUN - no changes were written');
  }
}

/**
 * Parse command line arguments
 */
function parseArgs(): MigrationOptions {
  const args = process.argv.slice(2);
  const options = { ...DEFAULT_OPTIONS };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--dry-run':
      case '-d':
        options.dryRun = true;
        break;
      case '--user':
      case '-u':
        options.userId = args[++i];
        break;
      case '--batch-size':
      case '-b':
        options.batchSize = parseInt(args[++i], 10);
        break;
      case '--skip-validation':
        options.skipValidation = true;
        break;
      case '--help':
      case '-h':
        console.log(`
Usage: tsx scripts/migrate-all-entries.ts [options]

Options:
  --dry-run, -d           Run without writing changes (test mode)
  --user, -u <userId>     Migrate specific user only
  --batch-size, -b <n>    Number of docs per batch (default: 500)
  --skip-validation       Skip validation (not recommended)
  --help, -h              Show this help message

Examples:
  # Dry run (no changes)
  tsx scripts/migrate-all-entries.ts --dry-run

  # Migrate all users
  tsx scripts/migrate-all-entries.ts

  # Migrate specific user
  tsx scripts/migrate-all-entries.ts --user abc123

  # Smaller batches
  tsx scripts/migrate-all-entries.ts --batch-size 100
        `);
        process.exit(0);
    }
  }

  return options;
}

/**
 * Main execution
 */
async function main() {
  const options = parseArgs();

  try {
    await migrateAllUsers(options);
    console.log('\n✅ Migration script completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration script failed:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { migrateAllUsers, migrateUserEntries };
