export const SocketEvents = Object.freeze({
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  NOTIFICATION_NEW: "notification:new",
  NOTIFICATION_READ: "notification:read",
  NOTIFICATION_READ_ALL: "notification:read_all",
  NOTIFICATION_DELETE: "notification:delete",
  
  CHAT_MESSAGE_SENT: "chat:message_sent",
  CHAT_MESSAGE_RECEIVED: "chat:message_received",
  CHAT_MESSAGE_EDITED: "chat:message_edited",
  CHAT_MESSAGES_READ: "chat:messages_read",
  CHAT_TYPING: "chat:typing",
  CHAT_STOP_TYPING: "chat:stop_typing",
});
