import React, { useState, useEffect, useRef, useCallback } from 'react';
// ...existing code...
import SummaryApi from '../common';
import { FaCloudUploadAlt, FaFlag, FaTimes } from 'react-icons/fa';
import uploadImage from '../helpers/uploadImage';
import { format } from 'date-fns';
import { MdSend } from 'react-icons/md';

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedReportId, setExpandedReportId] = useState(null);
  const [chatMessages, setChatMessages] = useState({});
  const [newMessage, setNewMessage] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [imageToSend, setImageToSend] = useState(null);
  const pollingInterval = useRef(null);

  const fetchReports = useCallback(async () => {
    try {
      const response = await fetch(SummaryApi.getAllReports.url, {
        method: SummaryApi.getAllReports.method,
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch reports.');
      }
      const data = await response.json();
      setReports(data.data);
    } catch (err) {
      setError(err.message);
      // ...existing code...
    } finally {
      if (loading) setLoading(false);
    }
  }, []);

  const fetchChat = useCallback(async (reportId) => {
    try {
      const response = await fetch(
        SummaryApi.getReportChat.url.replace(':id', reportId),
        {
          method: SummaryApi.getReportChat.method,
          credentials: 'include',
        },
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch chat.');
      }
      const data = await response.json();
      setChatMessages((prev) => ({ ...prev, [reportId]: data.data }));
    } catch (err) {
      // ...existing code...
    }
  }, []);

  useEffect(() => {
    fetchReports();
    pollingInterval.current = setInterval(() => {
      fetchReports();
      if (expandedReportId) {
        fetchChat(expandedReportId);
      }
    }, 5000);
    return () => clearInterval(pollingInterval.current);
  }, [fetchReports, fetchChat, expandedReportId]);

  const toggleExpand = async (reportId) => {
    setExpandedReportId(expandedReportId === reportId ? null : reportId);
    if (reportId !== expandedReportId && !chatMessages[reportId]) {
      await fetchChat(reportId);
    }
  };

  const handleSendMessage = async (reportId) => {
    if (!newMessage.trim() && !imageToSend) {
      // ...existing code...
      return;
    }

    setSendingMessage(true);
    try {
      const requestBody = {};
      if (newMessage.trim()) {
        requestBody.message = newMessage;
      }
      if (imageToSend) {
        requestBody.image = imageToSend;
      }

      const response = await fetch(
        SummaryApi.sendChatMessage.url.replace(':id', reportId),
        {
          method: SummaryApi.sendChatMessage.method,
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send message.');
      }
      setNewMessage('');
      setImageToSend(null);
      await fetchChat(reportId);
    } catch (err) {
      // ...existing code...
    } finally {
      setSendingMessage(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const uploadResponse = await uploadImage(file);
      setImageToSend(uploadResponse.url);
      // ...existing code...
    } catch (error) {
      // ...existing code...
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImageToSend(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-yellow-500 border-t-transparent mr-3"></div>
        <span className="text-slate-400">Loading reports...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="m-4 lg:m-6 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl">
        {error}
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-yellow-500/10 rounded-xl">
          <FaFlag className="text-yellow-500 text-xl" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">User Reports</h1>
          <p className="text-slate-400 text-sm">
            Manage and respond to user reports
          </p>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-500">
          <FaFlag className="text-4xl mb-3" />
          <p>No reports found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report._id}
              className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {report.category}
                  </h3>
                  <p className="text-slate-400 text-sm">
                    Submitted by:{' '}
                    <span className="text-white">{report.name}</span> (
                    {report.email})
                  </p>
                  <p className="text-slate-500 text-xs">
                    {format(new Date(report.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                  </p>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium ${
                    report.status === 'Pending'
                      ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      : report.status === 'Resolved'
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}
                >
                  {report.status}
                </span>
              </div>

              <p className="text-slate-300 mb-3">{report.message}</p>

              {report.image && (
                <img
                  src={report.image}
                  alt="Report Attachment"
                  className="max-w-full max-h-60 h-auto rounded-lg mb-3 border border-slate-700"
                />
              )}

              <button
                onClick={() => toggleExpand(report._id)}
                className="text-yellow-500 text-sm hover:text-yellow-400 transition-colors"
              >
                {expandedReportId === report._id ? 'Collapse' : 'View Chat'}
              </button>

              {expandedReportId === report._id && (
                <div className="mt-4 border-t border-slate-700/50 pt-4">
                  <h4 className="text-sm font-semibold text-slate-300 mb-2">
                    Chat with User:
                  </h4>
                  <div className="overflow-y-auto h-64 p-3 bg-slate-900/50 rounded-xl mb-3 border border-slate-700/50">
                    {chatMessages[report._id] &&
                    chatMessages[report._id].length > 0 ? (
                      chatMessages[report._id].map((msg, index) => (
                        <div
                          key={index}
                          className={`mb-3 p-3 rounded-xl max-w-[80%] ${
                            msg.sender === 'admin'
                              ? 'bg-yellow-500/20 text-yellow-100 border border-yellow-500/30 ml-auto text-right'
                              : 'bg-slate-700/50 text-slate-200 border border-slate-600/50 mr-auto text-left'
                          }`}
                        >
                          <p className="text-xs font-semibold mb-1 opacity-75">
                            {msg.sender === 'admin' ? 'Admin' : report.name}:
                          </p>
                          <p className="text-sm break-words">{msg.message}</p>
                          {msg.image && (
                            <img
                              src={msg.image}
                              alt="Chat Attachment"
                              className="max-w-xs h-auto rounded-lg mt-2 border border-slate-600"
                            />
                          )}
                          <p className="text-xs opacity-60 mt-1">
                            {format(
                              new Date(msg.createdAt),
                              'yyyy-MM-dd HH:mm:ss',
                            )}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500 text-center py-4">
                        No messages yet.
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <textarea
                      className="flex-1 p-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500/50 resize-none"
                      placeholder="Type your message..."
                      rows={2}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <label className="cursor-pointer p-3 bg-slate-800 border border-slate-700 rounded-xl hover:border-yellow-500/50 transition-colors">
                      <FaCloudUploadAlt className="text-yellow-500 text-xl" />
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                    <button
                      onClick={() => handleSendMessage(report._id)}
                      className="bg-yellow-500 text-slate-900 font-medium py-3 px-4 rounded-xl hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      disabled={
                        sendingMessage ||
                        uploadingImage ||
                        (!newMessage.trim() && !imageToSend)
                      }
                    >
                      <MdSend className="inline-block" />
                    </button>
                  </div>
                  {imageToSend && (
                    <div className="relative mt-3 inline-block">
                      <img
                        src={imageToSend}
                        alt="To Send"
                        className="w-20 h-20 object-cover rounded-lg border border-slate-700"
                      />
                      <button
                        onClick={handleRemoveImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      >
                        <FaTimes size={10} />
                      </button>
                    </div>
                  )}
                  {uploadingImage && (
                    <p className="text-slate-400 text-sm mt-2">
                      Uploading image...
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReports;
