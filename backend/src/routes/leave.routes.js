import express from "express";
import {
  applyLeaveController,
  getMyLeavesController,
  getAllLeavesController,
  updateLeaveStatusController,
} from "../controllers/leave.controller.js";
import { authenticate, allowRoles } from "../middleware/auth.middleware.js";
import { UserRole } from "../config/roles.js";
import { authenticatedApiRateLimiter } from "../middleware/rateLimiter.middleware.js";

const router = express.Router();

// All leave endpoints require authentication
router.use(authenticate);

// Apply authenticated user rate limiting
router.use(authenticatedApiRateLimiter);

// Employee & Manager & HR Admin routes
router.post("/", allowRoles(UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.HR_ADMIN), applyLeaveController);
router.get("/my", allowRoles(UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.HR_ADMIN), getMyLeavesController);

// Super Admin & HR Admin routes for viewing all leaves
router.get("/", allowRoles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN), getAllLeavesController);

// Super Admin route for approving/rejecting leave
router.patch("/:id/status", allowRoles(UserRole.SUPER_ADMIN), updateLeaveStatusController);

export default router;

