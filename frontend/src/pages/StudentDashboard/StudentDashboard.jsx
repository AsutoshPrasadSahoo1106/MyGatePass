// src/components/StudentDashboard.js

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRecoilState } from "recoil";
import {
  gatePassesState,
  gatePassesLoadingState,
  gatePassesErrorState,
} from "../../state/atoms";
import GatePassForm from "../../components/GatePassForm"; // Updated import path
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import './StudentDashboard.css'; // Import custom CSS
import { toast } from 'react-toastify';

const StudentDashboard = () => {
  const [gatePasses, setGatePasses] = useRecoilState(gatePassesState);
  const [loading, setLoading] = useRecoilState(gatePassesLoadingState);
  const [error, setError] = useRecoilState(gatePassesErrorState);
  const [showForm, setShowForm] = useState(false); // State to control the form visibility
  const [notifications, setNotifications] = useState([]); // State for notifications
  const [showNotifications, setShowNotifications] = useState(false); // State to toggle notification dropdown

  useEffect(() => {
    fetchGatePasses(); // Fetch gate passes when the component mounts
    fetchNotifications(); // Fetch notifications when the component mounts
  }, []);

  const fetchGatePasses = async () => {
    setLoading(true); // Start loading
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `http://localhost:5000/api/gatepasses/user`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setGatePasses(response.data);
      setError(null); // Clear any previous errors
    } catch (error) {
      console.error(error.response ? error.response.data : error.message);
      setError(error.response?.data?.message || "Failed to fetch gate passes.");
      toast.error(error.response?.data?.message || "Failed to fetch gate passes.");
    } finally {
      setLoading(false); // End loading
    }
  };

  const fetchNotifications = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `http://localhost:5000/api/notifications/user`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
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
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Notification marked as read.");

      // Fetch updated notifications after marking as read
      fetchNotifications(); // Call fetchNotifications to refresh the notifications list
    } catch (error) {
      console.error("Error marking notification as read:", error.response ? error.response.data : error.message);
      toast.error("Failed to mark notification as read.");
    }
  };

  const toggleForm = () => {
    setShowForm(!showForm); // Toggle form visibility
  };

  const handleFormSuccess = () => {
    fetchGatePasses(); // Refetch gate passes after successfully applying for a new gate pass
  };

  if (loading) return <div className="loading">Loading gate passes...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2>Student Dashboard</h2>
        {/* Notification Icon */}
        <div
          className="notification-icon"
          onClick={() => setShowNotifications(!showNotifications)}
        >
          <FontAwesomeIcon icon={faBell} size="lg" />
          {notifications.length > 0 && (
            <span className="notification-count">{notifications.length}</span>
          )}
        </div>
      </header>

      {/* Notification Dropdown */}
      {showNotifications && (
        <div className="notification-dropdown">
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

      <main className="dashboard-main">
        <section className="gatepasses-section">
          <h3>Your Gate Passes</h3>
          {gatePasses.length === 0 ? (
            <p>No gate passes found.</p>
          ) : (
            <div className="gatepasses-list">
              {gatePasses.map((pass) => (
                <div key={pass._id} className={`gatepass-card ${pass.status.toLowerCase()}`}>
                  <h5>{pass.passType}</h5>
                  <p><strong>Destination:</strong> {pass.destination}</p>
                  <p><strong>Reason:</strong> {pass.reason}</p>
                  <p><strong>Status:</strong> {pass.status}</p>
                  <p><strong>Date:</strong> {new Date(pass.date).toLocaleDateString()}</p>
                  <p><strong>Out Time:</strong> {new Date(pass.outTime).toLocaleTimeString()}</p>
                  <p><strong>Return Time:</strong> {new Date(pass.returnTime).toLocaleTimeString()}</p>
                </div>
              ))}
            </div>
          )}
          <button className="btn btn-success mt-4" onClick={toggleForm}>
            Apply for New Gate Pass
          </button>
        </section>
      </main>

      {/* Render the GatePassForm component as a modal if showForm is true */}
      {showForm && (
        <GatePassForm onClose={toggleForm} onSuccess={handleFormSuccess} />
      )}
    </div>
  );
};

export default StudentDashboard;
