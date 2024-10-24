// src/components/WardenDashboard.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRecoilState } from 'recoil';
import { gatePassesState } from '../../state/atoms';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import './WardenDashboard.css'; // Import custom CSS
import { toast } from 'react-toastify';
import ModalRejection from '../../components/ModalRejection';

const WardenDashboard = () => {
    const [requests, setRequests] = useRecoilState(gatePassesState);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [currentRequestId, setCurrentRequestId] = useState(null);

    useEffect(() => {
        fetchRequests();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`http://localhost:5000/api/gatepasses/pending`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRequests(response.data);
            setError(null);
        } catch (error) {
            console.error('Error fetching gate passes:', error.response?.data || error.message);
            setError(error.response?.data?.message || 'Failed to fetch gate passes.');
            toast.error(error.response?.data?.message || 'Failed to fetch gate passes.');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        const token = localStorage.getItem('token');
        try {
            await axios.patch(`http://localhost:5000/api/gatepasses/${id}/status`, {
                status: 'Approved',
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Gate pass approved successfully!');
            setRequests((prevRequests) => prevRequests.filter(request => request._id !== id));
        } catch (error) {
            console.error('Error approving gate pass:', error.response?.data || error.message);
            toast.error(error.response?.data?.message || 'Failed to approve gate pass.');
        }
    };

    const handleReject = (id) => {
        setCurrentRequestId(id);
        setShowModal(true);
    };

    const submitRejection = async (reason) => {
        const token = localStorage.getItem('token');
        try {
            await axios.patch(`http://localhost:5000/api/gatepasses/${currentRequestId}/status`, {
                status: 'Rejected',
                rejectionReason: reason
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Gate pass rejected successfully!');
            setRequests((prevRequests) => prevRequests.filter(request => request._id !== currentRequestId));
            setCurrentRequestId(null);
            setShowModal(false);
        } catch (error) {
            console.error('Error rejecting gate pass:', error.response?.data || error.message);
            toast.error(error.response?.data?.message || 'Failed to reject gate pass.');
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setCurrentRequestId(null);
    };

    if (loading) return <div className="loading">Loading pending gate pass requests...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="dashboard-container">
            <h2 className="mb-4">Warden Dashboard</h2>
            <h4 className="mb-3">Pending Gate Pass Requests</h4>
            {requests.length === 0 ? (
                <p>No pending requests found.</p>
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
                            {requests.map((request, index) => (
                                <tr key={request._id}>
                                    <td>{index + 1}</td>
                                    <td>{request.user ? request.user.name : 'Unknown'}</td>
                                    <td>{request.destination}</td>
                                    <td>{request.reason}</td>
                                    <td>{new Date(request.date).toLocaleDateString()}</td>
                                    <td>{new Date(request.outTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                    <td>{new Date(request.returnTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                    <td>
                                        <button 
                                            className="btn btn-success btn-sm me-2" 
                                            onClick={() => handleApprove(request._id)}
                                            aria-label={`Approve request ${index + 1}`}
                                        >
                                            <FontAwesomeIcon icon={faCheckCircle} /> Approve
                                        </button>
                                        <button 
                                            className="btn btn-danger btn-sm" 
                                            onClick={() => handleReject(request._id)}
                                            aria-label={`Reject request ${index + 1}`}
                                        >
                                            <FontAwesomeIcon icon={faTimesCircle} /> Reject
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal for Rejection Reason */}
            <ModalRejection 
                show={showModal} 
                onClose={closeModal} 
                onSubmit={submitRejection} 
            />
        </div>
    );
};

export default WardenDashboard;
