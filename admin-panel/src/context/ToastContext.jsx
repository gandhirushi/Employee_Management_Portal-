import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { CheckCircle2, XCircle, Info } from 'lucide-react';
import { makeId } from '../utils/id';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  /**
   * Flexible toast handler:
   * - showToast(title, message, type)
   * - showToast(message, type) (e.g. showToast('Failed to save', 'error'))
   * - showToast(title, message)
   * - showToast(message)
   */
  const showToast = useCallback((arg1, arg2, arg3) => {
    let title = '';
    let message = '';
    let type = 'success';

    if (arg3 !== undefined) {
      // 3 arguments: title, message, type
      title = String(arg1 || '');
      message = String(arg2 || '');
      type = arg3 === 'error' || arg3 === 'danger' ? 'error' : arg3 === 'info' ? 'info' : 'success';
    } else if (arg2 === 'error' || arg2 === 'danger' || arg2 === 'success' || arg2 === 'info') {
      // 2 arguments: message, type
      type = arg2 === 'danger' ? 'error' : arg2;
      title = type === 'error' ? 'Error' : type === 'info' ? 'Notice' : 'Success';
      message = String(arg1 || '');
    } else if (arg2 !== undefined) {
      // 2 arguments: title, message (default type: success)
      title = String(arg1 || '');
      message = String(arg2 || '');
      type = 'success';
    } else {
      // 1 argument: message
      title = 'Notice';
      message = String(arg1 || '');
      type = 'info';
    }

    const id = makeId('toast');
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => removeToast(id), 3800);
  }, [removeToast]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type === 'error' ? 'error' : t.type === 'info' ? 'info' : ''}`}>
            {t.type === 'error' ? (
              <XCircle size={18} color="var(--danger)" style={{ flexShrink: 0, marginTop: 1 }} />
            ) : t.type === 'info' ? (
              <Info size={18} color="var(--accent)" style={{ flexShrink: 0, marginTop: 1 }} />
            ) : (
              <CheckCircle2 size={18} color="var(--teal)" style={{ flexShrink: 0, marginTop: 1 }} />
            )}
            <div>
              <div className="toast-title">{t.title}</div>
              {t.message && <div className="toast-msg">{t.message}</div>}
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export default ToastContext;
