import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="background">
      <div className="container">
        <div className="profileContainer">
          <img
            src="https://i.pinimg.com/originals/f5/98/ee/f598ee10179fe7a47ffea40ce625b21d.png"
            alt="Profile"
            className="profileImage"
          />
          <h1 className="headerText">Hostel Gate Pass Management System</h1>
        </div>

        {/* Student Section */}
        <div className="card">
          <h2 className="cardTitle">Student</h2>
          <button className="button" onClick={() => navigate('/student/login')}>
            Student Login
          </button>
          <button className="button" onClick={() => navigate('/student/signup')}>
            Student Register
          </button>
        </div>

        {/* Warden Section */}
        <div className="card">
          <h2 className="cardTitle">Warden</h2>
          <button className="button" onClick={() => navigate('/warden/login')}>
            Warden Login
          </button>
          <button className="button" onClick={() => navigate('/warden/signup')}>
            Warden Register
          </button>
        </div>

        {/* Guard Section */}
        <div className="card">
          <h2 className="cardTitle">Guard</h2>
          <button className="button" onClick={() => navigate('/guard/login')}>
            Guard Login
          </button>
          <button className="button" onClick={() => navigate('/guard/signup')}>
            Guard Register
          </button>
        </div>
      </div>
    </div>
  );
}
