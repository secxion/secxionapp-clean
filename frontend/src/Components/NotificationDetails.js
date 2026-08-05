import React from 'react';

const NotificationDetails = ({ notification, onClose }) => {
  if (!notification) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex min-h-screen items-center justify-center px-4 py-16 text-center sm:p-6">
        <div
          className="fixed inset-0 bg-black/85 backdrop-blur-sm transition-opacity"
          aria-hidden="true"
        />
        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>
        <div className="relative inline-block w-full max-w-2xl transform overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-brand-dark-base via-brand-dark-elevated to-black text-left shadow-[0_0_40px_rgba(0,0,0,0.35)] transition-all">
          <div className="px-6 pb-6 pt-7 sm:px-8">
            <div className="sm:flex sm:items-start">
              <div className="w-full">
                <h3
                  className="font-spaceGrotesk text-xl font-black uppercase tracking-tight text-white"
                  id="modal-title"
                >
                  {notification.onModel === 'userproduct'
                    ? 'Market Record Details'
                    : 'Notification Details'}
                </h3>
                <div className="mt-5 h-px bg-white/5" />
                <div className="mt-5 space-y-3">
                  <p className="text-sm leading-relaxed text-gray-300">
                    <strong>Message:</strong> {notification.message}
                  </p>
                  {notification.rejectionReason && (
                    <p className="text-sm font-semibold text-rose-400">
                      <strong>Reason:</strong> {notification.rejectionReason}
                    </p>
                  )}
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    <strong>Created At:</strong>{' '}
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end border-t border-white/5 px-6 py-4 sm:px-8">
            <button
              type="button"
              className="inline-flex justify-center rounded-xl border border-white/10 bg-white/[0.03] px-5 py-2 text-[10px] font-black uppercase tracking-widest text-gray-300 transition-colors hover:border-brand-gold/30 hover:text-brand-gold"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationDetails;
