import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type DiaryKind = "SOLO" | "SHARED" | "FAVORITE";
export type DiaryColor = "red" | "mint" | "yellow" | "lavender" | "blue" | "orange";

export interface PlacedSticker {
  id: string;
  stickerId: string;
  emoji: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

export interface PlacedText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  fontSize: number;
}

export interface DiaryEntry {
  id: string;
  diaryId: string;
  createdAt: string;
  title?: string;
  body: string;
  mood?: string;
  photoUri?: string;
  videoUri?: string;
  isVideo?: boolean;
  bgColor?: string;
  stickers: PlacedSticker[];
  texts: PlacedText[];
}

export interface Diary {
  id: string;
  name: string;
  kind: DiaryKind;
  color: DiaryColor;
  members: string[];
  createdAt: string;
  coverNumber?: string;
}

interface DiariesContextType {
  diaries: Diary[];
  entries: DiaryEntry[];
  loading: boolean;
  addDiary: (d: Omit<Diary, "id" | "createdAt" | "members"> & { members?: string[] }) => Promise<Diary>;
  updateDiary: (id: string, updates: Partial<Diary>) => Promise<void>;
  deleteDiary: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  addEntry: (entry: Omit<DiaryEntry, "id" | "createdAt">) => Promise<DiaryEntry>;
  updateEntry: (id: string, updates: Partial<DiaryEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  getDiary: (id: string) => Diary | undefined;
  getEntriesForDiary: (id: string) => DiaryEntry[];
}

const DiariesContext = createContext<DiariesContextType | null>(null);

const DIARIES_KEY = "@linkit/diaries/v1";
const ENTRIES_KEY = "@linkit/entries/v1";

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

const SAMPLE_DIARIES: Diary[] = [
  {
    id: "d_seed_1",
    name: "260427",
    kind: "SOLO",
    color: "red",
    members: ["나"],
    createdAt: new Date().toISOString(),
    coverNumber: "260427",
  },
  {
    id: "d_seed_2",
    name: "가족 교환일기",
    kind: "SHARED",
    color: "mint",
    members: ["나", "엄마", "동생"],
    createdAt: new Date().toISOString(),
  },
];

export function DiariesProvider({ children }: { children: React.ReactNode }) {
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [d, e] = await Promise.all([
          AsyncStorage.getItem(DIARIES_KEY),
          AsyncStorage.getItem(ENTRIES_KEY),
        ]);
        if (d) {
          setDiaries(JSON.parse(d));
        } else {
          setDiaries(SAMPLE_DIARIES);
          await AsyncStorage.setItem(DIARIES_KEY, JSON.stringify(SAMPLE_DIARIES));
        }
        if (e) setEntries(JSON.parse(e));
      } catch {}
      setLoading(false);
    })();
  }, []);

  const hydratedRef = React.useRef(false);
  const diariesRef = React.useRef<Diary[]>([]);
  const entriesRef = React.useRef<DiaryEntry[]>([]);
  const writeQueueRef = React.useRef<Promise<void>>(Promise.resolve());

  React.useEffect(() => {
    diariesRef.current = diaries;
  }, [diaries]);
  React.useEffect(() => {
    entriesRef.current = entries;
  }, [entries]);

  const enqueueWrite = useCallback((fn: () => Promise<void>) => {
    const next = writeQueueRef.current.then(fn, fn);
    writeQueueRef.current = next.catch(() => {});
    return next;
  }, []);

  const mutateDiaries = useCallback(
    (mutator: (prev: Diary[]) => Diary[]) => {
      let computed: Diary[] = diariesRef.current;
      setDiaries((prev) => {
        computed = mutator(prev);
        diariesRef.current = computed;
        return computed;
      });
      return enqueueWrite(() => AsyncStorage.setItem(DIARIES_KEY, JSON.stringify(computed)));
    },
    [enqueueWrite]
  );

  const mutateEntries = useCallback(
    (mutator: (prev: DiaryEntry[]) => DiaryEntry[]) => {
      let computed: DiaryEntry[] = entriesRef.current;
      setEntries((prev) => {
        computed = mutator(prev);
        entriesRef.current = computed;
        return computed;
      });
      return enqueueWrite(() => AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(computed)));
    },
    [enqueueWrite]
  );

  const ensureHydrated = useCallback(() => {
    if (!hydratedRef.current) {
      throw new Error("DiariesContext is still hydrating");
    }
  }, []);

  React.useEffect(() => {
    if (!loading) hydratedRef.current = true;
  }, [loading]);

  const addDiary: DiariesContextType["addDiary"] = useCallback(
    async (d) => {
      ensureHydrated();
      const newDiary: Diary = {
        id: uid(),
        createdAt: new Date().toISOString(),
        members: d.members ?? ["나"],
        name: d.name,
        kind: d.kind,
        color: d.color,
        coverNumber: d.coverNumber,
      };
      await mutateDiaries((prev) => [newDiary, ...prev]);
      return newDiary;
    },
    [mutateDiaries, ensureHydrated]
  );

  const updateDiary = useCallback(
    async (id: string, updates: Partial<Diary>) => {
      ensureHydrated();
      await mutateDiaries((prev) => prev.map((x) => (x.id === id ? { ...x, ...updates } : x)));
    },
    [mutateDiaries, ensureHydrated]
  );

  const deleteDiary = useCallback(
    async (id: string) => {
      ensureHydrated();
      await mutateDiaries((prev) => prev.filter((x) => x.id !== id));
      await mutateEntries((prev) => prev.filter((x) => x.diaryId !== id));
    },
    [mutateDiaries, mutateEntries, ensureHydrated]
  );

  const toggleFavorite = useCallback(
    async (id: string) => {
      ensureHydrated();
      await mutateDiaries((prev) =>
        prev.map((x) =>
          x.id === id
            ? { ...x, kind: x.kind === "FAVORITE" ? (x.members.length > 1 ? "SHARED" : "SOLO") : "FAVORITE" }
            : x
        )
      );
    },
    [mutateDiaries, ensureHydrated]
  );

  const addEntry: DiariesContextType["addEntry"] = useCallback(
    async (entry) => {
      ensureHydrated();
      const newEntry: DiaryEntry = {
        ...entry,
        id: uid(),
        createdAt: new Date().toISOString(),
      };
      await mutateEntries((prev) => [newEntry, ...prev]);
      return newEntry;
    },
    [mutateEntries, ensureHydrated]
  );

  const updateEntry = useCallback(
    async (id: string, updates: Partial<DiaryEntry>) => {
      ensureHydrated();
      await mutateEntries((prev) => prev.map((x) => (x.id === id ? { ...x, ...updates } : x)));
    },
    [mutateEntries, ensureHydrated]
  );

  const deleteEntry = useCallback(
    async (id: string) => {
      ensureHydrated();
      await mutateEntries((prev) => prev.filter((x) => x.id !== id));
    },
    [mutateEntries, ensureHydrated]
  );

  const getDiary = useCallback((id: string) => diaries.find((d) => d.id === id), [diaries]);
  const getEntriesForDiary = useCallback(
    (id: string) =>
      entries
        .filter((e) => e.diaryId === id)
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [entries]
  );

  const value = useMemo(
    () => ({
      diaries,
      entries,
      loading,
      addDiary,
      updateDiary,
      deleteDiary,
      toggleFavorite,
      addEntry,
      updateEntry,
      deleteEntry,
      getDiary,
      getEntriesForDiary,
    }),
    [
      diaries,
      entries,
      loading,
      addDiary,
      updateDiary,
      deleteDiary,
      toggleFavorite,
      addEntry,
      updateEntry,
      deleteEntry,
      getDiary,
      getEntriesForDiary,
    ]
  );

  return <DiariesContext.Provider value={value}>{children}</DiariesContext.Provider>;
}

export function useDiaries() {
  const ctx = useContext(DiariesContext);
  if (!ctx) throw new Error("useDiaries must be used within DiariesProvider");
  return ctx;
}
