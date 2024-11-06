import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useRecoilState } from 'recoil';
import { gatePassesState } from '../../state/atoms';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faCheckCircle, 
    faTimesCircle, 
    faHome, 
    faHistory, 
    faUserCircle, 
    faSignOutAlt,
    faSearch // Import search icon
} from '@fortawesome/free-solid-svg-icons';
import './WardenDashboard.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import ModalRejection from '../../components/ModalRejection';
import _ from 'lodash';

const POLLING_INTERVAL = 10000;

const WardenDashboard = () => {
    const [requests, setRequests] = useRecoilState(gatePassesState);
    const [initialLoading, setInitialLoading] = useState(true); // Initial loading state only
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [currentRequestId, setCurrentRequestId] = useState(null);
    const [user, setUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState(""); // State for search term

    const navigate = useNavigate();

    useEffect(() => {
        fetchUserData();
        fetchInitialRequests();

        // Polling for gate pass requests
        const intervalId = setInterval(fetchRequestsOnPoll, POLLING_INTERVAL);

        // Clean up interval on component unmount
        return () => clearInterval(intervalId);
    }, []);

    const fetchUserData = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`http://localhost:5000/api/users/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(response.data);
        } catch (error) {
            console.error('Error fetching user data:', error.response?.data || error.message);
            toast.error(error.response?.data?.message || 'Failed to fetch user data.');
        }
    };

    const fetchInitialRequests = async () => {
        setInitialLoading(true);
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
            setInitialLoading(false);
        }
    };

    const fetchRequestsOnPoll = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`http://localhost:5000/api/gatepasses/pending`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const newRequests = response.data;

            // Only update the requests state if there are changes
            if (!_.isEqual(newRequests, requests)) {
                setRequests(newRequests);
            }
        } catch (error) {
            console.error('Polling error:', error.response?.data || error.message);
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

    const handleLogout = () => {
        localStorage.removeItem('token');
        toast.success('Logged out successfully.');
        navigate('/warden/login');
    };

    const navigateHome = () => {
        navigate('/');
    };

    const navigateHistory = () => {
        navigate('/history');
    };

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Filtered requests based on search term
    const filteredRequests = useMemo(() => {
        if (!searchTerm) return requests;

        const lowercasedTerm = searchTerm.toLowerCase();
        return requests.filter((request) => {
            const userName = request.user?.name?.toLowerCase() || "";
            const uid = request.user?.uid?.toLowerCase() || "";
            const roomNo = request.user?.roomNo?.toLowerCase() || "";
            const destination = request.destination?.toLowerCase() || "";
            const reason = request.reason?.toLowerCase() || "";
            const date = new Date(request.date).toLocaleDateString().toLowerCase();
            const outTime = request.outTime ? new Date(request.outTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase() : "";
            const returnTime = request.returnTime ? new Date(request.returnTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase() : "";

            return (
                userName.includes(lowercasedTerm) ||
                uid.includes(lowercasedTerm) ||
                roomNo.includes(lowercasedTerm) ||
                destination.includes(lowercasedTerm) ||
                reason.includes(lowercasedTerm) ||
                date.includes(lowercasedTerm) ||
                outTime.includes(lowercasedTerm) ||
                returnTime.includes(lowercasedTerm)
            );
        });
    }, [searchTerm, requests]);

    if (initialLoading) return <div className="loading">Loading pending gate pass requests...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="dashboard-container">
            <ToastContainer />

            <header className="dashboard-header">
                <div className="header-left">
                    <FontAwesomeIcon 
                        icon={faHome} 
                        size="lg" 
                        className="header-icon" 
                        onClick={navigateHome} 
                        title="Home" 
                        aria-label="Home" 
                    />
                    <FontAwesomeIcon 
                        icon={faHistory} 
                        size="lg" 
                        className="header-icon" 
                        onClick={navigateHistory} 
                        title="History" 
                        aria-label="History" 
                    />
                </div>
                <div className="header-center">
                    <h2>Warden Dashboard</h2>
                </div>
                <div className="header-right">
                    <div className="search-bar">
                        <FontAwesomeIcon icon={faSearch} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search requests..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            aria-label="Search gate pass requests"
                        />
                    </div>
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

            <main className="dashboard-main">
                <h2 className="mb-4">Warden Dashboard</h2>
                <h4 className="mb-3">Pending Gate Pass Requests</h4>
                {filteredRequests.length === 0 ? (
                    <p>No pending requests found.</p>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead className="table-primary">
                                <tr>
                                    <th>#</th>
                                    <th>Student Name</th>
                                    <th>UID</th>
                                    <th>Room No.</th>
                                    <th>Destination</th>
                                    <th>Reason</th>
                                    <th>Date</th>
                                    <th>Out Time</th>
                                    <th>Return Time</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRequests.map((request, index) => (
                                    <tr key={request._id}>
                                        <td>{index + 1}</td>
                                        <td>{request.user ? request.user.name : 'Unknown'}</td>
                                        <td>{request.user.uid}</td>
                                        <td>{request.user.roomNo}</td>
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
            </main>

            {showModal && (
                <ModalRejection 
                    show={showModal} 
                    onClose={closeModal} 
                    onSubmit={submitRejection} 
                />
            )}
        </div>
    );
};

export default WardenDashboard;
