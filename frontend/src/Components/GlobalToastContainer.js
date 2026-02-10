/**
 * Global Toast Container Component
 * Single, unified toast notification container for the entire application
 */

import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './ToastContainer.css'; // Custom styles

const GlobalToastContainer = () => {
  return (
    <ToastContainer
      // Position
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={true}
      closeOnClick={true}
      rtl={false}
      pauseOnFocusLoss={true}
      draggable={true}
      pauseOnHover={true}
      theme="colored"
      // Limit concurrent toasts
      limit={3}
      // Custom styling
      toastClassName={(context) =>
        `relative flex p-4 min-h-10 rounded-md justify-between overflow-hidden cursor-pointer ${
          context?.type === 'success' ? 'bg-green-500' : ''
        } ${context?.type === 'error' ? 'bg-red-500' : ''} ${
          context?.type === 'info' ? 'bg-blue-500' : ''
        } ${context?.type === 'warning' ? 'bg-yellow-500' : ''} ${
          context?.type === 'loading' ? 'bg-gray-500' : ''
        }`
      }
      bodyClassName={() => 'text-white text-sm font-medium block p-3'}
      progressClassName={() => 'toast-progress-bar'}
      closeButton={({ closeToast }) => (
        <button
          onClick={closeToast}
          className="text-white hover:opacity-70 transition-opacity flex-shrink-0 ml-3"
          aria-label="Close notification"
        >
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
      // Accessibility
      role="alert"
      aria-live="polite"
      aria-atomic={true}
      // Z-index to be on top of everything
      style={{ zIndex: 9999 }}
    />
  );
};

export default GlobalToastContainer;
