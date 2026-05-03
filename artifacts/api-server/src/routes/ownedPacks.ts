import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, ownedPacksTable } from "@workspace/db";
import { AddOwnedPackBody } from "@workspace/api-zod";
import { requireAuth, getUserId } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.use(requireAuth);

router.get("/owned-packs", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const rows = await db
    .select({ packId: ownedPacksTable.packId })
    .from(ownedPacksTable)
    .where(eq(ownedPacksTable.userId, userId));
  res.json(rows.map((r) => r.packId));
});

router.post("/owned-packs", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const parsed = AddOwnedPackBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  await db
    .insert(ownedPacksTable)
    .values({ userId, packId: parsed.data.packId })
    .onConflictDoNothing();
  const rows = await db
    .select({ packId: ownedPacksTable.packId })
    .from(ownedPacksTable)
    .where(eq(ownedPacksTable.userId, userId));
  res.json(rows.map((r) => r.packId));
});

export default router;
