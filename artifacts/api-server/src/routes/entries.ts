import { Router, type IRouter } from "express";
import { and, desc, eq } from "drizzle-orm";
import { db, diariesTable, entriesTable } from "@workspace/db";
import {
  CreateEntryBody,
  UpdateEntryBody,
  UpdateEntryParams,
  DeleteEntryParams,
  ListEntriesQueryParams,
} from "@workspace/api-zod";
import { requireAuth, getUserId } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.use(requireAuth);

router.get("/entries", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const q = ListEntriesQueryParams.safeParse(req.query);
  const where = q.success && q.data.diaryId
    ? and(eq(entriesTable.userId, userId), eq(entriesTable.diaryId, q.data.diaryId))
    : eq(entriesTable.userId, userId);
  const rows = await db
    .select()
    .from(entriesTable)
    .where(where)
    .orderBy(desc(entriesTable.createdAt));
  res.json(rows);
});

router.post("/entries", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const parsed = CreateEntryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const d = parsed.data;

  const [parent] = await db
    .select({ id: diariesTable.id })
    .from(diariesTable)
    .where(
      and(eq(diariesTable.id, d.diaryId), eq(diariesTable.userId, userId)),
    );
  if (!parent) {
    res.status(404).json({ error: "Diary not found" });
    return;
  }

  const [row] = await db
    .insert(entriesTable)
    .values({
      id: d.id,
      userId,
      diaryId: d.diaryId,
      title: d.title ?? null,
      body: d.body,
      mood: d.mood ?? null,
      photoUri: d.photoUri ?? null,
      videoUri: d.videoUri ?? null,
      isVideo: d.isVideo ?? false,
      bgColor: d.bgColor ?? null,
      paperPattern: d.paperPattern ?? null,
      stickers: d.stickers ?? [],
      texts: d.texts ?? [],
      photos: d.photos ?? [],
    })
    .onConflictDoNothing()
    .returning();
  if (!row) {
    res.status(409).json({ error: "Entry already exists" });
    return;
  }
  res.status(201).json(row);
});

router.patch("/entries/:id", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const params = UpdateEntryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateEntryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const updates: Record<string, unknown> = {};
  for (const k of [
    "title",
    "body",
    "mood",
    "photoUri",
    "videoUri",
    "isVideo",
    "bgColor",
    "paperPattern",
    "stickers",
    "texts",
    "photos",
  ] as const) {
    const v = (parsed.data as Record<string, unknown>)[k];
    if (v !== undefined) updates[k] = v;
  }
  const [row] = await db
    .update(entriesTable)
    .set(updates)
    .where(
      and(eq(entriesTable.id, params.data.id), eq(entriesTable.userId, userId)),
    )
    .returning();
  if (!row) {
    res.status(404).json({ error: "Entry not found" });
    return;
  }
  res.json(row);
});

router.delete("/entries/:id", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const params = DeleteEntryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .delete(entriesTable)
    .where(
      and(eq(entriesTable.id, params.data.id), eq(entriesTable.userId, userId)),
    )
    .returning();
  if (!row) {
    res.status(404).json({ error: "Entry not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
