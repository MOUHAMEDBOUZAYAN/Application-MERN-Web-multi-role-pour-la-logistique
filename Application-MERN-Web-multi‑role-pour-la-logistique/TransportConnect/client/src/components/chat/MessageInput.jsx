import React, { useState } from 'react';

const MessageInput = ({ onSend, disabled }) => {
  const [message, setMessage] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message);
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSend} className="flex items-center gap-2 p-2 border-t bg-white">
      <input
        type="text"
        className="flex-1 px-4 py-2 rounded border focus:outline-none"
        placeholder="Écrivez un message..."
        value={message}
        onChange={e => setMessage(e.target.value)}
        disabled={disabled}
        maxLength={1000}
      />
      <button
        type="submit"
        className="btn-primary px-4 py-2 rounded disabled:opacity-50"
        disabled={disabled || !message.trim()}
      >
        Envoyer
      </button>
    </form>
  );
};

export default MessageInput;
