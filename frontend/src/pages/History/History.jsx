import React, { useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faHistory } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import './History.css'; // Use the same CSS for styling
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const History = () => {
  const [completedGatePasses, setCompletedGatePasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const userRole = localStorage.getItem("userRole"); // Get user role from local storage

  useEffect(() => {
    fetchCompletedGatePasses();
  }, []);

  const fetchCompletedGatePasses = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `http://localhost:5000/api/gatepasses/history`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCompletedGatePasses(response.data);
      setError(null);
    } catch (error) {
      console.error(error.response ? error.response.data : error.message);
      setError(error.response?.data?.message || "Failed to fetch completed gate passes.");
      toast.error(error.response?.data?.message || "Failed to fetch completed gate passes.");
    } finally {
      setLoading(false);
    }
  };

  const handleHomeClick = () => {
    // Navigate to the appropriate dashboard based on the user's role
    if (userRole === 'student') {
      navigate("/student/dashboard");
    } else if (userRole === 'warden') {
      navigate("/warden/dashboard");
    } else if (userRole === 'guard') {
      navigate("/guard/dashboard");
    } else {
      navigate("/"); // Default fallback if role is not recognized
    }
  };

  if (loading) return <div className="loading">Loading completed gate passes...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="dashboard-container">
      <ToastContainer />
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <FontAwesomeIcon 
            icon={faHome} 
            size="lg" 
            className="header-icon" 
            onClick={handleHomeClick} 
            title="Home" 
            aria-label="Home" 
          />
          <FontAwesomeIcon icon={faHistory} size="lg" className="header-icon" title="History" aria-label="History" />
        </div>
        <div className="header-center">
          <div>Gate Pass History</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <section className="gatepasses-section">
          <h3>Completed Gate Passes</h3>
          {completedGatePasses.length === 0 ? (
            <p>No completed gate passes found.</p>
          ) : (
            <div className="gatepasses-list">
              {completedGatePasses.map((pass) => (
                <div key={pass._id} className={`gatepass-card ${pass.status.toLowerCase()}`}>
                  <h5>{pass.passType}</h5>
                  {/* Display name and UID for warden and guard */}
                  {(userRole === 'warden' || userRole === 'guard') && (
                    <>
                      <p><strong>Name:</strong> {pass.user.name}</p> {/* Assuming name is available */}
                      <p><strong>UID:</strong> {pass.user.uid}</p> {/* Assuming UID is available */}
                      <p><strong>Room No:</strong> {pass.user.roomNo}</p>
                    </>
                  )}
                  <p><strong>Destination:</strong> {pass.destination}</p>
                  <p><strong>Reason:</strong> {pass.reason}</p>
                  <p><strong>Status:</strong> {pass.status}</p>
                  <p><strong>Date:</strong> {new Date(pass.date).toLocaleDateString()}</p>
                  {/* Conditionally render Out Time and Return Time */}
                  {pass.status !== 'Rejected' && (
                    <>
                      <p><strong>Out Time:</strong> {new Date(pass.actualOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      <p><strong>Return Time:</strong> {new Date(pass.actualInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default History;
