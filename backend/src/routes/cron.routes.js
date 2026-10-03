import express from "express";
import { triggerGoodMorningEmails } from "../controllers/cron.controller.js";
import { requireAuth, authorize } from "../middleware/auth.middleware.js";
import { UserRole } from "../config/roles.js";
import { authenticatedApiRateLimiter } from "../middleware/rateLimiter.middleware.js";

const router = express.Router();

router.use(requireAuth);
router.use(authenticatedApiRateLimiter);

// Route for manual triggering of Good Morning email cron job (Super Admin / HR Admin)
router.post(
  "/trigger-good-morning",
  authorize(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN),
  triggerGoodMorningEmails
);

export default router;
