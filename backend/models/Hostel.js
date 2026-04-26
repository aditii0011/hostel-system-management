const mongoose = require("mongoose");

const HostelSchema = new mongoose.Schema({

hostelName:{
type:String,
unique:true
},

totalRooms:Number,
bedsPerRoom:Number

});

module.exports =
mongoose.models.Hostel || mongoose.model("Hostel",HostelSchema);