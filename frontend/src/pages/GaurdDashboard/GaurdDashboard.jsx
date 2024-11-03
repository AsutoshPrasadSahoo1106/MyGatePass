import React, { useEffect, useState } from "react";
import axios from "axios";
import "./GaurdDashboard.css"; // Import custom CSS
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
import OTPModal from "../../components/OTPModal"; // Import the OTP Modal component
import { useNavigate } from "react-router-dom"; // Assuming React Router v6

const GuardDashboard = () => {
  const [approvedGatePasses, setApprovedGatePasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalData, setModalData] = useState({
    show: false,
    gatePassId: null,
    action: null, // 'in' or 'out'
  });
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [user, setUser] = useState(null); // State to store user data
  const [outClicked, setOutClicked] = useState({}); // Track 'Out' button clicks
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    fetchUserData(); // Fetch user data when component mounts
    fetchApprovedGatePasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserData = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(`http://localhost:5000/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data); // Assuming response contains user data
    } catch (error) {
      console.error(
        "Error fetching user data:",
        error.response?.data || error.message
      );
      toast.error(
        error.response?.data?.message || "Failed to fetch user data."
      );
    }
  };

  // Function to fetch approved gate passes
  const fetchApprovedGatePasses = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `http://localhost:5000/api/gatepasses/approved`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setApprovedGatePasses(response.data);
      setError(null);
    } catch (error) {
      console.error(
        "Error fetching approved gate passes:",
        error.response ? error.response.data : error.message
      );
      setError("Failed to fetch approved gate passes.");
      toast.error("Failed to fetch approved gate passes.");
    } finally {
      setLoading(false); // End loading
    }
  };

  // Function to handle "In" and "Out" button clicks
  const handleActionClick = async (id, action) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.post(
        `http://localhost:5000/api/otp/generate`,
        {
          gatePassId: id, // Send the gate pass ID for which OTP is generated
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("OTP sent successfully!");
      setModalData({
        show: true,
        gatePassId: id,
        action: action, // 'in' or 'out'
      });

      // Update state to enable "In" button for this gate pass if "Out" was clicked
      if (action === "out") {
        setOutClicked((prev) => ({ ...prev, [id]: true }));
      }
    } catch (error) {
      console.error(
        "Error generating OTP:",
        error.response ? error.response.data : error.message
      );
      toast.error("Failed to send OTP.");
    }
  };

  // Function to handle OTP verification
  const handleVerifyOTP = async (otp) => {
    if (!modalData.gatePassId || !modalData.action) {
      toast.error("Invalid gate pass or action.");
      handleCloseModal();
      return;
    }

    setIsVerifyingOtp(true); // Start loading for OTP verification
    const token = localStorage.getItem("token");
    try {
      const response = await axios.post(
        `http://localhost:5000/api/otp/verify`,
        {
          otp,
          gatePassId: modalData.gatePassId, // Send the gate pass ID for verification
          action: modalData.action, // 'in' or 'out' based on the button clicked
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success(response.data.message || "OTP verified successfully!");
      fetchApprovedGatePasses(); // Refresh the list
      handleCloseModal();
    } catch (error) {
      console.error(
        "Error verifying OTP:",
        error.response ? error.response.data : error.message
      );
      toast.error(error.response?.data?.message || "Failed to verify OTP.");
    } finally {
      setIsVerifyingOtp(false); // End loading for OTP verification
    }
  };

  // Function to close the OTP modal
  const handleCloseModal = () => {
    setModalData({
      show: false,
      gatePassId: null,
      action: null,
    });
  };

  if (loading)
    return <div className="loading">Loading approved gate passes...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  const handleLogout = () => {
    localStorage.removeItem("token"); // Clear the token from localStorage
    toast.success("Logged out successfully.");
    navigate("/guard/login"); // Redirect to the login page
  };

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
          {/* User Info */}
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
          {/* Log Out Button */}
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
                      disabled={pass.actualOutTime || outClicked[pass._id]} // Disable if actualOutTime exists
                    >
                     Out
                    </button>
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => handleActionClick(pass._id, "in")}
                      aria-label={`Verify entry for pass ${index + 1}`}
                      disabled={!pass.actualOutTime && !outClicked[pass._id]} // Enable only if actualOutTime exists or outClicked is true
                    >
                       &nbsp; In &nbsp;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* OTP Modal */}
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
