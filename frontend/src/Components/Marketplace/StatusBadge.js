import React, { useState } from 'react';
import '../../styles/marketplaceUtilities.css';

/**
 * StatusBadge - Displays market status with appropriate styling and tooltips
 * @param {string} status - The status value (DONE, PROCESSING, CANCEL)
 * @param {string} size - Optional size variant (sm, md, lg)
 */
const StatusBadge = ({ status, size = 'md' }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const getStatusConfig = () => {
    switch (status?.toUpperCase()) {
      case 'DONE':
      case 'COMPLETED':
        return {
          class: 'status-badge--success',
          icon: '✓',
          label: 'Done',
          description: 'Transaction completed successfully',
          color: '#10b981',
        };
      case 'PROCESSING':
      case 'IN_PROGRESS':
        return {
          class: 'status-badge--warning',
          icon: '⏱',
          label: 'Processing',
          description: 'Transaction is in progress',
          color: '#f59e0b',
        };
      case 'CANCEL':
      case 'CANCELLED':
        return {
          class: 'status-badge--danger',
          icon: '✕',
          label: 'Cancelled',
          description: 'Transaction was cancelled',
          color: '#ef4444',
        };
      default:
        return {
          class: 'status-badge--info',
          icon: '◯',
          label: status || 'Unknown',
          description: 'Status information available',
          color: '#6366f1',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-block',
        cursor: 'help',
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span className={`status-badge ${config.class}`}>
        <span>{config.icon}</span>
        <span>{config.label}</span>
      </span>

      {/* Tooltip */}
      {showTooltip && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: '0.5rem',
            padding: '0.75rem',
            backgroundColor: '#1f2937',
            color: 'white',
            borderRadius: '0.5rem',
            fontSize: '0.75rem',
            whiteSpace: 'nowrap',
            zIndex: 1000,
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
            border: `2px solid ${config.color}`,
          }}
        >
          {config.description}
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: `6px solid ${config.color}`,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default StatusBadge;
