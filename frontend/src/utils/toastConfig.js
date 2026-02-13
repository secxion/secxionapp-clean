/**
 * Global Toast Configuration
 * Single source of truth for all toast notifications
 */
import { toast } from 'react-toastify';

export const TOAST_CONFIG = {
  position: 'top-right',
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: 'colored',
  limit: 3, // Max 3 toasts at once
};

export const TOAST_TYPES = {
  SUCCESS: {
    position: 'top-right',
    autoClose: 2000,
    theme: 'colored',
  },
  ERROR: {
    position: 'top-right',
    autoClose: 2000,
    theme: 'colored',
  },
  INFO: {
    position: 'top-right',
    autoClose: 2000,
    theme: 'colored',
  },
  WARNING: {
    position: 'top-right',
    autoClose: 2000,
    theme: 'colored',
  },
  LOADING: {
    position: 'top-right',
    autoClose: false, // Don't auto-close
    closeButton: false,
    theme: 'colored',
  },
};

/**
 * Custom Toast Wrapper
 * Provides consistent toast notifications across the app
 */

class ToastNotification {
  constructor() {
    this.activeToasts = new Map();
    this.maxConcurrentToasts = 3;
  }

  /**
   * Show success toast
   */
  success(message, title = 'Success', options = {}) {
    return this._show(message, 'success', title, options);
  }

  /**
   * Show error toast
   */
  error(message, title = 'Error', options = {}) {
    return this._show(message, 'error', title, options);
  }

  /**
   * Show info toast
   */
  info(message, title = 'Info', options = {}) {
    return this._show(message, 'info', title, options);
  }

  /**
   * Show warning toast
   */
  warning(message, title = 'Warning', options = {}) {
    return this._show(message, 'warning', title, options);
  }

  /**
   * Show loading toast
   */
  loading(message, title = 'Loading', options = {}) {
    const toastId = toast.loading(this._formatMessage(message, title), {
      ...TOAST_TYPES.LOADING,
      ...options,
    });

    // Store toast ID for later updates
    this.activeToasts.set(`loading-${toastId}`, {
      type: 'loading',
      id: toastId,
      createdAt: Date.now(),
    });

    return toastId;
  }

  /**
   * Update an existing toast (useful for loading → success)
   */
  update(toastId, message, type = 'success', title = '', options = {}) {
    if (toast.isActive(toastId)) {
      toast.update(toastId, {
        render: this._formatMessage(message, title),
        type,
        isLoading: false,
        autoClose: TOAST_TYPES[type.toUpperCase()]?.autoClose || 3000,
        ...options,
      });

      // Update tracking
      const key = Array.from(this.activeToasts.entries()).find(
        ([_, v]) => v.id === toastId,
      )?.[0];
      if (key) {
        this.activeToasts.delete(key);
      }
    }
  }

  /**
   * Dismiss a specific toast
   */
  dismiss(toastId) {
    if (toast.isActive(toastId)) {
      toast.dismiss(toastId);

      // Clean up tracking
      const key = Array.from(this.activeToasts.entries()).find(
        ([_, v]) => v.id === toastId,
      )?.[0];
      if (key) {
        this.activeToasts.delete(key);
      }
    }
  }

  /**
   * Dismiss all toasts
   */
  dismissAll() {
    toast.dismiss();
    this.activeToasts.clear();
  }

  /**
   * Internal method to show toast
   */
  _show(message, type, title = '', options = {}) {
    // Dismiss all previous toasts before showing a new one
    this.dismissAll();

    const toastConfig = {
      ...TOAST_TYPES[type.toUpperCase()],
      ...options,
    };

    const toastId = toast[type](
      this._formatMessage(message, title),
      toastConfig,
    );

    // Track active toasts
    this.activeToasts.set(`${type}-${toastId}`, {
      type,
      id: toastId,
      createdAt: Date.now(),
      message,
    });

    return toastId;
  }

  /**
   * Format message with optional title
   */
  _formatMessage(message, title = '') {
    if (!title) {
      return message;
    }

    return (
      <div className="flex flex-col gap-1">
        <strong className="text-base font-bold">{title}</strong>
        <span className="text-sm opacity-90">{message}</span>
      </div>
    );
  }

  /**
   * Get active toast count
   */
  getActiveCount() {
    return this.activeToasts.size;
  }

  /**
   * Get active toasts
   */
  getActiveToasts() {
    return Array.from(this.activeToasts.values());
  }
}

// Export singleton instance
export const notifyUser = new ToastNotification();

export default notifyUser;
