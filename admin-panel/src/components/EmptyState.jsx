import { Inbox } from 'lucide-react';

export default function EmptyState({ icon: Icon = Inbox, title, description }) {
  return (
    <div className="empty-state">
      <Icon size={40} strokeWidth={1.5} />
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
