import { Request, Response } from "express";
import * as service from "../services/prizes.service";

export async function list(req: Request, res: Response) {
  try {
    const items = await service.listPrizes();
    return res.json(items);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function create(req: Request, res: Response) {
  try {
    const created = await service.createPrize(req.body);
    return res.status(201).json(created);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}

export async function update(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const updated = await service.updatePrize(id, req.body);
    return res.json(updated);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}

export async function remove(req: Request, res: Response) {
  try {
    const id = req.params.id;
    await service.deletePrize(id);
    return res.json({ ok: true });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}

export async function reset(req: Request, res: Response) {
  try {
    const result = await service.resetAllPrizes();
    return res.json({ status: "success", data: result });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function deleteAll(req: Request, res: Response) {
  try {
    const result = await service.deleteAllPrizes();
    return res.json({ status: "success", data: result });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
