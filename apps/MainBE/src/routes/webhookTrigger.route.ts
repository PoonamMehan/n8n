import { Router } from "express";
import { getWebhookHandler, postWebhookHandler } from "../controllers/webhook.controller.js";

const router: Router = Router();

router.route("/:id").post(postWebhookHandler);
router.route("/:id").get(getWebhookHandler);

export default router;