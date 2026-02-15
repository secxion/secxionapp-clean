import React, { useContext, useEffect, useState, useCallback } from 'react';
import SummaryApi from '../common';
import UserContext from '../Context';
import { toast } from 'react-toastify';
import MarketCard from './MarketCard';
import HistoryDetailView from './HistoryDetailView';
import uploadImage from '../helpers/uploadImage';
import HistoryCard from './HistoryCard';
import {
  FaStore,
  FaCheck,
  FaSpinner,
  FaTimes,
  FaUpload,
  FaTrash,
  FaEye,
  FaExclamationTriangle,
  FaBoxOpen,
  FaEnvelope,
  FaEnvelopeOpen,
  FaUser,
  FaClock,
  FaFilter,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
} from 'react-icons/fa';
import { MdExpandMore, MdExpandLess } from 'react-icons/md';

/**
 * UsersMarket - Main marketplace list and status management
 * Displays markets grouped by user in expandable envelopes with clear status tracking
 */
const UsersMarket = () => {
  const [userMarkets, setUserMarkets] = useState([]);
  const [cancelData, setCancelData] = useState({});
  const { user } = useContext(UserContext);
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedUsers, setExpandedUsers] = useState({});
  const [statusFilter, setStatusFilter] = useState('ALL');

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

  // Get the actual status of a market (server status takes priority)
  const getMarketStatus = (market) => {
    return market.status || cancelData[market._id]?.status || 'PENDING';
  };

  // Status configuration for consistent styling
  const statusConfig = {
    PENDING: {
      label: 'Pending',
      icon: FaClock,
      bgColor: 'bg-slate-500/20',
      borderColor: 'border-slate-500/30',
      textColor: 'text-slate-400',
      badgeBg: 'bg-slate-500',
    },
    PROCESSING: {
      label: 'Processing',
      icon: FaHourglassHalf,
      bgColor: 'bg-orange-500/20',
      borderColor: 'border-orange-500/30',
      textColor: 'text-orange-400',
      badgeBg: 'bg-orange-500',
    },
    DONE: {
      label: 'Completed',
      icon: FaCheckCircle,
      bgColor: 'bg-emerald-500/20',
      borderColor: 'border-emerald-500/30',
      textColor: 'text-emerald-400',
      badgeBg: 'bg-emerald-500',
    },
    CANCEL: {
      label: 'Cancelled',
      icon: FaTimesCircle,
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500/30',
      textColor: 'text-red-400',
      badgeBg: 'bg-red-500',
    },
  };

  // Filter markets based on selected status
  const filteredMarkets = userMarkets.filter((market) => {
    if (statusFilter === 'ALL') return true;
    return getMarketStatus(market) === statusFilter;
  });

  // Group filtered markets by userId
  const groupedMarkets = filteredMarkets.reduce((acc, market) => {
    const userId = market.userId;
    if (!acc[userId]) {
      acc[userId] = {
        userDetails: market.userDetails,
        userId: userId,
        markets: [],
      };
    }
    acc[userId].markets.push(market);
    return acc;
  }, {});

  // Get status counts for a user's markets
  const getUserStatusCounts = (markets) => {
    return markets.reduce(
      (acc, market) => {
        const status = getMarketStatus(market);
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      { PENDING: 0, PROCESSING: 0, DONE: 0, CANCEL: 0 },
    );
  };

  // Get overall status counts
  const overallStatusCounts = userMarkets.reduce(
    (acc, market) => {
      const status = getMarketStatus(market);
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    { PENDING: 0, PROCESSING: 0, DONE: 0, CANCEL: 0 },
  );

  const toggleUserExpand = (userId) => {
    setExpandedUsers((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

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
            [marketId]: {
              status,
              reason,
              image: imageUrl,
              updatedAt: new Date().toISOString(),
            },
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

  // Render status badge component
  const StatusBadge = ({ status, size = 'normal' }) => {
    const config = statusConfig[status] || statusConfig.PENDING;
    const Icon = config.icon;
    const sizeClasses =
      size === 'small'
        ? 'px-2 py-0.5 text-xs gap-1'
        : 'px-3 py-1.5 text-sm gap-2';

    return (
      <span
        className={`inline-flex items-center ${sizeClasses} ${config.bgColor} ${config.borderColor} border ${config.textColor} rounded-full font-semibold`}
      >
        <Icon className={size === 'small' ? 'text-xs' : 'text-sm'} />
        {config.label}
      </span>
    );
  };

  // Render individual market card with controls
  const renderMarketCard = (market) => {
    const currentStatus = getMarketStatus(market);
    const config = statusConfig[currentStatus] || statusConfig.PENDING;

    return (
      <div
        key={market._id}
        className={`bg-slate-900/50 border ${config.borderColor} rounded-xl overflow-hidden transition-all`}
      >
        {/* Status Header Banner */}
        <div
          className={`${config.bgColor} ${config.borderColor} border-b px-5 py-3 flex items-center justify-between`}
        >
          <div className="flex items-center gap-3">
            <StatusBadge status={currentStatus} />
            <span className="text-xs text-slate-400 font-mono">
              ID: {market._id.slice(-8)}
            </span>
          </div>
          {cancelData[market._id]?.updatedAt && (
            <span className="text-xs text-slate-500">
              Updated:{' '}
              {new Date(cancelData[market._id].updatedAt).toLocaleDateString()}
            </span>
          )}
        </div>

        <div className="p-5">
          {/* Status Controls */}
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-3">
              <button
                className={`w-full px-4 py-2.5 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                  currentStatus === 'DONE'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30'
                }`}
                onClick={() => updateMarketStatus(market._id, 'DONE')}
                disabled={currentStatus === 'DONE'}
              >
                <FaCheck />{' '}
                {currentStatus === 'DONE' ? 'Completed ✓' : 'Mark Done'}
              </button>
              <button
                className={`w-full px-4 py-2.5 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                  currentStatus === 'PROCESSING'
                    ? 'bg-orange-500 text-white'
                    : 'bg-orange-500/20 border border-orange-500/30 text-orange-400 hover:bg-orange-500/30'
                }`}
                onClick={() => updateMarketStatus(market._id, 'PROCESSING')}
                disabled={currentStatus === 'PROCESSING'}
              >
                <FaSpinner
                  className={
                    currentStatus === 'PROCESSING' ? 'animate-spin' : ''
                  }
                />
                {currentStatus === 'PROCESSING'
                  ? 'In Progress...'
                  : 'Processing'}
              </button>
            </div>
            <div className="space-y-3">
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
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500/50"
              />
              <label className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-slate-800 border border-slate-700/50 text-slate-300 rounded-lg cursor-pointer hover:border-yellow-500/50 transition-colors">
                <FaUpload className="text-yellow-500" />
                <span>Upload Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(market._id, e)}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Image Preview */}
          {cancelData[market._id]?.image && (
            <div className="relative mb-4 rounded-lg overflow-hidden">
              <img
                src={cancelData[market._id].image}
                alt="Cancel reason"
                className="w-full max-h-64 object-cover"
                loading="lazy"
              />
              <button
                onClick={() => handleImageDelete(market._id)}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                title="Remove image"
              >
                <FaTrash className="text-sm" />
              </button>
            </div>
          )}

          {/* Cancel Button */}
          <button
            className={`w-full px-4 py-2.5 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 mb-4 ${
              currentStatus === 'CANCEL'
                ? 'bg-red-500 text-white'
                : 'bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30'
            }`}
            onClick={() => updateMarketStatus(market._id, 'CANCEL')}
            disabled={currentStatus === 'CANCEL'}
          >
            <FaTimes />{' '}
            {currentStatus === 'CANCEL' ? 'Cancelled ✗' : 'Cancel Market'}
          </button>

          {/* Cancellation Details */}
          {currentStatus === 'CANCEL' && cancelData[market._id]?.reason && (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg mb-4">
              <p className="text-xs text-red-400 mb-1 font-semibold">
                Cancellation Reason:
              </p>
              <p className="text-white">{cancelData[market._id].reason}</p>
            </div>
          )}

          {/* Product Details */}
          {market.Image && market.Image.length > 0 && (
            <div className="mt-4">
              <MarketCard market={market} />
            </div>
          )}

          {/* History Card */}
          <HistoryCard
            data={{
              ...market,
              status: currentStatus,
              cancelReason: cancelData[market._id]?.reason,
              crImage: cancelData[market._id]?.image,
            }}
          />

          {/* View Details Button */}
          <button
            onClick={() => handleMarketSelect(market)}
            className="w-full mt-4 px-4 py-2.5 bg-yellow-500 text-slate-900 rounded-lg font-semibold hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2"
          >
            <FaEye /> View Full Details
          </button>
        </div>
      </div>
    );
  };

  // Filter button component
  const FilterButton = ({ filter, label, count, icon: Icon }) => (
    <button
      onClick={() => setStatusFilter(filter)}
      className={`px-3 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all ${
        statusFilter === filter
          ? 'bg-yellow-500 text-slate-900'
          : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <Icon className="text-xs" />
      {label}
      {count > 0 && (
        <span
          className={`px-1.5 py-0.5 rounded text-xs font-bold ${
            statusFilter === filter
              ? 'bg-slate-900 text-yellow-500'
              : filter === 'PENDING'
                ? 'bg-red-500 text-white'
                : 'bg-slate-700 text-slate-300'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-yellow-500/10 rounded-xl">
              <FaStore className="text-yellow-500 text-xl" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Market Management
            </h1>
          </div>
          <p className="text-slate-400">
            Manage marketplace listings grouped by user
          </p>
        </div>

        {/* Filter Tabs */}
        {!loading && userMarkets.length > 0 && (
          <div className="mb-6 bg-slate-800/30 border border-slate-700/50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-3">
              <FaFilter className="text-slate-400" />
              <span className="text-sm text-slate-400 font-medium">
                Filter by Status:
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <FilterButton
                filter="ALL"
                label="All"
                count={userMarkets.length}
                icon={FaStore}
              />
              <FilterButton
                filter="PENDING"
                label="Pending"
                count={overallStatusCounts.PENDING}
                icon={FaClock}
              />
              <FilterButton
                filter="PROCESSING"
                label="Processing"
                count={overallStatusCounts.PROCESSING}
                icon={FaHourglassHalf}
              />
              <FilterButton
                filter="DONE"
                label="Completed"
                count={overallStatusCounts.DONE}
                icon={FaCheckCircle}
              />
              <FilterButton
                filter="CANCEL"
                label="Cancelled"
                count={overallStatusCounts.CANCEL}
                icon={FaTimesCircle}
              />
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="pb-8">
          {/* Error State */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
              <FaExclamationTriangle className="text-red-500 text-4xl mx-auto mb-4" />
              <h3 className="text-white font-semibold mb-2">
                Failed to load markets
              </h3>
              <p className="text-slate-400 mb-4">{error}</p>
              <button
                onClick={() => fetchUserMarkets()}
                className="px-4 py-2 bg-yellow-500 text-slate-900 font-semibold rounded-lg hover:bg-yellow-400 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="grid gap-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5 animate-pulse"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-700/50 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-5 bg-slate-700/50 rounded w-1/3 mb-2"></div>
                      <div className="h-4 bg-slate-700/50 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : Object.keys(groupedMarkets).length > 0 ? (
            <div className="max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
              <div className="grid gap-4">
                {/* User Envelopes */}
                {Object.values(groupedMarkets).map((userGroup) => {
                  const statusCounts = getUserStatusCounts(userGroup.markets);
                  const hasPending = statusCounts.PENDING > 0;
                  const hasProcessing = statusCounts.PROCESSING > 0;
                  const allDone =
                    statusCounts.DONE === userGroup.markets.length;
                  const allCancelled =
                    statusCounts.CANCEL === userGroup.markets.length;

                  // Determine envelope border color based on status
                  let envelopeBorderClass = 'border-slate-700/50';
                  if (hasPending) envelopeBorderClass = 'border-red-500/50';
                  else if (hasProcessing)
                    envelopeBorderClass = 'border-orange-500/50';
                  else if (allDone)
                    envelopeBorderClass = 'border-emerald-500/50';
                  else if (allCancelled)
                    envelopeBorderClass = 'border-slate-600/50';

                  return (
                    <div
                      key={userGroup.userId}
                      className={`bg-slate-800/30 border-2 ${envelopeBorderClass} rounded-xl overflow-hidden transition-all`}
                    >
                      {/* Envelope Header - Clickable */}
                      <div
                        className="p-4 cursor-pointer hover:bg-slate-800/50 transition-colors"
                        onClick={() => toggleUserExpand(userGroup.userId)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {/* Envelope Icon */}
                            <div
                              className={`p-2.5 rounded-xl ${hasPending ? 'bg-red-500/20' : hasProcessing ? 'bg-orange-500/20' : allDone ? 'bg-emerald-500/20' : 'bg-yellow-500/10'}`}
                            >
                              {expandedUsers[userGroup.userId] ? (
                                <FaEnvelopeOpen
                                  className={`text-lg ${hasPending ? 'text-red-500' : hasProcessing ? 'text-orange-500' : allDone ? 'text-emerald-500' : 'text-yellow-500'}`}
                                />
                              ) : (
                                <FaEnvelope
                                  className={`text-lg ${hasPending ? 'text-red-500' : hasProcessing ? 'text-orange-500' : allDone ? 'text-emerald-500' : 'text-yellow-500'}`}
                                />
                              )}
                            </div>
                            {/* User Avatar */}
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center text-slate-900 font-bold flex-shrink-0">
                              {(userGroup.userDetails?.name || 'U')
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                            {/* User Info */}
                            <div>
                              <p className="text-white font-semibold">
                                {userGroup.userDetails?.name || 'Unknown User'}
                              </p>
                              <p className="text-slate-400 text-sm">
                                {userGroup.userDetails?.email || 'N/A'}
                              </p>
                            </div>
                          </div>
                          {/* Status Summary & Expand Icon */}
                          <div className="flex items-center gap-3 flex-wrap justify-end">
                            {/* Status Mini-Badges */}
                            <div className="flex items-center gap-1.5">
                              {statusCounts.PENDING > 0 && (
                                <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                                  <FaClock className="text-[10px]" />
                                  {statusCounts.PENDING}
                                </span>
                              )}
                              {statusCounts.PROCESSING > 0 && (
                                <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                                  <FaHourglassHalf className="text-[10px]" />
                                  {statusCounts.PROCESSING}
                                </span>
                              )}
                              {statusCounts.DONE > 0 && (
                                <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                                  <FaCheckCircle className="text-[10px]" />
                                  {statusCounts.DONE}
                                </span>
                              )}
                              {statusCounts.CANCEL > 0 && (
                                <span className="px-2 py-0.5 bg-slate-600 text-white text-xs font-bold rounded-full flex items-center gap-1">
                                  <FaTimesCircle className="text-[10px]" />
                                  {statusCounts.CANCEL}
                                </span>
                              )}
                            </div>
                            {expandedUsers[userGroup.userId] ? (
                              <MdExpandLess className="text-slate-400 text-2xl" />
                            ) : (
                              <MdExpandMore className="text-slate-400 text-2xl" />
                            )}
                          </div>
                        </div>
                        {/* User ID */}
                        <p className="text-xs text-slate-500 font-mono mt-2 ml-[4.5rem]">
                          ID: {userGroup.userId}
                        </p>
                      </div>

                      {/* Expanded Content - Market Cards */}
                      {expandedUsers[userGroup.userId] && (
                        <div className="border-t border-slate-700/50 p-4 bg-slate-900/30">
                          <div className="grid gap-4">
                            {userGroup.markets.map((market) =>
                              renderMarketCard(market),
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : statusFilter !== 'ALL' ? (
            /* No results for filter */
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-12 text-center">
              <FaFilter className="text-slate-600 text-5xl mx-auto mb-4" />
              <h3 className="text-white text-xl font-semibold mb-2">
                No {statusConfig[statusFilter]?.label || statusFilter} markets
              </h3>
              <p className="text-slate-400 mb-4">
                No listings match the selected filter.
              </p>
              <button
                onClick={() => setStatusFilter('ALL')}
                className="px-4 py-2 bg-yellow-500 text-slate-900 font-semibold rounded-lg hover:bg-yellow-400 transition-colors"
              >
                Show All Markets
              </button>
            </div>
          ) : (
            /* Empty State */
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-12 text-center">
              <FaBoxOpen className="text-slate-600 text-5xl mx-auto mb-4" />
              <h3 className="text-white text-xl font-semibold mb-2">
                No markets found
              </h3>
              <p className="text-slate-400">
                No marketplace listings available yet.
              </p>
            </div>
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
            status: getMarketStatus(selectedMarket),
            cancelReason: cancelData[selectedMarket._id]?.reason,
            crImage: cancelData[selectedMarket._id]?.image,
          }}
        />
      )}
    </div>
  );
};

export default UsersMarket;
