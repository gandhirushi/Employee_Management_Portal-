import { useChat } from '../../hooks/useChat';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import ChatInput from './ChatInput';

export default function FloatingChatBox() {
  const {
    activeConversation,
    messages,
    isOpen,
    isMinimized,
    loading,
    sending,
    activeUnreadCount,
    isOtherTyping,
    closeChat,
    minimizeChat,
    restoreChat,
    sendMessage,
    editMessage,
    sendTyping,
    sendStopTyping,
  } = useChat();

  if (!isOpen || !activeConversation) {
    return null;
  }

  const targetEmployee = activeConversation.targetUser;

  return (
    <div
      className={`floating-chat-box ${isMinimized ? 'minimized' : 'expanded'}`}
      role="region"
      aria-label="Real-time employee chat"
    >
      <ChatHeader
        employee={targetEmployee}
        isMinimized={isMinimized}
        onMinimize={minimizeChat}
        onRestore={restoreChat}
        onClose={closeChat}
        unreadCount={activeUnreadCount}
      />

      {!isMinimized && (
        <>
          <MessageList
            messages={messages}
            loading={loading}
            targetEmployee={targetEmployee}
            isOtherTyping={isOtherTyping}
            onEditMessage={editMessage}
          />

          <ChatInput
            onSendMessage={sendMessage}
            onTyping={sendTyping}
            onStopTyping={sendStopTyping}
            disabled={loading}
            sending={sending}
          />
        </>
      )}
    </div>
  );
}
