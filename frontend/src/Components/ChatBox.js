import React, { useEffect, useRef, useCallback } from "react";
import { FaPaperPlane } from "react-icons/fa";
import SummaryApi from "../common";
import { toast } from "react-toastify";

const ChatBox = ({ userId, recipientId, messages, setMessages }) => {
  const chatEndRef = useRef(null);

  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch(
        SummaryApi.getUserMessage.url
          .replace(":userId", userId)
          .replace(":recipientId", recipientId),
        {
          method: SummaryApi.getUserMessage.method,
          credentials: "include",
        }
      );

      const data = await response.json();
      if (data.success) {
        setMessages(data.data || []);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to fetch messages");
    }
  }, [userId, recipientId, setMessages]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messages.newMessage.trim()) return;

    const messageData = { senderId: userId, recipientId, message: messages.newMessage };

    try {
      const response = await fetch(SummaryApi.sendMessage.url, {
        method: SummaryApi.sendMessage.method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageData),
      });

      const data = await response.json();
      if (data.success) {
        setMessages((prevMessages) => [...prevMessages, data.data]);
        scrollToBottom();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="container pb-48 flex flex-col h-full">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg max-w-xs ${
                msg.senderId === userId
                  ? "ml-auto bg-blue-500 text-white"
                  : "mr-auto bg-gray-300 text-gray-900"
              }`}
            >
              {msg.message}
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No messages yet</p>
        )}
        <div ref={chatEndRef}></div>
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-gray-800 border-t flex items-center">
        <textarea
          placeholder="Type a message..."
          value={messages.newMessage || ""}
          onChange={(e) => setMessages({ ...messages, newMessage: e.target.value })}
          className="flex-1 p-2 border rounded-lg focus:ring focus:ring-blue-300 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          rows={2}
        />
        <button
          type="submit"
          className="ml-2 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
