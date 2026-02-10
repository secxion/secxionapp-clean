import React, { useContext, useEffect, useState, useCallback } from 'react';
import SummaryApi from '../common';
import UserContext from '../Context';
import { toast } from 'react-toastify';
import MarketCard from './MarketCard';
import HistoryDetailView from './HistoryDetailView';
import uploadImage from '../helpers/uploadImage';
import HistoryCard from './HistoryCard';
import LoadingCard from './Marketplace/LoadingCard';
import ErrorState from './Marketplace/ErrorState';
import EmptyState from './Marketplace/EmptyState';
import '../styles/marketplaceUtilities.css';
import '../pages/UsersMarketPage.css';

/**
 * UsersMarket - Main marketplace list and status management
 * Displays all user markets with ability to update status and upload images
 */
const UsersMarket = () => {
  const [userMarkets, setUserMarkets] = useState([]);
  const [cancelData, setCancelData] = useState({});
  const { user } = useContext(UserContext);
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserMarkets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(SummaryApi.allUserMarkets.url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        credentials: 'include',
      });
      const dataResponse = await response.json();
      if (dataResponse.success) {
        setUserMarkets(dataResponse.data);
        const savedStatus =
          JSON.parse(localStorage.getItem('marketStatus')) || {};
        setCancelData(savedStatus);
      } else {
        setError(dataResponse.message || 'Failed to fetch user markets.');
        toast.error(dataResponse.message || 'Failed to fetch user markets.');
      }
    } catch (error) {
      console.error('Error fetching user markets:', error);
      setError('An error occurred while fetching user markets.');
      toast.error('An error occurred while fetching user markets.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserMarkets();
  }, [fetchUserMarkets]);

  const updateMarketStatus = async (marketId, status) => {
    const { reason, image } = cancelData[marketId] || {};
    const imageUrl = image;
    try {
      const response = await fetch(
        `${SummaryApi.updateMarketStatus.url}/${marketId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          credentials: 'include',
          body: JSON.stringify({
            status,
            cancelReason: status === 'CANCEL' ? reason : undefined,
            crImage: status === 'CANCEL' ? imageUrl : undefined,
          }),
        },
      );
      const dataResponse = await response.json();
      if (dataResponse.success) {
        toast.success(dataResponse.message);
        fetchUserMarkets();
        setCancelData((prev) => {
          const updatedData = {
            ...prev,
            [marketId]: { status, reason, image: imageUrl },
          };
          localStorage.setItem('marketStatus', JSON.stringify(updatedData));
          return updatedData;
        });
      } else {
        toast.error(dataResponse.message || 'Failed to update market status.');
      }
    } catch (error) {
      console.error('Error updating market status:', error);
      toast.error('An error occurred while updating market status.');
    }
  };

  const handleImageUpload = async (marketId, event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const uploadedImage = await uploadImage(file);
        setCancelData((prev) => ({
          ...prev,
          [marketId]: { ...prev[marketId], image: uploadedImage.url },
        }));
        toast.success('Image uploaded successfully');
      } catch (error) {
        toast.error('Failed to upload image');
      }
    }
  };

  const handleImageDelete = (marketId) => {
    setCancelData((prev) => ({
      ...prev,
      [marketId]: { ...prev[marketId], image: null },
    }));
    toast.success('Image removed');
  };

  const handleMarketSelect = (market) => {
    setSelectedMarket(market);
  };

  return (
    <div className="users-market-page">
      <div className="users-market-page__container">
        {/* Page Header */}
        <div className="users-market-page__header">
          <h1 className="users-market-page__title">📊 Market Management</h1>
          <p className="users-market-page__subtitle">
            Manage your marketplace listings and transaction status
          </p>
        </div>

        {/* Content Area */}
        <div className="users-market-page__content">
          {/* Error State */}
          {error && (
            <ErrorState
              title="Failed to load markets"
              message={error}
              onRetry={() => fetchUserMarkets()}
              emoji="⚠️"
            />
          )}

          {/* Loading State */}
          {loading ? (
            <div className="marketplace-grid">
              <LoadingCard count={6} variant="card" />
            </div>
          ) : userMarkets.length > 0 ? (
            <div className="users-market-page__scroll-container">
              <div className="users-market-list">
                {userMarkets.map((market) => (
                  <div key={market._id} className="market-item">
                    {/* User Info Header */}
                    <div className="market-item__header">
                      <div className="market-item__header--info">
                        <p className="market-item__user-id">
                          ID: {market.userId}
                        </p>
                        <p className="market-item__user-name">
                          {market.userDetails?.name || 'Unknown User'}
                        </p>
                        <p className="market-item__user-email">
                          {market.userDetails?.email || 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Status Controls */}
                    <div className="market-item__controls">
                      <div className="market-item__button-group">
                        <button
                          className="market-item__button market-item__button--done"
                          onClick={() => updateMarketStatus(market._id, 'DONE')}
                        >
                          ✓ Mark Done
                        </button>
                        <button
                          className="market-item__button market-item__button--processing"
                          onClick={() =>
                            updateMarketStatus(market._id, 'PROCESSING')
                          }
                        >
                          ⏱ Processing
                        </button>
                      </div>
                      <div className="market-item__button-group">
                        <input
                          type="text"
                          placeholder="Cancel reason (if applicable)"
                          value={cancelData[market._id]?.reason || ''}
                          onChange={(e) =>
                            setCancelData((prev) => ({
                              ...prev,
                              [market._id]: {
                                ...prev[market._id],
                                reason: e.target.value,
                              },
                            }))
                          }
                          className="market-item__input"
                        />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(market._id, e)}
                          className="market-item__file-input"
                        />
                      </div>
                    </div>

                    {/* Image Preview */}
                    {cancelData[market._id]?.image && (
                      <div className="market-item__image-preview">
                        <img
                          src={cancelData[market._id].image}
                          alt="Cancel reason"
                          className="market-item__image"
                          loading="lazy"
                        />
                        <button
                          onClick={() => handleImageDelete(market._id)}
                          className="market-item__image-delete"
                          title="Remove image"
                        >
                          ✕
                        </button>
                      </div>
                    )}

                    {/* Cancel Button */}
                    <button
                      className="market-item__button market-item__button--cancel"
                      onClick={() => updateMarketStatus(market._id, 'CANCEL')}
                      style={{ width: '100%', marginTop: '1rem' }}
                    >
                      ✕ Cancel Market
                    </button>

                    {/* Product Details */}
                    {market.Image && market.Image.length > 0 && (
                      <div style={{ marginTop: '1.5rem' }}>
                        <MarketCard market={market} />
                      </div>
                    )}

                    {/* Status Display */}
                    {cancelData[market._id] && (
                      <div className="market-item__status">
                        <p className="market-item__status-title">
                          Current Status
                        </p>
                        <p className="market-item__status-value">
                          {cancelData[market._id].status}
                        </p>
                        {cancelData[market._id].status === 'CANCEL' && (
                          <>
                            <div className="market-item__status-reason">
                              <p
                                className="marketplace-text-secondary"
                                style={{ marginBottom: '0.5rem' }}
                              >
                                Cancellation Reason:
                              </p>
                              <p className="marketplace-text-primary">
                                {cancelData[market._id].reason ||
                                  'No reason provided'}
                              </p>
                            </div>
                            {cancelData[market._id].image && (
                              <img
                                src={cancelData[market._id].image}
                                alt="Cancel reason"
                                style={{
                                  marginTop: '0.75rem',
                                  maxWidth: '100%',
                                  borderRadius: '0.5rem',
                                }}
                              />
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {/* History Card */}
                    <HistoryCard
                      data={{
                        ...market,
                        status: cancelData[market._id]?.status,
                        cancelReason: cancelData[market._id]?.reason,
                        crImage: cancelData[market._id]?.image,
                      }}
                    />

                    {/* View Details Button */}
                    <button
                      onClick={() => handleMarketSelect(market)}
                      className="market-item__view-details"
                    >
                      👁️ View Full Details
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Empty State */
            <EmptyState
              title="No markets found"
              message="No marketplace listings available yet. Start by creating a new market listing."
              emoji="🏪"
            />
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedMarket && (
        <HistoryDetailView
          onClose={() => setSelectedMarket(null)}
          fetchData={fetchUserMarkets}
          productDetails={{
            ...selectedMarket,
            status: cancelData[selectedMarket._id]?.status,
            cancelReason: cancelData[selectedMarket._id]?.reason,
            crImage: cancelData[selectedMarket._id]?.image,
          }}
        />
      )}
    </div>
  );
};

export default UsersMarket;
