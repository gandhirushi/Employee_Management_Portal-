import { api } from "../api/client";

export const notificationService = {
  getAll: (token) => api.notifications.getAll(token),
  create: (token, data) => api.notifications.create(token, data),
  markRead: (token, id) => api.notifications.markRead(token, id),
  markAllRead: (token) => api.notifications.markAllRead(token),
  delete: (token, id) => api.notifications.delete(token, id),
  clearAll: (token) => api.notifications.clearAll(token),
};

export default notificationService;
