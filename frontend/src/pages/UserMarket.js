import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import SummaryApi from '../common';
import UserUploadMarket from '../Components/UserUploadMarket';
import HistoryCard from '../Components/HistoryCard';
import HistoryDetailView from '../Components/HistoryDetailView';
import UserContext from '../Context';
import LoadingCard from '../Components/Marketplace/LoadingCard';
import ErrorState from '../Components/Marketplace/ErrorState';
import EmptyState from '../Components/Marketplace/EmptyState';
import { motion } from 'framer-motion';
import '../styles/marketplaceUtilities.css';

/**
 * UserMarket - Trade Status Dashboard
 * Displays user's market products/transactions with status management
 */
const UserMarket = () => {
  const [openUploadProduct, setOpenUploadProduct] = useState(false);
  const [allProduct, setAllProduct] = useState([]);
  const { user } = useContext(UserContext);
  const { marketId } = useParams();
  const [selectedProductForDetail, setSelectedProductForDetail] =
    useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAllProduct = useCallback(async () => {
    if (!user || !user._id) {
      console.warn('User is not defined or userId is missing.');
      setError('User information not available');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${SummaryApi.myMarket.url}?userId=${user._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          credentials: 'include',
        },
      );

      const dataResponse = await response.json();
      setAllProduct(dataResponse?.data || []);
    } catch (error) {
      console.error('Failed to fetch all products:', error);
      setError('Failed to load your products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchProductById = useCallback(
    async (id) => {
      if (!user || !user._id || !id) {
        console.warn('User or market ID is missing.');
        setAllProduct([]);
        setError('Invalid product ID');
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          SummaryApi.myMarketById.url.replace(':marketId', id),
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            credentials: 'include',
          },
        );

        const dataResponse = await response.json();
        setAllProduct(dataResponse?.data ? [dataResponse.data] : []);
        setSelectedProductForDetail(dataResponse?.data || null);
      } catch (error) {
        console.error(`Failed to fetch product with ID ${id}:`, error);
        setError('Failed to load product details.');
        setAllProduct([]);
        setSelectedProductForDetail(null);
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  useEffect(() => {
    if (marketId) {
      fetchProductById(marketId);
    } else if (user && user._id) {
      fetchAllProduct();
    }
  }, [fetchAllProduct, fetchProductById, marketId, user]);

  const handleCloseDetailView = () => {
    setSelectedProductForDetail(null);
  };

  const handleRetry = () => {
    if (marketId) {
      fetchProductById(marketId);
    } else {
      fetchAllProduct();
    }
  };

  return (
    <motion.div
      className="marketplace-bg-lighter"
      style={{ minHeight: '100vh', paddingTop: '6rem', paddingBottom: '4rem' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="marketplace-container">
        {/* Error State */}
        {error && (
          <ErrorState
            title="Failed to load transactions"
            message={error}
            onRetry={handleRetry}
            emoji="⚠️"
          />
        )}

        {/* Loading State */}
        {loading ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.5rem',
            }}
          >
            <LoadingCard count={6} variant="card" />
          </div>
        ) : allProduct.length > 0 ? (
          /* Products Grid */
          <motion.div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {allProduct.map((product) => (
              <motion.div
                key={product._id || `product-${product.name}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <HistoryCard
                  data={{
                    ...product,
                    crImage:
                      product.crImage ||
                      product.cancelImage ||
                      product.image ||
                      null,
                  }}
                  isDetailViewOpen={
                    selectedProductForDetail?._id === product._id
                  }
                  onCloseDetailView={handleCloseDetailView}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : marketId ? (
          /* Not Found State */
          <EmptyState
            title="Transaction Not Found"
            message="The requested market record could not be found."
            emoji="🔍"
            onAction={() => window.history.back()}
            actionLabel="← Go Back"
          />
        ) : (
          /* Empty State */
          <EmptyState title="No transactions yet" />
        )}
      </div>

      {/* Detail Modal */}
      {selectedProductForDetail && (
        <motion.div
          style={{
            position: 'fixed',
            inset: '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: '50',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            padding: '1rem',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) handleCloseDetailView();
            }}
            style={{ width: '100%', maxWidth: '600px' }}
          >
            <HistoryDetailView
              productDetails={{
                ...selectedProductForDetail,
                crImage:
                  selectedProductForDetail.crImage ||
                  selectedProductForDetail.cancelImage ||
                  selectedProductForDetail.image ||
                  null,
              }}
              onClose={handleCloseDetailView}
            />
          </motion.div>
        </motion.div>
      )}

      {/* Upload Modal */}
      {openUploadProduct && (
        <UserUploadMarket
          onClose={() => setOpenUploadProduct(false)}
          fetchData={fetchAllProduct}
        />
      )}
    </motion.div>
  );
};

export default UserMarket;
