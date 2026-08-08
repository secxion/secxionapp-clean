import { useState, useRef, useEffect, useCallback } from 'react';
import SummaryApi from '../common';
import { MdSend, MdClose, MdAdd } from 'react-icons/md';
import uploadImage from '../helpers/uploadImage';
import { format } from 'date-fns';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Picker from 'emoji-picker-react';
import SecxionLogo from '../app/slogo.png';
import SecxionSpinner from './SecxionSpinner';
import BackButton from './BackButton';

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
      <div className="premium-bg flex h-screen items-center justify-center">
        <SecxionSpinner size="large" message="Loading support chat..." />
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="fixed z-50 flex h-screen w-full flex-col bg-gradient-to-br from-brand-dark-base via-brand-dark-elevated to-black text-gray-100">
      {/* Header */}
      <div className="z-50 mt-8 flex w-full items-center justify-between border-b border-white/10 bg-brand-dark-elevated/90 px-6 py-4 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <BackButton iconOnly fallbackTo="/report" ariaLabel="Go back" />
          <div className="flex flex-col">
            <h2 className="font-spaceGrotesk text-xl font-black uppercase tracking-tight text-white">
              {report.category}
            </h2>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
              Report ID: {report._id.slice(-6)}
            </span>
          </div>
        </div>
        <button
          onClick={() => navigate('/report')}
          className="rounded-full border border-white/10 bg-white/5 p-2 text-gray-300 transition-all duration-200 hover:border-brand-gold/30 hover:text-brand-gold"
        >
          <MdClose className="text-2xl" />
        </button>
      </div>

      {/* Chat history */}
      <div
        ref={chatHistoryRef}
        className="flex-1 space-y-4 overflow-y-auto bg-gradient-to-b from-brand-dark-base via-brand-dark-base to-black px-6 py-4"
        onScroll={handleScroll}
      >
        {/* Auto-reply */}
        {!hasReceivedReply && report.autoReply && (
          <div className="rounded-xl border border-brand-gold/30 bg-brand-gold/10 px-4 py-3 text-brand-gold-light shadow-md animate-pulse">
            <p className="text-sm">{report.autoReply}</p>
            <p className="mt-2 text-right text-[10px] font-black uppercase tracking-widest text-brand-gold/70">
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
                ? 'ml-auto flex-row-reverse border border-brand-gold/20 bg-brand-gold/10 text-brand-gold-light'
                : 'mr-auto border border-white/10 bg-white/[0.04] text-gray-200'
            }`}
          >
            {/* Avatar */}
            {msg.sender !== 'admin' && (
              <img
                src={user?.profilePic || 'https://via.placeholder.com/50'}
                alt="User Avatar"
                className="mr-3 h-8 w-8 rounded-full border border-white/10"
              />
            )}
            {msg.sender === 'admin' && (
              <img
                src={SecxionLogo}
                alt="Admin Avatar"
                className="ml-3 h-8 w-8 rounded-full border border-brand-gold/30 bg-black/20"
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
                            className="max-h-[150px] max-w-[150px] rounded-lg border border-white/10 object-cover transition-transform duration-200 hover:scale-105"
                          />
                        ),
                    )}
                  </div>
                )}
              <p className="mt-1 text-right text-[10px] font-black uppercase tracking-widest text-gray-500">
                {format(new Date(msg.createdAt), 'HH:mm')}
              </p>
            </div>
          </div>
        ))}

        {/* Pending messages */}
        {pendingMessages.map((msg) => (
          <div
            key={msg.id}
            className="relative mr-auto flex max-w-2xl items-start rounded-xl border border-dashed border-brand-gold/25 bg-brand-dark-elevated/70 px-4 py-3 text-sm text-gray-200 opacity-80 shadow-md"
          >
            <img
              src={user?.profilePic || 'https://via.placeholder.com/50'} // Default avatar
              alt="User Avatar"
              className="mr-3 h-8 w-8 rounded-full border border-white/10"
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
              <p className="mt-1 text-right text-[10px] font-black uppercase tracking-widest text-gray-500">
                {msg.status === 'pending' ? 'Sending...' : 'Sent'}
              </p>
            </div>
            {msg.image && msg.status === 'pending' && (
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  onClick={() => handleSendPendingImage(msg)}
                  className="text-emerald-400 transition-colors hover:text-emerald-300"
                  title="Send"
                >
                  <MdSend className="text-lg" />
                </button>
                <button
                  onClick={() => handleCancelPendingImage(msg.id)}
                  className="text-rose-400 transition-colors hover:text-rose-300"
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
          <div className="flex items-center justify-center rounded-lg border border-brand-gold/20 bg-brand-gold/10 px-4 py-2 text-sm text-brand-gold-light shadow-md">
            Uploading image...
          </div>
        )}
      </div>

      {/* Input */}
      <div className="z-50 space-y-2 border-t border-white/10 bg-brand-dark-elevated/90 px-6 py-4 backdrop-blur-xl">
        <div className="relative">
          <textarea
            className="w-full resize-none rounded-xl border border-white/10 bg-black/20 p-3 pr-16 text-sm text-gray-200 focus:border-brand-gold/40 focus:outline-none"
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
          <label className="absolute right-12 top-3 cursor-pointer text-gray-500 transition-colors hover:text-brand-gold">
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
            className="absolute right-3 top-3 text-brand-gold transition-colors hover:text-brand-gold-light disabled:opacity-50"
            onClick={handleSendTextMessage}
            disabled={isSending || uploadingReplyImage || !userReplyText.trim()}
          >
            <MdSend className="text-xl" />
          </button>
          <button
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className="absolute right-20 top-3 text-brand-gold transition-colors hover:text-brand-gold-light"
          >
            😊
          </button>
          {showEmojiPicker && (
            <div className="absolute bottom-14 right-3 z-50 rounded-lg border border-brand-gold/30 bg-brand-dark-base p-2 shadow-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-300">Select Emoji</span>
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
