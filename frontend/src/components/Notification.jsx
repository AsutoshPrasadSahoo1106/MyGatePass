import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { toast } from 'react-toastify';

const POLLING_INTERVAL = 10000; // Poll every 60 seconds

const Notifications = React.memo(() => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  useEffect(() => {
    fetchNotifications();

    const intervalId = setInterval(fetchNotifications, POLLING_INTERVAL);

    return () => clearInterval(intervalId);
  }, []);

  const fetchNotifications = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `http://localhost:5000/api/notifications/user`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications(response.data);
    } catch (error) {
      console.error(error.response ? error.response.data : error.message);
      toast.error("Failed to fetch notifications.");
    }
  };

  const markAsRead = async (notificationId) => {
    const token = localStorage.getItem("token");
    try {
      await axios.patch(
        `http://localhost:5000/api/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Notification marked as read.");
      fetchNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error.response ? error.response.data : error.message);
      toast.error("Failed to mark notification as read.");
    }
  };

  const handleClickOutside = (event) => {
    if (notificationRef.current && !notificationRef.current.contains(event.target)) {
      setShowNotifications(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div>
      <div
        className="notification-icon"
        onClick={() => setShowNotifications(!showNotifications)}
        title="Notifications"
        aria-label="Notifications"
      >
        <FontAwesomeIcon icon={faBell} size="lg" />
        {notifications.length > 0 && (
          <span className="notification-count">{notifications.length}</span>
        )}
      </div>

      {showNotifications && (
        <div className="notification-dropdown" ref={notificationRef}>
          <h4>Notifications</h4>
          {notifications.length === 0 ? (
            <p>No notifications.</p>
          ) : (
            <ul>
              {notifications.map((notification) => (
                <li key={notification._id} className={notification.isRead ? 'read' : 'unread'}>
                  <div className="notification-message">
                    {notification.message}
                  </div>
                  <div className="notification-meta">
                    {new Date(notification.createdAt).toLocaleString()}
                    {!notification.isRead && (
                      <button 
                        className="btn btn-sm btn-link mark-read-btn"
                        onClick={() => markAsRead(notification._id)}
                      >
                        Mark as Read
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
});

export default Notifications;
