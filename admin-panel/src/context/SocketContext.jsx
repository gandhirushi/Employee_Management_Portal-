import { createContext, useContext, useEffect, useState, useRef, useMemo } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { useNotificationContext } from "./NotificationContext";
import { useToast } from "./ToastContext";
import { SOCKET_URL } from "../config/env";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { token } = useAuth();
  const {
    addNotification,
    handleNotificationReadEvent,
    handleNotificationReadAllEvent,
    handleNotificationDeleteEvent,
  } = useNotificationContext();
  const { showToast } = useToast();

  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  // Keep latest callbacks in refs to avoid reconnecting socket when handlers update
  const handlersRef = useRef({
    addNotification,
    handleNotificationReadEvent,
    handleNotificationReadAllEvent,
    handleNotificationDeleteEvent,
    showToast,
  });

  useEffect(() => {
    handlersRef.current = {
      addNotification,
      handleNotificationReadEvent,
      handleNotificationReadAllEvent,
      handleNotificationDeleteEvent,
      showToast,
    };
  }, [
    addNotification,
    handleNotificationReadEvent,
    handleNotificationReadAllEvent,
    handleNotificationDeleteEvent,
    showToast,
  ]);

  useEffect(() => {
    if (!token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    const socketInstance = io(SOCKET_URL, {
      auth: {
        token,
      },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketInstance.on("connect", () => {
      console.log("[SOCKET CLIENT] Connected successfully:", socketInstance.id);
      setConnected(true);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("[SOCKET CLIENT] Disconnected:", reason);
      setConnected(false);
    });

    socketInstance.on("connect_error", (error) => {
      console.warn("[SOCKET CLIENT] Connection error:", error.message);
      setConnected(false);
    });

    // Real-time incoming notification
    socketInstance.on("notification:new", (notification) => {
      console.log("[SOCKET CLIENT] New notification received:", notification);
      handlersRef.current.addNotification(notification);

      // Map notification types to toast feedback types
      const toastType =
        notification.type === "danger"
          ? "error"
          : notification.type === "success"
          ? "success"
          : "info";

      handlersRef.current.showToast(notification.title, notification.description, toastType);
    });

    // Real-time sync for read/delete actions across multi-tab sessions
    socketInstance.on("notification:read", (data) => {
      if (data?.id) {
        handlersRef.current.handleNotificationReadEvent(data.id);
      }
    });

    socketInstance.on("notification:read_all", () => {
      handlersRef.current.handleNotificationReadAllEvent();
    });

    socketInstance.on("notification:delete", (data) => {
      if (data?.id) {
        handlersRef.current.handleNotificationDeleteEvent(data.id);
      }
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
      setSocket(null);
      setConnected(false);
    };
  }, [token]);

  const value = useMemo(() => ({ socket, connected }), [socket, connected]);

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  return ctx;
}

export default SocketContext;
