import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { SOCKET_EVENTS } from '../utils/constants';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated, token } = useAuth();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Initialize socket connection
  useEffect(() => {
    if (isAuthenticated && user && token) {
      socketRef.current = io(process.env.VITE_SOCKET_URL || 'http://localhost:5000', {
        auth: {
          token: token,
          userId: user._id
        },
        transports: ['websocket']
      });

      const socket = socketRef.current;

      // Connection events
      socket.on('connect', () => {
        console.log('Connected to server');
        setIsConnected(true);
      });

      socket.on('disconnect', () => {
        console.log('Disconnected from server');
        setIsConnected(false);
      });

      socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        setIsConnected(false);
      });

      // User events
      socket.on('users_online', (users) => {
        setOnlineUsers(users);
      });

      socket.on('user_joined', (userData) => {
        setOnlineUsers(prev => [...prev, userData]);
      });

      socket.on('user_left', (userId) => {
        setOnlineUsers(prev => prev.filter(user => user.id !== userId));
      });

      // Notification events
      socket.on(SOCKET_EVENTS.NOTIFICATION, (notification) => {
        setNotifications(prev => [notification, ...prev]);
        
        // Show toast notification
        switch (notification.type) {
          case 'demand_accepted':
            toast.success('Votre demande a été acceptée !');
            break;
          case 'demand_rejected':
            toast.error('Votre demande a été refusée');
            break;
          case 'new_demand':
            toast.info('Nouvelle demande reçue');
            break;
          case 'demand_completed':
            toast.success('Transport terminé avec succès');
            break;
          case 'new_message':
            toast.info('Nouveau message reçu');
            break;
          default:
            toast.info(notification.message);
        }
      });

      // Cleanup on unmount
      return () => {
        socket.disconnect();
        setIsConnected(false);
        setOnlineUsers([]);
      };
    }
  }, [isAuthenticated, user, token]);

  // Join room for specific announcement
  const joinRoom = (announcementId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(SOCKET_EVENTS.JOIN_ROOM, announcementId);
    }
  };

  // Leave room
  const leaveRoom = (announcementId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(SOCKET_EVENTS.LEAVE_ROOM, announcementId);
    }
  };

  // Send message
  const sendMessage = (messageData) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(SOCKET_EVENTS.SEND_MESSAGE, messageData);
    }
  };

  // Listen for new messages
  const onNewMessage = (callback) => {
    if (socketRef.current) {
      socketRef.current.on(SOCKET_EVENTS.RECEIVE_MESSAGE, callback);
      
      // Return cleanup function
      return () => {
        socketRef.current.off(SOCKET_EVENTS.RECEIVE_MESSAGE, callback);
      };
    }
  };

  // Send notification
  const sendNotification = (notificationData) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('send_notification', notificationData);
    }
  };

  // Mark notification as read
  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    );
  };

  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
  };

  // Get unread notifications count
  const getUnreadCount = () => {
    return notifications.filter(notif => !notif.read).length;
  };

  // Check if user is online
  const isUserOnline = (userId) => {
    return onlineUsers.some(user => user.id === userId);
  };

  // Emit typing indicator
  const emitTyping = (announcementId, isTyping) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('typing', {
        announcementId,
        userId: user._id,
        isTyping
      });
    }
  };

  // Listen for typing indicators
  const onTyping = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('user_typing', callback);
      
      return () => {
        socketRef.current.off('user_typing', callback);
      };
    }
  };

  const value = {
    socket: socketRef.current,
    isConnected,
    onlineUsers,
    notifications,
    joinRoom,
    leaveRoom,
    sendMessage,
    onNewMessage,
    sendNotification,
    markNotificationAsRead,
    clearNotifications,
    getUnreadCount,
    isUserOnline,
    emitTyping,
    onTyping
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook to use socket context
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export default SocketContext;