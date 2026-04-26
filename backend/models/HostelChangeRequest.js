const mongoose = require("mongoose");

const HostelChangeRequestSchema = new mongoose.Schema({
  studentId: String,
  studentName: String,
  currentHostel: String,
  currentRoom: String,
  requestedHostel: String,
  requestedRoom: String,
  wardenId: String,
  wardenName: String,
  status: {
    type: String,
    enum: ["PENDING", "APPROVED", "REJECTED"],
    default: "PENDING"
  },
  adminComment: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.HostelChangeRequest || mongoose.model("HostelChangeRequest", HostelChangeRequestSchema);
