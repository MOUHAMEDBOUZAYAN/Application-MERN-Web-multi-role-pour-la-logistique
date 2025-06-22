import React, { useRef, useEffect } from 'react';

const MessageList = ({ messages, currentUserId }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
      {messages && messages.length > 0 ? (
        messages.map((msg, idx) => (
          <div
            key={msg._id || idx}
            className={`mb-2 flex ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg shadow text-sm ${
                msg.senderId === currentUserId
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-900 border'
              }`}
            >
              <div>{msg.text}</div>
              <div className="text-xs text-gray-400 mt-1 text-right">
                {msg.createdAt && new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center text-gray-400">Aucun message</div>
      )}
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;
