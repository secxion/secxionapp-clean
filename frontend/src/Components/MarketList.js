import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import SummaryApi from '../common';
import ProductCard from './ProductCard';
import LoadingCard from './Marketplace/LoadingCard';
import ErrorState from './Marketplace/ErrorState';
import EmptyState from './Marketplace/EmptyState';
import { getCachedData, setCachedData, invalidateCachePatterns } from '../utils/cache';
import '../styles/marketplaceUtilities.css';

/**
 * MarketList - Displays browsable product list with pagination, search, filter, and sort
 * Responsive grid layout with modern loading/error states and advanced filtering
 * Optimized with debounced search, memoization, and request caching
 */
const MarketList = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(12); // Increased from 10 for better grid layout
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter and search states
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    fetchProducts();
  }, [page]);

  // Debounce search query - wait 300ms before applying search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [products, debouncedSearchQuery, statusFilter, sortBy]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `${SummaryApi.getMarket.url}?page=${page}&limit=${limit}`;
      
      // Check cache first
      const cached = getCachedData(url);
      if (cached && cached.success) {
        setProducts(cached.data);
        setTotalPages(cached.totalPages || 1);
        setLoading(false);
        return;
      }

      // Fetch fresh data
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      const responseData = await response.json();
      if (responseData.success) {
        // Cache the result (5 minute TTL)
        setCachedData(url, responseData, 5 * 60 * 1000);
        setProducts(responseData.data);
        setTotalPages(responseData.totalPages || 1);
      } else {
        setError(responseData.message || 'Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('An error occurred while fetching products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...products];

    // Apply search filter
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          (product.productName || '').toLowerCase().includes(query) ||
          (product.category || '').toLowerCase().includes(query) ||
          (product.userDetails?.name || '').toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((product) => {
        const status = product.status || 'PROCESSING';
        return status === statusFilter;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return (a.totalAmount || 0) - (b.totalAmount || 0);
        case 'price-high':
          return (b.totalAmount || 0) - (a.totalAmount || 0);
        case 'name':
          return (a.productName || '').localeCompare(b.productName || '');
        case 'recent':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    setFilteredProducts(filtered);
  };

  const handleRetry = () => {
    setPage(1);
    fetchProducts();
  };

  const handlePreviousPage = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage((prev) => prev + 1);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setSortBy('recent');
  };

  const hasActiveFilters = debouncedSearchQuery.trim() !== '' || statusFilter !== 'all' || sortBy !== 'recent';

  return (
    <div className="marketplace-container">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="marketplace-heading-1">🛍️ Marketplace</h1>
        <p
          className="marketplace-text-secondary"
          style={{ marginTop: '0.5rem' }}
        >
          Browse and trade available products and services
        </p>
      </div>

      {/* Help & Info Section */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          marginBottom: '2rem',
          padding: '1.5rem',
          backgroundColor: '#eff6ff',
          border: '2px solid #93c5fd',
          borderRadius: '0.75rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Status Guide */}
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.75rem', color: '#1e40af' }}>
            📊 Understanding Status
          </h3>
          <ul style={{ fontSize: '0.85rem', lineHeight: '1.6', color: '#1e3a8a', paddingLeft: '1.25rem' }}>
            <li><strong>🔄 Processing:</strong> Transaction is currently in progress</li>
            <li><strong>✅ Done:</strong> Transaction completed successfully</li>
            <li><strong>❌ Cancelled:</strong> Transaction was cancelled or failed</li>
          </ul>
        </div>

        {/* Search Tips */}
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.75rem', color: '#1e40af' }}>
            🔍 Search Tips
          </h3>
          <ul style={{ fontSize: '0.85rem', lineHeight: '1.6', color: '#1e3a8a', paddingLeft: '1.25rem' }}>
            <li>Search by product name, category, or seller</li>
            <li>Use filters to narrow down results</li>
            <li>Sort by price, date, or name for easy browsing</li>
          </ul>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.75rem', color: '#1e40af' }}>
            ⚡ Quick Start
          </h3>
          <ul style={{ fontSize: '0.85rem', lineHeight: '1.6', color: '#1e3a8a', paddingLeft: '1.25rem' }}>
            <li>View product details by clicking a card</li>
            <li>Check seller information on each listing</li>
            <li>Use the filter for specific status types</li>
          </ul>
        </div>
      </motion.div>

      {/* Search and Filter Controls */}
      <motion.div
        className="marketplace-card"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
          padding: '1.5rem',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '1rem',
          }}
        >
          {/* Search Input */}
          <div>
            <label
              htmlFor="marketplace-search"
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                marginBottom: '0.5rem',
                color: '#374151',
              }}
            >
              🔍 Search Products
            </label>
            <input
              id="marketplace-search"
              type="text"
              placeholder="Product name, category, or seller..."
              value={searchQuery}
              onChange={handleSearchChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '0.9rem',
                transition: 'all 0.3s ease',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#6366f1';
                e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Status Filter */}
          <div>
            <label
              htmlFor="marketplace-status"
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                marginBottom: '0.5rem',
                color: '#374151',
              }}
            >
              📊 Filter by Status
            </label>
            <select
              id="marketplace-status"
              value={statusFilter}
              onChange={handleStatusChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '0.9rem',
                backgroundColor: 'white',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#6366f1';
                e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="all">All Status</option>
              <option value="PROCESSING">🔄 Processing</option>
              <option value="DONE">✅ Done</option>
              <option value="CANCEL">❌ Cancelled</option>
            </select>
          </div>

          {/* Sort Options */}
          <div>
            <label
              htmlFor="marketplace-sort"
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                marginBottom: '0.5rem',
                color: '#374151',
              }}
            >
              ⬆️ Sort By
            </label>
            <select
              id="marketplace-sort"
              value={sortBy}
              onChange={handleSortChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '0.9rem',
                backgroundColor: 'white',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#6366f1';
                e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="recent">📅 Most Recent</option>
              <option value="price-low">💰 Price: Low to High</option>
              <option value="price-high">💸 Price: High to Low</option>
              <option value="name">🔤 Alphabetical</option>
            </select>
          </div>
        </div>

        {/* Active Filters Display and Clear Button */}
        {hasActiveFilters && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              paddingTop: '1rem',
              borderTop: '1px solid #d1d5db',
            }}
          >
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Active filters applied
            </span>
            <button
              onClick={handleClearFilters}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                color: '#6b7280',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#e5e7eb';
                e.target.style.color = '#374151';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#f3f4f6';
                e.target.style.color = '#6b7280';
              }}
            >
              ✕ Clear All
            </button>
          </div>
        )}
      </motion.div>

      {/* Error State */}
      {error && (
        <ErrorState
          title="Failed to load products"
          message={error}
          onRetry={handleRetry}
          emoji="⚠️"
        />
      )}

      {/* Loading State */}
      {loading ? (
        <div className="marketplace-grid">
          <LoadingCard count={limit} variant="card" />
        </div>
      ) : filteredProducts.length > 0 ? (
        <>
          {/* Results Count */}
          <div
            style={{
              marginBottom: '1rem',
              padding: '0.75rem',
              backgroundColor: '#f0f9ff',
              borderLeft: '4px solid #0ea5e9',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              color: '#0369a1',
            }}
          >
            Found <strong>{filteredProducts.length}</strong> product(s) matching your filters
          </div>

          {/* Products Grid */}
          <div className="marketplace-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
                marginTop: '2rem',
                padding: '1.5rem',
                backgroundColor: '#f8fafc',
                borderRadius: '0.75rem',
                flexWrap: 'wrap',
              }}
            >
              <button
                className="marketplace-btn marketplace-btn--secondary"
                disabled={page === 1}
                onClick={handlePreviousPage}
              >
                ← Previous
              </button>

              <div style={{ textAlign: 'center' }}>
                <p
                  className="marketplace-text-primary"
                  style={{ fontWeight: '600' }}
                >
                  Page {page} of {totalPages}
                </p>
              </div>

              <button
                className="marketplace-btn marketplace-btn--secondary"
                disabled={page === totalPages}
                onClick={handleNextPage}
              >
                Next →
              </button>
            </div>
          )}
        </>
      ) : (
        /* Empty State */
        <EmptyState
          title={hasActiveFilters ? 'No products match your filters' : 'No products available'}
          message={
            hasActiveFilters
              ? 'Try adjusting your search or filter criteria.'
              : 'Check back later for new products and trading opportunities.'
          }
          emoji="📭"
        />
      )}
    </div>
  );
};

export default MarketList;
