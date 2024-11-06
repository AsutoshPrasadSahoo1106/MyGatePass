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
        const gatePasses = await GatePass.find({
            user: req.user.id,
            status: { $ne: 'Rejected' }, // Exclude gate passes with status 'Rejected'
            $or: [
                { status: 'Pending' }, // Include pending gate passes
                { actualOutTime: { $exists: false } }, // Include gate passes without actualOutTime
                { actualInTime: { $exists: false } }   // Include gate passes without actualInTime
            ]
        })
        .populate('user', 'name email') // Populate user details if needed
        .sort({ createdAt: -1 }); // Sort by creation date in descending order

        res.status(200).json(gatePasses); // Respond with the found gate passes
    } catch (error) {
        console.error("Error retrieving gate passes:", error); // Log the error for debugging
        res.status(500).json({ message: "Error retrieving gate passes." }); // Handle error response
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
            .populate('user', 'name email roomNo hostel phoneNo uid') // Populate user details
            .sort({ createdAt: -1 });

        res.status(200).json(pendingGatePasses);
    } catch (error) {
        console.error("Error retrieving pending gate passes:", error); // Log the error
        res.status(500).json({ message: "Error retrieving pending gate passes." });
    }
};

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
            .populate('user', 'name email roomNo hostel phoneNo uid') // Populate user details
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
        let gatePasses;

        // Determine user role
        const userRole = req.user.role; // Assuming the role is stored in the user object

        // Fetch gate passes based on user role
        if (userRole === 'warden') {
            gatePasses = await GatePass.find({ 
                approvedBy: req.user.id, // Check by approvedBy for warden
                status: { $in: ['Approved', 'Rejected'] } // Only include approved or rejected statuses
            })
            .select('destination reason status actualInTime actualOutTime date') // Select specific fields to return
            .populate('user', 'name email uid roomNo') // Populate user details if needed
            .sort({ createdAt: -1 });
        } else if (userRole === 'guard') {
            gatePasses = await GatePass.find({ 
                $or: [
                    { 
                        sentOutBy: req.user.id, // Check by sentOutBy for guard
                        actualInTime: { $exists: true, $ne: null },
                        actualOutTime: { $exists: true, $ne: null }
                    },
                    { 
                        giveEntryBy: req.user.id, // Alternatively check giveEntryBy
                        actualInTime: { $exists: true, $ne: null },
                        actualOutTime: { $exists: true, $ne: null }
                    }
                    
                ]
            })
            .select('destination reason status actualInTime actualOutTime date') // Select specific fields to return
            .populate('user', 'name email uid')
            .sort({ createdAt: -1 });
        } else {
            // Default behavior for students
            gatePasses = await GatePass.find({ 
                user: req.user.id,
                $or: [
                    { 
                        actualInTime: { $exists: true, $ne: null },
                        actualOutTime: { $exists: true, $ne: null }
                    },
                    { 
                        status: 'Rejected' // Include rejected statuses
                    }
                ]
            })
            .select('destination reason status actualInTime actualOutTime date')
            .populate('user', 'name email uid')
            .sort({ createdAt: -1 });
        }

        res.status(200).json(gatePasses);
    } catch (error) {
        console.error("Error retrieving gate pass history:", error); // Log the error
        res.status(500).json({ message: "Error retrieving gate pass history.", error });
    }
};



