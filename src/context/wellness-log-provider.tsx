
"use client";

import type { LogEntry } from "@/lib/data";
import { initialLogEntries } from "@/lib/data";
import * as React from "react";

type WellnessLogContextType = {
  logEntries: LogEntry[];
  addLogEntry: (entry: Omit<LogEntry, "id" | "date">) => void;
};

export const WellnessLogContext = React.createContext<
  WellnessLogContextType | undefined
>(undefined);

export function WellnessLogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [logEntries, setLogEntries] = React.useState<LogEntry[]>([]);
  const [isInitialized, setIsInitialized] = React.useState(false);

  React.useEffect(() => {
    try {
      const item = window.localStorage.getItem("wellnessLog");
      if (item) {
        setLogEntries(JSON.parse(item));
      } else {
        // Initialize with default data if nothing is in local storage
        setLogEntries(initialLogEntries);
        window.localStorage.setItem("wellnessLog", JSON.stringify(initialLogEntries));
      }
    } catch (error) {
      console.warn("Error reading from localStorage:", error);
      setLogEntries(initialLogEntries);
    }
    setIsInitialized(true);
  }, []);

  React.useEffect(() => {
    if (isInitialized) {
      try {
        window.localStorage.setItem("wellnessLog", JSON.stringify(logEntries));
      } catch (error) {
        console.warn("Error writing to localStorage:", error);
      }
    }
  }, [logEntries, isInitialized]);

  const addLogEntry = (entry: Omit<LogEntry, "id" | "date">) => {
    const newEntry: LogEntry = {
      ...entry,
      id: new Date().getTime().toString(),
      date: new Date().toISOString(),
    };
    setLogEntries((prev) => [...prev, newEntry]);
  };

  const value = { logEntries, addLogEntry };

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
