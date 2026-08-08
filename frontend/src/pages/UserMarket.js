import React, {
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SummaryApi from '../common';
import UserUploadMarket from '../Components/UserUploadMarket';
import HistoryCard from '../Components/HistoryCard';
import HistoryDetailView from '../Components/HistoryDetailView';
import UserContext from '../Context';
import LoadingCard from '../Components/Marketplace/LoadingCard';
import ErrorState from '../Components/Marketplace/ErrorState';
import EmptyState from '../Components/Marketplace/EmptyState';
import { motion } from 'framer-motion';
import BackButton from '../Components/BackButton';
import '../styles/marketplaceUtilities.css';

/**
 * UserMarket - Trade Status Dashboard
 * Displays user's market products/transactions with status management
 */
const UserMarket = () => {
  const navigate = useNavigate();
  const [openUploadProduct, setOpenUploadProduct] = useState(false);
  const [allProduct, setAllProduct] = useState([]);
  const { user } = useContext(UserContext);
  const { marketId } = useParams();
  const [selectedProductForDetail, setSelectedProductForDetail] =
    useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const syncInFlightRef = useRef(false);

  const fetchAllProduct = useCallback(
    async (options = {}) => {
      const { showLoading = false, surfaceError = false } = options;

      if (syncInFlightRef.current) return;

      if (!user || !user._id) {
        console.warn('User is not defined or userId is missing.');
        if (surfaceError) setError('User information not available');
        return;
      }

      syncInFlightRef.current = true;
      if (showLoading) setLoading(true);
      if (surfaceError) setError(null);

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
        setError(null);
      } catch (error) {
        console.error('Failed to fetch all products:', error);
        if (surfaceError) {
          setError('Failed to load your products. Please try again.');
        }
      } finally {
        syncInFlightRef.current = false;
        if (showLoading) setLoading(false);
      }
    },
    [user],
  );

  const fetchProductById = useCallback(
    async (id, options = {}) => {
      const { showLoading = false, surfaceError = false } = options;

      if (syncInFlightRef.current) return;

      if (!user || !user._id || !id) {
        console.warn('User or market ID is missing.');
        if (surfaceError) {
          setAllProduct([]);
          setError('Invalid product ID');
        }
        return;
      }

      syncInFlightRef.current = true;
      if (showLoading) setLoading(true);
      if (surfaceError) setError(null);

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
        setError(null);
      } catch (error) {
        console.error(`Failed to fetch product with ID ${id}:`, error);
        if (surfaceError) {
          setError('Failed to load product details.');
          setAllProduct([]);
          setSelectedProductForDetail(null);
        }
      } finally {
        syncInFlightRef.current = false;
        if (showLoading) setLoading(false);
      }
    },
    [user],
  );

  useEffect(() => {
    const syncRecords = (options) => {
      if (marketId) {
        fetchProductById(marketId, options);
      } else if (user && user._id) {
        fetchAllProduct(options);
      }
    };

    syncRecords({ showLoading: true, surfaceError: true });

    const interval = setInterval(() => syncRecords(), 30000);

    return () => clearInterval(interval);
  }, [fetchAllProduct, fetchProductById, marketId, user]);

  const handleCloseDetailView = () => {
    setSelectedProductForDetail(null);
  };

  const handleRetry = () => {
    if (marketId) {
      fetchProductById(marketId, {
        showLoading: true,
        surfaceError: true,
      });
    } else {
      fetchAllProduct({ showLoading: true, surfaceError: true });
    }
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate('/home');
  };

  return (
    <motion.div
      className="relative min-h-screen overflow-hidden px-4 py-4 pb-20 sm:px-6 lg:px-8 premium-bg"
      style={{ minHeight: '60vh', paddingTop: '8rem', paddingBottom: '4rem' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mx-auto max-w-7xl">
        <BackButton fallbackTo="/home" className="mb-6" />

        <div className="mb-8 rounded-3xl border border-white/10 bg-brand-dark-elevated/75 p-6 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-brand-gold/70 font-spaceGrotesk">
                Trade Status
              </p>
              <h1 className="mt-2 text-2xl font-black text-white font-spaceGrotesk tracking-wide">
                Transaction Record
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-gray-400">
                Monitor your active deals, settlement progress, and completed
                transfers in one premium workspace.
              </p>
            </div>
            <div className="rounded-2xl border border-brand-gold/20 bg-brand-gold/10 px-4 py-3 text-sm text-brand-gold">
              Live status overview
            </div>
          </div>
        </div>

        <div className="space-y-6">
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
              onAction={handleGoBack}
              actionLabel="← Go Back"
            />
          ) : (
            /* Empty State */
            <EmptyState title="No transactions yet" />
          )}
        </div>
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
