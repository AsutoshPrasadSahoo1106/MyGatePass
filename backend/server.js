const express = require('express');
const cors = require('cors'); // Import CORS
const connectDB = require('./config/db'); // MongoDB connection
const userRoutes = require('./routes/userRoutes');
const gatePassRoutes = require('./routes/gatePassRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const otpRoutes = require('./routes/otpRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// Use CORS middleware
app.use(cors()); 

app.use(express.json()); 

// Use Routes
app.use('/api/users', userRoutes);
app.use('/api/gatepasses', gatePassRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/otp', otpRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
