import { useEffect, useRef, useState } from 'react';
import { Check, CheckCheck, Loader2, Pencil } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatMessageTime, formatDateHeader } from '../../utils/date';

export default function MessageList({
  messages = [],
  loading = false,
  targetEmployee,
  isOtherTyping = false,
  onEditMessage,
}) {
  const { user } = useAuth();
  const bottomRef = useRef(null);
  const containerRef = useRef(null);
  const editInputRef = useRef(null);

  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  useEffect(() => {
    if (editingMessageId && editInputRef.current) {
      editInputRef.current.focus();
      const length = editInputRef.current.value.length;
      editInputRef.current.setSelectionRange(length, length);
    }
  }, [editingMessageId]);

  const handleStartEdit = (msg) => {
    setEditingMessageId(msg.id);
    setEditContent(msg.content);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditContent('');
  };

  const handleSaveEdit = async (messageId) => {
    const trimmed = editContent.trim();
    if (!trimmed || isSubmittingEdit) return;

    const originalMsg = messages.find((m) => m.id === messageId);
    if (originalMsg && originalMsg.content === trimmed) {
      handleCancelEdit();
      return;
    }

    setIsSubmittingEdit(true);
    try {
      if (onEditMessage) {
        await onEditMessage(messageId, trimmed);
      }
      setEditingMessageId(null);
      setEditContent('');
    } catch {
      // Handled via context toast
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleEditKeyDown = (e, messageId) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit(messageId);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  // Auto-scroll to bottom on new message or when opening
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOtherTyping]);

  if (loading) {
    return (
      <div className="chat-messages-container chat-loading-state">
        <Loader2 className="chat-spinner" size={24} />
        <span>Loading messages...</span>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="chat-messages-container chat-empty-state">
        <div className="chat-empty-bubble">💬</div>
        <p className="chat-empty-title">
          Start a conversation with <strong>{targetEmployee?.fullName || 'this employee'}</strong>
        </p>
        <p className="chat-empty-sub">
          Messages sent here are delivered in real time.
        </p>
      </div>
    );
  }

  // Group messages by date for date dividers
  let lastDateHeader = '';

  return (
    <div className="chat-messages-container" ref={containerRef}>
      {messages.map((msg, index) => {
        const isSentByMe = msg.senderId === user?.id || msg.sending;
        const msgDate = formatDateHeader(msg.createdAt);
        const showDateDivider = msgDate && msgDate !== lastDateHeader;
        if (showDateDivider) {
          lastDateHeader = msgDate;
        }

        const isEditing = editingMessageId === msg.id;

        return (
          <div key={msg.id || index} className="chat-message-group">
            {showDateDivider && (
              <div className="chat-date-divider">
                <span>{msgDate}</span>
              </div>
            )}

            <div className={`chat-message-row ${isSentByMe ? 'sent' : 'received'}`}>
              {isSentByMe && !msg.sending && !isEditing && (
                <div className="chat-message-actions">
                  <button
                    type="button"
                    className="chat-msg-action-btn"
                    onClick={() => handleStartEdit(msg)}
                    title="Edit message"
                    aria-label="Edit message"
                  >
                    <Pencil size={12} />
                  </button>
                </div>
              )}

              <div className={`chat-bubble ${isSentByMe ? 'sent' : 'received'} ${isEditing ? 'editing' : ''}`}>
                {isEditing ? (
                  <div className="chat-edit-inline-wrap">
                    <textarea
                      ref={editInputRef}
                      className="chat-edit-textarea"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      onKeyDown={(e) => handleEditKeyDown(e, msg.id)}
                      disabled={isSubmittingEdit}
                      rows={Math.min(5, Math.max(1, editContent.split('\n').length))}
                      maxLength={2000}
                    />
                    <div className="chat-edit-actions">
                      <button
                        type="button"
                        className="chat-edit-btn chat-edit-cancel"
                        onClick={handleCancelEdit}
                        disabled={isSubmittingEdit}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="chat-edit-btn chat-edit-save"
                        onClick={() => handleSaveEdit(msg.id)}
                        disabled={isSubmittingEdit || !editContent.trim()}
                      >
                        {isSubmittingEdit ? (
                          <Loader2 size={12} className="chat-spinner-mini" />
                        ) : (
                          'Save'
                        )}
                      </button>
                    </div>
                    <div className="chat-edit-hint">
                      <span>Esc to cancel • Enter to save</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="chat-bubble-content">{msg.content}</div>
                    <div className="chat-bubble-meta">
                      {msg.isEdited && (
                        <span
                          className="chat-edited-indicator"
                          title={msg.editedAt ? `Edited at ${formatMessageTime(msg.editedAt)}` : 'Edited'}
                        >
                          Edited
                        </span>
                      )}
                      <span className="chat-timestamp">{formatMessageTime(msg.createdAt)}</span>
                      {isSentByMe && (
                        <span className="chat-status-icon">
                          {msg.sending ? (
                            <Loader2 size={12} className="chat-spinner-mini" />
                          ) : msg.read ? (
                            <CheckCheck size={14} className="chat-read-tick" />
                          ) : (
                            <Check size={14} className="chat-sent-tick" />
                          )}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {isOtherTyping && (
        <div className="chat-message-row received">
          <div className="chat-bubble received chat-typing-bubble">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
