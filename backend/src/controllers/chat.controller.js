import {
  getOrCreateConversation,
  getUserConversations,
  getConversationMessages,
  sendMessage,
  editMessage,
  markMessagesAsRead,
  getUnreadCount,
} from "../services/chat.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getConversationsController = asyncHandler(async (req, res) => {
  const conversations = await getUserConversations(req.user.id);

  res.json({
    success: true,
    conversations,
  });
});

export const startConversationController = asyncHandler(async (req, res) => {
  const conversation = await getOrCreateConversation({
    currentUserId: req.user.id,
    employeeId: req.body.employeeId,
    targetUserId: req.body.targetUserId,
    callerRole: req.user.role,
  });

  res.status(200).json({
    success: true,
    conversation,
  });
});

export const getMessagesController = asyncHandler(async (req, res) => {
  const result = await getConversationMessages(
    req.user.id,
    req.params.id,
    req.query
  );

  res.json({
    success: true,
    ...result,
  });
});

export const postMessageController = asyncHandler(async (req, res) => {
  const message = await sendMessage(
    req.user.id,
    req.params.id,
    req.body.content
  );

  res.status(201).json({
    success: true,
    message,
  });
});

export const markReadController = asyncHandler(async (req, res) => {
  const result = await markMessagesAsRead(req.user.id, req.params.id);

  res.json({
    success: true,
    ...result,
  });
});

export const getUnreadCountController = asyncHandler(async (req, res) => {
  const result = await getUnreadCount(req.user.id);

  res.json({
    success: true,
    ...result,
  });
});

export const editMessageController = asyncHandler(async (req, res) => {
  const message = await editMessage(
    req.user.id,
    req.params.messageId,
    req.body.content
  );

  res.json({
    success: true,
    message,
  });
});
