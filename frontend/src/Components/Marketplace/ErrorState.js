import React from 'react';
import '../../styles/marketplaceUtilities.css';

/**
 * ErrorState - Displays error messages with retry option
 * @param {string} title - Error title
 * @param {string} message - Error message description
 * @param {function} onRetry - Callback function for retry button
 */
const ErrorState = ({
  title = 'Something went wrong',
  message = 'An error occurred while loading data. Please try again.',
  onRetry = null,
  emoji = '⚠️',
}) => {
  return (
    <div className="error-state">
      <div className="error-state__icon">{emoji}</div>
      <h3 className="error-state__title">{title}</h3>
      <p className="error-state__message">{message}</p>
      {onRetry && (
        <div className="error-state__action">
          <button
            className="marketplace-btn marketplace-btn--primary"
            onClick={onRetry}
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default ErrorState;
