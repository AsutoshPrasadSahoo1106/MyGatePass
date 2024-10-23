import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRecoilState } from 'recoil';
import { gatePassesState } from '../../state/atoms';

const WardenDashboard = () => {
    const [requests, setRequests] = useRecoilState(gatePassesState);
    const [rejectionReason, setRejectionReason] = useState(''); // State for rejection reason
    const [currentRequestId, setCurrentRequestId] = useState(null); // Track the request ID being rejected

    useEffect(() => {
        const fetchRequests = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await axios.get('http://localhost:5000/api/gatepasses/pending', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setRequests(response.data);
            } catch (error) {
                console.error('Error fetching gate passes:', error.response.data);
            }
        };

        fetchRequests();
    }, [setRequests]);

    const handleApprove = async (id) => {
        const token = localStorage.getItem('token');
        try {
            await axios.patch(`http://localhost:5000/api/gatepasses/${id}/status`, {
                status: 'Approved',
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            window.location.reload(); // Reload to reflect changes
        } catch (error) {
            console.error('Error approving gate pass:', error.response.data);
        }
    };

    const handleReject = (id) => {
        setCurrentRequestId(id); // Set the current request ID
        setRejectionReason(''); // Reset the rejection reason field
    };

    const submitRejection = async () => {
        const token = localStorage.getItem('token');
        try {
            await axios.patch(`http://localhost:5000/api/gatepasses/${currentRequestId}/status`, {
                status: 'Rejected',
                rejectionReason: rejectionReason // Use the state variable for rejection reason
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRequests((prevRequests) => prevRequests.filter(request => request._id !== currentRequestId)); // Remove the rejected request from state
            setCurrentRequestId(null); // Clear the current request ID
        } catch (error) {
            console.error('Error rejecting gate pass:', error.response.data);
        }
    };

    return (
        <div>
            <h2>Warden Dashboard</h2>
            <h3>Pending Gate Pass Requests</h3>
            <ul>
                {requests.length === 0 ? (
                    <p>No pending requests found.</p>
                ) : (
                    requests.map((request) => (
                        <li key={request._id}>
                            <p>Student: {request.user ? request.user.name : 'Unknown'}</p>
                            <p>Destination: {request.destination}</p>
                            <p>Reason: {request.reason}</p>
                            <p>Status: {request.status}</p>
                            <button onClick={() => handleApprove(request._id)}>Approve</button>
                            <button onClick={() => handleReject(request._id)}>Reject</button>
                            {/* Render rejection input if this request is currently selected for rejection */}
                            {currentRequestId === request._id && (
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Enter rejection reason"
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        required
                                    />
                                    <button onClick={submitRejection}>Submit Rejection</button>
                                    <button onClick={() => setCurrentRequestId(null)}>Cancel</button>
                                </div>
                            )}
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
};

export default WardenDashboard;
