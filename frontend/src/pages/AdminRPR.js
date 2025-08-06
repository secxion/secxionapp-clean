// components/admin/AdminRPR.js
import React, { useState, useEffect } from 'react';
import SummaryApi from "../common";

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
            const response = await fetch(`${SummaryApi.getWalletBalance.url}/${userId}`, {
                method: 'GET',
                credentials: 'include',
            });
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
            const response = await fetch(`${SummaryApi.updatePayment.url}/${selectedRequest._id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            if (data.success) {
                setStatusUpdateSuccess(data.message || 'Payment request status updated successfully. ✅');
                setSelectedRequest(prevRequest => ({ ...prevRequest, status: newStatus, rejectionReason }));
                setPaymentRequests((prevRequests) =>
                    prevRequests.map((req) =>
                        req._id === selectedRequest._id ? { ...req, status: newStatus, rejectionReason } : req
                    )
                );
                if (newStatus === 'approved-processing') {
                    fetchUserWalletBalance(selectedRequest.userId._id || selectedRequest.userId);
                }
            } else {
                setStatusUpdateError(data.message || 'Failed to update payment request status. ❌');
            }
        } catch (error) {
            console.error('Error updating payment request status:', error);
            setStatusUpdateError('An unexpected error occurred while updating the status. ⚠️');
        } finally {
            setUpdatingStatus(false);
        }
    };

    return (
        <div className="container p-6 md:p-8 lg:p-10 xl:p-12 bg-gray-50 min-h-screen">
            <div className="bg-white shadow-md rounded-md p-6">
                <h2 className="text-2xl font-semibold mb-6 flex items-center text-indigo-700">
                    <span role="img" aria-label="payment requests" className="mr-2">💰</span> Review Payment Requests
                </h2>

                {loadingRequests && <p className="text-gray-600"><span role="img" aria-label="loading" className="mr-1">⏳</span> Loading payment requests...</p>}
                {errorRequests && <p className="text-red-500"><span role="img" aria-label="error" className="mr-1">🚨</span> {errorRequests}</p>}

                {!loadingRequests && paymentRequests.length === 0 && (
                    <p className="text-gray-600"><span role="img" aria-label="no requests" className="mr-1">📄</span> No payment requests found.</p>
                )}

                {!loadingRequests && paymentRequests.length > 0 && (
                    <div className="overflow-x-auto rounded-md shadow-sm">
                        <table className="min-w-full border-collapse border border-gray-200 table-auto">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="border border-gray-200 p-3 text-left text-sm font-semibold text-gray-700">User</th>
                                    <th className="border border-gray-200 p-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                                    <th className="border border-gray-200 p-3 text-left text-sm font-semibold text-gray-700">Request Date</th>
                                    <th className="border border-gray-200 p-3 text-left text-sm font-semibold text-gray-700">Status</th>
                                    <th className="border border-gray-200 p-3 text-left text-sm font-semibold text-gray-700">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paymentRequests.map((request) => (
                                    <tr key={request._id} className="hover:bg-gray-50 transition-colors duration-200">
                                        <td className="border border-gray-200 p-3 text-sm text-gray-800">
                                            {request.userId?.name || request.userId?.email || 'N/A'}
                                        </td>
                                        <td className="border border-gray-200 p-3 text-sm text-gray-800">₦{request.amount.toLocaleString()}</td>
                                        <td className="border border-gray-200 p-3 text-sm text-gray-800">
                                            {new Date(request.requestDate).toLocaleDateString()}
                                        </td>
                                        <td className="border border-gray-200 p-3 text-sm text-gray-800">{formatStatusForDisplay(request.status)}</td>
                                        <td className="border border-gray-200 p-3 text-sm text-gray-800">
                                            <button
                                                onClick={() => handleViewDetails(request)}
                                                className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md text-sm transition-colors duration-200"
                                            >
                                                <span role="img" aria-label="view" className="mr-1">🔍</span> View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {selectedRequest && (
                    <div className="mt-8 p-6 border rounded-md shadow-md bg-white">
                        <h3 className="text-xl font-semibold mb-4 flex items-center text-indigo-700">
                            <span role="img" aria-label="details" className="mr-2">ℹ️</span> Payment Request Details
                        </h3>
                        <p className="mb-2"><strong className="text-gray-700">User:</strong> {selectedRequest.userId?.name || selectedRequest.userId?.email || 'N/A'}</p>
                        <p className="mb-2"><strong className="text-gray-700">Amount:</strong> ₦{selectedRequest.amount.toLocaleString()}</p>
                        <p className="mb-2"><strong className="text-gray-700">Request Date:</strong> {new Date(selectedRequest.requestDate).toLocaleString()}</p>
                        <p className="mb-2"><strong className="text-gray-700">Payment Method:</strong> {selectedRequest.paymentMethod}</p>
                        {selectedRequest.bankAccountDetails && (
                            <div className="mb-3 border-t pt-3">
                                <strong className="text-gray-700 block mb-1 flex items-center">
                                    <span role="img" aria-label="bank account" className="mr-1">🏦</span> Bank Account Details
                                </strong>
                                <p className="text-gray-600 mb-1">
                                    <span className="font-semibold">Account Number:</span> {selectedRequest.bankAccountDetails.accountNumber}
                                </p>
                                <p className="text-gray-600 mb-1">
                                    <span className="font-semibold">Bank Name:</span> {selectedRequest.bankAccountDetails.bankName}
                                </p>
                                <p className="text-gray-600 mb-1">
                                    <span className="font-semibold">Account Holder:</span> {selectedRequest.bankAccountDetails.accountHolderName}
                                </p>
                            </div>
                        )}
                        {!selectedRequest.bankAccountDetails && (
                            <p className="mb-2"><strong className="text-gray-700">Bank Account:</strong> <span className="text-gray-600">N/A</span></p>
                        )}
                        <p className="mb-2"><strong className="text-gray-700">Current Status:</strong> {formatStatusForDisplay(selectedRequest.status)}</p>

                        <div className="mt-6 border-t pt-4">
                            <h4 className="text-xl font-semibold mb-4 flex items-center text-indigo-700">
                                <span role="img" aria-label="update status" className="mr-2">🔄</span> Update Status
                            </h4>
                            {statusUpdateError && <p className="text-red-500"><span role="img" aria-label="error" className="mr-1">🚨</span> {statusUpdateError}</p>}
                            {statusUpdateSuccess && <p className="text-green-500"><span role="img" aria-label="success" className="mr-1">✅</span> {statusUpdateSuccess}</p>}
                            <label htmlFor="newStatus" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                <span role="img" aria-label="new status" className="mr-1">📌</span> New Status:
                            </label>
                            <select
                                id="newStatus"
                                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                value={newStatus}
                                onChange={handleStatusChange}
                            >
                                <option value="pending">⏳ Pending</option>
                                <option value="approved-processing">✅ Approved & Processing</option>
                                <option value="rejected">❌ Rejected</option>
                                <option value="completed">✔️ Completed</option>
                            </select>

                            {newStatus === 'rejected' && (
                                <div className="mt-4">
                                    <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                        <span role="img" aria-label="reason" className="mr-1">📝</span> Rejection Reason:
                                    </label>
                                    <textarea
                                        id="rejectionReason"
                                        rows="3"
                                        className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                        value={rejectionReason}
                                        onChange={handleRejectionReasonChange}
                                    ></textarea>
                                </div>
                            )}

                            <button
                                onClick={handleUpdateStatus}
                                disabled={updatingStatus}
                                className={`mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline transition-colors duration-200 ${
                                    updatingStatus ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                            >
                                {updatingStatus ? (
                                    <>
                                        <span role="img" aria-label="updating" className="mr-1">🔄</span> Updating...
                                    </>
                                ) : (
                                    <>
                                        <span role="img" aria-label="update" className="mr-1">💾</span> Update Status
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="mt-6 border-t pt-4">
                            <h4 className="text-xl font-semibold mb-4 flex items-center text-indigo-700">
                                <span role="img" aria-label="wallet info" className="mr-2">👛</span> User Wallet Balance
                            </h4>
                            {loadingBalance && <p className="text-gray-600"><span role="img" aria-label="loading" className="mr-1">⏳</span> Fetching wallet balance...</p>}
                            {errorBalance && <p className="text-red-500"><span role="img" aria-label="error" className="mr-1">🚨</span> {errorBalance}</p>}
                            {userWalletBalance !== null && <p className="text-gray-700">Current Balance: <span className="font-semibold">₦{userWalletBalance.toLocaleString()}</span></p>}
                        </div>

                        <button
                            onClick={() => setSelectedRequest(null)}
                            className="mt-6 text-gray-600 hover:underline focus:outline-none text-sm flex items-center"
                        >
                            <span role="img" aria-label="close" className="mr-1">❌</span> Close Details
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminRPR;