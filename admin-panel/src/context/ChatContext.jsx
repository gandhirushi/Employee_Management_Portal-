import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useAuth } from "./AuthContext";
import { useSocket } from "./SocketContext";
import { useToast } from "./ToastContext";
import { chatService } from "../services/chatService";

export const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const { token, user } = useAuth();
  const { socket } = useSocket();
  const { showToast } = useToast();

  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeUnreadCount, setActiveUnreadCount] = useState(0);
  const [isOtherTyping, setIsOtherTyping] = useState(false);

  // Refs for tracking current state inside socket callbacks
  const activeConversationRef = useRef(activeConversation);
  activeConversationRef.current = activeConversation;

  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;

  const isMinimizedRef = useRef(isMinimized);
  isMinimizedRef.current = isMinimized;

  // Fetch all conversations for the logged in user (Admin, Manager, or Employee)
  const fetchConversations = useCallback(async () => {
    if (!token) return;
    setLoadingConversations(true);
    try {
      const res = await chatService.getConversations(token);
      const convList = res.conversations || [];
      setConversations(convList);

      // Total unread count calculated from conversations
      const totalUnread = convList.reduce(
        (acc, c) => acc + (c.unreadCount || 0),
        0
      );
      setUnreadCount(totalUnread);
    } catch (err) {
      console.warn("Failed to fetch conversations:", err);
    } finally {
      setLoadingConversations(false);
    }
  }, [token]);

  // Initial load on mount or session change
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Open chat directly with an existing conversation object
  const openConversation = useCallback(
    async (conv) => {
      if (!token || !conv) return;

      setActiveConversation(conv);
      setIsOpen(true);
      setIsMinimized(false);
      setActiveUnreadCount(0);
      setLoading(true);

      try {
        const msgRes = await chatService.getMessages(token, conv.id, {
          page: 1,
          limit: 50,
        });
        setMessages(msgRes.messages || []);

        // If there were unread messages, mark them as read immediately
        if (conv.unreadCount > 0) {
          await chatService.markRead(token, conv.id);
          setConversations((prev) =>
            prev.map((c) => (c.id === conv.id ? { ...c, unreadCount: 0 } : c))
          );
          setUnreadCount((prev) => Math.max(0, prev - conv.unreadCount));
        }
      } catch (err) {
        console.error("Failed to load conversation messages:", err);
        showToast("Error", err.message || "Failed to load messages.", "error");
      } finally {
        setLoading(false);
      }
    },
    [token, showToast]
  );

  // Open chat with an employee from the table or directory
  const openChatWithEmployee = useCallback(
    async (employee) => {
      if (!token || !employee) return;

      setIsOpen(true);
      setIsMinimized(false);
      setActiveUnreadCount(0);
      setLoading(true);

      try {
        const res = await chatService.startConversation(token, {
          employeeId: employee.id,
          targetUserId: employee.userId || undefined,
        });

        const conv = res.conversation;
        const targetEmployee = {
          id: conv.targetUser?.id || employee.userId || employee.id,
          employeeId: employee.id,
          fullName: employee.fullName,
          email: employee.email,
          role: employee.role,
          profilePhoto:
            employee.profilePhoto || conv.targetUser?.profilePhoto || null,
          department: employee.department || conv.targetUser?.department || null,
          position: employee.position || conv.targetUser?.position || null,
          userId: conv.targetUser?.id || employee.userId,
        };

        const enrichedConv = {
          ...conv,
          targetUser: targetEmployee,
        };

        setActiveConversation(enrichedConv);

        // Load conversation message history
        const msgRes = await chatService.getMessages(token, conv.id, {
          page: 1,
          limit: 50,
        });
        setMessages(msgRes.messages || []);

        // Mark unread messages as read
        if (conv.unreadCount > 0) {
          await chatService.markRead(token, conv.id);
          fetchConversations();
        } else {
          fetchConversations();
        }
      } catch (error) {
        console.error("Failed to open chat:", error);
        showToast("Error", error.message || "Failed to start conversation.", "error");
        setIsOpen(false);
      } finally {
        setLoading(false);
      }
    },
    [token, showToast, fetchConversations]
  );

  const closeChat = useCallback(() => {
    setIsOpen(false);
    setIsMinimized(false);
    setActiveConversation(null);
    setMessages([]);
    setActiveUnreadCount(0);
    setIsOtherTyping(false);
  }, []);

  const minimizeChat = useCallback(() => {
    setIsMinimized(true);
  }, []);

  const restoreChat = useCallback(async () => {
    setIsMinimized(false);
    setActiveUnreadCount(0);

    if (activeConversationRef.current && token) {
      try {
        await chatService.markRead(token, activeConversationRef.current.id);
        fetchConversations();
      } catch (err) {
        console.warn("Error marking messages as read on restore:", err);
      }
    }
  }, [token, fetchConversations]);

  // Send message
  const sendMessage = useCallback(
    async (text) => {
      if (!token || !activeConversation || !text || !text.trim() || sending) {
        return;
      }

      const trimmed = text.trim();
      const tempId = `temp_${Date.now()}`;
      const optimisticMsg = {
        id: tempId,
        conversationId: activeConversation.id,
        senderId: user?.id,
        receiverId: activeConversation.targetUser?.id,
        content: trimmed,
        read: false,
        createdAt: new Date().toISOString(),
        sending: true,
        sender: {
          id: user?.id,
          fullName: user?.fullName || "You",
          role: user?.role,
          profilePhoto: user?.profilePhoto || null,
        },
      };

      setMessages((prev) => [...prev, optimisticMsg]);
      setSending(true);

      // Optimistically update conversation list preview
      setConversations((prev) => {
        const existingIdx = prev.findIndex((c) => c.id === activeConversation.id);
        if (existingIdx !== -1) {
          const existing = prev[existingIdx];
          const updated = {
            ...existing,
            lastMessage: optimisticMsg,
            updatedAt: optimisticMsg.createdAt,
          };
          const nextList = [...prev];
          nextList.splice(existingIdx, 1);
          return [updated, ...nextList];
        }
        return prev;
      });

      try {
        const res = await chatService.sendMessage(token, activeConversation.id, trimmed);
        const serverMsg = res.message;

        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? serverMsg : m))
        );

        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConversation.id
              ? { ...c, lastMessage: serverMsg, updatedAt: serverMsg.createdAt }
              : c
          )
        );
      } catch (err) {
        console.error("Failed to send message:", err);
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        showToast("Error", err.message || "Failed to send message.", "error");
      } finally {
        setSending(false);
      }
    },
    [token, activeConversation, sending, user, showToast]
  );

  // Edit message
  const editMessage = useCallback(
    async (messageId, newContent) => {
      if (!token || !messageId || !newContent || !newContent.trim()) {
        return;
      }

      const trimmed = newContent.trim();
      let previousMessages = [];

      setMessages((prev) => {
        previousMessages = prev;
        return prev.map((m) =>
          m.id === messageId
            ? { ...m, content: trimmed, isEdited: true, editedAt: new Date().toISOString() }
            : m
        );
      });

      setConversations((prev) =>
        prev.map((c) =>
          c.lastMessage?.id === messageId
            ? {
                ...c,
                lastMessage: {
                  ...c.lastMessage,
                  content: trimmed,
                  isEdited: true,
                  editedAt: new Date().toISOString(),
                },
              }
            : c
        )
      );

      try {
        const res = await chatService.editMessage(token, messageId, trimmed);
        const serverMsg = res.message;

        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? serverMsg : m))
        );

        setConversations((prev) =>
          prev.map((c) =>
            c.lastMessage?.id === messageId
              ? { ...c, lastMessage: serverMsg }
              : c
          )
        );

        return serverMsg;
      } catch (err) {
        console.error("Failed to edit message:", err);
        setMessages(previousMessages);
        showToast("Error", err.message || "Failed to edit message.", "error");
        throw err;
      }
    },
    [token, showToast]
  );

  // Send typing notifications
  const sendTyping = useCallback(() => {
    if (!socket || !activeConversation) return;
    socket.emit("chat:typing", {
      recipientId: activeConversation.targetUser?.id,
      conversationId: activeConversation.id,
    });
  }, [socket, activeConversation]);

  const sendStopTyping = useCallback(() => {
    if (!socket || !activeConversation) return;
    socket.emit("chat:stop_typing", {
      recipientId: activeConversation.targetUser?.id,
      conversationId: activeConversation.id,
    });
  }, [socket, activeConversation]);

  // Real-time socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Incoming message
    const handleMessageReceived = async (message) => {
      const active = activeConversationRef.current;
      const open = isOpenRef.current;
      const minimized = isMinimizedRef.current;
      const isViewingActive =
        active && active.id === message.conversationId && open && !minimized;

      // Update conversations list in real time
      setConversations((prev) => {
        const existingIdx = prev.findIndex((c) => c.id === message.conversationId);
        if (existingIdx !== -1) {
          const existing = prev[existingIdx];
          const updated = {
            ...existing,
            lastMessage: message,
            updatedAt: message.createdAt,
            unreadCount: isViewingActive
              ? 0
              : (existing.unreadCount || 0) + 1,
          };
          const nextList = [...prev];
          nextList.splice(existingIdx, 1);
          return [updated, ...nextList];
        } else {
          // If conversation wasn't in state, fetch fresh list
          fetchConversations();
          return prev;
        }
      });

      if (active && active.id === message.conversationId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });

        if (open && !minimized) {
          if (token) {
            try {
              await chatService.markRead(token, active.id);
            } catch (e) {
              console.warn("Could not mark message read:", e);
            }
          }
        } else {
          setActiveUnreadCount((c) => c + 1);
          setUnreadCount((c) => c + 1);
        }
      } else {
        setUnreadCount((c) => c + 1);
        showToast(
          `Message from ${message.sender?.fullName || "Admin"}`,
          message.content,
          "info"
        );
      }
    };

    // Read receipt confirmation
    const handleMessagesRead = (data) => {
      const active = activeConversationRef.current;
      if (active && active.id === data.conversationId) {
        setMessages((prev) =>
          prev.map((m) =>
            m.senderId === user?.id ? { ...m, read: true, readAt: data.readAt } : m
          )
        );
      }

      setConversations((prev) =>
        prev.map((c) =>
          c.id === data.conversationId
            ? {
                ...c,
                lastMessage: c.lastMessage
                  ? { ...c.lastMessage, read: true }
                  : null,
              }
            : c
        )
      );
    };

    // Typing indicators
    const handleTyping = (data) => {
      const active = activeConversationRef.current;
      if (active && active.id === data.conversationId) {
        setIsOtherTyping(true);
      }
    };

    const handleStopTyping = (data) => {
      const active = activeConversationRef.current;
      if (active && active.id === data.conversationId) {
        setIsOtherTyping(false);
      }
    };

    // Message edited event
    const handleMessageEdited = (updatedMessage) => {
      const active = activeConversationRef.current;
      if (active && active.id === updatedMessage.conversationId) {
        setMessages((prev) =>
          prev.map((m) => (m.id === updatedMessage.id ? updatedMessage : m))
        );
      }

      setConversations((prev) =>
        prev.map((c) =>
          c.id === updatedMessage.conversationId && c.lastMessage?.id === updatedMessage.id
            ? { ...c, lastMessage: updatedMessage }
            : c
        )
      );
    };

    socket.on("chat:message_received", handleMessageReceived);
    socket.on("chat:message_edited", handleMessageEdited);
    socket.on("chat:messages_read", handleMessagesRead);
    socket.on("chat:typing", handleTyping);
    socket.on("chat:stop_typing", handleStopTyping);

    return () => {
      socket.off("chat:message_received", handleMessageReceived);
      socket.off("chat:message_edited", handleMessageEdited);
      socket.off("chat:messages_read", handleMessagesRead);
      socket.off("chat:typing", handleTyping);
      socket.off("chat:stop_typing", handleStopTyping);
    };
  }, [socket, token, user, fetchConversations, showToast]);

  const value = useMemo(
    () => ({
      conversations,
      loadingConversations,
      activeConversation,
      messages,
      isOpen,
      isMinimized,
      loading,
      sending,
      unreadCount,
      activeUnreadCount,
      isOtherTyping,
      openChatWithEmployee,
      openConversation,
      fetchConversations,
      closeChat,
      minimizeChat,
      restoreChat,
      sendMessage,
      editMessage,
      sendTyping,
      sendStopTyping,
    }),
    [
      conversations,
      loadingConversations,
      activeConversation,
      messages,
      isOpen,
      isMinimized,
      loading,
      sending,
      unreadCount,
      activeUnreadCount,
      isOtherTyping,
      openChatWithEmployee,
      openConversation,
      fetchConversations,
      closeChat,
      minimizeChat,
      restoreChat,
      sendMessage,
      editMessage,
      sendTyping,
      sendStopTyping,
    ]
  );

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
