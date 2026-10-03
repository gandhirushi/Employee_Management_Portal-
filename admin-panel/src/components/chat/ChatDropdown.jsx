import { MessageSquareOff, Loader2 } from 'lucide-react';
import Avatar from '../Avatar';
import { formatRelativeTime } from '../../utils/date';

export default function ChatDropdown({
  conversations = [],
  loading = false,
  onSelectConversation,
  onClose,
}) {
  const unreadTotal = conversations.reduce(
    (acc, c) => acc + (c.unreadCount || 0),
    0
  );

  return (
    <div className="notif-dropdown chat-dropdown" role="menu" aria-label="Messages">
      <div className="notif-dropdown-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <strong style={{ fontSize: '0.92rem' }}>Messages</strong>
          {unreadTotal > 0 && (
            <span className="chat-unread-badge" style={{ fontSize: '0.68rem' }}>
              {unreadTotal} new
            </span>
          )}
        </div>
      </div>

      <div className="chat-dropdown-list">
        {loading && conversations.length === 0 ? (
          <div style={{ padding: '32px 16px', textAlign: 'center' }}>
            <Loader2 className="chat-spinner" size={24} style={{ margin: '0 auto 8px' }} />
            <p className="text-muted" style={{ fontSize: '0.84rem' }}>
              Loading messages...
            </p>
          </div>
        ) : conversations.length === 0 ? (
          <div style={{ padding: '32px 16px', textAlign: 'center' }}>
            <MessageSquareOff
              size={28}
              color="var(--text-faint)"
              style={{ marginBottom: 8 }}
            />
            <p className="text-muted" style={{ fontSize: '0.84rem', fontWeight: 600 }}>
              No messages yet
            </p>
            <p className="text-muted" style={{ fontSize: '0.78rem', marginTop: 4 }}>
              When an admin or manager reaches out, conversations will appear here.
            </p>
          </div>
        ) : (
          conversations.map((conv) => {
            const hasUnread = (conv.unreadCount || 0) > 0;
            const target = conv.targetUser || {};

            return (
              <div
                key={conv.id}
                className={`chat-dropdown-item ${hasUnread ? 'unread' : ''}`}
                onClick={() => onSelectConversation(conv)}
                role="menuitem"
                tabIndex={0}
              >
                <div className="chat-dropdown-avatar">
                  <Avatar
                    name={target.fullName || 'User'}
                    src={target.profilePhoto}
                    size="md"
                  />
                  {hasUnread && <span className="chat-dropdown-unread-dot" />}
                </div>

                <div className="chat-dropdown-content">
                  <div className="chat-dropdown-top">
                    <span className="chat-dropdown-name">{target.fullName || 'User'}</span>
                    <span className="chat-dropdown-time">
                      {formatRelativeTime(conv.lastMessage?.createdAt || conv.updatedAt)}
                    </span>
                  </div>

                  <div className="chat-dropdown-middle">
                    <span className="chat-role-pill">
                      {target.roleLabel || target.role || 'Staff'}
                    </span>
                  </div>

                  <div className="chat-dropdown-bottom">
                    <span className={`chat-dropdown-snippet ${hasUnread ? 'bold' : ''}`}>
                      {conv.lastMessage?.content || 'Started conversation'}
                    </span>
                    {hasUnread && (
                      <span className="chat-dropdown-badge">{conv.unreadCount}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {conversations.length > 0 && (
        <div style={{ padding: '8px 14px', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Click a conversation to chat in real time
          </span>
        </div>
      )}
    </div>
  );
}
