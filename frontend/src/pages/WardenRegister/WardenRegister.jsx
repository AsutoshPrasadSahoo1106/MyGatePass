import React, { useState } from 'react';
import axios from 'axios';

const WardenRegister = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        employeeId: '',
        phoneNo: '',
        password: '',
        hostel: '',
        role: 'warden',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/users/register', formData);
            window.location.href = '/warden/login'; // Redirect to login
        } catch (error) {
            console.error(error.response.data);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Warden Registration</h2>
            <input type="text" name="name" placeholder="Name" onChange={handleChange} required />
            <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
            <input type="text" name="employeeId" placeholder="Employee ID" onChange={handleChange} required />
            <input type="text" name="phoneNo" placeholder="Phone Number" onChange={handleChange} required />
            <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
            <input type="text" name="hostel" placeholder="Hostel" onChange={handleChange} required />
            <button type="submit">Register</button>
        </form>
    );
};

export default WardenRegister;
