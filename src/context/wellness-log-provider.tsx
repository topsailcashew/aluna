
'use client';

import type { LogEntry, Sensation } from '@/lib/data';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection, serverTimestamp } from 'firebase/firestore';
import * as React from 'react';
import { initialLogEntries } from '@/lib/data';

type WellnessLogContextType = {
  logEntries: LogEntry[];
  addLogEntry: (entry: Omit<LogEntry, 'id' | 'date'>) => void;
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
      // Firebase timestamps need to be converted to JS Date objects then to ISO strings
      const formattedEntries = logEntriesFromDb.map(entry => ({
        ...entry,
        // @ts-ignore
        date: entry.date?.toDate ? entry.date.toDate().toISOString() : new Date().toISOString(),
      }));
      setLocalEntries(formattedEntries);
    } else if (!isUserLoading && !user) {
      // When not logged in, use initial placeholder data.
      setLocalEntries(initialLogEntries);
    }
  }, [logEntriesFromDb, user, isUserLoading]);

  const addLogEntry = (entry: Omit<LogEntry, 'id' | 'date'>) => {
    if (!wellnessEntriesRef) {
      console.error("Cannot add entry: user is not authenticated.");
      // Fallback for local-only mode if desired
      const newEntry: LogEntry = {
        ...entry,
        id: new Date().getTime().toString(),
        date: new Date().toISOString(),
      };
      setLocalEntries((prev) => [newEntry, ...prev]);
      return;
    }
    
    const newEntryData = {
      ...entry,
      date: serverTimestamp(),
    };

    // Use non-blocking add
    addDocumentNonBlocking(wellnessEntriesRef, newEntryData)
      .then(docRef => {
        console.log("Document written with ID: ", docRef.id);
        // Optimistically update local state if needed, though useCollection should handle it
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
