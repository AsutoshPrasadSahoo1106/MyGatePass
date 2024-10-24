// src/components/GuardRegister.js

import React, { useState } from 'react';
import axios from 'axios';
import './GaurdRegister.css'; // Import custom CSS
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import React Toastify CSS
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';

const GuardRegister = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        employeeId: '',
        phoneNo: '',
        password: '',
        hostel: '',
        role: 'guard',
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // State for password visibility

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
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[0-9]{10}$/;

        if (!formData.name.trim()) tempErrors.name = 'Name is required.';
        if (!emailRegex.test(formData.email)) tempErrors.email = 'Valid Email is required.';
        if (!formData.employeeId.trim()) tempErrors.employeeId = 'Employee ID is required.';
        if (!phoneRegex.test(formData.phoneNo)) tempErrors.phoneNo = 'Valid Phone Number is required.';
        if (formData.password.length < 6) tempErrors.password = 'Password must be at least 6 characters.';
        if (!formData.hostel.trim()) tempErrors.hostel = 'Hostel is required.';

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
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/users/register`, formData);
            toast.success('Registration successful! Redirecting to login...');
            setTimeout(() => {
                navigate('/guard/login');
            }, 3000);
        } catch (error) {
            console.error(error.response?.data || error.message);
            toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="register-container">
            <ToastContainer />
            <form className="register-form" onSubmit={handleSubmit} noValidate>
                <div className="text-center mb-4">
                    <img src={logo} alt="Hostel Gate Pass Management System Logo" className="logo circular-logo" />
                </div>
                <h2 className="mb-4 text-center">Guard Registration</h2>

                <div className="mb-3">
                    <label htmlFor="name" className="form-label">Name</label>
                    <input 
                        type="text" 
                        className={`form-control ${errors.name ? 'is-invalid' : ''}`} 
                        id="name" 
                        name="name" 
                        placeholder="Enter your name" 
                        value={formData.name} 
                        onChange={handleChange} 
                        required 
                    />
                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>

                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email Address</label>
                    <input 
                        type="email" 
                        className={`form-control ${errors.email ? 'is-invalid' : ''}`} 
                        id="email" 
                        name="email" 
                        placeholder="Enter your email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        required 
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>

                <div className="mb-3">
                    <label htmlFor="employeeId" className="form-label">Employee ID</label>
                    <input 
                        type="text" 
                        className={`form-control ${errors.employeeId ? 'is-invalid' : ''}`} 
                        id="employeeId" 
                        name="employeeId" 
                        placeholder="Enter your Employee ID" 
                        value={formData.employeeId} 
                        onChange={handleChange} 
                        required 
                    />
                    {errors.employeeId && <div className="invalid-feedback">{errors.employeeId}</div>}
                </div>

                <div className="mb-3">
                    <label htmlFor="phoneNo" className="form-label">Phone Number</label>
                    <input 
                        type="text" 
                        className={`form-control ${errors.phoneNo ? 'is-invalid' : ''}`} 
                        id="phoneNo" 
                        name="phoneNo" 
                        placeholder="Enter your phone number" 
                        value={formData.phoneNo} 
                        onChange={handleChange} 
                        required 
                    />
                    {errors.phoneNo && <div className="invalid-feedback">{errors.phoneNo}</div>}
                </div>

                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <div className="input-group">
                        <input 
                            type={showPassword ? "text" : "password"} 
                            className={`form-control ${errors.password ? 'is-invalid' : ''}`} 
                            id="password" 
                            name="password" 
                            placeholder="Create a password" 
                            value={formData.password} 
                            onChange={handleChange} 
                            required 
                        />
                        <button type="button" className="btn btn-outline-secondary" onClick={togglePasswordVisibility} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                            {showPassword ? 'Hide' : 'Show'}
                        </button>
                        {errors.password && <div className="invalid-feedback d-block">{errors.password}</div>}
                    </div>
                </div>

                <div className="mb-3">
                    <label htmlFor="hostel" className="form-label">Hostel</label>
                    <input 
                        type="text" 
                        className={`form-control ${errors.hostel ? 'is-invalid' : ''}`} 
                        id="hostel" 
                        name="hostel" 
                        placeholder="Enter your hostel name" 
                        value={formData.hostel} 
                        onChange={handleChange} 
                        required 
                    />
                    {errors.hostel && <div className="invalid-feedback">{errors.hostel}</div>}
                </div>

                <button type="submit" className="btn btn-primary w-100" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            &nbsp; Registering...
                        </>
                    ) : (
                        'Register'
                    )}
                </button>

                <p className="mt-3 text-center">
                    Already have an account? <a href="/guard/login">Login here</a>
                </p>
            </form>
        </div>
    );

};

export default GuardRegister;
