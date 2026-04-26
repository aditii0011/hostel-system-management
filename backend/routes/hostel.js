const router = require("express").Router();
const Hostel = require("../models/Hostel");


// create hostel
router.post("/create", async (req,res)=>{

try{

const hostel = new Hostel({

hostelName:req.body.hostelName,
totalRooms:req.body.totalRooms,
bedsPerRoom:req.body.bedsPerRoom

});

await hostel.save();

res.send({message:"Hostel Created"});

}catch(err){

res.status(500).send(err.message);

}

});


// get all hostels
router.get("/", async (req,res)=>{

try{

const hostels = await Hostel.find();

res.send(hostels);

}catch(err){

res.status(500).send(err.message);

}

});

module.exports = router;