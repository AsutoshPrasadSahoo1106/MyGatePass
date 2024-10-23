const OTP = require('../models/otpModel'); // Adjust the path as necessary
const User = require('../models/userModel'); // Import User model for user reference
const otpGenerator = require('otp-generator'); // OTP generator library

// Generate and send OTP
exports.generateOTP = async (req, res) => {
    const { gatePassId } = req.body; // Get gatePassId from the request body

    try {
        const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false });
        const expiresAt = new Date(Date.now() + 5 * 60000); // OTP valid for 5 minutes

        const otpEntry = new OTP({
            user: req.user.id, // Assuming the user ID comes from the authenticated user
            otp,
            expiresAt,
            gatePassId // Include gatePassId in the OTP entry
        });

        await otpEntry.save();
        // Here you would send the OTP via SMS/email (using a service like Twilio)
        res.status(201).json({ message: "OTP generated and sent.", otp });
    } catch (error) {
        res.status(500).json({ message: "Error generating OTP.", error });
    }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
    const { otp, gatePassId } = req.body; // Get OTP and gatePassId from the request body

    try {
        const otpEntry = await OTP.findOne({ otp, gatePassId, user: req.user.id }); // Verify OTP with gatePassId and user ID
        if (!otpEntry) return res.status(400).json({ message: "Invalid or expired OTP." });

        if (otpEntry.expiresAt < Date.now()) {
            return res.status(400).json({ message: "OTP has expired." });
        }

        // Proceed with the action that required OTP verification
        await OTP.deleteOne({ _id: otpEntry._id }); // Remove the used OTP entry
        res.status(200).json({ message: "OTP verified successfully." });
    } catch (error) {
        res.status(500).json({ message: "Error verifying OTP.", error });
    }
};
