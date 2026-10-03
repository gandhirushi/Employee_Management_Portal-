import express from "express";

import {
  listNotifications,
  postNotification,
  readNotification,
  readAllNotifications,
  removeNotification,
  removeAllNotifications,
} from "../controllers/notification.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authenticatedApiRateLimiter } from "../middleware/rateLimiter.middleware.js";

const router = express.Router();

router.use(authenticate);
router.use(authenticatedApiRateLimiter);

router.get("/", listNotifications);

router.post("/", postNotification);

router.patch("/:id/read", readNotification);

router.patch("/read-all", readAllNotifications);

router.delete("/:id", removeNotification);

router.delete("/", removeAllNotifications);

export default router;