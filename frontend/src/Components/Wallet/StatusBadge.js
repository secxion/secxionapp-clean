/**
 * StatusBadge Component
 * Wallet-specific status indicator with color mapping
 * Memoized for performance
 */

import React from 'react';
import {
  FiCheck,
  FiClock,
  FiX,
  FiAlertCircle
} from 'react-icons/fi';
import '../../../styles/walletUtilities.css';

const StatusBadge = ({
  status = 'completed',
  variant = 'default', // default | compact
  showIcon = true,
  interactive = false,
  onClick
}) => {
  const statusConfig = {
    completed: {
      className: 'wallet-status-badge--success',
      label: 'Completed',
      icon: <FiCheck size={12} />
    },
    success: {
      className: 'wallet-status-badge--success',
      label: 'Success',
      icon: <FiCheck size={12} />
    },
    pending: {
      className: 'wallet-status-badge--processing',
      label: 'Pending',
      icon: <FiClock size={12} />
    },
    processing: {
      className: 'wallet-status-badge--processing',
      label: 'Processing',
      icon: <FiClock size={12} />
    },
    failed: {
      className: 'wallet-status-badge--danger',
      label: 'Failed',
      icon: <FiX size={12} />
    },
    error: {
      className: 'wallet-status-badge--danger',
      label: 'Error',
      icon: <FiX size={12} />
    },
    warning: {
      className: 'wallet-status-badge--warning',
      label: 'Warning',
      icon: <FiAlertCircle size={12} />
    },
    info: {
      className: 'wallet-status-badge--info',
      label: 'Info',
      icon: <FiAlertCircle size={12} />
    }
  };

  const config = statusConfig[status] || statusConfig.completed;

  const baseClasses = ['wallet-status-badge', config.className];
  if (interactive) {
    baseClasses.push('wallet-element--interactive');
  }

  const handleClick = (e) => {
    if (onClick) {
      e.stopPropagation();
      onClick();
    }
  };

  return (
    <span
      className={baseClasses.join(' ')}
      onClick={handleClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyPress={interactive ? (e) => e.key === 'Enter' && handleClick(e) : undefined}
      style={{
        cursor: interactive ? 'pointer' : 'default',
        transition: interactive ? 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)' : 'none'
      }}
      title={config.label}
    >
      {showIcon && config.icon}
      {variant === 'default' ? config.label : ''}
    </span>
  );
};

export default React.memo(StatusBadge);
