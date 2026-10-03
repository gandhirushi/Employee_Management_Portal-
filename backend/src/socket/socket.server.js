import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { SocketEvents } from "./socket.events.js";

let io = null;

/**
 * Initialize Socket.IO with an HTTP server
 * @param {import("http").Server} httpServer
 * @returns {Server}
 */
export function initSocketServer(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Authentication middleware: verify JWT from handshake auth token
  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        (socket.handshake.headers?.authorization?.startsWith("Bearer ")
          ? socket.handshake.headers.authorization.split(" ")[1]
          : null);

      if (!token) {
        return next(new Error("Authentication required: Token missing."));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = {
        id: decoded.userId,
        role: decoded.role || null,
      };

      next();
    } catch (error) {
      console.error("[SOCKET AUTH ERROR]", error.message);
      return next(new Error("Authentication failed: Invalid or expired token."));
    }
  });

  // Client connection handler
  io.on("connection", (socket) => {
    const { id, role } = socket.user;

    // Join isolated personal user room
    socket.join(`user_${id}`);

    // Join role room if role exists
    if (role) {
      socket.join(`role_${role}`);
    }

    console.log(
      `[SOCKET CONNECTED] Socket ID: ${socket.id} | User ID: ${id} | Role: ${role}`
    );

    socket.on(SocketEvents.CHAT_TYPING, ({ recipientId, conversationId }) => {
      if (recipientId) {
        emitToUser(recipientId, SocketEvents.CHAT_TYPING, {
          userId: id,
          conversationId,
        });
      }
    });

    socket.on(SocketEvents.CHAT_STOP_TYPING, ({ recipientId, conversationId }) => {
      if (recipientId) {
        emitToUser(recipientId, SocketEvents.CHAT_STOP_TYPING, {
          userId: id,
          conversationId,
        });
      }
    });

    socket.on(SocketEvents.DISCONNECT, (reason) => {
      console.log(
        `[SOCKET DISCONNECTED] Socket ID: ${socket.id} | User ID: ${id} | Reason: ${reason}`
      );
    });
  });

  return io;
}

/**
 * Get active Socket.IO server instance
 * @returns {Server}
 */

export function getIO() {
  if (!io) {
    throw new Error("Socket.IO has not been initialized yet.");
  }
  return io;
}

/**
 * Emit event to a specific user's private room
 * @param {string} userId
 * @param {string} event
 * @param {any} payload
 */

export function emitToUser(userId, event, payload) {
  if (!io) return;
  io.to(`user_${userId}`).emit(event, payload);
}

/**
 * Emit event to all connected users in a specific role
 * @param {string} role
 * @param {string} event
 * @param {any} payload
 */
export function emitToRole(role, event, payload) {
  if (!io) return;
  io.to(`role_${role}`).emit(event, payload);
}

/**
 * Emit event to multiple roles
 * @param {string[]} roles
 * @param {string} event
 * @param {any} payload
 */

export function emitToRoles(roles, event, payload) {
  if (!io || !Array.isArray(roles)) return;
  roles.forEach((role) => {
    io.to(`role_${role}`).emit(event, payload);
  });
}

export { SocketEvents };

