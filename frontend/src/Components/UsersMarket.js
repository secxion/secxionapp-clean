import React, { useContext, useEffect, useState, useCallback } from 'react';
import SummaryApi from '../common';
import UserContext from '../Context';
import { toast } from 'react-toastify';
import MarketCard from './MarketCard';
import HistoryDetailView from './HistoryDetailView';
import uploadImage from '../helpers/uploadImage';
import HistoryCard from './HistoryCard';

const UsersMarket = () => {
    const [userMarkets, setUserMarkets] = useState([]);
    const [cancelData, setCancelData] = useState({});
    const { user } = useContext(UserContext);
    const [selectedMarket, setSelectedMarket] = useState(null);

    const fetchUserMarkets = useCallback(async () => {
        try {
            const response = await fetch(SummaryApi.allUserMarkets.url, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                credentials: "include",
            });
            const dataResponse = await response.json();
            if (dataResponse.success) {
                setUserMarkets(dataResponse.data);
                const savedStatus = JSON.parse(localStorage.getItem('marketStatus')) || {};
                setCancelData(savedStatus);
            } else {
                toast.error(dataResponse.message || "Failed to fetch user markets.");
            }
        } catch (error) {
            console.error("Error fetching user markets:", error);
            toast.error("An error occurred while fetching user markets.");
        }
    }, []);

    useEffect(() => {
        fetchUserMarkets();
    }, [fetchUserMarkets]);

    const updateMarketStatus = async (marketId, status) => {
        const { reason, image } = cancelData[marketId] || {};
        const imageUrl = image; 
        try {
            const response = await fetch(`${SummaryApi.updateMarketStatus.url}/${marketId}`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },                
                credentials: "include",
                body: JSON.stringify({ 
                    status, 
                    cancelReason: status === 'CANCEL' ? reason : undefined, 
                    crImage: status === 'CANCEL' ? imageUrl : undefined 
                }),
            });
            const dataResponse = await response.json();
            if (dataResponse.success) {
                toast.success(dataResponse.message);
                fetchUserMarkets(); 
                setCancelData(prev => {
                    const updatedData = { ...prev, [marketId]: { status, reason, image: imageUrl } };
                    localStorage.setItem('marketStatus', JSON.stringify(updatedData));
                    return updatedData;
                });
            } else {
                toast.error(dataResponse.message || "Failed to update market status.");
            }
        } catch (error) {
            console.error("Error updating market status:", error);
            toast.error("An error occurred while updating market status.");
        }
    };

    const handleImageUpload = async (marketId, event) => {
        const file = event.target.files[0];
        if (file) {
            const uploadedImage = await uploadImage(file);
            setCancelData(prev => ({
                ...prev,
                [marketId]: { ...prev[marketId], image: uploadedImage.url }
            }));
        }
    };

    const handleImageDelete = (marketId) => {
        setCancelData(prev => ({
            ...prev,
            [marketId]: { ...prev[marketId], image: null }
        }));
    };

    const handleMarketSelect = (market) => {
        setSelectedMarket(market);
    };

    return (
        <div className="bg-gray-50 min-h-screen overflow-hidden">

            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-h-[80vh] overflow-y-auto pb-32">
                    {userMarkets.length > 0 ? (
                        userMarkets.map((market) => (
                            <div 
                                key={market._id} 
                                className="border-2 border-blue-500 p-4 rounded-lg bg-white shadow-lg mb-6"
                            >
                                <div className="border-b-2 border-blue-300 pb-3 mb-3">
                                    <p><strong>User ID:</strong> {market.userId}</p>
                                    <p><strong>Name:</strong> {market.userDetails?.name || 'N/A'}</p>
                                    <p><strong>Email:</strong> {market.userDetails?.email || 'N/A'}</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                                    <button
                                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition w-full"
                                        onClick={() => updateMarketStatus(market._id, 'DONE')}
                                    >
                                        Done
                                    </button>
                                    <button
                                        className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition w-full"
                                        onClick={() => updateMarketStatus(market._id, 'PROCESSING')}
                                    >
                                        Processing
                                    </button>

                                    <input
                                        type="text"
                                        placeholder="Cancel reason"
                                        value={cancelData[market._id]?.reason || ''}
                                        onChange={(e) => setCancelData(prev => ({
                                            ...prev,
                                            [market._id]: { ...prev[market._id], reason: e.target.value }
                                        }))}
                                        className="border rounded px-2 py-1 w-full"
                                    />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(market._id, e)}
                                        className="border rounded px-2 py-1 w-full"
                                    />

                                    {cancelData[market._id]?.image && (
                                        <div className="relative">
                                            <img 
                                                src={cancelData[market._id].image} 
                                                alt="" 
                                                className="mt-2 w-full h-auto border rounded" 
                                            />
                                            <button 
                                                onClick={() => handleImageDelete(market._id)} 
                                                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                                            >
                                                X
                                            </button>
                                        </div>
                                    )}

                                    <button
                                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 w-full"
                                        onClick={() => updateMarketStatus(market._id, 'CANCEL')}
                                    >
                                        Cancel
                                    </button>
                                </div>

                                {market.Image && market.Image.length > 0 && (
                                    <MarketCard market={market} />
                                )}

                                {cancelData[market._id] && (
                                    <div className="mt-4">
                                        <p><strong>Last Status:</strong> {cancelData[market._id].status}</p>
                                        {cancelData[market._id].status === 'CANCEL' && (
                                            <>
                                                <p><strong>Cancel Reason:</strong> {cancelData[market._id].reason || 'N/A'}</p>
                                                {cancelData[market._id].image && (
                                                    <img 
                                                        src={cancelData[market._id].image} 
                                                        alt="" 
                                                        className="mt-2 w-full h-auto border rounded" 
                                                    />
                                                )}
                                            </>
                                        )}
                                    </div>
                                )}

                                <HistoryCard 
                                    data={{
                                        ...market, 
                                        status: cancelData[market._id]?.status, 
                                        cancelReason: cancelData[market._id]?.reason, 
                                        crImage: cancelData[market._id]?.image 
                                    }} 
                                />
                                
                                <button 
                                    onClick={() => handleMarketSelect(market)} 
                                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded w-full"
                                >
                                    View Details
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-center">Loading...</p>
                    )}
                </div>
            </div>

            {selectedMarket && (
                <HistoryDetailView 
                    onClose={() => setSelectedMarket(null)} 
                    fetchData={fetchUserMarkets} 
                    productDetails={{ 
                        ...selectedMarket, 
                        status: cancelData[selectedMarket._id]?.status, 
                        cancelReason: cancelData[selectedMarket._id]?.reason, 
                        crImage: cancelData[selectedMarket._id]?.image 
                    }} 
                />
            )}
        </div>
    );
};

export default UsersMarket;
