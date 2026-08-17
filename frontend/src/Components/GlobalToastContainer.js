/**
 * Global Toast Container Component
 * Single, unified toast notification container for the entire application
 */

import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './ToastContainer.css';
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle,
  FaTimesCircle,
} from 'react-icons/fa';

const CloseButton = ({ closeToast }) => (
  <button
    onClick={closeToast}
    className="ml-2 flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-gray-400 transition-all hover:bg-white/10 hover:text-white active:scale-90"
  >
    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  </button>
);

const GlobalToastContainer = () => {
  return (
    <ToastContainer
      position="top-right"
      autoClose={4000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="dark"
      limit={3}
      closeButton={CloseButton}
      toastClassName={(context) =>
        `secxion-toast relative mb-4 flex min-h-16 cursor-pointer justify-between overflow-hidden rounded-2xl p-4 shadow-2xl transition-all hover:-translate-y-0.5 ${
          context?.type === 'success'
            ? 'secxion-toast-success'
            : context?.type === 'error'
              ? 'secxion-toast-error'
              : context?.type === 'warning'
                ? 'secxion-toast-warning'
                : 'secxion-toast-info'
        }`
      }
      bodyClassName={() =>
        'secxion-toast-body flex items-center gap-4 text-xs font-black uppercase tracking-[0.15em] font-spaceGrotesk text-white'
      }
      progressClassName="secxion-toast-progress"
      icon={({ type }) => {
        switch (type) {
          case 'success':
            return <FaCheckCircle className="text-emerald-400 text-lg" />;
          case 'error':
            return <FaTimesCircle className="text-red-400 text-lg" />;
          case 'warning':
            return <FaExclamationCircle className="text-brand-gold text-lg" />;
          default:
            return <FaInfoCircle className="text-sky-400 text-lg" />;
        }
      }}
    />
  );
};

export default GlobalToastContainer;
