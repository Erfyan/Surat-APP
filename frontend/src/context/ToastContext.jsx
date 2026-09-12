import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast-item toast-${toast.type}`}>
            <div className="toast-icon">
              {toast.type === 'success' && <i className="fa-solid fa-circle-check" />}
              {toast.type === 'error' && <i className="fa-solid fa-circle-xmark" />}
              {toast.type === 'warning' && <i className="fa-solid fa-triangle-exclamation" />}
              {toast.type === 'info' && <i className="fa-solid fa-circle-info" />}
            </div>
            <div className="toast-message">{toast.message}</div>
            <button className="toast-close" onClick={() => removeToast(toast.id)} aria-label="Tutup">
              <i className="fa-solid fa-xmark" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback if rendered outside provider (e.g., tests)
    return {
      addToast: (msg, type) => {
        console.log(`[Toast ${type}]: ${msg}`);
      },
    };
  }
  return context;
}
