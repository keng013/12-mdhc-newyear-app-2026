import { Router } from "express";
import {
  register,
  checkRegistered,
  getAll,
  checkInParticipant,
  bulkImport,
  bulkCheckInAll,
  update,
  deleteParticipant,
} from "../controllers/participants.controller";
import { authAdmin } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", register);
router.get("/", getAll);
router.get("/check/:employeeId", checkRegistered);
router.post("/checkin", checkInParticipant);
router.post("/checkin-all", authAdmin, bulkCheckInAll);
router.post("/bulk-import", authAdmin, bulkImport);
router.put("/:id", authAdmin, update);
router.delete("/:id", authAdmin, deleteParticipant);

export default router;
