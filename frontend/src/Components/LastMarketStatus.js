import React, { useEffect, useState, useContext, useCallback } from 'react';
import { createPortal } from 'react-dom';
import SummaryApi from '../common';
import UserContext from '../Context';
import { CircleCheck, CircleX, Loader, Clock, Image } from 'lucide-react';
import currencyData from '../helpers/currencyData';
import SecxionShimmer from './SecxionShimmer';
import { motion } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import { apiFetch, handleApiResponse } from '../utils/apiInterceptor';
import { ensureHttpsUrl } from '../utils/secureUrl';

const ImageModal = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;

  const modal = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 p-4"
      onClick={onClose}
    >
      <motion.button
        onClick={onClose}
        className="absolute right-4 top-16 z-10 inline-flex h-11 w-11 min-w-11 max-w-11 shrink-0 items-center justify-center rounded-xl border-2 border-white/20 bg-red-600 p-0 text-white shadow-2xl transition-colors hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500/50 sm:right-6"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ opacity: 1, rotate: 0, scale: 1 }}
        exit={{ opacity: 0, rotate: 0 }}
        transition={{ duration: 0.2 }}
        aria-label="Close image viewer"
      >
        <FaTimes className="h-5 w-5 shrink-0" />
      </motion.button>

      <div
        className="relative bg-white p-2 rounded-lg shadow-xl max-w-full max-h-full flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={ensureHttpsUrl(imageUrl)}
          alt="Expanded view"
          className="max-w-[90vw] max-h-[90vh] object-contain rounded-md"
        />
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

const LastMarketStatus = () => {
  const [lastMarket, setLastMarket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(UserContext);

  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState('');

  const handleImageClick = (imageUrl) => {
    setModalImageUrl(imageUrl);
    setShowImageModal(true);
  };

  const handleCloseModal = useCallback(() => {
    setModalImageUrl('');
    setShowImageModal(false);
  }, []);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && showImageModal) {
        handleCloseModal();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showImageModal, handleCloseModal]);

  useEffect(() => {
    let syncInFlight = false;

    const fetchLastMarketStatus = async (options = {}) => {
      const { showLoading = false, surfaceError = false } = options;

      if (syncInFlight) return;
      syncInFlight = true;

      if (showLoading) setLoading(true);
      if (surfaceError) setError(null);

      try {
        const response = await apiFetch(SummaryApi.lastUserMarketStatus.url);
        const dataResponse = await handleApiResponse(response);

        // If unauthorized (401), interceptor already logged out
        if (response.status === 401) {
          setError('Your session expired. Please login again.');
          setLastMarket(null);
          return;
        }

        if (dataResponse.success && dataResponse.data) {
          setLastMarket(dataResponse.data);
          setError(null);
        } else if (!dataResponse.success) {
          // Only show error if not a 401 (401 is handled by interceptor)
          const errorMsg =
            dataResponse.error || 'Failed to fetch market status.';
          if (surfaceError) {
            setError(errorMsg);
            setLastMarket(null);
          }
        }
      } catch (err) {
        console.error('Error fetching last market status:', err);
        if (surfaceError) {
          setError('An error occurred while fetching data. Please try again.');
          setLastMarket(null);
        }
      } finally {
        syncInFlight = false;
        if (showLoading) setLoading(false);
      }
    };

    fetchLastMarketStatus({ showLoading: true, surfaceError: true });
    const interval = setInterval(() => fetchLastMarketStatus(), 30000);
    return () => clearInterval(interval);
  }, [user]);

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'DONE':
        return {
          icon: <CircleCheck className="w-5 h-5 text-green-600" />,
          text: 'Completed',
          color: 'text-green-600',
        };
      case 'PROCESSING':
        return {
          icon: <Loader className="h-5 w-5 animate-spin text-brand-gold" />,
          text: 'Processing',
          color: 'text-brand-gold',
        };
      case 'CANCEL':
        return {
          icon: <CircleX className="w-5 h-5 text-red-600" />,
          text: 'Cancelled',
          color: 'text-red-600',
        };
      default:
        return {
          icon: <Clock className="w-5 h-5 text-gray-500" />,
          text: 'Pending',
          color: 'text-gray-500',
        };
    }
  };

  const formatCurrency = (amount, currencyCode = '') => {
    if (typeof amount !== 'number') return 'N/A';

    const options = {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    };

    const currencyInfo = currencyData.find((c) => c.value === currencyCode);
    const symbol = currencyInfo ? currencyInfo.symbol : currencyCode;

    return `${symbol} ${amount.toLocaleString(undefined, options)}`;
  };

  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-brand-gold/20 bg-gradient-to-br from-black via-zinc-950 to-zinc-900 shadow-xl">
        <div
          className="absolute inset-0 opacity-40 blur-3xl"
          aria-hidden="true"
        >
          <div className="absolute -top-20 right-10 h-40 w-40 rounded-full bg-brand-gold/15" />
        </div>
        <div className="relative z-10 p-6">
          <h2 className="text-2xl font-bold text-white mb-4">
            Last Market Activity
          </h2>
          <SecxionShimmer type="list" count={3} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-8 flex h-48 items-center justify-center rounded-2xl border border-red-500/40 bg-red-500/10 p-6 text-red-200 shadow-[0_0_24px_rgba(239,68,68,0.14)]">
        <CircleX className="mr-2 h-6 w-6" />
        <p className="text-sm font-semibold">{error}</p>
      </div>
    );
  }

  if (!lastMarket) {
    return (
      <div className="my-8 flex h-48 items-center justify-center rounded-2xl border border-white/10 bg-black/25 p-6 text-gray-300 shadow-xl">
        <Clock className="mr-2 h-6 w-6 text-brand-gold" />
        <p className="text-sm font-semibold uppercase tracking-wide">
          No recent market activities found.
        </p>
      </div>
    );
  }

  const statusDisplay = getStatusDisplay(lastMarket.status);
  const lastUpdateDate = new Date(lastMarket.timestamp).toLocaleString();

  return (
    <section className="max-w-7xl mx-auto my-12 p-8 bg-white/[0.02] border border-white/5 rounded-3xl transition-all duration-300 hover:bg-white/[0.04] hover:border-brand-gold/20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10 border-b border-white/5 pb-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-black font-spaceGrotesk text-white uppercase tracking-tight">
            Last Market Activity
          </h2>
          <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em] mt-2">
            Status: {statusDisplay.text.toUpperCase()}
          </p>
        </div>
        <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-gray-500">
          <div className="flex items-center gap-3">
            <span className="text-gray-700">ID:</span>
            <span className="text-brand-gold font-mono">
              {lastMarket._id?.toUpperCase().slice(-12)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-gray-700">Updated:</span>
            <span className="text-white">{lastUpdateDate.toUpperCase()}</span>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-1 gap-8">
          {lastMarket.pricing && lastMarket.pricing.length > 0 ? (
            lastMarket.pricing.map((priceBlock, pbIndex) => (
              <div key={pbIndex} className="space-y-8">
                <div className="bg-black/20 border border-white/10 rounded-3xl p-10 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-brand-gold/10 transition-colors" />

                  <div className="relative z-10 flex flex-col lg:flex-row justify-between gap-12">
                    <div className="space-y-8 flex-1">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center p-3 shadow-brand-gold">
                          {lastMarket.productImage &&
                          lastMarket.productImage.length > 0 ? (
                            <img
                              src={ensureHttpsUrl(lastMarket.productImage[0])}
                              alt=""
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <Image className="w-6 h-6 text-brand-gold" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-2xl font-black text-white font-spaceGrotesk uppercase tracking-tight">
                            {lastMarket.productName || 'Unnamed Asset'}
                          </h3>
                          <div className="flex items-center gap-3 mt-1">
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${statusDisplay.color.replace('text-', 'bg-')}`}
                            />
                            <span
                              className={`text-[10px] font-black uppercase tracking-widest ${statusDisplay.color}`}
                            >
                              {statusDisplay.text}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-6 border-y border-white/5">
                        <div className="space-y-4">
                          <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em]">
                            Pricing Structure
                          </p>
                          {priceBlock.faceValues.map((fv, fvIndex) => (
                            <div
                              key={fvIndex}
                              className="flex justify-between items-center bg-white/5 px-4 py-3 rounded-xl border border-white/5"
                            >
                              <span className="text-xs font-bold text-gray-400">
                                {fv.faceValue}
                              </span>
                              <span className="text-brand-gold font-black font-mono text-xs">
                                Rate: {formatCurrency(fv.sellingPrice)}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em]">
                              Total Volume
                            </p>
                            <p className="text-2xl font-black text-white font-spaceGrotesk tracking-tighter">
                              {priceBlock.currency}{' '}
                              {formatCurrency(lastMarket.totalAmount)}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-[9px] font-black text-brand-gold uppercase tracking-[0.3em]">
                              Estimated Value
                            </p>
                            <p className="text-3xl font-black text-emerald-400 font-spaceGrotesk tracking-tighter shadow-brand-gold">
                              ₦
                              {formatCurrency(lastMarket.calculatedTotalAmount)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {lastMarket.userRemark && (
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                          <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">
                            User Notes
                          </p>
                          <p className="text-xs font-medium text-gray-400 italic">
                            "{lastMarket.userRemark}"
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="lg:w-72 space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        {lastMarket.Image.map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleImageClick(img)}
                            className="aspect-square rounded-2xl overflow-hidden border border-white/10 hover:border-brand-gold/50 transition-all group"
                          >
                            <img
                              src={ensureHttpsUrl(img)}
                              alt=""
                              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                            />
                          </button>
                        ))}
                      </div>

                      {lastMarket.status === 'CANCEL' &&
                        lastMarket.cancelReason && (
                          <div className="mt-6 p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-300">
                            <p className="text-[9px] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                              <CircleX className="w-3 h-3" /> Rejection Details
                            </p>
                            <p className="text-xs font-bold leading-relaxed">
                              {lastMarket.cancelReason.toUpperCase()}
                            </p>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5">
              <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">
                NO RECENT RECORDS DETECTED.
              </p>
            </div>
          )}
        </div>
      </div>

      <ImageModal imageUrl={modalImageUrl} onClose={handleCloseModal} />
    </section>
  );
};

export default LastMarketStatus;
