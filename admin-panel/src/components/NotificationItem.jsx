import { UserPlus, UserCog, Settings as SettingsIcon, LogIn, X } from 'lucide-react';
import { formatRelativeTime } from '../utils/date';

const ICONS = {
  employee: { icon: UserCog, bg: 'var(--brand-100)', color: 'var(--brand-600)' },
  system: { icon: SettingsIcon, bg: 'var(--accent-100)', color: '#B9791A' },
  login: { icon: LogIn, bg: 'var(--teal-100)', color: 'var(--teal)' },
  info: { icon: UserPlus, bg: 'var(--brand-100)', color: 'var(--brand-600)' },
};

export default function NotificationItem({ notification, onRead, onDelete }) {
  const meta = ICONS[notification.type] || ICONS.info;
  const Icon = meta.icon;
  return (
    <div
      className={`notif-item ${notification.read ? '' : 'unread'}`}
      onClick={() => !notification.read && onRead(notification.id)}
      style={{ cursor: notification.read ? 'default' : 'pointer' }}
    >
      <div className="notif-icon" style={{ background: meta.bg, color: meta.color }}>
        <Icon size={16} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div className="notif-title">{notification.title}</div>
        <div className="notif-desc">{notification.description}</div>
        <div className="notif-time">{formatRelativeTime(notification.createdAt)}</div>
      </div>
      <button
        className="btn btn-ghost btn-icon notif-delete"
        onClick={(e) => { e.stopPropagation(); onDelete(notification.id); }}
        title="Delete notification"
      >
        <X size={14} />
      </button>
    </div>
  );
}
