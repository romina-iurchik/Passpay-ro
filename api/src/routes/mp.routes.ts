import { Router } from "express";
import { createMPPreferenceController } from "../controllers/mp.controller";

const router = Router();

// POST /mp/preference/:splitId
router.post("/preference/:splitId", createMPPreferenceController);

export default router;