const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({

name:String,
email:String,
password:String,
role:String,

studentId:String,
studentPhone:String,

room:Number,

hostelName:String,

parentName:String,
parentPhone:String,

wardenId:String,

wardId:String,
wardName:String

});

module.exports =
mongoose.models.User || mongoose.model("User",UserSchema);