import React, { useEffect, useState, useContext, useCallback } from 'react';
import SummaryApi from '../common'; 
import UserContext from "../Context"; 
import { CircleCheck, CircleX, Loader, Clock, Info, Image, X } from 'lucide-react';
import currencyData from '../helpers/currencyData';
import SecxionShimmer from './SecxionShimmer';
import { motion } from "framer-motion";
import { FaTimes } from "react-icons/fa";

const ImageModal = ({ imageUrl, onClose }) => {
    if (!imageUrl) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={onClose} 
        >
            <div
                className="relative bg-white p-2 rounded-lg shadow-xl max-w-full max-h-full flex flex-col items-center"
                onClick={e => e.stopPropagation()}
            >
                {/* Close Button - Fixed Position */}
                <motion.button
                    onClick={onClose}
                    className="fixed top-14 right-6 z-[10000] bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-2xl transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-red-500/50 border-2 border-white/20"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                        delay: 0.1,
                    }}
                    whileHover={{
                        rotate: 90,
                        boxShadow: "0 0 30px rgba(239, 68, 68, 0.5)",
                    }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Close image viewer"
                >
                    <FaTimes className="w-6 h-6" />
                </motion.button>

                <img
                    src={imageUrl}
                    alt="Expanded view"
                    className="max-w-[90vw] max-h-[90vh] object-contain rounded-md"
                />
            </div>
        </div>
    );
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
        const fetchLastMarketStatus = async () => {
            if (!user?._id) {
                setError("User not logged in.");
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);
            try {
                const response = await fetch(SummaryApi.lastUserMarketStatus.url, {
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    },
                    credentials: "include",
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error("Non-OK response for last market status:", response.status, errorText);
                    setError(`Failed to fetch last market status: ${response.status} ${response.statusText}. Check server logs for details.`);
                    setLastMarket(null);
                    setLoading(false);
                    return;
                }

                const dataResponse = await response.json();

                if (dataResponse.success) {
                    setLastMarket(dataResponse.data);
                } else {
                    setError(dataResponse.message || "Failed to fetch last market status.");
                    setLastMarket(null);
                }
            } catch (err) {
                console.error("Error fetching last market status:", err);
                setError("An error occurred while fetching data. Please try again.");
                setLastMarket(null);
            } finally {
                setLoading(false);
            }
        };

        fetchLastMarketStatus();
        const interval = setInterval(fetchLastMarketStatus, 30000);
        return () => clearInterval(interval);
    }, [user]);

    const getStatusDisplay = (status) => {
        switch (status) {
            case 'DONE':
                return { icon: <CircleCheck className="w-5 h-5 text-green-600" />, text: 'Completed', color: 'text-green-600' };
            case 'PROCESSING':
                return { icon: <Loader className="w-5 h-5 text-blue-600 animate-spin" />, text: 'Processing', color: 'text-blue-600' };
            case 'CANCEL':
                return { icon: <CircleX className="w-5 h-5 text-red-600" />, text: 'Cancelled', color: 'text-red-600' };
            default:
                return { icon: <Clock className="w-5 h-5 text-gray-500" />, text: 'Pending', color: 'text-gray-500' };
        }
    };

    const formatCurrency = (amount, currencyCode = '') => {
        if (typeof amount !== 'number') return 'N/A';

        const options = {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        };

        const currencyInfo = currencyData.find(c => c.value === currencyCode);
        const symbol = currencyInfo ? currencyInfo.symbol : currencyCode; // Fallback to code if symbol not found

        return `${symbol} ${amount.toLocaleString(undefined, options)}`;
    };

    if (loading) {
        return (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-950 via-purple-900 to-purple-800 shadow-xl border border-purple-700/30">
                <div className="absolute inset-0 opacity-30 blur-md mix-blend-multiply" aria-hidden="true">
                    {/* Background SVG or Image */}
                </div>
                <div className="relative z-10 p-6">
                    <h2 className="text-2xl font-bold text-white mb-4">Last Market Activity</h2>
                    <SecxionShimmer type="list" count={3} />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white border-4 border-red-500 rounded-xl p-6 shadow hover:shadow-lg flex items-center justify-center h-48 my-8 text-red-600">
                <CircleX className="w-6 h-6 mr-2" />
                <p>{error}</p>
            </div>
        );
    }

    if (!lastMarket) {
        return (
            <div className="bg-white border-4 border-gray-300 rounded-xl p-6 shadow hover:shadow-lg flex items-center justify-center h-48 my-8 text-gray-500">
                <Clock className="w-6 h-6 mr-2" />
                <p>No recent market activities found.</p>
            </div>
        );
    }

    const statusDisplay = getStatusDisplay(lastMarket.status);
    const lastUpdateDate = new Date(lastMarket.timestamp).toLocaleString();

    return (
        <section className="bg-white max-w-7xl mx-auto my-8 p-4 rounded-xl shadow-lg border-2 border-gray-400">
            <h2 className="text-2xl font-bold text-gray-800 glossy-heading mb-6 border-b pb-3">Last Market Activity</h2>
  <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-100 mb-6 text-gray-700">
                <div className=" sm:flex-row sm:items-center sm:justify-between gap-y-2 text-sm">
                    <div className="flex items-center gap-x-2">
                        <span className="font-semibold text-gray-600">ID:</span>
                        <span className="text-gray-800">{lastMarket._id || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-x-2">
                        <span className="font-semibold text-gray-600">Status:</span>
                        <span className={`font-semibold text-base flex items-center ${statusDisplay.color}`}>
                            <span className="ml-1">{statusDisplay.text}</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-x-2">
                        <span className="font-semibold text-gray-600">Last Updated:</span>
                        <span className="text-gray-800">{lastUpdateDate}</span>
                    </div>
                </div>
            </div>
 
            <div className="grid grid-cols-1">
                <div className="bg-white p-3 shadow-md hover:shadow-lg">
                    {lastMarket.pricing && lastMarket.pricing.length > 0 ? (
                        lastMarket.pricing.map((priceBlock, pbIndex) => (
                            <div key={pbIndex} className="mb-4 pb-4 border-b last:border-b-0 last:pb-0">
                                <p className="font-bold text-gray-700 text-base mb-2">
                                    {priceBlock.currency || 'N/A'}
                                </p>
                                {priceBlock.faceValues && priceBlock.faceValues.length > 0 ? (
                                    <><ul className="list-disc list-inside text-sm text-gray-700">
                                        {priceBlock.faceValues.map((fv, fvIndex) => (
                                            <><li key={fvIndex} className="mb-1">
                                                Face Value: <span className="font-medium">{fv.faceValue || 'N/A'}</span>
                                            </li>
                                                <span className="mb-1 ml-5">
                                                    Rate: <span className="font-medium">{formatCurrency(fv.sellingPrice)}</span>
                                                </span>
                                            </>
                                        ))}
                                    </ul>
                                    
                                    <div className="bg-white border-4 border-yellow-500 rounded-xl p-6 shadow-md hover:shadow-lg">
                                            <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                                                {lastMarket.productName || 'N/A'}

                                                {lastMarket.productImage && lastMarket.productImage.length > 0 && (
                                                    <div className="ml-3 flex -space-x-2 overflow-hidden">
                                                        {lastMarket.productImage.slice(0, 3).map((img, idx) => ( // Show max 3 thumbnails
                                                            <img
                                                                key={idx}
                                                                src={img}
                                                                alt={`${lastMarket.productName} thumbnail ${idx + 1}`}
                                                                className="inline-block h-8 w-8 rounded-full ring-2 object-cover cursor-pointer ring-blue-500 transition-all duration-200" />
                                                        ))}
                                                        {lastMarket.productImage.length > 3 && (
                                                            <span className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-bold cursor-pointer hover:bg-gray-300 transition-all duration-200"
                                                                onClick={() => handleImageClick(lastMarket.productImage[0])}>
                                                                +{lastMarket.productImage.length - 3}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </h3>

                                            <div className="text-sm text-gray-600 space-y-2 mb-4">
                                                <p><strong>Remark:</strong> {lastMarket.userRemark ? lastMarket.userRemark : 'N/A'}</p>
                                                {lastMarket.cardcode && <p><strong>Card Code:</strong> {lastMarket.cardcode}</p>}
                                                <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                                                    {/* Product Image Thumbnail */}
                                                    {lastMarket.Image.length > 0 && (
                                                        <div className="ml-3 flex -space-x-2 overflow-hidden">
                                                            {lastMarket.Image.slice(0, 3).map((img, idx) => ( // Show max 3 thumbnails
                                                                <img
                                                                    key={idx}
                                                                    src={img}
                                                                    alt={`${lastMarket._id} thumbnail ${idx + 1}`}
                                                                    className="inline-block h-12 w-12 ring-2 ring-white object-cover cursor-pointer hover:ring-blue-500 transition-all duration-200"
                                                                    onClick={() => handleImageClick(img)} />
                                                            ))}
                                                            {lastMarket.productImage.length > 3 && (
                                                                <span className="inline-block h-12 w-12 ring-2 ring-white bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-bold cursor-pointer hover:bg-gray-300 transition-all duration-200"
                                                                    onClick={() => handleImageClick(lastMarket.Image[0])}>
                                                                    +{lastMarket.Image.length - 3}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </h3>
                                            </div>

                                            <div className="space-y-2 mb-4">
                                                <div className="flex items-center justify-between text-lg">
                                                    <span className="text-gray-700">Total FV:</span>
                                                    <span className="font-bold text-green-700">
                                                        {priceBlock.currency} {formatCurrency(lastMarket.totalAmount)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-lg">
                                                    <span className="text-gray-700">CTA:</span>
                                                    <span className="font-bold text-blue-700">
                                                        ₦{formatCurrency(lastMarket.calculatedTotalAmount)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="border-t pt-4 mt-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-gray-600 text-base">Status:</span>
                                                    <span className={`font-semibold text-lg flex items-center ${statusDisplay.color}`}>
                                                        {statusDisplay.icon}
                                                    </span>
                                                </div>

                                                {lastMarket.status === 'CANCEL' && lastMarket.cancelReason && (
                                                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                                                        <p className="font-medium flex items-center"><Info className="w-4 h-4 mr-2" />Cancel Reason:</p>
                                                        <p className="ml-6">{lastMarket.cancelReason}</p>
                                                    </div>
                                                )}
                                                {lastMarket.status === 'CANCEL' && lastMarket.crImage && lastMarket.crImage.length > 0 && (
                                                    <div className="mt-4">
                                                        <p className="font-medium flex items-center text-gray-700"><Image className="w-4 h-4 mr-2" />Cancellation Images:</p>
                                                        <div className="grid grid-cols-3 gap-2 mt-2">
                                                            {lastMarket.crImage.map((img, idx) => (
                                                                <img
                                                                    key={idx}
                                                                    src={img}
                                                                    alt={`Cancellation Proof ${idx + 1}`}
                                                                    className="w-full h-24 object-cover rounded-md shadow-sm border border-gray-200 cursor-pointer hover:border-blue-500 transition-all duration-200"
                                                                    onClick={() => handleImageClick(img)} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div></> 
                                ) : (
                                    <p className="text-gray-500 text-sm italic">No face values specified for this currency.</p>
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-base">No pricing information available.</p>
                    )}
                </div>                               
            </div>

            <ImageModal imageUrl={modalImageUrl} onClose={handleCloseModal} />
        </section>
    );
};

export default LastMarketStatus;