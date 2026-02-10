import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import SummaryApi from '../common';
import '../styles/marketplaceUtilities.css';

/**
 * MarketInsights - Displays market analytics, trends, and insights
 * Shows trending products, price changes, and market statistics
 */
const MarketInsights = () => {
  const [insights, setInsights] = useState({
    topProducts: [],
    recentListings: [],
    priceMovement: [],
    marketStats: {
      totalListings: 0,
      activeListings: 0,
      cancelledListings: 0,
      completedListings: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMarketInsights = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch market data from API
      const response = await fetch(`${SummaryApi.getMarket.url}?limit=100`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (data.success && data.data) {
        const products = data.data;

        // Sort by creation date to find recent listings
        const recentListings = products.slice(0, 5);

        // Calculate stats
        const stats = {
          totalListings: products.length,
          activeListings: products.filter(
            (p) => !p.status || p.status === 'PROCESSING'
          ).length,
          cancelledListings: products.filter(
            (p) => p.status === 'CANCEL'
          ).length,
          completedListings: products.filter(
            (p) => p.status === 'DONE'
          ).length,
        };

        setInsights({
          topProducts: products.slice(0, 3),
          recentListings,
          priceMovement: products.slice(0, 5),
          marketStats: stats,
        });
      } else {
        setError('Failed to fetch market insights');
      }
    } catch (err) {
      console.error('Error fetching insights:', err);
      setError('Unable to load market insights');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarketInsights();
  }, [fetchMarketInsights]);

  const formatAmount = (amount) => {
    if (!amount) return '0';
    return parseFloat(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  if (loading) {
    return (
      <motion.div
        className="marketplace-card"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
          padding: '2rem',
        }}
      >
        <div className="skeleton skeleton-text--heading" style={{ marginBottom: '1rem' }} />
        <div className="skeleton skeleton-text" />
        <div className="skeleton skeleton-text" style={{ width: '70%' }} />
      </motion.div>
    );
  }

  return (
    <motion.div
      className="marketplace-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      style={{
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        color: 'white',
      }}
    >
      {/* Header */}
      <h2 className="marketplace-heading-2" style={{ color: 'white', marginBottom: '1.5rem' }}>
        📊 Market Insights
      </h2>

      {/* Market Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
          padding: '1rem',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '0.75rem',
          backdropFilter: 'blur(10px)',
        }}
      >
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <p style={{ fontSize: '0.875rem', opacity: 0.8, marginBottom: '0.25rem' }}>
            Total
          </p>
          <p style={{ fontSize: '1.5rem', fontWeight: '700' }}>
            {insights.marketStats.totalListings}
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <p style={{ fontSize: '0.875rem', opacity: 0.8, marginBottom: '0.25rem' }}>
            Active
          </p>
          <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>
            {insights.marketStats.activeListings}
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <p style={{ fontSize: '0.875rem', opacity: 0.8, marginBottom: '0.25rem' }}>
            Done
          </p>
          <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#fbbf24' }}>
            {insights.marketStats.completedListings}
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <p style={{ fontSize: '0.875rem', opacity: 0.8, marginBottom: '0.25rem' }}>
            Cancelled
          </p>
          <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ef4444' }}>
            {insights.marketStats.cancelledListings}
          </p>
        </motion.div>
      </div>

      {/* Top Products */}
      {insights.topProducts.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
            🔥 Top Products
          </h3>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {insights.topProducts.map((product, idx) => (
              <motion.div
                key={product._id || idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * idx }}
                style={{
                  padding: '0.75rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: '0.5rem',
                  borderLeft: '3px solid #fbbf24',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <p
                    style={{
                      fontWeight: '600',
                      marginBottom: '0.25rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {product.productName || 'Unnamed'}
                  </p>
                  <p
                    style={{
                      fontSize: '0.875rem',
                      opacity: 0.7,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {product.userDetails?.name || 'N/A'}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.9rem', fontWeight: '700', color: '#fbbf24' }}>
                    ${formatAmount(product.totalAmount)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Listings */}
      {insights.recentListings.length > 0 && (
        <div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
            ✨ Recent
          </h3>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {insights.recentListings.map((product, idx) => (
              <motion.div
                key={product._id || idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * idx }}
                style={{
                  padding: '0.75rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                }}
              >
                <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                  {product.productName || 'Unnamed'}
                </p>
                <p style={{ opacity: 0.7 }}>Amount: ${formatAmount(product.totalAmount)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'rgba(255, 0, 0, 0.2)', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}
    </motion.div>
  );
};

export default MarketInsights;
