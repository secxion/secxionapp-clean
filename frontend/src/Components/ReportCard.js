import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
  const chatShellRef = useRef(null);
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

  const scrollToLatestMessage = useCallback(() => {
    requestAnimationFrame(() => {
      const chatHistory = chatHistoryRef.current;
      if (chatHistory) {
        chatHistory.scrollTop = chatHistory.scrollHeight;
      }
    });
  }, []);

  useEffect(() => {
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const shell = chatShellRef.current;
    const viewport = window.visualViewport;
    if (!shell) return undefined;

    let animationFrameId;
    const syncShellToViewport = () => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(() => {
        const netHeight =
          Number.parseFloat(
            getComputedStyle(document.documentElement).getPropertyValue(
              '--net-height',
            ),
          ) || 0;
        const viewportTop = viewport?.pageTop || window.scrollY;
        const viewportLeft = viewport?.pageLeft || window.scrollX;
        const viewportHeight = viewport?.height || window.innerHeight;
        const viewportWidth = viewport?.width || window.innerWidth;

        shell.style.top = `${viewportTop + netHeight}px`;
        shell.style.left = `${viewportLeft}px`;
        shell.style.width = `${viewportWidth}px`;
        shell.style.height = `${Math.max(0, viewportHeight - netHeight)}px`;

        if (document.activeElement === replyInputRef.current) {
          scrollToLatestMessage();
        }
      });
    };

    syncShellToViewport();
    viewport?.addEventListener('resize', syncShellToViewport);
    viewport?.addEventListener('scroll', syncShellToViewport);
    window.addEventListener('resize', syncShellToViewport);
    window.addEventListener('scroll', syncShellToViewport, { passive: true });

    return () => {
      cancelAnimationFrame(animationFrameId);
      viewport?.removeEventListener('resize', syncShellToViewport);
      viewport?.removeEventListener('scroll', syncShellToViewport);
      window.removeEventListener('resize', syncShellToViewport);
      window.removeEventListener('scroll', syncShellToViewport);
    };
  }, [report?._id, scrollToLatestMessage]);

  useEffect(() => {
    if (isAutoScrolling) {
      scrollToLatestMessage();
    }
  }, [isAutoScrolling, scrollToLatestMessage]);

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

  const handleComposerSubmit = (event) => {
    event.preventDefault();
    handleSendTextMessage();
  };

  const handleComposerPointerDown = (event) => {
    if (document.activeElement === event.currentTarget) return;

    event.preventDefault();
    event.currentTarget.focus({ preventScroll: true });
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
      <div className="premium-bg fixed inset-x-0 bottom-0 top-[var(--net-height)] z-50 flex items-center justify-center">
        <SecxionSpinner size="large" message="Loading support chat..." />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="fixed inset-x-0 bottom-0 top-[var(--net-height)] z-50 flex flex-col items-center justify-center gap-5 bg-brand-dark-base px-6 text-center text-gray-100">
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

  const chatInterface = (
    <div
      ref={chatShellRef}
      className="absolute z-[60] grid grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden bg-gradient-to-br from-brand-dark-base via-brand-dark-elevated to-black text-gray-100"
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
        className="min-h-0 space-y-4 overflow-x-hidden overflow-y-auto overscroll-contain bg-gradient-to-b from-brand-dark-base via-brand-dark-base to-black px-4 py-4 sm:px-6"
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
              msg.sender === 'user'
                ? 'ml-auto flex-row-reverse border border-brand-gold/20 bg-brand-gold/10 text-brand-gold-light'
                : 'mr-auto border border-white/10 bg-white/[0.04] text-gray-200'
            }`}
          >
            {/* Avatar */}
            {msg.sender === 'user' && (
              <img
                src={user?.profilePic || 'https://via.placeholder.com/50'}
                alt="User Avatar"
                className="ml-3 h-8 w-8 shrink-0 rounded-full border border-white/10"
              />
            )}
            {msg.sender === 'admin' && (
              <img
                src={SecxionLogo}
                alt="Admin Avatar"
                className="mr-3 h-8 w-8 shrink-0 rounded-full border border-brand-gold/30 bg-black/20"
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
            className="relative ml-auto flex max-w-[88%] flex-row-reverse items-start rounded-xl border border-dashed border-brand-gold/25 bg-brand-gold/10 px-4 py-3 text-sm text-brand-gold-light opacity-80 shadow-md sm:max-w-2xl"
          >
            <img
              src={user?.profilePic || 'https://via.placeholder.com/50'} // Default avatar
              alt="User Avatar"
              className="ml-3 h-8 w-8 rounded-full border border-white/10"
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
        className="z-50 border-t border-brand-gold/20 bg-brand-dark-elevated/95 px-3 pt-2 backdrop-blur-xl"
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
      >
        <form
          className="flex h-12 w-full items-center gap-2"
          onSubmit={handleComposerSubmit}
        >
          <label className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-black/20 text-gray-400 transition-colors hover:border-brand-gold/40 hover:text-brand-gold">
            <MdAdd className="text-2xl" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              multiple
              disabled={uploadingReplyImage}
            />
          </label>
          <div className="flex h-10 min-w-0 flex-1 items-center rounded-lg border border-white/10 bg-brand-dark-base/80 pl-3 pr-1 shadow-inner focus-within:border-brand-gold/50">
            <input
              ref={replyInputRef}
              type="text"
              className="h-full min-w-0 flex-1 border-0 bg-transparent px-1 font-spaceGrotesk text-base text-gray-100 placeholder:text-gray-600 focus:outline-none focus:ring-0"
              placeholder={
                uploadingReplyImage ? 'Uploading media...' : 'Message Secxion'
              }
              value={userReplyText}
              onChange={(e) => setUserReplyText(e.target.value)}
              onPointerDown={handleComposerPointerDown}
              enterKeyHint="send"
              autoComplete="off"
              autoCorrect="on"
              spellCheck="true"
              onFocus={() => {
                setIsAutoScrolling(true);
              }}
              disabled={uploadingReplyImage}
            />
            <button
              type="button"
              onClick={handleToggleEmojiPicker}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-base opacity-80 transition-colors hover:bg-brand-gold/10 hover:opacity-100"
              aria-label="Choose an emoji"
              aria-expanded={showEmojiPicker}
            >
              😊
            </button>
          </div>
          <button
            type="submit"
            className="brand-gradient-gold flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-brand-dark-base shadow-[0_0_14px_rgba(212,175,55,0.16)] transition-colors disabled:bg-none disabled:bg-white/5 disabled:text-gray-600 disabled:shadow-none"
            disabled={isSending || uploadingReplyImage || !userReplyText.trim()}
            aria-label="Send message"
          >
            <MdSend className="text-xl" />
          </button>
        </form>
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
              height={280}
            />
          </div>
        </div>
      )}
    </div>
  );

  return createPortal(chatInterface, document.body);
};

export default ReportCard;
