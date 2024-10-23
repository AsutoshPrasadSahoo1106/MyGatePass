import React, { useEffect, useState } from 'react';
import axios from 'axios';

const GuardDashboard = () => {
    const [approvedGatePasses, setApprovedGatePasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [otp, setOtp] = useState(''); // State for OTP input
    const [currentPassId, setCurrentPassId] = useState(null); // Track current pass ID for OTP
    const [isGeneratingOtp, setIsGeneratingOtp] = useState(false); // Loading state for OTP generation
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false); // Loading state for OTP verification

    // Function to fetch approved gate passes
    const fetchApprovedGatePasses = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get('http://localhost:5000/api/gatepasses/approved', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setApprovedGatePasses(response.data);
        } catch (error) {
            console.error('Error fetching approved gate passes:', error.response ? error.response.data : error.message);
            setError('Failed to fetch approved gate passes.');
        } finally {
            setLoading(false); // End loading
        }
    };

    useEffect(() => {
        fetchApprovedGatePasses(); // Fetch on mount and when currentPassId changes
    }, [currentPassId]); // Add currentPassId to the dependency array

    const handleGenerateOTP = async (id) => {
        setIsGeneratingOtp(true); // Start loading for OTP generation
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post('http://localhost:5000/api/otp/generate', {
                gatePassId: id // Send the gate pass ID for which OTP is generated
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('OTP sent successfully!'); // Notify the user
            setCurrentPassId(id); // Set the current pass ID
        } catch (error) {
            console.error('Error generating OTP:', error.response ? error.response.data : error.message);
            alert('Failed to send OTP.');
        } finally {
            setIsGeneratingOtp(false); // End loading for OTP generation
        }
    };

    const handleVerifyOTP = async (action) => {
        if (otp.length !== 6) {
            alert('Please enter a valid 6-digit OTP.');
            return;
        }

        setIsVerifyingOtp(true); // Start loading for OTP verification
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post('http://localhost:5000/api/otp/verify', {
                otp,
                gatePassId: currentPassId, // Send the gate pass ID for verification
                action // 'in' or 'out' based on the button clicked
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(response.data.message); // Notify the user
            setOtp(''); // Reset OTP input
            setCurrentPassId(null); // Clear current pass ID
            fetchApprovedGatePasses(); // Refresh the list of approved gate passes
        } catch (error) {
            console.error('Error verifying OTP:', error.response ? error.response.data : error.message);
            alert('Failed to verify OTP.');
        } finally {
            setIsVerifyingOtp(false); // End loading for OTP verification
        }
    };

    if (loading) return <div>Loading approved gate passes...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h2>Guard Dashboard</h2>
            <h3>Approved Gate Passes</h3>
            <ul>
                {approvedGatePasses.length === 0 ? (
                    <p>No approved gate passes found.</p>
                ) : (
                    approvedGatePasses.map((pass) => (
                        <li key={pass._id}>
                            <p>Student: {pass.user ? pass.user.name : 'Unknown'}</p>
                            <p>Destination: {pass.destination}</p>
                            <p>Reason: {pass.reason}</p>
                            <p>Status: {pass.status}</p>
                            <p>Out Time: {new Date(pass.outTime).toLocaleTimeString()}</p>
                            <p>Return Time: {new Date(pass.returnTime).toLocaleTimeString()}</p>
                            {/* OTP input and buttons for In/Out actions */}
                            {currentPassId !== pass._id && (
                                <div>
                                    <button 
                                        onClick={() => handleGenerateOTP(pass._id)} 
                                        disabled={isGeneratingOtp}
                                    >
                                        {isGeneratingOtp ? 'Generating OTP...' : 'Generate OTP'}
                                    </button>
                                </div>
                            )}
                            {currentPassId === pass._id && (
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Enter OTP"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        required
                                    />
                                    <button 
                                        onClick={() => handleVerifyOTP('in')} 
                                        disabled={isVerifyingOtp}
                                    >
                                        {isVerifyingOtp ? 'Verifying...' : 'In'}
                                    </button>
                                    <button 
                                        onClick={() => handleVerifyOTP('out')} 
                                        disabled={isVerifyingOtp}
                                    >
                                        {isVerifyingOtp ? 'Verifying...' : 'Out'}
                                    </button>
                                </div>
                            )}
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
};

export default GuardDashboard;
