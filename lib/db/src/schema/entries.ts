import { pgTable, text, timestamp, jsonb, boolean, index, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const entriesTable = pgTable(
  "entries",
  {
    id: text("id").notNull(),
    userId: text("user_id").notNull(),
    diaryId: text("diary_id").notNull(),
    title: text("title"),
    body: text("body").notNull().default(""),
    mood: text("mood"),
    photoUri: text("photo_uri"),
    videoUri: text("video_uri"),
    isVideo: boolean("is_video").notNull().default(false),
    bgColor: text("bg_color"),
    paperPattern: text("paper_pattern"),
    stickers: jsonb("stickers").notNull().default([]),
    texts: jsonb("texts").notNull().default([]),
    photos: jsonb("photos").notNull().default([]),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.id] }),
    index("entries_user_diary_idx").on(t.userId, t.diaryId),
  ],
);

export const insertEntrySchema = createInsertSchema(entriesTable).omit({
  userId: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertEntry = z.infer<typeof insertEntrySchema>;
export type Entry = typeof entriesTable.$inferSelect;
