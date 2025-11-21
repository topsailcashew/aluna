import { LifeMessageSession, LocalDraft } from '@/lib/types/life-messages';

const DRAFT_PREFIX = 'life_messages_draft_';
const MAX_DRAFTS = 10; // Keep only the 10 most recent drafts

/**
 * Save a draft to localStorage
 */
export function saveDraftToLocal(sessionId: string, data: Partial<LifeMessageSession>): void {
  try {
    const draft: LocalDraft = {
      sessionId,
      lastSaved: new Date(),
      data,
    };

    localStorage.setItem(DRAFT_PREFIX + sessionId, JSON.stringify(draft));

    // Cleanup old drafts if we exceed the limit
    cleanupOldDrafts();
  } catch (error) {
    console.error('Failed to save draft to localStorage:', error);
    // localStorage might be full or disabled
  }
}

/**
 * Load a draft from localStorage
 */
export function loadDraftFromLocal(sessionId: string): LocalDraft | null {
  try {
    const item = localStorage.getItem(DRAFT_PREFIX + sessionId);
    if (!item) return null;

    const draft = JSON.parse(item) as LocalDraft;

    // Convert date string back to Date object
    draft.lastSaved = new Date(draft.lastSaved);

    return draft;
  } catch (error) {
    console.error('Failed to load draft from localStorage:', error);
    return null;
  }
}

/**
 * Delete a specific draft from localStorage
 */
export function deleteDraftFromLocal(sessionId: string): void {
  try {
    localStorage.removeItem(DRAFT_PREFIX + sessionId);
  } catch (error) {
    console.error('Failed to delete draft from localStorage:', error);
  }
}

/**
 * Get all draft session IDs
 */
export function getAllDraftSessionIds(): string[] {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(DRAFT_PREFIX)) {
        keys.push(key.replace(DRAFT_PREFIX, ''));
      }
    }
    return keys;
  } catch (error) {
    console.error('Failed to get draft session IDs:', error);
    return [];
  }
}

/**
 * Get all drafts sorted by last saved date
 */
export function getAllDrafts(): LocalDraft[] {
  try {
    const sessionIds = getAllDraftSessionIds();
    const drafts: LocalDraft[] = [];

    for (const sessionId of sessionIds) {
      const draft = loadDraftFromLocal(sessionId);
      if (draft) {
        drafts.push(draft);
      }
    }

    // Sort by most recent first
    drafts.sort((a, b) => b.lastSaved.getTime() - a.lastSaved.getTime());

    return drafts;
  } catch (error) {
    console.error('Failed to get all drafts:', error);
    return [];
  }
}

/**
 * Cleanup old drafts, keeping only the MAX_DRAFTS most recent
 */
function cleanupOldDrafts(): void {
  try {
    const drafts = getAllDrafts();

    // If we have more than MAX_DRAFTS, delete the oldest ones
    if (drafts.length > MAX_DRAFTS) {
      const toDelete = drafts.slice(MAX_DRAFTS);
      toDelete.forEach(draft => {
        deleteDraftFromLocal(draft.sessionId);
      });
    }
  } catch (error) {
    console.error('Failed to cleanup old drafts:', error);
  }
}

/**
 * Clear all life messages drafts from localStorage
 */
export function clearAllDrafts(): void {
  try {
    const sessionIds = getAllDraftSessionIds();
    sessionIds.forEach(deleteDraftFromLocal);
  } catch (error) {
    console.error('Failed to clear all drafts:', error);
  }
}

/**
 * Check if localStorage is available and working
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__localStorage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the size of all life messages drafts in localStorage (in KB)
 */
export function getDraftsStorageSize(): number {
  try {
    const sessionIds = getAllDraftSessionIds();
    let totalSize = 0;

    sessionIds.forEach(sessionId => {
      const item = localStorage.getItem(DRAFT_PREFIX + sessionId);
      if (item) {
        totalSize += new Blob([item]).size;
      }
    });

    return Math.round(totalSize / 1024); // Return size in KB
  } catch (error) {
    console.error('Failed to calculate drafts storage size:', error);
    return 0;
  }
}
