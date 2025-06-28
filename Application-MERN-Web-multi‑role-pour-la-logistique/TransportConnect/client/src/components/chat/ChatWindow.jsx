import React, { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../../hooks/useSocket';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

const ChatWindow = ({ conversationId, currentUserId, recipient, onClose }) => {
  const { sendMessage, onNewMessage } = useSocket();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Charger les messages initiaux (à adapter selon votre API)
  useEffect(() => {
    // TODO: Remplacer par un appel API réel pour charger les messages
    setLoading(false);
  }, [conversationId]);

  // Gérer la réception de nouveaux messages via socket
  useEffect(() => {
    const unsubscribe = onNewMessage((msg) => {
      if (msg.conversationId === conversationId) {
        setMessages((prev) => [...prev, msg]);
      }
    });
    return unsubscribe;
  }, [conversationId, onNewMessage]);

  const handleSend = useCallback(
    (text) => {
      const msg = {
        conversationId,
        senderId: currentUserId,
        recipientId: recipient?._id,
        text,
        createdAt: new Date().toISOString(),
      };
      sendMessage(msg);
      setMessages((prev) => [...prev, msg]);
    },
    [conversationId, currentUserId, recipient, sendMessage]
  );

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg max-w-md w-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="font-semibold">Chat avec {recipient?.prenom || 'Utilisateur'}</div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">&times;</button>
        )}
      </div>
      <MessageList messages={messages} currentUserId={currentUserId} />
      <MessageInput onSend={handleSend} disabled={loading} />
    </div>
  );
};

export default ChatWindow;
