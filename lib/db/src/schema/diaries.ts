import { pgTable, text, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const diariesTable = pgTable(
  "diaries",
  {
    id: text("id").notNull(),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    kind: text("kind").notNull(),
    color: text("color").notNull(),
    members: text("members").array().notNull().default([]),
    coverNumber: text("cover_number"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [primaryKey({ columns: [t.userId, t.id] })],
);

export const insertDiarySchema = createInsertSchema(diariesTable).omit({
  userId: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertDiary = z.infer<typeof insertDiarySchema>;
export type Diary = typeof diariesTable.$inferSelect;
