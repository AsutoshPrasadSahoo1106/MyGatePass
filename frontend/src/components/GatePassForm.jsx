// src/components/GatePassForm.js

import React, { useState } from 'react';
import axios from 'axios';
import './GatePassForm.css'; // Import custom CSS
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const GatePassForm = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        destination: '',
        reason: '',
        date: '',
        outTime: '',
        returnTime: '',
        passType: 'Day Out', // Default value
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Remove error message as user types
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const validate = () => {
        let tempErrors = {};
        const { destination, reason, date, outTime, returnTime, passType } = formData;

        if (!destination.trim()) tempErrors.destination = 'Destination is required.';
        if (!reason.trim()) tempErrors.reason = 'Reason is required.';
        if (!date) tempErrors.date = 'Date is required.';
        if (!outTime) tempErrors.outTime = 'Out Time is required.';
        if (!returnTime) tempErrors.returnTime = 'Return Time is required.';
        if (!passType) tempErrors.passType = 'Pass Type is required.';

        // Ensure return time is after out time
        if (outTime && returnTime) {
            const outDate = new Date(`${date}T${outTime}`);
            const returnDate = new Date(`${date}T${returnTime}`);
            if (returnDate <= outDate) {
                tempErrors.returnTime = 'Return Time must be after Out Time.';
            }
        }

        setErrors(tempErrors);

        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) {
            toast.error('Please fix the errors in the form.');
            return;
        }

        setIsSubmitting(true);
        const token = localStorage.getItem('token');

        // Combine date with time to create ISO strings
        const outDateTime = new Date(`${formData.date}T${formData.outTime}`);
        const returnDateTime = new Date(`${formData.date}T${formData.returnTime}`);

        try {
            const response = await axios.post(
                `http://localhost:5000/api/gatepasses`,
                {
                    destination: formData.destination,
                    reason: formData.reason,
                    date: outDateTime.toISOString(),
                    outTime: outDateTime.toISOString(),
                    returnTime: returnDateTime.toISOString(),
                    passType: formData.passType,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            toast.success('Gate pass applied successfully!');
            onSuccess(); // Callback to refresh gate passes
            onClose(); // Close the modal
        } catch (error) {
            console.error('Error applying for gate pass:', error.response ? error.response.data : error.message);
            toast.error(error.response?.data?.message || 'Failed to apply for gate pass.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay">
            <ToastContainer />
            <div className="modal-content">
                <button className="close-button" onClick={onClose}>
                    &times;
                </button>
                <h2>Apply for New Gate Pass</h2>
                <form onSubmit={handleSubmit} noValidate>
                    <div className="mb-3">
                        <label htmlFor="destination" className="form-label">Destination</label>
                        <input
                            type="text"
                            className={`form-control ${errors.destination ? 'is-invalid' : ''}`}
                            id="destination"
                            name="destination"
                            placeholder="Enter destination"
                            value={formData.destination}
                            onChange={handleChange}
                            required
                        />
                        {errors.destination && <div className="invalid-feedback">{errors.destination}</div>}
                    </div>

                    <div className="mb-3">
                        <label htmlFor="reason" className="form-label">Reason</label>
                        <input
                            type="text"
                            className={`form-control ${errors.reason ? 'is-invalid' : ''}`}
                            id="reason"
                            name="reason"
                            placeholder="Enter reason"
                            value={formData.reason}
                            onChange={handleChange}
                            required
                        />
                        {errors.reason && <div className="invalid-feedback">{errors.reason}</div>}
                    </div>

                    <div className="mb-3">
                        <label htmlFor="date" className="form-label">Date</label>
                        <input
                            type="date"
                            className={`form-control ${errors.date ? 'is-invalid' : ''}`}
                            id="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            required
                        />
                        {errors.date && <div className="invalid-feedback">{errors.date}</div>}
                    </div>

                    <div className="mb-3">
                        <label htmlFor="outTime" className="form-label">Out Time</label>
                        <input
                            type="time"
                            className={`form-control ${errors.outTime ? 'is-invalid' : ''}`}
                            id="outTime"
                            name="outTime"
                            value={formData.outTime}
                            onChange={handleChange}
                            required
                        />
                        {errors.outTime && <div className="invalid-feedback">{errors.outTime}</div>}
                    </div>

                    <div className="mb-3">
                        <label htmlFor="returnTime" className="form-label">Return Time</label>
                        <input
                            type="time"
                            className={`form-control ${errors.returnTime ? 'is-invalid' : ''}`}
                            id="returnTime"
                            name="returnTime"
                            value={formData.returnTime}
                            onChange={handleChange}
                            required
                        />
                        {errors.returnTime && <div className="invalid-feedback">{errors.returnTime}</div>}
                    </div>

                    <div className="mb-4">
                        <label htmlFor="passType" className="form-label">Pass Type</label>
                        <select
                            className={`form-select ${errors.passType ? 'is-invalid' : ''}`}
                            id="passType"
                            name="passType"
                            value={formData.passType}
                            onChange={handleChange}
                            required
                        >
                            <option value="Day Out">Day Out</option>
                            <option value="Night Out">Night Out</option>
                        </select>
                        {errors.passType && <div className="invalid-feedback">{errors.passType}</div>}
                    </div>

                    <button type="submit" className="btn btn-primary w-100" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                &nbsp; Submitting...
                            </>
                        ) : (
                            'Submit'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default GatePassForm;
