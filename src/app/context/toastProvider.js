"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import styles from "./toastProvider.module.scss";

const TOAST_TYPES = {
  error: "error",
  success: "success",
};

const ToastContext = createContext(null);

const buildToast = (message, type, duration) => ({
  id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  message,
  type,
  duration,
});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timeoutRegistry = useRef(new Map());

  const removeToast = useCallback((toastId) => {
    const timeoutId = timeoutRegistry.current.get(toastId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutRegistry.current.delete(toastId);
    }

    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== toastId));
  }, []);

  const showToast = useCallback((message, type = TOAST_TYPES.error, duration = 3000) => {
    if (!message) {
      return;
    }

    const nextToast = buildToast(message, type, duration);
    setToasts((currentToasts) => [...currentToasts, nextToast]);

    const timeoutId = setTimeout(() => {
      removeToast(nextToast.id);
    }, duration);

    timeoutRegistry.current.set(nextToast.id, timeoutId);
  }, [removeToast]);

  useEffect(() => {
    const registry = timeoutRegistry.current;
    return () => {
      registry.forEach((timeoutId) => clearTimeout(timeoutId));
      registry.clear();
    };
  }, []);

  const contextValue = useMemo(() => ({
    removeToast,
    showError: (message, duration) => showToast(message, TOAST_TYPES.error, duration),
    showSuccess: (message, duration) => showToast(message, TOAST_TYPES.success, duration),
    showToast,
    toastTypes: TOAST_TYPES,
  }), [removeToast, showToast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className={styles.viewport}>
        {toasts.map((toast) => (
          <div
            className={`${styles.toast} ${toast.type === TOAST_TYPES.error ? styles.toastError : styles.toastSuccess}`}
            key={toast.id}
            role="status"
          >
            <span className={styles.accent} />
            <div className={styles.content}>
              <span className={styles.label}>
                {toast.type === TOAST_TYPES.error ? "Error" : "Success"}
              </span>
              <p className={styles.message}>{toast.message}</p>
            </div>
            <button
              aria-label="Close notification"
              className={styles.close}
              onClick={() => removeToast(toast.id)}
              type="button"
            >
              x
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
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}

ToastProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { TOAST_TYPES };
