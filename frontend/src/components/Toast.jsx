import { useEffect } from 'react';
import { X } from 'lucide-react';

export function Toast({ toast, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast, onClose]);

  return (
    <div className={`toast-alert ${toast.type || 'success'}`}>
      <span className="toast-icon">
        {toast.type === 'error' ? '❌' : '✅'}
      </span>
      <span className="toast-alert-text">{toast.message}</span>
      <button className="toast-alert-close" onClick={() => onClose(toast.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, onClose }) {
  return (
    <div className="toast-alerts-container">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
}

export default ToastContainer;
