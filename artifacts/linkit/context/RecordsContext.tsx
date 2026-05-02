import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export interface UnifiedRecord {
  id: string;
  dateTime: string;
  content?: string;
  type: "DAILY" | "TRAVEL";
  isShared: boolean;
  moodTag?: string;
  expense?: { amount: number; currency: string };
  location?: { name: string; lat?: number; lng?: number };
  photoUri?: string;
  tags?: string[];
}

interface RecordsContextType {
  records: UnifiedRecord[];
  travelMode: boolean;
  setTravelMode: (val: boolean) => void;
  addRecord: (record: Omit<UnifiedRecord, "id">) => Promise<void>;
  updateRecord: (id: string, updates: Partial<UnifiedRecord>) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
  loading: boolean;
}

const RecordsContext = createContext<RecordsContextType | null>(null);

const STORAGE_KEY = "@linkit_records";
const TRAVEL_MODE_KEY = "@linkit_travel_mode";

export function RecordsProvider({ children }: { children: React.ReactNode }) {
  const [records, setRecords] = useState<UnifiedRecord[]>([]);
  const [travelMode, setTravelModeState] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [stored, travel] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem(TRAVEL_MODE_KEY),
        ]);
        if (stored) setRecords(JSON.parse(stored));
        if (travel) setTravelModeState(JSON.parse(travel));
      } catch {}
      setLoading(false);
    })();
  }, []);

  const persist = useCallback(async (next: UnifiedRecord[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setRecords(next);
  }, []);

  const setTravelMode = useCallback(async (val: boolean) => {
    setTravelModeState(val);
    await AsyncStorage.setItem(TRAVEL_MODE_KEY, JSON.stringify(val));
  }, []);

  const addRecord = useCallback(
    async (record: Omit<UnifiedRecord, "id">) => {
      const newRecord: UnifiedRecord = {
        ...record,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      };
      await persist([newRecord, ...records]);
    },
    [records, persist]
  );

  const updateRecord = useCallback(
    async (id: string, updates: Partial<UnifiedRecord>) => {
      const next = records.map((r) => (r.id === id ? { ...r, ...updates } : r));
      await persist(next);
    },
    [records, persist]
  );

  const deleteRecord = useCallback(
    async (id: string) => {
      const next = records.filter((r) => r.id !== id);
      await persist(next);
    },
    [records, persist]
  );

  return (
    <RecordsContext.Provider
      value={{ records, travelMode, setTravelMode, addRecord, updateRecord, deleteRecord, loading }}
    >
      {children}
    </RecordsContext.Provider>
  );
}

export function useRecords() {
  const ctx = useContext(RecordsContext);
  if (!ctx) throw new Error("useRecords must be used inside RecordsProvider");
  return ctx;
}
