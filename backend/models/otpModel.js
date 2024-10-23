const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    otp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    gatePassId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GatePass",
      required: true,
    }, // Add this line
  },
  {
    timestamps: true,
  }
);

const OTP = mongoose.model("OTP", otpSchema);
module.exports = OTP;
