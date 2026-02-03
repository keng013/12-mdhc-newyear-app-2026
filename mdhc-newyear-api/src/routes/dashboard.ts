import { Router } from "express";
import * as controller from "../controllers/dashboard.controller";

const router = Router();

router.get("/stats", controller.getStats);
router.get("/activities", controller.getActivities);

export default router;
