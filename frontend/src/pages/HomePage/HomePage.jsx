import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css'; // Ensure your CSS styles are in this file
import { FaUserGraduate, FaUserShield, FaUserLock } from 'react-icons/fa'; // Importing icons
import logo from '../../assets/logo.png'; // Adjust the path based on your project structure

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="background min-vh-100 d-flex align-items-center">
      <div className="container py-5">
        {/* Logo Section */}
        <div className="text-center mb-4">
          <img
            src={logo}
            alt="Hostel Gate Pass Management System Logo"
            className="logo circular-logo"
          />
        </div>

        {/* Heading */}
        <h1 className="text-center display-4 mb-5 text-white">Hostel Gate Pass Management System</h1>

        {/* Flex Container for Cards */}
        <div className="row justify-content-center">
          {/* Student Card */}
          <div className="card custom-card col-md-3 m-3 shadow-lg">
            <div className="card-body text-center">
              <FaUserGraduate size={50} className="mb-3 text-primary" />
              <h2 className="card-title mb-4">Student</h2>
              <button className="btn btn-primary w-100 mb-2" onClick={() => navigate('/student/login')}>
                Student Login
              </button>
              <button className="btn btn-outline-primary w-100" onClick={() => navigate('/student/signup')}>
                Student Register
              </button>
            </div>
          </div>

          {/* Warden Card */}
          <div className="card custom-card col-md-3 m-3 shadow-lg">
            <div className="card-body text-center">
              <FaUserShield size={50} className="mb-3 text-warning" />
              <h2 className="card-title mb-4">Warden</h2>
              <button className="btn btn-warning w-100 mb-2" onClick={() => navigate('/warden/login')}>
                Warden Login
              </button>
              <button className="btn btn-outline-warning w-100" onClick={() => navigate('/warden/signup')}>
                Warden Register
              </button>
            </div>
          </div>

          {/* Guard Card */}
          <div className="card custom-card col-md-3 m-3 shadow-lg">
            <div className="card-body text-center">
              <FaUserLock size={50} className="mb-3 text-success" />
              <h2 className="card-title mb-4">Guard</h2>
              <button className="btn btn-success w-100 mb-2" onClick={() => navigate('/guard/login')}>
                Guard Login
              </button>
              <button className="btn btn-outline-success w-100" onClick={() => navigate('/guard/signup')}>
                Guard Register
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
