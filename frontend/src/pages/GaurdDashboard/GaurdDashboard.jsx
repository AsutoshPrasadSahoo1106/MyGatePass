// src/components/GuardDashboard.js

import React, { useEffect, useState } from "react";
import axios from "axios";
import './GaurdDashboard.css'; // Import custom CSS
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle, faKey } from '@fortawesome/free-solid-svg-icons';
import { toast, ToastContainer } from 'react-toastify';
import OTPModal from '../../components/OTPModal'; // Import the OTP Modal component

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

    useEffect(() => {
        fetchApprovedGatePasses(); // Fetch on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
            toast.error(
                error.response?.data?.message || "Failed to verify OTP."
            );
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

    if (loading) return <div className="loading">Loading approved gate passes...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="dashboard-container">
            <ToastContainer />
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
                                    <td>{new Date(pass.outTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                    <td>{new Date(pass.returnTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                    <td>
                                        <button
                                            className="btn btn-success btn-sm me-2"
                                            onClick={() => handleActionClick(pass._id, 'in')}
                                            aria-label={`Verify entry for pass ${index + 1}`}
                                        >
                                            <FontAwesomeIcon icon={faCheckCircle} /> In
                                        </button>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleActionClick(pass._id, 'out')}
                                            aria-label={`Verify exit for pass ${index + 1}`}
                                        >
                                            <FontAwesomeIcon icon={faTimesCircle} /> Out
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
