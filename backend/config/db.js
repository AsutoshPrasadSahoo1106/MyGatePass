// backend/db.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config(); // Load environment variables from .env file

const connectDB = () => {
    mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB Connected');
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error);
        process.exit(1); // Exit the process with failure
    });
};
console.log('MongoDB URI:', process.env.MONGO_URI); // Check if the value is loaded


module.exports = connectDB;
