import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import UserUploadMarket from './UserUploadMarket';
import GetInTouchFooter from './GetInTouchFooter';
import SummaryApi from '../common';
import currencyFullNames from '../helpers/currencyFullNames';
import flagImageMap from '../helpers/flagImageMap';
import Loader from './Loader';
import BackButton from './BackButton';

// Constants
const DEBOUNCE_DELAY = 300;
const MAX_RETRY_ATTEMPTS = 3;

const ProductDetails = () => {
  // State management
  const [data, setData] = useState({
    productName: '',
    brandName: '',
    category: '',
    productImage: [],
    description: '',
    pricing: [],
  });

  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [isPDSidePanelOpen, setIsPDSidePanelOpen] = useState(false);
  const [activeCurrency, setActiveCurrency] = useState(null);
  const [selectedFaceValue, setSelectedFaceValue] = useState(null);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  // Redux and routing
  const { user } = useSelector((state) => state.user);
  const { id } = useParams();
  const navigate = useNavigate();

  // Memoized values
  const hasValidPricing = useMemo(
    () =>
      data?.pricing && Array.isArray(data.pricing) && data.pricing.length > 0,
    [data?.pricing],
  );

  const currentFaceValues = useMemo(
    () => activeCurrency?.faceValues || [],
    [activeCurrency?.faceValues],
  );

  const selectedCurrencyInfo = useMemo(() => {
    if (!activeCurrency) return null;
    return {
      fullName:
        currencyFullNames[activeCurrency.currency] || activeCurrency.currency,
      flag: flagImageMap[activeCurrency.currency],
      currency: activeCurrency.currency,
    };
  }, [activeCurrency]);

  // Event handlers

  const fetchProductDetails = useCallback(async () => {
    if (!id) {
      setError('Product ID is missing');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(SummaryApi.productDetails.url, {
        method: SummaryApi.productDetails.method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ productId: id }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData?.message ||
            `HTTP ${response.status}: Failed to fetch product details`,
        );
      }

      const dataResponse = await response.json();

      if (!dataResponse?.data) {
        throw new Error('Invalid response format');
      }

      setData(dataResponse.data);
      setActiveCurrency(dataResponse.data.pricing?.[0] || null);
      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      console.error('⚠️ Error fetching product details:', err);

      if (err.name === 'AbortError') {
        setError(
          'Request timed out. Please check your connection and try again.',
        );
      } else {
        setError(err.message);
      }

      toast.error(`⚠️ ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const handleCurrencyChange = useCallback(
    (currency) => {
      const selectedCurrency = data.pricing.find(
        (item) => item.currency === currency,
      );
      setActiveCurrency(selectedCurrency);
      setSelectedFaceValue(null);

      // Announce currency change for screen readers
      const announcement = `Selected currency: ${currencyFullNames[currency] || currency}`;
      const announcer = document.createElement('div');
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.className = 'sr-only';
      announcer.textContent = announcement;
      document.body.appendChild(announcer);
      setTimeout(() => document.body.removeChild(announcer), DEBOUNCE_DELAY);
    },
    [data.pricing],
  );

  const handleSell = useCallback(
    (faceValue) => {
      if (!user) {
        toast.error('Please log in to sell items');
        navigate('/login');
        return;
      }
      setSelectedFaceValue(faceValue);
      setShowUploadForm(true);
    },
    [user, navigate],
  );

  const handleGoBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleCloseUploadForm = useCallback(() => {
    setShowUploadForm(false);
    setSelectedFaceValue(null);
  }, []);

  const handleRetry = useCallback(async () => {
    if (retryCount >= MAX_RETRY_ATTEMPTS) {
      toast.error('Maximum retry attempts reached. Please refresh the page.');
      return;
    }

    setIsRetrying(true);
    setRetryCount((prev) => prev + 1);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second before retry
      await fetchProductDetails();
    } catch (err) {
      console.error('Retry failed:', err);
    } finally {
      setIsRetrying(false);
    }
  }, [retryCount, fetchProductDetails]);

  const closePDSidePanel = useCallback(() => {
    setIsPDSidePanelOpen(false);
  }, []);

  // Effects
  useEffect(() => {
    fetchProductDetails();
  }, [fetchProductDetails]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (showUploadForm) {
          handleCloseUploadForm();
        } else if (isPDSidePanelOpen) {
          closePDSidePanel();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    showUploadForm,
    isPDSidePanelOpen,
    handleCloseUploadForm,
    closePDSidePanel,
  ]);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col justify-center border border-white/10 bg-slate-950 py-6 sm:py-12">
        <div className="relative py-3 sm:mx-auto sm:max-w-xl">
          <div className="absolute inset-0 -rotate-6 rounded-3xl border border-red-400/30 bg-red-500/10 shadow-[0_0_35px_rgba(239,68,68,0.15)] sm:skew-y-0"></div>
          <div className="relative rounded-3xl border border-white/10 bg-slate-900/90 px-4 py-10 text-center shadow-[0_0_35px_rgba(0,0,0,0.25)] sm:p-20">
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-red-500 "
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="mb-4 text-2xl font-semibold text-white">
              Error Loading Product
            </h2>
            <p className="mb-6 text-slate-300" role="alert">
              {error}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleRetry}
                disabled={isRetrying || retryCount >= MAX_RETRY_ATTEMPTS}
                className="rounded border border-brand-gold/30 bg-brand-gold px-4 py-2 font-semibold text-slate-950 transition-colors hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-brand-gold/50 disabled:cursor-not-allowed disabled:bg-slate-600"
                aria-label={
                  isRetrying ? 'Retrying...' : 'Retry loading product'
                }
              >
                {isRetrying ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Retrying...
                  </>
                ) : (
                  `Retry ${retryCount > 0 ? `(${retryCount}/${MAX_RETRY_ATTEMPTS})` : ''}`
                )}
              </button>
              <BackButton
                onClick={handleGoBack}
                label="Go Back"
                ariaLabel="Go back to previous page"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-screen overflow-x-auto bg-transparent"
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(255,255,255,0.25) transparent',
      }}
    >
      {/* Header */}
      <header className="fixed left-0 right-0 top-0 w-screen bg-gray-700 px-2 backdrop-blur-sm md:backdrop-blur-none lg:backdrop-blur-none sm:px-4 lg:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Currency Selection */}
          {hasValidPricing && (
            <div className="mt-24 md:mt-28 lg:mt-32">
              <div
                className="overflow-x-auto bg-transparent p-4 py-2 md:py-3 lg:py-3"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(255,255,255,0.25) transparent',
                }}
              >
                {' '}
                {/* Changed to white background and bold yellow border */}
                <div
                  className="flex items-center space-x-3 px-2"
                  role="tablist"
                  aria-label="Currency selection"
                >
                  {data.pricing.map((currency) => {
                    const fullCurrencyName =
                      currencyFullNames[currency.currency] || currency.currency;
                    const isActive =
                      activeCurrency?.currency === currency.currency;

                    return (
                      <button
                        key={currency.currency}
                        role="tab"
                        aria-selected={isActive}
                        aria-controls={`currency-panel-${currency.currency}`}
                        className={`flex flex-shrink-0 items-center rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-gold/50 ${
                          isActive
                            ? 'bg-brand-gold/15 text-brand-gold'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                        }`}
                        onClick={() => handleCurrencyChange(currency.currency)}
                        aria-label={`Select ${fullCurrencyName} currency`}
                      >
                        {flagImageMap[currency.currency] && (
                          <img
                            src={flagImageMap[currency.currency]}
                            alt={`${currency.currency} flag`}
                            className="w-5 h-5 mr-2 rounded-sm object-contain shadow-inner"
                            style={{ minWidth: '20px', minHeight: '20px' }}
                            loading="lazy"
                          />
                        )}
                        <span>{fullCurrencyName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>
      {/* Main Content */}
      <main className="min-h-screen premium-bg px-4 pb-24 pt-44 sm:px-6 md:pt-40 md:mt-10 lg:pt-44 lg:mt-10lg:px-8">
        {' '}
        {/* Changed to white background */}
        <div className="max-w-7xl mx-auto">
          {/* Product Description */}
          <div className="mb-6 p-0">
            {' '}
            {/* White background and yellow border */}
            <h2 className="mb-3 antialiased font-spaceGrotesk text-xs font-black uppercase tracking-[0.18em] text-brand-gold md:text-sm lg:text-sm md:tracking-[0.14em] lg:tracking-[0.12em]">
              Product Description
            </h2>
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <p className="text-sm leading-relaxed text-gray-300">
                  {' '}
                  {/* Applied glossy text */}
                  {data.description || 'No description available.'}
                </p>
                {data.brandName && (
                  <span className="mt-2 inline-flex items-center px-3 py-1 text-[10px] font-black uppercase tracking-[0.3em] text-brand-gold/80 font-spaceGrotesk">
                    {' '}
                    {/* Applied glossy text */}
                    {data.brandName}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Face Values */}
          <div className="overflow-hidden bg-transparent">
            {' '}
            {/* White background and yellow border */}
            <div className="p-0">
              <h2 className="mb-4 antialiased font-spaceGrotesk text-xs font-black uppercase tracking-[0.18em] text-brand-gold md:text-sm lg:text-sm md:tracking-[0.14em] lg:tracking-[0.12em]">
                Select Face Value
                {selectedCurrencyInfo && (
                  <span className="ml-2 font-spaceGrotesk text-[10px] font-black uppercase tracking-[0.16em] text-gray-400 md:text-xs md:tracking-[0.12em]">
                    {' '}
                    {/* Applied glossy text */}({selectedCurrencyInfo.fullName})
                  </span>
                )}
              </h2>

              {activeCurrency && currentFaceValues.length > 0 ? (
                <div
                  className="space-y-4"
                  role="tabpanel"
                  id={`currency-panel-${activeCurrency.currency}`}
                >
                  {currentFaceValues.map((fv, index) => (
                    <div key={`${fv.faceValue}-${index}`} className="">
                      {/* Top row: Face value info + Sell button */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center space-x-4">
                          {selectedCurrencyInfo?.flag && (
                            <img
                              src={selectedCurrencyInfo.flag}
                              alt={`${selectedCurrencyInfo.currency} flag`}
                              className="w-6 h-6 rounded-sm object-contain shadow-sm flex-shrink-0"
                              style={{ minWidth: '20px', minHeight: '20px' }}
                              loading="lazy"
                            />
                          )}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-2 sm:space-y-0">
                            <div className="flex items-center space-x-2">
                              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 font-spaceGrotesk">
                                Face Value:
                              </span>
                              <span className="font-semibold text-white">
                                {fv.faceValue}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 font-spaceGrotesk">
                                Rate:
                              </span>
                              <span className="font-semibold text-brand-gold">
                                {fv.sellingPrice}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          className="inline-flex flex-shrink-0 items-center justify-center rounded-xl bg-brand-gold px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.3em] text-brand-dark-base transition-all duration-200 hover:bg-yellow-500 focus:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-brand-gold/50 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
                          onClick={() => handleSell(fv)}
                          disabled={!user}
                          aria-label={`Sell ${fv.faceValue} ${selectedCurrencyInfo?.currency} at rate ${fv.sellingPrice}`}
                        >
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                          </svg>
                          Sell Now
                        </button>
                      </div>

                      {/* Requirement block - always full width below */}
                      {fv.requirement && (
                        <div
                          className="mt-3 bg-white/[0.03] px-3 py-3 text-sm italic text-gray-400"
                          style={{ whiteSpace: 'pre-line' }}
                        >
                          {fv.requirement}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-transparent p-8 text-center">
                  {' '}
                  {/* White background and yellow border */}
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400 mb-4 "
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                  <h3 className="mb-2 text-lg font-semibold text-white">
                    No Denominations Available
                  </h3>
                  <p className="text-sm text-gray-500">
                    {' '}
                    {/* Applied glossy text */}
                    {hasValidPricing
                      ? 'No denominations available for the selected currency.'
                      : 'This product has no available currencies or denominations.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      {/* Upload Form Modal */}
      {showUploadForm && selectedFaceValue && activeCurrency && (
        <div className="fixed z-50 inset-0 overflow-y-auto bg-black bg-opacity-50">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="relative w-full max-w-md rounded-3xl bg-brand-dark-base/95 shadow-[0_0_40px_rgba(0,0,0,0.35)]">
              {' '}
              {/* White background and yellow border */}
              <button
                onClick={() => setShowUploadForm(false)}
                className="absolute right-3 top-3 rounded-full bg-white/5 p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white focus:outline-none"
              >
                <svg className="h-5 w-5 fill-current" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <div className="py-6 px-6">
                <h2 className="mb-4 text-[10px] font-black uppercase tracking-[0.4em] text-brand-gold font-spaceGrotesk">
                  Upload Market Item ({activeCurrency?.currency}{' '}
                  {selectedFaceValue?.faceValue})
                </h2>
                <UserUploadMarket
                  onClose={() => setShowUploadForm(false)}
                  fetchData={() => setShowUploadForm(false)}
                  productDetails={{
                    productName: data.productName,
                    productImage: data.productImage[0],
                    currency: activeCurrency.currency,
                    rate: selectedFaceValue.sellingPrice,
                    faceValue: selectedFaceValue.faceValue,
                    requirement: selectedFaceValue.requirement,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      <GetInTouchFooter />
    </div>
  );
};

export default ProductDetails;
