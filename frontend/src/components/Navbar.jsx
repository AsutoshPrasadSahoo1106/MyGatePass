import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    return (
        <nav className="navbar">
            <h1>Gate Pass System</h1>
            <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/student/login">Student Login</Link></li>
                <li><Link to="/warden/login">Warden Login</Link></li>
                <li><Link to="/guard/login">Guard Login</Link></li>
            </ul>
        </nav>
    );
};

export default Navbar;
