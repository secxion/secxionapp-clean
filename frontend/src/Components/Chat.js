import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import SummaryApi from '../common';

// Use same origin in production, localhost in development
const socketUrl = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5000' 
  : window.location.origin;
const socket = io(socketUrl);

const Chat = ({ receiver }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(
          SummaryApi.getmessages.url.replace(':userId', receiver),
          {
            method: SummaryApi.getmessages.method,
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          },
        );

        if (!response.ok) {
          throw new Error(`Error fetching messages: ${response.statusText}`);
        }

        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    if (receiver) {
      fetchMessages();
    }
  }, [receiver]);

  useEffect(() => {
    socket.on('receiveMessage', (message) => {
      if (message.sender === receiver || message.receiver === receiver) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, [receiver]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageData = {
      sender: 'userId',
      receiver,
      text: newMessage,
      timestamp: new Date().toISOString(),
    };

    try {
      const response = await fetch(SummaryApi.messages.url, {
        method: SummaryApi.messages.method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(messageData),
      });

      if (!response.ok) {
        throw new Error(`Error sending message: ${response.statusText}`);
      }

      socket.emit('sendMessage', messageData);
      setMessages((prevMessages) => [...prevMessages, messageData]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="container chat-container">
      <div className="chat-box">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.sender === 'admin' ? 'admin' : 'user'}`}
          >
            <p>{msg.text}</p>
            <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
