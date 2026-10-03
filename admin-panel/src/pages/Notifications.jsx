import { BellOff, CheckCheck, Trash2 } from 'lucide-react';
import NotificationItem from '../components/NotificationItem';
import EmptyState from '../components/EmptyState';
import { useNotifications } from '../hooks/useNotifications';

export default function Notifications() {
  const {
    notifications,
    readNotification,
    readAllNotifications,
    removeNotification,
    clearNotifications,
    unreadCount,
  } = useNotifications();

  return (
    <div>
      <div className="page-header">
        <div>
          <span className="eyebrow">Activity</span>
          <h1>Notifications</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {unreadCount > 0 && (
            <button className="btn btn-secondary btn-sm" onClick={readAllNotifications}>
              <CheckCheck size={15} /> Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={clearNotifications} style={{ color: 'var(--danger)' }}>
              <Trash2 size={15} /> Clear all
            </button>
          )}
        </div>
      </div>

      <div className="card">
        {notifications.length === 0 ? (
          <EmptyState icon={BellOff} title="No notifications yet" description="Actions like adding or editing employees will show up here." />
        ) : (
          notifications.map((n) => (
            <NotificationItem key={n.id} notification={n} onRead={readNotification} onDelete={removeNotification} />
          ))
        )}
      </div>
    </div>
  );
}
