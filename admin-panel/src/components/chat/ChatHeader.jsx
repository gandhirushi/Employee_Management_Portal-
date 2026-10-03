import { Minus, X, Maximize2 } from 'lucide-react';
import Avatar from '../Avatar';
import { formatRole } from '../../constants/departments';

export default function ChatHeader({
  employee,
  isMinimized,
  onMinimize,
  onRestore,
  onClose,
  unreadCount = 0,
}) {
  return (
    <div
      className="chat-box-header"
      onClick={isMinimized ? onRestore : undefined}
      style={{ cursor: isMinimized ? 'pointer' : 'default' }}
    >
      <div className="chat-header-info">
        <div className="chat-header-avatar-wrap">
          <Avatar name={employee?.fullName || 'Employee'} src={employee?.profilePhoto} size="sm" />
          <span className="chat-online-dot" />
        </div>
        <div className="chat-header-text">
          <div className="chat-header-name">
            {employee?.fullName || 'Employee Chat'}
          </div>
          <div className="chat-header-sub">
            {employee?.position || employee?.department || formatRole(employee?.role)}
          </div>
        </div>
      </div>

      <div className="chat-header-actions" onClick={(e) => e.stopPropagation()}>
        {isMinimized && unreadCount > 0 && (
          <span className="chat-unread-badge">{unreadCount}</span>
        )}

        {isMinimized ? (
          <button
            className="chat-btn-icon"
            onClick={onRestore}
            title="Expand chat"
            aria-label="Expand chat"
          >
            <Maximize2 size={15} />
          </button>
        ) : (
          <button
            className="chat-btn-icon"
            onClick={onMinimize}
            title="Minimize chat"
            aria-label="Minimize chat"
          >
            <Minus size={15} />
          </button>
        )}

        <button
          className="chat-btn-icon chat-btn-close"
          onClick={onClose}
          title="Close chat"
          aria-label="Close chat"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
