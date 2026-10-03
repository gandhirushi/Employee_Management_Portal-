import express from "express";

import { getUserSettings, patchUserSettings } from "../controllers/settings.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authenticatedApiRateLimiter } from "../middleware/rateLimiter.middleware.js";

const router = express.Router();

// All settings routes require JWT authentication
router.use(authenticate);
router.use(authenticatedApiRateLimiter);

// GET /api/settings
router.get("/", getUserSettings);

// PATCH /api/settings
router.patch("/", patchUserSettings);

export default router;