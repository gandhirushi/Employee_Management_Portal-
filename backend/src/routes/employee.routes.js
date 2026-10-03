import express from "express";

import {
  listEmployees,
  getEmployee,
  postEmployee,
  putEmployee,
  patchEmployee,
  removeEmployee,
  uploadPhoto,
  removePhoto,
  changeRole,
  onboardEmployee,
  getDashboardStatsController,
} from "../controllers/employee.controller.js";

import { authenticate, allowRoles } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";
import { UserRole } from "../config/roles.js";
import { authenticatedApiRateLimiter } from "../middleware/rateLimiter.middleware.js";

const router = express.Router();

// All employee routes require authentication first
router.use(authenticate);

// Apply authenticated user rate limiting
router.use(authenticatedApiRateLimiter);

// Employee onboarding — EMPLOYEE only
router.post("/onboarding", allowRoles(UserRole.EMPLOYEE), upload.single("photo"), onboardEmployee);

// View employees list — SUPER_ADMIN, HR_ADMIN, MANAGER
router.get("/", allowRoles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.MANAGER), listEmployees);

// Dashboard stats — SUPER_ADMIN, HR_ADMIN, MANAGER
router.get("/dashboard/stats", allowRoles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.MANAGER), getDashboardStatsController);

// View single employee detail — SUPER_ADMIN, HR_ADMIN, MANAGER, or self (EMPLOYEE)
router.get("/:id", allowRoles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE), getEmployee);

// Create employee — SUPER_ADMIN, HR_ADMIN only
router.post("/", allowRoles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN), upload.single("photo"), postEmployee);

// Update employee — SUPER_ADMIN, HR_ADMIN only
router.put("/:id", allowRoles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN), upload.single("photo"), putEmployee);

router.patch("/:id", allowRoles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN), upload.single("photo"), patchEmployee);

// Photo management — SUPER_ADMIN, HR_ADMIN only
router.patch("/:id/photo", allowRoles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN), upload.single("photo"), uploadPhoto);

router.delete("/:id/photo", allowRoles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN), removePhoto);

// Change employee role — SUPER_ADMIN only
router.patch("/:id/role", allowRoles(UserRole.SUPER_ADMIN), changeRole);

// Delete employee — SUPER_ADMIN only
router.delete("/:id", allowRoles(UserRole.SUPER_ADMIN), removeEmployee);

export default router;