
'use client';

import type { LogEntry, Sensation, LegacyLogEntry } from '@/lib/types';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import * as React from 'react';
import { initialLogEntries } from '@/lib/data';

type WellnessLogContextType = {
  logEntries: LogEntry[];
  addLogEntry: (entry: Omit<LogEntry, 'id' | 'date' | 'userId' | 'createdAt' | 'updatedAt' | 'version'>) => void;
  isLoading: boolean;
};

export const WellnessLogContext = React.createContext<
  WellnessLogContextType | undefined
>(undefined);

export function WellnessLogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const wellnessEntriesRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, `users/${user.uid}/wellnessEntries`);
  }, [user, firestore]);

  const { data: logEntriesFromDb, isLoading: isLoadingEntries } = useCollection<Omit<LogEntry, 'id'>>(wellnessEntriesRef);

  const [localEntries, setLocalEntries] = React.useState<LogEntry[]>([]);

  // This effect synchronizes Firestore data with a local, mutable state.
  // It also initializes with placeholder data if the user is not logged in.
  React.useEffect(() => {
    if (user && logEntriesFromDb) {
      // When logged in, use data from Firestore.
      // Entries from Firestore should already be LogEntry type with proper Timestamps
      const formattedEntries: LogEntry[] = logEntriesFromDb.map(entry => {
        // Ensure date is a Timestamp
        const dateValue = entry.date;
        const timestamp = (dateValue && typeof dateValue === 'object' && 'toDate' in dateValue)
          ? dateValue as Timestamp
          : Timestamp.now();

        return {
          ...entry,
          date: timestamp,
          userId: user.uid,
          createdAt: (entry as any).createdAt || timestamp,
          updatedAt: (entry as any).updatedAt || timestamp,
          version: (entry as any).version || 1,
        } as LogEntry;
      });
      setLocalEntries(formattedEntries);
    } else if (!isUserLoading && !user) {
      // When not logged in, convert legacy entries to proper LogEntry format
      const convertedEntries: LogEntry[] = initialLogEntries.map(legacy => ({
        ...legacy,
        date: Timestamp.fromDate(new Date(legacy.date)),
        userId: 'guest',
        createdAt: Timestamp.fromDate(new Date(legacy.date)),
        updatedAt: Timestamp.fromDate(new Date(legacy.date)),
        version: 1,
      }));
      setLocalEntries(convertedEntries);
    }
  }, [logEntriesFromDb, user, isUserLoading]);

  const addLogEntry = (entry: Omit<LogEntry, 'id' | 'date' | 'userId' | 'createdAt' | 'updatedAt' | 'version'>) => {
    if (!wellnessEntriesRef || !user) {
      console.error("Cannot add entry: user is not authenticated.");
      // Fallback for local-only mode if desired
      const now = Timestamp.now();
      const newEntry: LogEntry = {
        ...entry,
        id: new Date().getTime().toString(),
        date: now,
        userId: 'guest',
        createdAt: now,
        updatedAt: now,
        version: 1,
      };
      setLocalEntries((prev) => [newEntry, ...prev]);
      return;
    }

    const newEntryData = {
      ...entry,
      date: serverTimestamp(),
      userId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      version: 1,
    };

    // Use non-blocking add
    addDocumentNonBlocking(wellnessEntriesRef, newEntryData)
      .then(docRef => {
        if (docRef) {
          console.log("Document written with ID: ", docRef.id);
        }
        // Optimistically update local state if needed, though useCollection should handle it
      })
      .catch(() => {
        // Error handling is done in addDocumentNonBlocking via errorEmitter
      });
  };

  const isLoading = isUserLoading || isLoadingEntries;

  const value = { logEntries: localEntries, addLogEntry, isLoading };

  return (
    <WellnessLogContext.Provider value={value}>
      {children}
    </WellnessLogContext.Provider>
  );
}

export function useWellnessLog() {
  const context = React.useContext(WellnessLogContext);
  if (context === undefined) {
    throw new Error("useWellnessLog must be used within a WellnessLogProvider");
  }
  return context;
}
