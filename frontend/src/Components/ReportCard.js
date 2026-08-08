import { useState, useRef, useEffect, useCallback } from 'react';
import SummaryApi from '../common';
import { MdSend, MdClose, MdAdd } from 'react-icons/md';
import uploadImage from '../helpers/uploadImage';
import { format } from 'date-fns';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Picker from 'emoji-picker-react';
import { toast } from 'react-toastify';
import SecxionLogo from '../app/slogo.png';
import SecxionSpinner from './SecxionSpinner';
import BackButton from './BackButton';
import { toUserSafeMessage } from '../utils/userSafeMessage';

const ReportCard = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [userReplyText, setUserReplyText] = useState('');
  // ...existing code...
  const [uploadingReplyImage, setUploadingReplyImage] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const chatHistoryRef = useRef(null);
  const replyInputRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const isFetchingRef = useRef(false);
  const fetchRequestIdRef = useRef(0);
  const hasShownFetchErrorRef = useRef(false);
  const { user } = useSelector((state) => state.user);
  const [hasReceivedReply, setHasReceivedReply] = useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [pendingMessages, setPendingMessages] = useState([]); // Track messages waiting to be sent
  const [visualViewport, setVisualViewport] = useState(() => ({
    height: window.visualViewport?.height || window.innerHeight,
    bottomInset: 0,
  }));

  const scrollToLatestMessage = useCallback(() => {
    requestAnimationFrame(() => {
      const chatHistory = chatHistoryRef.current;
      if (chatHistory) {
        chatHistory.scrollTop = chatHistory.scrollHeight;
      }
    });
  }, []);

  useEffect(() => {
    const viewport = window.visualViewport;
    let animationFrameId;

    const updateVisualViewport = () => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(() => {
        const height = viewport?.height || window.innerHeight;
        const offsetTop = viewport?.offsetTop || 0;
        setVisualViewport({
          height,
          bottomInset: Math.max(0, window.innerHeight - height - offsetTop),
        });
      });
    };

    updateVisualViewport();
    viewport?.addEventListener('resize', updateVisualViewport);
    viewport?.addEventListener('scroll', updateVisualViewport);
    window.addEventListener('resize', updateVisualViewport);

    return () => {
      cancelAnimationFrame(animationFrameId);
      viewport?.removeEventListener('resize', updateVisualViewport);
      viewport?.removeEventListener('scroll', updateVisualViewport);
      window.removeEventListener('resize', updateVisualViewport);
    };
  }, []);

  useEffect(() => {
    const scrollY = window.scrollY;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousOverflow = document.body.style.overflow;
    const previousPosition = document.body.style.position;
    const previousTop = document.body.style.top;
    const previousWidth = document.body.style.width;

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = '0';
    document.body.style.width = '100%';

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousOverflow;
      document.body.style.position = previousPosition;
      document.body.style.top = previousTop;
      document.body.style.width = previousWidth;
      window.scrollTo(0, scrollY);
    };
  }, []);

  useEffect(() => {
    if (isAutoScrolling) {
      scrollToLatestMessage();
    }
  }, [visualViewport.height, isAutoScrolling, scrollToLatestMessage]);

  const fetchReport = useCallback(
    async (force = false) => {
      if (isFetchingRef.current && !force) return;

      const requestId = ++fetchRequestIdRef.current;
      isFetchingRef.current = true;

      try {
        const response = await fetch(SummaryApi.getReports.url, {
          method: SummaryApi.getReports.method,
          credentials: 'include',
        });
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        if (!data.success || !Array.isArray(data.data)) {
          throw new Error('Invalid report data received');
        }
        if (requestId !== fetchRequestIdRef.current) return;

        const foundReport = data.data.find((r) => r._id === reportId);
        if (foundReport) {
          setReport((currentReport) =>
            JSON.stringify(currentReport) === JSON.stringify(foundReport)
              ? currentReport
              : foundReport,
          );
          const adminReply = foundReport.chatHistory?.some(
            (msg) => msg.sender === 'admin',
          );
          setHasReceivedReply(adminReply);
          setFetchError('');
          hasShownFetchErrorRef.current = false;
        } else {
          navigate('/report');
        }
      } catch (error) {
        if (requestId !== fetchRequestIdRef.current) return;

        console.error('Error fetching report:', error);
        const message = toUserSafeMessage(
          error,
          'We could not refresh this conversation. Your chat remains open.',
        );
        setFetchError(message);
        if (!hasShownFetchErrorRef.current) {
          toast.error(message);
          hasShownFetchErrorRef.current = true;
        }
      } finally {
        if (requestId === fetchRequestIdRef.current) {
          isFetchingRef.current = false;
          setIsLoadingInitial(false);
        }
      }
    },
    [reportId, navigate],
  );

  useEffect(() => {
    fetchReport();
    pollingIntervalRef.current = setInterval(fetchReport, 5000);
    return () => clearInterval(pollingIntervalRef.current);
  }, [fetchReport]);

  useEffect(() => {
    if (chatHistoryRef.current && isAutoScrolling) {
      scrollToLatestMessage();
    }
  }, [report?.chatHistory, isAutoScrolling, scrollToLatestMessage]);

  const handleSendTextMessage = async () => {
    if (isSending || !userReplyText.trim()) return;

    const newMessage = {
      id: Date.now(),
      message: userReplyText,
      sender: 'user',
      status: 'pending',
    };

    setPendingMessages((prev) => [...prev, newMessage]);
    setUserReplyText('');
    setIsSending(true);

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
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to send message');
      }

      setPendingMessages((prev) =>
        prev.filter((msg) => msg.id !== newMessage.id),
      );
      await fetchReport(true);
    } catch (error) {
      setPendingMessages((prev) =>
        prev.filter((msg) => msg.id !== newMessage.id),
      );
      setUserReplyText((currentText) => currentText || newMessage.message);
      toast.error(
        toUserSafeMessage(
          error,
          'We could not send your message. Please try again.',
        ),
      );
    } finally {
      setIsSending(false);
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

  const handleToggleEmojiPicker = () => {
    if (!showEmojiPicker) {
      replyInputRef.current?.blur();
    }
    setShowEmojiPicker((isOpen) => !isOpen);
  };

  const handleEmojiClick = (emojiObject) => {
    setUserReplyText((currentText) => currentText + emojiObject.emoji);
    setShowEmojiPicker(false);
    requestAnimationFrame(() => {
      replyInputRef.current?.focus({ preventScroll: true });
    });
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
      <div
        className="premium-bg fixed left-0 z-50 flex w-full items-center justify-center"
        style={{
          top: 'var(--net-height)',
          bottom: `${visualViewport.bottomInset}px`,
        }}
      >
        <SecxionSpinner size="large" message="Loading support chat..." />
      </div>
    );
  }

  if (!report) {
    return (
      <div
        className="fixed left-0 z-50 flex w-full flex-col items-center justify-center gap-5 bg-brand-dark-base px-6 text-center text-gray-100"
        style={{
          top: 'var(--net-height)',
          bottom: `${visualViewport.bottomInset}px`,
        }}
      >
        <p className="max-w-sm text-sm text-gray-400">
          {fetchError || 'This support conversation is unavailable.'}
        </p>
        <div className="flex items-center gap-3">
          <BackButton fallbackTo="/report" ariaLabel="Go back" />
          <button
            type="button"
            onClick={() => fetchReport(true)}
            className="rounded-lg border border-brand-gold/40 px-4 py-3 text-xs font-black uppercase tracking-widest text-brand-gold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed left-0 z-50 flex w-full max-w-full flex-col overflow-hidden bg-gradient-to-br from-brand-dark-base via-brand-dark-elevated to-black text-gray-100"
      style={{
        top: 'var(--net-height)',
        bottom: `${visualViewport.bottomInset}px`,
      }}
    >
      {/* Header */}
      <div className="z-50 flex w-full shrink-0 items-center justify-between border-b border-white/10 bg-brand-dark-elevated/90 px-4 py-4 backdrop-blur-xl sm:px-6">
        <div className="flex min-w-0 items-center gap-4">
          <BackButton iconOnly fallbackTo="/report" ariaLabel="Go back" />
          <div className="flex min-w-0 flex-col">
            <h2 className="truncate font-spaceGrotesk text-xl font-black uppercase tracking-tight text-white">
              {report.category}
            </h2>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
              Report ID: {report._id.slice(-6)}
            </span>
          </div>
        </div>
        <button
          onClick={() => navigate('/report')}
          className="ml-3 shrink-0 rounded-full border border-white/10 bg-white/5 p-2 text-gray-300 transition-all duration-200 hover:border-brand-gold/30 hover:text-brand-gold"
          aria-label="Close support chat"
        >
          <MdClose className="text-2xl" />
        </button>
      </div>

      {/* Chat history */}
      <div
        ref={chatHistoryRef}
        className="min-h-0 flex-1 space-y-4 overflow-x-hidden overflow-y-auto overscroll-contain bg-gradient-to-b from-brand-dark-base via-brand-dark-base to-black px-4 py-4 sm:px-6"
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
            className={`flex w-fit max-w-[88%] items-start rounded-xl px-4 py-3 text-sm shadow-md sm:max-w-2xl ${
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
                className="mr-3 h-8 w-8 shrink-0 rounded-full border border-white/10"
              />
            )}
            {msg.sender === 'admin' && (
              <img
                src={SecxionLogo}
                alt="Admin Avatar"
                className="ml-3 h-8 w-8 shrink-0 rounded-full border border-brand-gold/30 bg-black/20"
              />
            )}
            <div className="min-w-0">
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
      <div
        className="z-50 shrink-0 space-y-2 border-t border-white/10 bg-brand-dark-elevated/95 px-4 pt-3 backdrop-blur-xl sm:px-6"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        <div className="relative">
          <textarea
            ref={replyInputRef}
            className="block max-h-28 min-h-12 w-full resize-none rounded-xl border border-white/10 bg-black/20 px-3 py-3 pr-28 text-base text-gray-200 placeholder-gray-600 focus:border-brand-gold/40 focus:outline-none"
            placeholder={
              uploadingReplyImage
                ? 'Uploading images...'
                : 'Type your message...'
            }
            rows={1}
            value={userReplyText}
            onChange={(e) => setUserReplyText(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              setIsAutoScrolling(true);
            }}
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
            type="button"
            onClick={handleToggleEmojiPicker}
            className="absolute right-20 top-3 text-brand-gold transition-colors hover:text-brand-gold-light"
            aria-label="Choose an emoji"
            aria-expanded={showEmojiPicker}
          >
            😊
          </button>
        </div>
      </div>

      {showEmojiPicker && (
        <div
          className="absolute inset-0 z-[70] flex items-end justify-center bg-black/70 p-3 backdrop-blur-sm sm:items-center"
          onClick={() => setShowEmojiPicker(false)}
          role="presentation"
        >
          <div
            className="w-full max-w-xs overflow-hidden rounded-lg border border-brand-gold/30 bg-brand-dark-elevated shadow-2xl"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Select emoji"
          >
            <div className="flex h-10 items-center justify-between border-b border-white/10 px-3">
              <span className="font-spaceGrotesk text-xs font-black uppercase tracking-widest text-gray-200">
                Select Emoji
              </span>
              <button
                type="button"
                onClick={() => setShowEmojiPicker(false)}
                className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
                aria-label="Close emoji picker"
              >
                <MdClose className="text-xl" />
              </button>
            </div>
            <Picker
              onEmojiClick={handleEmojiClick}
              autoFocusSearch={false}
              previewConfig={{ showPreview: false }}
              theme="dark"
              lazyLoadEmojis
              width="100%"
              height={Math.max(220, Math.min(320, visualViewport.height - 140))}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportCard;
