import { Router } from "express";
import { mpWebhookController } from "../controllers/mp.controller";

const router = Router();

// POST /webhooks/mp/:splitId
router.post("/mp/:splitId", mpWebhookController);

export default router;