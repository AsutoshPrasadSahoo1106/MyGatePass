import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRecoilState } from "recoil";
import {
  gatePassesState,
  gatePassesLoadingState,
  gatePassesErrorState,
} from "../../state/atoms";
import GatePassForm from "../../components/GatePassForm"; // Import the new component
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import './StudentDashboard.css'

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
    }
  };

  const markAsRead = async (notificationId) => {
    const token = localStorage.getItem("token");
    try {
      await axios.patch(`http://localhost:5000/api/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Notification marked as read.");
      
      // Fetch updated notifications after marking as read
      fetchNotifications(); // Call fetchNotifications to refresh the notifications list
    } catch (error) {
      console.error("Error marking notification as read:", error.response ? error.response.data : error.message);
    }
  };

  const toggleForm = () => {
    setShowForm(!showForm); // Toggle form visibility
  };

  const handleFormSuccess = () => {
    fetchGatePasses(); // Refetch gate passes after successfully applying for a new gate pass
  };

  if (loading) return <div>Loading gate passes...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Student Dashboard</h2>
      <h3>Your Gate Passes</h3>

      {/* Notification Icon */}
      <div
        className="notification-icon"
        onClick={() => setShowNotifications(!showNotifications)}
      >
        <FontAwesomeIcon icon={faBell} />
        {notifications.length > 0 && (
          <span className="notification-count">{notifications.length}</span>
        )}
      </div>

      {/* Notification Dropdown */}
      {showNotifications && (
        <div className="notification-dropdown">
          <h4>Notifications</h4>
          {notifications.length === 0 ? (
            <p>No notifications.</p>
          ) : (
            <ul>
              {notifications.map((notification) => (
                <li key={notification._id}>
                  {notification.message} -{" "}
                  {new Date(notification.createdAt).toLocaleString()}
                  {!notification.isRead && (
                    <button onClick={() => markAsRead(notification._id)}>Mark as Read</button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {gatePasses.length === 0 ? (
        <p>No gate passes found.</p>
      ) : (
        <ul>
          {gatePasses.map((pass) => (
            <li key={pass._id}>
              <p>Destination: {pass.destination}</p>
              <p>Reason: {pass.reason}</p>
              <p>Status: {pass.status}</p>
              <p>Date: {new Date(pass.date).toLocaleDateString()}</p>
              <p>Out Time: {new Date(pass.outTime).toLocaleTimeString()}</p>
              <p>
                Return Time: {new Date(pass.returnTime).toLocaleTimeString()}
              </p>
            </li>
          ))}
        </ul>
      )}
      <button onClick={toggleForm}>Apply for New Gate Pass</button>

      {/* Render the GatePassForm component if showForm is true */}
      {showForm && (
        <GatePassForm onClose={toggleForm} onSuccess={handleFormSuccess} />
      )}
    </div>
  );
};

export default StudentDashboard;
