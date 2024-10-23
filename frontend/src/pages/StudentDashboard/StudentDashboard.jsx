import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRecoilState } from 'recoil';
import { 
    gatePassesState, 
    gatePassesLoadingState, 
    gatePassesErrorState 
} from '../../state/atoms';
import GatePassForm from '../../components/GatePassForm'; // Import the new component

const StudentDashboard = () => {
    const [gatePasses, setGatePasses] = useRecoilState(gatePassesState);
    const [loading, setLoading] = useRecoilState(gatePassesLoadingState);
    const [error, setError] = useRecoilState(gatePassesErrorState);
    const [showForm, setShowForm] = useState(false); // State to control the form visibility

    useEffect(() => {
        fetchGatePasses(); // Fetch gate passes when the component mounts
    }, []);

    const fetchGatePasses = async () => {
        setLoading(true); // Start loading
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`http://localhost:5000/api/gatepasses/user`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setGatePasses(response.data);
            setError(null); // Clear any previous errors
        } catch (error) {
            console.error(error.response ? error.response.data : error.message);
            setError(error.response?.data?.message || 'Failed to fetch gate passes.');
        } finally {
            setLoading(false); // End loading
        }
    };

    const toggleForm = () => {
        setShowForm(!showForm); // Toggle form visibility
    };

    const handleFormSuccess = () => {
        fetchGatePasses(); // Refetch gate passes after successfully applying for a new gate pass
    };

    if (loading) return <div>Loading gate passes...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h2>Student Dashboard</h2>
            <h3>Your Gate Passes</h3>
            {gatePasses.length === 0 ? (
                <p>No gate passes found.</p>
            ) : (
                <ul>
                    {gatePasses.map((pass) => (
                        <li key={pass._id}>
                            <p>Destination: {pass.destination}</p>
                            <p>Reason: {pass.reason}</p>
                            <p>Status: {pass.status}</p>
                            <p>Date: {new Date(pass.date).toLocaleDateString()}</p>
                            <p>Out Time: {new Date(pass.outTime).toLocaleTimeString()}</p>
                            <p>Return Time: {new Date(pass.returnTime).toLocaleTimeString()}</p>
                        </li>
                    ))}
                </ul>
            )}
            <button onClick={toggleForm}>Apply for New Gate Pass</button>

            {/* Render the GatePassForm component if showForm is true */}
            {showForm && <GatePassForm onClose={toggleForm} onSuccess={handleFormSuccess} />}
        </div>
    );
};

export default StudentDashboard;
