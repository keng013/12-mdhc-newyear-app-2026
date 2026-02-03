import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      admin?: { id: string; email: string };
    }
  }
}

export function authAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token" });

  const token = authHeader.split(" ")[1];
  try {
    const secret = process.env.JWT_SECRET || "secret";
    const payload = jwt.verify(token, secret) as any;
    req.admin = { id: payload.id, email: payload.email };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}
