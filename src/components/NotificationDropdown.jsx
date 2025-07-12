import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';

const NotificationDropdown = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  console.log('NotificationDropdown rendered, unreadCount:', unreadCount);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification._id);
    }
    
    // Navigate to the question if it exists
    if (notification.question) {
      navigate(`/question/${notification.question._id || notification.question}`);
    }
    
    setIsOpen(false);
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInSeconds = Math.floor((now - notificationDate) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  // Simple test button first
  return (
    <div className="relative" ref={dropdownRef} style={{ display: 'block' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0.5rem',
          border: '1px solid #d1d5db',
          borderRadius: '0.5rem',
          backgroundColor: 'white',
          color: '#4b5563',
          cursor: 'pointer',
          position: 'relative'
        }}
        title="Notifications"
      >
        <svg style={{ width: '1.5rem', height: '1.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>
        <span style={{ marginLeft: '0.5rem', fontSize: '0.875rem' }}>Notifications</span>
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-0.25rem',
            right: '-0.25rem',
            backgroundColor: '#ef4444',
            color: 'white',
            fontSize: '0.75rem',
            borderRadius: '50%',
            height: '1.25rem',
            width: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '500'
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          right: '0',
          marginTop: '0.5rem',
          width: '20rem',
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '0.5rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          zIndex: 50,
          maxHeight: '24rem',
          overflowY: 'auto'
        }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'black', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.73 21a2 2 0 01-3.46 0" />
                </svg>
                Notifications
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  style={{ fontSize: '0.875rem', color: '#2563eb', fontWeight: '500', cursor: 'pointer' }}
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          <div style={{ maxHeight: '16rem', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  style={{
                    padding: '1rem',
                    borderBottom: '1px solid #f3f4f6',
                    cursor: 'pointer',
                    backgroundColor: notification.read ? 'white' : '#eff6ff',
                    borderLeft: notification.read ? 'none' : '4px solid #3b82f6'
                  }}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <h4 style={{ fontWeight: '500', color: 'black' }}>{notification.title}</h4>
                        {!notification.read && (
                          <span style={{
                            width: '0.5rem',
                            height: '0.5rem',
                            backgroundColor: '#3b82f6',
                            borderRadius: '50%'
                          }}></span>
                        )}
                      </div>
                      <p style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '0.5rem' }}>{notification.message}</p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                        {notification.question && (
                          <span style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: '500' }}>
                            {notification.type === 'new_answer' ? 'View Answer →' : 'View Question →'}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification._id);
                      }}
                      style={{
                        marginLeft: '0.5rem',
                        color: '#9ca3af',
                        padding: '0.25rem',
                        borderRadius: '0.25rem',
                        cursor: 'pointer'
                      }}
                      title="Delete notification"
                    >
                      <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown; 