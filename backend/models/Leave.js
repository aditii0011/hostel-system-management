const mongoose = require("mongoose");

const LeaveSchema = new mongoose.Schema({

    studentId: String,
    studentName: String,
    parentName: String,
    room: Number,
    hostelName: String,

    fromDate: String,
    toDate: String,
    reason: String,

    status:{
        type:String,
        default:"PENDING"
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

});

module.exports =
mongoose.models.Leave || mongoose.model("Leave", LeaveSchema);