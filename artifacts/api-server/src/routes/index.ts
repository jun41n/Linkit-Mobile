import { Router, type IRouter } from "express";
import healthRouter from "./health";
import diariesRouter from "./diaries";
import entriesRouter from "./entries";
import ownedPacksRouter from "./ownedPacks";

const router: IRouter = Router();

router.use(healthRouter);
router.use(diariesRouter);
router.use(entriesRouter);
router.use(ownedPacksRouter);

export default router;
