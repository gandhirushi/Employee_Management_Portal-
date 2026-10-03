import bcrypt from "bcryptjs";
import prisma from "../prisma/client.js";
import { AppError } from "../utils/AppError.js";
import { emitToUser, SocketEvents } from "../socket/socket.server.js";
import { UserRole } from "../config/roles.js";

const DEFAULT_EMPLOYEE_PASSWORD = "Admin@123";
const BCRYPT_SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;

/**
 * Computes a deterministic canonical conversation identifier from two user IDs.
 */
export function getConversationId(userId1, userId2) {
  if (!userId1 || !userId2) return "";
  return [userId1, userId2].sort().join(":");
}

/**
 * Resolves the counterpart user ID from either a canonical conversation ID ('userA:userB')
 * or a direct target user ID.
 */
export function resolveTargetUserId(currentUserId, conversationIdOrUserId) {
  if (!conversationIdOrUserId) return null;
  if (conversationIdOrUserId.includes(":")) {
    const [id1, id2] = conversationIdOrUserId.split(":");
    return id1 === currentUserId ? id2 : id1;
  }
  return conversationIdOrUserId;
}

function formatMessage(msg) {
  const conversationId = getConversationId(msg.senderId, msg.receiverId);
  return {
    id: msg.id,
    conversationId,
    senderId: msg.senderId,
    receiverId: msg.receiverId,
    content: msg.content,
    read: msg.read,
    readAt: msg.readAt,
    isEdited: Boolean(msg.isEdited),
    editedAt: msg.editedAt || null,
    createdAt: msg.createdAt,
    updatedAt: msg.updatedAt,
    sender: msg.sender
      ? {
          id: msg.sender.id,
          fullName: msg.sender.fullName,
          role: msg.sender.role,
          profilePhoto: msg.sender.profilePhoto || null,
        }
      : null,
  };
}

function resolveTargetUserProfile(otherParticipant, employeeRecord) {
  if (!otherParticipant) return null;
  const emp =
    employeeRecord ||
    (otherParticipant.employees && otherParticipant.employees[0]) ||
    null;

  const roleLabel = otherParticipant.role
    ? otherParticipant.role
        .replace("_", " ")
        .replace(/\b\w/g, (l) => l.toUpperCase())
    : "Employee";

  return {
    id: otherParticipant.id,
    fullName: otherParticipant.fullName,
    email: otherParticipant.email,
    role: otherParticipant.role,
    roleLabel,
    profilePhoto: emp?.profilePhoto || otherParticipant.profilePhoto || null,
    department: emp?.department || "Management",
    position: emp?.position || roleLabel,
  };
}

/**
 * Find or initialize a 1-to-1 chat context with an employee/target user.
 * Automatically provisions/links a User account for legacy employees if missing.
 */
export async function getOrCreateConversation({
  currentUserId,
  employeeId,
  targetUserId,
  callerRole,
}) {
  let finalTargetUserId = targetUserId;
  let employee = null;

  if (employeeId) {
    employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { user: true },
    });

    if (!employee) {
      throw new AppError("Employee not found.", 404);
    }

    // Check if target user exists matching employee email
    let userRecord = await prisma.user.findUnique({
      where: { email: employee.email },
    });

    if (!userRecord) {
      // Auto-provision user account for legacy employee
      const passwordHash = await bcrypt.hash(
        DEFAULT_EMPLOYEE_PASSWORD,
        BCRYPT_SALT_ROUNDS
      );

      userRecord = await prisma.user.create({
        data: {
          fullName: employee.fullName,
          email: employee.email,
          passwordHash,
          avatarSeed: employee.fullName,
          profilePhoto: employee.profilePhoto || null,
          role: employee.role || UserRole.EMPLOYEE,
          isOnboarded: true,
          authProvider: "local",
          emailVerified: false,
          settings: {
            create: {},
          },
        },
      });

      // Relink employee record to the newly provisioned user
      await prisma.employee.update({
        where: { id: employee.id },
        data: { userId: userRecord.id },
      });
    } else if (employee.userId !== userRecord.id) {
      // Relink employee record if mismatched
      await prisma.employee.update({
        where: { id: employee.id },
        data: { userId: userRecord.id },
      });
    }

    finalTargetUserId = userRecord.id;
  }

  if (!finalTargetUserId) {
    throw new AppError("Target employee or user ID is required.", 400);
  }

  if (currentUserId === finalTargetUserId) {
    throw new AppError("You cannot start a chat with yourself.", 400);
  }

  // Ensure target user exists
  const targetUser = await prisma.user.findUnique({
    where: { id: finalTargetUserId },
    include: { employees: true },
  });

  if (!targetUser) {
    throw new AppError("Target user not found.", 404);
  }

  // Role authorization: Only authorized roles can initiate brand new chats
  const allowedInitiators = [
    UserRole.SUPER_ADMIN,
    UserRole.HR_ADMIN,
    UserRole.MANAGER,
  ];
  if (callerRole && !allowedInitiators.includes(callerRole)) {
    const existingMsg = await prisma.chatMessage.findFirst({
      where: {
        OR: [
          { senderId: currentUserId, receiverId: finalTargetUserId },
          { senderId: finalTargetUserId, receiverId: currentUserId },
        ],
      },
    });
    if (!existingMsg) {
      throw new AppError(
        "Only Super Admins, HR Admins, and Managers can initiate conversations.",
        403
      );
    }
  }

  const convId = getConversationId(currentUserId, finalTargetUserId);
  const resolvedEmployee = employee || targetUser.employees[0] || null;

  // Get unread count for current user from this target
  const unreadCount = await prisma.chatMessage.count({
    where: {
      senderId: finalTargetUserId,
      receiverId: currentUserId,
      read: false,
    },
  });

  // Get last message between the two users
  const lastMessage = await prisma.chatMessage.findFirst({
    where: {
      OR: [
        { senderId: currentUserId, receiverId: finalTargetUserId },
        { senderId: finalTargetUserId, receiverId: currentUserId },
      ],
    },
    orderBy: { createdAt: "desc" },
    include: {
      sender: {
        select: { id: true, fullName: true, role: true, profilePhoto: true },
      },
    },
  });

  return {
    id: convId,
    targetUserId: finalTargetUserId,
    employeeId: resolvedEmployee?.id || null,
    createdAt: lastMessage ? lastMessage.createdAt : new Date(),
    updatedAt: lastMessage ? lastMessage.createdAt : new Date(),
    targetUser: resolveTargetUserProfile(targetUser, resolvedEmployee),
    unreadCount,
    lastMessage: lastMessage ? formatMessage(lastMessage) : null,
  };
}

/**
 * List all active conversations for the authenticated user, derived from the single chat_messages table.
 */
export async function getUserConversations(userId) {
  // Query all messages involving current user, newest first
  const messages = await prisma.chatMessage.findMany({
    where: {
      OR: [{ senderId: userId }, { receiverId: userId }],
    },
    orderBy: { createdAt: "desc" },
    include: {
      sender: {
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          profilePhoto: true,
          employees: true,
        },
      },
      receiver: {
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          profilePhoto: true,
          employees: true,
        },
      },
    },
  });

  // Deduplicate conversations by partner ID, keeping the latest message
  const partnerMap = new Map();
  for (const msg of messages) {
    const otherUser = msg.senderId === userId ? msg.receiver : msg.sender;
    if (!otherUser) continue;
    if (!partnerMap.has(otherUser.id)) {
      partnerMap.set(otherUser.id, {
        otherUser,
        lastMessage: msg,
      });
    }
  }

  const partnerIds = Array.from(partnerMap.keys());
  if (partnerIds.length === 0) {
    return [];
  }

  // Single aggregated query to count unread messages received from each partner
  const unreadCounts = await prisma.chatMessage.groupBy({
    by: ["senderId"],
    where: {
      receiverId: userId,
      senderId: { in: partnerIds },
      read: false,
    },
    _count: {
      id: true,
    },
  });

  const unreadCountMap = new Map();
  unreadCounts.forEach((item) => {
    unreadCountMap.set(item.senderId, item._count.id);
  });

  return Array.from(partnerMap.values()).map(({ otherUser, lastMessage }) => {
    const unreadCount = unreadCountMap.get(otherUser.id) || 0;
    const emp = otherUser.employees?.[0] || null;
    const convId = getConversationId(userId, otherUser.id);

    return {
      id: convId,
      targetUserId: otherUser.id,
      employeeId: emp?.id || null,
      createdAt: lastMessage.createdAt,
      updatedAt: lastMessage.createdAt,
      targetUser: resolveTargetUserProfile(otherUser, emp),
      unreadCount,
      lastMessage: formatMessage(lastMessage),
    };
  });
}

/**
 * Fetch paginated messages between the authenticated user and their chat partner.
 */
export async function getConversationMessages(
  userId,
  conversationId,
  { page = 1, limit = 50 }
) {
  const otherUserId = resolveTargetUserId(userId, conversationId);

  if (!otherUserId) {
    throw new AppError("Invalid conversation identifier.", 400);
  }

  const otherUser = await prisma.user.findUnique({
    where: { id: otherUserId },
  });

  if (!otherUser) {
    throw new AppError("Participant user not found.", 404);
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const take = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
  const skip = (pageNum - 1) * take;

  const whereCondition = {
    OR: [
      { senderId: userId, receiverId: otherUserId },
      { senderId: otherUserId, receiverId: userId },
    ],
  };

  const [messages, totalCount] = await Promise.all([
    prisma.chatMessage.findMany({
      where: whereCondition,
      orderBy: { createdAt: "asc" },
      skip,
      take,
      include: {
        sender: {
          select: { id: true, fullName: true, role: true, profilePhoto: true },
        },
      },
    }),
    prisma.chatMessage.count({ where: whereCondition }),
  ]);

  return {
    messages: messages.map(formatMessage),
    totalCount,
    page: pageNum,
    limit: take,
  };
}

/**
 * Post a new message in the chat.
 */
export async function sendMessage(userId, conversationId, content) {
  if (!content || typeof content !== "string" || !content.trim()) {
    throw new AppError("Message content cannot be empty.", 400);
  }

  const trimmedContent = content.trim();
  if (trimmedContent.length > 2000) {
    throw new AppError("Message content cannot exceed 2000 characters.", 400);
  }

  const receiverId = resolveTargetUserId(userId, conversationId);
  if (!receiverId) {
    throw new AppError("Recipient ID is required.", 400);
  }

  if (userId === receiverId) {
    throw new AppError("You cannot send messages to yourself.", 400);
  }

  const receiverUser = await prisma.user.findUnique({
    where: { id: receiverId },
  });

  if (!receiverUser) {
    throw new AppError("Recipient user not found.", 404);
  }

  const message = await prisma.chatMessage.create({
    data: {
      senderId: userId,
      receiverId,
      content: trimmedContent,
    },
    include: {
      sender: {
        select: { id: true, fullName: true, role: true, profilePhoto: true },
      },
    },
  });

  const formattedMessage = formatMessage(message);

  // Real-time dispatch via Socket.IO directly to recipient and sender user rooms
  emitToUser(receiverId, SocketEvents.CHAT_MESSAGE_RECEIVED, formattedMessage);
  emitToUser(userId, SocketEvents.CHAT_MESSAGE_SENT, formattedMessage);

  return formattedMessage;
}

/**
 * Mark all incoming messages in a conversation as read.
 */
export async function markMessagesAsRead(userId, conversationId) {
  const otherParticipantId = resolveTargetUserId(userId, conversationId);

  if (!otherParticipantId) {
    throw new AppError("Invalid conversation identifier.", 400);
  }

  const now = new Date();
  const updateResult = await prisma.chatMessage.updateMany({
    where: {
      senderId: otherParticipantId,
      receiverId: userId,
      read: false,
    },
    data: {
      read: true,
      readAt: now,
    },
  });

  const convId = getConversationId(userId, otherParticipantId);

  if (updateResult.count > 0) {
    emitToUser(otherParticipantId, SocketEvents.CHAT_MESSAGES_READ, {
      conversationId: convId,
      readBy: userId,
      readAt: now,
      count: updateResult.count,
    });
  }

  return { success: true, count: updateResult.count };
}

/**
 * Get overall unread messages count for a user across all conversations.
 */
export async function getUnreadCount(userId) {
  const unreadCount = await prisma.chatMessage.count({
    where: {
      receiverId: userId,
      read: false,
    },
  });

  return { unreadCount };
}

/**
 * Edit an existing chat message.
 * Only the original sender is authorized to edit their own message.
 */
export async function editMessage(userId, messageId, content) {
  if (!content || typeof content !== "string" || !content.trim()) {
    throw new AppError("Message content cannot be empty.", 400);
  }

  const trimmedContent = content.trim();
  if (trimmedContent.length > 2000) {
    throw new AppError("Message content cannot exceed 2000 characters.", 400);
  }

  const message = await prisma.chatMessage.findUnique({
    where: { id: messageId },
    include: {
      sender: {
        select: { id: true, fullName: true, role: true, profilePhoto: true },
      },
    },
  });

  if (!message) {
    throw new AppError("Message not found.", 404);
  }

  // Authorization check: User must be the sender
  if (message.senderId !== userId) {
    throw new AppError("You are not authorized to edit this message.", 403);
  }

  const now = new Date();
  const updatedMessage = await prisma.chatMessage.update({
    where: { id: messageId },
    data: {
      content: trimmedContent,
      isEdited: true,
      editedAt: now,
    },
    include: {
      sender: {
        select: { id: true, fullName: true, role: true, profilePhoto: true },
      },
    },
  });

  const formattedMessage = formatMessage(updatedMessage);

  // Real-time dispatch via Socket.IO directly to recipient and sender user rooms
  emitToUser(message.receiverId, SocketEvents.CHAT_MESSAGE_EDITED, formattedMessage);
  emitToUser(userId, SocketEvents.CHAT_MESSAGE_EDITED, formattedMessage);

  return formattedMessage;
}
