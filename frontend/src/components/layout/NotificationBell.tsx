import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../api/axios';
import { NotificationItem } from '../../types';

export interface NotificationBellProps {
  align?: 'left' | 'right';
  direction?: 'up' | 'down';
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  align = 'right',
  direction = 'down',
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const positionClasses =
    direction === 'up'
      ? align === 'left'
        ? 'bottom-full left-0 mb-2'
        : 'bottom-full right-0 mb-2'
      : align === 'left'
      ? 'top-full left-0 mt-2'
      : 'top-full right-0 mt-2';

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await api.get('/notifications');
      const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
      setNotifications(data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    // Poll every 10 seconds for live notifications updates
    const interval = setInterval(fetchNotifications, 10000);

    // Click outside to close dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleToggle = async () => {
    const nextOpenState = !isOpen;
    setIsOpen(nextOpenState);

    // When opening and there are unread notifications, mark them as read
    if (nextOpenState && unreadCount > 0) {
      try {
        await api.patch('/notifications/read-all');
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      } catch (err) {
        console.error('Failed to mark notifications as read:', err);
      }
    }
  };

  const handleMarkSingleRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const getTypeBadge = (type?: string): string => {
    switch (type) {
      case 'assignment':
        return 'bg-teal-100 text-teal-800';
      case 'status_change':
        return 'bg-amber-100 text-amber-800';
      case 'comment':
        return 'bg-slate-100 text-slate-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={handleToggle}
        className="relative p-2.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 focus:outline-none transition-colors"
        title="Notifications"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Overlay */}
      {isOpen && (
        <div
          className={`absolute ${positionClasses} w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-200 py-2 z-50 overflow-hidden`}
        >
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-xs text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded-md">
                {unreadCount} unread
              </span>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 font-medium">
                No notifications yet.
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item._id}
                  className={`p-4 hover:bg-slate-50 transition-colors flex items-start space-x-3 ${
                    !item.read ? 'bg-teal-50/30' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getTypeBadge(
                          item.type
                        )}`}
                      >
                        {item.type || 'info'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : ''}
                      </span>
                    </div>

                    <p className="text-xs text-slate-800 leading-snug font-medium">
                      {item.message}
                    </p>
                  </div>

                  {!item.read && (
                    <button
                      onClick={(e) => handleMarkSingleRead(item._id, e)}
                      title="Mark as read"
                      className="w-2 h-2 rounded-full bg-teal-600 hover:scale-125 transition-transform shrink-0 mt-1.5"
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
