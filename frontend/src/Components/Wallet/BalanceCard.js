/**
 * BalanceCard Component
 * Displays wallet balance (NGN or ETH) with show/hide toggle and refresh functionality
 * Memoized for performance
 */

import React, { useState, useCallback } from 'react';
import { FiEye, FiEyeOff, FiRefreshCw } from 'react-icons/fi';
import '../../../styles/walletUtilities.css';

const BalanceCard = ({
  label,
  amount,
  currency = 'NGN',
  isLoading = false,
  onRefresh,
  variant = 'ngn', // 'ngn' or 'eth'
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleToggleVisibility = useCallback(() => {
    setIsVisible((prev) => !prev);
  }, []);

  const handleRefresh = useCallback(() => {
    if (onRefresh && !isLoading) {
      onRefresh();
    }
  }, [onRefresh, isLoading]);

  const formattedAmount = amount ? parseFloat(amount).toFixed(2) : '0.00';

  return (
    <div className="wallet-balance-card">
      {/* Header with label and actions */}
      <div className="wallet-flex-between" style={{ marginBottom: '1rem' }}>
        <div>
          <p className="wallet-balance-label">{label}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="wallet-btn wallet-btn--ghost wallet-btn--sm"
            title="Refresh balance"
            style={{ padding: '0.375rem 0.75rem' }}
          >
            <FiRefreshCw
              size={16}
              style={{
                animation: isLoading
                  ? 'wallet-spin 1s linear infinite'
                  : 'none',
              }}
            />
          </button>
          <button
            onClick={handleToggleVisibility}
            className="wallet-btn wallet-btn--ghost wallet-btn--sm"
            title={isVisible ? 'Hide balance' : 'Show balance'}
            style={{ padding: '0.375rem 0.75rem' }}
          >
            {isVisible ? <FiEye size={16} /> : <FiEyeOff size={16} />}
          </button>
        </div>
      </div>

      {/* Balance display */}
      <div style={{ marginBottom: '0.75rem' }}>
        {isVisible ? (
          <>
            <div className="wallet-balance-amount">
              {isLoading ? (
                <span
                  className="wallet-skeleton wallet-skeleton--text"
                  style={{ width: '150px' }}
                />
              ) : (
                formattedAmount
              )}
            </div>
            <span className="wallet-balance-currency">{currency}</span>
          </>
        ) : (
          <div className="wallet-balance-hidden">••••••••••</div>
        )}
      </div>

      {/* Status indicator */}
      <div
        style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}
      >
        {isLoading ? 'Updating...' : 'Balance is up to date'}
      </div>
    </div>
  );
};

export default React.memo(BalanceCard);
