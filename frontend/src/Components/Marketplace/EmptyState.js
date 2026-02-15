import React from 'react';
import '../../styles/marketplaceUtilities.css';

/**
 * EmptyState - Displays when no data is available
 * @param {string} title - Empty state title
 * @param {string} message - Empty state message
 * @param {function} onAction - Callback for action button
 * @param {string} actionLabel - Label for action button
 */
const EmptyState = ({
  title = 'No data found',
  message = 'There is nothing to display yet.',
  onAction = null,
  actionLabel = 'Create New',
  emoji = '📭',
}) => {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">{emoji}</div>
      <h3 className="empty-state__title">{title}</h3>
      <p className="empty-state__message">{message}</p>
      {onAction && (
        <button
          className="marketplace-btn marketplace-btn--primary"
          onClick={onAction}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
