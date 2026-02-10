import React from 'react';
import '../../styles/marketplaceUtilities.css';

/**
 * LoadingCard - Skeleton loader for marketplace cards
 * Shows shimmer animation while data is loading
 */
const LoadingCard = ({ count = 1, variant = 'card' }) => {
  const cards = Array.from({ length: count }, (_, i) => i);

  if (variant === 'card') {
    return (
      <>
        {cards.map((index) => (
          <div key={index} className="marketplace-card skeleton skeleton-card">
            <div className="skeleton skeleton-text--heading" />
            <div className="skeleton skeleton-text" />
            <div className="skeleton skeleton-text" style={{ width: '80%' }} />
            <div style={{ marginTop: '1rem' }}>
              <div className="skeleton skeleton-text" />
              <div
                className="skeleton skeleton-text"
                style={{ width: '60%' }}
              />
            </div>
          </div>
        ))}
      </>
    );
  }

  if (variant === 'list') {
    return (
      <>
        {cards.map((index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              gap: '1rem',
              padding: '1rem',
              marginBottom: '1rem',
            }}
          >
            <div
              className="skeleton skeleton-avatar"
              style={{ flexShrink: 0 }}
            />
            <div style={{ flex: 1 }}>
              <div className="skeleton skeleton-text--heading" />
              <div className="skeleton skeleton-text" />
              <div
                className="skeleton skeleton-text"
                style={{ width: '70%' }}
              />
            </div>
          </div>
        ))}
      </>
    );
  }

  return null;
};

export default LoadingCard;
