import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUserGraduate, faUserShield, faUser } from '@fortawesome/free-solid-svg-icons';
import './Header.css'; // Import custom CSS for the header

const Header = () => {
    const navigate = useNavigate();

    return (
        <header className="header-container">
            <div className="header-left">
                <FontAwesomeIcon 
                    icon={faHome} 
                    className="header-icon" 
                    onClick={() => navigate('/')} 
                    title="Home" 
                    aria-label="Home" 
                />
            </div>
            <div className="header-center">
                Gate Pass Management System
            </div>
            <div className="header-right">
                <span className="header-link" onClick={() => navigate('/student/login')}>
                    <FontAwesomeIcon icon={faUserGraduate} /> Student
                </span>
                <span className="header-link" onClick={() => navigate('/warden/login')}>
                    <FontAwesomeIcon icon={faUserShield} /> Warden
                </span>
                <span className="header-link" onClick={() => navigate('/guard/login')}>
                    <FontAwesomeIcon icon={faUser} /> Guard
                </span>
            </div>
        </header>
    );
};

export default Header;
