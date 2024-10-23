const mongoose = require("mongoose");

// Define the schema for the user registration form
const userSchema = new mongoose.Schema({
    // Common Fields
    name: {
        type: String,
        required: true, // Common name field for all user types
    },
    email: {
        type: String,
        required: true,
        unique: true, // Email should be unique
        match: /.+\@.+\..+/ // Basic email validation regex
    },
    phoneNo: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6, // Minimum length for password
    },
    role: {
        type: String,
        enum: ['student', 'warden', 'guard'], // Role can be student, warden, or guard
        required: true,
    },
    
    // Student-specific Fields
    firstName: {
        type: String,
            },
    lastName: {
        type: String   },
    uid: {
        type: String,
        unique: function() { return this.role === 'student'; }, // UID should be unique for students
        required: function() { return this.role === 'student'; },
    },
    fatherName: {
        type: String,
        required: function() { return this.role === 'student'; }, // Father's name required for students
    },
    motherName: {
        type: String,
        required: function() { return this.role === 'student'; }, // Mother's name required for students
    },
    fphoneNo: {
        type: String,
        required: function() { return this.role === 'student'; }, // Father's phone number required for students
    },
    mphoneNo: {
        type: String,
        required: function() { return this.role === 'student'; }, // Mother's phone number required for students
    },
    hostel: {
        type: String,
        required: true, // Hostel is required for all user types
    },
    roomNo: {
        type: String,
        required: function() { return this.role === 'student'; }, // Room number required for students
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'], // Enum for gender options
        required: function() { return this.role === 'student'; },
    },
    
    // Combined Employee ID Field
    employeeId: {
        type: String,
         // Employee ID should be unique for both wardens and guards
        required: function() { return this.role === 'warden' || this.role === 'guard'; },
    },
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
});

// Create the model from the schema
const User = mongoose.model("User", userSchema); // Use singular 'User'

// Export the model
module.exports = User;
