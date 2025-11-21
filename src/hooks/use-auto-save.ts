import { useEffect, useRef, useCallback, useState } from 'react';

export type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface UseAutoSaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  delay?: number; // Debounce delay in milliseconds (default 10000 = 10s)
  enabled?: boolean; // Enable/disable auto-save
}

interface UseAutoSaveReturn {
  status: AutoSaveStatus;
  lastSaved: Date | null;
  manualSave: () => Promise<void>;
}

/**
 * Hook for auto-saving data with debouncing
 *
 * @example
 * const { status, lastSaved, manualSave } = useAutoSave({
 *   data: sessionData,
 *   onSave: async (data) => { await saveToFirestore(data); },
 *   delay: 10000, // 10 seconds
 * });
 */
export function useAutoSave<T>({
  data,
  onSave,
  delay = 10000,
  enabled = true,
}: UseAutoSaveOptions<T>): UseAutoSaveReturn {
  const [status, setStatus] = useState<AutoSaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);
  const dataRef = useRef<T>(data);

  // Update data ref whenever data changes
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // Save function that can be called manually
  const save = useCallback(async () => {
    if (isSavingRef.current) {
      return; // Already saving, skip
    }

    isSavingRef.current = true;
    setStatus('saving');

    try {
      await onSave(dataRef.current);
      setStatus('saved');
      setLastSaved(new Date());

      // Reset to idle after 3 seconds
      setTimeout(() => {
        setStatus('idle');
      }, 3000);
    } catch (error) {
      console.error('Auto-save failed:', error);
      setStatus('error');

      // Reset to idle after 5 seconds
      setTimeout(() => {
        setStatus('idle');
      }, 5000);
    } finally {
      isSavingRef.current = false;
    }
  }, [onSave]);

  // Debounced auto-save effect
  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      save();
    }, delay);

    // Cleanup on unmount or data change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, delay, enabled, save]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    status,
    lastSaved,
    manualSave: save,
  };
}
