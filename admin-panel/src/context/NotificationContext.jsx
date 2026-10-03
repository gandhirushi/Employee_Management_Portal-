import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useAuth } from "./AuthContext";
import { notificationService } from "../services/notificationService";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { token, user } = useAuth();
  const userId = user?.id ?? null;

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load notifications from server on login
  useEffect(() => {
    if (!token || !userId) {
      setNotifications([]);
      return;
    }

    let cancelled = false;

    async function loadNotifications() {
      setLoading(true);
      setError(null);
      try {
        const result = await notificationService.getAll(token);
        if (!cancelled) {
          setNotifications(result?.notifications || []);
        }
      } catch (err) {
        console.error("Failed to load notifications:", err);
        if (!cancelled) {
          setError(err.message || "Failed to load notifications");
          setNotifications([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadNotifications();

    return () => {
      cancelled = true;
    };
  }, [token, userId]);

  // Real-time synchronization handlers (called by SocketContext)
  const addNotification = useCallback((newNotif) => {
    if (!newNotif || !newNotif.id) return;
    setNotifications((current) => {
      if (current.some((n) => n.id === newNotif.id)) {
        return current;
      }
      return [newNotif, ...current];
    });
  }, []);

  const handleNotificationReadEvent = useCallback((id) => {
    setNotifications((current) =>
      current.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const handleNotificationReadAllEvent = useCallback(() => {
    setNotifications((current) =>
      current.map((n) => ({ ...n, read: true }))
    );
  }, []);

  const handleNotificationDeleteEvent = useCallback((id) => {
    setNotifications((current) => current.filter((n) => n.id !== id));
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const value = useMemo(
    () => ({
      notifications,
      setNotifications,
      unreadCount,
      loading,
      error,
      addNotification,
      handleNotificationReadEvent,
      handleNotificationReadAllEvent,
      handleNotificationDeleteEvent,
    }),
    [
      notifications,
      unreadCount,
      loading,
      error,
      addNotification,
      handleNotificationReadEvent,
      handleNotificationReadAllEvent,
      handleNotificationDeleteEvent,
    ]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error(
      "useNotificationContext must be used within NotificationProvider"
    );
  }
  return ctx;
}

export default NotificationContext;
