import React, { useState } from 'react';

// Message bubble component
function Message({ message }) {
  if (message.type === 'text') {
    return (
      <div
        className={`mb-2 ${message.from === 'user' ? 'text-right' : 'text-left'}`}
      >
        <span
          className={`inline-block px-4 py-2 rounded-lg ${message.from === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-900'}`}
        >
          {message.text}
        </span>
      </div>
    );
  }
  if (message.type === 'options') {
    return (
      <div className="mb-2 flex flex-wrap gap-2 justify-end">
        {message.options.map((opt, idx) => (
          <button
            key={idx}
            className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
            onClick={opt.onClick}
          >
            {opt.label}
          </button>
        ))}
      </div>
    );
  }
  if (message.type === 'component') {
    // Render a React component (e.g., product card) inside the chat
    return <div className="mb-2">{message.component}</div>;
  }
  return null;
}

export default function ChatInterface({
  onCommand,
  customMessages,
  customInputHandler,
}) {
  const [messages, setMessages] = useState([
    { type: 'text', from: 'bot', text: 'Welcome! How can I help you today?' },
    {
      type: 'options',
      from: 'bot',
      options: [
        {
          label: 'Show Products',
          onClick: () => handleCommand('show_products'),
        },
        { label: 'Go to Cards', onClick: () => handleCommand('show_cards') },
      ],
    },
  ]);
  const [input, setInput] = useState('');

  function handleCommand(cmd) {
    if (onCommand) onCommand(cmd);
    // Add logic to handle commands and update chat (only if not externally controlled)
    if (!customMessages) {
      if (cmd === 'show_products') {
        setMessages((msgs) => [
          ...msgs,
          { type: 'text', from: 'user', text: 'Show Products' },
          {
            type: 'component',
            from: 'bot',
            component: (
              <div className="bg-white p-4 rounded shadow">
                [Product List Placeholder]
              </div>
            ),
          },
        ]);
      } else if (cmd === 'show_cards') {
        setMessages((msgs) => [
          ...msgs,
          { type: 'text', from: 'user', text: 'Go to Cards' },
          {
            type: 'component',
            from: 'bot',
            component: (
              <div className="bg-white p-4 rounded shadow">
                [Cards Section Placeholder]
              </div>
            ),
          },
        ]);
      }
    }
  }

  function handleSend() {
    if (!input.trim()) return;
    if (customInputHandler) {
      customInputHandler(input);
      setInput('');
    } else {
      setMessages((msgs) => [
        ...msgs,
        { type: 'text', from: 'user', text: input },
      ]);
      setInput('');
      // Optionally, parse input and respond
    }
  }

  const displayMessages = customMessages || messages;

  return (
    <div className="flex flex-col h-full max-h-screen bg-gray-50">
      <div className="flex-1 overflow-y-auto p-4">
        {displayMessages.map((msg, idx) => (
          <Message key={idx} message={msg} />
        ))}
      </div>
      <div className="p-2 border-t bg-white flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2 focus:outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={handleSend}
        >
          Send
        </button>
      </div>
    </div>
  );
}
