const GatePass = require('../models/gatePassModel'); // Adjust the path as necessary
const User = require('../models/userModel'); // Make sure to import User model
const Notification = require('../models/notificationModel'); // Adjust the path as necessary
const { createNotification } = require('./notificationController'); // Adjust the path as necessary


// Create a new gate pass
exports.createGatePass = async (req, res) => {
    const { destination, reason, date, outTime, returnTime, passType } = req.body;

    try {
        const newGatePass = new GatePass({
            user: req.user.id, // Link the gate pass to the logged-in user
            destination,
            reason,
            date,
            outTime,
            returnTime,
            passType,
        });

        await newGatePass.save();
        res.status(201).json({ message: "Gate pass created successfully.", gatePass: newGatePass });
    } catch (error) {
        console.error("Error creating gate pass:", error); // Log the error
        res.status(500).json({ message: "Error creating gate pass." });
    }
};

// Get all gate passes for a specific user
exports.getUserGatePasses = async (req, res) => {
    try {
        const gatePasses = await GatePass.find({ user: req.user.id })
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
        res.status(200).json(gatePasses);
    } catch (error) {
        console.error("Error retrieving gate passes:", error); // Log the error
        res.status(500).json({ message: "Error retrieving gate passes." });
    }
};

// Get all pending gate passes for the warden based on hostel
exports.getPendingGatePassesForWarden = async (req, res) => {
    const { hostel } = req.user; // Assuming the user's hostel is stored in the user object

    try {
        const pendingGatePasses = await GatePass.find({
            status: 'Pending',
            user: { $in: await User.find({ hostel }).select('_id') } // Get all students in the hostel
        })
            .populate('user', 'name email roomNo hostel phoneNo') // Populate user details
            .sort({ createdAt: -1 });

        res.status(200).json(pendingGatePasses);
    } catch (error) {
        console.error("Error retrieving pending gate passes:", error); // Log the error
        res.status(500).json({ message: "Error retrieving pending gate passes." });
    }
};

// Get all approved gate passes for the guard
// Get all approved gate passes for the guard
exports.getApprovedGatePassesForGuard = async (req, res) => {
    try {
        const approvedGatePasses = await GatePass.find({
            status: 'Approved',
            $or: [
                { sentOutBy: { $exists: false } }, // Exclude if sentOutBy field is present
                { giveEntryBy: { $exists: false } } // Exclude if giveEntryBy field is present
            ]
        })
            .populate('user', 'name email roomNo hostel phoneNo') // Populate user details
            .sort({ createdAt: -1 });

        res.status(200).json(approvedGatePasses);
    } catch (error) {
        console.error("Error retrieving approved gate passes:", error);
        res.status(500).json({ message: "Error retrieving approved gate passes.", error: error.message });
    }
};



// Approve or reject a gate pass
exports.updateGatePassStatus = async (req, res) => {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    try {
        const gatePass = await GatePass.findById(id);
        if (!gatePass) return res.status(404).json({ message: "Gate pass not found." });

        const previousStatus = gatePass.status; // Store previous status
        gatePass.status = status; // Update status
        if (status === 'Rejected') {
            gatePass.rejectionReason = rejectionReason; // Set rejection reason if applicable
        }
        gatePass.approvedBy = req.user.id; // Link to the user who approved/rejected

        await gatePass.save();

        // Create a notification message
        let notificationMessage;
        if (status === 'Approved') {
            notificationMessage = `Your gate pass has been approved.`;
        } else if (status === 'Rejected') {
            notificationMessage = `Your gate pass has been rejected. Reason: ${rejectionReason}`;
        }

        // Create a new notification
        const newNotification = new Notification({
            user: gatePass.user, // Assuming gatePass.user is the user ID of the student
            message: notificationMessage,
        });

        await newNotification.save(); // Save the notification

        res.status(200).json(gatePass);
    } catch (error) {
        console.error("Error updating gate pass status:", error); // Log the error
        res.status(500).json({ message: "Error updating gate pass status." });
    }
};

exports.getGatePassHistory = async (req, res) => {
    try {
        // Fetch all approved gate passes for the user
        const gatePasses = await GatePass.find({ 
            user: req.user.id, 
            status: 'Approved' // Filter by approved status
        })
        .select('destination reason status actualInTime actualOutTime createdAt') // Select specific fields to return
        .populate('user', 'name email') // Populate user details if needed
        .sort({ createdAt: -1 }); // Sort by created date in descending order

        res.status(200).json(gatePasses);
    } catch (error) {
        console.error("Error retrieving gate pass history:", error); // Log the error
        res.status(500).json({ message: "Error retrieving gate pass history.", error });
    }
};
