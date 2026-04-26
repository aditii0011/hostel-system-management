const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema({

    studentId: String,
    studentName: String,
    room: Number,
    hostelName: String,

    date: String,
    status: String

});

module.exports =
mongoose.models.Attendance || mongoose.model("Attendance", AttendanceSchema);