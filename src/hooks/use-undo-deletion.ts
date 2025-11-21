import { useState, useCallback, useRef, useEffect } from 'react';

interface DeletedItem<T> {
  item: T;
  timestamp: number;
  timeoutId: NodeJS.Timeout;
}

interface UseUndoDeletionOptions {
  undoTimeoutMs?: number; // Time before permanent deletion (default 30000 = 30s)
  onPermanentDelete?: () => void; // Callback when item is permanently deleted
}

interface UseUndoDeletionReturn<T> {
  deletedItem: T | null;
  timeRemaining: number | null; // Seconds remaining for undo
  markForDeletion: (item: T) => void;
  undoDeletion: () => T | null;
  confirmDeletion: () => void;
}

/**
 * Hook for managing soft deletion with undo capability
 *
 * @example
 * const { deletedItem, timeRemaining, markForDeletion, undoDeletion } = useUndoDeletion({
 *   undoTimeoutMs: 30000,
 *   onPermanentDelete: () => { console.log('Item permanently deleted'); }
 * });
 *
 * // Mark item for deletion
 * markForDeletion(message);
 *
 * // Undo within 30 seconds
 * const restored = undoDeletion();
 */
export function useUndoDeletion<T>({
  undoTimeoutMs = 30000,
  onPermanentDelete,
}: UseUndoDeletionOptions = {}): UseUndoDeletionReturn<T> {
  const [deletedItem, setDeletedItem] = useState<T | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const deletedItemRef = useRef<DeletedItem<T> | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (deletedItemRef.current?.timeoutId) {
      clearTimeout(deletedItemRef.current.timeoutId);
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    deletedItemRef.current = null;
    setDeletedItem(null);
    setTimeRemaining(null);
  }, []);

  // Update countdown every second
  const startCountdown = useCallback(() => {
    // Clear existing interval
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    // Start new countdown
    countdownIntervalRef.current = setInterval(() => {
      if (!deletedItemRef.current) {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
        }
        return;
      }

      const elapsed = Date.now() - deletedItemRef.current.timestamp;
      const remaining = Math.max(0, Math.ceil((undoTimeoutMs - elapsed) / 1000));

      setTimeRemaining(remaining);

      if (remaining === 0 && countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    }, 1000);
  }, [undoTimeoutMs]);

  /**
   * Mark an item for deletion (soft delete)
   */
  const markForDeletion = useCallback(
    (item: T) => {
      // Clear any existing pending deletion
      cleanup();

      const timestamp = Date.now();

      // Set timeout for permanent deletion
      const timeoutId = setTimeout(() => {
        cleanup();
        onPermanentDelete?.();
      }, undoTimeoutMs);

      // Store the deleted item
      deletedItemRef.current = {
        item,
        timestamp,
        timeoutId,
      };

      setDeletedItem(item);
      setTimeRemaining(Math.ceil(undoTimeoutMs / 1000));
      startCountdown();
    },
    [cleanup, undoTimeoutMs, onPermanentDelete, startCountdown]
  );

  /**
   * Undo the deletion and restore the item
   */
  const undoDeletion = useCallback((): T | null => {
    if (!deletedItemRef.current) {
      return null;
    }

    const restoredItem = deletedItemRef.current.item;
    cleanup();
    return restoredItem;
  }, [cleanup]);

  /**
   * Immediately confirm the deletion (skip undo period)
   */
  const confirmDeletion = useCallback(() => {
    if (!deletedItemRef.current) {
      return;
    }

    cleanup();
    onPermanentDelete?.();
  }, [cleanup, onPermanentDelete]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    deletedItem,
    timeRemaining,
    markForDeletion,
    undoDeletion,
    confirmDeletion,
  };
}
