// controllers/userController.js
const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const generateToken = require('../utils/generateToken'); // Adjust the path as necessary

// Register a new user
// controllers/userController.js
exports.registerUser = async (req, res) => {
    const { name, email, phoneNo, password, role, uid, fatherName, motherName, fphoneNo, mphoneNo, hostel, roomNo, gender } = req.body;

    // Validate required fields
    if (!name || !email || !phoneNo || !password || !role) {
        return res.status(400).json({ message: "Please fill in all required fields." });
    }

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already in use." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user object without employeeId for students
        const newUser = new User({
            name,
            email,
            phoneNo,
            password: hashedPassword,
            role,
            uid,
            fatherName,
            motherName,
            fphoneNo,
            mphoneNo,
            hostel,
            roomNo,
            gender,
            // Only include employeeId if the role is warden or guard
            ...(role === 'warden' || role === 'guard' ? { employeeId: req.body.employeeId } : {})
        });

        await newUser.save();
        res.status(201).json({ message: "User registered successfully.", user: newUser });
    } catch (error) {
        console.error("Registration error:", error); // Log the error
        res.status(500).json({ message: "Error registering user.", error: error.message });
    }
};


// User login
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials." });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials." });
        }

        // Generate JWT token
        const token = generateToken(user._id); // Assuming you have a function to generate token

        // Return success response with token and user information
        res.status(200).json({
            message: "Login successful.",
            token,
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                role: user.role, // Include user role
            },
        });
    } catch (error) {
        console.error("Login error:", error); // Log the error for debugging
        res.status(500).json({ message: "Error logging in.", error: error.message });
    }
};


// Get user details
exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password'); // Exclude password from response
        if (!user) return res.status(404).json({ message: "User not found." });
        
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving user.", error });
    }
};
