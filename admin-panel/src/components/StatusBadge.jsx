export default function StatusBadge({ status }) {
  let cls = 'badge badge-inactive';
  const normalized = String(status || '').trim().toUpperCase();

  if (normalized === 'ACTIVE' || normalized === 'APPROVED') {
    cls = 'badge badge-active';
  } else if (normalized === 'ON LEAVE' || normalized === 'PENDING') {
    cls = 'badge badge-leave';
  } else if (normalized === 'INACTIVE' || normalized === 'REJECTED') {
    cls = 'badge badge-inactive';
  }

  return <span className={cls}>{status}</span>;
}
