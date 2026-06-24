import { Router } from "express";
import { coelsaWebhookController } from "../controllers/coelsa-webhook.controller";

const router = Router();

// POST /webhooks/coelsa — receptor de acreditaciones Coelsa (Transferencias 3.0)
router.post("/coelsa", coelsaWebhookController);

export default router;