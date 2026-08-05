import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  FaCode,
  FaTimes,
  FaRocket,
  FaPaperPlane,
  FaTrash,
  FaClock,
  FaCheckCircle,
  FaSpinner,
  FaExclamationCircle,
  FaImage,
} from 'react-icons/fa';
import SummaryApi from '../common';
import uploadImage from '../helpers/uploadImage';

const CATEGORIES = [
  { value: 'script', label: 'Script', icon: '📜' },
  { value: 'tool', label: 'Tool', icon: '🛠️' },
  { value: 'bot', label: 'Bot', icon: '🤖' },
  { value: 'automation', label: 'Automation', icon: '⚙️' },
  { value: 'other', label: 'Other', icon: '📦' },
];

const BUDGETS = [
  { value: 'under_50', label: 'Under $50' },
  { value: '50_100', label: '$50 - $100' },
  { value: '100_250', label: '$100 - $250' },
  { value: '250_500', label: '$250 - $500' },
  { value: '500_plus', label: '$500+' },
  { value: 'negotiable', label: 'Negotiable' },
];

const URGENCY = [
  { value: 'low', label: 'Low', color: 'text-green-400' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-400' },
  { value: 'high', label: 'High', color: 'text-orange-400' },
  { value: 'urgent', label: 'Urgent', color: 'text-red-400' },
];

const STATUS_COLORS = {
  pending: 'bg-brand-gold/15 text-brand-gold border-brand-gold/30',
  in_review: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  accepted: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  in_progress: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  rejected: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
};

const STATUS_ICONS = {
  pending: FaClock,
  in_review: FaSpinner,
  accepted: FaCheckCircle,
  in_progress: FaRocket,
  completed: FaCheckCircle,
  rejected: FaExclamationCircle,
};

const LiveScript = ({ isOpen, onClose }) => {
  const [activeView, setActiveView] = useState('form'); // 'form', 'requests', or 'detail'
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other',
    budget: 'negotiable',
    urgency: 'medium',
  });

  // Fetch user's requests
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(SummaryApi.getUserLiveScripts.url, {
        method: SummaryApi.getUserLiveScripts.method,
        credentials: 'include',
      });

      const data = await response.json();
      if (data.success) {
        setRequests(data.data);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchRequests();
    }
  }, [isOpen, fetchRequests]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Please provide both title and description.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(SummaryApi.createLiveScript.url, {
        method: SummaryApi.createLiveScript.method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        setFormData({
          title: '',
          description: '',
          category: 'other',
          budget: 'negotiable',
          urgency: 'medium',
        });
        fetchRequests();
        setActiveView('requests');
      } else {
        toast.error(data.message || 'Failed to submit request.');
      }
    } catch (error) {
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this request?'))
      return;

    try {
      const endpoint = SummaryApi.deleteLiveScript(id);
      const response = await fetch(endpoint.url, {
        method: endpoint.method,
        credentials: 'include',
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Request deleted successfully.');
        fetchRequests();
      } else {
        toast.error(data.message || 'Failed to delete request.');
      }
    } catch (error) {
      toast.error('Failed to delete request.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatMessageTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const openRequestDetail = (request) => {
    setSelectedRequest(request);
    setReplyMessage('');
    setPendingAttachments([]);
    setActiveView('detail');
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select an image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (5MB max)
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
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeAttachment = (index) => {
    setPendingAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendReply = async () => {
    const hasMessage = replyMessage.trim();
    const hasAttachments = pendingAttachments.length > 0;

    if (!hasMessage && !hasAttachments) return;
    if (!selectedRequest) return;

    setSendingReply(true);
    try {
      const endpoint = SummaryApi.replyToLiveScript(selectedRequest._id);
      const response = await fetch(endpoint.url, {
        method: endpoint.method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          message: replyMessage.trim(),
          attachments: pendingAttachments,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Reply sent!');
        setReplyMessage('');
        setPendingAttachments([]);
        setSelectedRequest(data.data);
        // Update the request in the list
        setRequests((prev) =>
          prev.map((r) => (r._id === data.data._id ? data.data : r)),
        );
      } else {
        toast.error(data.message || 'Failed to send reply.');
      }
    } catch (error) {
      toast.error('Failed to send reply.');
    } finally {
      setSendingReply(false);
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 flex items-center justify-center overflow-y-auto overscroll-none bg-black/90 backdrop-blur-md"
        style={{
          zIndex: 99999,
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="flex h-full w-full flex-col bg-gradient-to-br from-brand-dark-base via-brand-dark-elevated to-black shadow-[0_0_45px_rgba(212,175,55,0.12)] sm:m-4 sm:max-h-[90vh] sm:max-w-2xl sm:rounded-3xl md:h-full md:max-h-none md:max-w-none md:rounded-none"
          style={{ position: 'relative', zIndex: 99999 }}
        >
          {/* Header */}
          <div className="flex-shrink-0 border-b border-white/8 bg-gradient-to-r from-brand-dark-elevated via-brand-dark-base to-brand-dark-elevated p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="rounded-2xl border border-brand-gold/20 bg-brand-gold/10 p-2">
                  <FaCode className="text-brand-gold text-xl" />
                </div>
                <div>
                  <h2 className="text-lg font-black font-spaceGrotesk uppercase tracking-tight text-brand-gold">
                    LiveScript
                  </h2>
                  <p className="text-[9px] font-black uppercase tracking-[0.24em] text-gray-500">
                    Custom Development Requests
                  </p>
                </div>
              </div>
              <motion.button
                onClick={onClose}
                className="rounded-full border border-rose-300/20 bg-rose-500/15 p-2 text-rose-300 shadow-lg transition-all duration-200 hover:scale-110 hover:bg-rose-500/25 focus:outline-none focus:ring-2 focus:ring-rose-400/50"
                whileHover={{ rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Close LiveScript"
              >
                <FaTimes className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Tabs */}
            {activeView === 'detail' ? (
              <div className="flex mt-4">
                <button
                  onClick={() => {
                    setActiveView('requests');
                    setSelectedRequest(null);
                  }}
                  className="flex items-center rounded-2xl border border-white/8 bg-white/5 px-3 py-2 font-spaceGrotesk text-[9px] font-black uppercase tracking-[0.24em] text-gray-300 transition-all duration-200 hover:bg-white/10"
                >
                  ← Back to Requests
                </button>
              </div>
            ) : (
              <div className="flex mt-4 space-x-2">
                <button
                  onClick={() => setActiveView('form')}
                  className={`flex-1 rounded-2xl px-4 py-2 font-spaceGrotesk text-[9px] font-black uppercase tracking-[0.24em] transition-all duration-200 ${
                    activeView === 'form'
                      ? 'bg-brand-gold text-brand-dark-base'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <FaPaperPlane className="inline mr-2" />
                  New Request
                </button>
                <button
                  onClick={() => setActiveView('requests')}
                  className={`flex-1 rounded-2xl px-4 py-2 font-spaceGrotesk text-[9px] font-black uppercase tracking-[0.24em] transition-all duration-200 ${
                    activeView === 'requests'
                      ? 'bg-brand-gold text-brand-dark-base'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <FaRocket className="inline mr-2" />
                  My Requests ({requests.length})
                </button>
              </div>
            )}
          </div>

          {/* Content */}
          <div
            className={`flex-1 min-h-0 p-4 ${activeView === 'detail' ? 'flex flex-col overflow-hidden' : 'overflow-y-auto'}`}
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {activeView === 'form' ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="mb-1 block text-[9px] font-black uppercase tracking-[0.24em] text-brand-gold">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Discord Bot for Server Management"
                    maxLength={200}
                    className="w-full rounded-2xl border border-white/10 bg-black/20 p-3 text-white placeholder-gray-600 focus:border-brand-gold/50 focus:outline-none focus:ring-1 focus:ring-brand-gold/50"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.title.length}/200
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className="mb-1 block text-[9px] font-black uppercase tracking-[0.24em] text-brand-gold">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your project in detail. Include features, functionality, and any specific requirements..."
                    rows={5}
                    maxLength={5000}
                    className="w-full resize-none rounded-2xl border border-white/10 bg-black/20 p-3 text-white placeholder-gray-600 focus:border-brand-gold/50 focus:outline-none focus:ring-1 focus:ring-brand-gold/50"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.description.length}/5000
                  </p>
                </div>

                {/* Category & Budget Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-[9px] font-black uppercase tracking-[0.24em] text-brand-gold">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full rounded-2xl border border-white/10 bg-black/20 p-3 text-white focus:border-brand-gold/50 focus:outline-none"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.icon} {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-[9px] font-black uppercase tracking-[0.24em] text-brand-gold">
                      Budget
                    </label>
                    <select
                      name="budget"
                      value={formData.budget}
                      onChange={handleInputChange}
                      className="w-full rounded-2xl border border-white/10 bg-black/20 p-3 text-white focus:border-brand-gold/50 focus:outline-none"
                    >
                      {BUDGETS.map((b) => (
                        <option key={b.value} value={b.value}>
                          {b.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Urgency */}
                <div>
                  <label className="mb-2 block text-[9px] font-black uppercase tracking-[0.24em] text-brand-gold">
                    Urgency
                  </label>
                  <div className="flex space-x-2">
                    {URGENCY.map((u) => (
                      <button
                        key={u.value}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, urgency: u.value }))
                        }
                        className={`flex-1 rounded-2xl border px-3 py-2 text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-200 ${
                          formData.urgency === u.value
                            ? `bg-white/10 border-brand-gold/40 ${u.color}`
                            : 'bg-black/20 border-white/10 text-gray-400 hover:border-brand-gold/30 hover:text-white'
                        }`}
                      >
                        {u.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-gold to-yellow-500 px-4 py-3 font-black text-brand-dark-base transition-all duration-200 hover:from-yellow-400 hover:to-brand-gold disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <FaPaperPlane />
                      <span>Submit Request</span>
                    </>
                  )}
                </button>

                {/* Info Note */}
                <p className="text-center text-xs text-gray-500">
                  Our team will review your request and get back to you within
                  24-48 hours.
                </p>
              </form>
            ) : activeView === 'requests' ? (
              /* Requests List */
              <div className="space-y-3">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <FaSpinner className="animate-spin text-brand-gold text-2xl" />
                  </div>
                ) : requests.length === 0 ? (
                  <div className="py-12 text-center">
                    <FaCode className="mx-auto mb-3 text-4xl text-gray-600" />
                    <p className="text-gray-400">No requests yet.</p>
                    <button
                      onClick={() => setActiveView('form')}
                      className="mt-3 font-spaceGrotesk text-[9px] font-black uppercase tracking-[0.24em] text-brand-gold hover:text-brand-gold-light"
                    >
                      Submit your first request →
                    </button>
                  </div>
                ) : (
                  requests.map((request) => {
                    const StatusIcon = STATUS_ICONS[request.status] || FaClock;
                    const hasMessages =
                      request.messages && request.messages.length > 0;
                    return (
                      <motion.div
                        key={request._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => openRequestDetail(request)}
                        className="cursor-pointer rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-all hover:border-brand-gold/30 hover:bg-white/[0.05]"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="mb-1 font-medium text-white">
                              {request.title}
                            </h3>
                            <p className="line-clamp-2 text-sm text-gray-400">
                              {request.description}
                            </p>
                          </div>
                          {request.status === 'pending' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(request._id);
                              }}
                              className="rounded-full p-2 text-gray-500 transition-colors hover:text-red-400"
                              title="Delete request"
                            >
                              <FaTrash />
                            </button>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                          <div className="flex items-center space-x-3 text-xs text-gray-500">
                            <span>
                              {
                                CATEGORIES.find(
                                  (c) => c.value === request.category,
                                )?.icon
                              }{' '}
                              {
                                CATEGORIES.find(
                                  (c) => c.value === request.category,
                                )?.label
                              }
                            </span>
                            <span>•</span>
                            <span>{formatDate(request.createdAt)}</span>
                          </div>
                          <span
                            className={`flex items-center space-x-1 rounded-full border px-2 py-1 text-xs font-medium ${
                              STATUS_COLORS[request.status]
                            }`}
                          >
                            <StatusIcon
                              className={
                                request.status === 'in_review'
                                  ? 'animate-spin'
                                  : ''
                              }
                            />
                            <span>{request.status.replace('_', ' ')}</span>
                          </span>
                        </div>

                        {(request.adminNotes || hasMessages) && (
                          <div className="mt-3 rounded-2xl border border-brand-gold/20 bg-brand-gold/10 p-2">
                            <p className="text-xs text-brand-gold-light">
                              {hasMessages ? (
                                <span>
                                  💬 {request.messages.length} message
                                  {request.messages.length > 1 ? 's' : ''} - Tap
                                  to view conversation
                                </span>
                              ) : (
                                <>
                                  <strong>Admin Notes:</strong>{' '}
                                  {request.adminNotes}
                                </>
                              )}
                            </p>
                          </div>
                        )}
                      </motion.div>
                    );
                  })
                )}
              </div>
            ) : (
              /* Detail View */
              selectedRequest && (
                <div className="flex flex-col flex-1 min-h-0 justify-between">
                  <div
                    className="flex-1 overflow-y-auto min-h-0"
                    style={{ WebkitOverflowScrolling: 'touch' }}
                  >
                    {/* Request Info */}
                    <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <h3 className="mb-2 text-lg font-semibold text-white">
                        {selectedRequest.title}
                      </h3>
                      <p className="mb-3 text-sm text-gray-400">
                        {selectedRequest.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <span>
                            {
                              CATEGORIES.find(
                                (c) => c.value === selectedRequest.category,
                              )?.icon
                            }{' '}
                            {
                              CATEGORIES.find(
                                (c) => c.value === selectedRequest.category,
                              )?.label
                            }
                          </span>
                          <span>•</span>
                          <span>{formatDate(selectedRequest.createdAt)}</span>
                        </div>
                        <span
                          className={`rounded-full border px-2 py-1 text-xs font-medium ${STATUS_COLORS[selectedRequest.status]}`}
                        >
                          {selectedRequest.status.replace('_', ' ')}
                        </span>
                      </div>
                      {selectedRequest.adminNotes && (
                        <div className="mt-3 rounded-2xl border border-brand-gold/20 bg-brand-gold/10 p-2">
                          <p className="text-xs text-brand-gold-light">
                            <strong>Admin Notes:</strong>{' '}
                            {selectedRequest.adminNotes}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Conversation */}
                    <div className="space-y-3">
                      {selectedRequest.messages &&
                      selectedRequest.messages.length > 0 ? (
                        selectedRequest.messages.map((msg, idx) => (
                          <div
                            key={idx}
                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                                msg.sender === 'user'
                                  ? 'bg-brand-gold/15 border border-brand-gold/30 text-brand-gold-light'
                                  : 'bg-white/[0.04] border border-white/15 text-gray-200'
                              }`}
                            >
                              <p className="text-xs font-medium mb-1 opacity-70">
                                {msg.sender === 'user' ? 'You' : 'Admin'}
                              </p>
                              {msg.message && (
                                <p className="text-sm">{msg.message}</p>
                              )}
                              {msg.attachments &&
                                msg.attachments.length > 0 && (
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
                                          className="max-h-40 max-w-full rounded-2xl border border-white/10 object-cover"
                                        />
                                      </a>
                                    ))}
                                  </div>
                                )}
                              <p className="text-xs opacity-50 mt-1">
                                {formatMessageTime(msg.timestamp)}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-4 text-center text-sm text-gray-500">
                          No messages yet. Start a conversation with our team.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Reply Input */}
                  <div className="border-t border-white/10 pt-3 flex-shrink-0 mt-auto">
                    {/* Pending Attachments Preview */}
                    {pendingAttachments.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-2">
                        {pendingAttachments.map((att, idx) => (
                          <div key={idx} className="relative group">
                            <img
                              src={att.url}
                              alt={att.name}
                              className="h-16 w-16 rounded-2xl border border-white/15 object-cover"
                            />
                            <button
                              onClick={() => removeAttachment(idx)}
                              className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
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
                        className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-gray-300 transition-colors hover:bg-white/10 disabled:opacity-50"
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
                        onKeyPress={(e) =>
                          e.key === 'Enter' && handleSendReply()
                        }
                        placeholder="Type your message..."
                        className="flex-1 rounded-2xl border border-white/15 bg-transparent px-4 py-2 text-white placeholder-gray-500 focus:border-brand-gold/40 focus:outline-none"
                      />
                      <button
                        onClick={handleSendReply}
                        disabled={
                          sendingReply ||
                          (!replyMessage.trim() &&
                            pendingAttachments.length === 0)
                        }
                        className="inline-flex items-center space-x-2 rounded-2xl bg-gradient-to-r from-brand-gold to-yellow-500 px-4 py-2 font-black text-brand-dark-base transition-all hover:from-yellow-400 hover:to-brand-gold disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {sendingReply ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <FaPaperPlane />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
};

export default LiveScript;
