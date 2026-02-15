import React, { useEffect, useState, useRef } from 'react';
import { toast } from 'react-toastify';
import {
  FaCode,
  FaSpinner,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaRocket,
  FaSearch,
  FaEye,
  FaTimes,
  FaComment,
  FaImage,
} from 'react-icons/fa';
import SummaryApi from '../common';
import uploadImage from '../helpers/uploadImage';

const CATEGORIES = {
  script: { label: 'Script', icon: '📜' },
  tool: { label: 'Tool', icon: '🛠️' },
  bot: { label: 'Bot', icon: '🤖' },
  automation: { label: 'Automation', icon: '⚙️' },
  other: { label: 'Other', icon: '📦' },
};

const BUDGETS = {
  under_50: 'Under $50',
  '50_100': '$50 - $100',
  '100_250': '$100 - $250',
  '250_500': '$250 - $500',
  '500_plus': '$500+',
  negotiable: 'Negotiable',
};

const URGENCY_COLORS = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-500' },
  { value: 'in_review', label: 'In Review', color: 'bg-blue-500' },
  { value: 'accepted', label: 'Accepted', color: 'bg-green-500' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-purple-500' },
  { value: 'completed', label: 'Completed', color: 'bg-emerald-500' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-500' },
];

const AdminLiveScript = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);
  const requestsPerPage = 10;

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch(SummaryApi.adminGetAllLiveScripts.url, {
        method: SummaryApi.adminGetAllLiveScripts.method,
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setRequests(data.data);
      } else {
        toast.error('Failed to fetch requests');
      }
    } catch (err) {
      toast.error('Server error');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    setUpdating(true);
    try {
      const res = await fetch(SummaryApi.adminUpdateLiveScript(id).url, {
        method: SummaryApi.adminUpdateLiveScript(id).method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status, adminNotes }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Request updated successfully');
        fetchRequests();
        setSelectedRequest(null);
        setAdminNotes('');
      } else {
        toast.error(data.message || 'Failed to update');
      }
    } catch (err) {
      toast.error('Error updating request');
    } finally {
      setUpdating(false);
    }
  };

  const sendAdminReply = async () => {
    const hasMessage = replyMessage.trim();
    const hasAttachments = pendingAttachments.length > 0;

    if (!hasMessage && !hasAttachments) return;
    if (!selectedRequest) return;

    setSendingReply(true);
    try {
      const res = await fetch(
        SummaryApi.adminReplyToLiveScript(selectedRequest._id).url,
        {
          method: SummaryApi.adminReplyToLiveScript(selectedRequest._id).method,
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            message: replyMessage,
            attachments: pendingAttachments,
          }),
        },
      );
      const data = await res.json();
      if (data.success) {
        toast.success('Reply sent');
        setReplyMessage('');
        setPendingAttachments([]);
        // Update the selected request with new messages
        setSelectedRequest(data.data);
        // Refresh the list
        fetchRequests();
      } else {
        toast.error(data.message || 'Failed to send reply');
      }
    } catch (err) {
      toast.error('Error sending reply');
    } finally {
      setSendingReply(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select an image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setUploadingImage(true);
    try {
      const result = await uploadImage(file);
      if (result.error) {
        toast.error('Failed to upload image');
        return;
      }
      setPendingAttachments((prev) => [
        ...prev,
        { url: result.secure_url, type: 'image', name: file.name },
      ]);
      toast.success('Image uploaded');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeAttachment = (index) => {
    setPendingAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const formatMessageTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    let filtered = [...requests];

    if (statusFilter !== 'All') {
      filtered = filtered.filter((req) => req.status === statusFilter);
    }

    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (req) =>
          req.title?.toLowerCase().includes(term) ||
          req.userName?.toLowerCase().includes(term) ||
          req.userEmail?.toLowerCase().includes(term) ||
          req.description?.toLowerCase().includes(term),
      );
    }

    setFilteredRequests(filtered);
  }, [requests, statusFilter, searchTerm]);

  const indexOfLast = currentPage * requestsPerPage;
  const indexOfFirst = indexOfLast - requestsPerPage;
  const currentRequests = filteredRequests.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredRequests.length / requestsPerPage);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    const option = STATUS_OPTIONS.find((s) => s.value === status);
    return option?.color || 'bg-gray-500';
  };

  const openDetailModal = (request) => {
    setSelectedRequest(request);
    setAdminNotes(request.adminNotes || '');
    setReplyMessage('');
    setPendingAttachments([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <FaSpinner className="animate-spin text-blue-500 text-3xl" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <FaCode className="text-2xl text-purple-600" />
          <h2 className="text-xl font-bold text-gray-800">
            LiveScript Requests
          </h2>
          <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
            {requests.length} Total
          </span>
        </div>
        <button
          onClick={fetchRequests}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
        >
          <FaSpinner className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="All">All Status</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, user, email, or description..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border border-gray-300 px-10 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
        {STATUS_OPTIONS.map((s) => {
          const count = requests.filter((r) => r.status === s.value).length;
          return (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              className={`p-3 rounded-lg text-center transition-all ${
                statusFilter === s.value
                  ? `${s.color} text-white shadow-md`
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-xs">{s.label}</p>
            </button>
          );
        })}
      </div>

      {/* Results Count */}
      <p className="text-sm text-gray-600 mb-4">
        Showing {currentRequests.length} of {filteredRequests.length} requests
      </p>

      {/* Table */}
      {currentRequests.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FaCode className="text-4xl text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No requests found</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Budget
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Urgency
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentRequests.map((request) => (
                <tr key={request._id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div className="max-w-xs">
                      <p className="font-medium text-gray-900 truncate">
                        {request.title}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {request.description.substring(0, 60)}...
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm font-medium text-gray-900">
                      {request.userName}
                    </p>
                    <p className="text-xs text-gray-500">{request.userEmail}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center space-x-1">
                      <span>{CATEGORIES[request.category]?.icon}</span>
                      <span className="text-sm">
                        {CATEGORIES[request.category]?.label}
                      </span>
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    {BUDGETS[request.budget]}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${URGENCY_COLORS[request.urgency]}`}
                    >
                      {request.urgency}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(request.status)}`}
                    >
                      {request.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">
                    {formatDate(request.createdAt)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openDetailModal(request)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="View & Update"
                      >
                        <FaEye />
                      </button>
                      {request.messages && request.messages.length > 0 && (
                        <span className="flex items-center bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
                          <FaComment className="mr-1" />
                          {request.messages.length}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded ${
                currentPage === page
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="border-b p-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">
                Request Details
              </h3>
              <button
                onClick={() => {
                  setSelectedRequest(null);
                  setAdminNotes('');
                  setReplyMessage('');
                  setPendingAttachments([]);
                }}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-4">
              {/* Title & Status */}
              <div>
                <h4 className="text-xl font-semibold text-gray-900">
                  {selectedRequest.title}
                </h4>
                <div className="flex items-center space-x-2 mt-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(selectedRequest.status)}`}
                  >
                    {selectedRequest.status.replace('_', ' ')}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${URGENCY_COLORS[selectedRequest.urgency]}`}
                  >
                    {selectedRequest.urgency} priority
                  </span>
                </div>
              </div>

              {/* User Info */}
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">Submitted by</p>
                <p className="font-medium text-gray-900">
                  {selectedRequest.userName}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedRequest.userEmail}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatDate(selectedRequest.createdAt)}
                </p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Category</p>
                  <p className="font-medium">
                    {CATEGORIES[selectedRequest.category]?.icon}{' '}
                    {CATEGORIES[selectedRequest.category]?.label}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Budget</p>
                  <p className="font-medium">
                    {BUDGETS[selectedRequest.budget]}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="text-sm text-gray-600 mb-1">Description</p>
                <div className="bg-gray-50 rounded-lg p-3 text-gray-800 whitespace-pre-wrap">
                  {selectedRequest.description}
                </div>
              </div>

              {/* Conversation Thread */}
              {selectedRequest.messages &&
                selectedRequest.messages.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Conversation ({selectedRequest.messages.length} messages)
                    </p>
                    <div className="bg-gray-50 rounded-lg p-3 max-h-60 overflow-y-auto space-y-3">
                      {selectedRequest.messages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`flex ${msg.sender === 'admin' ? 'justify-start' : 'justify-end'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-2 ${
                              msg.sender === 'admin'
                                ? 'bg-purple-100 text-purple-900'
                                : 'bg-blue-100 text-blue-900'
                            }`}
                          >
                            <p className="text-xs font-medium mb-1">
                              {msg.sender === 'admin' ? 'Admin' : 'User'}
                            </p>
                            {msg.message && (
                              <p className="text-sm whitespace-pre-wrap">
                                {msg.message}
                              </p>
                            )}
                            {msg.attachments && msg.attachments.length > 0 && (
                              <div className="mt-2 space-y-2">
                                {msg.attachments.map((att, attIdx) => (
                                  <a
                                    key={attIdx}
                                    href={att.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block"
                                  >
                                    <img
                                      src={att.url}
                                      alt={att.name || 'attachment'}
                                      className="max-w-full rounded-lg max-h-40 object-cover border border-gray-200"
                                    />
                                  </a>
                                ))}
                              </div>
                            )}
                            <p className="text-xs opacity-60 mt-1">
                              {formatMessageTime(msg.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Reply Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Send Message to User
                </label>
                {/* Pending Attachments Preview */}
                {pendingAttachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {pendingAttachments.map((att, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={att.url}
                          alt={att.name}
                          className="w-16 h-16 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          onClick={() => removeAttachment(idx)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FaTimes size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex space-x-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors disabled:opacity-50"
                    title="Attach image"
                  >
                    {uploadingImage ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <FaImage />
                    )}
                  </button>
                  <input
                    type="text"
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    onKeyPress={(e) => e.key === 'Enter' && sendAdminReply()}
                  />
                  <button
                    onClick={sendAdminReply}
                    disabled={
                      sendingReply ||
                      (!replyMessage.trim() && pendingAttachments.length === 0)
                    }
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {sendingReply ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      'Send'
                    )}
                  </button>
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Notes
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes for the user (optional)..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              {/* Status Update */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Update Status
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => updateStatus(selectedRequest._id, s.value)}
                      disabled={updating || selectedRequest.status === s.value}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                        selectedRequest.status === s.value
                          ? `${s.color} text-white`
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50'
                      }`}
                    >
                      {updating ? (
                        <FaSpinner className="animate-spin mx-auto" />
                      ) : (
                        s.label
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLiveScript;
