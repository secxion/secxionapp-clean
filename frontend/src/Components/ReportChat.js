import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import SummaryApi from '../common';
import { MdSend, MdImage, MdClose } from 'react-icons/md';
import { FaUserCircle } from 'react-icons/fa';
import uploadImage from '../helpers/uploadImage';
import { format } from 'date-fns';

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
      toast.error('Could not fetch messages.');
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
      toast.error('Failed to upload image.');
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
        toast.success('Message sent!');
        setMessageText('');
        setMessageImage(null);
        fetchMessages(); // Re-fetch messages to update the chat
      } else {
        toast.error(data.message || 'Failed to send message.');
      }
    } catch (error) {
      toast.error('Error sending message.');
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
    <div className="container flex flex-col h-screen">
      <h2 className="text-2xl font-semibold mb-4">Chat with Moderator</h2>

      <div
        ref={chatContainerRef}
        className="overflow-y-auto flex-grow mb-4 p-3 bg-gray-100 rounded"
      >
        {fetchingMessages ? (
          <p>Loading messages...</p>
        ) : messages.length === 0 ? (
          <p>No messages yet.</p>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start mb-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender !== 'user' && getUserDisplay(msg.sender)}
              <div
                className={`rounded-lg p-2 break-words ${msg.sender === 'user' ? 'bg-blue-200 text-blue-800' : 'bg-gray-300 text-gray-800'}`}
              >
                <p className="text-sm">{msg.message}</p>
                {msg.image && (
                  <img
                    src={msg.image}
                    alt="Attachment"
                    className="max-w-xs h-auto rounded-md mt-1"
                  />
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {format(new Date(msg.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                </p>
              </div>
              {msg.sender === 'user' && getUserDisplay(user?.name)}
            </div>
          ))
        )}
      </div>

      <div className="p-3 border-t">
        <div className="flex items-center">
          <textarea
            className="flex-grow p-2 border rounded-md mr-2"
            placeholder="Type your message..."
            value={messageText}
            onChange={handleMessageTextChange}
          />
          <label className="cursor-pointer mr-2">
            <MdImage className="text-xl text-gray-500 hover:text-gray-700" />
            <input
              type="file"
              className="hidden"
              onChange={handleMessageImageUpload}
            />
          </label>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md disabled:bg-gray-500"
            onClick={handleSendMessage}
            disabled={uploadingImage || (!messageText && !messageImage)}
          >
            <MdSend className="inline-block mr-1" /> Send
          </button>
        </div>
        {uploadingImage && (
          <p className="text-gray-500 text-sm mt-1">Uploading image...</p>
        )}
        {messageImage && (
          <div className="relative mt-2 inline-block">
            <img
              src={messageImage}
              alt="To Send"
              className="w-20 h-20 object-cover rounded-md"
            />
            <button
              className="absolute top-0 right-0 p-1 bg-red-600 text-white rounded-full text-xs"
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
