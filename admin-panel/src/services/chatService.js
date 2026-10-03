import { api } from "../api/client";

export const chatService = {
  getConversations: (token) => api.chat.getConversations(token),
  startConversation: (token, payload) => api.chat.startConversation(token, payload),
  getMessages: (token, conversationId, options) => api.chat.getMessages(token, conversationId, options),
  sendMessage: (token, conversationId, content) => api.chat.sendMessage(token, conversationId, content),
  editMessage: (token, messageId, content) => api.chat.editMessage(token, messageId, content),
  markRead: (token, conversationId) => api.chat.markRead(token, conversationId),
  getUnreadCount: (token) => api.chat.getUnreadCount(token),
};

export default chatService;
