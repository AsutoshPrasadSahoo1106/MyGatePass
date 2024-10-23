import React, { useEffect, useState } from 'react';
import axios from 'axios';

const GuardDashboard = () => {
    const [approvedGatePasses, setApprovedGatePasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [otp, setOtp] = useState(''); // State for OTP input
    const [currentPassId, setCurrentPassId] = useState(null); // Track current pass ID for OTP

    useEffect(() => {
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

        fetchApprovedGatePasses();
    }, []);

    const handleGenerateOTP = async (id) => {
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
            console.error('Error generating OTP:', error.response.data);
            alert('Failed to send OTP.');
        }
    };

    const handleVerifyOTP = async (action) => {
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
            // Optionally, refetch approved gate passes or handle UI updates
        } catch (error) {
            console.error('Error verifying OTP:', error.response.data);
            alert('Failed to verify OTP.');
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
                                    <button onClick={() => handleGenerateOTP(pass._id)}>Generate OTP</button>
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
                                    <button onClick={() => handleVerifyOTP('in')}>In</button>
                                    <button onClick={() => handleVerifyOTP('out')}>Out</button>
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
