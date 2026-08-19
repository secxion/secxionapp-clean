import React from 'react';
import { FaTimes } from 'react-icons/fa';

const joinClasses = (...classes) => classes.filter(Boolean).join(' ');

const AdminModal = ({
  onClose,
  title,
  subtitle,
  icon: Icon,
  children,
  footer,
  maxWidth = 'max-w-3xl',
  zIndex = 'z-50',
  panelClassName = '',
  bodyClassName = '',
  showClose = true,
  headerClassName = '',
}) => {
  return (
    <div className={joinClasses('fixed inset-0 flex items-center justify-center p-4', zIndex)}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div
        className={joinClasses(
          'relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl',
          maxWidth,
          panelClassName,
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'admin-modal-title' : undefined}
      >
        {(title || showClose) && (
          <div
            className={joinClasses(
              'flex items-start justify-between gap-4 border-b border-slate-700 bg-slate-900/95 p-4 backdrop-blur',
              headerClassName,
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              {Icon && (
                <div className="rounded-xl bg-yellow-500/10 p-2">
                  <Icon className="text-lg text-yellow-500" />
                </div>
              )}
              {(title || subtitle) && (
                <div className="min-w-0">
                  {title && (
                    <h2 id="admin-modal-title" className="text-lg font-semibold text-white truncate">
                      {title}
                    </h2>
                  )}
                  {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
                </div>
              )}
            </div>

            {showClose && (
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-11 w-11 min-w-11 items-center justify-center rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                aria-label="Close dialog"
              >
                <FaTimes size={16} />
              </button>
            )}
          </div>
        )}

        <div className={joinClasses('min-h-0 flex-1 overflow-y-auto p-4', bodyClassName)}>{children}</div>

        {footer && (
          <div
            className="border-t border-slate-700 bg-slate-900/95 p-4 backdrop-blur"
            style={{
              paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminModal;
