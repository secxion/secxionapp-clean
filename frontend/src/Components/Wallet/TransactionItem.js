/**
 * TransactionItem Component
 * Displays a single transaction in the history list
 * Memoized for performance in long lists
 */

import React from 'react';
import { FiArrowUp, FiArrowDown, FiClock } from 'react-icons/fi';
import '../../../styles/walletUtilities.css';

const TransactionItem = ({
  id,
  description,
  amount,
  status = 'completed', // completed, pending, failed
  date,
  type = 'debit', // credit, debit, pending
  onClick,
  variant = 'ngn'
}) => {
  // Determine icon and color based on type
  const getIcon = () => {
    switch (type) {
      case 'credit':
        return <FiArrowDown size={20} />;
      case 'debit':
        return <FiArrowUp size={20} />;
      case 'pending':
        return <FiClock size={20} />;
      default:
        return <FiArrowUp size={20} />;
    }
  };

  const getIconClassName = () => {
    switch (type) {
      case 'credit':
        return 'wallet-transaction-icon--credit';
      case 'debit':
        return 'wallet-transaction-icon--debit';
      case 'pending':
        return 'wallet-transaction-icon--pending';
      default:
        return 'wallet-transaction-icon--debit';
    }
  };

  const getAmountClassName = () => {
    switch (type) {
      case 'credit':
        return 'wallet-transaction-amount--credit';
      case 'debit':
        return 'wallet-transaction-amount--debit';
      case 'pending':
        return 'wallet-transaction-amount--pending';
      default:
        return 'wallet-transaction-amount--debit';
    }
  };

  // Format amount
  const formattedAmount = parseFloat(amount).toFixed(2);
  const amountPrefix = type === 'credit' ? '+' : '-';

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div
      className="wallet-transaction-item"
      onClick={onClick}
      role="button"
      tabIndex={onClick ? 0 : -1}
      onKeyPress={onClick ? (e) => e.key === 'Enter' && onClick() : null}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {/* Icon */}
      <div className={`wallet-transaction-icon ${getIconClassName()}`}>
        {getIcon()}
      </div>

      {/* Details */}
      <div className="wallet-transaction-details">
        <div className="wallet-transaction-description" title={description}>
          {description || 'Transaction'}
        </div>
        <div className="wallet-transaction-date">{formatDate(date)}</div>
      </div>

      {/* Amount */}
      <div className="wallet-transaction-amount">
        <div className={`wallet-transaction-amount-value ${getAmountClassName()}`}>
          {amountPrefix}{formattedAmount}
        </div>
      </div>
    </div>
  );
};

export default React.memo(TransactionItem);
