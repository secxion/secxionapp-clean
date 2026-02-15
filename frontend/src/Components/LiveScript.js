import React, { useState, useEffect, useCallback } from 'react';
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
} from 'react-icons/fa';
import { MdClose } from 'react-icons/md';
import SummaryApi from '../common';

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
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  in_review: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  accepted: 'bg-green-500/20 text-green-400 border-green-500/30',
  in_progress: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
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
  const [activeView, setActiveView] = useState('form'); // 'form' or 'requests'
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-purple-500/30 shadow-2xl"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900 p-4 border-b border-purple-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-yellow-500/20 p-2 rounded-lg">
                  <FaCode className="text-yellow-400 text-xl" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-yellow-400">
                    LiveScript
                  </h2>
                  <p className="text-xs text-gray-400">
                    Custom Development Requests
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700"
              >
                <MdClose className="text-xl" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex mt-4 space-x-2">
              <button
                onClick={() => setActiveView('form')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                  activeView === 'form'
                    ? 'bg-yellow-500 text-gray-900'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <FaPaperPlane className="inline mr-2" />
                New Request
              </button>
              <button
                onClick={() => setActiveView('requests')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                  activeView === 'requests'
                    ? 'bg-yellow-500 text-gray-900'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <FaRocket className="inline mr-2" />
                My Requests ({requests.length})
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 overflow-y-auto max-h-[calc(90vh-180px)]">
            {activeView === 'form' ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-yellow-300 font-medium mb-1">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Discord Bot for Server Management"
                    maxLength={200}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.title.length}/200
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-yellow-300 font-medium mb-1">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your project in detail. Include features, functionality, and any specific requirements..."
                    rows={5}
                    maxLength={5000}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.description.length}/5000
                  </p>
                </div>

                {/* Category & Budget Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-yellow-300 font-medium mb-1">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white focus:border-yellow-500 focus:outline-none"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.icon} {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-yellow-300 font-medium mb-1">
                      Budget
                    </label>
                    <select
                      name="budget"
                      value={formData.budget}
                      onChange={handleInputChange}
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white focus:border-yellow-500 focus:outline-none"
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
                  <label className="block text-yellow-300 font-medium mb-2">
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
                        className={`flex-1 py-2 px-3 rounded-lg border transition-all duration-200 ${
                          formData.urgency === u.value
                            ? `bg-gray-700 border-yellow-500 ${u.color}`
                            : 'bg-gray-800 border-gray-600 text-gray-400 hover:border-gray-500'
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
                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-gray-900 font-bold py-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                <p className="text-xs text-gray-500 text-center">
                  Our team will review your request and get back to you within
                  24-48 hours.
                </p>
              </form>
            ) : (
              /* Requests List */
              <div className="space-y-3">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <FaSpinner className="animate-spin text-yellow-400 text-2xl" />
                  </div>
                ) : requests.length === 0 ? (
                  <div className="text-center py-12">
                    <FaCode className="text-4xl text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No requests yet.</p>
                    <button
                      onClick={() => setActiveView('form')}
                      className="mt-3 text-yellow-400 hover:text-yellow-300 font-medium"
                    >
                      Submit your first request →
                    </button>
                  </div>
                ) : (
                  requests.map((request) => {
                    const StatusIcon = STATUS_ICONS[request.status] || FaClock;
                    return (
                      <motion.div
                        key={request._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-800/50 rounded-xl p-4 border border-gray-700"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-white font-medium mb-1">
                              {request.title}
                            </h3>
                            <p className="text-gray-400 text-sm line-clamp-2">
                              {request.description}
                            </p>
                          </div>
                          {request.status === 'pending' && (
                            <button
                              onClick={() => handleDelete(request._id)}
                              className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                              title="Delete request"
                            >
                              <FaTrash />
                            </button>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700">
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
                            className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${
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

                        {request.adminNotes && (
                          <div className="mt-3 p-2 bg-purple-900/30 rounded-lg border border-purple-500/30">
                            <p className="text-xs text-purple-300">
                              <strong>Admin Notes:</strong> {request.adminNotes}
                            </p>
                          </div>
                        )}
                      </motion.div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LiveScript;
