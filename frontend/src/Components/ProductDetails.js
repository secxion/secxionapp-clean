import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { toast } from 'react-toastify';
import UserUploadMarket from './UserUploadMarket';
import GetInTouchFooter from './GetInTouchFooter';
import Shimmer from './Shimmer';
import SummaryApi from '../common';
import { setUserDetails } from "../store/userSlice";
import currencyFullNames from "../helpers/currencyFullNames";
import flagImageMap from "../helpers/flagImageMap";
import Loader from './Loader';

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
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.user);
    const { id } = useParams();
    const navigate = useNavigate();

    // Memoized values
    const hasValidPricing = useMemo(() => 
        data?.pricing && Array.isArray(data.pricing) && data.pricing.length > 0, 
        [data?.pricing]
    );

    const currentFaceValues = useMemo(() => 
        activeCurrency?.faceValues || [], 
        [activeCurrency?.faceValues]
    );

    const selectedCurrencyInfo = useMemo(() => {
        if (!activeCurrency) return null;
        return {
            fullName: currencyFullNames[activeCurrency.currency] || activeCurrency.currency,
            flag: flagImageMap[activeCurrency.currency],
            currency: activeCurrency.currency
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
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
            
            const response = await fetch(SummaryApi.productDetails.url, {
                method: SummaryApi.productDetails.method,
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ productId: id }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData?.message || `HTTP ${response.status}: Failed to fetch product details`);
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
                setError('Request timed out. Please check your connection and try again.');
            } else {
                setError(err.message);
            }
            
            toast.error(`⚠️ ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, [id]);
    
    const handleCurrencyChange = useCallback((currency) => {
        const selectedCurrency = data.pricing.find(
            (item) => item.currency === currency
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
    }, [data.pricing]);

    const handleSell = useCallback((faceValue) => {
        if (!user) {
            toast.error('Please log in to sell items');
            navigate('/login');
            return;
        }
        setSelectedFaceValue(faceValue);
        setShowUploadForm(true);
    }, [user, navigate]);

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
        setRetryCount(prev => prev + 1);
        
        try {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
            await fetchProductDetails();
        } catch (err) {
            console.error('Retry failed:', err);
        } finally {
            setIsRetrying(false);
        }
    }, [retryCount, fetchProductDetails]);

    // API calls
    

    const handleLogout = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(SummaryApi.logout_user.url, {
                method: SummaryApi.logout_user.method,
                credentials: "include",
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            const logoutData = await response.json();

            if (logoutData.success) {
                toast.success(logoutData.message);
                dispatch(setUserDetails(null));
                navigate("/login");
            } else {
                toast.error(logoutData.message);
            }
        } catch (error) {
            console.error('Logout error:', error);
            toast.error("Logout failed. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [navigate, dispatch]);

    const toggleMobileMenu = useCallback(() => {
        setIsPDSidePanelOpen(prev => !prev);
    }, []);

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
    }, [showUploadForm, isPDSidePanelOpen, handleCloseUploadForm, closePDSidePanel]);

    if (loading) {
        return (
            <Loader/>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-white py-6 flex flex-col justify-center sm:py-12 border-2 border-black"> {/* Changed to white background and black border */}
                 
                <div className="relative py-3 sm:max-w-xl sm:mx-auto">
                    <div className="absolute inset-0 bg-red-400 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 rounded-3xl border-4 border-yellow-700"></div> {/* Yellow border */}
                    <div className="relative px-4 py-10 bg-white shadow-lg rounded-3xl sm:p-20 text-center border-4 border-yellow-700"> {/* White background and yellow border */}
                        <div className="mb-4">
                            <svg className="mx-auto h-12 w-12 text-red-500 glossy-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4 glossy-heading">
                            Error Loading Product
                        </h2>
                        <p className="text-gray-600 mb-6 glossy-text" role="alert">
                            {error}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={handleRetry}
                                disabled={isRetrying || retryCount >= MAX_RETRY_ATTEMPTS}
                                className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors border-4 border-yellow-700 glossy-text" // Yellow border and glossy text
                                aria-label={isRetrying ? 'Retrying...' : 'Retry loading product'}
                            >
                                {isRetrying ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Retrying...
                                    </>
                                ) : (
                                    `Retry ${retryCount > 0 ? `(${retryCount}/${MAX_RETRY_ATTEMPTS})` : ''}`
                                )}
                            </button>
                            <button
                                onClick={handleGoBack}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors border-4 border-yellow-700 glossy-text" // Yellow border and glossy text
                                aria-label="Go back to previous page"
                            >
                                Go Back
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-screen overflow-x-hidden border-2 border-black"> {/* Added black border to the main container */}
            

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 w-screen bg-white shadow-sm px-2 sm:px-4 lg:px-6 rounded-b-xl "> {/* Changed to white background and bold yellow border */}
                <div className="max-w-7xl mx-auto">
                    {/* Currency Selection */}
                    {hasValidPricing && (
                        <div className="mt-24">
                            <div className="bg-white p-4 rounded-xl shadow-inner overflow-x-auto py-2 "> {/* Changed to white background and bold yellow border */}
                                <div className="flex items-center space-x-3 px-2" role="tablist" aria-label="Currency selection">
                                    {data.pricing.map((currency) => {
                                        const fullCurrencyName = currencyFullNames[currency.currency] || currency.currency;
                                        const isActive = activeCurrency?.currency === currency.currency;
                                        
                                        return (
                                            <button
                                                key={currency.currency}
                                                role="tab"
                                                aria-selected={isActive}
                                                aria-controls={`currency-panel-${currency.currency}`}
                                                className={`flex-shrink-0 py-2 px-3 rounded-xl text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 flex items-center ${
                                                    isActive
                                                        ? 'bg-emerald-500 text-white shadow-md transform scale-105 border-4 border-yellow-700' // Bold yellow border for active
                                                        : 'bg-white text-gray-700 hover:bg-gray-200 hover:scale-105 border-4 border-yellow-500' // Lighter yellow border for inactive and hover
                                                } glossy-text`} // Applied glossy text
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
            <main className="min-h-screen pt-36 mt-8 pb-24 px-4 sm:px-6 lg:px-8 bg-white"> {/* Changed to white background */}
                <div className="max-w-7xl mx-auto">
                    {/* Product Description */}
                    <div className='border-4 border-yellow-700 rounded-xl p-4 bg-white shadow-sm mb-6'> {/* White background and yellow border */}
                        <h2 className="text-lg font-semibold text-gray-900 mb-3 glossy-heading"> {/* Applied glossy heading */}
                            Product Description
                        </h2>
                        <div className='flex items-start gap-4'>
                            <div className="flex-1">
                                <p className="text-gray-700 leading-relaxed glossy-text"> {/* Applied glossy text */}
                                    {data.description || 'No description available.'}
                                </p>
                                {data.brandName && (
                                    <span className="inline-block mt-2 px-3 py-1 bg-emerald-100 text-emerald-800 text-sm rounded-full glossy-text"> {/* Applied glossy text */}
                                        {data.brandName}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Face Values */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden border-4 border-yellow-700"> {/* White background and yellow border */}
                        <div className="p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 glossy-heading"> {/* Applied glossy heading */}
                                Select Face Value
                                {selectedCurrencyInfo && (
                                    <span className="ml-2 text-sm font-normal text-gray-600 glossy-text"> {/* Applied glossy text */}
                                        ({selectedCurrencyInfo.fullName})
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
                                        <div
                                            key={`${fv.faceValue}-${index}`}
                                            className="bg-white rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-colors border-2 border-transparent hover:border-4 hover:border-yellow-500 hover:shadow-lg" // White background and yellow border on hover
                                        >
                                            <div className='flex items-center space-x-4'>
                                                {selectedCurrencyInfo?.flag && (
                                                    <img
                                                        src={selectedCurrencyInfo.flag}
                                                        alt={`${selectedCurrencyInfo.currency} flag`}
                                                        className="w-6 h-6 rounded-sm object-contain shadow-sm flex-shrink-0"
                                                        style={{ minWidth: '20Height', minHeight: '20px' }}
                                                        loading="lazy"
                                                    />
                                                )}
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-2 sm:space-y-0">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-sm font-medium text-gray-600 glossy-text"> {/* Applied glossy text */}
                                                            Face Value:
                                                        </span>
                                                        <span className="font-semibold text-gray-900 glossy-text"> {/* Applied glossy text */}
                                                            {fv.faceValue}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-sm font-medium text-gray-600 glossy-text"> {/* Applied glossy text */}
                                                            Rate:
                                                        </span>
                                                        <span className="font-semibold text-emerald-600 glossy-text"> {/* Applied glossy text */}
                                                            {fv.sellingPrice}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {fv.requirement && (
                                                <p className="text-sm text-gray-600 italic glossy-text"> {/* Applied glossy text */}
                                                    {fv.requirement}
                                                </p>
                                            )}
                                            
                                            <button
                                                className="inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 focus:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-6 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 hover:shadow-md border-4 border-yellow-700 glossy-text" // Yellow border and glossy text
                                                onClick={() => handleSell(fv)}
                                                disabled={!user}
                                                aria-label={`Sell ${fv.faceValue} ${selectedCurrencyInfo?.currency} at rate ${fv.sellingPrice}`}
                                            >
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                                Sell Now
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl p-8 text-center border-4 border-yellow-500"> {/* White background and yellow border */}
                                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4 glossy-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2 glossy-heading"> {/* Applied glossy heading */}
                                        No Denominations Available
                                    </h3>
                                    <p className="text-gray-600 glossy-text"> {/* Applied glossy text */}
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
                        <div className="relative bg-white w-full max-w-md rounded-xl shadow-xl border-4 border-yellow-700"> {/* White background and yellow border */}
                            <button
                                onClick={() => setShowUploadForm(false)}
                                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 focus:outline-none"
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
                                <h2 className="text-lg font-semibold text-gray-800 mb-4 glossy-heading"> {/* Applied glossy heading */}
                                    Upload Market Item ({activeCurrency?.currency} {selectedFaceValue?.faceValue})
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