import { useCallback } from "react";
import { useAuth } from "./useAuth";
import { useNotificationContext } from "../context/NotificationContext";
import { notificationService } from "../services/notificationService";

export function useNotifications() {
  const { token } = useAuth();
  const {
    notifications,
    setNotifications,
    unreadCount,
    loading,
    error,
  } = useNotificationContext();

  const fetchNotifications = useCallback(async () => {
    if (!token) return [];
    try {
      const result = await notificationService.getAll(token);
      const list = result?.notifications || [];
      setNotifications(list);
      return list;
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      return [];
    }
  }, [token, setNotifications]);

  const notify = useCallback(
    async (title, description, type = "general") => {
      if (!token) {
        console.error("Cannot create notification: user is not logged in.");
        return null;
      }

      try {
        const result = await notificationService.create(token, {
          title,
          description,
          type,
        });

        const notification = result?.notification;
        if (notification) {
          setNotifications((current) => [notification, ...current]);
        }
        return notification || null;
      } catch (err) {
        console.error("Failed to create notification:", err);
        return null;
      }
    },
    [token, setNotifications]
  );

  const markRead = useCallback(
    async (id) => {
      if (!token || !id) return;
      try {
        const result = await notificationService.markRead(token, id);
        const updated = result?.notification;
        if (updated) {
          setNotifications((current) =>
            current.map((n) => (n.id === id ? updated : n))
          );
        }
      } catch (err) {
        console.error("Failed to mark notification as read:", err);
      }
    },
    [token, setNotifications]
  );

  const markAllRead = useCallback(async () => {
    if (!token) return;
    try {
      await notificationService.markAllRead(token);
      setNotifications((current) =>
        current.map((n) => ({ ...n, read: true }))
      );
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  }, [token, setNotifications]);

  const deleteNotification = useCallback(
    async (id) => {
      if (!token || !id) return false;
      try {
        await notificationService.delete(token, id);
        setNotifications((current) => current.filter((n) => n.id !== id));
        return true;
      } catch (err) {
        console.error("Failed to delete notification:", err);
        return false;
      }
    },
    [token, setNotifications]
  );

  const clearAllNotifications = useCallback(async () => {
    if (!token) return false;
    try {
      await notificationService.clearAll(token);
      setNotifications([]);
      return true;
    } catch (err) {
      console.error("Failed to clear notifications:", err);
      return false;
    }
  }, [token, setNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    notify,
    markRead,
    readNotification: markRead,
    markAllRead,
    readAllNotifications: markAllRead,
    deleteNotification,
    removeNotification: deleteNotification,
    clearAllNotifications,
    clearNotifications: clearAllNotifications,
  };
}

export default useNotifications;
