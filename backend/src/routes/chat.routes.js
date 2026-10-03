import express from "express";
import {
  getConversationsController,
  startConversationController,
  getMessagesController,
  postMessageController,
  markReadController,
  getUnreadCountController,
  editMessageController,
} from "../controllers/chat.controller.js";
import { authenticate, allowRoles } from "../middleware/auth.middleware.js";
import { authenticatedApiRateLimiter } from "../middleware/rateLimiter.middleware.js";
import { UserRole } from "../config/roles.js";

const router = express.Router();

// All chat endpoints require authentication and user-level rate limiting
router.use(authenticate);
router.use(authenticatedApiRateLimiter);

// List conversations for current user
router.get("/conversations", getConversationsController);

// Initiate or retrieve conversation with employee (Super Admin, HR Admin, Manager)
router.post(
  "/conversations",
  allowRoles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.MANAGER),
  startConversationController
);

// Global unread messages count for badge
router.get("/unread-count", getUnreadCountController);

// Get paginated message history for a conversation
router.get("/conversations/:id/messages", getMessagesController);

// Send a message in a conversation
router.post("/conversations/:id/messages", postMessageController);

// Mark messages in a conversation as read
router.patch("/conversations/:id/read", markReadController);

// Edit an existing message (Sender only)
router.patch("/messages/:messageId", editMessageController);

export default router;

