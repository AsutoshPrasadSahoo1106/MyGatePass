// src/components/OTPModal.js

import React, { useState } from 'react';
import './OTPModal.css'; // Import custom CSS for the modal
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const OTPModal = ({ show, onClose, onSubmit, isVerifyingOtp, action }) => {
    const [otp, setOtp] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (otp.length !== 6) {
            alert('Please enter a valid 6-digit OTP.');
            return;
        }
        onSubmit(otp);
        setOtp('');
    };

    if (!show) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" style={{ backgroundColor: 'rgb(211, 211, 211)' }} onClick={(e) => e.stopPropagation()}>
                <button className="close-button" onClick={onClose} aria-label="Close modal">
                    <FontAwesomeIcon icon={faTimes} />
                </button>
                <h4>{action === 'in' ? 'Verify OTP for Entry' : 'Verify OTP for Exit'}</h4>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Enter 6-digit OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            maxLength="6"
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100" disabled={isVerifyingOtp}>
                        {isVerifyingOtp ? 'Verifying OTP...' : 'Verify'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default OTPModal;
