import React, { useContext, useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { TeamContext } from '../context/TeamContext';
import { motion } from 'framer-motion';

const Notifications = () => {
  const socket = useSocket();
  const { team } = useContext(TeamContext);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (socket && socket.connected) {
      // Listen for new notifications
      socket.on('notification', (newNotification) => {
        setNotifications((prev) => [newNotification, ...prev]);
      });

      return () => {
        socket.off('notification');
      };
    }
  }, [socket]);

  // Simulated notifications data
  useEffect(() => {
    const mockNotifications = [
      {
        id: 1,
        type: 'mentor',
        title: 'Mentor Session Confirmed',
        message: 'Your session with Dr. Sarah Johnson has been confirmed for tomorrow at 2 PM.',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        read: false,
      },
      {
        id: 2,
        type: 'submission',
        title: 'Submission Feedback',
        message: 'Your latest project submission has been reviewed. Check the feedback in the Submissions section.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        read: true,
      },
      {
        id: 3,
        type: 'announcement',
        title: 'New Resource Available',
        message: 'A new AI workshop recording has been added to the resources section.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        read: true,
      },
    ];

    setNotifications(mockNotifications);
  }, []);

  const markAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const getTimeAgo = (timestamp) => {
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    return Math.floor(seconds) + ' seconds ago';
  };

  return (
    <div className="notifications-container">
      <h1>Notifications</h1>

      {!socket && (
        <div style={{ 
          background: '#fff3cd', 
          border: '1px solid #ffeaa7', 
          borderRadius: '8px', 
          padding: '1rem', 
          marginBottom: '1rem',
          color: '#856404'
        }}>
          <strong>Offline Mode:</strong> Real-time notifications are not available. You can still view your existing notifications.
        </div>
      )}

      <div className="notifications-list">
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            className={`notification-card ${notification.read ? 'read' : 'unread'}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => markAsRead(notification.id)}
          >
            <div className="notification-header">
              <h3>{notification.title}</h3>
              <span className="timestamp">{getTimeAgo(notification.timestamp)}</span>
            </div>
            <p className="message">{notification.message}</p>
            {!notification.read && (
              <div className="unread-indicator">
                <span>New</span>
              </div>
            )}
          </motion.div>
        ))}

        {notifications.length === 0 && (
          <div className="no-notifications">
            <p>No notifications yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;