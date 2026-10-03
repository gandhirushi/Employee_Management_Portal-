import express from "express";

import {
  signup,
  login,
  googleAuth,
  me,
  profile,
  password,
  uploadAdminPhoto,
  removeAdminPhoto,
} from "../controllers/auth.controller.js";

import { requireAuth } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";
import { validateSignup } from "../middleware/validateSignup.middleware.js";
import {
  loginRateLimiter,
  signupRateLimiter,
  passwordResetRateLimiter,
  authenticatedApiRateLimiter,
} from "../middleware/rateLimiter.middleware.js";

const router = express.Router();

router.post("/google", signupRateLimiter, googleAuth);

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Practise
 *     description: Learning Swagger
 *     responses:
 *       200:
 *         description: On success
 *     requestBody:
 *       requried: true
 *       content:
 *          application/json:
 *              schema:
 *                 type: object
 *                 properties:
 *                       fullName:
 *                          type: string
 *                       email:
 *                          type: string
 *                       password:
 *                          type: string
 */

router.post("/signup", signupRateLimiter, validateSignup, signup);

router.post("/login", loginRateLimiter, login);

router.get("/me", requireAuth, authenticatedApiRateLimiter, me);

router.patch("/profile", requireAuth, authenticatedApiRateLimiter, profile);

router.post("/profile/photo", requireAuth, upload.single("photo"), uploadAdminPhoto);

router.delete("/profile/photo", requireAuth, authenticatedApiRateLimiter, removeAdminPhoto);

router.patch("/password", requireAuth, passwordResetRateLimiter, password);

export default router;