import { AlertTriangle } from 'lucide-react';

export default function ConfirmModal({
  open,
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  danger = true,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-icon-danger">
          <AlertTriangle size={22} />
        </div>
        <h3 style={{ marginBottom: 8 }}>{title}</h3>
        <p className="text-muted" style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>{description}</p>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onCancel}>{cancelLabel}</button>
          <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
