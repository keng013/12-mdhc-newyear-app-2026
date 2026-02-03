import { Request, Response } from "express";
import * as adminService from "../services/admin.service";

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  try {
    const token = await adminService.login(email, password);
    return res.json({ token });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}
