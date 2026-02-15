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
  script: { label: 'Script', icon: 'ðŸ“œ' },
  tool: { label: 'Tool', icon: 'ðŸ› ï¸' },
  bot: { label: 'Bot', icon: 'ðŸ¤–' },
  automation: { label: 'Automation', icon: 'âš™ï¸' },
  other: { label: 'Other', icon: 'ðŸ“¦' },
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
  low: 'bg-green-500/20 text-green-400 border border-green-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  high: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
  urgent: 'bg-red-500/20 text-red-400 border border-red-500/30',
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
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-yellow-500 border-t-transparent mr-3"></div>
        <span className="text-slate-400">Loading LiveScript requests...</span>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-yellow-500/10 rounded-xl">
            <FaCode className="text-yellow-500 text-xl" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">
              LiveScript Requests
            </h1>
            <p className="text-slate-400 text-sm">
              Manage custom script development requests
            </p>
          </div>
        </div>
        <button
          onClick={fetchRequests}
          className="px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg hover:bg-slate-700 hover:border-yellow-500/50 transition-colors flex items-center justify-center space-x-2"
        >
          <FaSpinner className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-xs text-slate-400 mb-1">
            Filter by Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg text-white text-sm focus:outline-none focus:border-yellow-500/50"
          >
            <option value="All" className="bg-slate-900">
              All Status
            </option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value} className="bg-slate-900">
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs text-slate-400 mb-1">Search</label>
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 text-xs" />
            <input
              type="text"
              placeholder="Search by title, user, email, or description..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-800 border border-slate-700 pl-10 pr-3 py-2 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-yellow-500/50"
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
              className={`p-3 rounded-xl text-center transition-all border ${
                statusFilter === s.value
                  ? `${s.color} text-white border-transparent shadow-md`
                  : 'bg-slate-800/50 border-slate-700/50 hover:border-yellow-500/30 text-slate-300'
              }`}
            >
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-xs">{s.label}</p>
            </button>
          );
        })}
      </div>

      {/* Results Count */}
      <p className="text-sm text-slate-400 mb-4">
        Showing {currentRequests.length} of {filteredRequests.length} requests
      </p>

      {/* Table */}
      {currentRequests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-500">
          <FaCode className="text-4xl mb-3" />
          <p>No requests found</p>
        </div>
      ) : (
        <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Request
                  </th>
                  <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    User
                  </th>
                  <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Category
                  </th>
                  <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Budget
                  </th>
                  <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Urgency
                  </th>
                  <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Date
                  </th>
                  <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentRequests.map((request) => (
                  <tr
                    key={request._id}
                    className="border-b border-slate-700/30 hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="max-w-xs">
                        <p className="font-medium text-white truncate">
                          {request.title}
                        </p>
                        <p className="text-sm text-slate-400 truncate">
                          {request.description.substring(0, 60)}...
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center text-slate-900 font-bold text-xs flex-shrink-0">
                          {(request.userName || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white text-sm font-medium truncate">
                            {request.userName}
                          </p>
                          <p className="text-slate-400 text-xs truncate">
                            {request.userEmail}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center space-x-1 text-slate-300">
                        <span>{CATEGORIES[request.category]?.icon}</span>
                        <span className="text-sm">
                          {CATEGORIES[request.category]?.label}
                        </span>
                      </span>
                    </td>
                    <td className="p-4 text-yellow-500 text-sm font-medium">
                      {BUDGETS[request.budget]}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium ${URGENCY_COLORS[request.urgency]}`}
                      >
                        {request.urgency}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium text-white ${getStatusColor(request.status)}`}
                      >
                        {request.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-400">
                      {formatDate(request.createdAt)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openDetailModal(request)}
                          className="p-2 text-yellow-500 hover:bg-yellow-500/10 rounded-lg transition-colors"
                          title="View & Update"
                        >
                          <FaEye />
                        </button>
                        {request.messages && request.messages.length > 0 && (
                          <span className="flex items-center bg-slate-700/50 text-slate-300 px-2 py-1 rounded-lg text-xs">
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
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg disabled:opacity-50 hover:bg-slate-700 transition-colors"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentPage === page
                  ? 'bg-yellow-500 text-slate-900'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg disabled:opacity-50 hover:bg-slate-700 transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700/50 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="border-b border-slate-700/50 p-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Request Details</h3>
              <button
                onClick={() => {
                  setSelectedRequest(null);
                  setAdminNotes('');
                  setReplyMessage('');
                  setPendingAttachments([]);
                }}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-4">
              {/* Title & Status */}
              <div>
                <h4 className="text-xl font-semibold text-white">
                  {selectedRequest.title}
                </h4>
                <div className="flex items-center space-x-2 mt-2">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium text-white ${getStatusColor(selectedRequest.status)}`}
                  >
                    {selectedRequest.status.replace('_', ' ')}
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium ${URGENCY_COLORS[selectedRequest.urgency]}`}
                  >
                    {selectedRequest.urgency} priority
                  </span>
                </div>
              </div>

              {/* User Info */}
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <p className="text-xs text-slate-400 mb-1">Submitted by</p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center text-slate-900 font-bold">
                    {(selectedRequest.userName || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-white">
                      {selectedRequest.userName}
                    </p>
                    <p className="text-sm text-slate-400">
                      {selectedRequest.userEmail}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {formatDate(selectedRequest.createdAt)}
                </p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/30 rounded-xl p-3 border border-slate-700/50">
                  <p className="text-xs text-slate-400 mb-1">Category</p>
                  <p className="font-medium text-white">
                    {CATEGORIES[selectedRequest.category]?.icon}{' '}
                    {CATEGORIES[selectedRequest.category]?.label}
                  </p>
                </div>
                <div className="bg-slate-800/30 rounded-xl p-3 border border-slate-700/50">
                  <p className="text-xs text-slate-400 mb-1">Budget</p>
                  <p className="font-medium text-yellow-500">
                    {BUDGETS[selectedRequest.budget]}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="text-xs text-slate-400 mb-2">Description</p>
                <div className="bg-slate-800/30 rounded-xl p-4 text-slate-300 whitespace-pre-wrap border border-slate-700/50">
                  {selectedRequest.description}
                </div>
              </div>

              {/* Conversation Thread */}
              {selectedRequest.messages &&
                selectedRequest.messages.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-slate-300 mb-2">
                      Conversation ({selectedRequest.messages.length} messages)
                    </p>
                    <div className="bg-slate-800/30 rounded-xl p-3 max-h-60 overflow-y-auto space-y-3 border border-slate-700/50">
                      {selectedRequest.messages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`flex ${msg.sender === 'admin' ? 'justify-start' : 'justify-end'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-xl p-3 ${
                              msg.sender === 'admin'
                                ? 'bg-yellow-500/20 text-yellow-100 border border-yellow-500/30'
                                : 'bg-slate-700/50 text-slate-200 border border-slate-600/50'
                            }`}
                          >
                            <p className="text-xs font-medium mb-1 opacity-75">
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
                                      className="max-w-full rounded-lg max-h-40 object-cover border border-slate-600"
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
                <label className="block text-xs text-slate-400 mb-2">
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
                          className="w-16 h-16 object-cover rounded-lg border border-slate-600"
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
                    className="px-3 py-2 bg-slate-800 border border-slate-700 hover:border-yellow-500/50 text-slate-300 rounded-lg transition-colors disabled:opacity-50"
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
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500/50"
                    onKeyPress={(e) => e.key === 'Enter' && sendAdminReply()}
                  />
                  <button
                    onClick={sendAdminReply}
                    disabled={
                      sendingReply ||
                      (!replyMessage.trim() && pendingAttachments.length === 0)
                    }
                    className="px-4 py-2 bg-yellow-500 text-slate-900 font-medium rounded-lg hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                <label className="block text-xs text-slate-400 mb-2">
                  Admin Notes
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes for the user (optional)..."
                  rows={3}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500/50"
                />
              </div>

              {/* Status Update */}
              <div>
                <p className="text-xs text-slate-400 mb-2">Update Status</p>
                <div className="grid grid-cols-3 gap-2">
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => updateStatus(selectedRequest._id, s.value)}
                      disabled={updating || selectedRequest.status === s.value}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                        selectedRequest.status === s.value
                          ? `${s.color} text-white`
                          : 'bg-slate-800 border border-slate-700 hover:border-yellow-500/50 text-slate-300 disabled:opacity-50'
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
