import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useRecoilState } from "recoil";
import {
  gatePassesState,
  gatePassesLoadingState,
  gatePassesErrorState,
} from "../../state/atoms";
import GatePassForm from "../../components/GatePassForm";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faUserCircle, faHome, faHistory, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import './StudentDashboard.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";
import Notifications from "../../components/Notification";
import _ from "lodash"; // Import lodash for deep comparison

const POLLING_INTERVAL = 10000; // Poll every 10 seconds

const StudentDashboard = () => {
  const [gatePasses, setGatePasses] = useRecoilState(gatePassesState);
  const [initialLoading, setInitialLoading] = useState(true); // Use initial loading only
  const [error, setError] = useRecoilState(gatePassesErrorState);
  const [showForm, setShowForm] = useState(false);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    // Initial fetch
    fetchUserData();
    fetchGatePasses(true); // Initial load

    // Set up polling for gate passes
    const gatePassesInterval = setInterval(fetchGatePasses, POLLING_INTERVAL);

    // Clean up the interval on component unmount
    return () => clearInterval(gatePassesInterval);
  }, []);

  const fetchUserData = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `http://localhost:5000/api/users/me`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(response.data);
    } catch (error) {
      console.error(error.response ? error.response.data : error.message);
      toast.error("Failed to fetch user data.");
    }
  };

  const fetchGatePasses = async (isInitialLoad = false) => {
    // Set initial loading only for the first load
    if (isInitialLoad) {
      setInitialLoading(true);
    }

    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `http://localhost:5000/api/gatepasses/user`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newGatePasses = response.data;

      // Only update the gatePasses state if there are changes
      if (!_.isEqual(newGatePasses, gatePasses)) {
        setGatePasses(newGatePasses);
      }

      setError(null);
    } catch (error) {
      console.error(error.response ? error.response.data : error.message);
      setError(error.response?.data?.message || "Failed to fetch gate passes.");
      toast.error(error.response?.data?.message || "Failed to fetch gate passes.");
    } finally {
      if (isInitialLoad) {
        setInitialLoading(false); // Stop loading for initial fetch
      }
    }
  };

  const toggleForm = () => {
    setShowForm(!showForm);
  };

  const handleFormSuccess = () => {
    fetchGatePasses(true); // Refetch on form success, showing loading indicator
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully.");
    navigate("/student/login");
  };

  // Memoize the header to prevent re-renders when gatePasses update
  const header = useMemo(() => (
    <header className="dashboard-header">
      <div className="header-left">
        <FontAwesomeIcon icon={faHome} size="lg" className="header-icon" onClick={() => navigate("/")} title="Home" aria-label="Home" />
        <FontAwesomeIcon icon={faHistory} size="lg" className="header-icon" onClick={() => navigate("/history")} title="History" aria-label="History" />
      </div>
      <div className="header-center">
        <h2>Student Dashboard</h2>
      </div>
      <div className="header-right">
        {user && (
          <div className="user-info">
            <FontAwesomeIcon icon={faUserCircle} size="2x" className="user-icon" aria-label="User Profile" />
            <span className="user-name">{user.name}</span>
          </div>
        )}
        <Notifications />
        <button className="logout-button" onClick={handleLogout} title="Log Out" aria-label="Log Out">
          <FontAwesomeIcon icon={faSignOutAlt} /> Log Out
        </button>
      </div>
    </header>
  ), [user, navigate]); // Dependencies for re-rendering the header only if user or navigate changes

  if (initialLoading) return <div className="loading">Loading gate passes...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="dashboard-container">
      <ToastContainer />
      {header} {/* Render the memoized header */}
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
                  <p><strong>Out Time:</strong> {new Date(pass.outTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  <p><strong>Return Time:</strong> {new Date(pass.returnTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              ))}
            </div>
          )}
          <button className="btn btn-success mt-4" onClick={toggleForm}>
            Apply for New Gate Pass
          </button>
        </section>
      </main>

      {showForm && (
        <GatePassForm onClose={toggleForm} onSuccess={handleFormSuccess} />
      )}
    </div>
  );
};

export default StudentDashboard;
