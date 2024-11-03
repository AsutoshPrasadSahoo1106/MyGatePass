// src/components/ModalRejection.js

import React, { useState } from 'react';
import './ModalRejection.css'; // Import custom CSS for the modal
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const ModalRejection = ({ show, onClose, onSubmit }) => {
    const [reason, setReason] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (reason.trim() === '') {
            alert('Please provide a rejection reason.');
            return;
        }
        onSubmit(reason);
        setReason('');
    };

    if (!show) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" style={{ backgroundColor: 'rgb(211, 211, 211)' }} onClick={(e) => e.stopPropagation()}>
                <button className="close-button" onClick={onClose} aria-label="Close modal">
                    <FontAwesomeIcon icon={faTimes} />
                </button>
                <h4>Rejection Reason</h4>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <textarea
                            className="form-control"
                            placeholder="Enter reason for rejection"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows="4"
                            required
                        ></textarea>
                    </div>
                    <button type="submit" className="btn btn-danger">Submit</button>
                    <button type="button" className="btn btn-secondary ms-2" onClick={onClose}>Cancel</button>
                </form>
            </div>
        </div>
    );
};

export default ModalRejection;
