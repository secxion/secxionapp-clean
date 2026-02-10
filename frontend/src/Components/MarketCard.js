import React from 'react';
import '../styles/marketplaceUtilities.css';

/**
 * MarketCard - Displays market/product details with pricing information
 * Modern, responsive design with improved UX
 * Memoized for performance optimization
 */
const MarketCard = ({ market }) => {
  const formatCurrency = (value) => {
    if (!value) return 'N/A';
    return typeof value === 'number'
      ? value.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : value;
  };

  if (!market) {
    return (
      <div className="marketplace-card">
        <p className="marketplace-text-secondary">No market data available</p>
      </div>
    );
  }

  return (
    <div className="marketplace-card marketplace-card--interactive">
      {/* Product Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h3
          className="marketplace-heading-3"
          style={{ marginBottom: '0.5rem' }}
        >
          {market.productName || 'Unnamed Product'}
        </h3>
        {market.description && (
          <p
            className="marketplace-text-secondary"
            style={{ marginTop: '0.5rem' }}
          >
            {market.description}
          </p>
        )}
      </div>

      {/* Total Amount */}
      {market.totalAmount && (
        <div
          style={{
            backgroundColor: '#f8fafc',
            padding: '1rem',
            borderRadius: '0.75rem',
            marginBottom: '1.5rem',
            borderLeft: '4px solid #6366f1',
          }}
        >
          <p
            className="marketplace-text-secondary"
            style={{ marginBottom: '0.25rem' }}
          >
            Total Amount
          </p>
          <p
            style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#6366f1',
            }}
          >
            {formatCurrency(market.totalAmount)}
          </p>
        </div>
      )}

      {/* Pricing Details */}
      {market.pricing && market.pricing.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h4
            className="marketplace-heading-3"
            style={{
              fontSize: '1.125rem',
              marginBottom: '1rem',
              color: '#1e293b',
            }}
          >
            Pricing Details
          </h4>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {market.pricing.map((price, index) => (
              <div
                key={price._id || index}
                style={{
                  border: '1px solid rgba(100, 116, 139, 0.1)',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  backgroundColor: '#ffffff',
                }}
              >
                <div style={{ marginBottom: '0.75rem' }}>
                  <p
                    className="marketplace-text-secondary"
                    style={{ marginBottom: '0.25rem' }}
                  >
                    Currency
                  </p>
                  <p
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: '600',
                      color: '#1e293b',
                    }}
                  >
                    {price.currency || 'N/A'}
                  </p>
                </div>

                {/* Face Values */}
                {price.faceValues && price.faceValues.length > 0 ? (
                  <div>
                    <p
                      className="marketplace-text-secondary"
                      style={{
                        fontSize: '0.875rem',
                        marginBottom: '0.75rem',
                        fontWeight: '600',
                      }}
                    >
                      Available Rates
                    </p>
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                      {price.faceValues.map((face, i) => (
                        <div
                          key={i}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '0.5rem',
                            padding: '0.75rem',
                            backgroundColor: '#f8fafc',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                          }}
                        >
                          <div>
                            <p
                              className="marketplace-text-secondary"
                              style={{ marginBottom: '0.25rem' }}
                            >
                              Face Value
                            </p>
                            <p style={{ fontWeight: '600', color: '#1e293b' }}>
                              {face.faceValue || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p
                              className="marketplace-text-secondary"
                              style={{ marginBottom: '0.25rem' }}
                            >
                              Rate
                            </p>
                            <p
                              style={{
                                fontWeight: '700',
                                color: '#10b981',
                              }}
                            >
                              {formatCurrency(face.sellingPrice)}
                            </p>
                          </div>
                          {face.description && (
                            <p
                              className="marketplace-text-secondary"
                              style={{
                                gridColumn: '1 / -1',
                                fontSize: '0.8rem',
                                marginTop: '0.25rem',
                              }}
                            >
                              📝 {face.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p
                    className="marketplace-text-secondary"
                    style={{ fontSize: '0.875rem' }}
                  >
                    No pricing tiers available
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Product Image */}
      {market.Image && market.Image.length > 0 ? (
        <div
          style={{
            marginTop: '1.5rem',
            borderRadius: '0.75rem',
            overflow: 'hidden',
          }}
        >
          <img
            src={market.Image[0]}
            alt={market.productName}
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              maxHeight: '300px',
              objectFit: 'cover',
            }}
            loading="lazy"
          />
        </div>
      ) : (
        <div
          style={{
            marginTop: '1.5rem',
            padding: '2rem',
            backgroundColor: '#f8fafc',
            borderRadius: '0.75rem',
            textAlign: 'center',
            border: '1px dashed rgba(100, 116, 139, 0.2)',
          }}
        >
          <p className="marketplace-text-secondary">📷 No image available</p>
        </div>
      )}
    </div>
  );
};

export default React.memo(MarketCard);
