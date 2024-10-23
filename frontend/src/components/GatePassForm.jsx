import React, { useState } from 'react';
import axios from 'axios';

const GatePassForm = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        destination: '',
        reason: '',
        date: '',
        outTime: '',
        returnTime: '',
        passType: 'Day Out', // Default value
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        // Combine date with time to create Date objects
        const date = new Date(formData.date);
        const outTime = new Date(date.setHours(...formData.outTime.split(':')));
        const returnTime = new Date(date.setHours(...formData.returnTime.split(':')));

        try {
            const response = await axios.post('http://localhost:5000/api/gatepasses', {
                destination: formData.destination,
                reason: formData.reason,
                date: date.toISOString(), // Send the date in ISO format
                outTime: outTime.toISOString(),
                returnTime: returnTime.toISOString(),
                passType: formData.passType,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            console.log('Gate pass applied:', response.data);
            onSuccess(); // Call the success callback
            onClose(); // Close the form after successful submission
        } catch (error) {
            console.error('Error applying for gate pass:', error.response.data);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Apply for New Gate Pass</h2>
            <input
                type="text"
                name="destination"
                placeholder="Destination"
                value={formData.destination}
                onChange={handleChange}
                required
            />
            <input
                type="text"
                name="reason"
                placeholder="Reason"
                value={formData.reason}
                onChange={handleChange}
                required
            />
            <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
            />
            <input
                type="time"
                name="outTime"
                value={formData.outTime}
                onChange={handleChange}
                required
            />
            <input
                type="time"
                name="returnTime"
                value={formData.returnTime}
                onChange={handleChange}
                required
            />
            <select name="passType" value={formData.passType} onChange={handleChange}>
                <option value="Day Out">Day Out</option>
                <option value="Night Out">Night Out</option>
            </select>
            <button type="submit">Submit</button>
            <button type="button" onClick={onClose}>Cancel</button>
        </form>
    );
};

export default GatePassForm;
