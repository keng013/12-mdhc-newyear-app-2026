import { Request, Response } from "express";
import * as service from "../services/participants.service";

export async function register(req: Request, res: Response) {
  try {
    const data = await service.createParticipant(req.body);
    return res.status(201).json({ status: "success", data });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}

export async function checkRegistered(req: Request, res: Response) {
  const { employeeId } = req.params;
  try {
    const participant = await service.findByEmployeeId(employeeId);
    return res.json({ exists: !!participant, participant });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

// ⭐ GET /participants
export async function getAll(req: Request, res: Response) {
  try {
    const data = await service.listAll();
    return res.json({ status: "success", data });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

// ⭐ GET /participants/check-in
export async function checkInParticipant(req: Request, res: Response) {
  const { employeeId } = req.body;

  try {
    const result = await service.checkInParticipant(employeeId);
    return res.json({ status: "success", ...result });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}

// ⭐ POST /participants/bulk-import
export async function bulkImport(req: Request, res: Response) {
  try {
    const { participants } = req.body;

    if (!Array.isArray(participants) || participants.length === 0) {
      return res.status(400).json({ error: "Invalid participants data" });
    }

    const results = await service.bulkCreateParticipants(participants);
    return res.json({ status: "success", data: results });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

// ⭐ POST /participants/checkin-all
export async function bulkCheckInAll(req: Request, res: Response) {
  try {
    const result = await service.bulkCheckInAll();
    return res.json({ status: "success", data: result });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

// ⭐ PUT /participants/:id
export async function update(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const updated = await service.updateParticipant(id, req.body);
    return res.json({ status: "success", data: updated });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}

// ⭐ DELETE /participants/:id
export async function deleteParticipant(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const result = await service.deleteParticipant(id);
    return res.json({ status: "success", ...result });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}
