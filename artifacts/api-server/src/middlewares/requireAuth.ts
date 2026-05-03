import type { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";

export interface AuthedRequest extends Request {
  userId: string;
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const auth = getAuth(req);
  if (!auth || !auth.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  (req as AuthedRequest).userId = auth.userId;
  next();
}

export function getUserId(req: Request): string {
  return (req as AuthedRequest).userId;
}
