// src/components/StudentLogin.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './StudentLogin.css'; // Import custom CSS
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import React Toastify CSS
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png'; // Ensure this path is correct based on your project structure
import Header from '../../components/Header';

const StudentLogin = () => {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({
        email: '',
        password: '',
        role: 'student'
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // State for password visibility

    useEffect(() => {
        // Auto-focus on the email input when component mounts
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.focus();
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials({ ...credentials, [name]: value });

        // Remove error message as user types
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const validate = () => {
        let tempErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(credentials.email)) {
            tempErrors.email = 'Valid Email is required';
        }

        if (credentials.password.length < 6) {
            tempErrors.password = 'Password must be at least 6 characters';
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
        try {
            const response = await axios.post(`http://localhost:5000/api/users/login`, credentials); // Updated API endpoint
            localStorage.setItem('token', response.data.token); // Store token securely
            localStorage.setItem('userRole', response.data.user.role); // Store user role in local storage
            toast.success('Login successful! Redirecting to dashboard...');
            setTimeout(() => {
                navigate('/student/dashboard'); // Redirect to student dashboard
            }, 3000);
        } catch (error) {
            console.error(error.response.data);
            toast.error(error.response.data.message || 'Login failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <>
        <Header />
        <div className="login-container">
            <ToastContainer />
            <form className="login-form" onSubmit={handleSubmit} noValidate>
                <div className="text-center mb-4">
                    <img src={logo} alt="Hostel Gate Pass Management System Logo" className="logo circular-logo" />
                </div>
                <h2 className="mb-4 text-center">Student Login</h2>

                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email Address</label>
                    <input 
                        type="email" 
                        className={`form-control ${errors.email ? 'is-invalid' : ''}`} 
                        id="email" 
                        name="email" 
                        placeholder="Enter your email" 
                        value={credentials.email} 
                        onChange={handleChange} 
                        required 
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>

                <div className="mb-4">
                    <label htmlFor="password" className="form-label">Password</label>
                    <div className="input-group">
                        <input 
                            type={showPassword ? "text" : "password"} 
                            className={`form-control ${errors.password ? 'is-invalid' : ''}`} 
                            id="password" 
                            name="password" 
                            placeholder="Enter your password" 
                            value={credentials.password} 
                            onChange={handleChange} 
                            required 
                        />
                        <button type="button" className="btn btn-outline-secondary" onClick={togglePasswordVisibility}>
                            {showPassword ? 'Hide' : 'Show'}
                        </button>
                        {errors.password && <div className="invalid-feedback d-block">{errors.password}</div>}
                    </div>
                </div>

                <button type="submit" className="btn btn-danger w-100" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            &nbsp; Logging in...
                        </>
                    ) : (
                        'Login'
                    )}
                </button>

                <p className="mt-3 text-center">
                    Don't have an account? <a href="/student/signup">Register here</a>
                </p>
            </form>
        </div>
        </>
    );
};

export default StudentLogin;
