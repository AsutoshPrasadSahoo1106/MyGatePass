const mongoose = require("mongoose");

// Define the schema for the gate pass
const gatePassSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the student
    destination: { type: String, required: true },
    reason: { type: String, required: true },
    date: { type: Date, required: true },
    outTime: { type: Date, required: true },
    returnTime: { type: Date, required: true },
    passType: { type: String, enum: ['Day Out', 'Night Out'], required: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to the user who approved the pass
    rejectionReason: { type: String },
    sentOutBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to the guard who sent the student out
}, {
    timestamps: true,
});

const GatePass = mongoose.model("GatePass", gatePassSchema);
module.exports = GatePass;
