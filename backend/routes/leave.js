const router = require("express").Router();
const Leave = require("../models/Leave");


// parent request leave
router.post("/request", async(req,res)=>{

    const leave = new Leave(req.body);
    await leave.save();

    res.send("Leave requested");

});


// student leave history
router.get("/student/:id", async(req,res)=>{

    const data = await Leave.find({
        studentId:req.params.id
    });

    res.send(data);

});


// parent view leaves by student (ward)
router.get("/parent/:id", async(req,res)=>{

    const data = await Leave.find({
        studentId: req.params.id
    });

    res.send(data);
});


// warden view all leaves
router.get("/", async(req,res)=>{
    const query = {};

    if(req.query.hostel){
        query.hostelName = req.query.hostel;
    }

    const data = await Leave.find(query);
    res.send(data);

});


// warden approve reject
router.post("/update/:id", async(req,res)=>{

    await Leave.findByIdAndUpdate(
        req.params.id,
        {status:req.body.status}
    );

    res.send("Updated");

});

module.exports = router;