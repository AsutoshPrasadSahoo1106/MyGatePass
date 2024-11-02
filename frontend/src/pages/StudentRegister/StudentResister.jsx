import React, { useState } from 'react';
import axios from 'axios';
import './StudentRegister.css'; // Import custom CSS
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import React Toastify CSS
import Header from '../../components/Header';

const StudentRegister = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phoneNo: '',
        password: '',
        uid: '',
        fatherName: '',
        motherName: '',
        fphoneNo: '',
        mphoneNo: '',
        hostel: '',
        roomNo: '',
        gender: 'Male',
        role: 'student',
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
        const phoneRegex = /^[0-9]{10}$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formData.name.trim()) tempErrors.name = 'Full Name is required';
        if (!emailRegex.test(formData.email)) tempErrors.email = 'Valid Email is required';
        if (!phoneRegex.test(formData.phoneNo)) tempErrors.phoneNo = 'Valid Phone Number is required';
        if (formData.password.length < 6) tempErrors.password = 'Password must be at least 6 characters';
        if (!formData.uid.trim()) tempErrors.uid = 'User ID is required';
        if (!formData.fatherName.trim()) tempErrors.fatherName = "Father's Name is required";
        if (!formData.motherName.trim()) tempErrors.motherName = "Mother's Name is required";
        if (!phoneRegex.test(formData.fphoneNo)) tempErrors.fphoneNo = "Valid Father's Phone is required";
        if (!phoneRegex.test(formData.mphoneNo)) tempErrors.mphoneNo = "Valid Mother's Phone is required";
        if (!formData.hostel.trim()) tempErrors.hostel = 'Hostel is required';
        if (!formData.roomNo.trim()) tempErrors.roomNo = 'Room Number is required';

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
                window.location.href = '/student/login';
            }, 3000);
        } catch (error) {
            console.error(error.response.data);
            toast.error(error.response.data.message || 'Registration failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <>
        <Header></Header>
        <div className="register-container">
            <ToastContainer />
            <form className="register-form" onSubmit={handleSubmit} noValidate>
                <h2 className="mb-4">Student Registration</h2>
                
                <div className="mb-3">
                    <label htmlFor="name" className="form-label">Full Name</label>
                    <input 
                        type="text" 
                        className={`form-control ${errors.name ? 'is-invalid' : ''}`} 
                        id="name" 
                        name="name" 
                        placeholder="Enter your full name" 
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
                        <button type="button" className="btn btn-outline-secondary" onClick={togglePasswordVisibility}>
                            {showPassword ? 'Hide' : 'Show'}
                        </button>
                        {errors.password && <div className="invalid-feedback d-block">{errors.password}</div>}
                    </div>
                </div>

                <div className="mb-3">
                    <label htmlFor="uid" className="form-label">User ID</label>
                    <input 
                        type="text" 
                        className={`form-control ${errors.uid ? 'is-invalid' : ''}`} 
                        id="uid" 
                        name="uid" 
                        placeholder="Enter your user ID" 
                        value={formData.uid} 
                        onChange={handleChange} 
                        required 
                    />
                    {errors.uid && <div className="invalid-feedback">{errors.uid}</div>}
                </div>

                <div className="mb-3">
                    <label htmlFor="fatherName" className="form-label">Father's Name</label>
                    <input 
                        type="text" 
                        className={`form-control ${errors.fatherName ? 'is-invalid' : ''}`} 
                        id="fatherName" 
                        name="fatherName" 
                        placeholder="Enter your father's name" 
                        value={formData.fatherName} 
                        onChange={handleChange} 
                        required 
                    />
                    {errors.fatherName && <div className="invalid-feedback">{errors.fatherName}</div>}
                </div>

                <div className="mb-3">
                    <label htmlFor="motherName" className="form-label">Mother's Name</label>
                    <input 
                        type="text" 
                        className={`form-control ${errors.motherName ? 'is-invalid' : ''}`} 
                        id="motherName" 
                        name="motherName" 
                        placeholder="Enter your mother's name" 
                        value={formData.motherName} 
                        onChange={handleChange} 
                        required 
                    />
                    {errors.motherName && <div className="invalid-feedback">{errors.motherName}</div>}
                </div>

                <div className="mb-3">
                    <label htmlFor="fphoneNo" className="form-label">Father's Phone Number</label>
                    <input 
                        type="text" 
                        className={`form-control ${errors.fphoneNo ? 'is-invalid' : ''}`} 
                        id="fphoneNo" 
                        name="fphoneNo" 
                        placeholder="Enter your father's phone number" 
                        value={formData.fphoneNo} 
                        onChange={handleChange} 
                        required 
                    />
                    {errors.fphoneNo && <div className="invalid-feedback">{errors.fphoneNo}</div>}
                </div>

                <div className="mb-3">
                    <label htmlFor="mphoneNo" className="form-label">Mother's Phone Number</label>
                    <input 
                        type="text" 
                        className={`form-control ${errors.mphoneNo ? 'is-invalid' : ''}`} 
                        id="mphoneNo" 
                        name="mphoneNo" 
                        placeholder="Enter your mother's phone number" 
                        value={formData.mphoneNo} 
                        onChange={handleChange} 
                        required 
                    />
                    {errors.mphoneNo && <div className="invalid-feedback">{errors.mphoneNo}</div>}
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

                <div className="mb-4">
                    <label htmlFor="roomNo" className="form-label">Room Number</label>
                    <input 
                        type="text" 
                        className={`form-control ${errors.roomNo ? 'is-invalid' : ''}`} 
                        id="roomNo" 
                        name="roomNo" 
                        placeholder="Enter your room number" 
                        value={formData.roomNo} 
                        onChange={handleChange} 
                        required 
                    />
                    {errors.roomNo && <div className="invalid-feedback">{errors.roomNo}</div>}
                </div>

                <div className="mb-4">
                    <label htmlFor="gender" className="form-label">Gender</label>
                    <select 
                        className="form-select" 
                        id="gender" 
                        name="gender" 
                        value={formData.gender} 
                        onChange={handleChange} 
                        required
                    >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
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
                    Already have an account? <a href="/student/login">Login here</a>
                </p>
            </form>
        </div>
        </>
    );
};

export default StudentRegister;
