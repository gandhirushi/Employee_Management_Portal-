import { useNavigate } from 'react-router-dom';
import { BellOff } from 'lucide-react';
import NotificationItem from './NotificationItem';

export default function NotificationDropdown({ notifications, onRead, onReadAll, onDelete, onClose }) {
  const navigate = useNavigate();
  const recent = notifications.slice(0, 6);

  return (
    <div className="notif-dropdown">
      <div className="notif-dropdown-header">
        <strong style={{ fontSize: '0.92rem' }}>Notifications</strong>
        {notifications.some((n) => !n.read) && (
          <button className="btn btn-ghost btn-sm" onClick={onReadAll}>Mark all read</button>
        )}
      </div>
      {recent.length === 0 ? (
        <div style={{ padding: '32px 16px', textAlign: 'center' }}>
          <BellOff size={28} color="var(--text-faint)" style={{ marginBottom: 8 }} />
          <p className="text-muted" style={{ fontSize: '0.84rem' }}>You're all caught up.</p>
        </div>
      ) : (
        recent.map((n) => (
          <NotificationItem key={n.id} notification={n} onRead={onRead} onDelete={onDelete} />
        ))
      )}
      <div style={{ padding: 12, textAlign: 'center', borderTop: '1px solid var(--border)' }}>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => { onClose(); navigate('/notifications'); }}
        >
          View all notifications
        </button>
      </div>
    </div>
  );
}
