// Import necessary models and libraries
const OTP = require('../models/otpModel'); // Adjust the path as necessary
const User = require('../models/userModel'); // Import User model for user reference
const GatePass = require('../models/gatePassModel'); // Import GatePass model
const Notification = require('../models/notificationModel'); // Import Notification model

// Function to generate a 6-digit numeric OTP
const generateNumericOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit number
};

// Generate and send OTP
exports.generateOTP = async (req, res) => {
    const { gatePassId } = req.body; // Get gatePassId from the request body

    try {
        // Retrieve the GatePass using gatePassId
        const gatePass = await GatePass.findById(gatePassId).populate('user');
        if (!gatePass) {
            return res.status(404).json({ message: "Gate pass not found." });
        }

        const user = gatePass.user; // Get the user associated with the gate pass
        if (!user) {
            return res.status(404).json({ message: "User associated with the gate pass not found." });
        }

        const otp = generateNumericOTP();
        const expiresAt = new Date(Date.now() + 5 * 60000); // OTP valid for 5 minutes

        const otpEntry = new OTP({
            user: user._id, // Use the user from GatePass
            otp,
            expiresAt,
            gatePassId // Include gatePassId in the OTP entry
        });

        await otpEntry.save();

        // Create a notification for the generated OTP
        const notificationMessage = `Your OTP for gate pass is ${otp}. It is valid for 5 minutes.`;
        const newNotification = new Notification({
            user: user._id, // Link notification to the GatePass user
            message: notificationMessage,
        });

        await newNotification.save(); // Save the notification

        // Here you would send the OTP via SMS/email (using a service like Twilio)
        // For example: await sendOtpToUser(user.id, otp);

        res.status(201).json({ message: "OTP generated and notification sent." });
    } catch (error) {
        console.error("Error generating OTP:", error); // Log the error
        res.status(500).json({ message: "Error generating OTP." });
    }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
    const { otp, gatePassId, action } = req.body; // Get OTP, gatePassId, and action from the request body

    try {
        // Retrieve the GatePass using gatePassId
        const gatePass = await GatePass.findById(gatePassId).populate('user');
        if (!gatePass) {
            return res.status(404).json({ message: "Gate pass not found." });
        }

        const user = gatePass.user; // Get the user associated with the gate pass
        if (!user) {
            return res.status(404).json({ message: "User associated with the gate pass not found." });
        }

        // Verify OTP with gatePassId and user ID
        const otpEntry = await OTP.findOne({ otp, gatePassId, user: user._id });
        if (!otpEntry) {
            return res.status(400).json({ message: "Invalid or expired OTP." });
        }

        if (otpEntry.expiresAt < Date.now()) {
            return res.status(400).json({ message: "OTP has expired." });
        }

        // Proceed with the action that required OTP verification
        await OTP.deleteOne({ _id: otpEntry._id }); // Remove the used OTP entry

        // Call updateGatePassStatus to update the gate pass based on the action
        const updateResponse = await updateGatePassStatus(gatePassId, action, req.user.id);
        if (updateResponse.error) {
            return res.status(500).json({ message: updateResponse.message });
        }

        res.status(200).json({ message: "OTP verified successfully and gate pass updated." });
    } catch (error) {
        console.error("Error verifying OTP:", error); // Log the error
        res.status(500).json({ message: "Error verifying OTP." });
    }
};

// Function to update gate pass status
const updateGatePassStatus = async (gatePassId, action, userId) => {
    try {
        const gatePass = await GatePass.findById(gatePassId);
        if (!gatePass) return { error: true, message: "Gate pass not found." };

        if (action === 'out') {
            gatePass.sentOutBy = userId; // Update sentOutBy to the guard's ID
            gatePass.actualOutTime = new Date(); // Store the current time as actualOutTime
        } else if (action === 'in') {
            gatePass.giveEntryBy = userId; // Update giveEntryBy to the guard's ID
            gatePass.actualInTime = new Date(); // Store the current time as actualInTime
        } else {
            return { error: true, message: "Invalid action specified." };
        }

        await gatePass.save();
        return { error: false }; // Indicate success
    } catch (error) {
        console.error("Error updating gate pass status:", error); // Log the error
        return { error: true, message: "Error updating gate pass status." };
    }
};
