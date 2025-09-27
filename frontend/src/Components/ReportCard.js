import { useState, useRef, useEffect, useCallback } from 'react';
import SummaryApi from '../common';
import { MdSend, MdClose, MdAdd, MdArrowBack } from 'react-icons/md';
import uploadImage from '../helpers/uploadImage';
import { format } from 'date-fns';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Picker from 'emoji-picker-react';
import SecxionLogo from '../app/slogo.png';

const ReportCard = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [userReplyText, setUserReplyText] = useState('');
  // ...existing code...
  const [uploadingReplyImage, setUploadingReplyImage] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const chatHistoryRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const { user } = useSelector((state) => state.user);
  const [hasReceivedReply, setHasReceivedReply] = useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [pendingMessages, setPendingMessages] = useState([]); // Track messages waiting to be sent

  const fetchReport = useCallback(async () => {
    try {
      const response = await fetch(SummaryApi.getReports.url, {
        method: SummaryApi.getReports.method,
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      const foundReport = data.data.find((r) => r._id === reportId);
      if (foundReport) {
        setReport(foundReport);
        const adminReply = foundReport.chatHistory?.some(
          (msg) => msg.sender === 'admin',
        );
        setHasReceivedReply(adminReply);
      } else {
        navigate('/report');
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      navigate('/report');
    } finally {
      setIsLoadingInitial(false);
    }
  }, [reportId, navigate]);

  useEffect(() => {
    fetchReport();
    pollingIntervalRef.current = setInterval(fetchReport, 5000);
    return () => clearInterval(pollingIntervalRef.current);
  }, [fetchReport]);

  useEffect(() => {
    if (report && chatHistoryRef.current && isAutoScrolling) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [report?.chatHistory, isAutoScrolling]);

  const handleSendTextMessage = async () => {
    if (!userReplyText.trim()) return; // Ensure the message is not empty

    const newMessage = {
      id: Date.now(),
      message: userReplyText,
      sender: 'user',
      status: 'pending',
    };

    setPendingMessages((prev) => [...prev, newMessage]);
    setUserReplyText(''); // Clear the input field

    try {
      const response = await fetch(
        SummaryApi.userReplyReport.url.replace(':id', reportId),
        {
          method: SummaryApi.userReplyReport.method,
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userReply: newMessage.message }),
        },
      );

      const data = await response.json();
      if (data.success) {
        setPendingMessages((prev) =>
          prev.filter((msg) => msg.id !== newMessage.id),
        ); // Remove the pending message
        await fetchReport(); // Refresh the chat
      } else {
        console.error('Failed to send message');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files); // Convert FileList to an array
    if (files.length === 0) return;

    setUploadingReplyImage(true); // Set uploading state to true
    try {
      const uploadedImages = await Promise.all(
        files.map(async (file) => {
          const uploaded = await uploadImage(file);
          return uploaded.url;
        }),
      );

      // Add the uploaded images as pending messages in the chat history
      const newPendingMessages = uploadedImages.map((url) => ({
        id: Date.now() + Math.random(), // Unique ID for each image
        image: url,
        sender: 'user',
        status: 'pending',
      }));
      setPendingMessages((prev) => [...prev, ...newPendingMessages]);
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingReplyImage(false); // Reset uploading state
    }
  };

  const handleSendPendingImage = async (msg) => {
    if (!msg.image) return;

    setIsSending(true);
    try {
      const response = await fetch(
        SummaryApi.userReplyReport.url.replace(':id', reportId),
        {
          method: SummaryApi.userReplyReport.method,
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userReply: '', // No text message
            userReplyImage: [msg.image], // Send the image URL as an array
          }),
        },
      );

      const data = await response.json();
      if (data.success) {
        // Remove the sent image from pending messages
        setPendingMessages((prev) => prev.filter((m) => m.id !== msg.id));
        await fetchReport(); // Refresh the chat to show the sent image
      } else {
        console.error('Failed to send image:', data.message);
      }
    } catch (err) {
      console.error('Error sending image:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleCancelPendingImage = (msgId) => {
    setPendingMessages((prev) => prev.filter((msg) => msg.id !== msgId)); // Remove the canceled image
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendTextMessage(); // Send text message on Enter
    }
  };

  const handleScroll = () => {
    const element = chatHistoryRef.current;
    if (!element) return;

    // If the user scrolls to the top, disable auto-scrolling
    if (element.scrollTop + element.clientHeight < element.scrollHeight - 50) {
      setIsAutoScrolling(false);
    } else {
      setIsAutoScrolling(true);
    }
  };

  // ...existing code...

  if (isLoadingInitial) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-700">
        Loading chat...
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="fixed w-full h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 text-gray-100 z-50">
      {/* Header */}
      <div className="w-full px-6 py-4 mt-8 border-b border-gray-700 flex items-center justify-between bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 shadow-md z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-yellow-600 transition-all duration-200"
          >
            <MdArrowBack className="text-2xl text-gray-900" />
          </button>
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-gray-900">
              {report.category}
            </h2>
            <span className="text-sm text-gray-800">
              Report ID: {report._id.slice(-6)}
            </span>
          </div>
        </div>
        <button
          onClick={() => navigate('/report')}
          className="p-2 rounded-full hover:bg-yellow-600 transition-all duration-200"
        >
          <MdClose className="text-2xl text-gray-900" />
        </button>
      </div>

      {/* Chat history */}
      <div
        ref={chatHistoryRef}
        className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950"
        onScroll={handleScroll}
      >
        {/* Auto-reply */}
        {!hasReceivedReply && report.autoReply && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-lg shadow-md animate-pulse">
            <p className="text-sm">{report.autoReply}</p>
            <p className="text-xs text-right mt-2 text-gray-600">
              {format(new Date(), 'yyyy-MM-dd')}
            </p>
          </div>
        )}

        {/* Messages */}
        {report.chatHistory?.map((msg, i) => (
          <div
            key={i}
            className={`flex items-start max-w-2xl rounded-xl px-4 py-3 shadow-md text-sm transition-transform transform hover:scale-105 ${
              msg.sender === 'admin'
                ? 'ml-auto bg-gradient-to-r from-blue-600 to-blue-500 text-white flex-row-reverse'
                : 'mr-auto bg-gradient-to-r from-gray-800 to-gray-700 text-gray-200'
            }`}
          >
            {/* Avatar */}
            {msg.sender !== 'admin' && (
              <img
                src={user?.profilePic || 'https://via.placeholder.com/50'}
                alt="User Avatar"
                className="w-8 h-8 rounded-full mr-3"
              />
            )}
            {msg.sender === 'admin' && (
              <img
                src={SecxionLogo}
                alt="Admin Avatar"
                className="w-8 h-8 rounded-full ml-3"
              />
            )}
            <div>
              {msg.message && (
                <p className="whitespace-pre-line break-words">{msg.message}</p>
              )}
              {msg.image &&
                Array.isArray(msg.image) &&
                msg.image.length > 0 &&
                msg.image.some((img) => img) && ( // Only render if there are valid images
                  <div className="mt-2 flex gap-2">
                    {msg.image.map(
                      (img, index) =>
                        img && (
                          <img
                            key={index}
                            src={img}
                            alt="attachment"
                            className="rounded-lg max-w-[150px] max-h-[150px] object-cover hover:scale-110 transition-transform duration-200"
                          />
                        ),
                    )}
                  </div>
                )}
              <p className="text-xs text-gray-400 text-right mt-1">
                {format(new Date(msg.createdAt), 'HH:mm')}
              </p>
            </div>
          </div>
        ))}

        {/* Pending messages */}
        {pendingMessages.map((msg) => (
          <div
            key={msg.id}
            className="flex items-start max-w-2xl rounded-xl px-4 py-3 shadow-md text-sm mr-auto bg-gray-700 text-gray-200 opacity-70 relative"
          >
            <img
              src={user?.profilePic || 'https://via.placeholder.com/50'} // Default avatar
              alt="User Avatar"
              className="w-8 h-8 rounded-full mr-3"
            />
            <div>
              {msg.message && (
                <p className="whitespace-pre-line break-words">{msg.message}</p>
              )}
              {msg.image && (
                <img
                  src={msg.image}
                  alt="attachment"
                  className="mt-2 rounded-lg max-w-[150px] max-h-[150px] object-cover"
                />
              )}
              <p className="text-xs text-gray-400 text-right mt-1">
                {msg.status === 'pending' ? 'Sending...' : 'Sent'}
              </p>
            </div>
            {msg.image && msg.status === 'pending' && (
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  onClick={() => handleSendPendingImage(msg)}
                  className="text-green-500 hover:text-green-700"
                  title="Send"
                >
                  <MdSend className="text-lg" />
                </button>
                <button
                  onClick={() => handleCancelPendingImage(msg.id)}
                  className="text-red-500 hover:text-red-700"
                  title="Cancel"
                >
                  <MdClose className="text-lg" />
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Uploading indicator */}
        {uploadingReplyImage && (
          <div className="flex items-center justify-center bg-gray-800 text-yellow-400 text-sm rounded-lg px-4 py-2 shadow-md">
            Uploading image...
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-gray-700 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-950 px-6 py-4 space-y-2 z-50">
        <div className="relative">
          <textarea
            className="w-full p-3 text-gray-200 bg-gray-800 border border-gray-700 rounded-lg pr-16 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500"
            placeholder={
              uploadingReplyImage
                ? 'Uploading images...'
                : 'Type your message...'
            }
            rows={3}
            value={userReplyText}
            onChange={(e) => setUserReplyText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={uploadingReplyImage}
          />
          <label className="absolute right-12 top-3 cursor-pointer text-gray-400 hover:text-yellow-400">
            <MdAdd className="text-xl" />
            <input
              type="file"
              className="hidden"
              onChange={handleImageUpload}
              multiple
              disabled={uploadingReplyImage}
            />
          </label>
          <button
            className="absolute right-3 top-3 text-yellow-400 hover:text-yellow-500 disabled:opacity-50"
            onClick={handleSendTextMessage}
            disabled={isSending || uploadingReplyImage || !userReplyText.trim()}
          >
            <MdSend className="text-xl" />
          </button>
          <button
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className="absolute right-20 top-3 text-yellow-400 hover:text-yellow-500"
          >
            😊
          </button>
          {showEmojiPicker && (
            <div className="absolute bottom-14 right-3 z-50 bg-gray-800 rounded-lg shadow-lg p-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300 text-sm">Select Emoji</span>
                <button
                  onClick={() => setShowEmojiPicker(false)}
                  className="text-white bg-red-500 hover:bg-red-600 rounded-full p-2 transition-all duration-200"
                  aria-label="Close Emoji Picker"
                >
                  <MdClose className="text-xl" />
                </button>
              </div>
              <Picker
                onEmojiClick={(emojiObject) =>
                  setUserReplyText((prev) => prev + emojiObject.emoji)
                }
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportCard;
