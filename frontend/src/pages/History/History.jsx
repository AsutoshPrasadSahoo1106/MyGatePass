import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faHistory, faSearch } from "@fortawesome/free-solid-svg-icons"; // Import search icon
import { useNavigate } from "react-router-dom";
import "./History.css"; // Use the same CSS for styling
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const History = () => {
  const [completedGatePasses, setCompletedGatePasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // State for search term

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
      setError(
        error.response?.data?.message ||
          "Failed to fetch completed gate passes."
      );
      toast.error(
        error.response?.data?.message ||
          "Failed to fetch completed gate passes."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleHomeClick = () => {
    // Navigate to the appropriate dashboard based on the user's role
    if (userRole === "student") {
      navigate("/student/dashboard");
    } else if (userRole === "warden") {
      navigate("/warden/dashboard");
    } else if (userRole === "guard") {
      navigate("/guard/dashboard");
    } else {
      navigate("/"); // Default fallback if role is not recognized
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filtered completed gate passes based on search term
  const filteredGatePasses = useMemo(() => {
    if (!searchTerm) return completedGatePasses;

    const lowercasedTerm = searchTerm.toLowerCase();
    return completedGatePasses.filter((pass) => {
      const passType = pass.passType?.toLowerCase() || "";
      const destination = pass.destination?.toLowerCase() || "";
      const reason = pass.reason?.toLowerCase() || "";
      const status = pass.status?.toLowerCase() || "";
      const date = new Date(pass.date).toLocaleDateString().toLowerCase();
      const outTime = pass.actualOutTime
        ? new Date(pass.actualOutTime)
            .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            .toLowerCase()
        : "";
      const returnTime = pass.actualInTime
        ? new Date(pass.actualInTime)
            .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            .toLowerCase()
        : "";

      // For warden and guard, include user details in the search
      const userName =
        userRole === "warden" || userRole === "guard"
          ? pass.user?.name?.toLowerCase() || ""
          : "";
      const uid =
        userRole === "warden" || userRole === "guard"
          ? pass.user?.uid?.toLowerCase() || ""
          : "";
      const roomNo =
        userRole === "warden" || userRole === "guard"
          ? pass.user?.roomNo?.toLowerCase() || ""
          : "";

      return (
        passType.includes(lowercasedTerm) ||
        destination.includes(lowercasedTerm) ||
        reason.includes(lowercasedTerm) ||
        status.includes(lowercasedTerm) ||
        date.includes(lowercasedTerm) ||
        outTime.includes(lowercasedTerm) ||
        returnTime.includes(lowercasedTerm) ||
        userName.includes(lowercasedTerm) ||
        uid.includes(lowercasedTerm) ||
        roomNo.includes(lowercasedTerm)
      );
    });
  }, [searchTerm, completedGatePasses, userRole]);

  if (loading)
    return <div className="loading">Loading completed gate passes...</div>;
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
          <FontAwesomeIcon
            icon={faHistory}
            size="lg"
            className="header-icon"
            title="History"
            aria-label="History"
          />
        </div>
        <div className="header-center">
          <div>Gate Pass History</div>
        </div>
        <div className="header-right">
          {/* Conditionally render the search bar for warden and guard */}
          <div className="search-bar">
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
            <input
              type="text"
              placeholder="Search gate passes..."
              value={searchTerm}
              onChange={handleSearchChange}
              aria-label="Search gate passes"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <section className="gatepasses-section">
          <h3>Completed Gate Passes</h3>
          {filteredGatePasses.length === 0 ? (
            <p>No completed gate passes found.</p>
          ) : (
            <div className="gatepasses-list">
              {filteredGatePasses.map((pass) => (
                <div
                  key={pass._id}
                  className={`gatepass-card ${pass.status.toLowerCase()}`}
                >
                  <h5>{pass.passType}</h5>
                  {/* Display name and UID for warden and guard */}
                  {(userRole === "warden" || userRole === "guard") &&
                    pass.user && (
                      <>
                        <p>
                          <strong>Name:</strong> {pass.user.name}
                        </p>
                        <p>
                          <strong>UID:</strong> {pass.user.uid}
                        </p>
                        <p>
                          <strong>Room No:</strong> {pass.user.roomNo}
                        </p>
                      </>
                    )}
                  <p>
                    <strong>Destination:</strong> {pass.destination}
                  </p>
                  <p>
                    <strong>Reason:</strong> {pass.reason}
                  </p>
                  <p>
                    <strong>Status:</strong> {pass.status}
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(pass.date).toLocaleDateString()}
                  </p>
                  {/* Conditionally render Out Time and Return Time */}
                  {pass.status !== "Rejected" && (
                    <>
                      <p>
                        <strong>Out Time:</strong>{" "}
                        {new Date(pass.actualOutTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p>
                        <strong>Return Time:</strong>{" "}
                        {new Date(pass.actualInTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
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
