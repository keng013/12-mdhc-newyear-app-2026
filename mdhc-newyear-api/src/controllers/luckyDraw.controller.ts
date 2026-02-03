import { Request, Response } from "express";
import * as service from "../services/luckyDraw.service";

export async function startDraw(req: Request, res: Response) {
  try {
    const { prizeId } = req.body;

    if (!prizeId) {
      return res.status(400).json({ error: "prizeId is required" });
    }

    const result = await service.startDraw(prizeId);
    return res.json({ status: "success", data: result });

  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}

export async function redraw(req: Request, res: Response) {
  try {
    const { resultId } = req.body;
    const result = await service.redraw(resultId);
    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}

export async function results(req: Request, res: Response) {
  try {
    const data = await service.listResults();
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
