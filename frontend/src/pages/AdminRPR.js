// components/admin/AdminRPR.js
import React, { useState, useEffect } from 'react';
import SummaryApi from '../common';
import {
  FaMoneyBillWave,
  FaSearch,
  FaWallet,
  FaTimes,
  FaUniversity,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaFilter,
  FaSortAmountDown,
  FaSortAmountUp,
} from 'react-icons/fa';

const AdminRPR = () => {
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [errorRequests, setErrorRequests] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusUpdateError, setStatusUpdateError] = useState('');
  const [statusUpdateSuccess, setStatusUpdateSuccess] = useState('');
  const [userWalletBalance, setUserWalletBalance] = useState(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [errorBalance, setErrorBalance] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');

  useEffect(() => {
    fetchPaymentRequests();
  }, []);

  const fetchPaymentRequests = async () => {
    setLoadingRequests(true);
    setErrorRequests('');
    try {
      const response = await fetch(SummaryApi.getAllPayment.url, {
        method: SummaryApi.getAllPayment.method,
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        setPaymentRequests(data.data);
      } else {
        setErrorRequests(data.message || 'Failed to fetch payment requests.');
      }
    } catch (error) {
      console.error('Error fetching payment requests:', error);
      setErrorRequests('An unexpected error occurred while fetching requests.');
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setNewStatus(request.status);
    setRejectionReason(request.rejectionReason || '');
    setUserWalletBalance(null);
    fetchUserWalletBalance(request.userId._id || request.userId);
  };

  const fetchUserWalletBalance = async (userId) => {
    setLoadingBalance(true);
    setErrorBalance('');
    try {
      const response = await fetch(
        `${SummaryApi.getWalletBalance.url}/${userId}`,
        {
          method: 'GET',
          credentials: 'include',
        },
      );
      const data = await response.json();
      if (data.success) {
        setUserWalletBalance(data.balance);
      } else {
        setErrorBalance(data.message || 'Failed to fetch user wallet balance.');
      }
    } catch (error) {
      console.error('Error fetching user wallet balance:', error);
      setErrorBalance('An unexpected error occurred while fetching balance.');
    } finally {
      setLoadingBalance(false);
    }
  };

  const handleStatusChange = (e) => {
    setNewStatus(e.target.value);
    if (e.target.value !== 'rejected') {
      setRejectionReason('');
    }
  };

  const handleRejectionReasonChange = (e) => {
    setRejectionReason(e.target.value);
  };

  const formatStatusForDisplay = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'approved-processing':
        return 'Approved & Processing';
      case 'rejected':
        return 'Rejected';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedRequest) return;
    setUpdatingStatus(true);
    setStatusUpdateError('');
    setStatusUpdateSuccess('');

    const payload = {
      status: newStatus,
      rejectionReason: newStatus === 'rejected' ? rejectionReason : undefined,
    };

    try {
      const response = await fetch(
        `${SummaryApi.updatePayment.url}/${selectedRequest._id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(payload),
        },
      );
      const data = await response.json();
      if (data.success) {
        setStatusUpdateSuccess(
          data.message || 'Payment request status updated successfully. ✅',
        );
        setSelectedRequest((prevRequest) => ({
          ...prevRequest,
          status: newStatus,
          rejectionReason,
        }));
        setPaymentRequests((prevRequests) =>
          prevRequests.map((req) =>
            req._id === selectedRequest._id
              ? { ...req, status: newStatus, rejectionReason }
              : req,
          ),
        );
        if (newStatus === 'approved-processing') {
          fetchUserWalletBalance(
            selectedRequest.userId._id || selectedRequest.userId,
          );
        }
      } else {
        setStatusUpdateError(
          data.message || 'Failed to update payment request status. ❌',
        );
      }
    } catch (error) {
      console.error('Error updating payment request status:', error);
      setStatusUpdateError(
        'An unexpected error occurred while updating the status. ⚠️',
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'approved-processing':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'rejected':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600/50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FaClock className="mr-1" />;
      case 'approved-processing':
        return <FaCheckCircle className="mr-1" />;
      case 'rejected':
        return <FaTimesCircle className="mr-1" />;
      case 'completed':
        return <FaCheckCircle className="mr-1" />;
      default:
        return null;
    }
  };

  // Get status counts
  const statusCounts = paymentRequests.reduce(
    (acc, req) => {
      acc[req.status] = (acc[req.status] || 0) + 1;
      return acc;
    },
    { pending: 0, 'approved-processing': 0, rejected: 0, completed: 0 },
  );

  // Filter and sort requests
  const filteredAndSortedRequests = paymentRequests
    .filter((req) => statusFilter === 'all' || req.status === statusFilter)
    .sort((a, b) => {
      const dateA = new Date(a.requestDate);
      const dateB = new Date(b.requestDate);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

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
      {Icon && <Icon className="text-xs" />}
      {label}
      {count > 0 && (
        <span
          className={`px-1.5 py-0.5 rounded text-xs font-bold ${
            statusFilter === filter
              ? 'bg-slate-900 text-yellow-500'
              : filter === 'pending'
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
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-yellow-500/10 rounded-xl">
            <FaMoneyBillWave className="text-yellow-500 text-xl" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Payment Requests</h1>
            <p className="text-slate-400 text-sm">
              Review and process withdrawal requests
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Sort Toggle */}
          <button
            onClick={() =>
              setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')
            }
            className="px-3 py-2 rounded-lg bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-2 text-sm"
            title={
              sortOrder === 'newest'
                ? 'Showing newest first'
                : 'Showing oldest first'
            }
          >
            {sortOrder === 'newest' ? (
              <FaSortAmountDown className="text-yellow-500" />
            ) : (
              <FaSortAmountUp className="text-yellow-500" />
            )}
            {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
          </button>
          <span className="text-sm text-slate-400">
            {filteredAndSortedRequests.length} of {paymentRequests.length}
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      {!loadingRequests && paymentRequests.length > 0 && (
        <div className="mb-6 bg-slate-800/30 border border-slate-700/50 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-3">
            <FaFilter className="text-slate-400" />
            <span className="text-sm text-slate-400 font-medium">
              Filter by Status:
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <FilterButton
              filter="all"
              label="All"
              count={paymentRequests.length}
              icon={FaMoneyBillWave}
            />
            <FilterButton
              filter="pending"
              label="Pending"
              count={statusCounts.pending}
              icon={FaClock}
            />
            <FilterButton
              filter="approved-processing"
              label="Processing"
              count={statusCounts['approved-processing']}
              icon={FaCheckCircle}
            />
            <FilterButton
              filter="completed"
              label="Completed"
              count={statusCounts.completed}
              icon={FaCheckCircle}
            />
            <FilterButton
              filter="rejected"
              label="Rejected"
              count={statusCounts.rejected}
              icon={FaTimesCircle}
            />
          </div>
        </div>
      )}

      {/* Loading State */}
      {loadingRequests && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-yellow-500 border-t-transparent mr-3"></div>
          <span className="text-slate-400">Loading payment requests...</span>
        </div>
      )}

      {/* Error State */}
      {errorRequests && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400">
          {errorRequests}
        </div>
      )}

      {/* Empty State */}
      {!loadingRequests && paymentRequests.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-slate-500">
          <FaMoneyBillWave className="text-4xl mb-3" />
          <p>No payment requests found.</p>
        </div>
      )}

      {/* Table */}
      {!loadingRequests && paymentRequests.length > 0 && (
        <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    User
                  </th>
                  <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Amount
                  </th>
                  <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Date
                  </th>
                  <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="p-4 text-center text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedRequests.map((request) => (
                  <tr
                    key={request._id}
                    className="border-b border-slate-700/30 hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center text-slate-900 font-bold text-xs flex-shrink-0">
                          {(
                            request.userId?.name ||
                            request.userId?.email ||
                            'U'
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <span className="text-white text-sm">
                          {request.userId?.name ||
                            request.userId?.email ||
                            'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-yellow-500 font-semibold">
                      ₦{request.amount.toLocaleString()}
                    </td>
                    <td className="p-4 text-slate-400 text-sm">
                      {new Date(request.requestDate).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${getStatusStyle(request.status)}`}
                      >
                        {getStatusIcon(request.status)}
                        {formatStatusForDisplay(request.status)}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleViewDetails(request)}
                        className="p-2 rounded-lg bg-slate-700/50 text-slate-300 hover:bg-yellow-500/20 hover:text-yellow-400 transition-colors"
                        title="View Details"
                      >
                        <FaSearch size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Empty filter state */}
          {filteredAndSortedRequests.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <FaFilter className="text-4xl mb-3" />
              <p>No requests match the selected filter.</p>
              <button
                onClick={() => setStatusFilter('all')}
                className="mt-3 px-4 py-2 bg-yellow-500 text-slate-900 rounded-lg font-semibold hover:bg-yellow-400 transition-colors text-sm"
              >
                Show All Requests
              </button>
            </div>
          )}
        </div>
      )}

      {/* Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setSelectedRequest(null)}
          />
          <div className="relative bg-slate-900 rounded-2xl border border-slate-700 w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-700 flex-shrink-0">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-500/10 rounded-xl">
                  <FaMoneyBillWave className="text-yellow-500 text-lg" />
                </div>
                <h2 className="text-lg font-semibold text-white">
                  Request Details
                </h2>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <FaTimes size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* User & Amount */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                  <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">
                    User
                  </p>
                  <p className="text-white font-medium">
                    {selectedRequest.userId?.name ||
                      selectedRequest.userId?.email ||
                      'N/A'}
                  </p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                  <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">
                    Amount
                  </p>
                  <p className="text-yellow-500 font-bold text-xl">
                    ₦{selectedRequest.amount.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Bank Details */}
              {selectedRequest.bankAccountDetails && (
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                  <div className="flex items-center space-x-2 mb-3">
                    <FaUniversity className="text-yellow-500" />
                    <span className="text-white font-medium">Bank Details</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Account Number</span>
                      <span className="text-white font-mono">
                        {selectedRequest.bankAccountDetails.accountNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Bank Name</span>
                      <span className="text-white">
                        {selectedRequest.bankAccountDetails.bankName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Account Holder</span>
                      <span className="text-white">
                        {selectedRequest.bankAccountDetails.accountHolderName}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Wallet Balance */}
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <div className="flex items-center space-x-2 mb-2">
                  <FaWallet className="text-yellow-500" />
                  <span className="text-white font-medium">User Wallet</span>
                </div>
                {loadingBalance ? (
                  <div className="flex items-center text-slate-400 text-sm">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-500 border-t-transparent mr-2"></div>
                    Fetching balance...
                  </div>
                ) : errorBalance ? (
                  <p className="text-red-400 text-sm">{errorBalance}</p>
                ) : userWalletBalance !== null ? (
                  <p className="text-white text-lg font-semibold">
                    ₦{userWalletBalance.toLocaleString()}
                  </p>
                ) : null}
              </div>

              {/* Status Update */}
              <div className="border-t border-slate-700 pt-5">
                <h4 className="text-white font-semibold mb-4">Update Status</h4>

                {statusUpdateError && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4 text-red-400 text-sm">
                    {statusUpdateError}
                  </div>
                )}
                {statusUpdateSuccess && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-4 text-green-400 text-sm">
                    {statusUpdateSuccess}
                  </div>
                )}

                <select
                  value={newStatus}
                  onChange={handleStatusChange}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-yellow-500/50 transition-colors mb-4"
                >
                  <option value="pending" className="bg-slate-900">
                    Pending
                  </option>
                  <option value="approved-processing" className="bg-slate-900">
                    Approved & Processing
                  </option>
                  <option value="rejected" className="bg-slate-900">
                    Rejected
                  </option>
                  <option value="completed" className="bg-slate-900">
                    Completed
                  </option>
                </select>

                {newStatus === 'rejected' && (
                  <textarea
                    placeholder="Enter rejection reason..."
                    value={rejectionReason}
                    onChange={handleRejectionReasonChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500/50 transition-colors resize-none mb-4"
                  />
                )}

                <button
                  onClick={handleUpdateStatus}
                  disabled={updatingStatus}
                  className="w-full py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-slate-900 font-semibold rounded-xl hover:from-yellow-400 hover:to-yellow-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {updatingStatus ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-900 border-t-transparent mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    'Update Status'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRPR;
