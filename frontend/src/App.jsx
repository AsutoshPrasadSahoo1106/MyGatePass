// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage/HomePage';
import StudentLogin from './pages/StudentLogin/StudentLogin';
import StudentRegister from './pages/StudentRegister/StudentResister';
import WardenLogin from './pages/WardenLogin/WardenLogin';
import WardenRegister from './pages/WardenRegister/WardenRegister';
import GuardLogin from './pages/GuardLogin/GaurdLogin';
import GuardRegister from './pages/GuardRegister/GaurdRegister';
import StudentDashboard from './pages/StudentDashboard/StudentDashboard';
import WardenDashboard from './pages/WardenDashboard/WardenDashboard';
import GuardDashboard from './pages/GaurdDashboard/GaurdDashboard';
import History from './pages/History/History';
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
    return (
        <Router>
            
            <Routes>
                {/* Home Page */}
                <Route path="/" element={<HomePage />} />
                <Route path="/History" element={<History />}/>
                
                {/* Student Routes */}
                <Route path="/student/login" element={<StudentLogin />} />
                <Route path="/student/signup" element={<StudentRegister />} />
                <Route path="/student/dashboard" element={<StudentDashboard />} />
                
                {/* Warden Routes */}
                <Route path="/warden/login" element={<WardenLogin />} />
                <Route path="/warden/signup" element={<WardenRegister />} />
                <Route path="/warden/dashboard" element={<WardenDashboard />} />
                
                {/* Guard Routes */}
                <Route path="/guard/login" element={<GuardLogin />} />
                <Route path="/guard/signup" element={<GuardRegister />} />
                <Route path="/guard/dashboard" element={<GuardDashboard />} />
            </Routes>
        </Router>
    );
};

export default App;
