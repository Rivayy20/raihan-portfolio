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
      'bg-white dark:bg-zinc-900 border-emerald-200 dark:border-emerald-800 text-slate-900 dark:text-zinc-100',
    icon: <FaCheckCircle className="text-emerald-500 text-base shrink-0 mt-0.5" />,
  },
  error: {
    container:
      'bg-white dark:bg-zinc-900 border-red-200 dark:border-red-900 text-slate-900 dark:text-zinc-100',
    icon: <FaExclamationCircle className="text-red-500 text-base shrink-0 mt-0.5" />,
  },
  warning: {
    container:
      'bg-white dark:bg-zinc-900 border-amber-200 dark:border-amber-800 text-slate-900 dark:text-zinc-100',
    icon: <FaExclamationTriangle className="text-amber-500 text-base shrink-0 mt-0.5" />,
  },
  info: {
    container:
      'bg-white dark:bg-zinc-900 border-cyan-200 dark:border-cyan-900 text-slate-900 dark:text-zinc-100',
    icon: <FaInfoCircle className="text-[#00B4D8] text-base shrink-0 mt-0.5" />,
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
        className="fixed bottom-4 right-4 z-[80] max-w-sm w-[calc(100%-2rem)] flex flex-col gap-2.5 pointer-events-none"
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
                {item.title && <p className="font-bold leading-snug">{item.title}</p>}
                <p className="text-slate-600 dark:text-zinc-300 leading-snug">{item.message}</p>
              </div>
              <button
                type="button"
                onClick={() => dismissToast(item.id)}
                aria-label="Tutup notifikasi"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-0.5 shrink-0 cursor-pointer"
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
