import React, { useEffect, useState } from "react";
import axios from "axios";
import "./GaurdDashboard.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faTimesCircle,
  faHome,
  faHistory,
  faUserCircle,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import { toast, ToastContainer } from "react-toastify";
import OTPModal from "../../components/OTPModal";
import { useNavigate } from "react-router-dom";
import _ from "lodash";

const POLLING_INTERVAL = 10000; // Poll every 60 seconds

const GuardDashboard = () => {
  const [approvedGatePasses, setApprovedGatePasses] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true); // Initial loading only
  const [error, setError] = useState(null);
  const [modalData, setModalData] = useState({
    show: false,
    gatePassId: null,
    action: null, // 'in' or 'out'
  });
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [user, setUser] = useState(null);
  const [outClicked, setOutClicked] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
    fetchApprovedGatePasses(true); // Initial load

    // Set up polling for approved gate passes
    const intervalId = setInterval(() => fetchApprovedGatePasses(false), POLLING_INTERVAL);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const fetchUserData = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(`http://localhost:5000/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user data:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to fetch user data.");
    }
  };

  const fetchApprovedGatePasses = async (isInitialLoad = false) => {
    // Set initial loading only for the first load
    if (isInitialLoad) {
      setInitialLoading(true);
    }

    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `http://localhost:5000/api/gatepasses/approved`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newGatePasses = response.data;

      // Only update the approvedGatePasses state if there are changes
      if (!_.isEqual(newGatePasses, approvedGatePasses)) {
        setApprovedGatePasses(newGatePasses);
      }

      setError(null);
    } catch (error) {
      console.error("Error fetching approved gate passes:", error.response?.data || error.message);
      setError("Failed to fetch approved gate passes.");
      toast.error("Failed to fetch approved gate passes.");
    } finally {
      if (isInitialLoad) {
        setInitialLoading(false); // Stop loading for initial fetch
      }
    }
  };

  const handleActionClick = async (id, action) => {
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        `http://localhost:5000/api/otp/generate`,
        { gatePassId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("OTP sent successfully!");
      setModalData({ show: true, gatePassId: id, action });

      if (action === "out") {
        setOutClicked((prev) => ({ ...prev, [id]: true }));
      }
    } catch (error) {
      console.error("Error generating OTP:", error.response?.data || error.message);
      toast.error("Failed to send OTP.");
    }
  };

  const handleVerifyOTP = async (otp) => {
    if (!modalData.gatePassId || !modalData.action) {
      toast.error("Invalid gate pass or action.");
      handleCloseModal();
      return;
    }

    setIsVerifyingOtp(true);
    const token = localStorage.getItem("token");
    try {
      const response = await axios.post(
        `http://localhost:5000/api/otp/verify`,
        { otp, gatePassId: modalData.gatePassId, action: modalData.action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(response.data.message || "OTP verified successfully!");
      fetchApprovedGatePasses(); // Refresh gate passes after verification
      handleCloseModal();
    } catch (error) {
      console.error("Error verifying OTP:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to verify OTP.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleCloseModal = () => {
    setModalData({ show: false, gatePassId: null, action: null });
  };

  if (initialLoading) return <div className="loading">Loading approved gate passes...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully.");
    navigate("/guard/login");
  };

  return (
    <div className="dashboard-container">
      <ToastContainer />
      <header className="dashboard-header">
        <div className="header-left">
          <FontAwesomeIcon
            icon={faHome}
            size="lg"
            className="header-icon"
            onClick={() => navigate("/")}
            title="Home"
            aria-label="Home"
          />
          <FontAwesomeIcon
            icon={faHistory}
            size="lg"
            className="header-icon"
            onClick={() => navigate("/history")}
            title="History"
            aria-label="History"
          />
        </div>
        <div className="header-center">
          <h2>Guard Dashboard</h2>
        </div>
        <div className="header-right">
          {user && (
            <div className="user-info">
              <FontAwesomeIcon
                icon={faUserCircle}
                size="2x"
                className="user-icon"
                aria-label="User Profile"
              />
              <span className="user-name">{user.name}</span>
            </div>
          )}
          <button
            className="logout-button"
            onClick={handleLogout}
            title="Log Out"
            aria-label="Log Out"
          >
            <FontAwesomeIcon icon={faSignOutAlt} /> Log Out
          </button>
        </div>
      </header>

      <h2 className="mb-4">Guard Dashboard</h2>
      <h4 className="mb-3">Approved Gate Passes</h4>
      {approvedGatePasses.length === 0 ? (
        <p>No approved gate passes found.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-primary">
              <tr>
                <th>#</th>
                <th>Student Name</th>
                <th>UID</th>
                <th>Room No</th>
                <th>Destination</th>
                <th>Reason</th>
                <th>Date</th>
                <th>Out Time</th>
                <th>Return Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {approvedGatePasses.map((pass, index) => (
                <tr key={pass._id}>
                  <td>{index + 1}</td>
                  <td>{pass.user ? pass.user.name : "Unknown"}</td>
                  <td>{pass.user.uid}</td>
                  <td>{pass.user.roomNo}</td>
                  <td>{pass.destination}</td>
                  <td>{pass.reason}</td>
                  <td>{new Date(pass.date).toLocaleDateString()}</td>
                  <td>
                    {pass.actualOutTime
                      ? new Date(pass.actualOutTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : " "}
                  </td>
                  <td>
                    {pass.actualInTime
                      ? new Date(pass.actualInTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : " "}
                  </td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm me-2"
                      onClick={() => handleActionClick(pass._id, "out")}
                      aria-label={`Verify exit for pass ${index + 1}`}
                      disabled={pass.actualOutTime || outClicked[pass._id]}
                    >
                      Out
                    </button>
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => handleActionClick(pass._id, "in")}
                      aria-label={`Verify entry for pass ${index + 1}`}
                      disabled={!pass.actualOutTime && !outClicked[pass._id]}
                    >
                      In
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <OTPModal
        show={modalData.show}
        onClose={handleCloseModal}
        onSubmit={handleVerifyOTP}
        isVerifyingOtp={isVerifyingOtp}
        action={modalData.action}
      />
    </div>
  );
};

export default GuardDashboard;
