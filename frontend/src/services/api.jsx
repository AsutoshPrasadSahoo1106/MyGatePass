import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const loginUser = async (userType, email, password) => {
    return await axios.post(`${API_URL}/users/login`, { email, password });
};

export const registerUser = async (userType, data) => {
    return await axios.post(`${API_URL}/users/register`, data);
};

// Add more API functions as needed
