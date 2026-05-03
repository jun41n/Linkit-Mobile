import { pgTable, text, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ownedPacksTable = pgTable(
  "owned_packs",
  {
    userId: text("user_id").notNull(),
    packId: text("pack_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.packId] })],
);

export const insertOwnedPackSchema = createInsertSchema(ownedPacksTable).omit({
  userId: true,
  createdAt: true,
});
export type InsertOwnedPack = z.infer<typeof insertOwnedPackSchema>;
export type OwnedPack = typeof ownedPacksTable.$inferSelect;
