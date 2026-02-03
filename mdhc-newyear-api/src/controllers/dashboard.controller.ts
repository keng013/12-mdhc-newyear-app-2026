import { Request, Response } from "express";
import * as service from "../services/dashboard.service";

export async function getStats(req: Request, res: Response) {
  try {
    const data = await service.getDashboardStats();
    return res.json({ status: "success", data });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function getActivities(req: Request, res: Response) {
  try {
    const data = await service.getRecentActivities();
    return res.json({ status: "success", data });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
