import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';

export default function ChatInput({
  onSendMessage,
  onTyping,
  onStopTyping,
  disabled = false,
  sending = false,
}) {
  const [text, setText] = useState('');
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-focus input when opened
  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]);

  const handleInputChange = (e) => {
    setText(e.target.value);

    // Trigger typing event
    if (onTyping) {
      onTyping();
    }

    // Debounce stop typing
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      if (onStopTyping) {
        onStopTyping();
      }
    }, 1500);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || disabled || sending) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (onStopTyping) {
      onStopTyping();
    }

    onSendMessage(trimmed);
    setText('');
  };

  const canSend = text.trim().length > 0 && !disabled && !sending;

  return (
    <form className="chat-input-container" onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        type="text"
        className="chat-input-field"
        placeholder="Type a message..."
        value={text}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        maxLength={2000}
      />
      <button
        type="submit"
        className="chat-send-btn"
        disabled={!canSend}
        title="Send message (Enter)"
        aria-label="Send message"
      >
        {sending ? (
          <Loader2 size={16} className="chat-spinner-mini" />
        ) : (
          <Send size={16} />
        )}
      </button>
    </form>
  );
}
