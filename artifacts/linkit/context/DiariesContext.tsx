import { useAuth } from "@clerk/expo";
import { useQueryClient } from "@tanstack/react-query";
import {
  getListDiariesQueryKey,
  getListEntriesQueryKey,
  useCreateDiary,
  useCreateEntry,
  useDeleteDiary,
  useDeleteEntry,
  useListDiaries,
  useListEntries,
  useUpdateDiary,
  useUpdateEntry,
} from "@workspace/api-client-react";
import React, { createContext, useCallback, useContext, useMemo } from "react";

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
  fontId?: string;
}

export type PhotoFrame = "none" | "polaroid" | "rounded" | "circle" | "sticker" | "tape";

export interface PlacedPhoto {
  id: string;
  uri: string;
  x: number;
  y: number;
  widthPct: number;
  aspectRatio: number;
  scale: number;
  rotation: number;
  frame: PhotoFrame;
}

export type PaperPattern = "plain" | "grid" | "dotted" | "lined";

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
  paperPattern?: PaperPattern;
  stickers: PlacedSticker[];
  texts: PlacedText[];
  photos?: PlacedPhoto[];
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
  addDiary: (
    d: Omit<Diary, "id" | "createdAt" | "members"> & { members?: string[] }
  ) => Promise<Diary>;
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

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function toLocalDiary(d: {
  id: string;
  name: string;
  kind: string;
  color: string;
  members: string[];
  coverNumber?: string | null;
  createdAt: string | Date;
}): Diary {
  return {
    id: d.id,
    name: d.name,
    kind: d.kind as DiaryKind,
    color: d.color as DiaryColor,
    members: d.members ?? [],
    coverNumber: d.coverNumber ?? undefined,
    createdAt:
      typeof d.createdAt === "string" ? d.createdAt : d.createdAt.toISOString(),
  };
}

function toLocalEntry(e: {
  id: string;
  diaryId: string;
  title?: string | null;
  body: string;
  mood?: string | null;
  photoUri?: string | null;
  videoUri?: string | null;
  isVideo: boolean;
  bgColor?: string | null;
  paperPattern?: string | null;
  stickers: PlacedSticker[];
  texts: PlacedText[];
  photos: PlacedPhoto[];
  createdAt: string | Date;
}): DiaryEntry {
  return {
    id: e.id,
    diaryId: e.diaryId,
    title: e.title ?? undefined,
    body: e.body,
    mood: e.mood ?? undefined,
    photoUri: e.photoUri ?? undefined,
    videoUri: e.videoUri ?? undefined,
    isVideo: e.isVideo,
    bgColor: e.bgColor ?? undefined,
    paperPattern: (e.paperPattern as PaperPattern) ?? undefined,
    stickers: e.stickers ?? [],
    texts: e.texts ?? [],
    photos: e.photos ?? [],
    createdAt:
      typeof e.createdAt === "string" ? e.createdAt : e.createdAt.toISOString(),
  };
}

export function DiariesProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useAuth();
  const queryClient = useQueryClient();

  const diariesQ = useListDiaries({
    query: {
      enabled: !!isSignedIn,
      queryKey: getListDiariesQueryKey(),
    },
  });
  const entriesQ = useListEntries(
    {},
    {
      query: {
        enabled: !!isSignedIn,
        queryKey: getListEntriesQueryKey(),
      },
    }
  );

  const createDiary = useCreateDiary();
  const updateDiaryM = useUpdateDiary();
  const deleteDiaryM = useDeleteDiary();
  const createEntry = useCreateEntry();
  const updateEntryM = useUpdateEntry();
  const deleteEntryM = useDeleteEntry();

  const diaries: Diary[] = useMemo(
    () => (diariesQ.data ?? []).map((d) => toLocalDiary(d as never)),
    [diariesQ.data]
  );
  const entries: DiaryEntry[] = useMemo(
    () => (entriesQ.data ?? []).map((e) => toLocalEntry(e as never)),
    [entriesQ.data]
  );

  const loading =
    !!isSignedIn && (diariesQ.isLoading || entriesQ.isLoading);

  const invalidateDiaries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: getListDiariesQueryKey() });
  }, [queryClient]);
  const invalidateEntries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: getListEntriesQueryKey() });
  }, [queryClient]);

  const addDiary: DiariesContextType["addDiary"] = useCallback(
    async (d) => {
      const id = uid();
      const created = await createDiary.mutateAsync({
        data: {
          id,
          name: d.name,
          kind: d.kind,
          color: d.color,
          members: d.members ?? ["나"],
          coverNumber: d.coverNumber ?? null,
        },
      });
      invalidateDiaries();
      return toLocalDiary(created as never);
    },
    [createDiary, invalidateDiaries]
  );

  const updateDiary: DiariesContextType["updateDiary"] = useCallback(
    async (id, updates) => {
      const data: Record<string, unknown> = {};
      if ("name" in updates) data.name = updates.name;
      if ("kind" in updates) data.kind = updates.kind;
      if ("color" in updates) data.color = updates.color;
      if ("members" in updates) data.members = updates.members;
      if ("coverNumber" in updates)
        data.coverNumber = updates.coverNumber ?? null;
      await updateDiaryM.mutateAsync({ id, data: data as never });
      invalidateDiaries();
    },
    [updateDiaryM, invalidateDiaries]
  );

  const deleteDiary: DiariesContextType["deleteDiary"] = useCallback(
    async (id) => {
      await deleteDiaryM.mutateAsync({ id });
      invalidateDiaries();
      invalidateEntries();
    },
    [deleteDiaryM, invalidateDiaries, invalidateEntries]
  );

  const toggleFavorite: DiariesContextType["toggleFavorite"] = useCallback(
    async (id) => {
      const current = diaries.find((d) => d.id === id);
      if (!current) return;
      const nextKind: DiaryKind =
        current.kind === "FAVORITE"
          ? current.members.length > 1
            ? "SHARED"
            : "SOLO"
          : "FAVORITE";
      await updateDiary(id, { kind: nextKind });
    },
    [diaries, updateDiary]
  );

  const addEntry: DiariesContextType["addEntry"] = useCallback(
    async (entry) => {
      const id = uid();
      const created = await createEntry.mutateAsync({
        data: {
          id,
          diaryId: entry.diaryId,
          title: entry.title ?? null,
          body: entry.body,
          mood: entry.mood ?? null,
          photoUri: entry.photoUri ?? null,
          videoUri: entry.videoUri ?? null,
          isVideo: !!entry.isVideo,
          bgColor: entry.bgColor ?? null,
          paperPattern: entry.paperPattern ?? null,
          stickers: entry.stickers,
          texts: entry.texts,
          photos: entry.photos ?? [],
        },
      });
      invalidateEntries();
      return toLocalEntry(created as never);
    },
    [createEntry, invalidateEntries]
  );

  const updateEntry: DiariesContextType["updateEntry"] = useCallback(
    async (id, updates) => {
      const data: Record<string, unknown> = {};
      const u = updates as Record<string, unknown>;
      const nullableKeys = [
        "title",
        "mood",
        "photoUri",
        "videoUri",
        "bgColor",
        "paperPattern",
      ] as const;
      for (const k of nullableKeys) {
        if (k in u) data[k] = u[k] ?? null;
      }
      for (const k of ["body", "isVideo", "stickers", "texts", "photos"] as const) {
        if (k in u) data[k] = u[k];
      }
      await updateEntryM.mutateAsync({ id, data: data as never });
      invalidateEntries();
    },
    [updateEntryM, invalidateEntries]
  );

  const deleteEntry: DiariesContextType["deleteEntry"] = useCallback(
    async (id) => {
      await deleteEntryM.mutateAsync({ id });
      invalidateEntries();
    },
    [deleteEntryM, invalidateEntries]
  );

  const getDiary = useCallback(
    (id: string) => diaries.find((d) => d.id === id),
    [diaries]
  );
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
