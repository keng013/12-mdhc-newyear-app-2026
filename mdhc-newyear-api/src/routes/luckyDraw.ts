import { Router } from "express";
import { authAdmin } from "../middlewares/auth.middleware";
import { startDraw, redraw, results } from "../controllers/luckyDraw.controller";

const router = Router();

router.use(authAdmin);

router.post("/start", startDraw);
router.post("/redraw", redraw);
router.get("/results", results);

export default router;
