import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import SummaryApi from '../common';
import { MdSend, MdImage, MdClose } from 'react-icons/md';
import { FaUserCircle } from 'react-icons/fa';
import uploadImage from '../helpers/uploadImage';
import { format } from 'date-fns';
import { toUserSafeMessage } from '../utils/userSafeMessage';

const ReportChat = ({ category, newReport, setNewReport }) => {
  const { user } = useSelector((state) => state.user);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [messageImage, setMessageImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [fetchingMessages, setFetchingMessages] = useState(true);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    fetchMessages();
  }, [newReport]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setFetchingMessages(true);
      const response = await fetch(SummaryApi.getReports.url, {
        method: SummaryApi.getReports.method,
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        const filteredReports = data.data.filter(
          (report) =>
            report.category === category ||
            (category && report.message === category),
        );
        // Assuming each report is a self-contained chat or has a chatHistory array
        const allChatMessages = filteredReports.reduce((acc, report) => {
          if (report.chatHistory && Array.isArray(report.chatHistory)) {
            return [
              ...acc,
              ...report.chatHistory.map((msg) => ({
                ...msg,
                reportId: report._id,
              })),
            ];
          }
          // If no chatHistory, consider the initial report message
          return acc;
        }, []);

        // Combine newReport if it exists and matches the category
        if (
          newReport &&
          (newReport.category === category || newReport.message === category)
        ) {
          const newMessage = {
            sender: user?.name || 'You',
            message: newReport.message,
            image: newReport.image,
            createdAt: newReport.createdAt,
            reportId: newReport._id,
          };
          setMessages((prevMessages) => [...prevMessages, newMessage]);
          setNewReport(null); // Clear the new report
        } else {
          setMessages(
            allChatMessages.sort(
              (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
            ),
          );
        }
      } else {
        setMessages([]);
      }
    } catch (error) {
      toast.error(
        toUserSafeMessage(
          error,
          'We could not load this conversation. Please try again.',
        ),
      );
    } finally {
      setFetchingMessages(false);
    }
  };

  const handleMessageTextChange = (e) => {
    setMessageText(e.target.value);
  };

  const handleMessageImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const uploadResponse = await uploadImage(file);
      setMessageImage(uploadResponse.url);
      toast.success('Image uploaded!');
    } catch (error) {
      toast.error(
        toUserSafeMessage(
          error,
          'We could not upload the image. Please try again.',
        ),
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveMessageImage = () => {
    setMessageImage(null);
  };

  const handleSendMessage = async () => {
    if (!messageText && !messageImage) {
      toast.error('Message cannot be empty.');
      return;
    }

    try {
      const newMessage = {
        reportId: messages[0]?.reportId || null,
        sender: 'user',
        message: messageText,
        image: messageImage || '',
      };

      const response = await fetch(
        SummaryApi.userReplyReport.url.replace(':id', newMessage.reportId),
        {
          method: SummaryApi.userReplyReport.method,
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newMessage),
        },
      );

      const data = await response.json();
      if (data.success) {
        toast.success('Message sent.');
        setMessageText('');
        setMessageImage(null);
        fetchMessages(); // Re-fetch messages to update the chat
      } else {
        toast.error(
          toUserSafeMessage(
            data.message,
            'We could not send your message. Please try again.',
            { status: response.status },
          ),
        );
      }
    } catch (error) {
      toast.error(
        toUserSafeMessage(
          error,
          'We could not send your message. Please try again.',
        ),
      );
    }
  };

  const getUserDisplay = (senderName) => {
    if (senderName && user?.name === senderName && user?.profilePicture) {
      return (
        <img
          src={user.profilePicture}
          alt="Profile"
          className="w-8 h-8 rounded-full mr-2 object-cover"
        />
      );
    } else if (senderName && user?.name === senderName) {
      return (
        <div className="w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center mr-2">
          {user.name.charAt(0).toUpperCase()}
        </div>
      );
    } else if (senderName === 'admin') {
      return <FaUserCircle className="mr-2 text-gray-500" />; // Placeholder for moderator
    } else {
      return <FaUserCircle className="mr-2 text-gray-500" />; // Default for other users if needed
    }
  };

  return (
    <div className="flex h-screen flex-col rounded-3xl border border-white/10 bg-gradient-to-br from-brand-dark-base via-brand-dark-elevated to-black p-4">
      <h2 className="mb-4 font-spaceGrotesk text-lg font-black uppercase tracking-[0.2em] text-brand-gold">
        Chat with Moderator
      </h2>

      <div
        ref={chatContainerRef}
        className="mb-4 flex-grow overflow-y-auto rounded-2xl border border-white/10 bg-black/20 p-4"
      >
        {fetchingMessages ? (
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
            Loading messages...
          </p>
        ) : messages.length === 0 ? (
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
            No messages yet.
          </p>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start mb-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender !== 'user' && getUserDisplay(msg.sender)}
              <div
                className={`rounded-xl border p-3 break-words ${
                  msg.sender === 'user'
                    ? 'border-brand-gold/25 bg-brand-gold/10 text-brand-gold-light'
                    : 'border-white/10 bg-white/[0.04] text-gray-200'
                }`}
              >
                <p className="text-sm">{msg.message}</p>
                {msg.image && (
                  <img
                    src={msg.image}
                    alt="Attachment"
                    className="mt-1 h-auto max-w-xs rounded-md border border-white/10"
                  />
                )}
                <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-gray-500">
                  {format(new Date(msg.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                </p>
              </div>
              {msg.sender === 'user' && getUserDisplay(user?.name)}
            </div>
          ))
        )}
      </div>

      <div className="border-t border-white/10 p-3">
        <div className="flex items-center">
          <textarea
            className="mr-2 flex-grow rounded-xl border border-white/10 bg-black/20 p-3 text-white placeholder-gray-600"
            placeholder="Type your message..."
            value={messageText}
            onChange={handleMessageTextChange}
          />
          <label className="cursor-pointer mr-2">
            <MdImage className="text-xl text-gray-500 transition-colors hover:text-brand-gold" />
            <input
              type="file"
              className="hidden"
              onChange={handleMessageImageUpload}
            />
          </label>
          <button
            className="rounded-xl bg-brand-gold px-4 py-2 font-spaceGrotesk text-[10px] font-black uppercase tracking-widest text-brand-dark-base transition-colors hover:bg-brand-gold-light disabled:opacity-40"
            onClick={handleSendMessage}
            disabled={uploadingImage || (!messageText && !messageImage)}
          >
            <MdSend className="inline-block mr-1" /> Send
          </button>
        </div>
        {uploadingImage && (
          <p className="mt-1 text-sm text-brand-gold-light">
            Uploading image...
          </p>
        )}
        {messageImage && (
          <div className="relative mt-2 inline-block">
            <img
              src={messageImage}
              alt="To Send"
              className="h-20 w-20 rounded-md border border-white/10 object-cover"
            />
            <button
              className="absolute right-0 top-0 rounded-full bg-rose-500 p-1 text-xs text-white"
              onClick={handleRemoveMessageImage}
            >
              <MdClose />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportChat;
