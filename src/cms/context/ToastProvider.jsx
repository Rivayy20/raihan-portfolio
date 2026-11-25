import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaTimes,
} from 'react-icons/fa';
import { ToastContext } from './ToastContext';

const TOAST_STYLES = {
  success: {
    container:
      'bg-surface border-emerald-200 dark:border-emerald-800 text-ink',
    icon: <FaCheckCircle className="text-emerald-500 text-base shrink-0 mt-0.5" />,
  },
  error: {
    container:
      'bg-surface border-red-200 dark:border-red-900 text-ink',
    icon: <FaExclamationCircle className="text-red-500 text-base shrink-0 mt-0.5" />,
  },
  warning: {
    container:
      'bg-surface border-amber-200 dark:border-amber-800 text-ink',
    icon: <FaExclamationTriangle className="text-amber-500 text-base shrink-0 mt-0.5" />,
  },
  info: {
    container:
      'bg-surface border-primary/30 text-ink',
    icon: <FaInfoCircle className="text-primary text-base shrink-0 mt-0.5" />,
  },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  const dismissToast = useCallback((id) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const pushToast = useCallback(
    (type, message, options = {}) => {
      const id =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      const duration = options.duration ?? 4500;
      setToasts((prev) => [
        ...prev.slice(-4),
        { id, type, title: options.title || '', message },
      ]);

      if (duration > 0) {
        const timer = setTimeout(() => {
          timersRef.current.delete(id);
          setToasts((prev) => prev.filter((item) => item.id !== id));
        }, duration);
        timersRef.current.set(id, timer);
      }

      return id;
    },
    []
  );

  useEffect(() => {
    const map = timersRef.current;
    return () => {
      for (const timer of map.values()) {
        clearTimeout(timer);
      }
      map.clear();
    };
  }, []);

  const value = useMemo(
    () => ({
      toast: {
        success: (message, options) => pushToast('success', message, options),
        error: (message, options) => pushToast('error', message, options),
        warning: (message, options) => pushToast('warning', message, options),
        info: (message, options) => pushToast('info', message, options),
      },
      dismissToast,
    }),
    [pushToast, dismissToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed bottom-4 right-4 z-80 max-w-sm w-[calc(100%-2rem)] flex flex-col gap-2.5 pointer-events-none"
      >
        {toasts.map((item) => {
          const style = TOAST_STYLES[item.type] || TOAST_STYLES.info;
          return (
            <div
              key={item.id}
              role="status"
              className={`pointer-events-auto border rounded-xl shadow-lg p-3.5 flex items-start gap-3 transition-all ${style.container}`}
            >
              {style.icon}
              <div className="min-w-0 flex-1 text-sm">
                {item.title && <p className="font-bold leading-snug text-ink">{item.title}</p>}
                <p className="text-muted leading-snug">{item.message}</p>
              </div>
              <button
                type="button"
                onClick={() => dismissToast(item.id)}
                aria-label="Tutup notifikasi"
                className="text-muted hover:text-ink p-0.5 shrink-0 cursor-pointer transition-colors"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
