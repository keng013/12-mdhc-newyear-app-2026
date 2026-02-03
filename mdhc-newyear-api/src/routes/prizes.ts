import { Router } from "express";
import { authAdmin } from "../middlewares/auth.middleware";
import {
  list,
  create,
  update,
  remove,
  reset,
  deleteAll,
} from "../controllers/prizes.controller";

const router = Router();

router.use(authAdmin);

router.get("/", list);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", remove);
router.post("/reset", reset);
router.post("/delete-all", deleteAll);

export default router;
