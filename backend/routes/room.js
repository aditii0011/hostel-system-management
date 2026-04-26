const router = require("express").Router();
const User = require("../models/user");


// students in particular room
router.get("/:hostel/:room", async(req,res)=>{

const data = await User.find({

role:"student",
hostelName:req.params.hostel,
room:req.params.room

});

res.send(data);

});

module.exports = router;