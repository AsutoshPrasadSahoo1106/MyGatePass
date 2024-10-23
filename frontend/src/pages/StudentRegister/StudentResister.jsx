import React, { useState } from 'react';
import axios from 'axios';

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
        role: 'student', // Automatically set to 'student'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/users/register', formData);
            window.location.href = '/student/login'; // Redirect to login
        } catch (error) {
            console.error(error.response.data);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Student Registration</h2>
            <input type="text" name="name" placeholder="Full Name" onChange={handleChange} required />
            <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
            <input type="text" name="phoneNo" placeholder="Phone Number" onChange={handleChange} required />
            <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
            <input type="text" name="uid" placeholder="User ID" onChange={handleChange} required />
            <input type="text" name="fatherName" placeholder="Father's Name" onChange={handleChange} required />
            <input type="text" name="motherName" placeholder="Mother's Name" onChange={handleChange} required />
            <input type="text" name="fphoneNo" placeholder="Father's Phone" onChange={handleChange} required />
            <input type="text" name="mphoneNo" placeholder="Mother's Phone" onChange={handleChange} required />
            <input type="text" name="hostel" placeholder="Hostel" onChange={handleChange} required />
            <input type="text" name="roomNo" placeholder="Room Number" onChange={handleChange} required />
            <select name="gender" onChange={handleChange} required>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
            </select>
            <button type="submit">Register</button>
        </form>
    );
};

export default StudentRegister;
