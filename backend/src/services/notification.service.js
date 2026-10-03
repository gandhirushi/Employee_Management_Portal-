import prisma from "../prisma/client.js";
import { AppError } from "../utils/AppError.js";
import { emitToUser } from "../socket/socket.server.js";
import { SocketEvents } from "../socket/socket.events.js";

export async function getNotifications(userId) {
  return prisma.notification.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function createNotification(
  userId,
  data
) {
  const notification = await prisma.notification.create({
    data: {
      userId,
      title: data.title,
      description: data.description,
      type: data.type || "general",
    },
  });

  try {
    emitToUser(userId, SocketEvents.NOTIFICATION_NEW, notification);
  } catch (err) {
    console.error("[SOCKET EMIT ERROR]", err);
  }

  return notification;
}

/**
 * Creates and delivers notifications to all users with specific roles
 * @param {string|string[]} roles
 * @param {{ title: string, description: string, type?: string }} data
 */
export async function createNotificationForRoles(roles, data) {
  const roleList = Array.isArray(roles) ? roles : [roles];
  const targetUsers = await prisma.user.findMany({
    where: {
      role: { in: roleList },
    },
    select: { id: true },
  });

  const createdNotifications = [];
  for (const targetUser of targetUsers) {
    try {
      const notif = await prisma.notification.create({
        data: {
          userId: targetUser.id,
          title: data.title,
          description: data.description,
          type: data.type || "info",
        },
      });
      createdNotifications.push(notif);
      emitToUser(targetUser.id, SocketEvents.NOTIFICATION_NEW, notif);
    } catch (err) {
      console.error(`[NOTIF DISPATCH ERROR] Failed for user ${targetUser.id}:`, err);
    }
  }

  return createdNotifications;
}


export async function markNotificationAsRead(
  userId,
  id
) {
  const notification =
    await prisma.notification.findFirst({
      where: {
        id,
        userId,
      },
    });

  if (!notification) {
    throw new AppError("Notification not found.", 404);
  }

  const updated = await prisma.notification.update({
    where: {
      id,
    },
    data: {
      read: true,
    },
  });

  try {
    emitToUser(userId, SocketEvents.NOTIFICATION_READ, { id });
  } catch (err) {}

  return updated;
}

export async function markAllNotificationsAsRead(
  userId
) {
  await prisma.notification.updateMany({
    where: {
      userId,
      read: false,
    },
    data: {
      read: true,
    },
  });

  try {
    emitToUser(userId, SocketEvents.NOTIFICATION_READ_ALL, {});
  } catch (err) {}
}

export async function deleteNotification(
  userId,
  id
) {
  const notification =
    await prisma.notification.findFirst({
      where: {
        id,
        userId,
      },
    });

  if (!notification) {
    throw new AppError("Notification not found.", 404);
  }

  await prisma.notification.delete({
    where: {
      id,
    },
  });

  try {
    emitToUser(userId, SocketEvents.NOTIFICATION_DELETE, { id });
  } catch (err) {}
}

export async function clearNotifications(
  userId
) {
  await prisma.notification.deleteMany({
    where: {
      userId,
    },
  });

  try {
    emitToUser(userId, SocketEvents.NOTIFICATION_READ_ALL, { clearedAll: true });
  } catch (err) {}
}