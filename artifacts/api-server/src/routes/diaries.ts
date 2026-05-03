import { Router, type IRouter } from "express";
import { and, desc, eq } from "drizzle-orm";
import { db, diariesTable, entriesTable } from "@workspace/db";
import {
  CreateDiaryBody,
  UpdateDiaryBody,
  UpdateDiaryParams,
  DeleteDiaryParams,
} from "@workspace/api-zod";
import { requireAuth, getUserId } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.use(requireAuth);

router.get("/diaries", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const rows = await db
    .select()
    .from(diariesTable)
    .where(eq(diariesTable.userId, userId))
    .orderBy(desc(diariesTable.createdAt));
  res.json(rows);
});

router.post("/diaries", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const parsed = CreateDiaryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const data = parsed.data;
  const [row] = await db
    .insert(diariesTable)
    .values({
      id: data.id,
      userId,
      name: data.name,
      kind: data.kind,
      color: data.color,
      members: data.members ?? ["나"],
      coverNumber: data.coverNumber ?? null,
    })
    .onConflictDoNothing()
    .returning();
  if (!row) {
    res.status(409).json({ error: "Diary already exists" });
    return;
  }
  res.status(201).json(row);
});

router.patch("/diaries/:id", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const params = UpdateDiaryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateDiaryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const updates: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.kind !== undefined) updates.kind = parsed.data.kind;
  if (parsed.data.color !== undefined) updates.color = parsed.data.color;
  if (parsed.data.members !== undefined) updates.members = parsed.data.members;
  if (parsed.data.coverNumber !== undefined)
    updates.coverNumber = parsed.data.coverNumber;
  const [row] = await db
    .update(diariesTable)
    .set(updates)
    .where(
      and(eq(diariesTable.id, params.data.id), eq(diariesTable.userId, userId)),
    )
    .returning();
  if (!row) {
    res.status(404).json({ error: "Diary not found" });
    return;
  }
  res.json(row);
});

router.delete("/diaries/:id", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const params = DeleteDiaryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  await db
    .delete(entriesTable)
    .where(
      and(
        eq(entriesTable.diaryId, params.data.id),
        eq(entriesTable.userId, userId),
      ),
    );
  const [row] = await db
    .delete(diariesTable)
    .where(
      and(eq(diariesTable.id, params.data.id), eq(diariesTable.userId, userId)),
    )
    .returning();
  if (!row) {
    res.status(404).json({ error: "Diary not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
